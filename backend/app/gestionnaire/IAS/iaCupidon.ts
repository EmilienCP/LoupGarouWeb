import { EvenementDeGroupe, EvenementIndividuel } from "../../../../common/evenements";
import { Partie } from "../partie";
import { Cupidon } from "../Personnages/cupidon";
import { Villageois } from "../Personnages/villageois";
import { IA } from "./ia";

export class IACupidon extends IA{

    constructor(cupidon: Cupidon, partie: Partie){
        super(cupidon, partie);
    }

    jouerUnEvenement(evenement: EvenementDeGroupe|EvenementIndividuel): void{
        super.jouerUnEvenement(evenement);
        if(+evenement == EvenementIndividuel.JOUER_CUPIDON){
            let choix1: Villageois = this.getVillageoisAuHasard(this.joueursAucuneRaisonPasVoter(false));
            this.villageois.choisirJoueur(choix1, evenement, false);
            let choix2: Villageois = this.getVillageoisAuHasard(this.joueursAucuneRaisonPasVoter(false));
            this.villageois.choisirJoueur(choix2, evenement, false);
            this.augmenterDiminuerCote(choix1, 2, true);
            this.augmenterDiminuerCote(choix2, 2, true);
        }
    }

    siJoueurSafe(joueur: Villageois, enAmour: boolean, joueurDeFlute: boolean, enfantSauvage: boolean, loupBlanc: boolean, infecte: boolean): boolean {
        //indifferent des amoureux, pas besoin de savoir cest qui
        return super.siJoueurSafe(joueur, false, joueurDeFlute, enfantSauvage, loupBlanc, infecte);
    }

}