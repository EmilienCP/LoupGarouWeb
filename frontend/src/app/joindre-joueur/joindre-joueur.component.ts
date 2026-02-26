import { Component, OnInit } from '@angular/core';
import { CommunicationService } from '../services/communication.service';
import { Socket } from 'socket.io-client';
import { Router } from '@angular/router';
import { InfoAppareil } from '../../../../common/infoAppareil';
import { EtatPartie } from '../../../../common/joindrePartieInfo';

@Component({
  selector: 'app-joindre-joueur',
  templateUrl: './joindre-joueur.component.html',
  styleUrls: ['./joindre-joueur.component.css']
})
export class JoindreJoueurComponent implements OnInit {

  socket: Socket;

  constructor(public communicationService: CommunicationService, private router: Router) {
    this.socket = communicationService.getSocket();
  }

  ngOnInit(): void {
    this.communicationService.refreshInfoPartie();

  }

  public choisir(i: number): void{
    this.socket.on("retourPartieJointeCreation", ()=>{
      this.router.navigate(["creationComponent"])
    })
    this.socket.on("retourPartieJointeCommencee", ()=>{
      this.router.navigate(["jeuComponent"])
    })
    //doit trouver l'index de appareil correspondant à l'index i dans la liste de tous les appareils
    this.socket.emit("lierAppareil", this.communicationService.infoPartie.appareils.indexOf(this.appareilsNonConnectes[i]))
  }

  public nouveauJoueur(): void{
    this.socket.on("retourPartieJointeCreation", ()=>{
      this.router.navigate(["creationComponent"])
    })
    this.socket.on("retourPartieJointeCommencee", ()=>{
      this.router.navigate(["jeuComponent"])
    })
    this.socket.emit("nouveauJoueur")
  }

  get appareilsNonConnectes(): InfoAppareil[]{
    return this.communicationService.infoPartie.appareils.filter((appareil: InfoAppareil)=>{return appareil.disconnect});
  }

  get partieEnCours(): boolean{
    return this.communicationService.infoPartie.etat == EtatPartie.EN_COURS;
  }

}
