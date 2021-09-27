import type { PublicKey, Transaction } from '@solana/web3.js';

export type VoidFunction = () => void;
export type PubkeyVoidFunction = (publicKey: PublicKey) => void;

export interface WalletAdapter {
  publicKey: PublicKey | null | undefined;
  autoApprove: boolean;
  connected: boolean;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAllTransactions: (transaction: Transaction[]) => Promise<Transaction[]>;
  connect: () => PublicKey;
  disconnect: () => void;
  // eslint-disable-next-line
  on<T>(event: string, fn: VoidFunction | PubkeyVoidFunction): this;
}

/** Interface for a generic object
 *
 * This can work when you need to describe an object which is unknown e.g.
 * the result of some API call.
 *
 * The generic type also makes it useful as an interface to an object whose
 * properties are all of the same type e.g. {foo: 1, bar: 3} could be of type
 * Dictionary<number>
 *
 * It is also easy to abuse this interface to describe any kind of object (T is
 * any by default).  Care must be taken not to do this.  Use Dictionary only when
 * you have to.
 */
export interface Dictionary<T = any> {
  [key: string]: T;
}