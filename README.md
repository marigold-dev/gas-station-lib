# Tezos Gas Station library

This library helps you
- use [Marigold's Gas Station API](https://github.com/marigold-dev/gas-station) in TypeScript
- create [TZIP-17 permit contracts](https://tzip.tezosagora.org/proposal/tzip-17/), which are FA2
  contracts that can be manipulated by a 3rd party (such as the gas station API). Permits are signed
  off-chain and can be posted and executed by anyone.

A toy webapp example is available in the `examples/` directory.

Contributions welcome at https://github.com/marigold-dev/gas-station-lib.
