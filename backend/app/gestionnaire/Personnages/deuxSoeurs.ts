import { Role } from "../../../../common/Joueur";
import { Partie } from "../partie";
import { Villageois } from "./villageois";

export class DeuxSoeurs extends Villageois{

    deuxiemeSoeur: Villageois; // on ne veut jamais quil n'ait pas de deuxieme soeur, meme quand elle est morte
 
    constructor(partie: Partie){
        super(false, partie);
        this.role = Role.DEUX_SOEURS;
    }

    actionIntro(): void {
        super.actionIntro();
        this.partie.joueursVivants.forEach((joueur: Villageois)=>{
            if(joueur.role == Role.DEUX_SOEURS && joueur != this){
                this.deuxiemeSoeur = joueur;
            }
        });
    }

    actionExServante(joueurQuelleAPris: Villageois): void {
        super.actionExServante(joueurQuelleAPris);
        this.partie.joueursVivants.concat(this.partie.joueursDejaMorts).forEach((joueur: Villageois)=>{
            //si la servante devouee prend le role dune des deux soeurs et lautre est morte, on veut quand meme la trouver
            if(joueur.role == Role.DEUX_SOEURS && joueur != this && joueur != joueurQuelleAPris){
                this.deuxiemeSoeur = joueur;
            }
        });
        (this.deuxiemeSoeur! as DeuxSoeurs).deuxiemeSoeur = this;
    }
}