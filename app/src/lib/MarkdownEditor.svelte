<script>
	import { onMount } from 'svelte';
	export let value;
	export let initialValue = `# Blog Title\nGo ahead, make a post!`;

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
			initialValue
		});
		value = simplemde.value();

		simplemde.codemirror.on('change', function () {
			value = simplemde.value();
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
		min-height: 50px;
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
