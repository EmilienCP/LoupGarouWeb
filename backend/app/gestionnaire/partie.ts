import { EtatPartie } from "../../../common/joindrePartieInfo";
import { EvenementDeGroupe, EvenementIndividuel, RaisonPasVoter, Victoire } from "../../../common/evenements";
import { Appareil } from "./appareil";
import { GestionnaireEtape } from "./temps/gestionnaireEtape";
import { Equipe, Role, RolePublic } from "../../../common/Joueur";
import { IA } from "./IAS/ia";
import { Villageois } from "./Personnages/villageois";
import { Vote } from "./vote";
import { Voyante } from "./Personnages/voyante";
import { Cupidon } from "./Personnages/cupidon";
import { IAVoyante } from "./IAS/iaVoyante";
import { IACupidon } from "./IAS/iaCupidon";
import { Sorciere } from "./Personnages/sorciere";
import { IASorciere } from "./IAS/iaSorciere";
import { Chasseur } from "./Personnages/chasseur";
import { IAChasseur } from "./IAS/iaChasseur";
import { InfectPereDesLoups } from "./Personnages/infectPereDesLoups";
import { IAInfectPereDesLoups } from "./IAS/iaInfectPereDesLoups";
import { MontreurOurs } from "./Personnages/montreurOurs";
import { IAMontreurOurs } from "./IAS/iaMontreurOurs";
import { IAChevalierALepeeRouillee } from "./IAS/iaChevalierALepeeRouillee";
import { Renard } from "./Personnages/renard";
import { IARenard } from "./IAS/iaRenard";
import { Corbeau } from "./Personnages/corbeau";
import { IACorbeau } from "./IAS/iaCorbeau";
import { FemmeDeMenage } from "./Personnages/femmeDeMenage";
import { IAFemmeDeMenage } from "./IAS/iaFemmeDeMenage";
import { Action, HistoriquePartie } from "./gestionBugs/historiquePartie";
import { Hypnotiseur } from "./Personnages/hypnotiseur";
import { IAHypnotiseur } from "./IAS/iaHypnotiseur";
import { JoueurDeFlute } from "./Personnages/joueurDeFlute";
import { IAJoueurDeFlute } from "./IAS/iaJoueurDeFlute";
import { EnfantSauvage } from "./Personnages/enfantSauvage";
import { IAEnfantSauvage } from "./IAS/iaEnfantSauvage";
import { LoupBlanc } from "./Personnages/loupBlanc";
import { IALoupBlanc } from "./IAS/iaLoupBlanc";
import { ServanteDevouee } from "./Personnages/servanteDevouee";
import { IAServanteDevouee } from "./IAS/iaServanteDevouee";
import { ChevalierALepeeRouillee } from "./Personnages/chevalierALepeeRouillee";
import { ChatgptService } from "../services/chatgpt.service";
import { MomentFort } from "../../../common/momentFort";
import { InfoVideo } from "../../../common/infoVideo";
import * as fs from 'fs';
import { DeuxSoeurs } from "./Personnages/deuxSoeurs";
import { IADeuxSoeurs } from "./IAS/iaDeuxSoeurs";
import { TroisFreres } from "./Personnages/troisFreres";
import { IATroisFreres } from "./IAS/iaTroisFreres";
import { GrandMechantLoup } from "./Personnages/grantMechantLoup";
import { IAGrandMechantLoup } from "./IAS/iaGrandMechantLoup";

export class Partie {
    etat: EtatPartie;
    joueursVivants: Villageois[] = [];
    joueursMorts: Villageois[] = [];
    joueursDejaMorts: Villageois[] = [];
    private nbJoueurs: number;
    private nbLoups: number;
    victoire: Victoire =  Victoire.AUCUN;
    appareils: Appareil[] = [];
    gestionnaireEtape: GestionnaireEtape;
    ias: IA[] = [];
    voteCourant: Vote;
    private rand: any;
    seed?:  number;
    numeroJour: number;
    infoVideo?: InfoVideo;
    private historiquePartie: HistoriquePartie;
    chatgptService: ChatgptService;
    texteCourant: string;
    momentsForts: MomentFort[];
    momentFortPresent: MomentFort | undefined;
    activerBackup: boolean = false;
    historiqueEvenements: string[][];

    modeVideo: boolean;
    modeVillageoisVillageois: boolean;
    modePatateChaude: boolean;
    modeExtensionVillage: boolean;
    choixPersonnages: Role[];
    simulation: boolean = false;
    
