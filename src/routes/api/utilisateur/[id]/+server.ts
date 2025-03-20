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
