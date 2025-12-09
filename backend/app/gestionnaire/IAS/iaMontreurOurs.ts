import { RaisonAccusation } from "../../../../common/accusation";
import { EvenementDeGroupe, EvenementIndividuel } from "../../../../common/evenements";
import { Equipe, Role } from "../../../../common/Joueur";
import { Partie } from "../partie";
import { MontreurOurs } from "../Personnages/montreurOurs";
import { Villageois } from "../Personnages/villageois";
import { IAChercheurLoups } from "./iaChercheurLoups";

export class IAMontreurOurs extends IAChercheurLoups{

    constructor(montreurOurs: MontreurOurs, partie: Partie){
        super(montreurOurs, partie, RaisonAccusation.MONTREUR_OURS);
        this.rolePretendEtre = Role.MONTREUR_OURS;
    }

    jouerUnEvenement(evenement: EvenementDeGroupe|EvenementIndividuel): void{
        super.jouerUnEvenement(evenement);
        if(+evenement == EvenementDeGroupe.OURS_GROGNE){
            if(this.villageois.equipeReelle == Equipe.VILLAGEOIS){
                let oursGrogne : boolean = (this.villageois as MontreurOurs).oursGrogne();
                let voisinGauche: Villageois = this.partie.joueursVivants[this.partie.joueurVoisin(true, this.villageois)]
                let voisinDroite: Villageois = this.partie.joueursVivants[this.partie.joueurVoisin(false, this.villageois)]
                this.ajusterResultatGroupeDe3(oursGrogne, [voisinGauche, voisinDroite]);
            }
        }
    }

}