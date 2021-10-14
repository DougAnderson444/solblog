<script context="module">
	export async function load({ page, fetch }) {
		const slug = page.params.slug;
		// let response = await fetch(`${slug}.json`); // uses [slug].json.js to fetch
		// let posts = await response.json();
		return {
			props: { blogId: slug }
		};
	}
</script>

<script>
	import { scale } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	import Wallet from '$lib/Wallet.svelte';
	import MarkdownEditor from '$lib/MarkdownEditor.svelte';
	import marked from 'marked';
	import { loadAnchorClient } from '$lib/helpers/utils';

	import { selectedNetwork, anchorClient, connected, adapter } from '$lib/stores';
	import Bio from '$lib/Bio.svelte';
	import { onMount, setContext } from 'svelte';
	import { goto, prefetch } from '$app/navigation';

	setContext('DRAFT_KEY', '__DRAFT_BLOG_POST');
	setContext('INITIAL', `# Blog Title\nGo ahead, make a post! You can use markdown too `);

	// post will have metadata and content
	export let posts;
	export let blogId;

	let value; // the blog post value we send to Solana

	let handleSubmitPost;
	let preview = false;
	let newPost;
	let postDeets;
	let blogger;

	let showBlogger;
	let assertOwnsBlog;

	let mounted;
	let postDetails;
	let ownsBlog;
	let mde;

	$: blogId && showBlogger && showBlogger();
	$: $connected && blogId && assertOwnsBlog && assertOwnsBlog();

	onMount(async () => {
		await loadAnchorClient();

		postDetails = await $anchorClient.getLastPosts(blogId);

		// apply markdown parser to the content
		postDetails.forEach((post, index) => {
			post.content.forEach((contentPiece, i) => {
				postDetails[index].content[i] = marked(contentPiece);
			});
		});
		posts = postDetails;

		handleSubmitPost = async () => {
			console.log($anchorClient);
			const signature = await $anchorClient.makePost(value, blogId);
			console.log({ signature });
			postDetails.unshift({ content: [marked(value)], signature });
			value = '# New Post';
			posts = [...postDetails];
			mde.externalUpdate;
		};

		assertOwnsBlog = async () => {
			// check if wallet connected owns this blog (if so, show Post editor)
			let blogAccounts = await $anchorClient.getBlogAccounts($adapter.publicKey);
			if (blogAccounts.includes(blogId)) ownsBlog = true;
		};

		showBlogger = async () => {
			try {
				$anchorClient.getBlogAuthority(blogId).then((b) => {
					blogger = b;
				});
			} catch (error) {
				blogger = 'Blogger does not have an active SolBlog.';
			}
		};

		mounted = true;
	});

	const handleClear = () => {
		console.log('hanlding clear', { mde });
		mde.externalUpdate;
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
	<h1>Solana Blog</h1>
	<center>
		{#if blogger}
			<h3>
				Blogger:
				<a href="../blogger/{blogger}" sveltekit:prefetch>{blogger} </a>
			</h3>{/if}
		<h3>
			Blog ID:
			<a
				href="https://explorer.solana.com/address/{blogId}?cluster={$selectedNetwork}"
				target="_blank"
				>{blogId}
			</a>
		</h3>
		<Bio {blogId} />
	</center>
	{#if $connected && ownsBlog}
		<div transition:slide={{ delay: 100, duration: 400, easing: quintOut }}>
			<MarkdownEditor bind:value bind:this={mde} />

			<input name="post" aria-label="Add blog post" bind:value hidden />

			{#if value && preview}
				<div class="view" transition:slide={{ delay: 100, duration: 700, easing: quintOut }}>
					{@html marked(value)}
				</div>
			{/if}

			<div class="submit">
				<label for="preview">
					<input type="checkbox" bind:checked={preview} /> Preview Final
				</label>
				<button on:click|preventDefault={mde.externalUpdate}>Clear</button>
				<button on:click|preventDefault={handleSubmitPost}>Post</button>
			</div>
		</div>
	{/if}
	{#if posts}
		{#each posts as post (post.signature)}
			<div class="view" transition:scale|local={{ start: 0.7 }} animate:flip={{ duration: 200 }}>
				{@html post.content[post.content.length - 1]}

				<button class="explore" aria-label="Save post" />
				<div class="minifootr">
					<div class="timestamp">{post.timestamp}</div>
					<div>
						<a
							href="https://explorer.solana.com/tx/{post.signature}?cluster={$selectedNetwork}"
							target="_blank"
						>
							View in Solana Explorer
						</a>
					</div>
				</div>
			</div>
		{/each}
	{/if}
</div>

<style>
	.timestamp {
		font-size: 0.65em;
		color: rgba(97, 97, 97, 0.797);
	}
	header,
	.minifootr {
		display: flex;
		justify-content: space-between;
	}

	.corner {
		width: 100%;
		height: 100%;
		margin: auto;
		text-align: end;
	}
	.view {
		background-color: white;
		border-radius: 8px;
		filter: drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.1));
		transform: translate(-1px, -1px);
		margin: 0 0 0.5rem 0;
		padding: 0.5rem;
	}
	.submit {
		display: flex;
		margin-bottom: 2em;
	}
	label {
		display: block;
		padding-left: 15px;
		text-indent: -15px;
	}

	input {
		width: 15px;
		height: 15px;
		padding: 0;
		margin: 0;
		vertical-align: bottom;
		position: relative;
		top: -1px;
	}

	.blog {
		width: 100%;
		max-width: var(--column-width);
		margin: var(--column-margin-top) auto 0 auto;
		line-height: 1;
	}

	input {
		border: 1px solid transparent;
	}

	input:focus-visible {
		box-shadow: inset 1px 1px 6px rgba(0, 0, 0, 0.1);
		border: 1px solid #ff3e00 !important;
		outline: none;
	}

	.explore {
		position: absolute;
		right: 0;
		opacity: 0;
		background-image: url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20.5 2H3.5C2.67158 2 2 2.67157 2 3.5V20.5C2 21.3284 2.67158 22 3.5 22H20.5C21.3284 22 22 21.3284 22 20.5V3.5C22 2.67157 21.3284 2 20.5 2Z' fill='%23676778' stroke='%23676778' stroke-width='1.5' stroke-linejoin='round'/%3E%3Cpath d='M17 2V11H7.5V2H17Z' fill='white' stroke='white' stroke-width='1.5' stroke-linejoin='round'/%3E%3Cpath d='M13.5 5.5V7.5' stroke='%23676778' stroke-width='1.5' stroke-linecap='round'/%3E%3Cpath d='M5.99844 2H18.4992' stroke='%23676778' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E%0A");
	}
</style>
