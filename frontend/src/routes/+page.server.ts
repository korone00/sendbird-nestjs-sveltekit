import { PUBLIC_CHATSERVER_URL } from '$env/static/public';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url, parent }) => {
	if (!locals.session || !locals.session.data || !locals.session.data.token) {
		console.debug('No session data');
		return redirect(302, '/login');
	}

	try {
		const url = `${PUBLIC_CHATSERVER_URL}/chat/list-users`;
		const response = await fetch(url, {
			method: 'GET'
		});
		if (!response.ok) {
			throw new Error(`Server returned status: ${response.status} - ${response.statusText}`);
		}
		const data = await response.json();

		const userId = locals.session.data.userId;
		const newData = data.filter((user: any) => user.id !== userId);
		// console.log('newData', newData);

		return {
			currentUserId: userId,
			currentUserToken: locals.session.data.token,
			users: newData
		};
	} catch (error) {
		console.error('Failed to get :', error);
		return;
	}
};
