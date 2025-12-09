import { EvenementDeGroupe, EvenementIndividuel } from "../../../../common/evenements";
import { Partie } from "../partie";
import { Chasseur } from "../Personnages/chasseur";
import { IA } from "./ia";

export class IAChasseur extends IA{
    constructor(chasseur: Chasseur, partie: Partie){
        super(chasseur, partie);
    }

    jouerUnEvenement(evenement: EvenementDeGroupe|EvenementIndividuel): void{
        super.jouerUnEvenement(evenement);
        if(+evenement == EvenementIndividuel.JOUER_CHASSEUR){
            this.villageois.choisirJoueur(this.getMaxOuMinCote(false, this.joueursAucuneRaisonPasVoter(false)), evenement, false)
        }
    }
}