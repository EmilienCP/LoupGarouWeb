import { injectable } from 'inversify'
import { InfoPartie } from '../../../common/infoPartie';
import { InfoPointsDeVictoire } from '../../../common/infoPointsDeVictoire';
import { EtatPartie, JoindrePartieInfo } from '../../../common/joindrePartieInfo';
import { Appareil } from '../gestionnaire/appareil';
import { Partie } from '../gestionnaire/partie';
import { Villageois } from '../gestionnaire/Personnages/villageois';

@injectable()
export class PartiesService {

    public parties: Partie[];

    constructor(){
        this.parties = []
    }

    creerPartie(idSocket: string): boolean{
        this.verifierSiDejaDansUnePartie(idSocket);
        if(this.parties.length >= 5){
            return false;
        }
        const partiesAPrendre: number[] = this.parties.filter((partie: Partie)=>{
            return partie.appareils.filter((appareil: Appareil)=>{return !appareil.disconnect}).length == 0;
        }).map((partie: Partie)=>{
            return this.parties.indexOf(partie);
        })
        if(partiesAPrendre.length>0){
            this.parties[partiesAPrendre[0]] = new Partie(idSocket);
            return true;
        }
        this.parties.push(new Partie(idSocket));
        return true;
    }

    joindrePartie(idJeu: number, idSocket: string): void{
        this.verifierSiDejaDansUnePartie(idSocket);
        const nbJoueursExistants: number = this.parties[idJeu].appareils.map((appareil: Appareil) =>{return appareil.nomsJoueurs.length}).reduce((sum: number, value: number)=>{return sum+value}, 0)
        this.parties[idJeu].appareils.push(new Appareil(idSocket, "Joueur "+nbJoueursExistants));
    }

    quitterPartie(idSocket: string): void {
        this.parties.forEach((partie: Partie)=>{
            const appareils: Appareil[] = partie.appareils.filter((appareil: Appareil)=>{
                return appareil.idSocket == idSocket
            });
            if(appareils.length ==1){
                if(partie.etat == EtatPartie.EN_COURS){
                    // partie.joueursVivants.forEach((joueur: Villageois)=>{
                    //     if(appareils[0].joueurs.includes(joueur)){
                    //         const nouvelIA: IA = partie.creerIA(joueur.role, joueur, true);
                    //         partie.ias.push(nouvelIA);
                    //         nouvelIA.initialiserCotes();
                    //     }
                    // })
                    appareils[0].disconnect = true;
                } else {
                    partie.appareils.splice(partie.appareils.indexOf(appareils[0]), 1);
                }
            }
        })
    }

    reconnecter(ancienId: string, nouvelId: string): boolean{
        let partieTrouvee: boolean = false;
        this.parties.forEach((partie: Partie)=>{
            partie.appareils.forEach((appareil: Appareil)=>{
                if(appareil.idSocket == ancienId){
                    appareil.idSocket = nouvelId
                    appareil.disconnect = false;
                    partieTrouvee = true;
                }
            })
        })
        return partieTrouvee;
    }

    getPartie(idSocket: string): Partie{
        const partiesPossibles: Partie[] = this.parties.filter((partie:Partie)=>{
            return partie.appareils.filter((appareil:Appareil)=>{
                return appareil.idSocket == idSocket
            }).length == 1;
        });
        if(partiesPossibles.length !== 1){
            throw new Error("get partie retourne pas une seule partie. idSocket: "+ idSocket + " parties.length: "+ partiesPossibles.length+ 
            " nombre de parties existantes: "+this.parties.length + (this.parties.length>1?" sockets connectes de la partie 0: " + this.parties[0].appareils.map((appareil: Appareil)=>{return appareil.idSocket}):""));
        } else {
            return partiesPossibles[0]
        }
    }

    getNomRoom(idSocket: string): string{
        return "partie" +this.parties.indexOf(this.getPartie(idSocket));
    }

    getAppareil(idSocket: string): Appareil{
        return this.parties.map((partie:Partie)=>{
            return partie.appareils.filter((appareil:Appareil)=>{
                return appareil.idSocket == idSocket
            });
        }).filter((appareils: Appareil[])=>{
            return appareils.length == 1;
        })[0][0];
    }

