import { EvenementDeGroupe, EvenementIndividuel } from "../../../../common/evenements";
import { Partie } from "../partie";
import { LoupBlanc } from "../Personnages/loupBlanc";
import { Villageois } from "../Personnages/villageois";
import { IA } from "./ia";

export class IALoupBlanc extends IA{

    constructor(loupBlanc: LoupBlanc, partie: Partie){
        super(loupBlanc, partie);
    }

    jouerUnEvenement(evenement: EvenementDeGroupe|EvenementIndividuel): void{
        super.jouerUnEvenement(evenement);
        if(+evenement == EvenementIndividuel.JOUER_LOUP_BLANC){
            let loupsPotentiels: Villageois[] = this.joueursAucuneRaisonPasVoter(false).filter((loup: Villageois)=>{
                return this.villageois.amoureux !== loup;
            });
            //doit enlever lamoureux pour le calcul, pcq l'amoureux va aider a tuer les autres
            if(loupsPotentiels.length >= this.partie.joueursVivants.length/3){
                this.villageois.choisirJoueur(this.getMaxOuMinCote(false, loupsPotentiels), evenement, false)
            }
        }
    }

}