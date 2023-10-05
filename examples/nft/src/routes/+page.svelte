<script lang="ts">
  import { myAccount, getPKH, Tezos } from "$lib/tezos";
  import MintingComponent from "$lib/MintingComponent.svelte";
  import StakingComponent from "$lib/StakingComponent.svelte";
  import { PUBLIC_PERMIT, PUBLIC_STAKING_CONTRACT } from '$env/static/public';
</script>

<h1>Permit demo</h1>
<div>
  {#if $myAccount == undefined}
    You're not connected.
  {:else}{#await getPKH() then pkh}
    <section>
      <h2>NFTs in your wallet</h2>
      <MintingComponent user_address={pkh} />
    </section>
    <section>
      <h2>Staked NFTs</h2>
      <StakingComponent user_address={pkh} />
    </section>
  {/await}
  {/if}
</div>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-top: 20px;
  }

  button {
    background-color: #0074cc;
    color: #fff;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }

  h2 {
    font-size: 24px;
    margin-bottom: 10px;
  }

  section {
    margin: 20px;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    text-align: left; /* Align the text to the left within the section */
  }

  p {
    font-size: 16px;
  }
</style>
