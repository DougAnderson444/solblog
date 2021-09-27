<script>
	//lang="ts"
	import { onMount } from 'svelte';

	import { adapter, connected, selectedNetwork, selectedWallet } from '$lib/stores';
	import { MAIN_NET, DEV_NET, APP_WALLET } from '$lib/constants.js';

	import { phantomConnect } from '$lib/helpers/wallet';

	import { airDrop, getBalance } from '$lib/anchor';

	let mounted;
	let balance;

	onMount(() => {
		mounted = true;
	});

	let promise;

	const handleDisconnect = () => {
		promise = null;
		adapter.update(() => undefined);
	};

	const handleConnect = () => {
		promise = phantomConnect().then(() => {
			promise = null;
		});
	};

	const getProvider = () => {
		if ('solana' in window) {
			// @ts-ignore
			const provider = window.solana;
			if (provider.isPhantom) {
				return provider;
			}
		}
		window.open('https://phantom.app/', '_blank');
	};
	const drop = async () => {
		await airDrop($adapter.publicKey);
		getConnectedBalance(); // refresh balance
	};
	const getConnectedBalance = async () => {
		console.log('Connected. Getting balance', $adapter.publicKey.toString());

		getBalance($adapter.publicKey).then((bal) => {
			if (typeof bal == 'number') balance = bal;
		});
	};

	$: mounted && $connected && getConnectedBalance(); // refresh balance
	$: connectionStatus = `${$connected ? '' : 'Not'} Connected`;
</script>

<!-- {#if !$connected}
	<select class="fancy-dropdown" bind:value={$selectedWallet}>
		<option value={!APP_WALLET} selected={$selectedWallet != APP_WALLET}>Local Keypair</option>
		<option value={APP_WALLET} selected={$selectedWallet == APP_WALLET}>Connect Wallet</option>
	</select>
{/if} -->

{#if !$connected}
	<button class={promise ? 'yellow' : 'red'} on:click|preventDefault={handleConnect}>
		Connect
	</button>
{/if}
<br />
{#if !$connected && promise != null}
	{#await promise}
		<p>Connecting...</p>
	{:then _pubkey}
		<p style="color: green">Connected to {$adapter && $adapter.publicKey}</p>
	{:catch error}
		<p style="color: red">{error}</p>
	{/await}
{/if}

{#if $connected}
	<button class="green" on:click|preventDefault={handleDisconnect}> Disconnect </button>
{/if}
<div class="status">{connectionStatus}</div>
{#if $adapter && $selectedNetwork == DEV_NET && $connected}<div class="status">
		{#if typeof balance == 'number'}
			<a
				href="https://explorer.solana.com/address/{$adapter.publicKey}?cluster={$selectedNetwork}"
				target="_blank"
			>
				Balance</a
			>: {(balance / 1000000000).toFixed(5)} SOL
			{#if balance < 50000000}
				<button class="drop" on:click|preventDefault={drop}> AirDrop some SOL on DevNet </button>
			{/if}
		{/if}
	</div>
{/if}

<style>
	.status {
		margin: 0.5em;
	}
	button.drop {
		background-color: rgb(5, 163, 202);
	}

	button.green {
		background-color: #4caf50;
	}
	button.yellow {
		background-color: rgb(230, 208, 10);
	}
	button.red {
		background-color: rgb(156, 28, 28);
	}

	button {
		border: none;
		color: white;
		padding: 15px 32px;
		text-align: center;
		text-decoration: none;
		display: inline-block;
		font-size: 16px;
		margin-left: auto;
		border-radius: 2px;
		filter: drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.1));
	}
</style>
