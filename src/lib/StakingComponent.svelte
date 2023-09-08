<script lang="ts">
  import { Tezos, wallet } from "$lib/tezos";
  import * as blake2b from "blake2b";
  import { buf2hex, hex2buf } from "@taquito/utils";
  import { RpcClient } from "@taquito/rpc";
  import { InMemorySigner } from "@taquito/signer";
  import { packDataBytes } from "@taquito/michel-codec";
  import { ParameterSchema } from "@taquito/michelson-encoder";
  import { PUBLIC_PERMIT, PUBLIC_TEZOS_RPC, PUBLIC_STAKING_CONTRACT, PUBLIC_TZKT_API } from '$env/static/public';

  export let user_address;

  const token_id = 0;

  function IPFSLinkToHTTPS(url: string) {
    return url.replace("ipfs://", "https://ipfs.io/ipfs/");
  }

  function get_tokens(address) {
    return fetch(`${PUBLIC_TZKT_API}/v1/tokens/balances?account=${address}&token.contract=${PUBLIC_PERMIT}&balance.gt=0`)
      .then((response) => {
        return response.json();
      })
      .then((fa2_tokens) => {
        return fa2_tokens;
      });
  };

  function stake(user_address) {
    // √ Build the transfer
    // √ Build the permit
    // √ Ask to sign the permit
    // √ Send the permit to the API
    // √ Build the transfer operation
    // √ Send it to the API
    (async () => {
      const rpc_client = new RpcClient(PUBLIC_TEZOS_RPC, "main");
      const chain_id = await rpc_client.getChainId();
      const contract = await Tezos.wallet.at(PUBLIC_PERMIT);
      console.log(await contract.storage());
      const counter = (await contract.storage()).extension.counter.c[0];
      const transfer_data = [
        {"string": user_address},
        [{
          "prim": "Pair",
          "args": [
            {"string": PUBLIC_STAKING_CONTRACT},
            {"int": token_id},
            {"int": 10}
          ]
        }]
      ];
      const transfer_type =
        {'prim': 'pair',
         'args': [{'prim': 'address', 'annots': ['%from_']},
          {'prim': 'list',
           'annots': ['%txs'],
           'args': [{'prim': 'pair',
             'args': [{'prim': 'address', 'annots': ['%to_']},
              {'prim': 'pair',
               'args': [{'prim': 'nat', 'annots': ['%token_id']},
                {'prim': 'nat', 'annots': ['%amount']}]}]}]}]};
      const byts = packDataBytes(transfer_data, transfer_type).bytes;
      const blak = blake2b(32);
      const transfer_hash = blak.update(hex2buf(byts)).digest('hex');
      console.log(transfer_hash);
      console.log("Counter is:");
      console.log(counter);
      const permit_data = [
         [
              {"string": chain_id},
              {"string": PUBLIC_PERMIT}
          ],
          [
              {"int": counter},
              {"bytes": transfer_hash}
          ]
      ];
      const permit_type = {
        'prim': 'pair',
        'args': [
            {
                'prim': 'pair',
                'args': [
                    {'prim': 'chain_id'},
                    {'prim': 'address'}
                ]
            },
            {
                'prim': 'pair',
                'args': [
                    {'prim': 'int'},
                    {'prim': 'bytes'}
                ]
            }
        ]
      }
      const permit_byts = packDataBytes(permit_data, permit_type).bytes;
      console.log(permit_byts);

      const signature = (await (await wallet.client).requestSignPayload({
          signingType: 'micheline',
          payload: permit_byts
      })).signature;
      const { publicKey } = await wallet.client.getActiveAccount();
      console.log(user_address);
      console.log(signature);
      console.log(publicKey);
      console.log(contract);
      const permit_op = await contract.methods.permit([[
          publicKey,
          signature,
          transfer_hash
      ]]).toTransferParams();
      const post_content = {
          sender: user_address,
          contract_address: PUBLIC_PERMIT,
          parameters: permit_op.parameter
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
      console.log(response);
      // console.log(parameterSchema.Encode(transfer_op));
      // TODO support bulk transactions
      const staking_contract = await Tezos.wallet.at(PUBLIC_STAKING_CONTRACT);
      console.log(staking_contract)
      const staking_op = await staking_contract.methods.stake(
        10,
        user_address
      ).toTransferParams();
      const post_staking_op = {
          sender: user_address,
          contract_address: PUBLIC_STAKING_CONTRACT,
          parameters: staking_op.parameter
      }
      const response2 = await fetch("http://localhost:8000/operation", {
          method: "POST",
          mode: "cors",
          cache: "no-cache",
          credentials: "same-origin",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify(post_staking_op)
      });
      console.log(response2);
      })();
  }
</script>

<div style="display: flex">
  <div>
    <button on:click={stake(user_address)}>
      stake
    </button>
  </div>

  <div>
  {#await get_tokens(PUBLIC_STAKING_CONTRACT)}
  {:then fa2_tokens}
    {#if fa2_tokens.length == 0}
      <p>You don't have any tokens. Try minting one!</p>
    {:else}
      {#each fa2_tokens as token, i}
        <div>
          <img src="{IPFSLinkToHTTPS(token.token.metadata.thumbnailUri)}" />
          <div style="text-align: center; font-size:14px">{token.balance}</div>
        </div>
      {/each}
    {/if}
  {/await}
  </div>
</div>