    constructor(idSocket: string, seed?: number, simulation: boolean = false) {
        this.simulation = simulation;
        this.rand = require('random-seed').create();
        if(this.seed){
            seed = this.seed;
        }
        if(seed){
            console.log("seed: "+seed)
            if(!this.simulation)this.seed = seed;
        } else {
            seed = this.random(1000);
            console.log("seed", seed);
        }
        this.rand.seed(seed);
        this.historiquePartie = {
            actions: [],
            choixPersonnages: [],
            nbAppareils: -1,
            nbJoueurs: -1,
            nbLoups: -1,
            seed: seed!,
            modePatateChaude: false,
            modeExtensionVillage: false,
            modeVillageoisVillageois: false,
            modeVideo: false,
            meneurDeJeu: false,
            noms: [],
            points:[]
        }
        if(!this.simulation){
            this.appareils.push(new Appareil(idSocket, "Joueur 0"));
        }
        this.etat = EtatPartie.EN_ATTENTE;
        this.gestionnaireEtape = new GestionnaireEtape(this);
        this.nbJoueurs = 17;
        this.nbLoups = 1;
        this.voteCourant = new Vote();
        this.modeVideo = false;
        this.modeVillageoisVillageois = true;
        this.modePatateChaude = false;
        this.modeExtensionVillage = false;
        this.numeroJour = 0;
        this.momentsForts = [];
        this.momentFortPresent = undefined;
        this.choixPersonnages = [Role.VOYANTE, Role.CUPIDON, Role.SORCIERE, 
                                Role.CHASSEUR, Role.INFECT_PERE_LOUPS,
                                Role.MONTREUR_OURS, Role.RENARD, Role.CORBEAU, Role.FEMME_DE_MENAGE,
                                Role.HYPNOTISEUR, Role.JOUEUR_DE_FLUTE, Role.ENFANT_SAUVAGE,
                                Role.LOUP_BLANC, Role.SERVANTE_DEVOUEE, Role.DEUX_SOEURS];
        this.chatgptService = new ChatgptService(this.seed?true:false);
        this.historiqueEvenements = [];
        //this.ajustementPartie(false, false, false);
    }

    recommencer() {
        this.joueursVivants = [];
        this.joueursMorts = [];
        this.joueursDejaMorts = [];
        this.voteCourant.clean();
        this.ias = [];
        this.momentsForts = [];
        this.momentFortPresent = undefined;
        this.appareils.forEach((appareil: Appareil)=>{
            appareil.recommencer();
        })
        this.gestionnaireEtape = new GestionnaireEtape(this);
        this.numeroJour = 0;
        this.victoire = Victoire.AUCUN;
        this.etat = EtatPartie.EN_ATTENTE;
        this.rand = require('random-seed').create();
        let seed: number = this.rand(1000);
        if(this.seed){
            seed = this.seed;
        }
        this.rand.seed(seed);
        console.log("seed: "+seed)
        this.historiquePartie = {
            actions: [],
            choixPersonnages: [],
            nbAppareils: -1,
            nbJoueurs: -1,
            nbLoups: -1,
            seed: seed!,
            modePatateChaude: false,
            modeExtensionVillage: false,
            modeVillageoisVillageois: false,
            modeVideo: false,
            meneurDeJeu: false,
            noms: this.historiquePartie.noms,
            points: this.historiquePartie.points
        }
        this.activerBackup = false;
        this.historiqueEvenements = [];
    }

    async initialiserBackup(){
        let backup = fs.readFileSync("app\\backups\\backupStatique.json", "utf-8")
        this.recommencer();
        let historique: HistoriquePartie = JSON.parse(backup) as HistoriquePartie;

        this.historiquePartie = historique;
        this.rand.seed(historique.seed);
        this.seed = historique.seed;
        console.log("nouveau seed",historique.seed);

        this.choixPersonnages = historique.choixPersonnages;
        this.setNbJoueurs(historique.nbJoueurs, false);
        this.setNbLoups(historique.nbLoups, false);
        this.modePatateChaude = historique.modePatateChaude;
        this.modeExtensionVillage = historique.modeExtensionVillage;
        this.modeVillageoisVillageois = historique.modeVillageoisVillageois;
        this.modeVideo = historique.modeVideo;
        if(historique.meneurDeJeu){
            this.appareils[0].switchMeneurDeJeu();
            historique.noms.splice(0,1);
        }

        historique.noms.forEach((liste: string[], i: number)=>{
            let appareil = new Appareil(""+i, liste[0]);
            appareil.disconnect = true;
            this.appareils.push(appareil)
            this.setPointage(i, 0, historique.points[i][0])
            liste.forEach((nom: string, j: number)=>{
                if(j>0){
                    appareil.ajouterJoueur(nom);
                    this.setPointage(i, j, historique.points[i][j]);
                }
            })
        })
        console.log("hellooo", this.appareils.map((a=>a.nomsJoueurs)))

        await this.commencerPartie().then(async ()=>{
            for(let i: number = 0; i<historique.actions.length; i++){
                let action: Action[] = historique.actions[i];
                switch(action[0]){
                    case Action.PROCHAINE_ETAPE:{
                        this.appareils.forEach((appareil: Appareil)=>{appareil.terminerSonTour()});
                        await this.prochaineEtape().then(()=>{});
                        break;
                    }
                    case Action.VOTER_VILLAGEOIS:{
                        this.joueursVivants[action[2]].choisirJoueur(this.joueursVivants[action[3]], +action[1], false);
                        break;
                    }
                    case Action.PASSER:{
                        this.appareils[action[1]].passer = true;
                        break;
                    }
                    case Action.OUI_SERVANTE_DEVOUEE:{
                        (this.getPersonnages(Role.SERVANTE_DEVOUEE)[0] as ServanteDevouee).ouiVeutPrendrePersonnage();
                        break;
                    }
                    case Action.POP_RAISON_PAS_VOTER:{
                        this.joueursVivants[action[1]].popRaisonsPasVoter();
                        break;
                    }
                    case Action.GET_UN_EVENEMENT:{
                        this.appareils[action[1]].getUnEvenement();
                        break;
                    }
                }
            }
        })
    }

