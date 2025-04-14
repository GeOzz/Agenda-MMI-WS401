import { db } from '$lib/server/db';
import { checkSessionValide } from '$lib/server/check_session';
import { utilisateurs } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, params }) => {
	const session = cookies.get('session');
	if (!session) {
		throw new Response('Accès refusé : vous devez être connecté.', { status: 401 });
	}

	const sessionValide = await checkSessionValide(session);
	if (!sessionValide) {
		throw new Response('Session invalide.', { status: 401 });
	}

	const utilisateurConnecte = await db.query.utilisateurs.findFirst({
		where: eq(utilisateurs.id, sessionValide.id_utilisateur)
	});

	if (!utilisateurConnecte || utilisateurConnecte.role !== 'PROFESSEUR') {
		throw new Response('Accès refusé : cette page est réservée aux professeurs.', { status: 403 });
	}

	const utilisateurASupprimer = await db.query.utilisateurs.findFirst({
		where: eq(utilisateurs.id, Number(params.id))
	});

	if (!utilisateurASupprimer) {
		throw new Response('Utilisateur non trouvé.', { status: 404 });
	}

	if (utilisateurASupprimer.role === 'PROFESSEUR') {
		throw new Response('Vous ne pouvez pas supprimer un compte PROFESSEUR.', { status: 403 });
	}

	return { utilisateurASupprimer };
};
