# Tezos Gas Station library

This library facilitates the following:
- Utilizing [Marigold's Gas Station API](https://github.com/marigold-dev/gas-station) in TypeScript.
- Creating [TZIP-17 permit contracts](https://tzip.tezosagora.org/proposal/tzip-17/), which are FA2
  contracts capable of being manipulated by a 3rd party, such as the gas station API. Permits are signed
  off-chain and can be posted and executed by anyone.

An example of a toy web app is provided in the `examples/nft` directory.

Feel free to contribute and provide feedback on https://github.com/marigold-dev/gas-station-lib.
