// adapted (hardy harhar) from:
// https://github.com/solpayments/solana-svelte-template/blob/9b8f140a27ca43e9f7a0fb087bb3c46f73b8ca65/src/helpers/wallet.ts#L27
import type { PublicKey } from '@solana/web3.js';
import type { WalletAdapter } from '$lib/helpers/types';
import { adapter, anchorClient } from '$lib/stores';
import { get } from 'svelte/store';
import once from 'events.once';

export const newWalletAdapter = (): WalletAdapter => {
	/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment */
	const wallet: WalletAdapter = window.solana;
	/* eslint-enable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment */

	wallet.on('connect', (publicKey: PublicKey) => {
		console.log(`Connected to  ${publicKey.toBase58()}`);
	});
	wallet.on('disconnect', () => {
		console.log('Disconnecting');
		wallet.disconnect();
		adapter.update(() => undefined);
	});

	return wallet;
};

export const phantomConnect = async ({ onlyIfTrusted } = {}): Promise<void> => {
	console.log('phantomConnect');
	const newWallet = newWalletAdapter();
	// eslint-disable-next-line
	try {
		await newWallet.connect({ onlyIfTrusted }); // request
	} catch (error) {
		// connect wallet
	}
	if (!newWallet.isConnected) await once(newWallet, 'connect'); // authorized
	adapter.update(() => newWallet); // use it as adapter
	get(anchorClient).setWallet(); // update our client to use phantom as the wallet provider
};
