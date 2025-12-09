import { RaisonAccusation } from "../../../../common/accusation";
import { EvenementDeGroupe, EvenementIndividuel, RaisonPasVoter } from "../../../../common/evenements";
import { Role } from "../../../../common/Joueur";
import { MomentFortType } from "../../../../common/momentFort";
import { Partie } from "../partie";
import { Villageois } from "./villageois";

export class Sorciere extends Villageois{

    public joueurProtege?: Villageois;
    public joueurATuer?: Villageois;
    private sortMortelDisponible: boolean = true;

    constructor(partie: Partie){
        super(false, partie)
        this.role = Role.SORCIERE;
    }

    public getRaisonsPasVoterSortMortel(): RaisonPasVoter[]{
        return this.getRaisonsPasVoter([RaisonPasVoter.SOI_MEME]);
    }

    protected jouerRole(): void {
        this.ajouterEvenementIndividuelSansRaisons(EvenementIndividuel.JOUER_SORCIERE_PROTEGER);
        const raisons: RaisonPasVoter[] = this.getRaisonsPasVoter([]);
        if(this.joueurProtege){
            raisons[this.partie.joueursVivants.indexOf(this.joueurProtege)] = RaisonPasVoter.DEJA_CHOISI;
        }
        this.raisonsPasVoter.push(raisons);
        if(this.sortMortelDisponible){
            this.ajouterEvenementIndividuelSansRaisons(EvenementIndividuel.JOUER_SORCIERE_TUER);
        }
        this.joueurProtege = undefined;
        this.joueurATuer = undefined;
    }

    choisirJoueur(cible: Villageois, evenement: EvenementIndividuel | EvenementDeGroupe, passerSiUndefined: boolean, raisonAccusation: RaisonAccusation = RaisonAccusation.AUCUN): void {
        super.choisirJoueur(cible, evenement, passerSiUndefined, raisonAccusation);
        if(evenement == EvenementIndividuel.JOUER_SORCIERE_PROTEGER) {
            this.joueurProtege = cible;
        } else if(evenement == EvenementIndividuel.JOUER_SORCIERE_TUER) {
            this.sortMortelDisponible = false;
            this.partie.momentsForts.push({type: MomentFortType.SORCIERE_SORT_MORT, params:[this.nom, cible.nom]})
            if(this.partie.seed){
                console.log("la soricere "+ this.nom+" decide de tuer "+ cible.nom)
            }
            this.joueurATuer = cible;
        }
    }

    recupereSortMortel() {
        this.ajouterEvenementIndividuelSansRaisons(EvenementIndividuel.RECUPERER_SORT_MORTEL_SORCIERE)
        this.sortMortelDisponible = true;
    }

    actionFinNuit2eTour(): void {
        if(this.partie.joueursMorts.includes(this.joueurATuer!)) {
            this.recupereSortMortel();
        }
        else if(this.joueurATuer) {
            this.partie.joueursMorts.push(this.joueurATuer!);
        }
    }
}