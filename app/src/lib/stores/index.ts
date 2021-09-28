import { derived, writable, get } from 'svelte/store';
import type { WalletAdapter } from '$lib/helpers/types';
import { MAIN_NET, DEV_NET, APP_WALLET, ADAPTER } from '$lib/constants.js';

let loaded;
let ImmortalDB = new Promise((resolve, reject) => {
	loaded = resolve;
});

if (typeof window !== 'undefined') {
	import('immortal-db').then((mod) => {
		ImmortalDB = mod.ImmortalDB;
		loaded(); // resolves the Immortal promise above
	});
} else {
	// ImmortalDB = ??
}

export type Adapter = WalletAdapter | undefined;

/** the wallet adapter from sollet, etc */
export const adapter = writable<Adapter>(undefined);

/** is the wallet connected? */
//Derives a store from one or more other stores. Whenever those dependencies change, the callback runs.
export const connected = derived(adapter, ($adapter) => {
	if ($adapter && $adapter.publicKey) {
		return true;
	}
	return false;
});

export const selectedNetwork = writable(DEV_NET);
export const selectedWallet = writable(!APP_WALLET);
export const anchorClient = writable(null);