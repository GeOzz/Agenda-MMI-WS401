import { db } from '$lib/server/db';
import { utilisateurs } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	try {
		const allUtilisateurs = await db.select().from(utilisateurs);
		return new Response(JSON.stringify(allUtilisateurs), { status: 200 });
	} catch (error) {
		console.error('Erreur lors de la récupération des utilisateurs:', error);
		return new Response('Erreur interne du serveur', { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params }) => {
	try {
		const id = Number(params.id);
		await db.delete(utilisateurs).where(eq(utilisateurs.id, id));
		return new Response('Utilisateur supprimé avec succès', { status: 200 });
	} catch (error) {
		console.error('Erreur lors de la suppression de l’utilisateur:', error);
		return new Response('Erreur interne du serveur', { status: 500 });
	}
};
