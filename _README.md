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
import idl from '../target/idl/basic_1.json';

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

To deploy the anchor program on devnet, we do need a small script to setup some keys, fund via airdrop, then use anchor deploy to deploy to the devnet.



simply do:

```
anchor deploy --
```

## Basic Blog

We are going to build a simple blog using Solana. Data in Solana is stored in accounts, and each account has a list of all the transactions made on that account.

So let's start by having Anchor make an account for us to save the blog data in, and then post a transaction to make out first post!

## Creating an account