    public async commencerPartie(): Promise<void> {
        // coucou
        // créer le village
        // assigner les rôles :D
        // IA pour les joueurs manquants
        if(this.activerBackup){
            this.activerBackup = false;
            await this.initialiserBackup();
            return;
        }

        let roles: Role[] = [];
        
        for(let i: number = 0; i < this.nbLoups; i++) {
            roles.push(Role.LOUP_GAROU);
        }

        for(let i: number = 0; i< this.choixPersonnages.length; i++){
            roles.push(this.choixPersonnages[i]);
            if(this.choixPersonnages[i] == Role.DEUX_SOEURS){
                roles.push(this.choixPersonnages[i]);
            }
            if(this.choixPersonnages[i] == Role.TROIS_FRERES){
                roles.push(this.choixPersonnages[i]);
                roles.push(this.choixPersonnages[i]);
            }
        }
        
        let nbVillageois: number = this.nbJoueurs-roles.length;
        for(let i: number = 0; i < nbVillageois; i++) {
            roles.push(Role.VILLAGEOIS);
        }

        roles = roles.sort(() => this.rand.random() - 0.5);
        if(this.seed){
            console.log(roles);
        }
        
        //roles.splice(roles.indexOf(Role.SERVANTE_DEVOUEE),1);
        //roles.splice(roles.indexOf(Role.LOUP_GAROU),1);
        //roles.unshift(Role.LOUP_GAROU);
        //roles.unshift(Role.SERVANTE_DEVOUEE);
        console.log("roles", roles)

        let rolesPublics: RolePublic[] = [];
        if(this.modeExtensionVillage){
            for(let i: number = 0; i < Math.floor(this.nbJoueurs/2); i++){
                rolesPublics.push(RolePublic.FERMIER);
            }
            rolesPublics.push(RolePublic.INSTITUTRICE);
            let nbJoueursAvecRolePublic: number = rolesPublics.length;
            for(let i: number = 0; i< this.nbJoueurs-nbJoueursAvecRolePublic; i++){
                rolesPublics.push(RolePublic.VAGABOND)
            }
            rolesPublics = rolesPublics.sort(() => this.rand.random() - 0.5);
            //rolesPublics.splice(rolesPublics.indexOf(RolePublic.INSTITUTRICE),1);
            //rolesPublics.unshift(RolePublic.INSTITUTRICE);
        }

        let indexCourant: number = 0;
        this.appareils.forEach((appareil: Appareil) => {
            appareil.nomsJoueurs.forEach((joueur) => {
                const villageois: Villageois = this.creerVillageois(roles[indexCourant]);
                villageois.nom = joueur;
                if(this.modeExtensionVillage) villageois.rolePublic = rolesPublics[indexCourant];
                this.joueursVivants.push(villageois);
                appareil.joueurs.push(villageois)
                indexCourant++;
            })
        });

        for(indexCourant; indexCourant < this.nbJoueurs; indexCourant++) {
            const villageois: Villageois = this.creerVillageois(roles[indexCourant]);
            villageois.nom = "Joueur " + (indexCourant);
            if(this.modeExtensionVillage) villageois.rolePublic = rolesPublics[indexCourant];
            const ia: IA = this.creerIA(roles[indexCourant], villageois)
            this.joueursVivants.push(villageois);
            this.ias.push(ia);
        }

        this.ias.forEach((ia: IA)=>{
            ia.initialiserCotes();
        })
        this.etat = EtatPartie.EN_COURS;
        this.historiquePartie = {
            actions:this.historiquePartie.actions,
            choixPersonnages: this.choixPersonnages,
            nbAppareils: this.joueursVivants.length-this.ias.length,
            nbJoueurs: this.nbJoueurs,
            nbLoups: this.nbLoups,
            seed: this.historiquePartie.seed,
            modePatateChaude: this.modePatateChaude,
            modeExtensionVillage: this.modeExtensionVillage,
            modeVillageoisVillageois: this.modeVillageoisVillageois,
            modeVideo: this.modeVideo,
            meneurDeJeu: this.appareils.some((appareil: Appareil)=>{return appareil.siMeneurDeJeu()}),
            noms: this.appareils.map((appareil: Appareil)=>{return appareil.nomsJoueurs}),
            points: this.appareils.map((appareil: Appareil)=>{return appareil.pointsJoueurs})
        }

        await this.prochaineEtape();
    }

