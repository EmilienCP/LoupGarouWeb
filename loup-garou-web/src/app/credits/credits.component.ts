import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Socket } from 'socket.io-client';
import { AudioService } from '../services/audio.service';
import { CommunicationService } from '../services/communication.service';

@Component({
  selector: 'app-credits',
  templateUrl: './credits.component.html',
  styleUrls: ['./credits.component.css'],
  animations:[
    trigger("texte", [
      transition(":enter", [
        style({marginTop: '100%', visibility: 'visible'}),
        animate("70s", style({marginTop: '-600%', visibility: 'visible'}))
      ])
    ])
  ]
})
export class CreditsComponent implements OnInit {

  matriceTexte: string[][] = [];
  urlImage: string = "../../assets/soleilTentative8.jpg"
  isMenu: boolean = false;
  socket: Socket;
  isInfoAppareil: boolean = false;

  constructor(private audioService: AudioService, private router: Router, private route: ActivatedRoute, public communicationService: CommunicationService) {
    this.socket = communicationService.getSocket();
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params =>{
      this.isMenu = params["isMenu"]? true: false;
      if(!this.isMenu){
        if(this.communicationService.isMeneurDeJeu){
          this.socket.on("prochaineEtape", ()=>{
            this.socket.off("prochaineEtape")
            this.audioService.arreter();
            this.router.navigate(["creationComponent"])
          })
        }
      } else {
        this.audioService.jouerCredits()
      }
    }))
    this.matriceTexte.push(["Les Loups-Garous de Thiercelieux"])
    this.matriceTexte.push(["Adapté par:", "Émilien Caron-Perron"])
    this.matriceTexte.push(["Conception", "Émilien Caron-Perron"])
    this.matriceTexte.push(["Implémentation", "Émilien Caron-Perron", "Liliane-Caroline Demers"])
    this.matriceTexte.push(["Musique", "Émilien Caron-Perron"])
    this.matriceTexte.push(["Graphismes", "Mouna Belaid"])
    this.matriceTexte.push(["Animations", "Émilien Caron-Perron"])
    this.matriceTexte.push(["Outils", "Angular", "OpenAi", "Amazon web console"])
    this.matriceTexte.push(["Merci d'avoir joué!"])
  }

  passer(): void {
    this.audioService.arreter();
    if(!this.isMenu){
      this.socket.emit("termine");
    }
    this.communicationService.numeroJour = 0;
    this.router.navigate([this.isMenu?"":"creationComponent"])
  }

  switchInfoAppareil(){
    this.isInfoAppareil = !this.isInfoAppareil;
  }

}
