import type { Handle } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import { sequence } from '@sveltejs/kit/hooks';
import { db } from '$lib/server/db';
import { session } from '$lib/server/db/schema';
import { lt } from 'drizzle-orm';

const authMiddleware: Handle = async ({event, resolve}) => {
	
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
	const publicRoutes = ['/','/offline','/service-worker.ts'];
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
		return Response.redirect(new URL('/?reason=SessionExpired', event.url), 302);
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
			if (pathname === `/User/${type.toUpperCase()}` && user.accountType !== type) {
				console.log("Check User 3");
				const redirectTo = homeRoutes[user.accountType as keyof typeof homeRoutes] ?? '/';
				return Response.redirect(new URL(redirectTo, event.url), 302);
			}
		}
	}

	// Continue normally
	return await resolve(event);
}

const checkOutdatedSession: Handle = async ({event, resolve}) => {
	await db.delete(session).where(lt(session.expiresAt, new Date()));
	return await resolve(event);
}

export const handle: Handle = sequence(authMiddleware, checkOutdatedSession);
