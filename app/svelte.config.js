import preprocess from 'svelte-preprocess';
// import adapter_ipfs from 'sveltejs-adapter-ipfs';
import vercelAdapter from '@sveltejs/adapter-vercel';
import path from 'path';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: preprocess(),

	kit: {
		// adapter: adapter_ipfs({
		// 	removeBuiltInServiceWorkerRegistration: true,
		// 	injectPagesInServiceWorker: true
		// }),
		adapter: vercelAdapter({
			outfile: '../build'
		}),
		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',
		vite: () => ({
			resolve: {
				alias: {
					$idl: path.resolve('../target/idl/')
				}
			}
		})
	}
};

export default config;
