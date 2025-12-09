export enum Role{
    VILLAGEOIS,
    LOUP_GAROU,
    VILLAGEOIS_VILLAGEOIS,
    VOYANTE,
    CUPIDON,
    SORCIERE,
    CHASSEUR,
    INFECT_PERE_LOUPS,
    MONTREUR_OURS,
    RENARD,
    CORBEAU,
    FEMME_DE_MENAGE,
    HYPNOTISEUR,
    JOUEUR_DE_FLUTE,
    ENFANT_SAUVAGE,
    LOUP_BLANC,
    SERVANTE_DEVOUEE,
    CHEVALIER_A_LEPEE_ROUILLEE,
    DEUX_SOEURS,
    TROIS_FRERES,
    GRAND_MECHANT_LOUP
}

export enum RolePublic{
    VAGABOND,
    FERMIER,
    INSTITUTRICE
}

export enum Equipe{
    VILLAGEOIS,
    LOUPS,
    INDEPENDANT
}

export interface Joueur{
    nom: string;
    role?: Role;
    rolePublic?: RolePublic;
    equipeApparente: Equipe;
    equipeReelle: Equipe;
    estCapitaine: boolean;
    amoureux?: string;
    estInfecte: boolean;
    soiMeme: boolean;
    estCharmer: boolean;
    estAssocier: boolean;
    estSoeur: boolean;
    estFrere: boolean;
}

export interface JoueurExtensionLoups{
    nombreVotes: number;
    joueursQuiLePointent: string[];
}