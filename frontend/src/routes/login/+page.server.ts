import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from '../$types';
import { PUBLIC_CHATSERVER_URL } from '$env/static/public';

export const load: PageServerLoad = async ({ locals, url, parent }) => {
	console.log('/login', locals.session);
	if (locals.session && locals.session.data && locals.session.data.token) {
		throw redirect(302, '/');
	}
};

export const actions: Actions = {
	login: async ({ locals, request }) => {
		const formData = await request.formData();
		const username = formData.get('username');
		const password = formData.get('password');

		if (!username) {
			return fail(400, { username, missing: true });
		}

		if (!password) {
			return fail(400, { password, missing: true });
		}

		console.log('login', username, password);

		const url = `${PUBLIC_CHATSERVER_URL}/chat/create-user-token?userId=${username}`;
		const response = await fetch(url, {
			method: 'GET'
		});
		if (!response.ok) {
			console.error(response.status, response.statusText);
			return fail(response.status, { error: response.statusText });
		}
		let data = await response.json();
		data.userId = username.toString();
		console.log(data);
		await locals.session.set(data);
		throw redirect(302, '/');
	}
};
