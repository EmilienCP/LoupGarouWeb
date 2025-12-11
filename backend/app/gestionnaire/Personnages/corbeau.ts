import { RaisonAccusation } from "../../../../common/accusation";
import { EvenementDeGroupe, EvenementIndividuel, RaisonPasVoter } from "../../../../common/evenements";
import { Role } from "../../../../common/Joueur";
import { Partie } from "../partie";
import { Villageois } from "./villageois";

export class Corbeau extends Villageois{

    joueurVu?: Villageois;

    constructor(partie: Partie){
        super(false, partie);
        this.role = Role.CORBEAU;
    }

    protected jouerRole(): void {
        this.joueurVu = undefined;
        this.ajouterEvenementIndividuelSansRaisons(EvenementIndividuel.JOUER_CORBEAU);
        const raisons: RaisonPasVoter[] = this.getRaisonsPasVoter([RaisonPasVoter.SOI_MEME]);
        this.raisonsPasVoter.push(raisons);
    }

    choisirJoueur(cible: Villageois, evenement: EvenementIndividuel | EvenementDeGroupe, passerSiUndefined: boolean, raisonAccusation: RaisonAccusation = RaisonAccusation.AUCUN): void {
        super.choisirJoueur(cible, evenement, passerSiUndefined, raisonAccusation);
        if(evenement == EvenementIndividuel.JOUER_CORBEAU) {
            this.joueurVu = cible;
        }
    }

    actionNuit(): void {
        if(this.patateChaude){
            const raisons: RaisonPasVoter[] = this.getRaisonsPasVoter([RaisonPasVoter.SOI_MEME]);
            const joueursPeutChoisir: Villageois[] = this.partie.joueursVivants.filter((joueur: Villageois, index: number)=> raisons[index]==RaisonPasVoter.AUCUN);
            this.joueurVu = joueursPeutChoisir[Math.floor(this.partie.random(joueursPeutChoisir.length))];
        }
        super.actionNuit();
    }
}