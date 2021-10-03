import { selectedNetwork, anchorClient } from '$lib/stores';
import { get } from 'svelte/store';
import { programIdMainnet, DEV_NET, configMainnet } from '$lib/constants';
import * as anchor from '@project-serum/anchor';

// we can do this because svektekit/vite allows us to import json file as es modules :)
import solConfigFile from '../../../../deploy/solana-config.json';
import solblog_keypair from '../../../../target/deploy/solblog-keypair.json';

const getDevPgmId = () => {
	// get the program ID from the solblog-keyfile.json
	let pgmKeypair = anchor.web3.Keypair.fromSecretKey(new Uint8Array(solblog_keypair));
	return new anchor.web3.PublicKey(pgmKeypair.publicKey); // Address of the deployed program
};

export const loadAnchorClient = async ({ keypair } = {}) => {
	if (!!get(anchorClient)) return;
	let AnchorBlogLibrary = await import('$lib/anchorClient');
	
	let config = get(selectedNetwork) == DEV_NET ? solConfigFile.development.config : configMainnet
	let programId = get(selectedNetwork) == DEV_NET ? getDevPgmId() : programIdMainnet

	anchorClient.update((_) => new AnchorBlogLibrary.default({ programId, config, keypair })); // establish our Solana connection & load our little library helpers
};
