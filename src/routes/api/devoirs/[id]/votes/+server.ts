import { checkSessionValide } from '$lib/server/check_session';
import { db } from '$lib/server/db';
import { votes_devoir } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import type { RequestHandler } from './[devoir_id]/$types';

export const GET: RequestHandler = async ({ request, params }) => {
	const COOKIE = request.headers.get('Cookie');
	if (!COOKIE) {
		return new Response('Session invalide', { status: 401 });
	}
	const SESSION = COOKIE.split('; ')
		.find((row) => row.startsWith('session='))
		?.split('=')[1];
	const SESSION_VALIDE = await checkSessionValide(SESSION!);
	if (!SESSION_VALIDE) {
		return new Response('Session invalide', { status: 401 });
	}

	const { id } = await params;

	const VOTES = await db.query.votes_devoir.findMany({
		where: eq(votes_devoir.devoir_id, Number(id))
	});

	return new Response(JSON.stringify(VOTES));
};
