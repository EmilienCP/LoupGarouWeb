import { animate, animation, keyframes, query, sequence, stagger, state, style, transition, trigger, useAnimation, AnimationEvent } from '@angular/animations';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Socket } from 'socket.io-client';
import { AudioService } from '../services/audio.service';
import { CommunicationService } from '../services/communication.service';
import { InfoEvenement } from '../../../../common/infoEvenement';


@Component({
  selector: 'app-jour-se-leve',
  templateUrl: './jour-se-leve.component.html',
  styleUrls: ['./jour-se-leve.component.css'],
  animations:[
    trigger("divAnimation", [
      transition(":leave",[
            query("div", [
              style({ opacity: 1}),
              stagger(-800, [
                animate(
                  "2000ms",
                  style({ opacity: 0})
                )
              ])
            ])
          ])
      ])
  ]
})
export class JourSeLeveComponent implements OnInit {

  urlImage: string;
  texte: string;
  texteSecondaire: string;
  listeValeurs: number[];
  apparence: boolean;
  present: boolean = true;
  socket: Socket;
  infoEvenement?: InfoEvenement;
  timer: any;
  isInfoAppareil: boolean = false;
  
  constructor(public communicationService: CommunicationService, private audioService: AudioService, private router: Router, private route: ActivatedRoute, private cdRef: ChangeDetectorRef) { 
    this.apparence = this.communicationService.jour;
    this.urlImage = this.communicationService.jour? "../../assets/soleilTentative8.jpg":"../../assets/soleilTentative0.jpg"
    this.texte = this.communicationService.jour? "Le jour se lève": "Le soleil se couche";
    this.texteSecondaire = this.communicationService.jour?"":"Cachez votre appareil des autres joueurs";
    this.listeValeurs = this.communicationService.jour?[0,1,2,3,4,5,6,7,8]:[8,7,6,5,4,3,2,1,0];
    this.socket = this.communicationService.getSocket();
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params =>{
      this.infoEvenement = JSON.parse(params["infoEvenement"]);
      this.cdRef.detectChanges();
      if(this.infoEvenement!.passer){
        this.socket.on("prochaineEtape", ()=>{
          this.socket.off("prochaineEtape")
          this.router.navigate(["jeuComponent"])
        })
      } else {
        if(!this.communicationService.jour && !this.communicationService.isMeneurDeJeu){
          this.timer = setTimeout(()=>{
            this.router.navigate(["jeuComponent"])
          }, 8000)
        }
      }
    });
    if(this.communicationService.isMeneurDeJeu){
      this.socket.on("prochaineEtape", ()=>{
        this.socket.off("prochaineEtape")
        this.router.navigate(["jeuComponent"])
      })
    }
    this.communicationService.jour? this.audioService.jouerJour(): this.audioService.jouerNuit();
    if(this.communicationService.jour){
      this.communicationService.numeroJour++;
    }
    setTimeout(()=>{
      this.apparence = !this.apparence;
      this.present = false;
    })
  }

  getStyle(index: number){
    return "background-size: cover;background-repeat: unset;background-image: url('../../assets/soleilTentative"+this.listeValeurs[index]+".jpg'); width: 100%; height: 100%; position: absolute";
  }

  ok(){
    if(this.timer){
      clearTimeout(this.timer);
    }
    this.router.navigate(["jeuComponent"])
  }

  switchInfoAppareil(){
    this.isInfoAppareil = !this.isInfoAppareil;
  }

  passer(){
    this.socket.emit("passer");
    this.router.navigate(["jeuComponent"]);
  }
  

}