    public creerVillageois(role: Role, normalDeCreerVillageoisVillageois: boolean = false): Villageois {
        switch(role) {
            case Role.LOUP_GAROU:
                return new Villageois(true, this);
            case Role.VILLAGEOIS:
                return new Villageois(false, this);
            case Role.VOYANTE:
                return new Voyante(this);
            case Role.CUPIDON:
                return new Cupidon(this);
            case Role.SORCIERE:
                return new Sorciere(this);
            case Role.CHASSEUR:
                return new Chasseur(this);
            case Role.INFECT_PERE_LOUPS:
                return new InfectPereDesLoups(this);
            case Role.MONTREUR_OURS:
                return new MontreurOurs(this);
            case Role.RENARD:
                return new Renard(this);
            case Role.CORBEAU:
                return new Corbeau(this);
            case Role.FEMME_DE_MENAGE:
                return new FemmeDeMenage(this);
            case Role.HYPNOTISEUR:
                return new Hypnotiseur(this);
            case Role.JOUEUR_DE_FLUTE:
                return new JoueurDeFlute(this);
            case Role.ENFANT_SAUVAGE:
                return new EnfantSauvage(this);
            case Role.LOUP_BLANC:
                return new LoupBlanc(this);
            case Role.SERVANTE_DEVOUEE:
                return new ServanteDevouee(this);
            case Role.CHEVALIER_A_LEPEE_ROUILLEE:
                return new ChevalierALepeeRouillee(this);
            case Role.DEUX_SOEURS:
                return new DeuxSoeurs(this);
            case Role.TROIS_FRERES:
                return new TroisFreres(this);
            case Role.GRAND_MECHANT_LOUP:
                return new GrandMechantLoup(this);
            case Role.VILLAGEOIS_VILLAGEOIS:
                if(!normalDeCreerVillageoisVillageois){
                    throw new Error("un villageois villageois tente detre creer");
                } else {
                    let nouveauVillageois: Villageois = new Villageois(false, this);
                    nouveauVillageois.role = Role.VILLAGEOIS_VILLAGEOIS;
                    return nouveauVillageois;
                }
            default:
                throw new Error("un personnage ne peut pas etre creer "+role);
        }
    }

    public creerIA(role: Role, villageois: Villageois, peutCreerVillageoisVillageois: boolean = false): IA{
        switch(role) {
            case Role.LOUP_GAROU:
            case Role.VILLAGEOIS:
                return new IA(villageois, this);
            case Role.VOYANTE:
                return new IAVoyante(villageois as Voyante, this);
            case Role.CUPIDON:
                return new IACupidon(villageois as Cupidon, this);
            case Role.SORCIERE:
                return new IASorciere(villageois as Sorciere, this);
            case Role.CHASSEUR:
                return new IAChasseur(villageois as Chasseur, this);
            case Role.INFECT_PERE_LOUPS:
                return new IAInfectPereDesLoups(villageois as InfectPereDesLoups, this);
            case Role.MONTREUR_OURS:
                return new IAMontreurOurs(villageois as MontreurOurs, this);
            case Role.RENARD:
                return new IARenard(villageois as Renard, this);
            case Role.CORBEAU:
                return new IACorbeau(villageois as Corbeau, this);
            case Role.FEMME_DE_MENAGE:
                return new IAFemmeDeMenage(villageois as FemmeDeMenage, this);
            case Role.HYPNOTISEUR:
                return new IAHypnotiseur(villageois as Hypnotiseur, this);
            case Role.JOUEUR_DE_FLUTE:
                return new IAJoueurDeFlute(villageois as JoueurDeFlute, this);
            case Role.ENFANT_SAUVAGE:
                return new IAEnfantSauvage(villageois as EnfantSauvage, this);
            case Role.LOUP_BLANC:
                return new IALoupBlanc(villageois as LoupBlanc, this);
            case Role.SERVANTE_DEVOUEE:
                return new IAServanteDevouee(villageois as ServanteDevouee, this);
            case Role.CHEVALIER_A_LEPEE_ROUILLEE:
                return new IAChevalierALepeeRouillee(villageois as ChevalierALepeeRouillee, this);
            case Role.DEUX_SOEURS:
                return new IADeuxSoeurs(villageois as DeuxSoeurs, this);
            case Role.TROIS_FRERES:
                return new IATroisFreres(villageois as TroisFreres, this);
            case Role.GRAND_MECHANT_LOUP:
                return new IAGrandMechantLoup(villageois as GrandMechantLoup, this);
            case Role.VILLAGEOIS_VILLAGEOIS:
                if(peutCreerVillageoisVillageois){
                    return new IA(villageois, this);
                }
                throw new Error("un villageois villageois tente detre creer")
        }
    }

    public async prochaineEtape(): Promise<void>{
        this.appareils.forEach((appareil: Appareil)=>{
            if(!appareil.siMeneurDeJeu() && !appareil.passer){ appareil.pret = false;};
            if(appareil.passer){ appareil.evenementsEnAttente = []};
        })
        let appareilsPasPasser: Appareil[] = this.appareils.filter((appareil: Appareil)=>{
            return !appareil.passer;
        });
        if(appareilsPasPasser.length == 1 && appareilsPasPasser[0].siMeneurDeJeu()){
            appareilsPasPasser[0].passer = true;
            appareilsPasPasser = [];
        }
        if(appareilsPasPasser.length == 0){
            let compteur: number= 0;
            while(this.victoire == Victoire.AUCUN){
                compteur++;
                if(compteur > 200){
                    throw new Error("n'arrive jamais à trouver une victoire");
                }
                await this.gestionnaireEtape.prochaineEtape();
                
                this.ias.forEach((ia: IA)=>{
                    ia.jouer();
                })
            }
            if(this.simulation){
                compteur = 0;
                while(+this.victoire != Victoire.AUCUN){
                    compteur++;
                    if(compteur > 200){
                        throw new Error("n'arrive jamais à trouver une victoire");
                    }
                    await this.gestionnaireEtape.prochaineEtape();
                    
                    this.ias.forEach((ia: IA)=>{
                        ia.jouer();
                    })
                }
            }
        } else {
            await this.gestionnaireEtape.prochaineEtape();
            this.ias.forEach((ia: IA)=>{
                ia.jouer();
            })
        }
    }

