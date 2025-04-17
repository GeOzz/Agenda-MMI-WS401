import { checkSessionValide } from '$lib/server/check_session';
import { db } from '$lib/server/db';
import { historique } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ request }) => {
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

	try {
		const historiqueItems = await db.query.historique.findMany({
			orderBy: [desc(historique.timestamp)],
			limit: 50
		});

		return new Response(JSON.stringify(historiqueItems));
	} catch (error) {
		console.error("Erreur lors de la récupération de l'historique:", error);
		return new Response('Erreur serveur', { status: 500 });
	}
};
