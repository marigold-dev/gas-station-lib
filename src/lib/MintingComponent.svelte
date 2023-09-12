<script lang="ts">
  import { Tezos, subTezos } from "$lib/tezos";
  import { PUBLIC_PERMIT, PUBLIC_TZKT_API } from '$env/static/public';

  export let user_address;

  const token_id = 0;
  let user_tokens = [];

  function IPFSLinkToHTTPS(url: string) {
    return url.replace("ipfs://", "https://ipfs.io/ipfs/");
  }

  function get_tokens(user_address) {
    return fetch(`${PUBLIC_TZKT_API}/v1/tokens/balances?account=${user_address}&token.contract=${PUBLIC_PERMIT}&balance.gt=0`)
      .then((response) => {
        return response.json();
      })
      .then((fa2_tokens) => {
        user_tokens = fa2_tokens;
      });
    };

  function mint(user_address) {
      (async () => {
          const contract = await Tezos.wallet.at(PUBLIC_PERMIT);
          const mint_op = await contract.methodsObject.mint_token([{
              owner: user_address,
              token_id: token_id,
              amount_: 1
          }]).toTransferParams()
          console.log(mint_op);
          const post_content = {
              sender: user_address,
              operations: [
                {
                  destination: mint_op.to,
                  parameters: mint_op.parameter
                }
              ]
          }
          const response = await fetch("http://localhost:8000/operation", {
              method: "POST",
              mode: "cors",
              cache: "no-cache",
              credentials: "same-origin",
              headers: {
                  "Content-Type": "application/json"
              },
              body: JSON.stringify(post_content)
          });
          console.log(await response.json());
          // √ construct mint operation from Taquito
          // √ jsonize
          // √ const reponse = await fetch("http://127.0.0.1/operation")
          // √ display balance
          // next: randomize (on the server side) the NFT we get
          //       display an error message if we didn't wait for long enough
      })();
  }

  subTezos((event) => {
    get_tokens(user_address)
  });
</script>

<div style="display: flex">
  <div>
    <button on:click={mint(user_address)}>
      mint
    </button>
  </div>

  <div>
    {#if user_tokens.length == 0}
      <p>You don't have any tokens. Try minting one!</p>
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


