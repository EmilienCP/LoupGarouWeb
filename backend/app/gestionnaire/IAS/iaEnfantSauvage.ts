import { EvenementDeGroupe, EvenementIndividuel } from "../../../../common/evenements";
import { Partie } from "../partie";
import { EnfantSauvage } from "../Personnages/enfantSauvage";
import { IA } from "./ia";

export class IAEnfantSauvage extends IA{

    constructor(enfantSauvage: EnfantSauvage, partie: Partie){
        super(enfantSauvage, partie);
    }

    jouerUnEvenement(evenement: EvenementDeGroupe|EvenementIndividuel): void{
        super.jouerUnEvenement(evenement);
        if(+evenement == EvenementIndividuel.JOUER_ENFANT_SAUVAGE){
            this.villageois.choisirJoueur(this.getVillageoisAuHasard(this.joueursAucuneRaisonPasVoter(false)), evenement, false);
        }
    }

}