<script>
	import { onMount } from 'svelte';
	import Wallet from '$lib/Wallet.svelte';
	import { adapter, connected, anchorClient } from '$lib/stores';

	let provider; // wallet provider (ie. Phantom)

	let blogId = 'FxfJzcXQVfHhPkudanTRuxCi9bda1XoDockbxYL8Hndm';

	let blogAccounts;

	onMount(() => {});

	const showBloggerAccounts = async () => {
		blogAccounts = await $anchorClient.getBlogAccounts($adapter.publicKey);
	};

	$: $connected && $anchorClient && showBloggerAccounts();

	const handleCreateBlog = async () => {
		let blogAccount = await $anchorClient.initialize();
		console.log($anchorClient, blogAccount);
		// @ts-ignore
		window.location = '/blog/' + blogAccount.publicKey.toString();
	};
</script>

<svelte:head>
	<title>Solana Blog</title>
</svelte:head>

<div class="blog">
	<form class="new" action="/blog/{blogId}">
		<h1>Go to existing blogger or blog:</h1>
		<input
			class="new"
			placeholder="FxfJzcXQVfHhPkudanTRuxCi9bda1XoDockbxYL8Hndm"
			bind:value={blogId}
		/>
		<div class="submit">
			<!-- <label for="preview">
				<input type="checkbox" id="preview" />Option
			</label> -->
			<!-- {value} -->
			<button>GO</button>
		</div>
	</form>

	<h1>Blogs Linked to Key</h1>
	<p>1) Show or make blogs linked to your Public Key:</p>
	<Wallet />
	{#if $connected}
		<!-- Lookup all (blog) accounts for this key -->
		<!-- We need to cross reference all accounts owned by this program
		which were paid for by the key or authority == key


		-->{#if blogAccounts?.length > 0}
			<ul>
				{#each blogAccounts as blogAccount}
					<li><a href="/blog/{blogAccount}">{blogAccount}</a></li>
				{/each}
			</ul>
		{/if}
		<div class="submit">
			<!-- <label for="preview">
				<input type="checkbox" id="preview" />
			</label> -->
			<!-- {value} -->
			<button on:click={handleCreateBlog}>Create New Blog Account</button>
		</div>
	{/if}
	<!-- form > .submit > button { -->
</div>

<style>
	.blog {
		width: 100%;
		max-width: var(--column-width);
		margin: var(--column-margin-top) auto 0 auto;
		line-height: 1;
	}

	.new {
		margin: 0 0 0.5rem 0;
	}

	input {
		border: 1px solid transparent;
	}

	input:focus-visible {
		box-shadow: inset 1px 1px 6px rgba(0, 0, 0, 0.1);
		border: 1px solid rgba(51, 161, 0, 0.658) !important;
		outline: none;
	}

	.new input {
		font-size: 1.5em;
		width: 100%;
		padding: 0.5em 1em 0.3em 1em;
		box-sizing: border-box;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 8px;
		text-align: center;
		border: 1px solid #b0b9ac !important;
		box-shadow: inset 1px 1px 6px rgba(0, 0, 0, 0.1);
	}

	.post {
		display: grid;
		grid-template-columns: 2rem 1fr 2rem;
		grid-gap: 0.5rem;
		align-items: center;
		margin: 0 0 0.5rem 0;
		padding: 0.5rem;
		background-color: white;
		border-radius: 8px;
		filter: drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.1));
		transform: translate(-1px, -1px);
		transition: filter 0.2s, transform 0.2s;
	}

	.read {
		transform: none;
		opacity: 0.4;
		filter: drop-shadow(0px 0px 1px rgba(0, 0, 0, 0.1));
	}

	form.text {
		position: relative;
		display: flex;
		align-items: center;
		flex: 1;
	}

	.post input {
		flex: 1;
		padding: 0.5em 2em 0.5em 0.8em;
		border-radius: 3px;
	}

	.post button {
		width: 2em;
		height: 2em;
		border: none;
		background-color: transparent;
		background-position: 50% 50%;
		background-repeat: no-repeat;
	}

	button.toggle {
		border: 1px solid rgba(0, 0, 0, 0.2);
		border-radius: 50%;
		box-sizing: border-box;
		background-size: 1em auto;
	}

	.read .toggle {
		background-image: url("data:image/svg+xml,%3Csvg width='22' height='16' viewBox='0 0 22 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20.5 1.5L7.4375 14.5L1.5 8.5909' stroke='%23676778' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
	}

	.delete {
		background-image: url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4.5 5V22H19.5V5H4.5Z' fill='%23676778' stroke='%23676778' stroke-width='1.5' stroke-linejoin='round'/%3E%3Cpath d='M10 10V16.5' stroke='white' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M14 10V16.5' stroke='white' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M2 5H22' stroke='%23676778' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M8 5L9.6445 2H14.3885L16 5H8Z' fill='%23676778' stroke='%23676778' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E%0A");
		opacity: 0.2;
	}

	.delete:hover,
	.delete:focus {
		transition: opacity 0.2s;
		opacity: 1;
	}

	.save {
		position: absolute;
		right: 0;
		opacity: 0;
		background-image: url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20.5 2H3.5C2.67158 2 2 2.67157 2 3.5V20.5C2 21.3284 2.67158 22 3.5 22H20.5C21.3284 22 22 21.3284 22 20.5V3.5C22 2.67157 21.3284 2 20.5 2Z' fill='%23676778' stroke='%23676778' stroke-width='1.5' stroke-linejoin='round'/%3E%3Cpath d='M17 2V11H7.5V2H17Z' fill='white' stroke='white' stroke-width='1.5' stroke-linejoin='round'/%3E%3Cpath d='M13.5 5.5V7.5' stroke='%23676778' stroke-width='1.5' stroke-linecap='round'/%3E%3Cpath d='M5.99844 2H18.4992' stroke='%23676778' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E%0A");
	}

	.post input:focus + .save,
	.save:focus {
		transition: opacity 0.2s;
		opacity: 1;
	}
</style>
