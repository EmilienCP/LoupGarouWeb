import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Socket } from 'socket.io-client';
import { JoindrePartieInfo} from '../../../../common/joindrePartieInfo';
import { CommunicationService } from '../services/communication.service';

@Component({
  selector: 'app-joindre',
  templateUrl: './joindre.component.html',
  styleUrls: ['./joindre.component.css']
})
export class JoindreComponent implements OnInit {

  couleurFond: string = "black"
  listeParties: JoindrePartieInfo[] = []
  socket: Socket;

  constructor(private router: Router, private communicationService: CommunicationService) {
    this.socket = this.communicationService.getSocket();
  }

  ngOnInit(): void {
    this.majInfos();
    this.socket.on("reloadPartie", ()=>{
      this.majInfos();
    })
  }

  eteindreSockets(): void{
    this.socket.off("reloadPartie")
  }

  majInfos(): void{
    this.communicationService.getJoindrePartieInfo().subscribe((infos: JoindrePartieInfo[])=>{
      this.listeParties = infos;
    });
  }

  retour(){
    this.eteindreSockets();
    this.router.navigate([""]);
  }

  joindre(idJeu: number, indexUI: number){
    this.socket.on("retourPartieJointeCreation", ()=>{
      this.eteindreSockets();
      this.router.navigate(["creationComponent"]);
    })
    this.socket.on("retourPartieJointeJoueur", ()=>{
      this.eteindreSockets();
      this.router.navigate(["joindreJoueurComponent"])
    })
    this.socket.emit("joindrePartie", idJeu)
  }

}
