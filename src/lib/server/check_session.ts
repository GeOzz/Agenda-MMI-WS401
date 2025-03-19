import { db } from './db';
import { sessions } from './db/schema';
import { eq } from 'drizzle-orm';

export async function checkSessionValide(session: string) {
	const SESSION_EXISTANTE = await db.query.sessions.findFirst({
		where: eq(sessions.id_session, session)
	});
	if (!SESSION_EXISTANTE) {
		return false;
	}
	if (SESSION_EXISTANTE.expire_le_timestamp! < Date.now()) {
		return false;
	}
	return SESSION_EXISTANTE;
}
