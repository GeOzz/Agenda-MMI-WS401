import type { RequestHandler } from './$types';
import { checkSessionValide } from '$lib/server/check_session';
import { db } from '$lib/server/db';
import { utilisateurs } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
export const GET: RequestHandler = async ({ request }) => {
	return new Response('OK', {
		headers: {
			'Set-Cookie': `session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
		}
	});
};
