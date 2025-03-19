import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const utilisateurs = sqliteTable('utilisateurs', {
	id: integer('id').primaryKey(),
	nom: text('nom'),
	prenom: text('prenom'),
	email: text('email'),
	mot_de_passe: text('mot_de_passe'),
	promotion: text('promotion'),
	groupeTD: text('groupeTD'),
	groupeTP: text('groupeTP')
});

export const sessions = sqliteTable('sessions', {
	id: integer('id'),
	id_utilisateur: integer('id_utilisateur').references(() => utilisateurs.id),
	id_session: text('id_session').primaryKey(),
	expire_le_timestamp: integer('expire_le_timestamp')
});
