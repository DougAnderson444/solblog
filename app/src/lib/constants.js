import { PublicKey } from '@solana/web3.js';

export const DEV_NET = 'devnet';
export const MAIN_NET = 'mainnet';
export const APP_WALLET = true;
export const ADAPTER = '_adapter_immortaldb';
export const programIdMainnet = '5JBjXWwqWHwPK1NRgV8d9XQ87wtGDKTmkv4LPZjfZZxa';
export const configMainnet = {
	httpUri: 'https://api.mainnet-beta.solana.com'
};

// for Twitter name service
export const HASH_PREFIX = 'SPL Name Service';
export const NAME_PROGRAM_ID = new PublicKey('namesLPneVptA9Z5rqUDD9tMTWEJwofgaYwp8cawRkX');
export const TWITTER_ROOT_PARENT_REGISTRY_KEY = new PublicKey(
	'4YcexoW3r78zz16J2aqmukBLRwGq6rAvWzJpkYAXqebv'
);
