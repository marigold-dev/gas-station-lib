<script lang="ts">
  import { myAccount, connectWallet } from '$lib/tezos';
</script>

<header class="header">
  <nav>
    <ul>
      <!-- TODO: icon? name? -->
      <li><a href="/">Index</a></li>
    </ul>
    <ul>
      <li>
      <button on:click={connectWallet}>
        Connect wallet
      </button>
      </li>
    </ul>
  </nav>
</header>

