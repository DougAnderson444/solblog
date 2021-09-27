// import the Anchor library
import * as anchor from '@project-serum/anchor';
// Read the generated IDL
import idl from '../../../target/idl/solblog.json';

import Solana from '../../../deploy/solana.js';

// we can do this because svektekit/vite allows us to import json file as es modules :)
import solConfigFile from '../../../deploy/solana-config.json';
import keyfile from '../../../deploy/programauthority-keypair.json';
import solblog_keypair from '../../../target/deploy/solblog-keypair.json';

import { WalletAdaptorPhantom } from '$lib/helpers/wallet-adapter-phantom';

const { SystemProgram } = anchor.web3; // Added to initialize account

let cfg = solConfigFile.development.config;
export let solana = new Solana(cfg);
let connection = solana.connection;

let utf8decoder = new TextDecoder(); // default 'utf-8' or 'utf8'

// get the program ID from the solblog-keyfile.json
let pgmKeypair = Solana.getSigningAccount(new Uint8Array(solblog_keypair));
const programId = new anchor.web3.PublicKey(pgmKeypair.publicKey); // Address of the deployed program

// dev only, use dev solana.connection
export const airDrop = async (publicKey, lamports = 500000000) => {
	await solana.airDrop(Solana.getPublicKey(publicKey), lamports);
	return await getBalance(publicKey);
};

export const getBalance = async (publicKey) => {
	// CLI: solana airdrop --url devnet 1 <recipientaddress>
	let walletLamports = await solana.getAccountBalance(Solana.getPublicKey(publicKey));
	return walletLamports;
};

// Read is a pure Solana Web3.js exercise, no Anchor really needed
export const getLastPosts = async (blogid, limit = 100) => {
	const accountpublicKey = new anchor.web3.PublicKey(blogid);

	const parsedConfirmedTransactions = await getTransactionForAddress(accountpublicKey);

	const filtered = parsedConfirmedTransactions.filter((tx) =>
		tx.meta.logMessages.some((msg) => msg.startsWith('Program log:'))
	);

	const postDetails = filtered.map((tx) => {
		const timestamp = new Date(tx.blockTime * 1000).toString();
		const pgmLogs = tx.meta.logMessages.filter((msg) => msg.startsWith('Program log: '));
		const content = pgmLogs.map((log) => log.substring('Program log: '.length));
		return { content, timestamp, signature: tx.transaction.signatures[0] };
	});

	return postDetails;
};

export const getTransactionForAddress = async (publicKey, limit = 100) => {
	const confirmedSignatureInfo = await connection.getSignaturesForAddress(
		Solana.getPublicKey(publicKey),
		{ limit }
	);

	const transactionSignatures = confirmedSignatureInfo.map((sigInfo) => sigInfo.signature);
	const parsedConfirmedTransactions = await connection.getParsedConfirmedTransactions(
		transactionSignatures
	);
	return parsedConfirmedTransactions;
};
export const getBlogAccounts = async (publicKey) => {
	// 1) Find all Tx for this PublicKey
	// 2) Filter to Tx that have programId == our ProgramId
	// 3) Get addresses (pubkeys) for that Tx, separate them into A) Payer, Program, and BlogAccount
	// 4) List the different accounts
	const parsedConfirmedTransactions = await getTransactionForAddress(publicKey);

	let blogAccounts = [];

	// filter these tx where there are some programIds as pubkey
	parsedConfirmedTransactions.forEach((tx) => {
		tx.transaction.message.accountKeys.forEach((key, index, orig) => {
			// exclude keys that dont include this programId
			if (key.pubkey.toString() !== programId.toString()) return;

			let account = tx.transaction.message.accountKeys.find((key) => {
				// writable && signer == payer (already known)
				// !writable && !signer == program (already known)
				// writable && !signer == blogAccount
				return key.writable && !key.signer;
			});
			if (!account) {
				// happens when Account is originally created, so we can discard this match
				// it happens because at creation, blogAccount is a signer too (key.signer=true)
				// alternatively, we could search for Create Account instructions and find the "new Address" from the blogger ID address
				console.log(
					`https://explorer.solana.com/address/${tx.transaction.signatures[0]}?cluster=devnet`
				);
				return;
			}
			if (!blogAccounts.includes(account.pubkey.toString()))
				blogAccounts.push(account.pubkey.toString());
		});
	});
	return blogAccounts;
};

export class BlogWriter {
	constructor({ config, keypair }) {
		if (config) {
			solana = new Solana(cfg);
			connection = solana.connection;
		}

		const opts = {
			preflightCommitment: 'recent',
			commitment: 'recent'
		};

		const wallet =
			window.solana.isConnected && window.solana?.isPhantom
				? new WalletAdaptorPhantom()
				: keypair
				? new anchor.Wallet(keypair)
				: new anchor.Wallet(anchor.web3.Keypair.generate());
		// maps anchor calls to Phantom direction
		const provider = new anchor.Provider(connection, wallet, opts);
		this.program = new anchor.Program(idl, programId, provider);
	}

	async initialize(blogAccount, provider) {
		// check to see if this account has been initialized before
		const account = await this.program.account.blogAccount.fetch(blogAccount.publicKey);
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
		console.log(
			`Successfully intialized Blog ID: ${blogAccount.publicKey} for Blogger ${provider.wallet.publicKey}`
		);
	}

	async makePost(post, blogAccount) {
		// convert out text string to UTF8 bytes
		// const encoder = new TextEncoder();
		let utf8decoder = new TextDecoder(); // default 'utf-8' or 'utf8'
		let provider = this.program.provider;

		const utf8encoded = Buffer.from(post); // encoder.encode(post); // doesn't like UInt8Array?
		console.log('Payer: ', provider.wallet.payer.publicKey.toBase58());
		// Execute the RPC.
		const tx = await this.program.rpc.makePost(
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
		console.log({ tx });
		const logMessages = tx?.meta?.logMessages;
		console.log({ logMessages });

		return tx;
	}

	// never really used, but a good example of how to use Anchor to read an account
	async getLatestPost(blogAccount) {
		const account = await this.program.account.blogAccount.fetch(blogAccount.publicKey);
		console.log(`get account latest post:`, { account });
		return utf8decoder.decode(account.latestPost);
	}
}
