import { db } from '$lib/server/db';
import { checkSessionValide } from '$lib/server/check_session';
import { utilisateurs } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const session = cookies.get('session');
	if (!session) {
		return { utilisateur: null };
	}

	const sessionValide = await checkSessionValide(session);
	if (!sessionValide) {
		return { utilisateur: null };
	}

	const utilisateur = await db.query.utilisateurs.findFirst({
		where: eq(utilisateurs.id, sessionValide.id_utilisateur)
	});

	return { utilisateur };
};
