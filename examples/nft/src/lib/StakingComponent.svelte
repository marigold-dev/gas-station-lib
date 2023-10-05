<script lang="ts">
  import { Tezos, wallet, subTezos } from "$lib/tezos";
  import { GasStation, PermitContract } from "@marigold-dev/gas-station-lib";
  import { RpcClient } from "@taquito/rpc";
  import { InMemorySigner } from "@taquito/signer";
  import { ParameterSchema } from "@taquito/michelson-encoder";
  import { PUBLIC_PERMIT, PUBLIC_TEZOS_RPC, PUBLIC_STAKING_CONTRACT, PUBLIC_TZKT_API,
  PUBLIC_GAS_STATION_API } from '$env/static/public';

  export let user_address;

  const token_id = 0;

  let user_tokens = [];

  function IPFSLinkToHTTPS(url: string) {
    return url.replace("ipfs://", "https://ipfs.io/ipfs/");
  }

  function get_tokens(address) {
    return fetch(`${PUBLIC_TZKT_API}/v1/tokens/balances?account=${address}&token.contract=${PUBLIC_PERMIT}&balance.gt=0`)
      .then((response) => {
        return response.json();
      })
      .then((fa2_tokens) => {
        user_tokens = fa2_tokens;
      });
  };

  function stake(user_address) {
    // √ Build the transfer
    // √ Build the permit
    // √ Ask to sign the permit
    // √ Send the permit to the API
    // √ Build the transfer operation
    // √ Send it to the API
    (async () => {
      const gas_api = new GasStation({
        apiURL: PUBLIC_GAS_STATION_API
      });
      const permit_contract = new PermitContract(PUBLIC_PERMIT, Tezos);

      const permit_data = await permit_contract.generatePermit({
        from_: user_address,
        txs: [{
          to_: PUBLIC_STAKING_CONTRACT,
          token_id: token_id,
          amount: 1
        }]
      });

      const signature = (await (await wallet.client).requestSignPayload({
          signingType: 'micheline',
          payload: permit_data.bytes
      })).signature;
      const { publicKey } = await wallet.client.getActiveAccount();

      const permit_op = await permit_contract.permitCall({
          publicKey: publicKey,
          signature: signature,
          transferHash: permit_data.transfer_hash
      });
      console.log(permit_op);
      console.log("ok");
      const staking_contract = await Tezos.wallet.at(PUBLIC_STAKING_CONTRACT);
      const staking_op = await staking_contract.methods.stake(
        1,
        user_address
      ).toTransferParams();

      const response = await gas_api.postOperations(user_address,
          [
            {
              destination: permit_op.to,
              parameters: permit_op.parameter
            },
            {
              destination: staking_op.to,
              parameters: staking_op.parameter
            }
          ]);

      console.log(response);
    })();
  }

  subTezos((event) => {
    get_tokens(PUBLIC_STAKING_CONTRACT)
  });
</script>

<div style="display: flex">
  <div>
    <button on:click={stake(user_address)}>
      stake
    </button>
  </div>

  <div>
    {#if user_tokens.length == 0}
      <p>You don't have any tokens staked.</p>
    {:else}
      {#each user_tokens as token, i}
        <div>
          <img src="{IPFSLinkToHTTPS(token.token.metadata.thumbnailUri)}" />
          <div style="text-align: center; font-size:14px">{token.balance}</div>
        </div>
      {/each}
    {/if}
  </div>
</div>