    verifierVictoire(joueursVivants: Villageois[], premature: boolean): boolean {
        if(joueursVivants.length ==0){
            if(this.seed){console.log("Personne ne gagne")};
            this.victoire = Victoire.PERSONNE;
            return true;
        }
        if(joueursVivants.length == 2 && joueursVivants[0].amoureux == joueursVivants[1]){
            if(this.seed){console.log("Les amoureux gagnent")};
            this.victoire = Victoire.AMOUREUX;
            return true;
        }
        let joueurDeFlute: Villageois = this.getPersonnages(Role.JOUEUR_DE_FLUTE)[0];
        if(joueurDeFlute){
            if(joueursVivants.filter((joueur: Villageois)=>{
                return !joueur.estCharmer && joueur !== joueurDeFlute && joueur !== joueurDeFlute.amoureux;
            }).length == 0){
                if(joueurDeFlute.amoureux !== undefined){
                    if(this.seed){console.log("Les amoureux gagnent")};
                    this.victoire = Victoire.AMOUREUX;
                    return true;
                } else {
                    if(this.seed){console.log("Le joueur de flute gagne")};
                    this.victoire = Victoire.JOUEUR_DE_FLUTE;
                    return true;
                }
            }
        }

        if(joueursVivants.length == 1 && joueursVivants[0].role == Role.LOUP_BLANC){
            if(this.seed){console.log("Le loup garou blanc gagne")};
            this.victoire = Victoire.LOUP_BLANC;
            return true;
        }


        let nbLoupsVivants: number = 0;
        let nbVillageoisVivants: number = 0;
        joueursVivants.forEach((joueur) => {
            if(joueur.equipeApparente == Equipe.LOUPS)
                nbLoupsVivants++;
            else {
                nbVillageoisVivants++;
            }
        })

        if(nbVillageoisVivants == 0) {
            if(this.seed){console.log("Les loups gagnent")};
            this.victoire = Victoire.LOUP_GAROU;
            return true
        } else if(nbLoupsVivants == 0) {
            if(this.seed){console.log("Les villageois gagnent")};
            this.victoire = Victoire.VILLAGEOIS;
            return true;
        }
        if(premature){
            return this.verifierVictoirePrematuree();
        } else {
            return false;
        }
    }

    verifierVictoirePrematuree(): boolean{
        let matin: boolean = this.numeroJour%2==1;

        //capitaine
        if(matin && this.joueursVivants.length == 2 && !this.joueursVivants.some(j=>j.rolePublic==RolePublic.INSTITUTRICE || j.role == Role.CORBEAU)){
            this.victoire = this.joueursVivants.find((joueur)=>joueur.estCapitaine)!.getSorteVictoireSilGagne();
            return true;
        }
        
        //loups A FAIRE
        if(!matin && this.joueursVivants.length == 2){
            //le chasseur ne doit pas être infecté
            if(this.joueursVivants.some((j)=>j.role == Role.CHASSEUR && j.equipeApparente == Equipe.VILLAGEOIS)){
                if(this.seed){console.log("Personne ne gagne")};
                this.victoire = Victoire.PERSONNE;
                return true
            }
            if(this.joueursVivants.some((j)=>j.role == Role.LOUP_BLANC)){
                if(this.seed){console.log("Le loup garou blanc gagne")};
                this.victoire = Victoire.LOUP_BLANC;
                return true
            }
            if(this.seed){console.log("Les loups gagnent")};
            this.victoire = Victoire.LOUP_GAROU;
            return true;
        }

        return false;
    }

    verifierVictoireAssumantMorts(): boolean{
        let joueursRestants: Villageois[] = this.joueursVivants.filter((joueur)=>!this.joueursMorts.includes(joueur));
        if(this.verifierVictoire(joueursRestants, false)){
            return true;
        }
        return false;
    }

    preparerEvenementDeGroupe(evenement: EvenementDeGroupe, evenementPourMeneur: EvenementDeGroupe, exclureVillageois: Villageois[] = []){
        this.appareils.forEach((appareil: Appareil)=>{
            if(appareil.siMeneurDeJeu()){
                appareil.ajouterEvenement(evenementPourMeneur);
            } else if(exclureVillageois.length == 0 || appareil.joueurs.filter((villageois:Villageois)=>{
                return !exclureVillageois.includes(villageois);
            }).length > 0){
                appareil.ajouterEvenement(evenement);
            }
        })
        this.ias.forEach((ia: IA)=>{
            if(exclureVillageois.length == 0 || !exclureVillageois.includes(ia.villageois)){
                ia.evenementsEnAttente.push(evenement);
            }
        })
    }

    preparerEvenementsIndividuels(evenementPourLeMeneur?: EvenementDeGroupe, listeVillageois: Villageois[] = []){
        this.appareils.forEach((appareil: Appareil)=>{
            appareil.preparerEvenementsIndividuels(listeVillageois, this.joueursVivants, evenementPourLeMeneur);
        })
        this.ias.forEach((ia: IA)=>{
            ia.preparerEvenementsIndividuels(listeVillageois);
        })
    }



