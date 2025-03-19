import { db } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const devoirs = await db.query.devoirs.findMany();
	return new Response(JSON.stringify(devoirs));
};
