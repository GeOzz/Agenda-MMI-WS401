CREATE TABLE `devoirs` (
	`id` integer PRIMARY KEY NOT NULL,
	`promotion` text,
	`matiere` text,
	`markdown` text,
	`utilisateur_id_createur` integer,
	`expire_le_timestamp` integer,
	`groupes` text,
	`timestamp` integer,
	`titre` text NOT NULL,
	FOREIGN KEY (`utilisateur_id_createur`) REFERENCES `utilisateurs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` integer PRIMARY KEY NOT NULL,
	`id_utilisateur` integer,
	`id_session` text NOT NULL,
	`expire_le_timestamp` integer,
	FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateurs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `utilisateurs` (
	`id` integer PRIMARY KEY NOT NULL,
	`nom` text,
	`prenom` text,
	`email` text,
	`role` text DEFAULT 'Etudiant' NOT NULL,
	`mot_de_passe` text,
	`promotion` text,
	`groupeTD` text,
	`groupeTP` text
);
--> statement-breakpoint
CREATE TABLE `votes_devoir` (
	`id` integer PRIMARY KEY NOT NULL,
	`devoir_id` integer,
	`utilisateur_id` integer,
	`vote` integer,
	`timestamp` integer,
	FOREIGN KEY (`devoir_id`) REFERENCES `devoirs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs`(`id`) ON UPDATE no action ON DELETE no action
);
