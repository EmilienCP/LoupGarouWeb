import { Partie } from "../partie";

export abstract class GestionnaireDeTemps {

    private etapeCourante: number;
    protected listeEtapes: string[];
    protected partie: Partie;

    constructor(listeEtapes: string[], partie: Partie){
        this.etapeCourante = -1;
        this.listeEtapes = listeEtapes;
        this.partie = partie;
    }

    async prochaineEtape(): Promise<boolean>{
        this.etapeCourante ++;
        if(this.partie.seed){
            console.log("étape courante", this.listeEtapes[this.etapeCourante])
        }
        let ok: Boolean = await this.executerProchaineEtape(this.etapeCourante);
        while(ok){
            this.etapeCourante ++;
            if(this.partie.seed){
                console.log("étape courante", this.listeEtapes[this.etapeCourante])
            }
            ok = await this.executerProchaineEtape(this.etapeCourante);
        }
        return this.etapeCourante == this.listeEtapes.length
    }

    protected retourAEtape(index: number){
        this.etapeCourante = index-1;
    }

    protected abstract executerProchaineEtape(etapeCourante: number): Promise<Boolean>;
}