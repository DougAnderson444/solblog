<script>
	import Bio from '$lib/Bio.svelte';

	export let blogAccounts;
</script>

{#if blogAccounts}
	{#if blogAccounts?.length > 0}
		<ul>
			{#each blogAccounts as blogId}
				<li>
					BlogId: <a href="/blog/{blogId}">{blogId}</a><br />
					<Bio {blogId} />
				</li>
			{/each}
		</ul>
	{/if}<br />
{/if}

<style>
	ul {
		list-style: none;
	}
	li {
		background-color: white;
		border-radius: 8px;
		filter: drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.1));
		transform: translate(-1px, -1px);
		margin: 0 0 0.5rem 0;
		padding: 0.5rem;
	}
</style>
