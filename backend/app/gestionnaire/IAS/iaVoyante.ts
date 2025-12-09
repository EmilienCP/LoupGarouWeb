import { RaisonAccusation } from "../../../../common/accusation";
import { EvenementDeGroupe, EvenementIndividuel } from "../../../../common/evenements";
import { Equipe, Role } from "../../../../common/Joueur";
import { Partie } from "../partie";
import { Villageois } from "../Personnages/villageois";
import { Voyante } from "../Personnages/voyante";
import { IAChercheurLoups } from "./iaChercheurLoups";

export class IAVoyante extends IAChercheurLoups{


    constructor(voyante: Voyante, partie: Partie){
        super(voyante, partie, RaisonAccusation.VOYANTE);
        this.rolePretendEtre = Role.VOYANTE;
    }

    jouerUnEvenement(evenement: EvenementDeGroupe|EvenementIndividuel): void{
        super.jouerUnEvenement(evenement);
        if(+evenement == EvenementIndividuel.JOUER_VOYANTE){
            const choixPossibles: Villageois[] = this.joueursAucuneRaisonPasVoter(true);
            if(choixPossibles.length > 0){
                const choix: Villageois = this.getVillageoisAuHasard(choixPossibles);
                this.villageois.choisirJoueur(choix, evenement, false);
                if(choix.role == Role.JOUEUR_DE_FLUTE){
                    this.ajouterJoueursPasMemeEquipeAssuree(choix);
                }
                else if(this.villageois.equipeReelle == Equipe.LOUPS){
                    if(choix.role == Role.LOUP_BLANC){
                        this.ajouterJoueursPasMemeEquipeAssuree(choix);
                    }
                }
                else if(this.villageois.equipeReelle == Equipe.VILLAGEOIS){
                    //inclure l'enfant sauvage ici
                    this.ajusterResultatGroupeDe3(choix.equipeApparente == Equipe.LOUPS && !choix.estInfecte && choix.role != Role.ENFANT_SAUVAGE, [choix]);
                }
            }
        }
    }

    retirerJoueur(villageois: Villageois): void {
        super.retirerJoueur(villageois);
        const villageoisRolesConnus: Villageois[] = (this.villageois as Voyante).villageoisRolesConnus;
        if(villageoisRolesConnus.includes(villageois)) {
            villageoisRolesConnus.splice(villageoisRolesConnus.indexOf(villageois), 1);
        }
    }

    siJoueurSafe(joueur: Villageois, enAmour: boolean, joueurDeFlute: boolean, enfantSauvage: boolean, loupBlanc: boolean, infecte: boolean): boolean {
        let facteurJoueurDeFlute: boolean = joueurDeFlute;
        let facteurEnfantSauvage: boolean = enfantSauvage;
        let facteurLoupBlanc: boolean = loupBlanc;
        if(facteurJoueurDeFlute && (this.villageois as Voyante).villageoisRolesConnus.map((joueur: Villageois)=>{return joueur.role}).includes(Role.JOUEUR_DE_FLUTE)){
            if(joueur.role == Role.JOUEUR_DE_FLUTE){
                return false;
            } else {
                facteurJoueurDeFlute = false;
            }
        }
        if(facteurEnfantSauvage && (this.villageois as Voyante).villageoisRolesConnus.map((joueur: Villageois)=>{return joueur.role}).includes(Role.ENFANT_SAUVAGE)){
            if(joueur.role == Role.ENFANT_SAUVAGE){
                return false;
            } else {
                facteurEnfantSauvage = false;
            }
        }
        if(facteurLoupBlanc && (this.villageois as Voyante).villageoisRolesConnus.map((joueur: Villageois)=>{return joueur.role}).includes(Role.LOUP_BLANC)){
            if(joueur.role == Role.LOUP_BLANC){
                return false;
            } else {
                facteurLoupBlanc = false;
            }
        }
        return super.siJoueurSafe(joueur, enAmour, facteurJoueurDeFlute, enfantSauvage, loupBlanc, infecte);
    }
}