    nouvelleAccusation(electeur: Villageois, cible: Villageois){
        if(this.seed){
            console.log(electeur.nom + " accuse "+ cible.nom)
        }
        const ia: IA = this.ias.filter((i)=>{return i.villageois == electeur})[0];
        if(ia && this.seed){
            console.log("cotes", ia.afficherCotes())
        }
        this.appareils.forEach((appareil: Appareil)=>{
            appareil.ajouterNouvelleAccusation(this);
        })
        this.ias.forEach((ia: IA)=>{
            ia.ajustementCoteAccusation(electeur, cible);
        });
        this.faireAccuserIas();
        this.historiqueEvenements[this.historiqueEvenements.length-1] = this.voteCourant.genererAccusation();
    }

    switchVideo(): void{
        this.modeVideo = !this.modeVideo;
    }

    switchPatateChaude(): void{
        this.modePatateChaude = !this.modePatateChaude;
    }

    switchExtensionVillage(): void{
        this.modeExtensionVillage = !this.modeExtensionVillage;
    }

    switchBackup(): void{
        this.activerBackup = !this.activerBackup;
    }

    switchVillageoisVillageois(): void{
        this.modeVillageoisVillageois = !this.modeVillageoisVillageois;
    }

    getMeneursDeJeu(): Appareil[]{
        return this.appareils.filter((appareil: Appareil)=>{
            return appareil.siMeneurDeJeu();
        });
    }

    tuerDefinitivementMorts(): void{
        this.getPersonnages(Role.ENFANT_SAUVAGE).forEach((enfantSauvage: EnfantSauvage)=>{
            enfantSauvage.nouveauMort(this.joueursMorts);
        })
        this.joueursMorts.forEach((villagois: Villageois)=>{
            this.ias.forEach((ia: IA)=>{
                ia.retirerJoueur(villagois);
            })
            this.joueursVivants.splice(this.joueursVivants.indexOf(villagois), 1);
        })
        this.ias = this.ias.filter((ia: IA)=>{
            return !this.joueursMorts.includes(ia.villageois);
        })
        if(this.seed && this.joueursMorts.length>0){
            console.log("tuer definitivement "+this.joueursMorts.map((joueur: Villageois)=>{return joueur.nom}))
        } else if(this.seed){
            console.log("tuer personne")
        }
        if(this.joueursMorts.length >0){
            this.joueursDejaMorts = this.joueursDejaMorts.concat(this.joueursMorts.splice(0, this.joueursMorts.length));
        }
        if(this.joueursVivants.length>0){
            if(this.joueursVivants.filter((joueur) => {return joueur.estCapitaine;}).length == 0) {
                throw new Error("Il n'y a pas de capitaine! No good.")
            }
            if(this.joueursVivants.filter((joueur) => {return joueur == undefined;}).length > 0) {
                throw new Error("Il y a un joueur undefined! No good.")
            }
            if(this.joueursVivants.filter((joueur)=>{return joueur.amoureux && this.joueursDejaMorts.includes(joueur.amoureux)}).length>0){
                throw new Error("Il y a un joueur vivant que son amoureux est mort! No good.")
            }
        }
    }

    faireAccuserIas(): void{
        //Phase1:
        if(this.seed){
            console.log("Phase 1")
        }
        for(let i = 0; i < this.ias.length; i++){
            if(this.voteCourant.peutAccuser(this.ias[i].villageois, this)){
                if(this.ias[i].accuserSiInsister()){
                    return;
                }
            }
        }
        if(this.seed){
            console.log("Phase 2")
        }
        //Phase2:
        for(let i = 0; i < this.ias.length; i++){
            if(this.voteCourant.peutAccuser(this.ias[i].villageois, this)){
                if(this.ias[i].accuserSiHasard()){
                    return;
                }
            }
        }
        if(this.seed){
            console.log("Phase 3")
        }
        //Phase3:
        for(let i = 0; i < this.ias.length; i++){
            if(this.voteCourant.peutAccuser(this.ias[i].villageois, this)){
                if(this.ias[i].accuserSiDanger()){
                    return;
                }
            }
        }
        if(this.seed){
            console.log("Phase 4")
        }
        //Phase4:
        //na pas de sens le 2e && pcq si les joueurs reels accusent pas ca crash
        if(!this.voteCourant.auMoinsUnAccuse() && this.ias.length>0/* &&
            this.appareils
            .map((appareil: Appareil)=>{return appareil.getJoueursRestants(this.joueursVivants).length;})
            .reduce((sum: number, current: number)=>{return sum + current;}) 
            <= this.ias.length*/){//si nb joueurs vivants <= nb dias
                
                this.ias[this.random(this.ias.length)].accusationForcee();
                return;
            }
    }

    getPersonnages(role: Role): Villageois[] {
        return this.joueursVivants.filter((joueur: Villageois)=>{return joueur.role == role});
    }

    getNbJoueurs(): number{
        return this.nbJoueurs;
    }

    getNbLoups(): number{
        return this.nbLoups;
    }

    setNbJoueurs(nbJoueurs: number, ajustements: boolean = true): void{
        if(nbJoueurs < this.getNbJoueursPourChoixPersonnages()){
            nbJoueurs = this.getNbJoueursPourChoixPersonnages();
        }
        this.nbJoueurs = nbJoueurs;
        if(ajustements){
            this.ajustementPartie(true, false, false);
        }
    }

