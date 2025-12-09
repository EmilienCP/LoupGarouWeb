import { RaisonAccusation } from "../../../../common/accusation";
import { EvenementDeGroupe, EvenementIndividuel, RaisonPasVoter, Victoire } from "../../../../common/evenements";
import { Equipe, Role } from "../../../../common/Joueur";
import { Partie } from "../partie";
import { Villageois } from "./villageois";

export class JoueurDeFlute extends Villageois{

    private choix1?: Villageois;
    private choix2?: Villageois;

    constructor(partie: Partie){
        super(false, partie);
        this.role = Role.JOUEUR_DE_FLUTE;
        this.equipeReelle = Equipe.INDEPENDANT;
    }

    protected jouerRole(): void {
        this.ajouterEvenementIndividuelSansRaisons(EvenementIndividuel.JOUER_JOUEUR_DE_FLUTE);
        const raisons: RaisonPasVoter[] = this.getRaisonsPasVoterJoueurDeFlute();
        this.raisonsPasVoter.push(raisons);
    }

    choisirJoueur(cible: Villageois, evenement: EvenementIndividuel | EvenementDeGroupe, passerSiUndefined: boolean, raisonAccusation: RaisonAccusation = RaisonAccusation.AUCUN): void {
        super.choisirJoueur(cible, evenement, passerSiUndefined, raisonAccusation);
        if(evenement == EvenementIndividuel.JOUER_JOUEUR_DE_FLUTE) {
            if(!this.choix1){
                this.choix1 = cible;
                this.raisonsPasVoter.unshift(this.getRaisonsPasVoterJoueurDeFlute());
            } else if(!this.choix2){
                this.choix2 = cible;
            }
        }
    }
    
    actionFinNuit(): void {
        super.actionFinNuit();
        if(this.choix1){
            this.choix1.estCharmer = true;
            this.choix1.unshiftEvenementIndividuelSansRaisons(EvenementIndividuel.INFO_CHARMER);
            this.choix1 = undefined;
        }
        if(this.choix2){
            this.choix2.estCharmer = true;
            this.choix2.unshiftEvenementIndividuelSansRaisons(EvenementIndividuel.INFO_CHARMER);
            this.choix2 = undefined;
        }
    }

    getRaisonsPasVoterJoueurDeFlute(): RaisonPasVoter[] {
        let raisons: RaisonPasVoter[] = this.getRaisonsPasVoter([RaisonPasVoter.SOI_MEME, RaisonPasVoter.DEJA_CHARMER, RaisonPasVoter.AMOUREUX]);
        if(this.choix1){
            let indexChoix1: number = this.partie.joueursVivants.indexOf(this.choix1);
            raisons[indexChoix1] = RaisonPasVoter.DEJA_CHARMER;
        }
        return raisons;
    }

    annulerRole(servanteAPrisSonRole: boolean): void {
        super.annulerRole(servanteAPrisSonRole);
        if(!servanteAPrisSonRole){
            this.partie.joueursVivants.forEach((joueur: Villageois)=>{
                joueur.estCharmer = false;
                if(joueur.evenementsIndividuels.includes(EvenementIndividuel.INFO_CHARMER)){
                    joueur.evenementsIndividuels.splice(joueur.evenementsIndividuels.indexOf(EvenementIndividuel.INFO_CHARMER), 1);
                }
            })
        }
    }

    pointsDeVictoire(): number{
        if(this.partie.victoire == Victoire.JOUEUR_DE_FLUTE || (this.amoureux !== undefined && this.partie.victoire == Victoire.AMOUREUX)){
            return 2;
        }
        return 0;
    }

    getSorteVictoireSilGagne(): Victoire{
        return Victoire.JOUEUR_DE_FLUTE;
    }
}