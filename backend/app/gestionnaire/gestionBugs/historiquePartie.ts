import { Role } from "../../../../common/Joueur"

export enum Action{
    PROCHAINE_ETAPE,
    VOTER_VILLAGEOIS,
    PASSER,
    OUI_SERVANTE_DEVOUEE,
    POP_RAISON_PAS_VOTER,
    GET_UN_EVENEMENT
}

export interface HistoriquePartie{
    seed: number,
    nbAppareils: number,
    nbJoueurs: number,
    nbLoups: number,
    choixPersonnages: Role[],
    modeVillageoisVillageois: boolean,
    modePatateChaude: boolean,
    modeExtensionVillage: boolean,
    actions: number[][],
    modeVideo: boolean,
    meneurDeJeu: boolean,
    noms: string[][],
    points: number[][]
}