    getInfosJeu(idSocket: string): InfoPartie{
        const partie: Partie = this.getPartie(idSocket);
        const noms: string[][] = [];
        const pointsDeVictoire: InfoPointsDeVictoire[] = [];
        partie.appareils.forEach((appareil: Appareil, idAppareil: number)=>{
            noms.push(appareil.nomsJoueurs);
            appareil.nomsJoueurs.forEach((nom: string, index: number)=>{
                pointsDeVictoire.push({nom: nom, points: appareil.pointsJoueurs[index], pointsGagnes: appareil.pointsAAjouter[index], idAppareil: idAppareil, idJoueur: index});
            })
        });
        const meneurDeJeu:Appareil = partie.getMeneursDeJeu()[0];
        let idMeneurDeJeu: number = -1;
        if(meneurDeJeu){
            idMeneurDeJeu = partie.appareils.indexOf(meneurDeJeu);
        }
        return {
            noms: noms,
            nbJoueurs: partie.getNbJoueurs(),
            nbLoups: partie.getNbLoups(),
            nbVillageois: partie.getNbJoueurs()-partie.getNbLoups()-partie.getNbJoueursPourChoixPersonnages(),
            joueursSpeciaux: [],
            idMeneurDeJeu:idMeneurDeJeu,
            modeVideo: partie.modeVideo,
            modePatateChaude: partie.modePatateChaude,
            modeVillageoisVillageois: partie.modeVillageoisVillageois,
            backup: partie.activerBackup,
            idJeu: this.parties.indexOf(partie),
            idAppareil: partie.appareils.indexOf(this.getAppareil(idSocket)),
            preferencesPersonnages: partie.choixPersonnages,
            infosPointsDeVictoire : pointsDeVictoire,
            numeroJour: partie.numeroJour
        }
    }

    getJoindrePartieInfo(): JoindrePartieInfo[]{
        let jpi: JoindrePartieInfo[]= [];
        this.parties.forEach((partie: Partie, id: number)=>{
            if(partie.appareils.filter((appareil: Appareil)=>{return !appareil.disconnect}).length >0){
                jpi.push({etat: partie.etat, id: id, nombreAppareilConnectes: partie.appareils.length, nombreDeJoueurs: partie.appareils.map((value)=>{return value.nomsJoueurs.length}).reduce((a,b)=>{return a+ b})})
            }
        })
        return jpi;
    }

    appareilTermine(idSocket: string): boolean{
        const partie = this.getPartie(idSocket);
        this.getAppareil(idSocket).terminerSonTour();
        let termine: boolean = partie.appareils.filter((appareil: Appareil)=>{
            return !appareil.pret;
        }).length==0;
        return termine;
    }

    versLeHaut(index: number, idSocket: string){
        const partie: Partie = this.getPartie(idSocket);
        const temp: Appareil = partie.appareils[index-1];
        partie.appareils[index-1] = partie.appareils[index];
        partie.appareils[index] = temp;
    }

    getInfosPointsDeVictoire(idSocket: string): InfoPointsDeVictoire[]{
        const partie: Partie = this.getPartie(idSocket);
        const infos: InfoPointsDeVictoire[] = [];
        partie.appareils.forEach((appareil: Appareil, idAppareil: number)=>{
            appareil.joueurs.forEach((joueur: Villageois, index: number)=>{
                infos.push({
                    nom: joueur.nom,
                    points: appareil.pointsJoueurs[index],
                    pointsGagnes: appareil.pointsAAjouter[index],
                    idAppareil: idAppareil,
                    idJoueur: index 
                })
            })
        })
        return infos;
    }

    getJoueursEnAttente(idSocket: string): string[]{
        const joueursEnAttente: string[] = [];
        const partie: Partie = this.getPartie(idSocket);
        partie.appareils.forEach((appareil: Appareil)=>{
            if(!appareil.pret){
                for(let i = Math.max(appareil.indexJoueurPresent, 0); i<appareil.joueurs.length; i++){
                    joueursEnAttente.push(appareil.joueurs[i].nom);
                }
            }
        })
        return joueursEnAttente;
    }

    private verifierSiDejaDansUnePartie(idSocket: string): void{
        const partiesDejaDedans: Partie[] = this.parties.filter((partie: Partie)=>{
            return partie.appareils.filter((appareil: Appareil)=>{
                return appareil.idSocket == idSocket
            }).length>0
        });
        //verifier si le socket nest pas deja dans une partie
        if(partiesDejaDedans.length>0){
            console.log("un appareil tente de joindre une partie, mais se trouve deja dans une partie. Delete de sa partie courante en premier. idSocket: "+idSocket);
            partiesDejaDedans.forEach((partie: Partie)=>{
                partie.appareils = partie.appareils.filter((appareil: Appareil)=>{return appareil.idSocket!= idSocket});
                if(partie.appareils.length == 0){
                    this.parties.splice(this.parties.indexOf(partie));
                }
            });
        }
    }
}