    setNbLoups(nbLoups: number, ajustements: boolean = true): void{
        this.nbLoups = nbLoups;
        if(ajustements){
            this.ajustementPartie(false, true, false);
        }
    }

    setNbVillageois(nbVillageois: number): void{
        this.nbJoueurs = nbVillageois + this.getNbJoueursPourChoixPersonnages();
        this.ajustementPartie(false, false, true)
    }

    setPointage(idAppareil: number, idJoueur: number, pointage: number){
        this.appareils[idAppareil].pointsJoueurs[idJoueur] = pointage;
    }

    switchRole(role: Role): void {
        if(!this.choixPersonnages.includes(role)){
            this.choixPersonnages.push(role)
        } else {
            this.choixPersonnages.splice(this.choixPersonnages.indexOf(role), 1)
        }
        this.ajustementPartie(false, false, false);
    }

    private listeRoleEnParam(roles: Role[]): number{
        let param: number = 0;
        roles.forEach((role: Role)=>{
            param+=2**(role-3);
        })
        return param;
    }

    private ajustementPartie(joueursStatic: boolean, loupStatic: boolean, villageoisStatic: boolean): void{
        var fs = require('fs');
        let data = fs.readFileSync('matrix.json', 'utf8');
        const infos: number[][] = JSON.parse(data) as number[][];
        let paramPersonnages: number = this.listeRoleEnParam(this.choixPersonnages);

        if(joueursStatic){
            let nbJoueurs: number = this.nbJoueurs;
            let nbLoups: number = infos[paramPersonnages][nbJoueurs-3];
            while(nbJoueurs < nbLoups + this.getNbJoueursPourChoixPersonnages()){
                nbJoueurs = nbLoups + this.getNbJoueursPourChoixPersonnages();
                if(!infos[paramPersonnages][nbJoueurs-3]) break;
                nbLoups = infos[paramPersonnages][nbJoueurs-3];
            }
            this.nbLoups = nbLoups;
            this.nbJoueurs = nbJoueurs;
        } else if(loupStatic){
            let nbJoueurs = this.getNbJoueursPourChoixPersonnages()+this.nbLoups;
            let nbLoups: number = infos[paramPersonnages][nbJoueurs-3];
            while(nbLoups < this.nbLoups){
                nbJoueurs++;
                if(!infos[paramPersonnages][nbJoueurs-3]) break;
                nbLoups = infos[paramPersonnages][nbJoueurs-3];
            }
            this.nbJoueurs = nbJoueurs;
        } else if(villageoisStatic){
            let nbJoueurs: number = +this.nbJoueurs;
            let nbLoups: number = infos[paramPersonnages][nbJoueurs-3];
            while(nbJoueurs < nbLoups+this.nbJoueurs){
                nbJoueurs++;
                if(!infos[paramPersonnages][nbJoueurs-3]) break;
                nbLoups = infos[paramPersonnages][nbJoueurs-3];
            }
            this.nbJoueurs = nbJoueurs;
            this.nbLoups = nbLoups;
        } else {
            let nbJoueurs: number = this.nbJoueurs;
            let nbLoups: number = infos[paramPersonnages][nbJoueurs-3];
            while(nbLoups+this.getNbJoueursPourChoixPersonnages() > nbJoueurs){
                nbJoueurs++;
                if(!infos[paramPersonnages][nbJoueurs-3]) break;
                nbLoups = infos[paramPersonnages][nbJoueurs-3];
            }
            this.nbLoups = nbLoups;
            this.nbJoueurs = nbJoueurs;
        }
    }

    public getNbJoueursPourChoixPersonnages(): number{
        return this.choixPersonnages.length + (this.choixPersonnages.includes(Role.DEUX_SOEURS)?1:0) + (this.choixPersonnages.includes(Role.TROIS_FRERES)?2:0);
    }

    joueurVoisin(isGauche:boolean,joueurCourant:Villageois): number {
        let index: number = this.joueursVivants.indexOf(joueurCourant);
        index += (isGauche ? -1 : 1);
        if(index == this.joueursVivants.length){
            index = 0;
        } else if(index == -1){
            index = this.joueursVivants.length-1;
        }
        return index;
    }

    remplacerIAEnJoueur(idJoueurAppareil: number, idSocket: string){
        let joueurPresent: Villageois|undefined;
        let appareilDisconnect: Appareil|undefined;
        let index: number= 0;
        this.appareils.forEach((appareil: Appareil)=>{
            if(appareil.siMeneurDeJeu()){
                if(index == idJoueurAppareil){
                    appareilDisconnect = appareil;
                }
                index++;
            }
            appareil.joueurs.forEach((joueur: Villageois)=>{
                if(index == idJoueurAppareil){
                    appareilDisconnect = appareil;
                    joueurPresent = joueur;
                }
                index++;
            })
        })
        if(!appareilDisconnect){
            throw new Error("L'appareil tente de se connecter au joueur avec l'id "+ idJoueurAppareil+" mais il n'y a pas d'appareil lié");
        }
        if(!appareilDisconnect.disconnect){
            throw new Error("Aucun appareil disconnect qui contient le joueur: "+joueurPresent!.nom);
        }
        let appareilCree:Appareil = this.appareils.filter((appareil: Appareil)=>{return appareil.idSocket == idSocket})[0]
        appareilDisconnect.idSocket = appareilCree.idSocket;
        appareilDisconnect.disconnect = false;
        if(appareilDisconnect.evenementPresent){
            appareilDisconnect.evenementsEnAttente.unshift(appareilDisconnect.evenementPresent);
        }
        if(joueurPresent?.backupRaisonPasVoter){
            joueurPresent!.raisonsPasVoter.unshift(joueurPresent!.backupRaisonPasVoter);
        }
        this.appareils.splice(this.appareils.indexOf(appareilCree),1);
    }

