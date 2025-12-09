import { EvenementDeGroupe, EvenementIndividuel, RaisonPasVoter } from "../../../common/evenements";
import { Role } from "../../../common/Joueur";
import { Partie } from "./partie";
import { ServanteDevouee } from "./Personnages/servanteDevouee";
import { Villageois } from "./Personnages/villageois";

export class Appareil {
    nomsJoueurs: string[];
    pointsJoueurs: number[];
    pointsAAjouter: number[];
    joueurs: Villageois[];
    evenementsEnAttente: (EvenementDeGroupe | EvenementIndividuel)[]; // actions a executer
    evenementPresent: EvenementDeGroupe|EvenementIndividuel|undefined;
    indexJoueurPresent: number;
    private meneurDeJeu: boolean;
    pret: boolean;
    idSocket: string;
    passer: boolean;
    disconnect: boolean;
    

    constructor(idSocket: string, nomJoueur: string){
        this.nomsJoueurs = [nomJoueur];
        this.pointsJoueurs = [0];
        this.pointsAAjouter = [0];
        this.evenementsEnAttente = [];
        this.joueurs = [];
        this.indexJoueurPresent = -1;
        this.meneurDeJeu = false;
        this.pret = this.meneurDeJeu;
        this.idSocket = idSocket;
        this.passer = false;
        this.disconnect = false;
    }

    recommencer(): void {
        this.evenementsEnAttente = [];
        this.joueurs = [];
        this.indexJoueurPresent = -1;
        this.passer = false;
    }

    getUnEvenement(): EvenementIndividuel | EvenementDeGroupe{
        if(this.evenementsEnAttente.length == 0){
            this.indexJoueurPresent = -1;
            return EvenementIndividuel.ATTENTE;
        }
        if(this.evenementsEnAttente[0] ==  EvenementIndividuel.CHANGER_JOUEUR){
            this.indexJoueurPresent++;
        }
        this.evenementPresent = this.evenementsEnAttente.splice(0,1)[0]
        if(this.indexJoueurPresent > -1 && this.joueurs[this.indexJoueurPresent]){
            this.joueurs[this.indexJoueurPresent].backupRaisonPasVoter = undefined;
        }
        return this.evenementPresent;
    }
    
    getJoueurPresent(): Villageois{
        //meme si le seul joueur est mort, il faut retourner ce joueur pour get les infos du village meme quand il est mort
        if(this.joueurs.length == 1){
            return this.joueurs[0];
        }
        if(this.indexJoueurPresent >= this.joueurs.length || this.indexJoueurPresent<0){
            throw new Error("L'appareil contenant les joueurs : " + this.nomsJoueurs + " tente de get le joueur present avec l'index :"+this.indexJoueurPresent)
        }
        return this.joueurs[this.indexJoueurPresent];
    }

    preparerEvenementsIndividuels(listeVillageois: Villageois[] = [], joueursVivants: Villageois[],evenementPourLeMeneur?: EvenementDeGroupe): void{
        if(this.meneurDeJeu && evenementPourLeMeneur){
            if(listeVillageois.length == 0){
                this.evenementsEnAttente.push(evenementPourLeMeneur);
            }
            return;
        }
        
        let joueursRestants: Villageois[] = this.getJoueursRestants(joueursVivants);
        joueursRestants.forEach((villageois: Villageois)=>{
            if(listeVillageois.length == 0 || listeVillageois.includes(villageois)){
                if(joueursRestants.length > 1){
                    this.evenementsEnAttente.push(EvenementIndividuel.CHANGER_JOUEUR);
                    if(listeVillageois.length==1){
                        this.indexJoueurPresent = this.joueurs.indexOf(villageois)-1;
                    }
                } else {
                    this.indexJoueurPresent = this.joueurs.indexOf(villageois);
                }
                this.evenementsEnAttente = this.evenementsEnAttente.concat(villageois.viderEvenementsIndividuels());
            }
        })
        if(joueursRestants.length > 1 && (listeVillageois.length == 0 || joueursRestants.filter((joueur: Villageois) => {return listeVillageois.includes(joueur)}).length > 0)){
            this.evenementsEnAttente.push(EvenementIndividuel.MONTRER_TOUT_LE_MONDE);
        }
    }

    ajouterNouvelleAccusation(partie: Partie): void{
        if(!this.meneurDeJeu){
            this.indexJoueurPresent = 0;
        }
        if(!this.evenementsEnAttente.includes(EvenementDeGroupe.ACCUSER) && (this.meneurDeJeu|| partie.getMeneursDeJeu().length==0)){
            if(this.getJoueursRestantPasAccuser(partie).length>0 || (this.meneurDeJeu && partie.getJoueursReelsEncoreVivants().length>0 && partie.siqqnPeutAccuser())){
                this.evenementsEnAttente.unshift(EvenementDeGroupe.ACCUSER);
            }
        }
        if(!this.evenementsEnAttente.includes(EvenementDeGroupe.INFO_ACCUSER) && partie.getMeneursDeJeu().length==0){
            this.evenementsEnAttente.unshift(EvenementDeGroupe.INFO_ACCUSER);
        }
        
    }

