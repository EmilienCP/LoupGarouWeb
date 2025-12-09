import { EvenementDeGroupe } from "../../../../common/evenements";
import { Appareil } from "../appareil";
import { Partie } from "../partie";
import { Villageois } from "../Personnages/villageois";
import { GestionnaireDeTemps } from "./gestionnaireDeTemps";
import { VerificationMorts } from "./verificationMorts";

export class Soir extends GestionnaireDeTemps{

    verificationMorts: VerificationMorts;
    trancherCapitaine?: Villageois;

    constructor(partie: Partie){
        super(["Resultat votes", "Inserer Morts", "Afficher Morts","Info votes", "Trancher Capitaine", "Info trancher capitaine", "Verification Morts"], partie)
        this.verificationMorts = new VerificationMorts(this.partie);
    }
    
    protected async executerProchaineEtape(etapeCourante: number): Promise<boolean> {
        switch(this.listeEtapes[etapeCourante]){
            case "Resultat votes":
                this.partie.preparerEvenementDeGroupe(EvenementDeGroupe.RESULTATS_VOTES, EvenementDeGroupe.RESULTATS_VOTES);
                return false;
            case "Inserer Morts":
                this.partie.joueursMorts = this.partie.joueursMorts.concat(this.partie.voteCourant.gagnantsVote());
                return true;
            case "Afficher Morts":
                let listeMeneurs: Appareil[] = this.partie.getMeneursDeJeu();
                if(this.partie.joueursMorts.length == 1){
                    this.partie.historiqueEvenements.push([this.partie.joueursMorts[0].nom + " s'est fait éliminer"]);
                } else {
                    let texte: string = "Il y a eu égalité entre";
                    texte+=this.getNomsEnListe(this.partie.joueursMorts.map((mort: Villageois)=>{return mort.nom}));
                    texte+= ". C'est le capitaine qui va trancher."
                    this.partie.historiqueEvenements.push([texte])
                }
                if(listeMeneurs.length == 0){
                    this.partie.preparerEvenementDeGroupe(EvenementDeGroupe.MORT_VOTES, EvenementDeGroupe.MORT_VOTES);
                }
                return listeMeneurs.length>0;
            case "Info votes":
                if(this.partie.seed){
                    console.log(this.partie.voteCourant.genererInfoVotes())
                }
                let evenementTexte: string[] = [];
                this.partie.voteCourant.genererInfoVotes().forEach((info: string[])=>{
                    evenementTexte.push(info[0] + " a voté pour "+ info[1]);
                })
                this.partie.historiqueEvenements.push(evenementTexte);
                this.partie.preparerEvenementDeGroupe(EvenementDeGroupe.INFO_VOTES, EvenementDeGroupe.MORT_VOTES);
                return false;
            case "Trancher Capitaine":
                if(this.partie.joueursMorts.length >= 2){
                    this.trancherCapitaine = this.partie.joueursVivants.filter((villageois: Villageois)=>{
                        return villageois.estCapitaine;
                    })[0];
                    this.partie.preparerEvenementDeGroupe(EvenementDeGroupe.TRANCHER_CAPITAINE, EvenementDeGroupe.TRANCHER_CAPITAINE, [this.trancherCapitaine]);
                    this.trancherCapitaine.trancherCapitainePreparer();
                    this.partie.preparerEvenementsIndividuels(EvenementDeGroupe.TRANCHER_CAPITAINE, [this.trancherCapitaine]);
                }
                return false;
            case "Info trancher capitaine":
                if(this.trancherCapitaine){
                    this.partie.historiqueEvenements.push(["Le capitaine a décidé d'éliminer "+this.partie.joueursMorts[0].nom]);
                    this.partie.preparerEvenementDeGroupe(EvenementDeGroupe.INFO_TRANCHER_CAPITAINE, EvenementDeGroupe.INFO_TRANCHER_CAPITAINE);
                }
                return false;
            case "Verification Morts":
                const fini: boolean = await this.verificationMorts.prochaineEtape();
                if(!fini){
                    this.retourAEtape(etapeCourante);
                }
                return fini;
            default:
                return false;
        }
    }

    private getNomsEnListe(noms: string[]): string{
        let texte: string = ""
        noms.forEach((nom: string, index: number)=>{
          texte+=" "+nom;
          if(index < noms.length-2){
            texte+=","
          } else if(index == noms.length-2) {
            texte+=" et"
          }
        })
        return texte;
      }
    
}