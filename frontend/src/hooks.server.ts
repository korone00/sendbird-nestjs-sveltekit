import { error, redirect, type Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { handleSession } from 'svelte-kit-cookie-session';
import { sequence } from '@sveltejs/kit/hooks';

// https://1password.com/password-generator/ 에서 32자리 비밀번호 생성해서 SESSION_SECRET에 넣기
const sessionHandler = handleSession({
	key: 'sendbird',
	secret: env.SESSION_SECRET
});

export const handle: Handle = sequence(
	sessionHandler,
	sequence(sessionHandler, async ({ resolve, event }) => {
		const response = await resolve(event);
		return response;
	})
);
