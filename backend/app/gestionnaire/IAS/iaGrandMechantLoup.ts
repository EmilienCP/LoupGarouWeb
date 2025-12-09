import { EvenementDeGroupe, EvenementIndividuel } from "../../../../common/evenements";
import { Partie } from "../partie";
import { GrandMechantLoup } from "../Personnages/grantMechantLoup";
import { Villageois } from "../Personnages/villageois";
import { IA } from "./ia";

export class IAGrandMechantLoup extends IA{

    constructor(grandMechantLoup: GrandMechantLoup, partie: Partie){
        super(grandMechantLoup, partie);
    }

    jouerUnEvenement(evenement: EvenementDeGroupe|EvenementIndividuel): void{
        super.jouerUnEvenement(evenement);
        if(+evenement == EvenementIndividuel.JOUER_GRAND_MECHANT_LOUP){
            let villageoisPotentiels: Villageois[] = this.joueursAucuneRaisonPasVoter(false);
            this.villageois.choisirJoueur(this.getMaxOuMinCote(false, villageoisPotentiels), evenement, false)
        }
    }

}