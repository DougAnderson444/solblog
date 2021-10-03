<script>
	import { onMount } from 'svelte';
	import Wallet from '$lib/Wallet.svelte';
	import { adapter, connected, anchorClient } from '$lib/stores';

	let provider; // wallet provider (ie. Phantom)

	let blogId = 'Cbo5KxuZ6v2AvAPZKrEXJPnmKzjSyGbNBevNQyk47coh';
	let mounted;
	let blogAccounts;

	onMount(() => {
		mounted = true;
	});

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
			placeholder="Cbo5KxuZ6v2AvAPZKrEXJPnmKzjSyGbNBevNQyk47coh"
			bind:value={blogId}
		/>
		<div class="submit">
			<button>GO</button>
		</div>
	</form>

	<h1>Blogs Linked to Key</h1>
	<p>1) Show or make blogs linked to your Public Key:</p>
	{#if mounted}
		<Wallet />
	{/if}
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
</style>
