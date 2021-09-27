import { api } from './_api';

// GET /blog.json
export const get = async (request) => {
	// request.locals.userid comes from src/hooks.js
	const response = await api(request, request.body.blogid);

	if (response.status === 404) {
		// user hasn't created a blog yet.
		// start with an empty array
		return { body: [] };
	}

	return response;
};

// POST /blog.json
export const post = async (request) => {
	console.log('post!', { request });

	let post = request.body.get('post');
	console.log({ post });
	const response = await api(request, request.body.blogid, {
		// because index.svelte posts a FormData object,
		// request.body is _also_ a (readonly) FormData
		// object, which allows us to get form data
		// with the `body.get(key)` method
		post
	});

	return response;
};
