import { EvenementDeGroupe, EvenementIndividuel } from "../../../../common/evenements";
import { Partie } from "../partie";
import { InfectPereDesLoups } from "../Personnages/infectPereDesLoups";
import { Villageois } from "../Personnages/villageois";
import { IA } from "./ia";

export class IAInfectPereDesLoups extends IA{

    constructor(infectPereDesLoups: InfectPereDesLoups, partie: Partie){
        super(infectPereDesLoups, partie);
    }

    jouerUnEvenement(evenement: EvenementDeGroupe|EvenementIndividuel): void{
        super.jouerUnEvenement(evenement);
        if(+evenement == EvenementIndividuel.JOUER_INFECTE_PERE_LOUPS){
            const joueurs: Villageois[] = this.joueursAucuneRaisonPasVoter(false)
            if(this.partie.random(2)==0){
                this.villageois.choisirJoueur(this.getVillageoisAuHasard(joueurs), evenement, false)
            }
        }
    }

}