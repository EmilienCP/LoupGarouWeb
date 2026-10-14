import { Role } from "../../../../common/Joueur";
import { Partie } from "../partie";
import { Villageois } from "./villageois";

export class DeuxSoeurs extends Villageois{

    deuxiemeSoeur?: Villageois; // elle peut avoir pas de deuxieme soeur, si sa deuxieme soeur devient villageois villageois.
 
    constructor(partie: Partie){
        super(false, partie);
        this.role = Role.DEUX_SOEURS;
    }

    actionIntro(): void {
        super.actionIntro();
        this.partie.getJoueursVivants().forEach((joueur: Villageois)=>{
            if(joueur.role == Role.DEUX_SOEURS && joueur != this){
                this.deuxiemeSoeur = joueur;
            }
        });
    }

    actionExServante(joueurQuelleAPris: Villageois): void {
        super.actionExServante(joueurQuelleAPris);
        this.partie.getJoueursVivants().concat(this.partie.getJoueursDejaMorts()).forEach((joueur: Villageois)=>{
            //si la servante devouee prend le role dune des deux soeurs et lautre est morte, on veut quand meme la trouver
            if(joueur.role == Role.DEUX_SOEURS && joueur != this && joueur != joueurQuelleAPris){
                this.deuxiemeSoeur = joueur;
            }
        });
        //possible que ce soit un villageois villageois la deuxieme soeur, donc elle ne peut pas voir sa deuxieme soeur.
        if(this.deuxiemeSoeur){
            (this.deuxiemeSoeur as DeuxSoeurs).deuxiemeSoeur = this;
        }
    }

    changerPointeur(ancienJoueur: Villageois, nouveauJoueur: Villageois): void {
        if(this.deuxiemeSoeur == ancienJoueur){
            this.deuxiemeSoeur = nouveauJoueur;
        }
    }
}