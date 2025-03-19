export interface IUtilisateur {
	id: number;
	nom: string;
	prenom: string;
	email: string;
	password: string;
	promotion: string;
	groupeTD: string;
	groupeTP: string;
}

export interface IDevoir {
	id: number;
	promotion: string;
	matiere: string;
	markdown: string;
	utilisateur_id_createur: number;
	expire_le_timestamp: number;
	groupes: string[];
	timestamp: number;
}

export interface VoteDevoir {
	id: number;
	devoir_id: number;
	utilisateur_id: number;
	vote: number;
	timestamp: number;
}

export enum EPromotion {
	PREMIERE_ANNEE = '1ère Année (BUT1)',
	DEUXIEME_ANNEE = '2ème Année (BUT2)',
	TROISIEME_ANNEE = '3ème Année (BUT3)'
}
export enum EGroupeTD {
	TD_AB = 'TD AB',
	TD_CD = 'TD CD',
	TD_EF = 'TD EF',
	TD_GH = 'TD GH',
	TD_IJ = 'TD IJ'
}
export enum EGroupeTP {
	TP_A = 'TP A',
	TP_B = 'TP B',
	TP_C = 'TP C',
	TP_D = 'TP D',
	TP_E = 'TP E',
	TP_F = 'TP F',
	TP_G = 'TP G',
	TP_H = 'TP H',
	TP_I = 'TP I',
	TP_J = 'TP J'
}

export enum ERoleUtilisateur {
	PROFESSEUR = 'PROFESSEUR',
	DELEGUEE = 'DELEGUEE',
	ETUDIANT = 'ETUDIANT'
}

export enum EPermissions {
	CREE_DEVOIR = 'CREE_DEVOIR',
	MODIFIE_DEVOIR = 'MODIFIE_DEVOIR',
	MODIFIER_MON_DEVOIR = 'MODIFIER_MON_DEVOIR',
	SUPPRIME_DEVOIR = 'SUPPRIME_DEVOIR',

	ACCEPTE_DEVOIR = 'ACCEPTE_DEVOIR',
	REJETE_DEVOIR = 'REJETE_DEVOIR'
}

export const PermissionParRole = {
	[ERoleUtilisateur.PROFESSEUR]: [
		EPermissions.CREE_DEVOIR,
		EPermissions.MODIFIE_DEVOIR,
		EPermissions.MODIFIER_MON_DEVOIR,
		EPermissions.SUPPRIME_DEVOIR,
		EPermissions.ACCEPTE_DEVOIR,
		EPermissions.REJETE_DEVOIR
	],
	[ERoleUtilisateur.DELEGUEE]: [],
	[ERoleUtilisateur.ETUDIANT]: []
};
