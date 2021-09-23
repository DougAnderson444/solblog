// [slug].json.js
// import vfile from 'to-vfile';
import * as anchor from '$lib/anchor.js';

export async function get({ params }) {
	// we could get the dynamic slug from the parameter of get.
	const { slug } = params;
	console.log({ slug });

	// array of the last 100 posts
	let postDetails = await anchor.getLastPosts(slug);

	console.log({ postDetails });

	const body = JSON.stringify(postDetails);

	return { body };
}
