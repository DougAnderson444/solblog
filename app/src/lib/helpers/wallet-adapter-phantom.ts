// Anchor Wallet interface
// https://github.com/project-serum/anchor/blob/master/ts/src/provider.ts#L219
/**
 * Wallet interface for objects that can be used to sign provider transactions.
 */
// export interface Wallet {
//   signTransaction(tx: Transaction): Promise<Transaction>;
//   signAllTransactions(txs: Transaction[]): Promise<Transaction[]>;
//   publicKey: PublicKey;
// }
export class WalletAdaptorPhantom {
	constructor() {
        if(!window.solana.isConnected) throw new Error("Connect to Phantom first");
        return;
		this.publicKey = window.solana.publicKey;
	}

	async signTransaction(tx: Transaction): Promise<Transaction> {
		const signedTransaction = await window.solana.signTransaction(tx);
		return signedTransaction;
	}

	async signAllTransactions(txs: Transaction[]): Promise<Transaction[]> {
		const signedTransactions = await window.solana.signAllTransactions(transactions);
		return signedTransactions;
	}

	get publicKey(): PublicKey {
		return window.solana.publicKey;
	}
}
