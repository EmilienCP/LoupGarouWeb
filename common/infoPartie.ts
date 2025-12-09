import { Role } from "./Joueur";
import { InfoPointsDeVictoire } from "./infoPointsDeVictoire";

export interface InfoPartie{
    noms: string[][],
    nbJoueurs: number,
    nbLoups: number,
    nbVillageois: number,
    joueursSpeciaux: boolean[],
    idMeneurDeJeu: number;
    modeVideo: boolean;
    modePatateChaude: boolean;
    modeVillageoisVillageois: boolean;
    backup: boolean;
    idAppareil: number;
    idJeu: number;
    preferencesPersonnages: Role[];
    infosPointsDeVictoire: InfoPointsDeVictoire[];
    numeroJour: number;
}