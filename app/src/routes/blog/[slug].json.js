// [slug].json.js
// import vfile from 'to-vfile';
import { anchorClient } from '$lib/stores';

import marked from 'marked';

export async function get({ params }) {
	// we could get the dynamic slug from the parameter of get.
	let { slug } = params;

	if (!slug) return;

	// array of the last 100 posts
	let postDetails = await get(anchorClient).getLastPosts(slug);

	console.log('get marked', { postDetails });
	// apply markdown parser to the content
	postDetails.forEach((post, index) => {
		postDetails[index].content.forEach((contentPiece, i) => {
			postDetails[index].content[i] = marked(contentPiece);
		});
	});

	const body = JSON.stringify(postDetails);
	console.log({ body });

	return { body };
}

// POST /blog.json
export const post = async (request) => {
	// because index.svelte posts a FormData object,
	// request.body is _also_ a (readonly) FormData
	// object, which allows us to get form data
	// with the `body.get(key)` method
	let post = request.body.get('post');
	let blogAccount = request.params.slug;

	console.log('POST', { post }, { blogAccount });

	let postDeets = await anchor.makePost(post, blogAccount);

	return postDeets;
};
