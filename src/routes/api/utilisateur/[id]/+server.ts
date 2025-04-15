import { checkSessionValide } from '$lib/server/check_session';
import { db } from '$lib/server/db';
import { devoirs, utilisateurs } from '$lib/server/db/schema';

import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { ERoleUtilisateur } from '$lib/interfaces/IUtilisateur';
import { json } from '@sveltejs/kit';

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

export const PUT: RequestHandler = async ({ params, request }) => {
	// Récupérer l'ID de l'utilisateur depuis les paramètres
	const id = Number(params.id);

	// Vérifier que l'ID est valide
	if (!id) {
		return json({ error: 'ID utilisateur invalide' }, { status: 400 });
	}

	// Récupérer les données envoyées dans la requête
	const utilisateur = await request.json();

	// Vérifier que les données nécessaires sont présentes
	if (!utilisateur.nom || !utilisateur.prenom || !utilisateur.email) {
		return json({ error: 'Données utilisateur incomplètes' }, { status: 400 });
	}

	try {
		// Mettre à jour l'utilisateur dans la base de données
		await db
			.update(utilisateurs)
			.set({
				nom: utilisateur.nom,
				prenom: utilisateur.prenom,
				email: utilisateur.email,
				role: utilisateur.role,
				promotion: utilisateur.promotion,
				groupeTD: utilisateur.groupeTD,
				groupeTP: utilisateur.groupeTP
			})
			.where(eq(utilisateurs.id, id));

		// Retourner une réponse de succès
		return json({ success: true });
	} catch (error) {
		console.error('Erreur lors de la mise à jour de l’utilisateur :', error);
		return json({ error: 'Erreur interne du serveur' }, { status: 500 });
	}
};
