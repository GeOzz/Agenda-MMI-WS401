import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const { promotion, matiere, expire_le_timestamp, groupes, markdown, titre } =
		await request.json();

	console.log('Données reçues:', {
		promotion,
		matiere,
		expire_le_timestamp,
		groupes,
		markdown,
		titre
	});

	if (!promotion || !matiere || !expire_le_timestamp || !groupes || !markdown || !titre) {
		return json({ success: false, error: 'Tous les champs sont requis.' });
	}

	try {
		const result = await db.devoirs.insert({
			promotion,
			matiere,
			expire_le_timestamp,
			groupes,
			markdown,
			titre
		});
		console.log('Insertion réussie:', result);
		return json({ success: true, result });
	} catch (error) {
		console.error("Erreur lors de l'insertion:", error);
		return json({ success: false, error: error.message });
	}
};
