import { EvenementDeGroupe, EvenementIndividuel } from "../../../../common/evenements";
import { Equipe } from "../../../../common/Joueur";
import { Partie } from "../partie";
import { TroisFreres } from "../Personnages/troisFreres";
import { Villageois } from "../Personnages/villageois";
import { IA } from "./ia";

export class IATroisFreres extends IA{
    constructor(troisFrere: TroisFreres, partie: Partie){
        super(troisFrere, partie);
    }

    jouerUnEvenement(evenement: EvenementDeGroupe|EvenementIndividuel): void{
        super.jouerUnEvenement(evenement);
        if(+evenement == EvenementIndividuel.JOUER_VILLAGEOIS){
            if(this.partie.numeroJour < 2){
                (this.villageois as TroisFreres).deuxFreres.forEach((frere: Villageois)=>{
                    this.augmenterDiminuerCote(frere, 2, true);
                })
            }
        }
    }

    mettreAJourNouveauVillage(): void {
        super.mettreAJourNouveauVillage();
        if(this.villageois.equipeReelle == Equipe.VILLAGEOIS){
            (this.villageois as TroisFreres).deuxFreres.forEach((frere: Villageois)=>{
                if(this.partie.joueursVivants.includes(frere) && this.siJoueurSafe(frere, true, false, false, false, true)){
                    this.ajouterJoueursMemeEquipeAssuree(frere)
                }
            });
        }
    }
}