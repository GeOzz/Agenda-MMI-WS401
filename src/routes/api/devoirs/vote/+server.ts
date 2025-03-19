import { checkSessionValide } from '$lib/server/check_session';
import { db } from '$lib/server/db';
import { votes_devoir } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
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

	const { devoir_id, vote } = await request.json();

	await db.insert(votes_devoir).values({
		devoir_id,
		utilisateur_id: SESSION_VALIDE.id_utilisateur,
		vote,
		timestamp: new Date().getTime()
	});
	return new Response(JSON.stringify({ message: 'Vote ajouté avec succès' }));
};
