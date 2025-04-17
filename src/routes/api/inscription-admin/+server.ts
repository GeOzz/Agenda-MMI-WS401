import { db } from '$lib/server/db';
import { utilisateurs } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import bcrypt from 'bcrypt';
import { ERoleUtilisateur } from '$lib/interfaces/IUtilisateur';

export const POST: RequestHandler = async ({ request }) => {
    const UTILISATEUR = await request.json();

    // Vérifier si l'utilisateur existe déjà
    const utilisateur_existant = await db.query.utilisateurs.findFirst({
        where: eq(utilisateurs.email, UTILISATEUR.email)
    });

    if (utilisateur_existant) {
        return new Response('Utilisateur déjà existant', { status: 400 });
    }

    // Insérer le nouvel utilisateur dans la base de données
    const nouveau_utilisateur_db = await db
        .insert(utilisateurs)
        .values({
            nom: UTILISATEUR.nom,
            prenom: UTILISATEUR.prenom,
            email: UTILISATEUR.email,
            role: UTILISATEUR.role || ERoleUtilisateur.ETUDIANT, // Permet de spécifier un rôle ou par défaut "ETUDIANT"
            mot_de_passe: bcrypt.hashSync(UTILISATEUR.mot_de_passe || 'MotDePasseParDefaut123', 10), // Mot de passe par défaut si non fourni
            promotion: UTILISATEUR.promotion,
            groupeTD: UTILISATEUR.groupeTD,
            groupeTP: UTILISATEUR.groupeTP
        })
        .returning();

    return new Response('Utilisateur créé avec succès', { status: 200 });
};
