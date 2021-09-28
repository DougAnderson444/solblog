import { anchorClient } from '$lib/stores';
import { get } from 'svelte/store';

export const loadAnchorClient = async () => {
	if(!!get(anchorClient)) return
	let AnchorBlogLibrary = await import('$lib/anchor');
	anchorClient.update((_) => new AnchorBlogLibrary.default()); // establish our Solana connection & load our little library helpers
};
