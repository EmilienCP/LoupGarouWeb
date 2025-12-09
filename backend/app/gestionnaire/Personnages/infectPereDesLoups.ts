import { Equipe, Role } from "../../../../common/Joueur";
import { EvenementDeGroupe, EvenementIndividuel, RaisonPasVoter } from "../../../../common/evenements";
import { Partie } from "../partie";
import { Villageois } from "./villageois";
import { RaisonAccusation } from "../../../../common/accusation";


export class InfectPereDesLoups extends Villageois {

    aJouePouvoir: boolean;
    choixInfecte?: Villageois;

    constructor(partie: Partie) {
        super(true, partie);
        this.role = Role.INFECT_PERE_LOUPS;
        this.aJouePouvoir = false;
    }

    protected jouerRole(): void {
        if(!this.aJouePouvoir) {
            this.ajouterEvenementIndividuelSansRaisons(EvenementIndividuel.JOUER_INFECTE_PERE_LOUPS);
            const raisons: RaisonPasVoter[] = this.getRaisonsPasVoter([RaisonPasVoter.SOI_MEME, RaisonPasVoter.AMI_LOUP]);
            this.raisonsPasVoter.push(raisons);
        }
    }

    choisirJoueur(cible: Villageois, evenement: EvenementIndividuel | EvenementDeGroupe, passerSiUndefined: boolean, raisonAccusation: RaisonAccusation = RaisonAccusation.AUCUN): void {
        super.choisirJoueur(cible, evenement, passerSiUndefined, raisonAccusation);
        if(evenement == EvenementIndividuel.JOUER_INFECTE_PERE_LOUPS) {
            if(this.partie.seed){
                console.log(this.nom + " infecte "+cible.nom)
            }
            this.choixInfecte = cible;
        }
    }

    actionFinNuit(): void {
        super.actionFinNuit();
        if(this.choixInfecte) {
            this.aJouePouvoir = true;
            this.choixInfecte.estInfecte = true;
            this.choixInfecte.equipeApparente = Equipe.LOUPS;
            if(this.choixInfecte.equipeReelle == Equipe.VILLAGEOIS) {
                this.choixInfecte.equipeReelle = Equipe.LOUPS;
            }
            this.choixInfecte.unshiftEvenementIndividuelSansRaisons(EvenementIndividuel.INFO_INFECTE);
            this.choixInfecte = undefined;
        }
        
    }

    actionExServante(): void {
        if(this.partie.joueursVivants.concat(this.partie.joueursDejaMorts).some((joueur: Villageois)=>{return joueur.estInfecte})){
            this.aJouePouvoir = true;
        }
    }

    recupererPouvoir(): void{
        this.aJouePouvoir = false;
        this.unshiftEvenementIndividuelSansRaisons(EvenementIndividuel.INFECT_PERE_RECUPERER_POUVOIR);
    }

    
}