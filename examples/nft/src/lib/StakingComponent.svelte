<script lang="ts">
  import { Tezos, wallet, subTezos } from "$lib/tezos";
  import {
    GasStation,
    PermitContract,
    GAS_STATION_PUBLIC_API_GHOSTNET,
  } from "@marigold-dev/gas-station-lib";
  import {
    PUBLIC_GAS_STATION_API,
    PUBLIC_PERMIT,
    PUBLIC_STAKING_CONTRACT,
    PUBLIC_TZKT_API,
  } from "$env/static/public";
  import { SigningType } from "@airgap/beacon-types";

  /**
   * [user_address] stores the user's address
   */
  export let user_address = "";

  /**
   * [available_token_ids] a set of available token IDs
   *
   */
  export let available_token_ids = new Set<string>();

  let user_tokens: any[] = [];

  /**
   * Convert an IPFS to HTTPS
   * @param url
   */
  function IPFSLinkToHTTPS(url: string) {
    return url.replace("ipfs://", "https://ipfs.io/ipfs/");
  }

  /**
   * Fetch and store the user's token balances based on their address
   * @param address
   */
  function get_tokens(address: string) {
    return fetch(
      `${PUBLIC_TZKT_API}/v1/tokens/balances?account=${address}&token.contract=${PUBLIC_PERMIT}&balance.gt=0`,
    )
      .then((response) => {
        return response.json();
      })
      .then((fa2_tokens) => {
        user_tokens = fa2_tokens;
      });
  }

  // Add progress bar for stashing
  let isStashing = false;
  let stashProgress = 0;

  /**
   * [stash] function responsible for performing the "stash" operation,
   * which involves creating a permit for transferring a token to a staking
   * contract and sending it to the API.
   * @param user_address
   */
  function stash(user_address: string) {
    const n = available_token_ids?.size;
    if (n === 0) {
      return;
    }

    // Randomly selects a token ID from available tokens;
    const token_id = [...available_token_ids][Math.floor(Math.random() * n)];
    // √ Build the transfer
    // √ Build the permit
    // √ Ask to sign the permit
    // √ Send the permit to the API
    // √ Build the transfer operation
    // √ Send it to the API
    (async () => {
      isStashing = true;

      try {
        // Initializes a Gas Station instance using the provided API URL
        const gas_api = new GasStation({
          apiURL: PUBLIC_GAS_STATION_API,
        });

        // Initializes a PermitContract instance using the public permit address and the
        // Tezos object
        const permit_contract = new PermitContract(PUBLIC_PERMIT, Tezos);

        // Generate permit data for the transfer operation. Specifies the sender,
        // receiver (staking contract), token ID, and amount
        const permit_data = await permit_contract.generatePermit({
          from_: user_address,
          txs: [
            {
              to_: PUBLIC_STAKING_CONTRACT,
              token_id: parseInt(token_id, 10),
              amount: 1,
            },
          ],
        });

        // Request signature for permit
        const signature = (
          await (
            await wallet.client
          ).requestSignPayload({
            signingType: SigningType.MICHELINE,
            payload: permit_data.bytes,
          })
        ).signature;
        const activeAccount = await wallet.client.getActiveAccount();

        if (!activeAccount) {
          throw new Error("No active account, cannot stash.");
        }

        // Permit call and staking contract operation
        const permit_op = await permit_contract.permitCall({
          publicKey: activeAccount.publicKey,
          signature: signature,
          transferHash: permit_data.transfer_hash,
        });

        // Get the staking contract instance
        const staking_contract = await Tezos.wallet.at(PUBLIC_STAKING_CONTRACT);

        // Build a transfer operation for stashing the token in the staking contract
        const staking_op = await staking_contract.methods
          .stash(1, token_id, user_address)
          .toTransferParams();

        stashProgress = 50;

        // Post Operations to Gas Station API
        const response = await gas_api.postOperations(user_address, [
          {
            destination: permit_op.to,
            parameters: permit_op.parameter,
          },
          {
            destination: staking_op.to,
            parameters: staking_op.parameter,
          },
        ]);

        stashProgress = 100;
      } catch (error) {
        console.error("Stashing failed:", error);
        console.error("URL being fetched:", PUBLIC_GAS_STATION_API);
        stashProgress = 0;
      } finally {
        // Introduce a short delay before setting isStashing to false
        // to give Svelte time to update the UI
        await new Promise((resolve) => setTimeout(resolve, 0));
        isStashing = false;
      }
    })();
  }

  subTezos(() => {
    get_tokens(PUBLIC_STAKING_CONTRACT);
  });
</script>

<div style="display: flex">
  <div>
    <!-- Stash Button with Progress Bar -->
    <button on:click={() => stash(user_address)}>
      {isStashing ? "Stashing..." : "Stash"}
    </button>
      {#if isStashing}
        <div class="progress-bar">
          <div class="progress-bar-fill" style="width: {stashProgress}%"></div>
        </div>
      {/if}
  </div>

  <div>
    {#if user_tokens.length == 0}
      <p>You don't have any tokens stashed.</p>
    {:else}
      <div style="display:flex;align-items:center;justify-content:center;">
        {#each user_tokens as token, i}
          <div
            style="display:flex;flex-direction:column;justify-content:center;align-items:center;"
          >
            {#if Object.hasOwn(token.token, "metadata")}
              <img
                src={IPFSLinkToHTTPS(token.token.metadata.thumbnailUri)}
                alt="Token thumnail"
              />
              <div style="text-align: center; font-size:14px">
                {token.balance}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .progress-bar {
      background-color: #eee; /* Light gray background for the progress bar */
      border: 1px solid #ccc; /* Border for the progress bar */
      border-radius: 15px; /* Rounded corners */
      height: 10px;
    }

  .progress-bar-fill {
      background-color: #0074cc; /* Color for the filled part of the progress bar */
      height: 100%; /* Fill the entire height of the progress bar */
    }
</style>