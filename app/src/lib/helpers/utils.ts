import { selectedNetwork, anchorClient } from '$lib/stores';
import { get } from 'svelte/store';
import { programIdMainnet, DEV_NET, configMainnet } from '$lib/constants';
import * as anchor from '@project-serum/anchor';

// we can do this because svektekit/vite allows us to import json file as es modules :)
import solConfigFile from '../../../../deploy/solana-config.json';
import solblog_keypair from '../../../../target/deploy/solblog-keypair.json';
import type { PublicKey } from '$lib/helpers/types'
import { Connection, PublicKey } from '@solana/web3.js';

import { HASH_PREFIX, NAME_PROGRAM_ID, TWITTER_ROOT_PARENT_REGISTRY_KEY } from '$lib/constants';
import { hash } from "@stablelib/sha256";
import { sha256 } from 'hash.js'
import { deserializeUnchecked, Schema } from 'borsh';

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

// from line
// https://github.com/solana-labs/solana-program-library/blob/3e945798fc70e111b131622c1185385c222610fd/name-service/js/src/twitter.ts#L217
// which breaks in the browser
// because crypto :(
export async function getTwitterRegistry(
  twitter_handle: string
): Promise<NameRegistryState> {
  const hashedTwitterHandle = await getHashedName(twitter_handle);
  const twitterHandleRegistryKey = await getNameAccountKey(
    hashedTwitterHandle,
    TWITTER_ROOT_PARENT_REGISTRY_KEY
  );
  const registry = await NameRegistryState.retrieve(
    new Connection(configMainnet.httpUri),
    twitterHandleRegistryKey
  );
  return registry.owner;
}

function getHashedName(name: string): Uint8Array {
  const input = HASH_PREFIX + name;
  return sha256().update(input).digest('hex')
}

// adapted from https://github.com/solana-labs/solana-program-library/blob/3e945798fc70e111b131622c1185385c222610fd/name-service/js/src/utils.ts#L101
async function getNameAccountKey(
  hashed_name: Uint8Array,
  nameParent?: PublicKey
): Promise<PublicKey> {
  const seeds = [Buffer.from(hashed_name, 'hex')];
  seeds.push(Buffer.alloc(32)); // NameClass is blank for Twitter
  seeds.push(nameParent.toBuffer());
  const [nameAccountKey] = await PublicKey.findProgramAddress(
    seeds,
    NAME_PROGRAM_ID
  );
  return nameAccountKey;
}

export class NameRegistryState {
  static HEADER_LEN = 96;
  parentName: PublicKey;
  owner: PublicKey;
  class: PublicKey;
  data: Buffer | undefined;

  static schema: Schema = new Map([
    [
      NameRegistryState,
      {
        kind: 'struct',
        fields: [
          ['parentName', [32]],
          ['owner', [32]],
          ['class', [32]],
        ],
      },
    ],
  ]);
  constructor(obj: {
    parentName: Uint8Array;
    owner: Uint8Array;
    class: Uint8Array;
  }) {
    this.parentName = new PublicKey(obj.parentName);
    this.owner = new PublicKey(obj.owner);
    this.class = new PublicKey(obj.class);
  }

  public static async retrieve(
    connection: Connection,
    nameAccountKey: PublicKey
  ): Promise<NameRegistryState> {
    let nameAccount = await connection.getAccountInfo(
      nameAccountKey,
      'processed'
    );
    if (!nameAccount) {
      throw new Error('Invalid name account provided');
    }

    let res: NameRegistryState = deserializeUnchecked(
      this.schema,
      NameRegistryState,
      nameAccount.data
    );

    res.data = nameAccount.data?.slice(this.HEADER_LEN);

    return res;
  }
}