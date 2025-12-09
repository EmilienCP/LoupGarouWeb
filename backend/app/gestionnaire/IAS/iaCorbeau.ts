import { EvenementDeGroupe, EvenementIndividuel } from "../../../../common/evenements";
import { Partie } from "../partie";
import { Corbeau } from "../Personnages/corbeau";
import { IA } from "./ia";

export class IACorbeau extends IA{
    constructor(corbeau: Corbeau, partie: Partie){
        super(corbeau, partie);
    }

    jouerUnEvenement(evenement: EvenementDeGroupe|EvenementIndividuel): void{
        super.jouerUnEvenement(evenement);
        if(+evenement == EvenementIndividuel.JOUER_CORBEAU){
            this.villageois.choisirJoueur(this.getMaxOuMinCote(false, this.joueursAucuneRaisonPasVoter(true)), evenement, false);
        }
    }
}