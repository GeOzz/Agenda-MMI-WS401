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

	const UTILISATEUR = await db.query.utilisateurs.findFirst({
		where: eq(utilisateurs.id, SESSION_VALIDE.id_utilisateur)
	});

	const DEVOIR = await db.query.devoirs.findFirst({
		where: eq(devoirs.id, Number(params.id))
	});
	if (!DEVOIR) {
		return new Response('Devoir non trouvé', { status: 404 });
	}

	const DEVOIR_DANS_MES_GROUPES =
		DEVOIR.groupes
			?.split(',')
			.map((groupe) => groupe.trim())
			?.includes(UTILISATEUR?.groupeTD!) ||
		DEVOIR.groupes
			?.split(',')
			.map((groupe) => groupe.trim())
			?.includes(UTILISATEUR?.groupeTP!);

	const PEUT_CONSULTER =
		UTILISATEUR?.role === ERoleUtilisateur.PROFESSEUR ||
		UTILISATEUR?.role === ERoleUtilisateur.DELEGUEE ||
		DEVOIR_DANS_MES_GROUPES;

	if (PEUT_CONSULTER) {
		return new Response(JSON.stringify(DEVOIR));
	}
	return new Response("Vous n'avez pas les droits pour consulter ce devoir", { status: 403 });
};
