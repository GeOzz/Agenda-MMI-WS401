import type { RequestHandler } from './$types';
import { checkSessionValide } from '$lib/server/check_session';
import { db } from '$lib/server/db';
import { utilisateurs } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
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
	if (!UTILISATEUR) {
		return new Response('Utilisateur non trouvé', { status: 404 });
	}
	const { mot_de_passe, ...UTILISATEUR_SANS_MOT_DE_PASSE } = UTILISATEUR;
	return new Response(JSON.stringify(UTILISATEUR_SANS_MOT_DE_PASSE));
};
