import { RaisonAccusation } from "../../../../common/accusation";
import { EvenementDeGroupe, EvenementIndividuel, RaisonPasVoter } from "../../../../common/evenements";
import { Equipe, Role } from "../../../../common/Joueur";
import { Partie } from "../partie";
import { Villageois } from "./villageois";

export class FemmeDeMenage extends Villageois{

    joueurMenage?: Villageois;

    constructor(partie: Partie){
        super(false, partie);
        this.role = Role.FEMME_DE_MENAGE;
    }

    protected jouerRole(): void {
        if(this.equipeApparente == Equipe.VILLAGEOIS){
            this.ajouterEvenementIndividuelSansRaisons(EvenementIndividuel.JOUER_FEMME_DE_MENAGE);
            const raisons: RaisonPasVoter[] = this.getRaisonsPasVoter([RaisonPasVoter.SOI_MEME]);
            this.raisonsPasVoter.push(raisons);
        }
    }

    choisirJoueur(cible: Villageois, evenement: EvenementIndividuel | EvenementDeGroupe, passerSiUndefined: boolean, raisonAccusation: RaisonAccusation = RaisonAccusation.AUCUN): void {
        super.choisirJoueur(cible, evenement, passerSiUndefined, raisonAccusation);
        if(evenement == EvenementIndividuel.JOUER_FEMME_DE_MENAGE) {
            this.joueurMenage = cible;
        }
    }

    actionFinNuit(): void {
        super.actionFinNuit();
        this.joueurMenage = undefined;
    }
}