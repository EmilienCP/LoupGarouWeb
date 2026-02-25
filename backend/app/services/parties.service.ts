import { injectable } from 'inversify'
import { InfoPartie } from '../../../common/infoPartie';
import { InfoPointsDeVictoire } from '../../../common/infoPointsDeVictoire';
import { JoindrePartieInfo } from '../../../common/joindrePartieInfo';
import { Appareil } from '../gestionnaire/appareil';
import { Partie } from '../gestionnaire/partie';
import { Villageois } from '../gestionnaire/Personnages/villageois';
import { Equipe, Joueur, Role } from '../../../common/Joueur';
import { EnfantSauvage } from '../gestionnaire/Personnages/enfantSauvage';
import { EvenementIndividuel } from '../../../common/evenements';
import { DeuxSoeurs } from '../gestionnaire/Personnages/deuxSoeurs';
import { TroisFreres } from '../gestionnaire/Personnages/troisFreres';
import { Voyante } from '../gestionnaire/Personnages/voyante';
import { Intro } from '../gestionnaire/temps/intro';

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

    joindrePartie(idJeu: number, idSocket: string): boolean{
        let dejaConnecteASonId: boolean = this.parties[idJeu].appareils.some((appareil: Appareil)=>{return appareil.idSocket == idSocket && appareil.disconnect});
        if(dejaConnecteASonId){
            this.getAppareil(idSocket).disconnect = false;
        }
        if(!dejaConnecteASonId){
            const nbJoueursExistants: number = this.parties[idJeu].appareils.map((appareil: Appareil) =>{return appareil.nomsJoueurs.length}).reduce((sum: number, value: number)=>{return sum+value}, 0)
            this.parties[idJeu].appareils.push(new Appareil(idSocket, "Joueur "+nbJoueursExistants));
        }
        return dejaConnecteASonId;
        
    }

    quitterPartie(idSocket: string): void {
        this.parties.forEach((partie: Partie)=>{
            const appareil: Appareil| undefined = partie.appareils.find((appareil: Appareil)=>{
                return appareil.idSocket == idSocket
            });
            appareil!.disconnect = true;
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
            return partie.appareils.some((appareil:Appareil)=>{
                return appareil.idSocket == idSocket
            });
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


        let joueurPresent: Villageois;
        let appareil: Appareil = this.getAppareil(idSocket);
        let infoVillage: Joueur[] = [];
        if(partie.joueursVivants.length > 0){
            if((appareil.indexJoueurPresent ==  -1) || appareil.siMeneurDeJeu()){
                //si le joueur est meneur de jeu, ou s'il a plusieurs joueurs dans le meme appareil, ou s'il vient juste darriver en milieu de partie, voir le village par rapport a un villageois normal
                joueurPresent = new Villageois(false, partie)
            } else {
                joueurPresent = appareil.getJoueurPresent();
            }
            partie.joueursVivants.concat(partie.joueursDejaMorts).forEach((villageois: Villageois)=>{
            infoVillage.push({
                nom: villageois.nom,
                estCapitaine: villageois.estCapitaine,
                role: (partie.joueursDejaMorts.includes(villageois) ||villageois == joueurPresent || villageois.role == Role.VILLAGEOIS_VILLAGEOIS || (joueurPresent.role == Role.VOYANTE && (joueurPresent as Voyante).villageoisRolesConnus.includes(villageois)))?villageois.role:undefined,
                rolePublic: villageois.rolePublic,
                //Si le loup garou du village ne sait pas encore quil est infecte, alors les autres loups ne doivent pas le voir non plus dans leur liste
                equipeApparente: villageois.equipeApparente == Equipe.LOUPS && !villageois.evenementsIndividuels.includes(EvenementIndividuel.INFO_INFECTE) && joueurPresent.equipeApparente == Equipe.LOUPS && !(partie.gestionnaireEtape.gestionnaireDeTemps instanceof Intro) && !joueurPresent.evenementsIndividuels.includes(EvenementIndividuel.INFO_INFECTE) && !joueurPresent.evenementsIndividuels.includes(EvenementIndividuel.INFO_ASSOCIER_MORT)? Equipe.LOUPS:Equipe.VILLAGEOIS,
                equipeReelle: villageois.equipeReelle,
                amoureux: ((joueurPresent.amoureux == villageois || (villageois.amoureux !== undefined && joueurPresent.role == Role.CUPIDON)) && !joueurPresent.evenementsIndividuels.includes(EvenementIndividuel.INFO_AMOUREUX)? villageois.nom: undefined),
                estInfecte: villageois.estInfecte,
                soiMeme: joueurPresent == villageois,
                estCharmer: (joueurPresent.estCharmer || joueurPresent.role == Role.JOUEUR_DE_FLUTE) && villageois.estCharmer && !joueurPresent.evenementsIndividuels.includes(EvenementIndividuel.INFO_CHARMER),
                estAssocier: (joueurPresent.role == Role.ENFANT_SAUVAGE && (joueurPresent as EnfantSauvage).joueurAssocie == villageois),
                estSoeur: (joueurPresent.role == Role.DEUX_SOEURS && (joueurPresent as DeuxSoeurs).deuxiemeSoeur == villageois && !(partie.gestionnaireEtape.gestionnaireDeTemps instanceof Intro)),
                estFrere: (joueurPresent.role == Role.TROIS_FRERES && (joueurPresent as TroisFreres).deuxFreres.includes(villageois) && !(partie.gestionnaireEtape.gestionnaireDeTemps instanceof Intro)),
                estMort: partie.joueursDejaMorts.includes(villageois)
            })
            })
        }

        let rolesVivants: Role[] = partie.joueursVivants.map((villageois: Villageois)=>{
            return villageois.role;
        }).sort((a: Role, b: Role)=>{
            return a-b;
        });

        let rolesMorts: Role[] = partie.joueursDejaMorts.map((villageois: Villageois)=>{
            return villageois.role;
        }).sort((a: Role, b: Role)=>{
            return a-b;
        });


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
            modeExtensionVillage: partie.modeExtensionVillage,
            backup: partie.activerBackup,
            idJeu: this.parties.indexOf(partie),
            idAppareil: partie.appareils.indexOf(this.getAppareil(idSocket)),
            preferencesPersonnages: partie.choixPersonnages,
            infosPointsDeVictoire : pointsDeVictoire,
            nbJoueursConnectesVivants: partie.getNbJoueursConnectesVivants(),
            numeroJour: partie.numeroJour,
            isMeneurDeJeu: appareil.siMeneurDeJeu(),
            isUnMeneurDeJeu: partie.getMeneursDeJeu().length>0,
            village: infoVillage,
            rolesVivants: rolesVivants,
            rolesMorts: rolesMorts,
            appareils: partie.appareils.map((appareil: Appareil)=>{
                return {
                    noms: appareil.nomsJoueurs,
                    pret: appareil.pret,
                    disconnect: appareil.disconnect
                }
            })
        }
    }

    getJoindrePartieInfo(): JoindrePartieInfo[]{
        let jpi: JoindrePartieInfo[]= [];
        this.parties.forEach((partie: Partie, id: number)=>{
            if(partie.appareils.filter((appareil: Appareil)=>{return !appareil.disconnect}).length >0){
                jpi.push({
                    etat: partie.etat,
                    id: id,
                    nombreAppareilConnectes: partie.appareils.length,
                    nombreDeJoueurs: partie.appareils.map((value)=>{return value.nomsJoueurs.length}).reduce((a,b)=>{return a+ b}),
                    nombreJoueursPartis: partie.appareils.filter((appareil: Appareil)=>{return appareil.disconnect}).length
                })
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
