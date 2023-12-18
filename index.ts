import { TezosToolkit } from "@taquito/taquito";
import { RpcClient } from "@taquito/rpc";
import { packDataBytes } from "@taquito/michel-codec";
import blake2b from "blake2b";
import { hex2buf } from "@taquito/utils";

export type Settings = {
  apiURL: string;
};

export type Operation = {
  destination: string;
  parameters: any;
};

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

export type PermitOperation = {
  publicKey: string;
  signature: string;
  transferHash: string;
};

export const GAS_STATION_PUBLIC_API_GHOSTNET =
  "https://ghostnet.gas-station-api.marigold.dev/operation";
export const GAS_STATION_PUBLIC_API_MAINNET =
  "https://gas-station-api.marigold.dev/operation";

export class GasStation {
  url: string;

  /**
   *
   * @param settings (optional) object
   *   - apiURL: the URL of Gas Station API. /!\ For this version, the URL must redirect to the endpoint /operation
   */
  constructor(settings?: Settings) {
    this.url = settings?.apiURL || GAS_STATION_PUBLIC_API_GHOSTNET;
  }

  async postOperations(sender: string, ops: Array<Operation>) {
    const post_content = {
      sender_address: sender,
      operations: ops,
    };

    const response = await fetch(this.url, {
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

  postOperation(sender: string, op: Operation) {
    return this.postOperations(sender, [op]);
  }
}

const g = new GasStation();

export class PermitContract {
  address: string;
  tezos: TezosToolkit;

  constructor(address: string, tezos: TezosToolkit) {
    this.address = address;
    this.tezos = tezos;
  }

  async getCounter() {
    const contract = await this.tezos.wallet.at(this.address);
    // @ts-ignore
    return (await contract.storage()).extension.counter.c[0];
  }

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
    console.info("Transfert hash : ", transfer_hash);
    return { bytes: permit_bytes, transfer_hash: transfer_hash };
  }

  async permitCall(op: PermitOperation) {
    const contract = await this.tezos.wallet.at(this.address);

    const call = await contract.methods
      .permit([[op.publicKey, op.signature, op.transferHash]])
      .toTransferParams();

    console.info("Transfert params", call);

    return call;
  }
}
