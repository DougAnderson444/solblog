<script>
	import Wallet from '$lib/Wallet.svelte';
	import { adapter, connected, anchorClient } from '$lib/stores';
	import frontmatter from '@github-docs/frontmatter';
	import Bio from '$lib/Bio.svelte';
	import MarkdownEditor from '$lib/MarkdownEditor.svelte';
	import { onMount, setContext } from 'svelte';
	import ListBlogs from '$lib/ListBlogs.svelte';
	import BlogDetails from '$lib/BlogDetails.svelte';

	setContext('DRAFT_KEY', 'BLOG_BIO');
	setContext('INITIAL', 'Bio:');

	let blogger = '';
	let mounted;
	let blogAccounts;
	let myBlogs;
	let newestAccounts;
	let bio = `---
Bio:
author: @
channel: 
website: 
---

Channel syncs info about...
`;
	onMount(() => {
		mounted = true;
	});

	const showMyBlogAccounts = async () => {
		// todo: check if valid
		myBlogs = await $anchorClient.getBlogAccounts($adapter.publicKey);
	};

	$: $anchorClient && showAllNewBlogs();
	$: $connected && $adapter?.publicKey && showMyBlogAccounts();

	const handleCreateBlog = async () => {
		let blogAccount = await $anchorClient.initialize(bio); // TODO: BlogAccount keypair needs a wallet...
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
	<h2>Search Blogosphere:</h2>

	<input class="new" placeholder="Solana PublicKey or @Twitter Handle" bind:value={blogger} />

	<ListBlogs {blogger} />

	{#if $connected}
		{#if myBlogs?.length > 0}
			<p>Your Blogs:</p>
			<ul>
				{#each myBlogs as blog}
					<li><a href="/blog/{blog}">{blog}</a></li>
				{/each}
			</ul>
		{/if}
		<div class="container">
			<div class="submit">
				<h2>New Blog:</h2>
				<div class="view">
					<MarkdownEditor bind:value={bio} />
				</div>

				<button on:click={handleCreateBlog}
					>Create {myBlogs?.length > 0 ? 'Another' : 'New'} Blog</button
				>
			</div>
		</div>
	{/if}
	<br />
	<h2>Other People's Blogs</h2>
	<div>Lastest SolBlog Activity:</div>
	<BlogDetails blogAccounts={newestAccounts} />
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
		height: 100%;
		margin: auto;
		text-align: end;
	}
</style>
