import { RaisonAccusation } from "../../../../common/accusation";
import { EvenementDeGroupe, EvenementIndividuel, RaisonPasVoter } from "../../../../common/evenements";
import { Equipe, Role } from "../../../../common/Joueur";
import { Partie } from "../partie";
import { Villageois } from "./villageois";

export class GrandMechantLoup extends Villageois{

    villageoisATuer?: Villageois;
    perdrePouvoir: boolean = false;

    constructor(partie: Partie){
        super(true, partie);
        this.role = Role.GRAND_MECHANT_LOUP;
        this.equipeReelle = Equipe.LOUPS;
        this.villageoisATuer = new Villageois(false, partie);
    }

    protected jouerRole(): void {
        if(!this.perdrePouvoir) {
            this.ajouterEvenementIndividuelSansRaisons(EvenementIndividuel.JOUER_GRAND_MECHANT_LOUP);
            const raisons: RaisonPasVoter[] = this.getRaisonsPasVoter([RaisonPasVoter.SOI_MEME, RaisonPasVoter.AMI_LOUP]);
            this.raisonsPasVoter.push(raisons);
        }
    }

    choisirJoueur(cible: Villageois, evenement: EvenementIndividuel | EvenementDeGroupe, passerSiUndefined: boolean, raisonAccusation: RaisonAccusation = RaisonAccusation.AUCUN): void {
        super.choisirJoueur(cible, evenement, passerSiUndefined, raisonAccusation);
        if(evenement == EvenementIndividuel.JOUER_GRAND_MECHANT_LOUP) {
            if(this.partie.seed){
                console.log("Le grand mechant loup "+ this.nom+ " choisi de tuer aussi "+cible.nom);
            }
            this.villageoisATuer = cible;
        }
    }

    enleverPouvoir(){
        this.perdrePouvoir = true;
        this.villageoisATuer = undefined;
    }

}