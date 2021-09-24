<script>
	import { onMount } from 'svelte';
	let markdowneditorelement;
	let initMDE;
	let SimpleMDE;
	let simplemde;

	onMount(async () => {
		const SimpleMDEModule = await import('simplemde');
		SimpleMDE = SimpleMDEModule.default;

		const getBytes = () => {
			if (!simplemde?.value()) return '0';
			console.log(simplemde.value());
			return Buffer.from(simplemde.value(), 'utf8').length || '0';
		};

		simplemde = new SimpleMDE({
			toolbar: false,
			status: false,
			element: markdowneditorelement,
			status: [
				{
					className: 'bytes',
					defaultValue: function (el) {
						el.innerHTML = '0 of 566 bytes';
					},
					onUpdate: function (el) {
						el.innerHTML = getBytes() + ' of 566 bytes';
					}
				}
			],
			initialValue: '# Blog Post \n make a post'
		});

		simplemde.codemirror.on('change', function () {
			console.log(Buffer.from(simplemde.value()).length);
		});
	});
</script>

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
