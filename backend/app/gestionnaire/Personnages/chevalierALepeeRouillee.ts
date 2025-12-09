import { Equipe, Role } from "../../../../common/Joueur";
import { Partie } from "../partie";
import { Villageois } from "./villageois";

export class ChevalierALepeeRouillee extends Villageois{

    loupTetanos?: Villageois;

    constructor(partie: Partie){
        super(false, partie);
        this.role = Role.CHEVALIER_A_LEPEE_ROUILLEE;
    }

    trouverLoupTetanos(){
        let joueurGauche: Villageois = this.partie.joueursVivants[this.partie.joueurVoisin(true, this)];
        while(joueurGauche.equipeApparente !== Equipe.LOUPS){
            joueurGauche = this.partie.joueursVivants[this.partie.joueurVoisin(true, joueurGauche)];
            if(joueurGauche == this){
                throw new Error("Le chevalier a lepee rouillee ne trouve personne a donner le tetanos");
            }
        }
        this.loupTetanos = joueurGauche;
    }

    ajouterLoupMort(){
        if(!this.partie.joueursVivants.includes(this.loupTetanos!)){
            this.loupTetanos = undefined;
        }
        if(this.loupTetanos && !this.partie.joueursMorts.includes(this.loupTetanos)){
            this.partie.joueursMorts.push(this.loupTetanos)
            this.loupTetanos = undefined
        }
    }
}