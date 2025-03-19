import { checkSessionValide } from '$lib/server/check_session';
import { db } from '$lib/server/db';
import { devoirs, utilisateurs } from '$lib/server/db/schema';
import { STORE } from '$lib/store.svelte';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { ERoleUtilisateur } from '$lib/interfaces/IUtilisateur';

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

	const UTILISATEUR = await db.query.utilisateurs.findFirst({
		where: eq(utilisateurs.id, SESSION_VALIDE.id_utilisateur)
	});

	const DEVOIRS = await db.query.devoirs.findMany({});

	const DEVOIRS_AVEC_UTILISATEUR = DEVOIRS.filter((devoir) => {
		const GROUPES = devoir.groupes?.split(',').map((groupe) => groupe.trim());
		const DEVOIR_DANS_MES_GROUPES =
			GROUPES?.includes(UTILISATEUR?.groupeTD!) || GROUPES?.includes(UTILISATEUR?.groupeTP!);
		const TOUS_LES_DEVOIRS =
			UTILISATEUR?.role === ERoleUtilisateur.PROFESSEUR ||
			UTILISATEUR?.role === ERoleUtilisateur.DELEGUEE;

		if (TOUS_LES_DEVOIRS) {
			return devoir;
		}
		if (DEVOIR_DANS_MES_GROUPES) {
			return devoir;
		}
		return undefined;
	});
	return new Response(JSON.stringify(DEVOIRS_AVEC_UTILISATEUR));
};

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

	const { promotion, matiere, expire_le_timestamp, groupes, markdown } = await request.json();

	await db.insert(devoirs).values({
		promotion,
		matiere,
		expire_le_timestamp,
		groupes,
		markdown,
		utilisateur_id_createur: SESSION_VALIDE.id_utilisateur,
		timestamp: new Date().getTime()
	});
	return new Response(JSON.stringify({ message: 'Devoir ajouté avec succès' }));
};
