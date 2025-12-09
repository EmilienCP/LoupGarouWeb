import { RaisonAccusation } from "../../../../common/accusation";
import { EvenementDeGroupe, EvenementIndividuel, RaisonPasVoter, Victoire } from "../../../../common/evenements";
import { Equipe, Role } from "../../../../common/Joueur";
import { Partie } from "../partie";
import { Villageois } from "./villageois";

export class LoupBlanc extends Villageois{

    loupATuer?: Villageois;

    constructor(partie: Partie){
        super(true, partie);
        this.role = Role.LOUP_BLANC;
        this.equipeReelle = Equipe.INDEPENDANT;
        this.loupATuer = new Villageois(false, partie);
    }

    protected jouerRole(): void {
        if((!this.loupATuer) && this.partie.joueursVivants.filter((joueur: Villageois)=>{return joueur.equipeReelle == Equipe.LOUPS && joueur !== this}).length>0) {
            this.ajouterEvenementIndividuelSansRaisons(EvenementIndividuel.JOUER_LOUP_BLANC);
            const raisons: RaisonPasVoter[] = this.getRaisonsPasVoter([RaisonPasVoter.SOI_MEME, RaisonPasVoter.PAS_LOUP]);
            this.raisonsPasVoter.push(raisons);
        } else {
            this.loupATuer = undefined;
        }
    }

    choisirJoueur(cible: Villageois, evenement: EvenementIndividuel | EvenementDeGroupe, passerSiUndefined: boolean, raisonAccusation: RaisonAccusation = RaisonAccusation.AUCUN): void {
        super.choisirJoueur(cible, evenement, passerSiUndefined, raisonAccusation);
        if(evenement == EvenementIndividuel.JOUER_LOUP_BLANC) {
            if(this.partie.seed){
                console.log("Le loup blanc "+ this.nom+ " choisi de tuer aussi "+cible.nom);
            }
            this.loupATuer = cible;
        }
    }

    actionFinNuit(): void {
        super.actionFinNuit();
        if(this.loupATuer) {
            if(!this.partie.joueursMorts.includes(this.loupATuer)){
                this.partie.joueursMorts.push(this.loupATuer);
            }
        }
    }

    pointsDeVictoire(): number{
        if(this.amoureux){
            return super.pointsDeVictoire();
        }
        if(this.partie.victoire == Victoire.LOUP_BLANC){
            return 2;
        }
        return 0;
    }

    getSorteVictoireSilGagne(): Victoire{
        return Victoire.LOUP_BLANC;
    }

}