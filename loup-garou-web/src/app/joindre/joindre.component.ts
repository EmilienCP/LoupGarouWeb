import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Socket } from 'socket.io-client';
import { EvenementIndividuel } from '../../../../common/evenements';
import {EtatPartie, JoindrePartieInfo} from "../../../../common/joindrePartieInfo"
import { Joueur } from '../../../../common/Joueur';
import { CommunicationService } from '../services/communication.service';
import { InfoPartie } from '../../../../common/infoPartie';

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
    if(this.listeParties[indexUI].etat == EtatPartie.EN_COURS){
      this.socket.on("infoPartieJointe", ()=>{
        this.eteindreSockets();
        //doit savoir qui est le meneur de jeu
        this.communicationService.getInfoPartie().subscribe((info: InfoPartie)=>{
          this.communicationService.isMeneurDeJeu = false;
          this.communicationService.isUnMeneurDeJeu = info.idMeneurDeJeu !== -1;
        })
        this.router.navigate(["jeuComponent/selecteurComponent"], {queryParams: {"evenement": EvenementIndividuel.ARRIVER_EN_MILIEU_DE_PARTIE}});
      })
      this.socket.emit("joindrePartie", idJeu)
    } else {
      this.socket.on("infoPartieJointe", ()=>{
        this.eteindreSockets();
        this.router.navigate(["creationComponent"])
      })
      this.socket.emit("joindrePartie", idJeu)
    }
  }

}
