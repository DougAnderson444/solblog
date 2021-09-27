<script>
	import { onMount } from 'svelte';

	const KEYFILE = 'KEYFILE';
	const def = null;

	onMount(async () => {
		const { ImmortalDB } = await import('immortal-db');
		const storedValue = await ImmortalDB.get(KEYFILE, def);

		let parsedStore;
		if (storedValue) parsedStore = JSON.parse(storedValue);

		if (parsedStore && parsedStore.length > 0) {
		} else {
		}
	});
</script>
