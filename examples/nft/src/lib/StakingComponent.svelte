<script lang="ts">
  import { Tezos, wallet, subTezos } from "$lib/tezos";
  import { GasStation, PermitContract, GAS_STATION_PUBLIC_API_GHOSTNET } from "@marigold-dev/gas-station-lib";
  import { PUBLIC_GAS_STATION_API, PUBLIC_PERMIT, PUBLIC_STAKING_CONTRACT, PUBLIC_TZKT_API } from '$env/static/public';
  import { SigningType } from "@airgap/beacon-types";

  export let user_address = '';
  export let available_token_ids = new Set<string>();

  let user_tokens: any[] = [];

  function IPFSLinkToHTTPS(url: string) {
    return url.replace("ipfs://", "https://ipfs.io/ipfs/");
  }

  function get_tokens(address: string) {
    return fetch(`${PUBLIC_TZKT_API}/v1/tokens/balances?account=${address}&token.contract=${PUBLIC_PERMIT}&balance.gt=0`)
      .then((response) => {
        return response.json();
      })
      .then((fa2_tokens) => {
        user_tokens = fa2_tokens;
      });
  };

  function stash(user_address: string) {
    const n = available_token_ids?.size;
    if (n === 0) {
      return;
    }
    const token_id = [...available_token_ids][Math.floor(Math.random() * n)];
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
          signingType: SigningType.MICHELINE,
          payload: permit_data.bytes
      })).signature;
      const activeAccount = await wallet.client.getActiveAccount();

      if (!activeAccount) {
        throw new Error('No active account, cannot stash.')
      }

      const permit_op = await permit_contract.permitCall({
          publicKey: activeAccount.publicKey,
          signature: signature,
          transferHash: permit_data.transfer_hash
      });
      console.log(permit_op);
      console.log("ok");
      const staking_contract = await Tezos.wallet.at(PUBLIC_STAKING_CONTRACT);
      const staking_op = await staking_contract.methods.stash(
        1,
        token_id,
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

  subTezos(() => {
    get_tokens(PUBLIC_STAKING_CONTRACT)
  });

  $: console.log(available_token_ids);
</script>
<div style="display: flex">
  <div>
    <button on:click={() => stash(user_address)}>
      stash
    </button>
  </div>

  <div>
    {#if user_tokens.length == 0}
      <p>You don't have any tokens stashed.</p>
    {:else}
      {#each user_tokens as token, i}
        <div>
          <img src="{IPFSLinkToHTTPS(token.token.metadata.thumbnailUri)}" alt="Token thumnail"/>
          <div style="text-align: center; font-size:14px">{token.balance}</div>
        </div>
      {/each}
    {/if}
  </div>
</div>


