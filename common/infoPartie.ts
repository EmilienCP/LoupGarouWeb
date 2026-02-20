import { Joueur, Role } from "./Joueur";
import { InfoPointsDeVictoire } from "./infoPointsDeVictoire";

export interface InfoPartie {
    noms: string[][],
    nbJoueurs: number,
    nbLoups: number,
    nbVillageois: number,
    joueursSpeciaux: boolean[],
    idMeneurDeJeu: number;
    isMeneurDeJeu: boolean;
    isUnMeneurDeJeu: boolean;
    modeVideo: boolean;
    modePatateChaude: boolean;
    modeVillageoisVillageois: boolean;
    modeExtensionVillage: boolean;
    backup: boolean;
    idAppareil: number;
    idJeu: number;
    preferencesPersonnages: Role[];
    infosPointsDeVictoire: InfoPointsDeVictoire[];
    numeroJour: number;
    nbJoueursConnectesVivants: number;
    village: Joueur[];
}