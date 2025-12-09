import { Equipe, Role } from "../../../../common/Joueur";
import { EvenementDeGroupe, EvenementIndividuel, RaisonPasVoter, Victoire } from "../../../../common/evenements";
import { Partie } from "../partie";
import { Villageois } from "./villageois";
import { RaisonAccusation } from "../../../../common/accusation";

export class Cupidon extends Villageois{

    amoureux1?: Villageois;

    constructor(partie: Partie){
        super(false, partie);
        this.role = Role.CUPIDON;
    }

    actionIntro(): void {
        // a lintro pour que les amoureux se connaissent pendant la nuit
        this.ajouterEvenementIndividuelSansRaisons(EvenementIndividuel.JOUER_CUPIDON);
        this.raisonsPasVoter.push(this.getRaisonsPasVoter([]));
    }

    private ajouterRaisonsPasVoterCupidon(): RaisonPasVoter[]{
        const raisonsPasVoter: RaisonPasVoter[] = this.getRaisonsPasVoter([]);
        raisonsPasVoter[this.partie.joueursVivants.indexOf(this.amoureux1!)] = RaisonPasVoter.DEJA_CHOISI;
        return raisonsPasVoter;
    }

    choisirJoueur(cible: Villageois, evenement: EvenementIndividuel | EvenementDeGroupe, passerSiUndefined: boolean, raisonAccusation: RaisonAccusation = RaisonAccusation.AUCUN): void {
        super.choisirJoueur(cible, evenement, passerSiUndefined, raisonAccusation);
        if(+evenement == EvenementIndividuel.JOUER_CUPIDON){
            if(!this.amoureux1){
                this.amoureux1 = cible;
                this.raisonsPasVoter.unshift(this.ajouterRaisonsPasVoterCupidon());
            } else {
                if(this.partie.seed){
                    console.log("les amoureux sont : "+this.amoureux1.nom + " et "+cible.nom)
                }
                this.amoureux1.amoureux = cible;
                this.amoureux1.ajouterEvenementIndividuelSansRaisons(EvenementIndividuel.INFO_AMOUREUX)
                this.amoureux1.equipeReelle = Equipe.INDEPENDANT;
                cible.amoureux = this.amoureux1;
                cible.ajouterEvenementIndividuelSansRaisons(EvenementIndividuel.INFO_AMOUREUX)
                cible.equipeReelle = Equipe.INDEPENDANT;
                this.amoureux1 = undefined;
            }
        } 
    }

    pointsDeVictoire(): number{
        if(this.partie.victoire == Victoire.AMOUREUX){
            return super.pointsDeVictoire()+1;
        } else {
            return super.pointsDeVictoire();
        }
    }
}