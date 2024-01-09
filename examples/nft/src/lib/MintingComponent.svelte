<script lang="ts">
  import { Tezos, subTezos } from "$lib/tezos";
  import { GasStation, GAS_STATION_PUBLIC_API_GHOSTNET } from "@marigold-dev/gas-station-lib";
  import { PUBLIC_GAS_STATION_API, PUBLIC_PERMIT, PUBLIC_TZKT_API } from '$env/static/public';

  export let user_address = '';
  export let available_token_ids = new Set<string>(); // to be shared with StakingComponent

  let user_tokens: any[] = [];

  function randomInt(max) {
    return Math.floor(Math.random() * max);
  }

  function IPFSLinkToHTTPS(url: string) {
    return url.replace("ipfs://", "https://ipfs.io/ipfs/");
  }

  function get_tokens(user_address: string) {
    return fetch(`${PUBLIC_TZKT_API}/v1/tokens/balances?account=${user_address}&token.contract=${PUBLIC_PERMIT}&balance.gt=0`)
      .then((response) => {
        return response.json();
      })
      .then((fa2_tokens) => {
        user_tokens = fa2_tokens;
      });
    };

  function mint(user_address: string) {
    const token_id = randomInt(6);
      (async () => {
          const gas_api = new GasStation({
            apiURL: PUBLIC_GAS_STATION_API
          });
          const contract = await Tezos.wallet.at(PUBLIC_PERMIT);
          const mint_op = await contract.methodsObject.mint_token([{
              owner: user_address,
              token_id: token_id,
              amount_: 1
          }]).toTransferParams()
          console.log(mint_op);
          const response = await gas_api.postOperation(user_address, {
            destination: mint_op.to,
            parameters: mint_op.parameter
          });
          console.log(response);
          // √ construct mint operation from Taquito
          // √ jsonize
          // √ const reponse = await fetch("http://127.0.0.1/operation")
          // √ display balance
          // next: randomize (on the server side) the NFT we get
          //       display an error message if we didn't wait for long enough
      })();
  }

  subTezos(() => {
    get_tokens(user_address)
  });

  // Maintain the set of available token IDs to pick one in the stash operation
  $: available_token_ids = new Set(user_tokens.map(token => token.token.tokenId));
</script>

<div style="display: flex">
  <div>
    <button on:click={() => mint(user_address)}>
      mint
    </button>
  </div>

  <div>
    {#if user_tokens.length == 0}
      <p>You don't have any tokens. Try minting one!</p>
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


