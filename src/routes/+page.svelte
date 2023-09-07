<script lang="ts">
  import { myAccount, getPKH, Tezos } from "$lib/tezos";
  import MintingComponent from "$lib/MintingComponent.svelte";
  import StakingComponent from "$lib/StakingComponent.svelte";
  import { PUBLIC_PERMIT, PUBLIC_STAKING_CONTRACT } from '$env/static/public';
</script>

<h1>Permit demo</h1>
<p>Permit contract address: { PUBLIC_PERMIT }</p>
<p>Staking contract address: { PUBLIC_STAKING_CONTRACT }</p>

<div>
  {#if $myAccount == undefined}
    You're not connected.
  {:else}{#await getPKH() then pkh}
    <MintingComponent user_address={"tz1hsvrbDUf8QfzDhjERvZJtDHKyrgqHTugn"} />
    <StakingComponent user_address={"tz1hsvrbDUf8QfzDhjERvZJtDHKyrgqHTugn"} />
  {/await}
  {/if}
</div>
