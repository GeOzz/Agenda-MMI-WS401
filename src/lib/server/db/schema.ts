import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const utilisateurs = sqliteTable('utilisateurs', {
	id: integer('id').primaryKey(),
	nom: text('nom'),
	prenom: text('prenom'),
	email: text('email'),
	role: text('role'),
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

export const devoirs = sqliteTable('devoirs', {
	id: integer('id').primaryKey(),
	promotion: text('promotion'),
	matiere: text('matiere'),
	markdown: text('markdown'),
	utilisateur_id_createur: integer('utilisateur_id_createur').references(() => utilisateurs.id),
	expire_le_timestamp: integer('expire_le_timestamp'),
	groupes: text('groupes'),
	timestamp: integer('timestamp')
});

export const votes_devoir = sqliteTable('votes_devoir', {
	id: integer('id').primaryKey(),
	devoir_id: integer('devoir_id').references(() => devoirs.id),
	utilisateur_id: integer('utilisateur_id').references(() => utilisateurs.id),
	vote: integer('vote'),
	timestamp: integer('timestamp')
});
