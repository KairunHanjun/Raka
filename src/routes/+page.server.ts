import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import * as auth from '$lib/server/auth';
import { accounts } from '$lib/server/db/schema';
import { verify } from 'argon2';

export const actions = {
	default: async ({ request, cookies, url }) => {
		const formData = await request.formData();
		const username = formData.get('username')?.toString().trim() ?? '';
		const password = formData.get('password')?.toString().trim() ?? '';
		if (!username || !password) {
			return fail(400, { error: 'Please enter both username and password.' });
		}

		// Fetch user
		const [user] = await db.select().from(accounts).where(eq(accounts.username, username.toLocaleLowerCase()));

		if (!user) {
			return fail(400, { error: 'Username or Password is invalid' });
		}

		// Verify password hash
		const validPassword = await verify(user.passwordHash, password);
		if (!validPassword) {
			return fail(400, {
				error: "Username or Password is invalid"
			});
		}

		// Create session
		const token = auth.generateSessionToken();
		const session = await auth.createSession(token, user.id);

		// Set cookie
		auth.setSessionTokenCookie(
			{ cookies } as any, // compatible with RequestEvent
			token,
			session.expiresAt,
			'/'
		);

		// Redirect to dashboard based on accountType
		const homeRoutes = {
			FO: '/User/FO',
			HK: '/User/HK',
			T: '/User/T',
			H: '/User/H'
		} as const;

		const redirectTo = homeRoutes[user.accountType as keyof typeof homeRoutes] ?? '/';
		throw redirect(302, redirectTo);
	}
};
