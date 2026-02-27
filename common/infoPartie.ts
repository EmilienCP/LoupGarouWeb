import { EtatsSpeciaux, Joueur, Role } from "./Joueur";
import { InfoAppareil } from "./infoAppareil";
import { InfoPointsDeVictoire } from "./infoPointsDeVictoire";
import { EtatPartie } from "./joindrePartieInfo";

export interface InfoPartie {
    noms: string[][],
    etat: EtatPartie
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
    rolesVivants: (Role|EtatsSpeciaux)[];
    rolesMorts: (Role|EtatsSpeciaux)[];
    appareils: InfoAppareil[];
}