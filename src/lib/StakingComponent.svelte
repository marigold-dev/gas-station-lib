<script lang="ts">
  import { Tezos } from "$lib/tezos";
  import * as blake2b from "blake2b";
  import { buf2hex, hex2buf } from "@taquito/utils";
  import { RpcClient } from "@taquito/rpc";
  import { InMemorySigner } from "@taquito/signer";
  import { packDataBytes } from "@taquito/michel-codec";
  import { ParameterSchema } from "@taquito/michelson-encoder";
  import { PUBLIC_PERMIT, PUBLIC_TEZOS_RPC, PUBLIC_STAKING_CONTRACT, PUBLIC_TZKT_API } from '$env/static/public';

  export let user_address;

  const token_id = 0;

  function stake(user_address) {
    // √ Build the transfer
    // √ Build the permit
    // Ask to sign the permit
    // Send the permit to the API
    // Build the transfer operation
    // Send it to the API
    (async () => {
      const rpc_client = new RpcClient(PUBLIC_TEZOS_RPC, "main");
      const chain_id = await rpc_client.getChainId();
      const contract = await Tezos.wallet.at(PUBLIC_PERMIT);
      const counter = (await contract.storage()).extension.counter.e;
      const transfer_data = [
        {"string": user_address},
        [{
          "prim": "Pair",
          "args": [
            {"string": PUBLIC_PERMIT},
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
      const permit_blak = blake2b(32);
      const permit_hash = permit_blak.update(hex2buf(permit_byts)).digest('hex');
      console.log(permit_hash);
      /*
      await contract.methodsObject.permit([(
              owner: user_address,
              token_id: token_id,
              amount_: 100
          )]).toTransferParams()
          const post_content = {
              sender: user_address,
              contract_address: PUBLIC_PERMIT,
              parameters: mint_op.parameter
          }
      */
      console.log(await Tezos.wallet.client);
      (await Tezos.wallet.client).requestSignPayload({
          signingType: 'raw',
          payload: permit_hash
      });

      // console.log(parameterSchema.Encode(transfer_op));
      })();
  }
</script>

<div style="display: flex">
  <div>
    <button on:click={stake(user_address)}>
      stake
    </button>
  </div>

</div>


