<script>
	//lang="ts"
	import { onMount } from 'svelte';

	import { adapter, connected, selectedNetwork, anchorClient } from '$lib/stores';
	import { DEV_NET } from '$lib/constants.js';

	import { phantomConnect } from '$lib/helpers/wallet';
	import { loadAnchorClient } from '$lib/helpers/utils';

	let mounted;
	let balance;
	let promise;
	let disconnected = false;

	$: shortKey =
		$connected &&
		$adapter.publicKey.toString().slice(0, 5) +
			'...' +
			$adapter.publicKey
				.toString()
				.slice($adapter.publicKey.toString().length - 4, $adapter.publicKey.toString().length - 1);

	$: buttonLabel =
		!$connected && promise != null
			? 'Connecting...'
			: $adapter?.publicKey
			? 'Connected to ' + shortKey
			: 'Connect';

	onMount(async () => {
		await loadAnchorClient();
		if (!disconnected) await phantomConnect({ onlyIfTrusted: true }); // try to eagerly connect only if previously authorized
		mounted = true;
	});

	const handleDisconnect = () => {
		promise = null;
		disconnected = true; // otherwise this app tends to reconnectin onMount?
		$adapter.disconnect(); // calls window.solana.disconnect() which triggers adapter.update in wallet.ts
	};

	const handleConnect = () => {
		// first time style connect, blank options
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
		await $anchorClient.airDrop($adapter.publicKey);
		getConnectedBalance(); // refresh balance
	};
	const getConnectedBalance = async () => {
		console.log('Connected. Getting balance', $adapter.publicKey.toString());

		$anchorClient.getBalance($adapter.publicKey).then((bal) => {
			if (typeof bal == 'number') balance = bal;
		});
	};

	$: mounted && $connected && getConnectedBalance(); // refresh balance
</script>

{#if !$connected}
	<button class={promise ? 'yellow' : 'red'} on:click|preventDefault={handleConnect}>
		{buttonLabel}
	</button>
{/if}
{#if $connected}
	<button class="green" on:click|preventDefault={handleDisconnect}>
		Disconnect from {shortKey}</button
	>
	{#if $adapter && $selectedNetwork == DEV_NET}<div class="status">
			{#if typeof balance == 'number'}
				<a
					href="https://explorer.solana.com/address/{$adapter.publicKey}?cluster={$selectedNetwork}"
					target="_blank"
				>
					Balance</a
				>: {(balance / 1000000000).toFixed(5)} SOL
				{#if balance < 50000000}
					<br />
					<button class="drop" on:click|preventDefault={drop}> AirDrop some SOL on DevNet </button>
				{/if}
			{/if}
		</div>
	{/if}
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
		margin-top: 0.5em;
		margin-bottom: 1em;
		border-radius: 2px;
		filter: drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.1));
	}
</style>
