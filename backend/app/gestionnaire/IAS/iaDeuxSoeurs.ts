import { EvenementDeGroupe, EvenementIndividuel } from "../../../../common/evenements";
import { Equipe } from "../../../../common/Joueur";
import { Partie } from "../partie";
import { DeuxSoeurs } from "../Personnages/deuxSoeurs";
import { Villageois } from "../Personnages/villageois";
import { IA } from "./ia";

export class IADeuxSoeurs extends IA{
    constructor(deuxSoeurs: DeuxSoeurs, partie: Partie){
        super(deuxSoeurs, partie);
    }

    jouerUnEvenement(evenement: EvenementDeGroupe|EvenementIndividuel): void{
        super.jouerUnEvenement(evenement);
        if(+evenement == EvenementIndividuel.JOUER_VILLAGEOIS){
            if(this.partie.numeroJour < 2){
                this.augmenterDiminuerCote((this.villageois as DeuxSoeurs).deuxiemeSoeur, 2, true);
            }
        }
    }

    mettreAJourNouveauVillage(): void {
        super.mettreAJourNouveauVillage();
        if(this.villageois.equipeReelle == Equipe.VILLAGEOIS){
            const deuxiemeSoeur: Villageois = (this.villageois as DeuxSoeurs).deuxiemeSoeur;
            if(this.partie.joueursVivants.includes(deuxiemeSoeur) && this.siJoueurSafe(deuxiemeSoeur, true, false, false, false, true)){
                this.ajouterJoueursMemeEquipeAssuree(deuxiemeSoeur);
            }
        }
    }
}