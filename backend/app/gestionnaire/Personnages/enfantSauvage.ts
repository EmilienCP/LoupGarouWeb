import { RaisonAccusation } from "../../../../common/accusation";
import { EvenementDeGroupe, EvenementIndividuel, RaisonPasVoter } from "../../../../common/evenements";
import { Equipe, Role } from "../../../../common/Joueur";
import { Partie } from "../partie";
import { Villageois } from "./villageois";

export class EnfantSauvage extends Villageois{
    joueurAssocie?: Villageois;

    constructor(partie: Partie){
        super(false, partie);
        this.role = Role.ENFANT_SAUVAGE;
    }

    actionIntro(): void {
        this.ajouterEvenementIndividuelSansRaisons(EvenementIndividuel.JOUER_ENFANT_SAUVAGE);
        this.raisonsPasVoter.push(this.getRaisonsPasVoter([RaisonPasVoter.SOI_MEME]));
    }

    choisirJoueur(cible: Villageois, evenement: EvenementIndividuel | EvenementDeGroupe, passerSiUndefined: boolean, raisonAccusation: RaisonAccusation = RaisonAccusation.AUCUN): void {
        super.choisirJoueur(cible, evenement, passerSiUndefined,raisonAccusation);
        if(evenement == EvenementIndividuel.JOUER_ENFANT_SAUVAGE) {
            this.joueurAssocie = cible;
        }
    }

    nouveauMort(morts: Villageois[]): void{
        if(this.joueurAssocie && morts.includes(this.joueurAssocie)){
            this.equipeApparente = Equipe.LOUPS;
            if(this.equipeReelle == Equipe.VILLAGEOIS) {
                this.equipeReelle = Equipe.LOUPS;
            }
            this.unshiftEvenementIndividuelSansRaisons(EvenementIndividuel.INFO_ASSOCIER_MORT);
            this.joueurAssocie = undefined;
        }
    }

    annulerRole(servanteAPrisSonRole: boolean): void {
        super.annulerRole(servanteAPrisSonRole);
        if(this.joueurAssocie){
            this.joueurAssocie = undefined;
        }
    }

    actionExServante(joueurQuelleAPris: Villageois): void {
        super.actionExServante(joueurQuelleAPris);
        this.actionIntro();
    }

    changerPointeur(ancienJoueur: Villageois, nouveauJoueur: Villageois): void {
        if(this.joueurAssocie == ancienJoueur){
            this.joueurAssocie = nouveauJoueur;
        }
    }
}