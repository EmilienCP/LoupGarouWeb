import { RaisonAccusation } from "../../../../common/accusation";
import { EvenementDeGroupe, EvenementIndividuel, RaisonPasVoter } from "../../../../common/evenements";
import { Role } from "../../../../common/Joueur";
import { Partie } from "../partie";
import { Villageois } from "./villageois";

export class ServanteDevouee extends Villageois{

    cible: Villageois;
    veutPrendrePersonnage: boolean = false;

    constructor(partie: Partie){
        super(false, partie);
        this.role = Role.SERVANTE_DEVOUEE;
    }

    choisirJoueur(cible: Villageois, evenement: EvenementIndividuel | EvenementDeGroupe, passerSiUndefined: boolean, raisonAccusation: RaisonAccusation = RaisonAccusation.AUCUN): void {
        super.choisirJoueur(cible, evenement, passerSiUndefined, raisonAccusation);
        if(evenement == EvenementIndividuel.JOUER_SERVANTE_DEVOUEE) {
            if(this.partie.seed){
                console.log("La servante, "+ this.nom+ " prend le role de: "+cible.nom)
            }
            this.cible = cible;
        }
    }

    ouiVeutPrendrePersonnage(): void {
        this.veutPrendrePersonnage = true;
    }

    jouerServante(): boolean{
        if(this.partie.joueursMorts.length == 1){
            this.choisirJoueur(this.partie.joueursMorts[0], EvenementIndividuel.JOUER_SERVANTE_DEVOUEE, false);
            return true;
        }
        this.ajouterEvenementIndividuelSansRaisons(EvenementIndividuel.JOUER_SERVANTE_DEVOUEE);
        const raisons: RaisonPasVoter[] = this.getRaisonsPasVoter([RaisonPasVoter.PAS_MORT]);
        this.raisonsPasVoter.push(raisons);
        return false;
    }
}