    setJoueurPresentPourAccusation(joueur: Villageois, partie: Partie): void{
        if(this.meneurDeJeu){
            this.indexJoueurPresent = partie.joueursVivants.indexOf(joueur);
        } else {
            this.joueurs.forEach((villageois: Villageois, index: number)=>{
                if(villageois == joueur){
                    this.indexJoueurPresent = index;
                }
            })
        }
    }

    getRaisonsPasVoterAccusationQuiEtesVous(joueursVivants: Villageois[], partie: Partie): RaisonPasVoter[]{
        if(this.meneurDeJeu){
            return joueursVivants.map((villageois: Villageois)=>{
                if(!(partie.getJoueursReelsEncoreVivants().includes(villageois))){return RaisonPasVoter.PAS_APPAREIL};
                if(partie.appareils.some((appareil: Appareil)=>{return appareil.getJoueursRestantPasAccuser(partie).includes(villageois)})){
                    return RaisonPasVoter.AUCUN;
                }
                return RaisonPasVoter.PAS_ACCUSE;
            })
        }
        return joueursVivants.map((villageois: Villageois)=>{
            return this.joueurs.includes(villageois)? RaisonPasVoter.AUCUN: RaisonPasVoter.PAS_APPAREIL;
        })
    }

    getRaisonsPasVoterAccusation(partie: Partie): RaisonPasVoter[]{
        if(this.meneurDeJeu){
            return partie.joueursVivants[this.indexJoueurPresent].getRaisonsPasVoterAccusation();
        }
        return this.getJoueurPresent().getRaisonsPasVoterAccusation();
    }

    siPlusieursPersonnesPeuventAccuser(partie: Partie): boolean{
        return this.getJoueursRestantPasAccuser(partie).length > 1 || (this.meneurDeJeu);
    }

    siQuelquunPeutAccuser(partie: Partie): boolean{
        return this.getJoueursRestantPasAccuser(partie).length > 0 && (!this.meneurDeJeu);
    }

    getJoueursRestants(joueursVivants: Villageois[]): Villageois[]{
        return this.joueurs.filter((villageois: Villageois)=>{
            return joueursVivants.includes(villageois);
        })
    }

    private getJoueursRestantPasAccuser(partie: Partie): Villageois[]{
        return this.getJoueursRestants(partie.joueursVivants).filter((villageois: Villageois)=>{
            return !partie.voteCourant.aAccuser(villageois);
        })
    }

    switchMeneurDeJeu(): void{
        this.meneurDeJeu = !this.meneurDeJeu;
        this.pret = this.meneurDeJeu;
        if(this.meneurDeJeu){
            this.nomsJoueurs = [];
            this.pointsJoueurs = [];
            this.indexJoueurPresent = -1;
        } else {
            this.nomsJoueurs.push("Joueur 1");
            this.pointsJoueurs.push(0);
        }
    }

    ajouterEvenement(evenement: EvenementIndividuel|EvenementDeGroupe):void{
        this.evenementsEnAttente.push(evenement);
    }

    ajouterJoueur(nomJoueur: string){
        this.nomsJoueurs.push(nomJoueur);
        this.pointsJoueurs.push(0);
        this.pointsAAjouter.push(0);
    }

    siMeneurDeJeu(): boolean{
        return this.meneurDeJeu;
    }

    ouiServanteDevouee(partie: Partie): boolean{
        let servante: Villageois | undefined = this.joueurs.filter((joueurs: Villageois)=>{
            return joueurs.role == Role.SERVANTE_DEVOUEE;
        })[0];
        if(this.siMeneurDeJeu()){
            servante = partie.appareils.find((appareil: Appareil)=>{return appareil.joueurs.some((joueur: Villageois)=>{return joueur.role == Role.SERVANTE_DEVOUEE})})?.joueurs.find((joueur: Villageois)=>{return joueur.role == Role.SERVANTE_DEVOUEE})
        }
        if(servante){
            (servante as ServanteDevouee).ouiVeutPrendrePersonnage();
            return true;
        }
        return false;
    }

    terminerSonTour(){
        this.pret = true;
        this.evenementPresent = undefined;
        this.joueurs.forEach((joueur: Villageois)=>{
            joueur.backupRaisonPasVoter = undefined;
        });
    }

}