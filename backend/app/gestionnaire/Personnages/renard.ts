import { RaisonAccusation } from "../../../../common/accusation";
import { EvenementDeGroupe, EvenementIndividuel, RaisonPasVoter } from "../../../../common/evenements";
import { Equipe, Role } from "../../../../common/Joueur";
import { Partie } from "../partie";
import { Villageois } from "./villageois";


export class Renard extends Villageois {

    cible?: Villageois;

    constructor(partie: Partie) {
        super(false, partie);
        this.role = Role.RENARD;
    }
    
    regarderGroupeDeTrois(): boolean {
        const indexVoisinGauche: number= this.partie.joueurVoisin(true, this.cible!);
        const indexVoisinDroite: number= this.partie.joueurVoisin(false, this.cible!);
        
        return (this.partie.joueursVivants[indexVoisinDroite].equipeApparente == Equipe.LOUPS ||
                this.partie.joueursVivants[indexVoisinGauche].equipeApparente == Equipe.LOUPS ||
                this.cible!.equipeApparente == Equipe.LOUPS);   
    }

    protected jouerRole(): void {
        if(this.equipeApparente == Equipe.VILLAGEOIS){
            this.ajouterEvenementIndividuelSansRaisons(EvenementIndividuel.JOUER_RENARD);
            const raisons: RaisonPasVoter[] = this.getRaisonsPasVoter([]);
            this.raisonsPasVoter.push(raisons);
        }
    }

    choisirJoueur(cible: Villageois, evenement: EvenementIndividuel | EvenementDeGroupe, passerSiUndefined: boolean, raisonAccusation: RaisonAccusation = RaisonAccusation.AUCUN): void {
        super.choisirJoueur(cible, evenement, passerSiUndefined, raisonAccusation);
        if(evenement == EvenementIndividuel.JOUER_RENARD) {
            this.cible = cible;
        }
    }
}