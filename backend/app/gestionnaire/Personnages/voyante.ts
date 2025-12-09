import { Equipe, Role } from "../../../../common/Joueur";
import { EvenementDeGroupe, EvenementIndividuel, RaisonPasVoter } from "../../../../common/evenements";
import { Partie } from "../partie";
import { Villageois } from "./villageois";
import { RaisonAccusation } from "../../../../common/accusation";
import { MomentFortType } from "../../../../common/momentFort";


export class Voyante extends Villageois {

    villageoisRolesConnus: Villageois[] = [];


    constructor(partie: Partie) {
        super(false, partie);
        this.role = Role.VOYANTE;
    }

    protected jouerRole(): void {
        this.ajouterEvenementIndividuelSansRaisons(EvenementIndividuel.JOUER_VOYANTE);
        const raisons: RaisonPasVoter[] = this.getRaisonsPasVoter([RaisonPasVoter.SOI_MEME]);
        this.partie.joueursVivants.forEach((joueur: Villageois, index: number)=>{
            if(this.villageoisRolesConnus.includes(joueur)){
                raisons[index] = RaisonPasVoter.DEJA_CHOISI;
            }
        })
        raisons.forEach((raison: RaisonPasVoter, index: number)=>{
            if(raison == RaisonPasVoter.AUCUN && this.villageoisRolesConnus.includes(this.partie.joueursVivants[index])){
                raison = RaisonPasVoter.DEJA_CHOISI;
            }
            if(raison == RaisonPasVoter.AUCUN && this.partie.joueursVivants[index].role == Role.VILLAGEOIS_VILLAGEOIS){
                raison = RaisonPasVoter.DEJA_VILLAGEOIS_VILLAGEOIS;
            }
        })
        this.raisonsPasVoter.push(raisons);
        if(this.equipeApparente == Equipe.LOUPS){
            //mettre laction du loup apres laction de voyante
            this.evenementsIndividuels.push(this.evenementsIndividuels.splice(this.evenementsIndividuels.length-2,1)[0])
            this.raisonsPasVoter.push(this.raisonsPasVoter.splice(this.raisonsPasVoter.length-2,1)[0])
        }
    }

    choisirJoueur(cible: Villageois, evenement: EvenementIndividuel | EvenementDeGroupe, passerSiUndefined: boolean, raisonAccusation: RaisonAccusation = RaisonAccusation.AUCUN): void {
        super.choisirJoueur(cible, evenement, passerSiUndefined, raisonAccusation);
        if(evenement == EvenementIndividuel.JOUER_VOYANTE) {
            this.villageoisRolesConnus.push(cible);
            if(this.partie.seed){
                console.log("La voyante "+this.nom+" regarde : "+ cible.nom, this.villageoisRolesConnus.map(joueur=>joueur.nom), "Role: "+cible.role);
            }
            if(cible.equipeApparente == Equipe.LOUPS && !cible.estInfecte || cible.role == Role.JOUEUR_DE_FLUTE || cible.role == Role.ENFANT_SAUVAGE){
                this.partie.momentsForts.push({type:MomentFortType.VOYANTE, params: [this.nom, cible.nom, cible.role]})
            }
        }
    }

    voirRole(): Role {
        return this.villageoisRolesConnus[this.villageoisRolesConnus.length-1].role;
    }

    majVillageoisRolesConnus(): void {
        this.villageoisRolesConnus = this.villageoisRolesConnus.filter((villageois: Villageois) => {
            return this.partie.joueursVivants.includes(villageois)
        })
    }

    changerPointeur(ancienJoueur: Villageois, nouveauJoueur: Villageois): void {
        super.changerPointeur(ancienJoueur, nouveauJoueur);
        if(this.villageoisRolesConnus.includes(ancienJoueur)){
            this.villageoisRolesConnus[this.villageoisRolesConnus.indexOf(ancienJoueur)] = nouveauJoueur;
        }
    }
    
}