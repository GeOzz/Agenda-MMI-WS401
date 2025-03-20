import { checkSessionValide } from '$lib/server/check_session';
import { db } from '$lib/server/db';
import { votes_devoir } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
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

	const A_DEJA_VOTE = await db.query.votes_devoir.findFirst({
		where: and(
			eq(votes_devoir.devoir_id, devoir_id),
			eq(votes_devoir.utilisateur_id, SESSION_VALIDE.id_utilisateur!)
		)
	});

	if (A_DEJA_VOTE) {
		await db
			.update(votes_devoir)
			.set({ vote: vote, timestamp: new Date().getTime() })
			.where(eq(votes_devoir.id, A_DEJA_VOTE.id));
		return new Response(JSON.stringify({ message: 'Vote modifié avec succès' }), { status: 200 });
	}

	await db.insert(votes_devoir).values({
		devoir_id,
		utilisateur_id: SESSION_VALIDE.id_utilisateur,
		vote,
		timestamp: new Date().getTime()
	});
	return new Response(JSON.stringify({ message: 'Vote ajouté avec succès' }), { status: 200 });
};
