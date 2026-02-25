import { Component, OnInit } from '@angular/core';
import { CommunicationService } from '../services/communication.service';
import { Socket } from 'socket.io-client';
import { Router } from '@angular/router';
import { InfoAppareil } from '../../../../common/infoAppareil';

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
    this.socket.emit("lierAppareil", i)
  }

  get appareilsConnectes(): InfoAppareil[]{
    return this.communicationService.infoPartie.appareils;
  }

}
