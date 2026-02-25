import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Socket } from 'socket.io-client';
import { CommunicationService } from '../services/communication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-creation-appareils',
  templateUrl: './creation-appareils.component.html',
  styleUrls: ['./creation-appareils.component.css']
})
export class CreationAppareilsComponent implements OnInit {

  
  socket: Socket;
  @Input() idAppareil: number = -1;
  @Input() idMeneurDeJeu: number = -1;
  @Output() majInfosJeu = new EventEmitter<boolean>();
  @Output() retourAppareil = new EventEmitter<boolean>();

  constructor(public communicationService: CommunicationService, private router: Router) {
    this.socket = communicationService.getSocket();
  }

  ngOnInit(): void {
    if(this.idAppareil == -1){
      this.communicationService.refreshInfoPartie().then(()=>{
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
    this.communicationService.infoPartie.appareils[this.idAppareil].noms.push(nomJoueur);
    this.socket.emit("ajouterJoueur", nomJoueur)
  }

  retirer(idJoueur: number): void{
    this.communicationService.infoPartie.appareils[this.idAppareil].noms.splice(idJoueur,1);
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
    if(nomJoueur.length>40){
      nomJoueur = nomJoueur.substring(0,40);
    }
    this.communicationService.infoPartie.appareils[this.idAppareil].noms[idJoueur] = nomJoueur;
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
    this.socket.emit("versLeHaut", index);
  }

  switchPret(index: number){
    this.socket.emit("switchAppareilPret", index);
    this.communicationService.refreshInfoPartie();
  }

  switchDisconnect(index: number){
    this.communicationService.switchAppareilDisconnect(index).subscribe((ok: boolean)=>{
      if(ok){
        this.communicationService.refreshInfoPartie();
      }
    })
  }

  retirerAppareil(index: number){
    this.communicationService.retirerAppareil(index).subscribe((ok: boolean)=>{
      if(ok){
        this.communicationService.refreshInfoPartie();
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

  get appareilsConnectes(): any[]{
    return this.communicationService.infoPartie.appareils.filter(appareil => !appareil.disconnect);
  }

}
