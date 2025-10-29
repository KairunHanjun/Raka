import { deleteSessionTokenCookie, invalidateSession } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
    const session = event.locals.session;
    
    if (session) {
        await invalidateSession(session.id);
    }
    
    deleteSessionTokenCookie(event, '/');
    throw redirect(302, '/');
};