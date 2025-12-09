import * as http from 'http'
import { injectable } from 'inversify';
import { Server, Socket } from 'socket.io';
import { EvenementDeGroupe } from '../../../common/evenements';
import { Role } from '../../../common/Joueur';
import { Action } from '../gestionnaire/gestionBugs/historiquePartie';
import { PartiesService } from '../services/parties.service';
import { Appareil } from '../gestionnaire/appareil';

@injectable()
export class SocketController{

    public static socketController: SocketController;
    public partiesService: PartiesService;
    public constructor(){
        SocketController.socketController = this;
    }

    public static getInstance(): SocketController{
        if(this.socketController == undefined){
            this.socketController = new SocketController();
        }
        return this.socketController;
    }

    public setup(server: http.Server){
        const sio: Server = require('socket.io')(server, {
            cors: {
              origin: '*',
            }
          });
          
        sio.on("connection", (socket: Socket) => {
            console.log("connect de "+socket.id);
            socket.on("creerPartie", ()=>{
                try {
                    //ajouter une partie dans la liste des parties, et retourner le numero de partie
                    const ok: boolean = this.partiesService.creerPartie(socket.id);
                    if(!ok){
                        socket.emit("Plus de parties disponibles")
                    } else {
                        socket.join(this.partiesService.getNomRoom(socket.id));
                        sio.emit("reloadPartie")
                    }
                  }
                  catch (err) {
                      console.log(err)
                  }
            })

            socket.on('disconnect', ()=>{
                try{
                    console.log("disconnect de "+socket.id);
                    this.partiesService.quitterPartie(socket.id);
                    sio.emit("reloadPartie");
                }
                catch (err) {
                    console.log(err);
                }
            });

            socket.on('reconnecter', (ancienId)=>{
                try{
                    console.log("reconnect de "+socket.id);
                    if(this.partiesService.reconnecter(ancienId, socket.id)){
                        socket.join(this.partiesService.getNomRoom(socket.id));
                    }
                }
                catch (err) {
                    console.log(err);
                }
            });

            socket.on("quitterPartie", ()=>{
                try{
                    //ajouter une partie dans la liste des parties, et retourner le numero de partie
                    socket.leave(this.partiesService.getNomRoom(socket.id))
                    this.partiesService.quitterPartie(socket.id)
                    sio.emit("reloadPartie")
                }
                catch (err) {
                   console.log(err)
                }
            })

            socket.on("joindrePartie", (idJeu: number)=>{
                try{
                    //ajouter un appareil dans la partie, et retourner le numero d'appareil
                    this.partiesService.joindrePartie(idJeu, socket.id);
                    socket.join(this.partiesService.getNomRoom(socket.id));
                    socket.emit("infoPartieJointe")
                    sio.emit("reloadPartie")
                }
                catch (err) {
                   console.log(err)
                }
            })

            socket.on("joindrePartieCommencee", (idJeu: number)=>{
                try{
                    //ajouter un appareil dans la partie, et retourner le numero d'appareil
                    this.partiesService.joindrePartie(idJeu, socket.id);
                    socket.join(this.partiesService.getNomRoom(socket.id));
                    socket.emit("infoPartieJointe")
                    sio.emit("reloadPartie")
                }
                catch (err) {
                   console.log(err)
                }
            })

            socket.on("switchMeneurDeJeu", ()=>{
                try{
                    this.partiesService.getAppareil(socket.id).switchMeneurDeJeu();
                    sio.to(this.partiesService.getNomRoom(socket.id)).emit("reloadPartie");
                }
                catch (err) {
                   console.log(err)
                }
            })

            socket.on("switchVideo", ()=>{
                try{
                    this.partiesService.getPartie(socket.id).switchVideo();
                    sio.to(this.partiesService.getNomRoom(socket.id)).emit("reloadPartie");
                }
                catch (err) {
                   console.log(err)
                }
            })

            socket.on("switchPatateChaude", ()=>{
                try{
                    this.partiesService.getPartie(socket.id).switchPatateChaude();
                    sio.to(this.partiesService.getNomRoom(socket.id)).emit("reloadPartie");
                }
                catch (err) {
                   console.log(err)
                }
            })

            socket.on("switchExtensionVillage", ()=>{
                try{
                    this.partiesService.getPartie(socket.id).switchExtensionVillage();
                    sio.to(this.partiesService.getNomRoom(socket.id)).emit("reloadPartie");
                }
                catch (err) {
                   console.log(err)
                }
            })

            socket.on("switchBackup", ()=>{
                try{
                    this.partiesService.getPartie(socket.id).switchBackup();
                    sio.to(this.partiesService.getNomRoom(socket.id)).emit("reloadPartie");
                }
                catch (err) {
                   console.log(err)
                }
            })

            socket.on("switchPerso", (role: Role)=>{
                try{
                    this.partiesService.getPartie(socket.id).switchRole(role)
                    sio.to(this.partiesService.getNomRoom(socket.id)).emit("reloadPartie");
                }
                catch (err) {
                   console.log(err)
                }
            })

            socket.on("switchVillageoisVillageois", ()=>{
                try{
                    this.partiesService.getPartie(socket.id).switchVillageoisVillageois();
                    sio.to(this.partiesService.getNomRoom(socket.id)).emit("reloadPartie");
                }
                catch (err) {
                   console.log(err)
                }
            })

            socket.on("ajouterJoueur", (nomJoueur: string)=>{
                try{
                    if(this.partiesService.getPartie(socket.id).appareils.map((value)=>{return value.nomsJoueurs.length}).reduce((a,b)=>{return a+ b}) >= this.partiesService.getPartie(socket.id).getNbJoueurs()){
                        console.log("ne peut pas ajouter d'autre joueur");
                    } else {
                        this.partiesService.getAppareil(socket.id).ajouterJoueur(nomJoueur);
                    }
                    sio.emit("reloadPartie")
                }
                catch (err) {
                   console.log(err)
                }
            })

            socket.on("retirerJoueur", (idJoueur: number)=>{
                try{
                    this.partiesService.getAppareil(socket.id).nomsJoueurs.splice(idJoueur, 1);
                    this.partiesService.getAppareil(socket.id).pointsJoueurs.splice(idJoueur, 1);
                    sio.emit("reloadPartie")
                }
                catch (err) {
                   console.log(err)
                }
            })

            socket.on("renommerJoueur", (idJoueur: number, nomJoueur: string)=>{
                try{
                    this.partiesService.getAppareil(socket.id).nomsJoueurs[idJoueur] = nomJoueur
                    sio.emit("reloadPartie")
                }
                catch (err) {
                   console.log(err)
                }
            });

            socket.on("changerNbJoueurs", (nbJoueurs: number) => {
                try{
                    this.partiesService.getPartie(socket.id).setNbJoueurs(nbJoueurs);
                    sio.emit("reloadPartie")
                }
                catch (err) {
                   console.log(err)
                }
            })

            socket.on("changerNbDeLoups", (nbLoups: number) => {
                try{
                    this.partiesService.getPartie(socket.id).setNbLoups(nbLoups);
                    sio.emit("reloadPartie")
                }
                catch (err) {
                   console.log(err)
                }
            })

            socket.on("changerNbDeVillageois", (nbVillageois: number) => {
                try{
                    this.partiesService.getPartie(socket.id).setNbVillageois(nbVillageois);
                    sio.emit("reloadPartie")
                }
                catch (err) {
                   console.log(err)
                }
            })

            socket.on("changerPointage", (idAppareil: number, idJoueur: number, pointage: number) => {
                try{
                    this.partiesService.getPartie(socket.id).setPointage(idAppareil, idJoueur, pointage);
                    sio.emit("reloadPartie")
                }
                catch (err) {
                   console.log(err)
                }
            })

            socket.on("versLeHaut", (index: number) => {
                try{
                    this.partiesService.versLeHaut(index, socket.id);
                    sio.emit("reloadPartie")
                }
                catch (err) {
                   console.log(err)
                }
            })

            socket.on("commencerPartie", () => {
                try{
                    sio.to(this.partiesService.getNomRoom(socket.id)).emit("decompte")
                    this.partiesService.getPartie(socket.id).commencerPartie().then(()=>{
                        sio.to(this.partiesService.getNomRoom(socket.id)).emit("partieCommencee")
                        sio.emit("reloadPartie")
                    });
                }
                catch (err) {
                   console.log(err)
                }
            })

            socket.on("termine", () => {
                try{
                    //Indiquer que l'appareil est en attente de prochaine etape
                    if(this.partiesService.appareilTermine(socket.id)){
                        this.partiesService.getPartie(socket.id).ajouterActionHistorique([Action.PROCHAINE_ETAPE])
                        this.partiesService.getPartie(socket.id).prochaineEtape().then(()=>{
                            sio.to(this.partiesService.getNomRoom(socket.id)).emit("prochaineEtape")
                        }, (err)=>{
                            console.log(err + " ---------- reproduction erreur "+this.partiesService.getPartie(socket.id).getHistorique().actions.length+"------------- " + JSON.stringify(this.partiesService.getPartie(socket.id).getHistorique()));
                        });
                    } else {
                        sio.to(this.partiesService.getNomRoom(socket.id)).emit("appareilTermine")
                    }
                }
                catch (err) {
                   console.log(err + " ---------- reproduction erreur "+this.partiesService.getPartie(socket.id).getHistorique().actions.length+"------------- " + JSON.stringify(this.partiesService.getPartie(socket.id).getHistorique()));
                }
            })

            socket.on("switchAppareilPret", (index) => {
                try{
                    //Indiquer que l'appareil est en attente de prochaine etape
                    if(this.partiesService.appareilTermine(this.partiesService.getPartie(socket.id).appareils[index].idSocket)){
                        this.partiesService.getPartie(socket.id).ajouterActionHistorique([Action.PROCHAINE_ETAPE])
                        this.partiesService.getPartie(socket.id).prochaineEtape().then(()=>{
                            sio.to(this.partiesService.getNomRoom(socket.id)).emit("prochaineEtape")
                        }, (err)=>{
                            console.log(err + " ---------- reproduction erreur "+this.partiesService.getPartie(socket.id).getHistorique().actions.length+"------------- " + JSON.stringify(this.partiesService.getPartie(socket.id).getHistorique()));
                        });
                    } else {
                        sio.to(this.partiesService.getNomRoom(socket.id)).emit("appareilTermine")
                    }
                }
                catch (err) {
                   console.log(err + " ---------- reproduction erreur "+this.partiesService.getPartie(socket.id).getHistorique().actions.length+"------------- " + JSON.stringify(this.partiesService.getPartie(socket.id).getHistorique()));
                }
            })

            socket.on("prochaineEtape", () => {
                try{
                    //Indiquer que l'appareil est en attente de prochaine etape
                    this.partiesService.getPartie(socket.id).ajouterActionHistorique([Action.PROCHAINE_ETAPE])
                    this.partiesService.getPartie(socket.id).prochaineEtape().then(()=>{
                        sio.to(this.partiesService.getNomRoom(socket.id)).emit("prochaineEtape")
                    }, (err)=>{
                        console.log(err, " ---------- reproduction erreur "+this.partiesService.getPartie(socket.id).getHistorique().actions.length+"------------- " + JSON.stringify(this.partiesService.getPartie(socket.id).getHistorique()));
                    });
                }
                catch (err) {
                   console.log(err + " ---------- reproduction erreur "+this.partiesService.getPartie(socket.id).getHistorique().actions.length+"------------- " + JSON.stringify(this.partiesService.getPartie(socket.id).getHistorique()));
                }
            })

            socket.on("passer", () => {
                try {
                    const appareil: Appareil = this.partiesService.getAppareil(socket.id);
                    appareil.passer = true;
                    this.partiesService.getPartie(socket.id).ajouterActionHistorique([Action.PASSER, this.partiesService.getPartie(socket.id).appareils.indexOf(appareil)]);
                    if(this.partiesService.appareilTermine(socket.id)){
                        this.partiesService.getPartie(socket.id).ajouterActionHistorique([Action.PROCHAINE_ETAPE])
                        this.partiesService.getPartie(socket.id).prochaineEtape().then(()=>{
                            sio.to(this.partiesService.getNomRoom(socket.id)).emit("prochaineEtape")
                        }, (err)=>{
                            console.log(err + " ---------- reproduction erreur "+this.partiesService.getPartie(socket.id).getHistorique().actions.length+"------------- " + JSON.stringify(this.partiesService.getPartie(socket.id).getHistorique()));
                        });
                    } else {
                        sio.to(this.partiesService.getNomRoom(socket.id)).emit("appareilTermine")
                    }
                }
                catch (err) {
                    console.log(err + " ---------- reproduction erreur "+this.partiesService.getPartie(socket.id).getHistorique().actions.length+"------------- " + JSON.stringify(this.partiesService.getPartie(socket.id).getHistorique()));
                }
            })

            socket.on("accusation", (index: number)=>{
                try{
                    let appareil: Appareil = this.partiesService.getAppareil(socket.id);
                    let accuseur;
                    if(appareil.siMeneurDeJeu()){
                        accuseur = this.partiesService.getPartie(socket.id).joueursVivants[appareil.indexJoueurPresent];
                    } else {
                        accuseur = appareil.getJoueurPresent();
                    }
                    accuseur.choisirJoueur(this.partiesService.getPartie(socket.id).joueursVivants[index], EvenementDeGroupe.ACCUSER, false);
                    this.partiesService.getPartie(socket.id).ajouterActionHistorique([Action.VOTER_VILLAGEOIS, EvenementDeGroupe.ACCUSER, this.partiesService.getPartie(socket.id).joueursVivants.indexOf(accuseur),index]);
                    if(!this.partiesService.getPartie(socket.id).siqqnPeutAccuser()){
                        sio.to(this.partiesService.getNomRoom(socket.id)).emit("derniereAccusation")
                    }
                    sio.to(this.partiesService.getNomRoom(socket.id)).emit("nouvelleAccusation")
                }
                catch (err) {
                   console.log(err)
                }
            })

            socket.on("changementLoups", () => {
                try{
                    sio.to(this.partiesService.getNomRoom(socket.id)).emit("miseAJourLoups")
                }
                catch (err) {
                   console.log(err)
                }
            })

            socket.on("pointer", (index: number) => {
                try{
                    this.partiesService.getPartie(socket.id).voteCourant.pointer(this.partiesService.getAppareil(socket.id).getJoueurPresent(), this.partiesService.getPartie(socket.id).joueursVivants[index]);
                    sio.to(this.partiesService.getNomRoom(socket.id)).emit("miseAJourLoups")
                }
                catch (err) {
                   console.log(err)
                }
            })
            
        });
    }
}