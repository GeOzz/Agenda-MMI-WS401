import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const utilisateurs = sqliteTable('utilisateurs', {
	id: integer('id').primaryKey(),
	nom: text('nom'),
	prenom: text('prenom'),
	email: text('email'),
	role: text('role').notNull().default('Etudiant'), // Ajoutez une valeur par défaut pour le rôle
	mot_de_passe: text('mot_de_passe'),
	promotion: text('promotion'),
	groupeTD: text('groupeTD'),
	groupeTP: text('groupeTP')
});

export const sessions = sqliteTable('sessions', {
	id: integer('id').primaryKey(),
	id_utilisateur: integer('id_utilisateur').references(() => utilisateurs.id),
	id_session: text('id_session').notNull(),
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
	timestamp: integer('timestamp'),
	titre: text('titre').notNull()
});

export const votes_devoir = sqliteTable('votes_devoir', {
	id: integer('id').primaryKey(),
	devoir_id: integer('devoir_id').references(() => devoirs.id),
	utilisateur_id: integer('utilisateur_id').references(() => utilisateurs.id),
	vote: integer('vote'),
	timestamp: integer('timestamp')
});

export const historique = sqliteTable('historique', {
	id: integer('id').primaryKey(),
	json: text('json'),
	timestamp: integer('timestamp')
});
