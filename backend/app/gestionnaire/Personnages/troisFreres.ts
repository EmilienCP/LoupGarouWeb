import { Role } from "../../../../common/Joueur";
import { Partie } from "../partie";
import { Villageois } from "./villageois";

export class TroisFreres extends Villageois{

    deuxFreres: Villageois[];

    constructor(partie: Partie){
        super(false, partie);
        this.role = Role.TROIS_FRERES;
        this.deuxFreres = [];
    }

    actionIntro(): void {
        super.actionIntro();
        this.partie.joueursVivants.concat(this.partie.joueursDejaMorts).forEach((joueur: Villageois)=>{
            if(joueur.role == Role.TROIS_FRERES && joueur != this){
                this.deuxFreres.push(joueur);
            }
        })
    }

    actionExServante(joueurQuelleAPris: Villageois): void {
        super.actionExServante(joueurQuelleAPris);
        this.actionIntro();
        this.deuxFreres.forEach((frere: TroisFreres)=>{
            frere.deuxFreres.push(this);
        })
    }
}