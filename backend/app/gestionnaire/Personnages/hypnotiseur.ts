import { RaisonAccusation } from "../../../../common/accusation";
import { EvenementDeGroupe, EvenementIndividuel, RaisonPasVoter } from "../../../../common/evenements";
import { Equipe, Role } from "../../../../common/Joueur";
import { MomentFortType } from "../../../../common/momentFort";
import { Partie } from "../partie";
import { Villageois } from "./villageois";

export class Hypnotiseur extends Villageois{

    joueurChoisi?: Villageois;

    constructor(partie: Partie){
        super(false, partie);
        this.role = Role.HYPNOTISEUR;
    }

    protected jouerRole(): void {
        this.ajouterEvenementIndividuelSansRaisons(EvenementIndividuel.JOUER_HYPNOTISEUR);
        const raisons: RaisonPasVoter[] = this.getRaisonsPasVoter([RaisonPasVoter.SOI_MEME]);
        this.raisonsPasVoter.push(raisons);
    }

    choisirJoueur(cible: Villageois, evenement: EvenementIndividuel | EvenementDeGroupe, passerSiUndefined: boolean, raisonAccusation: RaisonAccusation = RaisonAccusation.AUCUN): void {
        super.choisirJoueur(cible, evenement, passerSiUndefined, raisonAccusation);
        if(evenement == EvenementIndividuel.JOUER_HYPNOTISEUR) {
            if(this.partie.seed){
                console.log(this.nom+ " hypnotise "+ cible.nom);
            }
            this.joueurChoisi = cible;
        } else if(evenement == EvenementIndividuel.VOTER){
            if(cible !== this.joueurChoisi && this.joueurChoisi && !this.partie.joueursDejaMorts.includes(this.joueurChoisi)){
                this.partie.voteCourant.retirerElecteur(this.joueurChoisi!);
                this.joueurChoisi!.voter(cible);
                if(this.joueurChoisi.equipeApparente == Equipe.LOUPS && cible.equipeApparente == Equipe.LOUPS){
                    this.partie.momentsForts.push({type: MomentFortType.HYPNOTISEUR_LOUP, params:[this.nom, this.joueurChoisi!.nom, cible.nom]})
                }
                if(this.joueurChoisi.amoureux == cible){
                    this.partie.momentsForts.push({type: MomentFortType.HYPNOTISEUR_AMOUREUX, params:[this.nom, this.joueurChoisi!.nom, cible.nom]})
                }
                if(this.estInfecte && this.joueurChoisi.equipeApparente == Equipe.VILLAGEOIS && cible.equipeApparente == Equipe.VILLAGEOIS){
                    this.partie.momentsForts.push({type: MomentFortType.HYPNOTISEUR_INFECTE_VILLAGEOIS, params:[this.nom, this.joueurChoisi!.nom, cible.nom]})
                }
            }
        }
    }

    actionFinNuit(): void {
        super.actionFinNuit();
        //sil a la patate chaude pas de joueur choisi
        if(this.joueurChoisi){
            this.joueurChoisi.unshiftEvenementIndividuelSansRaisons(EvenementIndividuel.INFO_HYPNOTISER);
        }
    }

    annulerRole(servanteAPrisSonRole: boolean): void {
        super.annulerRole(servanteAPrisSonRole);
        if(this.joueurChoisi && this.joueurChoisi.evenementsIndividuels.includes(EvenementIndividuel.INFO_HYPNOTISER)){
            this.joueurChoisi.evenementsIndividuels.splice(this.joueurChoisi.evenementsIndividuels.indexOf(EvenementIndividuel.INFO_HYPNOTISER))
        }
    }

    changerPointeur(ancienJoueur: Villageois, nouveauJoueur: Villageois): void {
        super.changerPointeur(ancienJoueur, nouveauJoueur);
        if(this.joueurChoisi == ancienJoueur){
            this.joueurChoisi = nouveauJoueur;
        }
    }

    
}