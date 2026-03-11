import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Socket } from 'socket.io-client';
import { CommunicationService } from '../services/communication.service';
import { Router } from '@angular/router';
import { InfoAppareil } from '../../../../common/infoAppareil';

@Component({
  selector: 'app-creation-appareils',
  templateUrl: './creation-appareils.component.html',
  styleUrls: ['./creation-appareils.component.css']
})
export class CreationAppareilsComponent implements OnInit {

  
  socket: Socket;
  @Input() idAppareilReel: number = -1;
  @Input() idMeneurDeJeuReel: number = -1;
  @Output() majInfosJeu = new EventEmitter<boolean>();
  @Output() retourAppareil = new EventEmitter<boolean>();

  constructor(public communicationService: CommunicationService, private router: Router) {
    this.socket = communicationService.getSocket();
  }

  ngOnInit(): void {
    if(this.idAppareilReel == -1){
      this.communicationService.refreshInfoPartie(true, false).then(()=>{
        this.communicationService.voirHistorique().subscribe((historique: string)=>{
          this.communicationService.historiquePartie = historique;
        })
      })
    }
  }

  ajouter(): void{
    let nomJoueur: string = "Joueur " + this.communicationService.infoPartie.appareils.reduce(
  (total, appareil) => total + appareil.noms.length,
  0
);
    this.communicationService.infoPartie.appareils[this.idAppareilReel].noms.push(nomJoueur);
    this.socket.emit("ajouterJoueur", nomJoueur)
  }

  retirer(idJoueur: number): void{
    this.communicationService.infoPartie.appareils[this.idAppareilReel].noms.splice(idJoueur,1);
    this.socket.emit("retirerJoueur", idJoueur)
  }

  focus(){
    this.socket.off("reloadPartie");
  }

  renommer(event: any, idJoueur: number){
    this.socket.on("reloadPartie" , ()=>{
      this.majInfosJeu.emit();
    })
    let nomJoueur: string = event.target.value;
    console.log(this.communicationService.infoPartie.noms.flat(), nomJoueur);
    if(this.communicationService.infoPartie.noms.flat().includes(nomJoueur)){
      nomJoueur = nomJoueur + " (1)";
    }
    if(nomJoueur.length>40 || this.communicationService.infoPartie.noms.flat().includes(nomJoueur)){
      nomJoueur = nomJoueur.substring(0,40);
    }
    this.communicationService.infoPartie.appareils[this.idAppareilReel].noms[idJoueur] = nomJoueur;
    this.socket.emit("renommerJoueur", idJoueur, nomJoueur)
  }

  changerTexte(event: any){
    if(event.target.value.length > 30){
      event.target.value = event.target.value.slice(0, event.target.value.length-1)
    }
  }

  switch(){
    this.socket.emit("switchMeneurDeJeu");
  }

  versLeHaut(index: number){
    this.socket.emit("versLeHaut", this.communicationService.infoPartie.appareils.indexOf(this.appareilsConnectes[index]));
  }

  switchPret(index: number){
    this.socket.emit("switchAppareilPret", this.communicationService.infoPartie.appareils.indexOf(this.appareilsConnectes[index]));
    this.communicationService.refreshInfoPartie(true, false);
  }

  switchDisconnect(index: number){
    this.communicationService.switchAppareilDisconnect(this.communicationService.infoPartie.appareils.indexOf(this.appareilsConnectes[index])).subscribe((ok: boolean)=>{
      if(ok){
        this.communicationService.refreshInfoPartie(true, false);
      }
    })
  }

  retirerAppareil(index: number){
    this.communicationService.retirerAppareil(this.communicationService.infoPartie.appareils.indexOf(this.appareilsConnectes[index])).subscribe((ok: boolean)=>{
      if(ok){
        this.communicationService.refreshInfoPartie(true, false);
      }
    })
  }

  retour(){
    this.retourAppareil.emit();
  }

  triggerProchaineEtape(){
    this.socket.emit("prochaineEtape");
    this.router.navigate(["attenteComponent"]);
  }

  get appareilsConnectes(): InfoAppareil[]{
    return this.communicationService.infoPartie.appareils.filter(appareil => !appareil.disconnect);
  }

  get idAppareil(): number{
    if(this.idAppareilReel == -1){
      return -1;
    }
    return this.appareilsConnectes.indexOf(this.communicationService.infoPartie.appareils[this.idAppareilReel]);
  }

  get idMeneurDeJeu(): number{
    if(this.idMeneurDeJeuReel == -1){
      return -1;
    }
    return this.appareilsConnectes.indexOf(this.communicationService.infoPartie.appareils[this.idMeneurDeJeuReel]);
  }

}
