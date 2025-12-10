import { Role } from "../../../../common/Joueur";
import { EvenementDeGroupe } from "../../../../common/evenements";
import { Partie } from "../partie";
import { Villageois } from "../Personnages/villageois";
import { GestionnaireDeTemps } from "./gestionnaireDeTemps";
import { VerificationMorts } from "./verificationMorts";
import { Sorciere } from "../Personnages/sorciere";
import { FemmeDeMenage } from "../Personnages/femmeDeMenage";
import { ChevalierALepeeRouillee } from "../Personnages/chevalierALepeeRouillee";
import { Corbeau } from "../Personnages/corbeau";
import { MomentFortType } from "../../../../common/momentFort";
import { MontreurOurs } from "../Personnages/montreurOurs";
import { GrandMechantLoup } from "../Personnages/grantMechantLoup";

export class Matin extends GestionnaireDeTemps{
    verificationMorts: VerificationMorts;

    constructor(partie: Partie){
        super(["Jour se leve", "Ours grogne", "Corbeau", "Inserer Morts", "Afficher Morts", "Verification Morts"], partie)
        this.verificationMorts = new VerificationMorts(this.partie);
    }
    
    protected async executerProchaineEtape(etapeCourante: number): Promise<boolean> {
        switch(this.listeEtapes[etapeCourante]){
            case "Jour se leve":
                if(!this.partie.modeVideo){
                    this.partie.historiqueEvenements.push(["Le jour se lève"]);
                    this.partie.preparerEvenementDeGroupe(EvenementDeGroupe.JOUR_SE_LEVE, EvenementDeGroupe.JOUR_SE_LEVE);
                }
                return this.partie.modeVideo;
            
            case "Ours grogne":
                let ours: MontreurOurs = this.partie.getPersonnages(Role.MONTREUR_OURS)[0] as MontreurOurs;
                if(ours != undefined) {
                      if(ours.oursGrogne()) {
                        if(this.partie.seed){console.log("lours grogne")}
                        this.partie.historiqueEvenements.push(["L'ours a grogné cette nuit!"]);
                      }
                      else {
                        if(this.partie.seed){console.log("lours ne grogne pas")}
                        this.partie.historiqueEvenements.push(["L'ours n'a pas grogné cette nuit."]);
                      }
                    this.partie.preparerEvenementDeGroupe(EvenementDeGroupe.OURS_GROGNE, EvenementDeGroupe.OURS_GROGNE);
                    return false
                }
                return true;

            case "Corbeau":
                if(this.partie.getPersonnages(Role.CORBEAU).length > 0 && (this.partie.getPersonnages(Role.CORBEAU)[0] as Corbeau).joueurVu) {
                    this.partie.getPersonnages(Role.CORBEAU).forEach((corbeau: Corbeau)=>{
                        this.partie.historiqueEvenements.push(["Le corbeau a vu "+ corbeau.joueurVu!.nom]);
                        if(this.partie.seed){
                            console.log("Le corbeau a vu "+ corbeau.joueurVu!.nom);
                        }
                    });
                    this.partie.preparerEvenementDeGroupe(EvenementDeGroupe.CORBEAU, EvenementDeGroupe.CORBEAU);
                    return false
                }
                return true;
            
            case "Inserer Morts":
                let sorcieres: Villageois[] = this.partie.getPersonnages(Role.SORCIERE);
                if(this.partie.seed){
                    console.log("Vote de loups: ",this.partie.voteCourant.genererInfoVotes());
                }
                let joueursCibles: Villageois[] = []
                if(this.partie.voteCourant.auMoinsUnVote()){
                    joueursCibles.push(this.partie.voteCourant.gagnantVote(this.partie));
                }
                let grandMechantLoups: Villageois[] = this.partie.getPersonnages(Role.GRAND_MECHANT_LOUP);
                grandMechantLoups.forEach((grandMechantLoup: GrandMechantLoup)=>{
                    if(grandMechantLoup.villageoisATuer && !joueursCibles.includes(grandMechantLoup.villageoisATuer)){
                        joueursCibles.push(grandMechantLoup.villageoisATuer);
                    }
                })
                joueursCibles.forEach((joueurCible: Villageois)=>{
                    if(joueurCible.role !== Role.FEMME_DE_MENAGE || !(joueurCible as FemmeDeMenage).joueurMenage){
                        // si le joueur n'est pas protégé
                        if(sorcieres.length == 0 || !(sorcieres.map((sorciere) => { return (sorciere as Sorciere).joueurProtege}).includes(joueurCible))) {
                            this.partie.joueursMorts.push(joueurCible);
                            const femmesDeMenage: Villageois[] = this.partie.getPersonnages(Role.FEMME_DE_MENAGE);
                            femmesDeMenage.forEach((femmeDeMenage: Villageois)=>{
                                if(joueurCible == (femmeDeMenage as FemmeDeMenage).joueurMenage){
                                    this.partie.joueursMorts.push(femmeDeMenage);
                                }
                            })
                        } else {
                            let sorciere: Sorciere = sorcieres.filter((sorciere: Sorciere)=>{return sorciere.joueurProtege! == joueurCible})[0] as Sorciere;
                            this.partie.momentsForts.push({type: MomentFortType.SORCIERE_PROTEGER, params: [sorciere.nom, joueurCible.nom, sorciere == joueurCible]});
                        }
                    } else{
                        this.partie.momentsForts.push({type: MomentFortType.FEMME_DE_MENAGE, params:[joueurCible.nom, (joueurCible as FemmeDeMenage).joueurMenage!.nom]})
                    }
                })
                this.partie.joueursVivants.forEach((joueur) => {
                    joueur.actionFinNuit();
                })
                this.partie.joueursVivants.forEach((joueur) => {
                    joueur.actionFinNuit2eTour();
                })
                // chevalier a lepee rouillee
                this.partie.joueursDejaMorts.filter((joueur: Villageois)=>{return joueur.role == Role.CHEVALIER_A_LEPEE_ROUILLEE}).forEach((chevalier: Villageois)=>{
                    (chevalier as ChevalierALepeeRouillee).ajouterLoupMort();
                })
                return true;

            case "Afficher Morts":
                if(this.partie.modeVideo){
                    let nomJoueurQuiMarcheLaNuit: string = this.partie.joueursVivants[this.partie.random(this.partie.joueursVivants.length)].nom;
                    let textePendantLaNuit: string;
                    let texteJourSeLeve: string;
                    let nomsJoueursMorts: string[] = this.partie.joueursMorts.map((villageois: Villageois)=>{
                      return villageois.nom;
                   });
                    textePendantLaNuit = await this.partie.chatgptService.genererTextePendantLaNuit(nomJoueurQuiMarcheLaNuit)
                    texteJourSeLeve = await this.partie.chatgptService.genererTextejourSeLeve(nomsJoueursMorts)
                    this.partie.infoVideo =  {
                      nomJoueursMorts: nomsJoueursMorts,
                      nomJoueurAMontrer: nomJoueurQuiMarcheLaNuit,
                      textePendantLaNuit: textePendantLaNuit,
                      texteJourSeLeve: texteJourSeLeve
                    }
                    if( this.partie.getMeneursDeJeu().length>0){
                        this.partie.preparerEvenementDeGroupe(EvenementDeGroupe.JOUR_SE_LEVE, EvenementDeGroupe.VIDEO_MATIN);
                    } else {
                        this.partie.preparerEvenementDeGroupe(EvenementDeGroupe.VIDEO_MATIN, EvenementDeGroupe.VIDEO_MATIN);
                    }
                } else {
                    this.partie.preparerEvenementDeGroupe(EvenementDeGroupe.MONTRER_MORTS, EvenementDeGroupe.MONTRER_MORTS);
                    let evenementTexte:string[] = [];
                    evenementTexte = ["Tout le monde se réveille sauf:"]
                    let texte2: string = ""
                    if(this.partie.joueursMorts.length == 0){
                        evenementTexte = ["Personne n'est mort cette nuit"]
                    } else{
                        texte2+= this.getNomsEnListe(this.partie.joueursMorts.map((joueur: Villageois)=>{return joueur.nom}));
                        evenementTexte.push(texte2);
                    }
                    this.partie.historiqueEvenements.push(evenementTexte);
                }
                return false;
            case "Verification Morts":
                const fini: boolean = await this.verificationMorts.prochaineEtape();
                if(!fini){
                    this.retourAEtape(etapeCourante);
                }
                return fini;
        }
        return false;
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