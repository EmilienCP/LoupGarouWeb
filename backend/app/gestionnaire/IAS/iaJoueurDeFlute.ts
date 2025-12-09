import { EvenementDeGroupe, EvenementIndividuel } from "../../../../common/evenements";
import { Partie } from "../partie";
import { JoueurDeFlute } from "../Personnages/joueurDeFlute";
import { Villageois } from "../Personnages/villageois";
import { IA } from "./ia";

export class IAJoueurDeFlute extends IA{
    constructor(joueurDeFlute: JoueurDeFlute, partie: Partie){
        super(joueurDeFlute, partie);
    }

    jouerUnEvenement(evenement: EvenementDeGroupe|EvenementIndividuel): void{
        super.jouerUnEvenement(evenement);
        if(+evenement == EvenementIndividuel.JOUER_JOUEUR_DE_FLUTE){
            let joueursPossibles: Villageois[] = this.joueursAucuneRaisonPasVoter(true);
            if(joueursPossibles.length>0){
                this.villageois.choisirJoueur(this.getVillageoisAuHasard(joueursPossibles), evenement, true);joueursPossibles = this.joueursAucuneRaisonPasVoter(true);
                if(joueursPossibles.length>0){
                    this.villageois.choisirJoueur(this.getVillageoisAuHasard(joueursPossibles), evenement, true);
                }
            }
        }
    }
}