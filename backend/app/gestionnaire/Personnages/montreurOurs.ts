import { Equipe, Role } from "../../../../common/Joueur";
import { Partie } from "../partie";
import { Villageois } from "./villageois";


export class MontreurOurs extends Villageois {

    constructor(partie: Partie) {
        super(false, partie);
        this.role = Role.MONTREUR_OURS;
    }
    
    oursGrogne(): boolean {
        const indexVoisinGauche: number= this.partie.joueurVoisin(true, this);
        const indexVoisinDroite: number= this.partie.joueurVoisin(false, this);
        
        return (this.partie.joueursVivants[indexVoisinDroite].equipeApparente == Equipe.LOUPS ||
                this.partie.joueursVivants[indexVoisinGauche].equipeApparente == Equipe.LOUPS ||
                this.equipeApparente == Equipe.LOUPS);
    }
}