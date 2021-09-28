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
	import { onMount } from 'svelte';
	import { scale } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	import Wallet from '$lib/Wallet.svelte';
	import MarkdownEditor from '$lib/MarkdownEditor.svelte';
	import marked from 'marked';
	import { loadAnchorClient } from '$lib/helpers/utils';

	import { selectedNetwork, anchorClient, connected } from '$lib/stores';

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

	let mounted;

	$: blogId && showBlogger && showBlogger();

	onMount(async () => {
		await loadAnchorClient();

		let postDetails = await $anchorClient.getLastPosts(blogId);

		// apply markdown parser to the content
		postDetails.forEach((post, index) => {
			postDetails[index].content.forEach((contentPiece, i) => {
				postDetails[index].content[i] = marked(contentPiece);
			});
		});
		posts = postDetails;

		handleSubmitPost = async () => {
			console.log($anchorClient);
			postDeets = await $anchorClient.makePost(value, blogId);
			// TODO: slide this new one in
		};
		showBlogger = async () => {
			$anchorClient.getBlogAuthority(blogId).then((b) => (blogger = b));
		};
		mounted = true;
	});
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
	{#if blogger}
		<h2>
			Blogger:
			<a
				href="https://explorer.solana.com/address/{blogger}?cluster={$selectedNetwork}"
				target="_blank"
				>{blogger}
			</a>
		</h2>{/if}
	<h2>
		Blog ID:
		<a
			href="https://explorer.solana.com/address/{blogId}?cluster={$selectedNetwork}"
			target="_blank"
			>{blogId}
		</a>
	</h2>
	<MarkdownEditor bind:value />

	<input
		name="post"
		aria-label="Add blog post"
		placeholder="+ tap to blog on-chain with Solana"
		bind:value
		hidden
	/>

	{#if preview}
		<div class="view" transition:slide={{ delay: 100, duration: 400, easing: quintOut }}>
			{@html value && marked(value)}
		</div>
	{/if}

	<div class="submit">
		<label for="preview">
			<input type="checkbox" bind:checked={preview} /> Preview Final
		</label>
		{#if $connected}
			<button on:click|preventDefault={handleSubmitPost}>Post</button>
		{:else if mounted}
			<Wallet />
		{/if}
	</div>

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
	.right {
		text-align: right;
	}
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
		height: 4em;
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

	.new {
		margin: 0 0 0.5rem 0;
	}

	input {
		border: 1px solid transparent;
	}

	input:focus-visible {
		box-shadow: inset 1px 1px 6px rgba(0, 0, 0, 0.1);
		border: 1px solid #ff3e00 !important;
		outline: none;
	}

	.new input {
		font-size: 28px;
		padding: 0.5em 1em 0.3em 1em;
		margin: 0 0.25em;
		box-sizing: border-box;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 8px;
		text-align: center;
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

	.new-window {
		background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciICB3aWR0aD0iMjQiIGhlaWdodD0iMjQiICB2aWV3Qm94PScwIDAgNjUgNjknIG92ZXJmbG93PSJoaWRkZW4iPjxkZWZzPjxjbGlwUGF0aCBpZD0iYSI+PHBhdGggZD0iTTIxNDMgMTk1OWg2NXY2OWgtNjV6Ii8+PC9jbGlwUGF0aD48L2RlZnM+PGcgY2xpcC1wYXRoPSJ1cmwoI2EpIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjE0MyAtMTk1OSkiPjxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0QwQ0VDRSIgc3Ryb2tlLW1pdGVybGltaXQ9IjgiIHN0cm9rZS13aWR0aD0iOCIgZD0iTTIxNjQgMTk5N2gtMTZ2MjZsMjgtM3YtMTIiLz48cGF0aCBmaWxsPSIjRDBDRUNFIiBkPSJtMjE2MiAyMDEzIDIwLTIzLTQtMy0xOSAyM1ptMjItMTYgNS0xOS0xOSA4WiIvPjwvZz48L3N2Zz4=');
	}

	.new-window:hover,
	.new-window:focus {
		transition: opacity 0.2s;
		opacity: 1;
	}

	.explore {
		position: absolute;
		right: 0;
		opacity: 0;
		background-image: url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20.5 2H3.5C2.67158 2 2 2.67157 2 3.5V20.5C2 21.3284 2.67158 22 3.5 22H20.5C21.3284 22 22 21.3284 22 20.5V3.5C22 2.67157 21.3284 2 20.5 2Z' fill='%23676778' stroke='%23676778' stroke-width='1.5' stroke-linejoin='round'/%3E%3Cpath d='M17 2V11H7.5V2H17Z' fill='white' stroke='white' stroke-width='1.5' stroke-linejoin='round'/%3E%3Cpath d='M13.5 5.5V7.5' stroke='%23676778' stroke-width='1.5' stroke-linecap='round'/%3E%3Cpath d='M5.99844 2H18.4992' stroke='%23676778' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E%0A");
	}

	.post input:focus + .explore,
	.explore:focus {
		transition: opacity 0.2s;
		opacity: 1;
	}
</style>
