import { EvenementDeGroupe, EvenementIndividuel } from "../../../../common/evenements";
import { RolePublic } from "../../../../common/Joueur";
import { Appareil } from "../appareil";
import { Partie } from "../partie";
import { Villageois } from "../Personnages/villageois";
import { GestionnaireDeTemps } from "./gestionnaireDeTemps";

export class Intro extends GestionnaireDeTemps{

    constructor(partie: Partie){
        super(["PreparerHistoire", "Cacher Appareil", "Montrer Personnage Public", "Montrer Personnage", "Jouer Personnage Intro", "Vote Capitaine", "Resultat Votes Capitaine", "Afficher Capitaine", "Infos Vote Capitaine"], partie)
    }
    
    protected async executerProchaineEtape(etapeCourante: number): Promise<boolean> {
        switch(this.listeEtapes[etapeCourante]){
            case "PreparerHistoire":
                if(!this.partie.modeVideo){
                    return true;
                }
                const noms: string[]=[];
                this.partie.appareils.forEach((appareil: Appareil)=>{
                    appareil.nomsJoueurs.forEach((nom: string)=>{
                        noms.push(nom)
                    })
                })
                const reponse: string = await this.partie.chatgptService.genererIntro(noms);
                this.partie.texteCourant = reponse
                this.partie.preparerEvenementDeGroupe(EvenementDeGroupe.INTRO_HISTOIRE, EvenementDeGroupe.INTRO_HISTOIRE);
                return false;
            case "Cacher Appareil":
                if(this.partie.getJoueursReelsEncoreVivants().length>1){
                    this.partie.joueursVivants.forEach((villageois: Villageois)=>{
                        villageois.ajouterEvenementIndividuelSansRaisons(EvenementIndividuel.CACHER_APPAREIL);
                    });
                }
                return true;
            case "Montrer Personnage Public":
                if(this.partie.modeExtensionVillage){
                    this.partie.joueursVivants.forEach((villageois: Villageois)=>{
                        villageois.ajouterEvenementIndividuelSansRaisons(EvenementIndividuel.MONTRER_PERSONNAGE_PUBLIC);
                    });
                }
                return true;
            case "Montrer Personnage":
                this.partie.joueursVivants.forEach((villageois: Villageois)=>{
                    villageois.ajouterEvenementIndividuelSansRaisons(EvenementIndividuel.MONTRER_PERSONNAGE);
                });
                return true;
            case "Jouer Personnage Intro":
                if(this.partie.modePatateChaude){
                    let index: number = this.partie.random(this.partie.joueursVivants.length);
                    const patateChaudeHasard: Villageois = this.partie.joueursVivants[index];
                    patateChaudeHasard.patateChaude = true;
                    patateChaudeHasard.ajouterEvenementIndividuelSansRaisons(EvenementIndividuel.INFO_PATATE_CHAUDE);
                }
                this.partie.joueursVivants.forEach((villageois: Villageois)=>{
                    villageois.actionIntro();
                });
                return true;
            case "Vote Capitaine":
                let joueursImpliquesVote: Villageois[] = this.partie.joueursVivants;
                if(this.partie.modeExtensionVillage){
                    joueursImpliquesVote = this.partie.joueursVivants.filter((joueur: Villageois)=>{return joueur.rolePublic == RolePublic.FERMIER})
                }
                this.partie.voteCourant.accuserToutLeMonde(joueursImpliquesVote);
                joueursImpliquesVote.forEach((villageois: Villageois)=>{
                    villageois.voterCapitaine();
                });
                this.partie.preparerEvenementsIndividuels(EvenementDeGroupe.INTRO);
                return false;
            case "Resultat Votes Capitaine":
                this.partie.preparerEvenementDeGroupe(EvenementDeGroupe.RESULTATS_VOTES, EvenementDeGroupe.RESULTATS_VOTES);
                return false;
            case "Afficher Capitaine":
                let gagnant: Villageois = this.partie.voteCourant.gagnantVote(this.partie);
                gagnant.estCapitaine = true;
                if(this.partie.seed){
                    console.log("le capitaine est "+ gagnant.nom)
                }
                this.partie.historiqueEvenements.push([gagnant.nom + " s'est fait choisir comme capitaine"]);
                if(this.partie.getMeneursDeJeu().length == 0){
                    this.partie.preparerEvenementDeGroupe(EvenementDeGroupe.CHOIX_CAPITAINE, EvenementDeGroupe.CHOIX_CAPITAINE);
                    return false;
                }
                return true;
            case "Infos Vote Capitaine":
                let evenementTexte: string[] = [];
                this.partie.voteCourant.genererInfoVotes().forEach((info: string[])=>{
                    evenementTexte.push(info[0] + " a voté pour "+ info[1]);
                })
                this.partie.historiqueEvenements.push(evenementTexte);
                this.partie.preparerEvenementDeGroupe(EvenementDeGroupe.INFO_VOTES, EvenementDeGroupe.CHOIX_CAPITAINE)
                return false;
            default:
                return false;
        }
    }
    
}