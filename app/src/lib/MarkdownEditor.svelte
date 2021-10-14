<script>
	import { onMount } from 'svelte';
	import { getContext } from 'svelte';

	export let value;
	export let initialValue = getContext('INITIAL') || `# Blog Title\nGo ahead, make a post!`;

	let markdowneditorelement;
	let initMDE;
	let SimpleMDE;
	let simplemde;
	let timer;

	const DRAFT_KEY = getContext('DRAFT_KEY') || '_DRAFT_BLOG';
	const def = null;

	// reflect externally bound updates, from <MarkdownEditor bind:value />
	export function externalUpdate() {
		simplemde.value('# New Post \n');
	}

	onMount(async () => {
		const { ImmortalDB } = await import('immortal-db');
		const storedValue = await ImmortalDB.get(DRAFT_KEY, def);

		const SimpleMDEModule = await import('simplemde');
		SimpleMDE = SimpleMDEModule.default;

		const getBytes = () => {
			if (!simplemde?.value()) return '0';
			let bytes = Buffer.from(simplemde.value(), 'utf8').length || '0';
			while (bytes > 566) {
				simplemde.value(simplemde.value().slice(0, simplemde.value().length - 2));
				bytes = Buffer.from(simplemde.value(), 'utf8').length;
				simplemde.codemirror.doc.setCursor(999, 999); // Move the cursor to the end of the document.
			}
			return bytes;
		};

		simplemde = new SimpleMDE({
			toolbar: false,
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

		if (storedValue) {
			simplemde.value(storedValue);
		}

		value = simplemde.value();

		simplemde.codemirror.on('change', function () {
			value = simplemde.value();

			// save after a brief pause, for more keystrokes
			if (timer) {
				clearTimeout(timer); // cancel any exisitng waiting
			}
			timer = setTimeout(async () => {
				timer = 0;
				// also update store
				await ImmortalDB.set(DRAFT_KEY, value);
			}, 900);
		});
	});
</script>

<svelte:head>
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/simplemde/latest/simplemde.min.css" />
</svelte:head>
<textarea bind:this={markdowneditorelement} hidden={true} />

<style>
	:global(.CodeMirror, .CodeMirror-scroll) {
		min-height: 90px !important;
	}

	:global(.CodeMirror-scroll) {
		padding-bottom: 60px !important;
	}

	:global(.CodeMirror) {
		background-color: white;
		border-radius: 8px;
		filter: drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.1));
		transform: translate(-1px, -1px);
	}
</style>
