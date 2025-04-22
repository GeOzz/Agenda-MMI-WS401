import { checkSessionValide } from '$lib/server/check_session';
import { db } from '$lib/server/db';
import { utilisateurs } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import bcrypt from 'bcrypt';

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

	try {
		const { mot_de_passe_actuel, mot_de_passe_nouveau, mot_de_passe_confirmation } = await request.json();

		if (!mot_de_passe_actuel || !mot_de_passe_nouveau || !mot_de_passe_confirmation) {
			return new Response('Mot de passe incorrect', { status: 400 });
		}

		if (mot_de_passe_nouveau !== mot_de_passe_confirmation) {
			return new Response('La confirmation du mot de passe ne correspond pas', { status: 400 });
		}
 
		const UTILISATEUR = await db.query.utilisateurs.findFirst({
			where: eq(utilisateurs.id, SESSION_VALIDE.id_utilisateur!)
		});

		if (!UTILISATEUR) {
			return new Response('Utilisateur non trouvé', { status: 404 });
		}

		const MOT_DE_PASSE_ACTUEL_CORRECT = bcrypt.compareSync(
			mot_de_passe_actuel,
			UTILISATEUR.mot_de_passe!
		);

		if (!MOT_DE_PASSE_ACTUEL_CORRECT) {
			return new Response('Mot de passe actuel incorrect', { status: 401 });
		}

		const MOT_DE_PASSE_HACHE = bcrypt.hashSync(mot_de_passe_nouveau, 10);

		await db
			.update(utilisateurs)
			.set({
				mot_de_passe: MOT_DE_PASSE_HACHE
			})
			.where(eq(utilisateurs.id, SESSION_VALIDE.id_utilisateur!));

		return new Response(JSON.stringify({ message: 'Mot de passe mis à jour avec succès' }), {
			status: 200,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	} catch (error) {
		console.error('Erreur lors du changement de mot de passe:', error);
		return new Response('Erreur lors du traitement de la demande', { status: 500 });
	}
};
