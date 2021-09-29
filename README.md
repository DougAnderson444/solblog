# SolBlog
<center>
<img src="tutorial-graphics\solblog.svg" width="90%" height="auto">
</center>

A simple blog platform, powered by Solana with a SvelteKit front end.

- [x] Solana (Rust)
- [x] Anchor (Rust macros + IDL generation)
- [x] Svelte & SvelteKit (JavaScript front end)

YouTube video on building the Rust portion:

<a href='https://youtu.be/w-n87Aq3f8k' target='_blank'>
<img src="tutorial-graphics\youtub.png" width="35%" height="auto">
</a>

## About

This tutorial will take you from zero to functional blog.

Building Solana programs in Rust language can be tough. Anytime you want to save or retrieve data from an account, you need to think about packing/unpacking the data, serializing/unserializing the data and formats, a real pain.

Anchor abstracts away from the low level construction of accounts, the packing and unpacking, and modifying the interfaces to your Solana program. It does this by bundling the boilerplate pack/unpack into rust macros! This gives the Anchor author a lot of shortcuts and speed to building Solana programs.

There are always two parts to a Solana app -- the *on-chain* program and accounts, and the *off-chain* app that interacts with it. The other benefit Anchor brings is the interaction between these two app segments is aligned by using an Interface Definition and Language (IDL). Since the interface of the off-chain app (say, in JavaScript) must always match the on-chain Solana program, this is a really nice convenience feature to have.

<div style="background-color: white;"></div>


<img src="tutorial-graphics\IDL.svg" width="90%" height="auto">

## Anchor Versions

It's important to understand that Anchor is new, and the API may change as development proceeds. These directions are valid now, but might differ in the future if/when there are breaking changes. But the general overall concepts remain unchanged.

I used v 0.16.1 for this tutorial.

```
$ anchor --version
anchor-cli 0.16.1
```

## A Simple Blog

In this tutotial, we will create a simple short form blog saved to the Solana program and accounts, to show you how to use Anchor.

## Setup

