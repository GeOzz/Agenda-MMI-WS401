import type { IUtilisateur } from '$lib/interfaces/IUtilisateur';
import { db } from '$lib/server/db';
import { sessions, utilisateurs } from '$lib/server/db/schema';
import type { RequestHandler } from './$types';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { customAlphabet } from 'nanoid';
const random = customAlphabet(
	'1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$^@#*!(-'
);
export const POST: RequestHandler = async ({ request }) => {
	const FORMULAIRE: {
		email: string;
		mot_de_passe: string;
	} = await request.json();

	const UTILISATEUR_DB = await db.query.utilisateurs.findFirst({
		where: eq(utilisateurs.email, FORMULAIRE.email)
	});

	if (!UTILISATEUR_DB) {
		return new Response('Utilisateur non trouvé', { status: 404 });
	}

	const MOT_DE_PASSE_CORRESPOND = bcrypt.compareSync(
		FORMULAIRE.mot_de_passe,
		UTILISATEUR_DB.mot_de_passe!
	);

	if (!MOT_DE_PASSE_CORRESPOND) {
		return new Response('Mot de passe incorrect', { status: 401 });
	}

	let ID_SESSION = random(50);
	// Evite les doublons de session
	async function checkSessionId(ID_SESSION: string) {
		const SESSION_EXISTANTE = await db.query.sessions.findFirst({
			where: eq(sessions.id_session, ID_SESSION)
		});
		if (SESSION_EXISTANTE) {
			ID_SESSION = random(50);
			await checkSessionId(ID_SESSION);
		}
	}
	await checkSessionId(ID_SESSION);

	// DATE ET HEURE ACTUELLE
	let DATE_ACTUELLE = new Date();
	const HEURES_EXPIRATION = 1;

	// DATE ET HEURE ACTUELLE + 1 HEURE
	DATE_ACTUELLE.setHours(DATE_ACTUELLE.getHours() + HEURES_EXPIRATION);
	// TIMESTAMP
	const EXPIRE_LE_TIMESTAMP = DATE_ACTUELLE.getTime();

	await db.insert(sessions).values({
		id_session: ID_SESSION,
		id_utilisateur: UTILISATEUR_DB.id,
		expire_le_timestamp: EXPIRE_LE_TIMESTAMP
	});

	return new Response('OK', {
		headers: {
			'Set-Cookie': `session=${ID_SESSION}; HttpOnly; Secure; SameSite=Strict; Path=/; Expires=${DATE_ACTUELLE.toUTCString()}`
		}
	});
};
