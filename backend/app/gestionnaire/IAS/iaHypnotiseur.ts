import { EvenementDeGroupe, EvenementIndividuel } from "../../../../common/evenements";
import { Partie } from "../partie";
import { Hypnotiseur } from "../Personnages/hypnotiseur";
import { IA } from "./ia";

export class IAHypnotiseur extends IA{
    constructor(hypnotiseur: Hypnotiseur, partie: Partie){
        super(hypnotiseur, partie);
    }

    jouerUnEvenement(evenement: EvenementDeGroupe|EvenementIndividuel): void{
        super.jouerUnEvenement(evenement);
        if(+evenement == EvenementIndividuel.JOUER_HYPNOTISEUR){
            this.villageois.choisirJoueur(this.getMaxOuMinCote(false, this.joueursAucuneRaisonPasVoter(true)), evenement, false);
        }
    }
}