<script>
	import { anchorClient } from '$lib/stores';
	import { onMount } from 'svelte';
	import marked from 'marked';

	export let blogId;
	console.log({ blogId });
	let bio;
	onMount(() => {
		$anchorClient?.getBio(blogId).then((b) => {
			console.log({ b });
			bio = marked(b);
			console.log({ bio });
		});
	});
</script>

{@html bio ? bio : ''}
