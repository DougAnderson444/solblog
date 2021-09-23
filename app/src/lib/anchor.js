// import the Anchor library
import * as anchor from '@project-serum/anchor';
// Read the generated IDL
import idl from '../../../target/idl/solblog.json';

import Solana from '../../../deploy/solana.js';

// we can do this because svektekit/vite allows us to import json file as es modules :)
import solConfigFile from '../../../deploy/solana-config.json';
import keyfile from '../../../deploy/programauthority-keypair.json';
import solblog_keypair from '../../../target/deploy/solblog-keypair.json';

const { SystemProgram } = anchor.web3; // Added to initialize account

let config = solConfigFile.development.config;
let solana = new Solana(config);
let connection = solana.connection;
let utf8decoder = new TextDecoder(); // default 'utf-8' or 'utf8'

// convert the keyfile.json to a Keypair object
let payerKeypair = Solana.getSigningAccount(new Uint8Array(keyfile));
const wallet = new anchor.Wallet(payerKeypair);

console.log('payerKeypair Base58', payerKeypair.publicKey.toBase58());

const opts = {
	preflightCommitment: 'recent',
	commitment: 'recent'
};

const provider = new anchor.Provider(connection, wallet, opts);

// Configure the local cluster on nodejs
anchor.setProvider(provider);

// get the program ID from the solblog-keyfile.json
let pgmKeypair = Solana.getSigningAccount(new Uint8Array(solblog_keypair));
// Address of the deployed program.
const programId = new anchor.web3.PublicKey(pgmKeypair.publicKey);

// Generate the program client from IDL.
const program = new anchor.Program(idl, programId, provider);

let blogAccount = anchor.web3.Keypair.generate(); // this will be out account publickey

export async function initialize(blogAccount) {
	// check to see if this account has been initialized before
	const account = await program.account.blogAccount.fetch(blogAccount.publicKey);
	console.log(`pre-init account:`, { account });

	if (account.authority === blogAccount.publicKey) return;

	// Execute the RPC.
	const tx = await program.rpc.initialize(
		// provider.wallet.payer.publicKey,
		{
			accounts: {
				blogAccount: blogAccount.publicKey, // we're re-using our wallet keys for simplicity, but you can pass in any keypair you like
				authority: provider.wallet.publicKey, // just for Anchor reference
				systemProgram: SystemProgram.programId // just for Anchor reference
			},
			signers: [blogAccount] // , provider.wallet.payer
		}
	);
	console.log(`Successfully intialized ${blogAccount.publicKey}`);
}

export async function makePost(post) {
	// convert out text string to UTF8 bytes
	// const encoder = new TextEncoder();
	let utf8decoder = new TextDecoder(); // default 'utf-8' or 'utf8'

	const utf8encoded = Buffer.from(post); // encoder.encode(post); // doesn't like UInt8Array?

	// Execute the RPC.
	const tx = await program.rpc.makePost(
		// input must be compatible with UTF8 Vector in rust
		utf8encoded,
		// now pass the accounts in
		{
			accounts: {
				blogAccount: blogAccount.publicKey, // we're re-using our wallet keys for simplicity, but you can pass in any keypair you like
				authority: provider.wallet.publicKey // just for Anchor reference
			},
			signers: [provider.wallet.payer]
		}
	);
	console.log(
		`Successfully posted ${post} to https://explorer.solana.com/address/${blogAccount.publicKey}?cluster=devnet`
	);
	// Fetch the newly created account from the cluster.
	await Solana._sleep(1200);

	console.log(
		`Account latest_post: \n`,
		account.latestPost,
		utf8decoder.decode(account.latestPost),
		utf8decoder.decode(account.latestPost) === post
	);

	await Solana._sleep(2400);

	// now get the signatures for this address
	let confirmedSignatureInfo = await connection.getSignaturesForAddress(blogAccount.publicKey);
	console.log({ confirmedSignatureInfo });
	console.log('memo:', confirmedSignatureInfo[0].memo);

	let transaction;
	try {
		transaction = await connection.getParsedConfirmedTransaction(
			confirmedSignatureInfo[0].signature
		);
	} catch (error) {
		console.error('Error with getParsedConfirmedTransaction');
	}
	console.log({ transaction });
	const logMessages = transaction?.meta?.logMessages;
	console.log({ logMessages });
}

export const getLatestPost = async (blogAccount) => {
	const account = await program.account.blogAccount.fetch(blogAccount.publicKey);
	console.log(`get account latest post:`, { account });
	return utf8decoder.decode(account.latestPost);
};

export const getLastPosts = async (blogid, limit = 100) => {
	const accountpublicKey = new anchor.web3.PublicKey(blogid);
	const confirmedSignatureInfo = await connection.getSignaturesForAddress(accountpublicKey, {
		limit
	});
	// confirmedSignatureInfo.signature = is just a string
	// TransactionSignature: Transaction signature as base-58 encoded string

	const transactionSignatures = confirmedSignatureInfo.map((sigInfo) => sigInfo.signature);

	const parsedConfirmedTransactions = await connection.getParsedConfirmedTransactions(
		transactionSignatures
	);

	const filtered = parsedConfirmedTransactions.filter((tx) =>
		tx.meta.logMessages.some((msg) => msg.startsWith('Program log:'))
	);

	const postDetails = filtered.map((tx) => {
		console.log({ tx }, tx.transaction.signatures);

		const timestamp = new Date(tx.blockTime * 1000).toString();
		const content = tx.meta.logMessages.filter((msg) => msg.startsWith('Program log:'));
		return { content, timestamp, signature: tx.transaction.signatures[0] };
	});

	return postDetails;
};
