// [slug].json.js
// import vfile from 'to-vfile';
import * as anchor from '$lib/anchor.js';
import marked from 'marked';

export async function get({ params }) {
	// we could get the dynamic slug from the parameter of get.
	const { slug } = params;

	if (!slug) return;

	// array of the last 100 posts
	let postDetails = await anchor.getLastPosts(slug);

	// apply markdown parser to the content
	postDetails.forEach((post, index) => {
		postDetails[index].content.forEach((contentPiece, i) => {
			postDetails[index].content[i] = marked(contentPiece);
		});
	});

	const body = JSON.stringify(postDetails);

	return { body };
}

// POST /blog.json
export const post = async (request) => {
	// because index.svelte posts a FormData object,
	// request.body is _also_ a (readonly) FormData
	// object, which allows us to get form data
	// with the `body.get(key)` method
	let post = request.body.get('post');
	let blogid = request.params.slug;

	console.log('POST', { post }, { blogid });

	let postDeets = await anchor.makePost(post, blogid);

	return postDeets;
};
