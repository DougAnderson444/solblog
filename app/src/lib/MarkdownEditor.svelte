<script>
	import { onMount } from 'svelte';
	let markdowneditorelement;
	let initMDE;
	let SimpleMDE;
	let simplemde;

	onMount(async () => {
		const SimpleMDEModule = await import('simplemde');
		SimpleMDE = SimpleMDEModule.default;

		simplemde = new SimpleMDE({
			toolbar: false,
			status: false,
			element: markdowneditorelement,
			// status: [
			// 	'words',
			// 	{
			// 		className: 'bytes',
			// 		defaultValue: function (el) {
			// 			this.bytes = 0;
			// 			el.innerHTML = '0 bytes';
			// 		},
			// 		onUpdate: function (el) {
			// 			el.innerHTML = ++this.bytes + ' bytes';
			// 		}
			// 	}
			// ],
			initialValue: '# Blog Post \n make a post'
		});
	});

	const handleKeyUp = () => {
		console.log(simplemde.value());
	};
</script>

<svelte:window on:keyup={handleKeyUp} />
<svelte:head>
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/simplemde/latest/simplemde.min.css" />
</svelte:head>
<textarea this={markdowneditorelement} hidden="true" />

<style>
	:global(.CodeMirror, .CodeMirror-scroll) {
		min-height: 100px;
	}
	:global(.CodeMirror-scroll) {
		padding-bottom: 50px;
	}
	/* .CodeMirror-scroll  */

	:global(.CodeMirror) {
		background-color: white;
		border-radius: 8px;
		filter: drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.1));
		transform: translate(-1px, -1px);
	}
</style>
