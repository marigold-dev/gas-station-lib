import { PUBLIC_TEZOS_RPC } from '$env/static/public';
import { NetworkType } from '@airgap/beacon-sdk';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { TezosToolkit } from "@taquito/taquito";
import { writable } from 'svelte/store';

export const Tezos = new TezosToolkit(PUBLIC_TEZOS_RPC);

export let myAccount = writable(undefined);

export const wallet = new BeaconWallet ({
  name: 'Training',
  preferredNetwork: NetworkType.GHOSTNET,
});

export async function connectWallet() {
  const a = await wallet.requestPermissions({
    network: {
      type: NetworkType.GHOSTNET,
      rpcUrl: PUBLIC_TEZOS_RPC,
    }
  });

  Tezos.setWalletProvider(wallet);
  myAccount.set(await wallet.client.getActiveAccount());
}

export async function getPKH() {
  return await wallet.getPKH();
}

export async function getBalance() {
  const activeAccount = wallet.client.getActiveAccount();
  if (activeAccount) {
    return await Tezos.tz.getBalance(activeAccount.address);
  }
}

export function subTezos(f) {
  const sub = Tezos.stream.subscribeBlock('head');

  sub.on('data', f);
  return sub;
}

console.log("My tezos library loaded successfully");
