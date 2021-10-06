<script>
	import { onMount } from 'svelte';
	import Wallet from '$lib/Wallet.svelte';
	import { adapter, connected, anchorClient } from '$lib/stores';

	let blogger; // = 'F3wbx9hv8zJTR9aQcpCyLQ9UMrq32DPXsEA8DwxUQxMm';
	let mounted;
	let blogAccounts;
	let myBlogs;
	let newestAccounts;

	onMount(() => {
		mounted = true;
	});

	const showMyBlogAccounts = async () => {
		// todo: check if valid
		myBlogs = await $anchorClient.getBlogAccounts($adapter.publicKey);
	};

	const showBloggerAccounts = async () => {
		if (blogger.length < 44) {
			// check naming service
			const { getTwitterRegistry } = await import('$lib/helpers/utils'); // https://github.com/solana-labs/solana-program-library/blob/3e945798fc70e111b131622c1185385c222610fd/name-service/js/src/twitter.ts#L217
			blogger = await getTwitterRegistry(blogger);
		}

		// todo: check if valid
		blogAccounts = await $anchorClient.getBlogAccounts(blogger);
	};

	$: blogger && $anchorClient && showBloggerAccounts();
	$: $anchorClient && showAllNewBlogs();
	$: $connected && $adapter?.publicKey && showMyBlogAccounts();

	const handleCreateBlog = async () => {
		let blogAccount = await $anchorClient.initialize();
		console.log($anchorClient, blogAccount);
		// @ts-ignore
		window.location = '/blog/' + blogAccount.publicKey.toString();
	};

	const showAllNewBlogs = async () => {
		console.log('Showing new blogs on ', $anchorClient.programId.toString());
		newestAccounts = await $anchorClient.getBlogAccounts($anchorClient.programId);
	};
</script>

<svelte:head>
	<title>Solana Blog</title>
</svelte:head>
<header>
	<div class="corner" id="left-corner" />
	<div class="corner">
		{#if mounted}
			<Wallet />
		{/if}
	</div>
</header>

<div class="blog">
	<h1>Load a blogger:</h1>
	<input class="new" placeholder="Solana PublicKey or @Twitter Handle" bind:value={blogger} />
	<div class="submit">
		<button on:click={showBloggerAccounts}>Show Blogs</button>
	</div>
	{#if blogAccounts}
		<!-- Show all (blog) accounts for this key -->
		<!-- We have cross referenced all accounts owned by this program
		which were paid for by the key or authority == key-->
		{#if blogAccounts?.length > 0}
			<ul>
				{#each blogAccounts as blogAccount}
					<li><a href="/blog/{blogAccount}">{blogAccount}</a></li>
				{/each}
			</ul>
		{/if}<br />
	{:else if blogger}
		No blogs written by {blogger}
	{/if}

	{#if $connected}
		<p>Your Blogs:</p>
		{#if myBlogs?.length > 0}
			<ul>
				{#each myBlogs as blog}
					<li><a href="/blog/{blog}">{blog}</a></li>
				{/each}
			</ul>
		{:else}
			No blogs. Create one!
		{/if}
		<div class="container">
			<div class="submit">
				<button on:click={handleCreateBlog}
					>Create {myBlogs?.length > 0 ? 'Another' : ''} New Blog</button
				>
			</div>
		</div>
	{:else}
		<p>Create a Blog by connecting your Solana Wallet</p>
	{/if}

	<div>Lastest SolBlog Activity:</div>
	{#if newestAccounts}
		{#if newestAccounts?.length > 0}
			<ul>
				{#each newestAccounts as account}
					<li><a href="/blog/{account}">{account}</a></li>
				{/each}
			</ul>
		{/if}<br />
	{/if}
</div>

<style>
	.submit {
		margin: 1em auto;
	}
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

	input.new {
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

	header {
		display: flex;
		justify-content: space-between;
	}

	.corner {
		width: 100%;
		height: 4em;
		margin: auto;
		text-align: end;
	}
</style>
