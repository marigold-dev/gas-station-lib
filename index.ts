import { TezosToolkit } from "@taquito/taquito";
import { RpcClient } from "@taquito/rpc";
import { packDataBytes } from "@taquito/michel-codec";
import blake2b from "blake2b";
import { hex2buf } from "@taquito/utils";

/**
 * index.ts: Interacting with the Tezos blockchain, allowing users to perform token
 * transfers and obtain permits for certain operations.
 */

/**
 * Settings: Describes the settings object expected by the GasStation class, with an apiURL property.
 */

export type Settings = {
  apiURL: string;
};

/**
 * Operation: Represents a generic blockchain operation with destination and parameters properties
 */

export type Operation = {
  destination: string;
  parameters: any;
};

/**
 * TransferOperation: Represents a specific type of operation for transferring tokens,
 * with from_ as the sender's address and an array of transactions (txs)
 */

export type TransferOperation = {
  from_: string;
  txs: [
    {
      to_: string;
      token_id: number;
      amount: number;
    }
  ];
};

/**
 * PermitOperation: Represents an operation for obtaining a permit,
 * including publicKey, signature, and transferHash properties
 */

export type PermitOperation = {
  publicKey: string;
  signature: string;
  transferHash: string;
};

export const GAS_STATION_PUBLIC_API_GHOSTNET =
  "https://ghostnet.gas-station-api.marigold.dev";

export const GAS_STATION_PUBLIC_API_MAINNET =
  "https://gas-station-api.marigold.dev";

/**
 * GasStation is responsible for interacting with a remote API to post blockchain operations.
 */

export class GasStation {
  url: string;

  /**
   *
   * @param settings (optional) object
   *   - apiURL: the URL of Gas Station API. /!\ For this version, the URL must redirect to the endpoint /operation
   *
   * Takes a Settings object and initializes the url property.
   */
  constructor(settings?: Settings) {
    this.url = settings?.apiURL || GAS_STATION_PUBLIC_API_GHOSTNET;
  }

  /**
   * postOperations: Sends a POST request to the specified API endpoint with the provided operations.
   */

  async postOperations(sender: string, ops: Array<Operation>) {
    const post_content = {
      sender_address: sender,
      operations: ops,
    };

    const response = await fetch(`${this.url}/operation`, {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(post_content),
    });

    return await response.json();
  }

  /**
   * postOperation: A convenience method to post a single operation using postOperations
   */

  postOperation(sender: string, op: Operation) {
    return this.postOperations(sender, [op]);
  }
}

/**
 * PermitContract: interacts with a Tezos smart contract, specifically for
 * generating permits related to token transfers.
 *
 * It uses the Tezos toolkit to interact with the Tezos blockchain,
 * fetch contract information, and perform operations.
 *
 * The code utilizes various Tezos-specific functions and conventions for
 * encoding data, hashing, and interacting with smart contracts
 */

export class PermitContract {
  address: string;
  tezos: TezosToolkit;

  constructor(address: string, tezos: TezosToolkit) {
    this.address = address;
    this.tezos = tezos;
  }

  /**
   * getCounter: Retrieves the counter value from the contract's storage
   */

  async getCounter() {
    const contract = await this.tezos.wallet.at(this.address);
    // @ts-ignore
    return (await contract.storage()).extension.counter.c[0];
  }

  /**
   * generatePermit: Generates a permit for a given transfer operation by computing a
   * transfer hash and constructing permit data.
   */

  async generatePermit(transfer: TransferOperation) {
    // @ts-ignore
    const rpcClient = new RpcClient(this.tezos._rpc, "main");
    const chain_id = await rpcClient.getChainId();

    const counter = await this.getCounter();
    const contract = await this.tezos.wallet.at(this.address);
    const transfer_type = contract.entrypoints.entrypoints.transfer.args?.[0];
    // @ts-ignore
    const transfer_data = contract.methodsObject
      .transfer([transfer])
      .toTransferParams().parameter.value[0];
    // @ts-ignore
    const byts = packDataBytes(transfer_data, transfer_type).bytes;
    const blak = blake2b(32);
    const transfer_hash = blak.update(hex2buf(byts)).digest("hex");
    const permit_data = [
      [{ string: chain_id }, { string: this.address }],
      [{ int: counter }, { bytes: transfer_hash }],
    ];
    // Same as in the Python demo, we cannot use the entrypoint to derive
    // this object
    const permit_type = {
      prim: "pair",
      args: [
        {
          prim: "pair",
          args: [{ prim: "chain_id" }, { prim: "address" }],
        },
        {
          prim: "pair",
          args: [{ prim: "int" }, { prim: "bytes" }],
        },
      ],
    };
    // @ts-ignore
    const permit_bytes = packDataBytes(permit_data, permit_type).bytes;

    console.info("Permit bytes :", permit_bytes);
    console.info("Transfer hash : ", transfer_hash);
    return { bytes: permit_bytes, transfer_hash: transfer_hash };
  }

  /**
   * permitCall: Calls the permit entrypoint on the contract with
   * the provided permit operation parameters.
   */

  async permitCall(op: PermitOperation) {
    const contract = await this.tezos.wallet.at(this.address);

    const call = await contract.methods
      .permit([[op.publicKey, op.signature, op.transferHash]])
      .toTransferParams();

    console.info("Transfer params", call);

    return call;
  }
}
