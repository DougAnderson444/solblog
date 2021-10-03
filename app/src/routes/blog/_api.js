/*
	This module is used by the /blog.json and /blog/[uid].json
	endpoints to make calls to api.svelte.dev, which stores todos
	for each user. The leading underscore indicates that this is
	a private module, _not_ an endpoint — visiting /blog/_api
	will net you a 404 response.

	(The data on the todo app will expire periodically; no
	guarantees are made. Don't use it to organise your life.)
*/

// const base = 'https://api.svelte.dev';
import * as anchor from '$lib/anchorClient.js';

export async function api(request, resource, data) {
	// user must have a blogid
	if (!request.blogid) {
		return { status: 401 };
	}

	if (request.method == 'GET' && resource) {
		// postDetails
		return await anchor.getLastPosts(resource);
	}

	if (request.method == 'POST') {
		// TODO
	}

	// if posts is empty, return 404?
	const res = { ok: true, status: 200 }; // TODO: improve API for this

	// if the request came from a <form> submission, the browser's default
	// behaviour is to show the URL corresponding to the form's "action"
	// attribute. in those cases, we want to redirect them back to the
	// /blog page, rather than showing the response
	if (res.ok && request.method !== 'GET' && request.headers.accept !== 'application/json') {
		return {
			status: 303,
			headers: {
				location: '/blog'
			}
		};
	}

	return {
		status: res.status,
		body: postDetails
	};
}
