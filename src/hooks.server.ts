import type { Handle } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(auth.sessionCookieName);
	let user = null;
	let session = null;
	if (sessionToken) {
		const result = await auth.validateSessionToken(sessionToken);
		user = result.user;
		session = result.session;

		if (session) {
			auth.setSessionTokenCookie(event, sessionToken, session.expiresAt, '/');
		} else {
			auth.deleteSessionTokenCookie(event, '/');
		}
	}

	event.locals.user = user;
	event.locals.session = session;
	// Path and route control
	const pathname = event.url.pathname;
	const publicRoutes = ['/'];
	const isPublic = publicRoutes.some((r) => pathname === r);

	// Define each accountType’s dashboard
	const homeRoutes = {
		FO: '/User/FO',
		HK: '/User/HK',
		T: '/User/T',
		H: '/User/H'
	} as const;

	
	// 🧭 1. Not logged in trying to access protected route → send to landing
	if (!user && !isPublic) {
		console.log("Check User 1");
		return Response.redirect(new URL('/', event.url), 302);
	}

	
	// 🧭 2. Logged in but tries to access public routes → send to dashboard
	if (user && isPublic) {
		console.log("Check User 2: " + isPublic);
		const redirectTo = homeRoutes[user.accountType as keyof typeof homeRoutes] ?? '/';
		return Response.redirect(new URL(redirectTo, event.url), 302);
	}

	
	// 🧭 3. Role restriction: ensure users only access their area
	if (user) {
		for (const [type, route] of Object.entries(homeRoutes)) {
			// Example: FO can only access /fo/*
			if (pathname.startsWith(`/User/${type.toUpperCase()}`) && user.accountType !== type) {
				console.log("Check User 3");
				const redirectTo = homeRoutes[user.accountType as keyof typeof homeRoutes] ?? '/';
				return Response.redirect(new URL(redirectTo, event.url), 302);
			}
		}
	}

	// Continue normally
	return resolve(event);
};
