<script context="module">
	export async function load({ page, fetch }) {
		const slug = page.params.slug;
		// let response = await fetch(`${slug}.json`); // uses [slug].json.js to fetch
		// let posts = await response.json();
		return {
			props: { blogger: slug }
		};
	}
</script>

<script>
	import ListBlogs from '$lib/ListBlogs.svelte';
	export let blogger;
</script>

<ListBlogs {blogger} />
