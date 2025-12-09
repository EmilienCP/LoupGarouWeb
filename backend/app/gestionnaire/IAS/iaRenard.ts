import { RaisonAccusation } from "../../../../common/accusation";
import { EvenementDeGroupe, EvenementIndividuel } from "../../../../common/evenements";
import { Equipe, Role } from "../../../../common/Joueur";
import { Partie } from "../partie";
import { Renard } from "../Personnages/renard";
import { Villageois } from "../Personnages/villageois";
import { IAChercheurLoups } from "./iaChercheurLoups";

export class IARenard extends IAChercheurLoups{

    villageoisAssures: Villageois[];
    loupGarousAssures: Villageois[];
    loupGarousPotentiels: Villageois[][];

    constructor(renard: Renard, partie: Partie){
        super(renard, partie, RaisonAccusation.RENARD);
        this.villageoisAssures = [];
        this.loupGarousAssures = [];
        this.loupGarousPotentiels = [];
        this.rolePretendEtre = Role.RENARD;
    }

    jouerUnEvenement(evenement: EvenementDeGroupe|EvenementIndividuel): void{
        super.jouerUnEvenement(evenement);
        if(+evenement == EvenementIndividuel.JOUER_RENARD){
            const choixPossibles: Villageois[] = this.joueursAucuneRaisonPasVoter(false);
            if(this.villageois.equipeReelle == Equipe.VILLAGEOIS){
                const choixPossiblesFiltres: Villageois[] = choixPossibles.filter((choix: Villageois)=>{
                    return !this.loupGarousPotentiels.map((value: Villageois[])=>{return value[0]}).includes(choix);
                });
                let cible: Villageois;
                if(choixPossiblesFiltres.length >0){
                    cible = this.getVillageoisAuHasard(choixPossiblesFiltres);
                } else {
                    cible = this.getVillageoisAuHasard(choixPossibles);
                }
                this.villageois.choisirJoueur(cible, EvenementIndividuel.JOUER_RENARD, false);
    
                let aFlaireLoup : boolean = (this.villageois as Renard).regarderGroupeDeTrois();
                let voisinGauche: Villageois = this.partie.joueursVivants[this.partie.joueurVoisin(true, cible)]
                let voisinDroite: Villageois = this.partie.joueursVivants[this.partie.joueurVoisin(false, cible)]
                let listeAVerifier: Villageois[] = [cible, voisinGauche, voisinDroite];
                listeAVerifier = listeAVerifier.filter((joueur: Villageois)=>{return joueur !== this.villageois});
    
                this.ajusterResultatGroupeDe3(aFlaireLoup, listeAVerifier);
            }
        }
    }

}