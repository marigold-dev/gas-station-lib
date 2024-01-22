# Gas Station Demo

This project is a toy web application demonstrating the use of a Gas Station API and a Permit Contract on the Tezos blockchain.

The web app allows you to mint a non-fungible token (NFT) and transfer it to a "staking" contract, even if you have no Tez in your wallet.


## Prerequisites

Before you start, ensure you have the following installed on your machine:

- Node.js [Download and Install Node.js](https://nodejs.org/)
- npm (Node Package Manager): Comes with Node.js installation
- NVM (Node Version Manager): This is the key component for managing Node.js versions.
  To install NVM for managing Node.js versions, refer to the official installation guide
  at [install](https://github.com/nvm-sh/nvm#installing-and-updating)

## Gas Station API and Permit Contract

This project interacts with a Gas Station API and a Permit Contract on the Tezos blockchain. The contracts are already deloyed on Ghostnet. Configure the follwing in the `.env` file:

- **Gas Station API URL**: the URL of the Gas Station API that handles the reply of operations to the blockchain.
- **Permit Contract Address**: the address of the Permit Contract on the Tezos blockchain. This contract is used for authorizing and signing operations.
- **Staking Contract Address (Optional)**: If applicable, the address of the Staking Contract where NFTs can be transferred.

**Note:** The contract addresses and API URL can be changed in the `.env` file.


## Configuration

Copy the `.env.example` file to `.env` and update the following variables based on your deployment:

```dotenv
PUBLIC_TZKT_API=https://api.ghostnet.tzkt.io
PUBLIC_TEZOS_RPC=https://ghostnet.smartpy.io

# Gas Station API URL
PUBLIC_GAS_STATION_API=http://localhost:8000

# Permit Contract Address
PUBLIC_PERMIT=KT1HUdxmgZUw21ED9gqELVvCty5d1ff41p7J

# Staking Contract Address (if applicable)
PUBLIC_STAKING_CONTRACT=KT1VVotciVbvz1SopVfoXsxXcpyBBSryQgEn

PUBLIC_APP_BASE_URL=http://localhost:5173
```

## Running locally

Navigate to the project folder:

```
cd examples/nft
```

To install dependencies, run:

```
npm install
```
or

```
npm i
```

To launch the project on your localhost using a development server, run:

```
npm run dev
```

Your project will be accessible at http://localhost:5173/

To clean up generated files, run:

```
rm -rf node_modules
```

Make sure to configure the `.env` file with the appropriate values before running the project locally.