import { EvenementDeGroupe } from "../../../../common/evenements";
import { Role } from "../../../../common/Joueur";
import { Appareil } from "../appareil";
import { Partie } from "../partie";
import { Villageois } from "../Personnages/villageois";
import { GestionnaireDeTemps } from "./gestionnaireDeTemps";

export class Victoire extends GestionnaireDeTemps{

    constructor(partie: Partie){
        super(["Afficher Victoire","Montrer Personnages", "Points De Victoire","Moment Forts Info", "Moments Forts", "Credits",  "Terminer Partie"], partie)
    }
    
    protected async executerProchaineEtape(etapeCourante: number): Promise<boolean> {
        switch(this.listeEtapes[etapeCourante]){
            case "Afficher Victoire":
                //evenement afficher mort
                this.partie.appareils.forEach((appareil: Appareil)=>{
                    if(appareil.passer){
                        appareil.evenementsEnAttente = [];
                        appareil.passer = false;
                    }
                })
                this.partie.preparerEvenementDeGroupe(EvenementDeGroupe.VICTOIRE, EvenementDeGroupe.VICTOIRE);
                return false;
            case "Montrer Personnages":
                let texte: string[] = [];
                this.partie.joueursVivants.forEach((joueur: Villageois)=>{
                    texte.push(joueur.nom + " est " + this.convertirRoleTexte(joueur.role!) + (joueur.estInfecte ? " infecté." : ""));
                })
                this.partie.historiqueEvenements.push(texte);
                this.partie.preparerEvenementDeGroupe(EvenementDeGroupe.MONTRER_VIVANTS, EvenementDeGroupe.MONTRER_VIVANTS);
                return false;
            case "Points De Victoire":
                this.partie.appareils.forEach((appareil: Appareil)=>{
                    appareil.joueurs.forEach((joueur: Villageois, i: number)=>{
                        appareil.pointsAAjouter[i] = joueur.pointsDeVictoire();
                        appareil.pointsJoueurs[i] += appareil.pointsAAjouter[i];
                    })
                })
                this.partie.preparerEvenementDeGroupe(EvenementDeGroupe.MONTRER_POINTS_VICTOIRES, EvenementDeGroupe.MONTRER_POINTS_VICTOIRES);
                return false;
            case "Moment Forts Info":{
                if(this.partie.momentsForts.length>0){
                    this.partie.preparerEvenementDeGroupe(EvenementDeGroupe.MOMENTS_FORTS_INFO, EvenementDeGroupe.MOMENTS_FORTS_INFO);
                    return false;
                }
                return true;
            }
            case "Moments Forts" :{
                if(this.partie.momentsForts.length>0){
                    this.partie.momentFortPresent = this.partie.momentsForts.shift();
                    this.partie.preparerEvenementDeGroupe(EvenementDeGroupe.MOMENTS_FORTS, EvenementDeGroupe.MOMENTS_FORTS);
                    this.retourAEtape(etapeCourante);
                    return false;
                }
                return true;
            }
            case "Credits":
                this.partie.preparerEvenementDeGroupe(EvenementDeGroupe.CREDITS, EvenementDeGroupe.CREDITS);
                return false;
            case "Terminer Partie":
                this.partie.recommencer();
                return false;
            default:
                return false;
        }
    }

    private convertirRoleTexte(role: Role): string {
        switch(role){
            case Role.VILLAGEOIS: return "un Villageois";
            case Role.LOUP_GAROU: return "un Loup-Garou";
            case Role.VILLAGEOIS_VILLAGEOIS: return "un Villageois-Villageois";
            case Role.VOYANTE: return "la Voyante";
            case Role.CUPIDON: return "le Cupidon";
            case Role.SORCIERE: return "la Sorcière";
            case Role.CHASSEUR: return "le Chasseur";
            case Role.INFECT_PERE_LOUPS: return "l'Infect Père des Loups";
            case Role.MONTREUR_OURS: return "le Montreur d'Ours";
            case Role.RENARD: return "le Renard";
            case Role.CORBEAU: return "le Corbeau";
            case Role.FEMME_DE_MENAGE: return "la Femme de Ménage";
            case Role.HYPNOTISEUR: return "l'Hypnotiseur";
            case Role.JOUEUR_DE_FLUTE: return "le Joueur de Flûte";
            case Role.ENFANT_SAUVAGE: return "l'Enfant Sauvage";
            case Role.LOUP_BLANC: return "le Loup-Garou Blanc";
            case Role.SERVANTE_DEVOUEE: return "la Servante Dévouée";
            case Role.CHEVALIER_A_LEPEE_ROUILLEE: return "le Chevalier À l'Épée Rouillée";
            case Role.DEUX_SOEURS: return "l'une des Deux Soeurs";
            case Role.TROIS_FRERES: return "l'un des Trois Frères";
            case Role.GRAND_MECHANT_LOUP: return "le Grand Méchant Loup";
          }
    }
    
}