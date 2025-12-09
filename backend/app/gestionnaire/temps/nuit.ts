import { EvenementDeGroupe } from "../../../../common/evenements";
import { Partie } from "../partie";
import { Villageois } from "../Personnages/villageois";
import { GestionnaireDeTemps } from "./gestionnaireDeTemps";

export class Nuit extends GestionnaireDeTemps{

    constructor(partie: Partie){
        super(["Soleil se couche", "Jouer role nuit"], partie)
    }
    
    protected async executerProchaineEtape(etapeCourante: number): Promise<boolean> {
        switch(this.listeEtapes[etapeCourante]){
            case "Soleil se couche":
                this.partie.historiqueEvenements.push(["Le soleil se couche"]);
                this.partie.preparerEvenementDeGroupe(EvenementDeGroupe.SOLEIL_SE_COUCHE, EvenementDeGroupe.SOLEIL_SE_COUCHE);
                return false;
            case "Jouer role nuit":
                //faire jouer le role de nuit à tous les joueurs
                this.partie.voteCourant.clean();
                this.partie.voteCourant.accuserToutLeMonde(this.partie.joueursVivants);
                this.partie.joueursVivants.forEach((villageois: Villageois)=>{
                    villageois.actionNuit();
                })
                this.partie.preparerEvenementsIndividuels(EvenementDeGroupe.JOUER_NUIT);
                return false;
            default:
                return false;
        }
    }
    
}