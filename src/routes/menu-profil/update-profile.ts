import { db } from '$lib/server/db';
import { utilisateurs } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    const UTILISATEUR = await request.json();

    try {
        await db
            .update(utilisateurs)
            .set({
                promotion: UTILISATEUR.promotion,
                groupeTD: UTILISATEUR.groupeTD,
                groupeTP: UTILISATEUR.groupeTP,
                avatar: UTILISATEUR.avatar
            })
            .where(eq(utilisateurs.email, UTILISATEUR.email));

        return new Response('Profil mis à jour avec succès', { status: 200 });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du profil', error);
        return new Response('Erreur lors de la mise à jour du profil', { status: 500 });
    }
};
