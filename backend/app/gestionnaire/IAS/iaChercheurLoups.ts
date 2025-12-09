import { RaisonAccusation } from "../../../../common/accusation";
import { Equipe } from "../../../../common/Joueur";
import { Partie } from "../partie";
import { Villageois } from "../Personnages/villageois";
import { IA } from "./ia";

export class IAChercheurLoups extends IA{
    loupGarousPotentiels: Villageois[][];
    differenteEquipeDeduis: Villageois[]; // sert uniquement pour les raisons daccusation (savoir sil laccuse vrm grace a son pouvoir)
    villageoisDeduis: Villageois[];
    raisonAccusation: RaisonAccusation

    constructor(villageois: Villageois, partie: Partie, raisonAccusation: RaisonAccusation){
        super(villageois, partie);
        this.loupGarousPotentiels = [];
        this.differenteEquipeDeduis = [];
        this.villageoisDeduis = [];
        this.raisonAccusation = raisonAccusation;
    }
    
    changerPointeur(ancienJoueur: Villageois, nouveauJoueur: Villageois): void {
        super.changerPointeur(ancienJoueur, nouveauJoueur);
        this.loupGarousPotentiels.forEach((loupsPotentiels: Villageois[])=>{
            if(loupsPotentiels.includes(ancienJoueur)){
                loupsPotentiels[loupsPotentiels.indexOf(ancienJoueur)] = nouveauJoueur;
            }
        })
        if(this.differenteEquipeDeduis.includes(ancienJoueur)){
            this.differenteEquipeDeduis[this.differenteEquipeDeduis.indexOf(ancienJoueur)] = nouveauJoueur;
        }
        if(this.villageoisDeduis.includes(ancienJoueur)){
            this.villageoisDeduis[this.villageoisDeduis.indexOf(ancienJoueur)] = nouveauJoueur;
        }
    }

    majCotesDevenirLoup(): void {
        super.majCotesDevenirLoup();
        this.loupGarousPotentiels = [];
        this.differenteEquipeDeduis = [];
        this.villageoisDeduis = [];
    }

    trouverRaisonParDefaut(cible: Villageois): RaisonAccusation {
        if(this.differenteEquipeDeduis.includes(cible)){
            return this.raisonAccusation;
        } else{
            return super.trouverRaisonParDefaut(cible);
        }
    }

    majCotesMontrerMort(): void {
        super.majCotesMontrerMort();
        if(this.villageois.equipeReelle == Equipe.VILLAGEOIS) {
            this.partie.joueursMorts.forEach((mort: Villageois) => {
                if(mort !== this.villageois){
                    this.ajusterResultatGroupeDe3(mort.equipeApparente == Equipe.LOUPS, [mort]);
                }
            })
        }
    }

    protected ajusterResultatGroupeDe3(isLoupDedans: boolean, liste: Villageois[]){
        if(liste.includes(this.villageois)){
            throw new Error("Un IA sinclut lui meme dans un calcul de verification de loups");
        }
        if(!isLoupDedans){
            //verifier loups potentiels
            this.loupGarousPotentiels.forEach((loupsPossibles: Villageois[])=>{
                liste.forEach((nouveauVillageois: Villageois)=>{
                    if(loupsPossibles.includes(nouveauVillageois)){
                        loupsPossibles.splice(loupsPossibles.indexOf(nouveauVillageois),1);
                    }
                })
                if(loupsPossibles.length == 1){
                    this.ajouterJoueursPasMemeEquipeAssuree(loupsPossibles[0]);
                    this.differenteEquipeDeduis.push(loupsPossibles[0]);
                }
            })
            this.cleanLoupsPotentiels();

            // mettre des nouveaux villageois assures
            liste.forEach((nouveauVillageois: Villageois)=>{
                if(this.siJoueurSafe(nouveauVillageois, false, false, true, false, true)){
                    if(!this.villageoisDeduis.includes(nouveauVillageois)){
                        this.villageoisDeduis.push(nouveauVillageois);
                        this.augmenterDiminuerCote(nouveauVillageois,2, false);
                    }
                    if(this.siJoueurSafe(nouveauVillageois, true, true, true, false, true)){
                        this.ajouterJoueursMemeEquipeAssuree(nouveauVillageois);
                    }
                }
            })
        } else {
            liste = liste.filter((cible: Villageois)=>{
                // les villageois public non independants sont inclus dans les villageois publics
                return !this.villageoisDeduis.includes(cible) && !this.villageoisPublics.includes(cible);
            })
            if(liste.length == 1){
                this.ajouterJoueursPasMemeEquipeAssuree(liste[0]);
                this.differenteEquipeDeduis.push(liste[0]);
                this.cleanLoupsPotentiels();
            } else {
                this.loupGarousPotentiels.push(liste);
            }
        }
    }

    private cleanLoupsPotentiels(){
        this.loupGarousPotentiels = this.loupGarousPotentiels.filter((liste: Villageois[])=>{
            return (!liste.some((cible: Villageois)=>{
                return this.differenteEquipeDeduis.includes(cible);
            })) && liste.length > 0;
        });
    }
}