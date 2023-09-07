<script lang="ts">
  import { myAccount, connectWallet, getPKH } from '$lib/tezos';
</script>

<header class="header">
  <nav>
    <ul>
      <li><a href="/">Index</a></li>
    </ul>
    <ul>
      <li>
        <button on:click={connectWallet}>
          {#if $myAccount == undefined}
            Connect wallet
          {:else}{#await getPKH() then pkh}{pkh}{/await}
          {/if}
        </button>
      </li>
    </ul>
  </nav>
</header>

