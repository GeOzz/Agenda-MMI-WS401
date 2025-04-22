import { checkSessionValide } from '$lib/server/check_session';
import { db } from '$lib/server/db';
import { devoirs, utilisateurs } from '$lib/server/db/schema';

import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { ERoleUtilisateur } from '$lib/interfaces/IUtilisateur';
import { AjouterHistorique } from '$lib/server/historique';

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

	const UTILISATEUR = await db.query.utilisateurs.findFirst({
		where: eq(utilisateurs.id, SESSION_VALIDE.id_utilisateur)
	});

	const DEVOIR = await db.query.devoirs.findFirst({
		where: eq(devoirs.id, Number(params.id))
	});
	if (!DEVOIR) {
		return new Response('Devoir non trouvé', { status: 404 });
	}
	const PROMOTION_INCLUE = UTILISATEUR?.promotion === DEVOIR.promotion;

	const DEVOIR_DANS_MES_GROUPES =
		DEVOIR.groupes
			?.split(',')
			.map((groupe) => groupe.trim())
			?.includes(UTILISATEUR?.groupeTD!) ||
		DEVOIR.groupes
			?.split(',')
			.map((groupe) => groupe.trim())
			?.includes(UTILISATEUR?.groupeTP!);
	const ADMIN =
		UTILISATEUR?.role === ERoleUtilisateur.PROFESSEUR;

	const PEUT_CONSULTER = ADMIN || (!ADMIN && DEVOIR_DANS_MES_GROUPES && PROMOTION_INCLUE);

	if (PEUT_CONSULTER) {
		return new Response(JSON.stringify(DEVOIR));
	}
	return new Response("Vous n'avez pas les droits pour consulter ce devoir", { status: 403 });
};

export const PUT: RequestHandler = async ({ request, params }) => {
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

	const UTILISATEUR = await db.query.utilisateurs.findFirst({
		where: eq(utilisateurs.id, SESSION_VALIDE.id_utilisateur)
	});

	const DEVOIR = await db.query.devoirs.findFirst({
		where: eq(devoirs.id, Number(params.id))
	});

	if (
		!UTILISATEUR?.role.includes(ERoleUtilisateur.PROFESSEUR) &&
		!UTILISATEUR?.role.includes(ERoleUtilisateur.DELEGUE) &&
		UTILISATEUR?.id !== DEVOIR?.utilisateur_id_createur
	) {
		return new Response("Vous n'avez pas les droits pour modifier ce devoir", { status: 403 });
	}

	const { titre, matiere, promotion, expire_le_timestamp, groupes, markdown } =
		await request.json();

	const NOUVEAU_DEVOIR = await db
		.update(devoirs)
		.set({
			titre,
			matiere,
			promotion,
			expire_le_timestamp,
			groupes,
			markdown
		})
		.where(eq(devoirs.id, Number(params.id)))
		.returning();
	AjouterHistorique({
		utilisateur: UTILISATEUR,
		devoir: NOUVEAU_DEVOIR[0],
		action: 'update',
		type: 'devoir',
		timestamp: new Date().getTime()
	});
	return new Response('Devoir modifié avec succès', { status: 200 });
};

export const DELETE: RequestHandler = async ({ request, params }) => {
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

	const UTILISATEUR = await db.query.utilisateurs.findFirst({
		where: eq(utilisateurs.id, SESSION_VALIDE.id_utilisateur)
	});
	const DEVOIR = await db.query.devoirs.findFirst({
		where: eq(devoirs.id, Number(params.id))
	});
	if (
		!UTILISATEUR?.role.includes(ERoleUtilisateur.PROFESSEUR) &&
		!UTILISATEUR?.role.includes(ERoleUtilisateur.DELEGUE) &&
		UTILISATEUR?.id !== DEVOIR?.utilisateur_id_createur
	) {
		return new Response("Vous n'avez pas les droits pour supprimer ce devoir", { status: 403 });
	}

	await db.delete(devoirs).where(eq(devoirs.id, Number(params.id)));
	AjouterHistorique({
		utilisateur: UTILISATEUR,
		devoir: DEVOIR,
		action: 'delete',
		type: 'devoir',
		timestamp: new Date().getTime()
	});
	return new Response('Devoir supprimé avec succès', { status: 200 });
};
