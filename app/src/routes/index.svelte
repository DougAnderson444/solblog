<script context="module">
	export const prerender = true;
</script>

<script>
	import blogo from './solblog.svg';
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<section>
	<h1>
		<div class="welcome">
			<picture>
				<a sveltekit:prefetch href="/blog">
					<img src={blogo} alt="SolBlog Logo Link" />
				</a>
			</picture>
		</div>
	</h1>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 1;
	}

	h1 {
		width: 100%;
	}

	.welcome {
		width: 100%;
		height: auto;
	}

	.welcome img {
		width: 60%;
		max-width: 350px;
		margin: 0.5em;
		height: auto;
		display: inline-block;
	}
</style>
