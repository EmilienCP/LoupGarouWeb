import { EvenementDeGroupe, EvenementIndividuel } from "../../../../common/evenements";
import { Partie } from "../partie";
import { ServanteDevouee } from "../Personnages/servanteDevouee";
import { IA } from "./ia";

export class IAServanteDevouee extends IA{

    constructor(servante: ServanteDevouee, partie: Partie){
        super(servante, partie);
    }

    jouerUnEvenement(evenement: EvenementDeGroupe|EvenementIndividuel): void {
        super.jouerUnEvenement(evenement);
        if(+evenement == EvenementDeGroupe.SERVANTE_DEVOUEE_QUESTION || +evenement == EvenementDeGroupe.SERVANTE_DEVOUEE_QUESTION_MENEUR){
            if(this.partie.random(3)==0){
                (this.villageois as ServanteDevouee).ouiVeutPrendrePersonnage();
            }
        } else if(+evenement == EvenementIndividuel.JOUER_SERVANTE_DEVOUEE){
            this.villageois.choisirJoueur(this.getVillageoisAuHasard(this.joueursAucuneRaisonPasVoter(false)), evenement, false)
        }
    }
}