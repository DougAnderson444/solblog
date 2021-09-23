<script context="module">
	import { enhance } from '$lib/form';

	export async function load({ page, fetch }) {
		const slug = page.params.slug;
		let response = await fetch(`${slug}.json`);
		let posts = await response.json();
		return {
			props: { posts, blogId: slug }
		};
	}
</script>

<script>
	import { onMount } from 'svelte';
	import { scale } from 'svelte/transition';
	import { flip } from 'svelte/animate';

	import marked from 'marked';
	// post will have metadata and content
	export let posts;
	export let blogId;

	let anchor;
	let initialize;
	let makePost;
	let content;

	onMount(async () => {
		anchor = await import('$lib/anchor.js');

		initialize = async () => {
			await anchor.initialize();
		};

		makePost = async () => {
			await anchor.makePost(
				'a new blog post 💖 at ' + new Date(Date.now()).toLocaleString('en-GB')
			);
		};
	});

	async function patch(res) {
		const post = await res.json();

		posts = posts.map((t) => {
			if (t.signature === post.signature) return post;
			return t;
		});
	}

	$: posts && test();
	function test() {
		content = marked('# Marked in Node.js\n\nRendered by **marked**.');
	}
</script>

<svelte:head>
	<title>Solana Blog</title>
</svelte:head>

<!--show the posts html with @html-->
{#if posts}
	Posts<br />
	{#each posts as post}
		{post.timestamp}<br />
		{@html post.content[1]}<br />
	{/each}
{:else}
	No posts?
{/if}

{#if content}
	{@html content}
{:else}No content
{/if}

<div class="blog">
	<h1>Solana Blog</h1>

	<form
		class="new"
		action="/blog.json"
		method="post"
		use:enhance={{
			result: async (res, form) => {
				const created = await res.json();
				posts = [...posts, created];

				form.reset();
			}
		}}
	>
		<input
			name="post"
			aria-label="Add blog post"
			placeholder="+ tap to blog on-chain with Solana"
		/>
	</form>

	{#each posts as post (post.signature)}
		<div
			class="post"
			class:read={post.read}
			transition:scale|local={{ start: 0.7 }}
			animate:flip={{ duration: 200 }}
		>
			<form
				action="/blog/{blogId}.json?_method=patch"
				method="post"
				use:enhance={{
					pending: (data) => {
						post.read = !!data.get('read');
					},
					result: patch
				}}
			>
				<input type="hidden" name="read" value={post.read ? '' : 'true'} />
				<button class="toggle" aria-label="Mark post as {post.read ? 'not read' : 'read'}" />
			</form>

			<form
				class="text"
				action="/blog/{post.signature}.json?_method=patch"
				method="post"
				use:enhance={{
					result: patch
				}}
			>
				<input aria-label="Edit post" type="text" name="post" value={post.post} />
				<button class="save" aria-label="Save post" />
			</form>

			<form
				action="/blog/{post.signature}.json?_method=delete"
				method="post"
				use:enhance={{
					pending: () => (post.pending_delete = true),
					result: () => {
						blog = blog.filter((t) => t.signature !== post.signature);
					}
				}}
			>
				<button class="delete" aria-label="Delete post" disabled={post.pending_delete} />
			</form>
		</div>
	{/each}
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
		border: 1px solid #ff3e00 !important;
		outline: none;
	}

	.new input {
		font-size: 28px;
		width: 100%;
		padding: 0.5em 1em 0.3em 1em;
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
