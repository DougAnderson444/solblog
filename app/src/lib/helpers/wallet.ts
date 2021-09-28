// adapted (haha) from:
// https://github.com/solpayments/solana-svelte-template/blob/9b8f140a27ca43e9f7a0fb087bb3c46f73b8ca65/src/helpers/wallet.ts#L27
import type { PublicKey } from '@solana/web3.js';
// import Wallet from '@project-serum/sol-wallet-adapter';
import type { WalletAdapter } from '$lib/helpers/types';
import { adapter } from '$lib/stores';
import once from "events.once";

// import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
// import {
//     getLedgerWallet,
//     getPhantomWallet,
//     getSlopeWallet,
//     getSolflareWallet,
//     getSolletExtensionWallet,
//     getSolletWallet,
//     getTorusWallet,
// } from '@solana/wallet-adapter-wallets';

export const newWalletAdapter = (): WalletAdapter => {
  /* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment */
  const wallet: WalletAdapter = window.solana
  /* eslint-enable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment */

  wallet.on('connect', (publicKey: PublicKey) =>
    console.log(`Connected to  ${publicKey.toBase58()}`)
  );
  wallet.on('disconnect', () => {
    console.log('Disconnected');
    adapter.update((_) => undefined);
  });

  return wallet;
};

export const phantomConnect = async ({ onlyIfTrusted } = { }): Promise<void> => {
  const newWallet = newWalletAdapter();
  console.log('window.solana.isConnected', window.solana.isConnected)
  // eslint-disable-next-line
  await newWallet.connect({ onlyIfTrusted }); // request
  if(!newWallet.isConnected) await once(newWallet, "connect") // authorized
  adapter.update(() => newWallet); // use it as adapter
};
