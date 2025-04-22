export interface IUtilisateur {
	id: number;
	nom: string;
	prenom: string;
	email: string;
	role: ERoleUtilisateur;
	mot_de_passe: string;
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

export const MATIERES = [
	{
		id: 'WS601',
		nom: 'WS601 - Espagnol'
	},
	{
		id: 'WS602',
		nom: 'WS602 - Concevoir un dispositif interactif'
	},
	{
		id: 'WR601',
		nom: 'WR601 - Anglais'
	},
	{
		id: 'WR603',
		nom: "WR603 - Design d'expérience"
	},
	{
		id: 'WS501',
		nom: 'WS501 - Espagnol'
	},
	{
		id: 'WS502',
		nom: 'WS502 - Concevoir un dispositif interactif'
	},
	{
		id: 'WR501',
		nom: 'WR501 - Anglais'
	},
	{
		id: 'WR503',
		nom: "WR503 - Design d'expérience"
	},
	{
		id: 'WS401',
		nom: 'WS401 - Développer pour le Web'
	},
	{
		id: 'WS402',
		nom: 'WS402 - Concevoir un dispositif interactif'
	},
	{
		id: 'WR401',
		nom: 'WR401 - Anglais'
	},
	{
		id: 'WR403',
		nom: "WR403 - Design d'expérience"
	},
	{
		id: 'WS301',
		nom: "WS301 - Développer des parcours utilisateur au sein d'un système d'information"
	},
	{
		id: 'WS302',
		nom: 'WS302 - Produire des contenus pour une communication plurimédia'
	},
	{
		id: 'WR303',
		nom: "WR303 - Design d'expérience"
	},
	{
		id: 'WR304',
		nom: 'WR304 - Culture numérique'
	},
	{
		id: 'WS201',
		nom: 'WS201 - Culture artistique'
	},
	{
		id: 'WS202',
		nom: 'WS202 - Gestion de contenus'
	},
	{
		id: 'WR213',
		nom: 'WR213 - Développement Web'
	},
	{
		id: 'WR215',
		nom: 'WR215 - Hébergement'
	},
	{
		id: 'WS101',
		nom: 'WS101 - Anglais'
	},
	{
		id: 'WS102',
		nom: 'WS102 - Anglais Renforcé'
	},
	{
		id: 'WR105',
		nom: 'WR105 - Stratégies de communication et marketing'
	},
	{
		id: 'WR108',
		nom: 'WR108 - Production graphique'
	}
];

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
	DELEGUE = 'DELEGUE',
	PROFESSEUR = 'PROFESSEUR',
	ETUDIANT = 'ETUDIANT',
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
	[ERoleUtilisateur.DELEGUE]: [],
	[ERoleUtilisateur.ETUDIANT]: []
};