    getRaisonsPasVoterArriverMilieuDePartie(): RaisonPasVoter[]{
        const raisons: RaisonPasVoter[] = [];
        this.appareils.forEach((appareil: Appareil)=>{
            if(appareil.siMeneurDeJeu()){
                raisons.push(appareil.disconnect? RaisonPasVoter.AUCUN: RaisonPasVoter.DEJA_CHOISI);
            }
            appareil.joueurs.forEach((joueur: Villageois)=>{
                raisons.push(appareil.disconnect? RaisonPasVoter.AUCUN: RaisonPasVoter.DEJA_CHOISI);
            })
        })
        return raisons;
    }

    changerPointeur(ancienJoueur: Villageois, nouveauJoueur: Villageois): void{
        this.joueursVivants[this.joueursVivants.indexOf(ancienJoueur)] = nouveauJoueur;
        this.ias.forEach((ia: IA, index: number)=>{
            ia.changerPointeur(ancienJoueur, nouveauJoueur);
            //changer lia au complet
            if(ia.villageois == nouveauJoueur){
                const nouvIA: IA = this.creerIA(nouveauJoueur.role, nouveauJoueur, true);
                if(+nouveauJoueur.role === Role.VILLAGEOIS_VILLAGEOIS){
                    this.ias[index] = ia.copierVillageoisVillageois(nouvIA);
                } else {
                    this.ias[index] = ia.copierServanteDevouee(nouvIA);
                }
            }
        })
        this.appareils.forEach((appareil: Appareil)=>{
            if(appareil.joueurs.includes(ancienJoueur)){
                appareil.joueurs[appareil.joueurs.indexOf(ancienJoueur)] = nouveauJoueur;
            }
        })
        this.joueursVivants.forEach((joueur: Villageois)=>{
            joueur.changerPointeur(ancienJoueur, nouveauJoueur);
        })
    }

    getJoueursReelsEncoreVivants(): Villageois[]{
        return this.joueursVivants.filter((joueur: Villageois)=>{
            return this.appareils.some((appareil: Appareil)=>{return appareil.joueurs.includes(joueur)});
        })
    }

    getUnMomentFort(): MomentFort{
        return this.momentFortPresent!;
    }

    getTimer(evenement: EvenementDeGroupe|EvenementIndividuel): number{

        switch(evenement){
            case EvenementDeGroupe.INFO_MORT_CAPITAINE: 
            case EvenementDeGroupe.RESULTATS_VOTES:
            case EvenementDeGroupe.MOMENTS_FORTS_INFO:
                return 3000;
            case EvenementDeGroupe.INFO_VILLAGEOIS_VILLAGEOIS:
            case EvenementDeGroupe.CORBEAU:
            case EvenementDeGroupe.OURS_GROGNE:
            case EvenementDeGroupe.INFO_CHASSEUR_MORT:
            case EvenementDeGroupe.INFO_CHEVALIER_A_LEPEE_ROUILLEE:
            case EvenementDeGroupe.INFO_SERVANTE_DEVOUEE:
            case EvenementDeGroupe.INFO_TRANCHER_CAPITAINE:
            case EvenementDeGroupe.INFO_CHOIX_CHASSEUR:
            case EvenementDeGroupe.INFO_SUCCESSEUR:
            case EvenementDeGroupe.MORT_AMOUREUX:
            case EvenementDeGroupe.GRAND_MECHANT_LOUP_PERDRE_POUVOIR:
            case EvenementDeGroupe.MONTRER_VIVANTS:
            case EvenementDeGroupe.MONTRER_POINTS_VICTOIRES:
            case EvenementDeGroupe.MOMENTS_FORTS:
            case EvenementDeGroupe.MOMENTS_FORTS_INFO:
            case EvenementDeGroupe.VICTOIRE:
            case EvenementDeGroupe.MORT_VOTES:
            case EvenementDeGroupe.MONTRER_MORTS:
            case EvenementDeGroupe.INFO_INSTITUTRICE:
                return 8000;
            case EvenementDeGroupe.PERSONNAGE_MORTS:
            case EvenementDeGroupe.INFO_VOTES:
                return 10000;
            default:
                return 0;
        }
    }

    random(valeur: number) : number{
        return this.rand(valeur);
    }
    
    siqqnPeutAccuser(): boolean{
        return this.appareils.some((appareil: Appareil)=>{return appareil.siQuelquunPeutAccuser(this)})
    }

    ajouterActionHistorique(params: number[]){
        this.historiquePartie.actions.push(params);
        let hist: string = JSON.stringify(this.historiquePartie);
        hist.replace(",",",\n")
        fs.writeFileSync(fs.Dir.name+"\\..\\app\\backups\\backupDynamique.json", JSON.stringify(this.historiquePartie));
    }

    getHistorique(): HistoriquePartie{
        return this.historiquePartie;
    }
}