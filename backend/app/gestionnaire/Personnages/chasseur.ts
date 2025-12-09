import { RaisonAccusation } from "../../../../common/accusation";
import { EvenementDeGroupe, EvenementIndividuel, RaisonPasVoter } from "../../../../common/evenements";
import { Role } from "../../../../common/Joueur";
import { Partie } from "../partie";
import { Villageois } from "./villageois";

export class Chasseur extends Villageois{

    choix?: Villageois;

    constructor(partie: Partie){
        super(false, partie);
        this.role = Role.CHASSEUR;
    }

    jouerChasseur(){
        this.ajouterEvenementIndividuelSansRaisons(EvenementIndividuel.JOUER_CHASSEUR);
        this.raisonsPasVoter.push(this.getRaisonsPasVoter([RaisonPasVoter.SOI_MEME, RaisonPasVoter.DEJA_MORT]));
    }

    choisirJoueur(cible: Villageois, evenement: EvenementIndividuel | EvenementDeGroupe, passerSiUndefined: boolean, raisonAccusation: RaisonAccusation = RaisonAccusation.AUCUN): void {
        super.choisirJoueur(cible, evenement, passerSiUndefined, raisonAccusation);
        if(+evenement == EvenementIndividuel.JOUER_CHASSEUR){
            if(this.partie.seed){
                console.log("le chasseur "+this.nom+" tue avec lui: "+cible.nom)
            }
            this.choix = cible;
        }
    }
}