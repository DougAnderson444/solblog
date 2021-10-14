<script>
	// These props get filled in from the page's front matter
	export let title;
	export let coverImageUrl;
</script>

<svelte:head>
	<title>{title}</title>
	<meta property="og:title" content={title} />
	<meta property="og:image" content={coverImageUrl} />
</svelte:head>

<article>
	<h1>{title}</h1>
	<slot />
</article>

<style>
	article {
		width: 100%;
		max-width: var(--column-width);
		margin: var(--column-margin-top) auto 0 auto;
	}
</style>
