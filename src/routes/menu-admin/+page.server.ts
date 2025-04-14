import { db } from '$lib/server/db';
import { checkSessionValide } from '$lib/server/check_session';
import { utilisateurs } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const session = cookies.get('session');
	if (!session) {
		throw new Response('Accès refusé : vous devez être connecté.', { status: 401 });
	}

	const sessionValide = await checkSessionValide(session);
	if (!sessionValide) {
		throw new Response('Session invalide.', { status: 401 });
	}

	const utilisateur = await db.query.utilisateurs.findFirst({
		where: eq(utilisateurs.id, sessionValide.id_utilisateur)
	});

	if (!utilisateur || utilisateur.role !== 'PROFESSEUR') {
		throw new Response('Accès refusé : cette page est réservée aux professeurs.', { status: 403 });
	}

	return { utilisateur };
};
