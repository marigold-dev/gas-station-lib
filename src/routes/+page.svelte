<script lang="ts">
  import { myAccount, getPKH, Tezos } from "$lib/tezos";
  import { PUBLIC_PERMIT } from '$env/static/public';
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<p>Adresse du contrat = { PUBLIC_PERMIT }</p>

<div>
  {#if $myAccount == undefined}Connectez-vous pour plus d'information
  {:else}Vous êtes connecté avec {#await getPKH() then pkh}{pkh}{/await}
  {/if}
</div>
