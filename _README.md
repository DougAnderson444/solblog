# SoLog

A simple blog platform, powered by Solana with a SvelteKit front end.

## About

This tutorial will take you from zero to functional blog.

Building Solana programs in rust can be tough. Anytime you want to save or retrieve data from an account, you need to think about packing/unpacking the data, serializing/unserializing the data and formats, a real pain.

Anchor abstracts away from the low level construction of accounts. It does this by bundling the boilerplate pack/unpack into rust macros. This gives the Anchor author a lot of shortcuts and speed to building Solana programs.

There are always two parts to a Solana app -- the on-chain program and accounts, and the off-chain app that interacts with it. The other benefit Anchor brings is the interaction between these two app segments is aligned by using an Interface Definition and Language (IDL). Since the interface of the off-chain app (say, in JavaScript) must always match the on-chain Solana program, this is a really nice convenience feature to have.

## Anchor Versions

It's important to understand that Anchor is new, and the API may change as development proceeds. These directions are valid now, but might differ in the future if/when there are breaking changes. But the general overall concepts remain unchanged.

## A Simple Blog

In this tutotial, we will create a simple short form blog saved to the Solana program and accounts, to show you how to use Anchor.

## Setup

Getting started with Anchor is fairly straightforward, and you can follow the [setup instructions on the Anchor website](https://project-serum.github.io/anchor/getting-started/installation.html).

For test environments, you have the choice of [installing a local validator](https://docs.solana.com/developing/test-validator) or using the [Devnet online](https://explorer.solana.com/?cluster=devnet). We will be deploying to the Solana Devnet to practice deploying in real life. As the syaing goes, deploy early, deploy often! The last thing you want is for your code to work in a development environment, and not in production.

Once you have installed all the Anchor dependencies, it's time to initiate a project!

## Init an Anchor Project

Initiating a project is pretty straightforward. In the command line -- use Windows Subsystem for Linux 2 (WSL2) if you are on Windows, as the Rust toolchain doesn't work in regular Windows:

Don't make a new folder! Anchor will create a new one for you.

```
anchor init solblog
```

This creates a folder and puts the anchor starter in that directory. From here, we can build out our app.

## Project folders

The folders we are interested in the most are:

```
|
├── programs
|   └── src
|      └── lib.rs
```

By default, Anchor has put some basic starting code in there for us.

```rust
use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod solblog {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>) -> ProgramResult {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
```

Let's break down what we see.

After including the anchor library, the program public key has this placeholder:

```rust
declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");
```

That is NOT our public key for our build. We need to generate that for our program. We generate it once, and then include it, and can make as many changes as we need to before deploying.

Our target folder is pretty empty right now.

```
|
├── programs
|   └── src
|      └── lib.rs
├── target
|   └── rls
```

Watch how the target folder changes once we do:

```
anchor build
```

Now our target directory is a bit beefier, and built:

```
|
├── programs
|   └── src
|      └── lib.rs
├── target
|   └── rls
|   └── idl
|   └── deploy
|           solblog.so
|           solblog-keypair.json
```

Our newly generated code public key is in that new .`/target/deploy` folder, go ahead and check it out! 


To show our program public key which we will use as out id, simply do


```cli
solana address -k ./target/deploy/solblog-keypair.json
```

Which shows us out unique key:

```
// yours will look different, that's ok
$  SoMeKeyThatIsUniqueTOmyPROGRAM
```

If you're following along in this tutorial repo, I've placed a shortcut to this script in the package.json file, so you can simply run `npm run show-key` in the terminal (as long as it's WSL2/Linux!)

Take your key and replace that default `declare_id` placeholder:

```rust
declare_id!("SoMeKeyThatIsUniqueTOmyPROGRAM");
```

Now our project folder is all set up, we can start making the program do something useful!

## Client Setup

Anchor is every bit about the client side as it is about the program side.

Since everything on the Solana program side must match configuration on the client side, we need to also paste this program key into our client code, so the client knows which program it's talkign to.

in `app/client.js` we need the following Anchor code to setup a basic remote procedure call (RPC) javascript client.

Since this tutorial is about Anchor, I'll quickly gloss over the SvelteKit setp and focus only on the Anchor RPC portion of the client side code.

SvelteKit makes our life easier to streamline the front end development, strawman our blog, and make it easy to read the IDL file.

The Svelte [setup](https://kit.svelte.dev/docs#introduction-getting-started) is simply:

1. `$ npm init svelte@next ./app`
2. `$ cd app`
3. `$ npm install` (choose the full app defaults)

Now we can add our Anchor javascript code to feed our Svelte front end with Solana data for our blog!

To use anchor from javascript, we import the anchor library:

```
npm install @project-serum/anchor --save
```

Then we'll create an Anchor helper script:

```js
// anchor.js
// import the Anchor library
import * as anchor from '@project-serum/anchor';
// Read the generated IDL
import idl from '../target/idl/solblog.json';

// Configure the local cluster on nodejs
anchor.setProvider(anchor.Provider.local());

// Address of the deployed program.
const programId = new anchor.web3.PublicKey('3v1Y5wFi4fn3wij7W6hJztdYoLgVqR9a4n8ARpaGNqW9');

// Generate the program client from IDL.
const program = new anchor.Program(idl, programId);

export async function initialize() {
	// Execute the RPC.
	await program.rpc.initialize();
	console.log('Successfully intialized');
}

```

Now all we need to do in javascript to call our `initialize` RPC function is 

```js
import { initialize } from './anchor.js'

// other front-end code here

await initialize()

```

Let's put the `initialize()` function somewhere in our Svelte app, deploy the Solana program to the DevNet, and check to see that it initializes as we plan!

To keep things simple, I will just paste this in the index of our front-end, in `index.svelte`

```js
	import { initialize } from '$lib/anchor.js';
	import { onMount } from "svelte";

	onMount(async()=>{
		await initialize()
	})
```

Since Anchor uses borsh, there is a small hack we need to add in order to get the Global varibale to work. In Svelte, if we paste something in our page layouts, it'll apply to all layouts, so we'll add our hack here to make things work with the imported Anchor library:

```js
	import { onMount } from 'svelte';

	import Header from '$lib/header/Header.svelte';
	import '../app.css';

	onMount(async () => {
		// setup some globals
		import('buffer').then((Buffer) => {
			global.Buffer = Buffer.Buffer;
		});
	});
```

Before we can use the Anchor RPC we need to set the provider

As we can see from [the code](https://github.com/project-serum/anchor/blob/master/ts/src/provider.ts#L20) we need 3 things to configure a provider:

1. A Solana connection, which we can get from [web3.js](https://solana-labs.github.io/solana-web3.js/)
2. A wallet, which we can get from anchor.Wallet(keypair) by passing in an airdrop funded keypair
3. Confirm options, which are, well, optional.

We can re-use some of the code setup for the deployment of our program code, which also used web3.js and the connection.

Our client code gets a bit beefier as we add the above features:

```js
// re-use the utilities from our deploy setup
import solConfigFile from "../../../deploy/solana-config.json";
import Solana from "../../../deploy/solana.js"
import keyfile from "../../../deploy/payer-keypair.json"

// get a Solana connection from our Devnet configuration
const networks = JSON.parse(fs.readFileSync(solConfigFile, 'utf8'));
let config = networks.development.config;
let solana = new Solana(config);
let connection = solana.connection

// convert the keyfile.json to a Keypair object
let keypair = Solana.getSigningAccount(keyfile)
const wallet = new anchor.Wallet(keypair)

```

Now we can use these factor to [generate an Anchor provider](https://github.com/project-serum/anchor/blob/master/ts/src/provider.ts#L20):

```js
    const opts = {
        preflightCommitment: "recent",
        commitment: "recent",
    };

    const provider = new Provider(connection, wallet, opts);
```

This is nice because when we switch our provider to "mainnet" for production, all of our connection code is already setup and ready to go. 

## Deploy to Devnet

To deploy the anchor program on devnet, we do need a small script to setup some keys, fund via airdrop, then use anchor deploy to deploy to the devnet.

This deploy code is saved to `./deploy.js` with a shortcut script in `package.json` which is convenienlty run by:

`npm run deploy`

The deploy script creates a new keypair to pay for the deployment for you, funds it with 10 SOL, and deploys it to the Devnet. 

When you run this code, you can see that Anchor has filled in our basic starting point with all the necessary glue to make a Solana program work, and now it's 149kb in size and costs about 2 SOL to deploy.

```
|
├── target
|   └── deploy
|           solblog.so   149kb
```

Now that the program is deployed to Solana Devnet, and we've place the client code inside our Svelte App, we can do a test run to make sure we've got everything right.

After entering `npm run dev` we can see of Initialization function executed in the console without any errors, so our client and program are talking! Now we can make our program more interesting and modify our client accordingly, knowing comfortably that everythig works at this point.

We've seen `anchor deploy`, when we want to update an existing deployed program, our `deploy.js` script will call `anchor upgrade` instead which should save us some deploy fees.

## Basic Blog

We are going to build a simple blog using Solana. Data in Solana is stored in accounts, and each account has a list of all the transactions made on that account.

So let's start by having Anchor make an account for us to save the blog data in, and then post a transaction to make out first post!

## Relating data to an account address

In our blog design we have one data storage account, and this account address that will hold the most recent blog post. To get previous transactions for this address, we need to first look up all signature for this address backwards in time. Luckily for us, the Solana javascript SDK has a feature for this

```ts
connection.getSignaturesForAddress(address: PublicKey, options?: SignaturesForAddressOptions, commitment?: Finality): Promise<ConfirmedSignatureInfo[]>)
```

Once we have the signatures, we can get the transaction details using a similar:

```ts
getTransaction(signature: string, opts?: { commitment?: Finality }): Promise<null | TransactionResponse>
```

From the transaction, we can get

BUT, there is an SPL (Solana Programming Library --  preprogrammed and deployed Programs we can use in our own program) called "memo program" that we can use to store 32 to 566 bytes of data associated with the transaction. To make a Twitter clone, we only need 140 bytes to store our 140 characters, so this could work for us! Plus gives us room to cover emojiis ;)

If we check out [the docs](https://solana-labs.github.io/solana-web3.js/modules.html#ConfirmedSignatureInfo), we can get memo details from `ConfirmedSignatureInfo` type of [a connection](https://github.com/solana-labs/solana-web3.js/blob/4883fed/src/connection.ts#L1949):

```ts
ConfirmedSignatureInfo: { blockTime?: number | null; err: TransactionError | null; memo: string | null; signature: string; slot: number }
```

So all we need to do is use 

1. The SPL Memo program [via [Cross-Program Invocations](https://docs.solana.com/developing/programming-model/calling-between-programs#cross-program-invocations), which we'll cover shortly], and 
2. Get the transaction for of each signature related to the account.
3. Read back the memo for each transaction 

So let's get coding!

## Invoking a CPI

We're going to save our simple blog posts using the [solana programming library memo program](https://spl.solana.com/memo). The program is saved to this address:

```
[MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr](https://explorer.solana.com/address/MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr) 
```

Taking a look at the Memo rust code tells us how we should go about interacting with it:

```rs
pub fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo], // <-------- Our signer account goes here
    input: &[u8],  // <------------------- Our memo goes here
) -> ProgramResult {

	// ...snip

	let memo = from_utf8(input).map_err(|err| { // <---- Our memo checked here
		// ...snip
    })?;
    msg!("Memo (len {}): {:?}", memo.len(), memo);   // <----- Our memo saved here

	// ...snip

```

So we need a 1) CPI and a 2) Signing account to hand to the Memo program.

We need to change our current library code from `initialize` to something more blog-like, such as `post` or `post_memo` or `make_post`. It can be whatever we like, let's go with `make_post` as that's pretty clear (verb and a noun)

