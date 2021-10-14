<script>
	import { anchorClient } from '$lib/stores';
	import Bio from './Bio.svelte';
	import BlogDetails from './BlogDetails.svelte';

	export let blogger;

	let blogAccounts = new Promise((resolve, reject) => {});

	export const showBloggerAccounts = async () => {
		if (blogger.length < 4) return;

		if (blogger.length < 44) {
			// TODO: check naming service
			console.log('Checking Twitter name', blogger);
			const { getTwitterRegistry } = await import('$lib/helpers/utils'); // https://github.com/solana-labs/solana-program-library/blob/3e945798fc70e111b131622c1185385c222610fd/name-service/js/src/twitter.ts#L217
			const result = await getTwitterRegistry(blogger);
			if (!result) return;
			blogger = result;
			console.log('Twitter points to ', blogger);
		}

		// todo: check if valid
		blogAccounts = await $anchorClient.getBlogAccounts(blogger);
		console.log({ blogAccounts });
	};

	$: blogger && $anchorClient && showBloggerAccounts();
</script>

{#if blogger}
	<p>Blog Channels for <b>{blogger}</b>:</p>

	{#await blogAccounts}
		Loading this blogger's blog channels...
	{:then blogAccounts}
		{#if blogAccounts}
			<BlogDetails {blogAccounts} />
		{/if}
	{/await}
{/if}
