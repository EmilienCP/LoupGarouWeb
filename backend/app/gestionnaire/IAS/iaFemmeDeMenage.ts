import { EvenementDeGroupe, EvenementIndividuel } from "../../../../common/evenements";
import { Partie } from "../partie";
import { FemmeDeMenage } from "../Personnages/femmeDeMenage";
import { IA } from "./ia";

export class IAFemmeDeMenage extends IA{
    constructor(femmeDeMenage: FemmeDeMenage, partie: Partie){
        super(femmeDeMenage, partie);
    }

    jouerUnEvenement(evenement: EvenementDeGroupe|EvenementIndividuel): void{
        super.jouerUnEvenement(evenement);
        if(+evenement == EvenementIndividuel.JOUER_FEMME_DE_MENAGE){
            this.villageois.choisirJoueur(this.getMaxOuMinCote(false, this.joueursAucuneRaisonPasVoter(true)), evenement, false);
        }
    }
}