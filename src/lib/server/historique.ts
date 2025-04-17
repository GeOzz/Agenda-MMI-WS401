import { desc } from 'drizzle-orm';
import { db } from './db';
import { historique } from './db/schema';

export async function AjouterHistorique(json: unknown) {
	const nouveauHistorique = {
		timestamp: new Date().getTime(),
		json: json
	};
	await db.insert(historique).values({
		timestamp: nouveauHistorique.timestamp,
		json: JSON.stringify(nouveauHistorique.json)
	});
}

export async function ObtenirHistorique(limit: number = 30, offset: number = 0) {
	const HISTORIQUE = await db.query.historique.findMany({
		limit,
		offset,
		orderBy: desc(historique.timestamp)
	});
	return HISTORIQUE;
}
