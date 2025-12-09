import { Partie } from "../partie";
import { GestionnaireDeTemps } from "./gestionnaireDeTemps";
import { Intro } from "./intro";
import { Jour } from "./jour";
import { Matin } from "./matin";
import { Nuit } from "./nuit";
import { Soir } from "./soir";

export class GestionnaireEtape extends GestionnaireDeTemps{
    gestionnaireDeTemps: GestionnaireDeTemps;

    constructor(partie: Partie){
        super(["Intro", "Nuit", "Matin", "Jour", "Soir"], partie)
        this.gestionnaireDeTemps = new Intro(this.partie);
    }

    protected async executerProchaineEtape(etapeCourante: number): Promise<boolean> {
        const fini: boolean = await this.gestionnaireDeTemps.prochaineEtape();
        if(!fini){
            this.retourAEtape(etapeCourante);
            return false
        }
        switch(this.listeEtapes[etapeCourante]){
            case "Intro":
                this.gestionnaireDeTemps = new Nuit(this.partie);
                break;
            case "Nuit":
                this.partie.numeroJour++;
                this.partie.historiqueEvenements.push(["Début du jour "+ Math.floor((this.partie.numeroJour+1)/2)])
                this.gestionnaireDeTemps = new Matin(this.partie);
                break;
            case "Matin":
                this.gestionnaireDeTemps = new Jour(this.partie);
                break;
            case "Jour":
                this.partie.numeroJour++;
                this.gestionnaireDeTemps = new Soir(this.partie);
                break;
            case "Soir":
                this.gestionnaireDeTemps = new Nuit(this.partie);
                this.retourAEtape(1);
                break;
        }
        return true;
    }
}