Getting started with Anchor is fairly straightforward, and you can follow the [setup instructions on the Anchor website](https://project-serum.github.io/anchor/getting-started/installation.html).

For test environments, you have the choice of [installing a local validator](https://docs.solana.com/developing/test-validator) or using the [Devnet online](https://explorer.solana.com/?cluster=devnet). We will be deploying to the Solana Devnet to practice deploying in real life. As the syaing goes, *"deploy early, deploy often"*! The last thing you want is for your code to work in a development environment, and not in production.

Once you have installed all the Anchor dependencies, it's time to initiate a project!

## Init an Anchor Project

Initiating a project is pretty straightforward. In the command line -- use Windows Subsystem for Linux 2 (WSL2) if you are on Windows, as the Rust toolchain doesn't work in regular Windows:

Don't make a new folder! Anchor will create a new one for you :)

```
anchor init solblog
```

This creates a folder and puts the anchor starter in that directory. From here, we can build out our app.

## Project folders

The folders we are interested in the most to start are:

```
|
├── programs
|   └── solblog
|        └── src
|             └── lib.rs
```

By default, Anchor has put some basic starting code in there for us.

```rust
// programs\solblog\src\lib.rs

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

<img src="tutorial-graphics\2RUST.svg" width="90%" height="auto">
After including the anchor library, the program public key has this placeholder:

```rust
declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");
```

That default key is NOT our public key for *your* build. You need to generate that for your program. We generate it once, and then include it, and can make as many changes as we need to before deploying.

Since that's not our key, let's fix that now and generate our key.

Run:

```
anchor build
```

As that builds (it'll take a minute), watch your target folder as it is pretty empty right now.

```
|
├── programs
|   └── solblog
|      └── src
|         └── lib.rs
├── target
|   └── rls
```

Watch how the target folder changes once build completes it is a bit beefier:

```
|
├── programs
|   └── solblog
|      └── src
|         └── lib.rs
├── target
|   └── idl
|   └── deploy
|           solblog.so
|           solblog-keypair.json
```

Our newly generated code public key is in that new .`/target/deploy` folder, go ahead and check it out! 

To show our program public key which we will use as out id, simply run:

```cli
// CLI
solana address -k ./target/deploy/solblog-keypair.json
```

Which shows us out unique key:

```
// CLI
// yours will look different, that's ok

$  SoMeKeyThatIsUniqueTOmyPROGRAM
```

If you're following along in this tutorial repo, I've placed a shortcut to this script in the `package.json` file, so you can simply run `npm run show-key` in the terminal (as long as it's WSL2/Linux --  the rust toolchain doen't work in Windows).

Copy-and=paste your key and replace that default `declare_id` placeholder:

```rust
declare_id!("SoMeKeyThatIsUniqueTOmyPROGRAM");
```

We will also need to include this same Program ID in the client side, in our `app\src\lib\anchorClient.js` 

```js
// app\src\lib\anchorClient.js

// programId is the program public key, SoMeKeyThatIsUniqueTOmyPROGRAM
const program = new anchor.Program(idl, programId, provider);
```

We will get to that part once we build the client side. My only poitn at this time is to emphasize that the client side in javascript must match the Program side in Rust.  For now, let's finish taking a look at the Rust code.

<img src="tutorial-graphics\program-block.svg" width="40%" height="auto">

The next code block under `#[program]` is our program's functions, how we make the program do anything. The function names here are lowercase snake_case.

<img src="tutorial-graphics\Accounts.svg" width="40%" height="auto">

Notice the `#[derive(Accounts)]` struct is the same name as in the `program`, but in `camelCase` (whereas `snake_case` is used in program above). 

The next code block under `#[derive(Accounts)]` is a going to be struct that describes the account itself and enables us to access fields from the account struct (which is non-existant at this point). Let's create it:


<img src="tutorial-graphics\AccountsRUST.svg" width="40%" height="auto">

```rs
#[account]
pub struct BlogAccount { 
    pub authority: Pubkey,    // save the posting authority to this authority field
    pub latest_post: Vec<u8>, // <-- where the latest blog post will be stored
}
```

We created the third style code block, which is an Account struct which is a Solana account that holds out data. We will save 2 pieces of data to this account: 

1. blog `authority`: you need to have this keypair in order to make posts,
2. `latest_post`: the, well, the lastest blog post. 

Now we have the three Anchor blocks we need to make out blog:

<img src="tutorial-graphics\3RUST.svg" width="100%" height="auto">

But right now out program doesn't do anything, because our program methods are empty.

### The `initialize()` function

In `initialize` we want to set our blog account `authority`. We will set `authority` to the same public key as the keys that signed the transaction. 

BUT, in order for us to have access to `authority` in `initialize()` we need:

1. BlogAccount must be a created account
3. BlogAccount must paid for by someone 
4. BlogAccount must have enough space allocated to store our data 
4. `initialize` must have access to the `authority` field on BlogAccount 
6. `authority` must sign the `initialize` tranaction request

Anchor makes this easy for us using their macros:

```rs
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init, // 1. Hey Anchor, initialize an account with these details for me
        payer = authority, // 2. See that authority Signer (pubkey) down there? They're paying for this 
        space = 8 // 3.A) all accounts need 8 bytes for the account discriminator prepended to the account
        + 32 // 3.B) authority: Pubkey needs 32 bytes
        + 566 // 3.C) latest_post: post bytes could need up to 566 bytes for the memo
        // You have to do this math yourself, there's no macro for this
    )]
    pub blog_account: Account<'info, BlogAccount>, // 1. <--- initialize this account variable & add it to Context.accounts.blog_account can now be used above in our initialize function
    pub authority: Signer<'info>, // 5. <--- let's name the account that signs this transaction "authority" and make it mutable so we can set the value to it in `initialize` function above
    pub system_program: Program<'info, System>, // <--- Anchor boilerplate
}
```

The `#[account]` macros in `#[derive(Accounts)]` wire up all the connections we need in order to use `blog_account` and `authority` in our `initilize` function. So now we can use `blog_account` and `authority` in our function:

```rs
#[program]
pub mod solblog {
    use super::*;
    pub fn initialize(
        ctx: Context<Initialize>, // <-- Anchor context that holds all the account data (structs) below
    ) -> ProgramResult { // <--- These functions are snake_case of the CamelCase struct below
        let b_p_a = &mut ctx.accounts.blog_account; // grab a mutable reference to our BlogAccount struct
        b_p_a.authority = *ctx.accounts.authority.key; // set the BlogAccount.authority to the pubkey of the authority
        Ok(()) // return the Result
    }
```
---

Once Anchor has helped us `initilize` our account and set the blog `authority` now we want to actually save some data to our BlogAccount. We follow similar steps:

First we create our Anchor glue by writing an additional `#[derive(Accounts)]` struct. Again, we want access to `blog_account` so we need to include that. We are changing `latest_post` so `blog_account` needs to be mutable, hence the `#[account(mut)]` but we also need for the transaction to be signed by the blogger, so it also needs to include `authority` as a `Signer`. The result looks like this:

```rs
#[derive(Accounts)]
pub struct MakePost<'info> {
    #[account(
        mut, // we can make changes to this account
        has_one = authority)] // the authority has signed this post, allowing it to happen
    // this is here again because it holds that .latest_post field where our post is saved
    pub blog_account: Account<'info, BlogAccount>, // <-- enable this account to also be used in the make_post function
    // Also put authority here
    // has_one = authority ensure it was provided as a function arg
    // ensures the poster has the keys
    // has to come after the Account statement above
    // no mut this time, because we don't change authority when we post
    pub authority: Signer<'info> 
}
```

Now that this Anchor struct has given us access to these fields, we can use them in the first code block under `#program`:

```rs
    pub fn make_post(
        ctx: Context<MakePost>, 
        new_post: Vec<u8> // <--- our blog post data
    ) -> ProgramResult {
        let post = from_utf8(&new_post) // convert the array of bytes into a string slice
            .map_err(|err| {
            msg!("Invalid UTF-8, from byte {}", err.valid_up_to());
            ProgramError::InvalidInstructionData
        })?;
        msg!(post); // msg!() is a Solana macro that prints string slices to the program log, which we can grab from the transaction block data

        let b_acc = &mut ctx.accounts.blog_account;
        b_acc.latest_post = new_post; // save the latest post in the account. 
        // past posts will be saved in transaction logs 
        
        Ok(())
    }
```

Our `make_post` function gets broken down in a few steps here:

First we take our `new_post` as an argument to the function:

```rs
new_post: Vec<u8> // <--- our blog post data
```

Our blog posts are going to be Strings, but we don't know how long these strings are going to be. Yes, we could pad them to a certain size, but a String is really just an array of bytes. In Rust we can describe our array of bytes as a Rust Vector of u8 bytes (`Vec<u8>`), because UTF8 strings are basically just [an array of u8 bytes](https://doc.rust-lang.org/std/string/struct.String.html#method.from_utf8). This will make our Rust life easier as we don't have to worry about unknown lengths in Rust, plus we can easily convert UTF8 strings to u8 arrays in javascript by using [UInt8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) type. So it's a `Vec<u8>`.

Next we take the `Vec<u8>` and convert it to a String slice (`&str`) with a bit of error handling included, in case we don't get valid UTF8:

```rs
let post = from_utf8(&new_post) // convert the array of bytes into a string slice
	.map_err(|err| {
	msg!("Invalid UTF-8, from byte {}", err.valid_up_to());
	ProgramError::InvalidInstructionData
})?;
```

Lastly, we print the blog post to the Program Log:

```rs
	msg!(post); // msg!() is a Solana macro that prints string slices to the program log, which we can grab from the transaction block data
```

The reason we print to the program log is: our BlogAccount only saves the latest post... so what if we want to see previous posts? We can simply pull up prevously saved logs and we'll have it. Alternatively we could create an Account for every post, but that's a lot of "costly" overhead for very little benefit, whereas asaving to the Program Log is "Transaction priced" ($0.00025) and we only need to pay for one account (which is super cheap, but why pay more?).

Lastly, we grab the `accounts` from the context (`ctx`) and pick `blog_account` as the one we're going to use (we only have one, but you could have had more) so we can also save the most recent post to the Account (`BlogAccount`):

```rs
	let b_acc = &mut ctx.accounts.blog_account;
	b_acc.latest_post = new_post; // save the latest post in the account. 
```

Our Rust Solana Program is complete, written in Rust! Now that we're done, we need to build again so that the Solana build uses our most recent code:

```
// in project root directory

anchor build
```

Make sure you run anchor build in your project's root folder, anchor will take care of the rest.

## Deploy to Devnet

Now that out Rust Program has been written with the help of Anchor, it's time to deploy to the Devnet.

To deploy the anchor program on devnet, a small helper script to setup some keys, fund via airdrop, then use anchor deploy to deploy to the devnet would sure be great. That's included with this tutorial!

For this tutorial, I borrow heavily from the auto-generated [`Decentology`](https://dappstarter.decentology.com/) DappStarter to generate the deploy code is saved at `./deploy.js`. You can run the script using `node` or use the shortcut script in `package.json` which is convenienlty run by:

	// CLI
	$ 	npm run deploy

	(or)

	$	node ./deploy.js

The deploy script creates a new keypair to pay for the deployment for you, funds it with some SOL, and deploys it to the Devnet. 

Since this tutorial is about Anchor, I'll gloss over some of the finer details in that `deploy.js` script, and jump straight to the juicy Anchor points, which are:

```js
// ./deploy.js

//... [snip]

method = ["deploy"]

//... [snip]

spawn.sync(
	"anchor",
	[
		...method,
		"--provider.cluster",
		"Devnet",
		"--provider.wallet",
		`${programAuthorityKeypairFile}`,
	],
	{ stdio: "inherit" }
)
```

This first run through, the deploy script uses `anchor deploy` whereas in subsequent deploys with the same program, it will use `anchor upgrade` with all the required flags included for convenience:

```js
// ./deploy.js

	method = [
		"upgrade",
		"target/deploy/solblog.so",
		"--program-id",
		programId,
	]

	//... [snip]
	
    spawn.sync(
        "anchor",
        [
            ...method,
	
	// ... etc

```

That is because on subsequent deploys, we want Anchor to upgrade our program using the same `programId` and program authority so everything except the code stays the same. This is important because we want our program address to stay the same so users don't have to change to a new address every time we upgrade our software. 

At the end, the `deploy.js` script will also save your keys to the dapp-starter style .json file for easy reference. But you'll see that I have also saved the keyfiles as `.json` bytes so they can be used by Anchor commands in the command line, since we use Anchor via CLI and not programmatically.

When you run this `deploy.js` code, you can see the result is that Anchor has filled in our basic starting point with all the necessary glue to make a Solana program work, and now it's compiled ready for the blockchain as a 149kb in size file, and real life deployment would costs about 2 SOL to deploy.

```
|
├── target
|   └── deploy
|       └── solblog.so   149kb
```

Now that the program is deployed to Solana Devnet, we can access it from the client code inside our Svelte App, and start blogging.

Let's build the client front end to interface with our program!

## Client Setup

Anchor is every bit about the client side as it is about the program side. Our program is complete and our IDL is built, so all that is left is for us to build a front end to use it all.

Although I have chosen to use Svelte for this, any front end can be used. We will put our anchor client code in a file named `anchorClient.js` which can be used by any framework or pure vanilla JS.

So I'll get straight to the `anchorClient.js` setup and then cover the SvelteKit integration for those who wish to stick around for that part. 

## Building our anchorClient

We have our IDL.json which describes how we use our app, but we need to build some handlers to call the remote procedure calls (RPCs).

### `initialize()`


In order to call out initialize function in our program, we first need an equivalent fuction in javascript. It looks like this:

```js
// anchorClient.js
// location: app\src\lib\anchorClient.js

import * as anchor from '@project-serum/anchor'; // includes https://solana-labs.github.io/solana-web3.js/
const { SystemProgram } = anchor.web3; // Added to initialize account

// .. [snip]

async initialize() {
	// generate an address (PublciKey) for this new account
	let blogAccount = anchor.web3.Keypair.generate(); // blogAccount is type Keypair 

	// Execute the RPC call
	const tx = await this.program.rpc.initialize({
		// Pass in all the accounts needed
		accounts: {
			blogAccount: blogAccount.publicKey, // publickey for our new account
			authority: this.provider.wallet.publicKey, // publickey of our anchor wallet provider
			systemProgram: SystemProgram.programId // just for Anchor reference
		},
		signers: [blogAccount] // blogAccount must sign this Tx, to prove we have the private key too
	});
	console.log(
		`Successfully intialized Blog ID: ${blogAccount.publicKey} for Blogger ${this.provider.wallet.publicKey}`
	);
	return blogAccount;
}

```

There are a few references to assets that we haven't coded in yet, like `this.program` but we'll make that in our setup constructor.

The RPC nature of Anchor means that all our functions are exposed through `program.rpc.<method name>`. So our make_post call looks very similar:

```js
// anchorClient.js
// location: app\src\lib\anchorClient.js

async makePost(post, blogAccountStr) {
	// convert our string to PublicKey type
	let blogAccount = new anchor.web3.PublicKey(blogAccountStr);

	const utf8encoded = Buffer.from(post); // anchor library doesn't like UInt8Array, so we use Nodejs buffer here

	// Execute the RPC.
	const tx = await this.program.rpc.makePost(
		// input must be compatible with UTF8 Vector in rust
		utf8encoded,
		// now pass the accounts in
		{
			accounts: {
				blogAccount: blogAccount, // needs to be the same publicKey as init, or it won't work
				authority: this.program.provider.wallet.publicKey // needs to be the same publicKey as init, or it won't work
			},
			signers: [this.program.provider.wallet.payer] // needs to be the same keyPAIR as init, or it won't work
		}
	);
	console.log(
		`Successfully posted ${post} to https://explorer.solana.com/address/${blogAccount}?cluster=devnet`
	);
	return tx;
}

```

In order for these calls to work, we need this `this.program` that you see used everywhere, so let's take care of that.

### Creating `program.*`

We create `program` using a call to the class constructor:

```js
// anchorClient.js
// location: app\src\lib\anchorClient.js
export default class AnchorClient {
	constructor({ programId, config, keypair } = {}) {
		this.programId = programId || getDevPgmId();
		this.config = config || solConfigFile.development.config;
		this.connection = new anchor.web3.Connection(this.config.httpUri, 'confirmed');
		console.log('\n\nConnected to', this.config.httpUri);

		const wallet =
			window.solana.isConnected && window.solana?.isPhantom
				? new WalletAdaptorPhantom()
				: keypair
				? new anchor.Wallet(keypair)
				: new anchor.Wallet(anchor.web3.Keypair.generate());
		// maps anchor calls to Phantom direction
		this.provider = new anchor.Provider(this.connection, wallet, opts);
		this.program = new anchor.Program(idl, this.programId, this.provider);
	}

```

Let's dissect what's going on here. 

In order to start up `anchor.program`, we need three things:

1. IDL
2. ProgramID, and
3. Wallet Provider

Our `IDL` (`json` file) is saved alongside our rust program at:

```
|
├── target
|   └── idl
|      └── solblog.json
```

In SvelteKit, which uses Vite, we can import the `json` into our code by simply doing:

```js
// anchorClient.js

// Read the generated IDL
import idl from '../../../target/idl/solblog.json';
```

If you're using a different framework for front end, you may need to change this. But for this tutorial, it works.

Second, our `programId` is the `publicKey` of our program keypair that we generated when we ran `anchor build`, remember that?

```
|
├── target
|   └── deploy
|           solblog-keypair.json
```

Similar to the previous `json` file, we can bring this `programId` into our code by importing it:

```js
// anchorClient.js

import solblog_keypair from '../../../target/deploy/solblog-keypair.json';

// ... [snip]

const getDevPgmId = () => {
	// get the program ID from the solblog-keyfile.json
	let pgmKeypair = anchor.web3.Keypair.fromSecretKey(new Uint8Array(solblog_keypair));
	return new anchor.web3.PublicKey(pgmKeypair.publicKey); // Address of the deployed program
};
```

When you want to use a `program` in production, instead of calling `getDevPgmId()` you would simply pass in the `programId` to the constructor.

Lastly, we need a Wallet `Provider`. Anchor gives us the option of making a provider using:

```js
new anchor.Provider(connection, wallet, opts);
```

Connection is straightforward enough, we just use the [Solana Web3 library](https://solana-labs.github.io/solana-web3.js/) (which is re-exported by Anchor) and pass in one of the Solana network endpoints, such as devnet:

```js
// anchorClient.js

connection = new anchor.web3.Connection("https://api.devnet.solana.com", 'confirmed');
```

For a `Wallet`, Anchor only provides a `Nodejs` wallet. But since we want our code to run in the browser, we either need to provide a `keypair` or a mapping to a wallet provider, such as Phantom wallet. For ease of simplicity, I chose Phantom Wallet for the wallet provider. `WalletAdaptorPhantom` simply maps the Phantom functions to what Anchor loosk for:

```js
// WalletAdaptorPhantom
// app\src\lib\helpers\wallet-adapter-phantom.ts

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

```

Which means making a wallet essentially becomes:

```js
// anchorClient.js
const wallet = new WalletAdaptorPhantom()
```

...with some fallback in case Phantom isn't the wallet of choice. The user has the option of passing in a keypair, or the code will generate a random keypair for use as a backup. In production, users will want to use a wallet such as Phantom, but in Dev mode we can use made up keys, because we can call `airDrop(publicKey)` to fund our accounts.

So now that we have a connection, and a wallet we get a provider, and with the provier we get a `program` rpc client, and we can make out calls. Phew!

The rest of the app integrates both `initialize` and `makePost` as well as `solana-web3.js` calls to interact with the program.  

## SvelteKit

After setup and focusing on the Anchor RPC and Solana-Web3.js portions of the client side code, we can see a bit of the Svelte Setup, which is pretty standard and easy from their website:

The Svelte [setup](https://kit.svelte.dev/docs#introduction-getting-started) is simply:

1. `$ npm init svelte@next ./app`
2. `$ cd app`
3. `$ npm install` (choose the full app defaults)

Now we can add our Anchor javascript code to feed our Svelte front end with Solana data for our blog!

To use anchor from javascript, we import the anchor library:

```
npm install @project-serum/anchor --save
```

There are a few gotchyas that you might run into while trying to use the solana or anchor libraries in client side browser code.

### Gotchya #1 - Buffer not defined

Since Anchor uses borsh, there is a small hack we need to add in order to get the Global varibale to work. In Svelte, if we paste something in our page layouts, it'll apply to all layouts, so we'll add our hack here to make things work with the imported Anchor library:

```js
// app\src\routes\__layout.svelte

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

### Gotchya #2 - import in onMount()

The other issue is the solana / anchor code is NOT isomorphic, which means it doesn't play equally nicely in Nodejs and the browser. The way to force front ends like Svelte to use the Browser version only (and skip the whole Server Side Rendering, or SSR) is to `import` in the browser side code, in Svelte's case, in onMount()

```js
// any file where you want solana libraries to work in the browser
	import { loadAnchorClient } from '$lib/helpers/utils';

	onMount(async () => {
		await loadAnchorClient();
  })

```

where 


```js
export const loadAnchorClient = async () => {
	let AnchorBlogLibrary = await import('$lib/anchorClient');
	anchorClient.update((_) => new AnchorBlogLibrary.default()); // establish our Solana connection & load our little library helpers
};

```

Embedding loading of our anchor Client into the Browser side ensires that the browser version of any non-isomorphic libraries gets loaded, and we don't get any nasty errors.

## Summary of Account Address Keypairs

There are a number of keypairs that are used throughout this whole process, and it can get a bit confusing:

1. ProgramId (saved in ./target/deploy/solblog-keypair.json)
2. Program's authority: Pays to deploy and upgrade the program. it's the wallet provider (program.wallet.publicKey)
3. Transaction fee payers (can be the same as the program authority, though it could be different too)
4. The blog posting authority (often the same as payer & authority)
5. The Blog Account (key is used as address only, the programId actually OWNS this account. Once initialized, the private key is useless because the account is owned by the programId and only the programId can edit the account)

Recall that ProgramId is created during the first `anchor build` 

Program upgrade authority keys are creates and funded during the first deploy call `npm run deploy` in `deploy.js`

The BlogAccount key is created on the fly during intilization, but if there was a reason you wanted to pick your key, it *could* be passed in, but that's pretty extra.

## Running the App

In the end, navigating to `./app` and running `npm run dev` will start up the Svelte App and get you to the home screen.

```
  // CLI

  $ npm run dev

```

Open up your browser to `http://localhost:3000` and play around!