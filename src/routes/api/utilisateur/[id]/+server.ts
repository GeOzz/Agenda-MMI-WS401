import { checkSessionValide } from '$lib/server/check_session';
import { db } from '$lib/server/db';
import { devoirs, utilisateurs } from '$lib/server/db/schema';

import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { ERoleUtilisateur } from '$lib/interfaces/IUtilisateur';

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

	const UTILISATEUR_CONNECTE = await db.query.utilisateurs.findFirst({
		where: eq(utilisateurs.id, SESSION_VALIDE.id_utilisateur)
	});

	const UTILISATEUR_A_CONSULTER = await db.query.utilisateurs.findFirst({
		where: eq(utilisateurs.id, Number(params.id))
	});

	if (!UTILISATEUR_A_CONSULTER) {
		return new Response('Utilisateur non trouvé', { status: 404 });
	}

	return new Response(JSON.stringify(UTILISATEUR_A_CONSULTER));
};

export const DELETE: RequestHandler = async ({ params }) => {
	try {
		const id = Number(params.id); // Récupération de l'ID depuis le paramètre dynamique
		await db.delete(utilisateurs).where(eq(utilisateurs.id, id));
		return new Response('Utilisateur supprimé avec succès', { status: 200 });
	} catch (error) {
		console.error('Erreur lors de la suppression de l’utilisateur:', error);
		return new Response('Erreur interne du serveur', { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ request, params, cookies }) => {
	const session = cookies.get('session');
	if (!session) {
		return new Response('Session invalide', { status: 401 });
	}

	const sessionValide = await checkSessionValide(session);
	if (!sessionValide) {
		return new Response('Session invalide', { status: 401 });
	}

	const utilisateurConnecte = await db.query.utilisateurs.findFirst({
		where: eq(utilisateurs.id, sessionValide.id_utilisateur)
	});

	if (!utilisateurConnecte) {
		return new Response('Utilisateur non trouvé', { status: 404 });
	}

	try {
		const id = Number(params.id);
		const body = await request.json();

		// Validation des données
		if (!body.nom || !body.prenom || !body.email) {
			return new Response('Données invalides', { status: 400 });
		}

		// Mise à jour de l'utilisateur
		await db
			.update(utilisateurs)
			.set({
				nom: body.nom,
				prenom: body.prenom,
				email: body.email
			})
			.where(eq(utilisateurs.id, id));

		return new Response('Utilisateur mis à jour avec succès', { status: 200 });
	} catch (error) {
		console.error('Erreur lors de la mise à jour de l’utilisateur:', error);
		return new Response('Erreur interne du serveur', { status: 500 });
	}
};
