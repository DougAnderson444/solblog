// [slug].json.js
// import vfile from 'to-vfile';
import * as anchor from '$lib/anchor.js';
import marked from 'marked';

export async function get({ params }) {
	// we could get the dynamic slug from the parameter of get.
	const { slug } = params;
	console.log({ slug });

	if (!slug) return;

	// array of the last 100 posts
	let postDetails = await anchor.getLastPosts(slug);

	console.log({ postDetails });

	// apply markdown parser to the content
	postDetails.forEach((post, index) => {
		postDetails[index].content.forEach((contentPiece, i) => {
			postDetails[index].content[i] = marked(contentPiece);
		});
	});

	const body = JSON.stringify(postDetails);

	return { body };
}
