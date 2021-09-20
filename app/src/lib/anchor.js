// import the Anchor library
import * as anchor from '@project-serum/anchor';
// Read the generated IDL
import idl from '../../../target/idl/solblog.json';

import Solana from '../../../deploy/solana.js';

// we can do this because svektekit/vite allows us to import json file as es modules :)
import solConfigFile from '../../../deploy/solana-config.json';
import keyfile from '../../../deploy/payer-keypair.json';

let config = solConfigFile.development.config;
let solana = new Solana(config);
let connection = solana.connection;

// convert the keyfile.json to a Keypair object
let keypair = Solana.getSigningAccount(new Uint8Array(keyfile));
const wallet = new anchor.Wallet(keypair);

const opts = {
	preflightCommitment: 'recent',
	commitment: 'recent'
};

const provider = new anchor.Provider(connection, wallet, opts);

// Configure the local cluster on nodejs
anchor.setProvider(provider);

// Address of the deployed program.
const programId = new anchor.web3.PublicKey('3v1Y5wFi4fn3wij7W6hJztdYoLgVqR9a4n8ARpaGNqW9');

// Generate the program client from IDL.
const program = new anchor.Program(idl, programId, provider);

export async function initialize() {
	// Execute the RPC.
	await program.rpc.initialize();
	console.log('Successfully intialized');
}
