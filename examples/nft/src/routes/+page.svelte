<script lang="ts">
  import { myAccount, getPKH, Tezos } from "$lib/tezos";
  import MintingComponent from "$lib/MintingComponent.svelte";
  import StakingComponent from "$lib/StakingComponent.svelte";
  import { PUBLIC_PERMIT, PUBLIC_STAKING_CONTRACT } from "$env/static/public";

  // Shared between the two components
  let available_token_ids;
</script>

<main>
  <h1>Gas Station Demo</h1>

  <p>
    This user-friendly dApp is tailored for individuals without any ꜩ in their
    wallets. Operations are seamlessly relayed through the Gas Station.
  </p>

  <p>
    <empt>Minting</empt> a new NFT is achieved with a single call to the smart
    contract. However, <empt>stashing</empt> an NFT to another smart contract requires
    a transfer, which must be authorized off-chain through the signature of a permit.
  </p>

  <div>
    {#if $myAccount === undefined}
      <p>Please connect to use the dApp.</p>
    {:else}{#await getPKH() then pkh}
        <section>
          <h2>NFTs in your wallet</h2>
          <p>{PUBLIC_PERMIT}</p>
          <MintingComponent user_address={pkh} bind:available_token_ids />
        </section>
        <section>
          <h2>Stashed NFTs</h2>
          <p>{PUBLIC_STAKING_CONTRACT}</p>
          <StakingComponent user_address={pkh} bind:available_token_ids />
        </section>
      {/await}
    {/if}
  </div>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
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
    font-size: 18px;
  }
</style>
