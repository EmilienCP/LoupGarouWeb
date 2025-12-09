import { animate, group, query, sequence, stagger, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Socket } from 'socket.io-client';
import { InfoEvenement } from '../../../../common/infoEvenement';
import { InfoVideo } from '../../../../common/infoVideo';
import { AudioService } from '../services/audio.service';
import { CommunicationService } from '../services/communication.service';

let tempsMarche: number = 11;
let tempsStable: number = 1;
let tempsZoom: number = 5;
let tempsRecul: number = 8;
let tempsLever: number = 12;

@Component({
  selector: 'app-video-matin',
  templateUrl: './video-matin.component.html',
  styleUrls: ['./video-matin.component.css'],
  animations:[
    trigger("buissons", [
      transition(":enter",[
        style({left: "-80%", visibility: "visible"}),
        group([
          sequence([
            animate(tempsMarche+"s", style({left: "-40%"})),
            animate(tempsStable+"s", style({left: "-40%"})),
            style({width: '80%', left: '-20%'}),
            animate(tempsZoom+"s ease-in", style({width: '220%', left: '-130%'})),
          ]),
          sequence([
            animate(tempsMarche + tempsStable +".5s", style({top: "20%"})),
            animate("0.1s", style({top: "18%"})),
            animate("0.1s", style({top: "20%"})),
            animate("0.1s", style({top: "18%"})),
            animate("0.1s", style({top: "20%"})),
            animate("0.1s", style({top: "18%"})),
            animate("0.1s", style({top: "20%"})),
            animate("0.1s", style({top: "18%"})),
            animate("0.1s", style({top: "20%"})),
            animate("0.1s", style({top: "18%"})),
            animate("0.1s", style({top: "20%"})),
            animate("0.1s", style({top: "18%"})),
            animate("0.1s", style({top: "20%"}))
          ])
        ])
      ])
    ]),
    trigger("buissons2", [
      transition(":enter",[
        style({left: "-40%", visibility: "visible"}),
        group([
          sequence([
            animate(tempsMarche+"s", style({left: "0%"})),
            animate(tempsStable+"s", style({left: "0%"})),
            style({width: '80%', left: '40%'}),
            animate(tempsZoom+"s ease-in", style({width: '220%', left: '50%'})),
          ]),
          sequence([
            animate(tempsMarche+"s", style({top: "20%"})),
            animate("0.1s", style({top: "18%"})),
            animate("0.1s", style({top: "20%"})),
            animate("0.1s", style({top: "18%"})),
            animate("0.1s", style({top: "20%"})),
            animate("0.1s", style({top: "18%"})),
            animate("0.1s", style({top: "20%"})),
            animate(tempsStable+"s", style({top: "20%"})),
            animate("0.1s", style({top: "18%"})),
            animate("0.1s", style({top: "20%"})),
            animate("0.1s", style({top: "18%"})),
            animate("0.1s", style({top: "20%"})),
            animate("0.1s", style({top: "18%"})),
            animate("0.1s", style({top: "20%"})),
            animate("0.1s", style({top: "18%"})),
            animate("0.1s", style({top: "20%"})),
            animate("0.1s", style({top: "18%"})),
            animate("0.1s", style({top: "20%"})),
            animate("0.1s", style({top: "18%"})),
            animate("0.1s", style({top: "20%"}))
          ])
        ])
      ])
    ]),
    trigger("buissons3", [
      transition(":enter",[
        style({left: "0%", visibility: "visible"}),
        group([
          sequence([
            animate(tempsMarche+"s", style({left: "40%"})),
            animate(tempsStable+"s", style({left: "40%"}))
          ]),
          sequence([
            animate(tempsMarche-1.2+"s", style({top: "20%"})),
            animate("0.1s", style({top: "18%"})),
            animate("0.1s", style({top: "20%"})),
            animate("0.1s", style({top: "18%"})),
            animate("0.1s", style({top: "20%"})),
            animate("0.1s", style({top: "18%"})),
            animate("0.1s", style({top: "20%"}))
          ])
        ])
      ])
    ]),
    trigger("buissons4", [
      transition(":enter",[
        style({left: "40%", visibility: "visible"}),
        group([
          sequence([
            animate(tempsMarche+"s", style({left: "80%"})),
            animate(tempsStable+"s", style({left: "80%"}))
          ]),
          sequence([
            animate(tempsMarche-2+"s", style({top: "20%"})),
            animate("0.1s", style({top: "18%"})),
            animate("0.1s", style({top: "20%"})),
            animate("0.1s", style({top: "18%"})),
            animate("0.1s", style({top: "20%"})),
            animate("0.1s", style({top: "18%"})),
            animate("0.1s", style({top: "20%"}))
          ])
        ])
      ])
    ]),
    trigger("buissons5", [
      transition(":enter",[
        style({left: "80%", visibility: "visible"}),
        group([
          sequence([
            animate(tempsMarche+"s", style({left: "120%"})),
            animate(tempsStable+"s", style({left: "120%"}))
          ])
        ])
      ])
    ]),
    trigger("NomVivant", [
      transition(":enter",[
        style({visibility: 'visible'}),
        animate(tempsMarche+"s"),
        animate("0.1s", style({top: '-25%'})),
        animate("0.1s", style({top: '-20%'})),
        animate(tempsStable-0.2+"s", style({top: '-20%'})),
      ])
    ]),
    trigger("Tete", [
      transition(":enter",[
        style({visibility: 'visible'}),
        animate(tempsMarche+"s"),
        animate("0.1s", style({top: '-5%'})),
        animate("0.1s", style({top: '0%'})),
        animate(tempsStable-0.2+"s", style({top: '0%'})),
      ])
    ]),
    trigger("Corps", [
      transition(":enter",[
        style({visibility: 'visible'}),
        animate(tempsMarche+"s"),
        animate("0.1s", style({top: '15%'})),
        animate("0.1s", style({top: '20%'})),
        animate(tempsStable-0.2+"s", style({top: '20%'})),
      ])
    ]),
    trigger("piedDroit", [
      transition(":enter",[
        style({visibility: 'visible'}),
        animate(tempsMarche/10+"s", style({transform: 'rotate(-30deg)', left: '60%'})),
        animate(tempsMarche/10+"s", style({transform: 'rotate(30deg)', left: '32%'})),
        animate(tempsMarche/10+"s", style({transform: 'rotate(-30deg)', left: '60%'})),
        animate(tempsMarche/10+"s", style({transform: 'rotate(30deg)', left: '32%'})),
        animate(tempsMarche/10+"s", style({transform: 'rotate(-30deg)', left: '60%'})),
        animate(tempsMarche/10+"s", style({transform: 'rotate(30deg)', left: '32%'})),
        animate(tempsMarche/10+"s", style({transform: 'rotate(-30deg)', left: '60%'})),
        animate(tempsMarche/10+"s", style({transform: 'rotate(30deg)', left: '32%'})),
        animate(tempsMarche/10+"s", style({transform: 'rotate(-30deg)', left: '60%'})),
        animate(tempsMarche/10+"s", style({transform: 'rotate(30deg)', left: '32%'})),
        animate("0.1s", style({top: '55%', transform: 'rotate(34deg)'})),
        animate("0.1s", style({top: '60%', transform: 'rotate(30deg)'})),
        animate(tempsStable-0.2+"s"),
      ])
    ]),
    trigger("piedGauche", [
      transition(":enter",[
        style({visibility: 'visible'}),
        animate(tempsMarche/10+"s", style({transform: 'rotate(30deg)', left: '32%'})),
        animate(tempsMarche/10+"s", style({transform: 'rotate(-30deg)', left: '60%'})),
        animate(tempsMarche/10+"s", style({transform: 'rotate(30deg)', left: '32%'})),
        animate(tempsMarche/10+"s", style({transform: 'rotate(-30deg)', left: '60%'})),
        animate(tempsMarche/10+"s", style({transform: 'rotate(30deg)', left: '32%'})),
        animate(tempsMarche/10+"s", style({transform: 'rotate(-30deg)', left: '60%'})),
        animate(tempsMarche/10+"s", style({transform: 'rotate(30deg)', left: '32%'})),
        animate(tempsMarche/10+"s", style({transform: 'rotate(-30deg)', left: '60%'})),
        animate(tempsMarche/10+"s", style({transform: 'rotate(30deg)', left: '32%'})),
        animate(tempsMarche/10+"s", style({transform: 'rotate(-30deg)', left: '60%'})),
        animate("0.1s", style({top: '55%', transform: 'rotate(-34deg)'})),
        animate("0.1s", style({top: '60%', transform: 'rotate(-30deg)'})),
        animate(tempsStable-0.2+"s"),
      ])
    ]),
    trigger("mainDroite", [
      transition(":enter",[
        style({visibility: 'visible'}),
        animate(tempsMarche/10+"s", style({transform: 'rotate(-30deg)', left: '60%'})),
        animate(tempsMarche/10+"s", style({transform: 'rotate(30deg)', left: '32%'})),
        animate(tempsMarche/10+"s", style({transform: 'rotate(-30deg)', left: '60%'})),
        animate(tempsMarche/10+"s", style({transform: 'rotate(30deg)', left: '32%'})),
        animate(tempsMarche/10+"s", style({transform: 'rotate(-30deg)', left: '60%'})),
        animate(tempsMarche/10+"s", style({transform: 'rotate(30deg)', left: '32%'})),
        animate(tempsMarche/10+"s", style({transform: 'rotate(-30deg)', left: '60%'})),
        animate(tempsMarche/10+"s", style({transform: 'rotate(30deg)', left: '32%'})),
        animate(tempsMarche/10+"s", style({transform: 'rotate(-30deg)', left: '60%'})),
        animate(tempsMarche/10+"s", style({transform: 'rotate(30deg)', left: '32%'})),
        animate("0.1s", style({top: '18%', transform: 'rotate(34deg)'})),
        animate("0.1s", style({top: '23%', transform: 'rotate(30deg)'})),
        animate(tempsStable-0.2+"s"),
      ])
    ]),
    trigger("mainGauche", [
      transition(":enter",[
        style({visibility: 'visible'}),
        animate(tempsMarche/10+"s", style({transform: 'rotate(30deg)', left: '32%'})),
        animate(tempsMarche/10+"s", style({transform: 'rotate(-30deg)', left: '60%'})),
        animate(tempsMarche/10+"s", style({transform: 'rotate(30deg)', left: '32%'})),
        animate(tempsMarche/10+"s", style({transform: 'rotate(-30deg)', left: '60%'})),
        animate(tempsMarche/10+"s", style({transform: 'rotate(30deg)', left: '32%'})),
        animate(tempsMarche/10+"s", style({transform: 'rotate(-30deg)', left: '60%'})),
        animate(tempsMarche/10+"s", style({transform: 'rotate(30deg)', left: '32%'})),
        animate(tempsMarche/10+"s", style({transform: 'rotate(-30deg)', left: '60%'})),
        animate(tempsMarche/10+"s", style({transform: 'rotate(30deg)', left: '32%'})),
        animate(tempsMarche/10+"s", style({transform: 'rotate(-30deg)', left: '60%'})),
        animate("0.1s", style({top: '18%', transform: 'rotate(-34deg)'})),
        animate("0.1s", style({top: '23%', transform: 'rotate(-30deg)'})),
        animate(tempsStable-0.2+"s"),
      ])
    ]),
    trigger("Exclamation", [
      transition(":enter",[
        style({visibility: 'hidden'}),
        animate(tempsMarche+"s"),
        style({visibility: 'visible'}),
        animate("0.1s"),
        style({visibility: 'hidden'}),
        animate("0.1s"),
        style({visibility: 'visible'}),
        animate("0.1s"),
        style({visibility: 'hidden'}),
        animate("0.1s"),
        style({visibility: 'visible'}),
        animate("0.1s")
      ])
    ]),
    trigger("Mort", [
      transition(":enter",[
        style({visibility: 'hidden'}),
        animate((tempsMarche+tempsStable+0.2)+"s"),
        style({visibility: 'visible'}),
        animate((tempsZoom-0.2)+"s"),
        animate(tempsRecul+"s", style({width: "1%", height: "1%", marginTop: "92%", left: '20%'})),
      ])
    ]),
    trigger("NomMort", [
      transition(":enter",[
        style({visibility: 'hidden'}),
        animate(tempsMarche+tempsStable+"s"),
        style({visibility: 'visible'}),
        animate(tempsZoom+"s"),
        style({visibility: 'hidden'}),
        animate(tempsRecul+"s"),
      ])
    ]),
    trigger("Fond", [
      transition(":enter",[
        style({left: '-110%', width: "500%", height: "500%", marginTop: '-400%'}),
        animate(tempsMarche+"s", style({left: '-100%', width: "500%", height: "500%", marginTop: '-400%'})),
        animate(tempsStable+"s", style({width: "500%", height: "500%", left: '-100%', marginTop: '-400%'})),
        animate("0.1s", style({width: "2000%", height: "2000%", left: '-400%', marginTop: '-1800%'})),
        animate(tempsZoom-0.1+"s", style({width: "2000%", height: "2000%", left: '-400%', marginTop: '-1800%'})),
        animate(tempsRecul+"s", style({width: "100%", height: "100%", left: '0%', marginTop: '0%'})),
        query("div", [
          stagger(-tempsLever/8+"s",[
            animate(tempsLever/8+"s",style({opacity: 0}))
          ])
        ])
      ])
    ]),
    trigger("Sol", [
      transition(":enter",[
        style({top: '45%', visibility: 'visible'}),
        animate(tempsMarche+tempsStable+"s"),
        style({top: '55%'}),
        animate(tempsZoom+"s ease-in", style({top: '130%'})),
      ])
    ]),
    trigger("Fondu", [
      transition(":enter",[
        style({opacity: 1}),
        animate("2.5s", style({opacity: 0}))
      ])
    ]),
    trigger("PendantLaNuit", [
      transition(":enter",[
        style({opacity: 1, visibility: 'visible'}),
        animate(tempsMarche+"s ease-in", style({opacity: 0, visibility: 'visible'}))
      ])
    ]),
    trigger("JourSeLeve", [
      transition(":enter",[
        style({opacity: 0, visibility: 'hidden'}),
        animate((tempsMarche+tempsStable+tempsZoom)+"s"),
        style({opacity: 1, visibility: 'visible'}),
        animate(tempsRecul+tempsLever+"s ease-in", style({opacity: 0, visibility: 'visible'}))
      ])
    ])

    


  ]
})
export class VideoMatinComponent implements OnInit {


  nomMorts: string[] = []
  nomVivant: string = "";
  textePendantLaNuit = "";
  texteJourSeLeve = "";
  socket: Socket;
  commencerVideo: boolean = false;
  infoEvenement?: InfoEvenement;

  isInfoAppareil: boolean = false;

  constructor(private audioService: AudioService, public communicationService: CommunicationService, private router: Router, private route: ActivatedRoute) {
    this.socket = communicationService.getSocket();
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params =>{
      this.infoEvenement = JSON.parse(params["infoEvenement"]);
      if(this.infoEvenement!.passer){
        this.socket.on("prochaineEtape", ()=>{
          this.audioService.jouerJour();
          this.socket.off("prochaineEtape")
          this.router.navigate(["jeuComponent"])
        })
      }
    })
    if(this.communicationService.isMeneurDeJeu){
      this.socket.on("prochaineEtape", ()=>{
        this.audioService.jouerJour();
        this.socket.off("prochaineEtape")
        this.router.navigate(["jeuComponent"])
      })
    }
    this.communicationService.numeroJour++;
    this.communicationService.getInfoVideo().subscribe((info: InfoVideo)=>{
      this.audioService.jouerMatin();
      this.nomVivant = info.nomJoueurAMontrer;
      this.nomMorts = info.nomJoueursMorts;
      this.textePendantLaNuit = info.textePendantLaNuit;
      this.texteJourSeLeve = info.texteJourSeLeve;
      this.commencerVideo = true;
    })
  }

  getLeft(index: number): number{
    let numeroMort: number = this.nomMorts.length-index;
    let incrementation:number = 0;
    let valeur: number = 0;
    while(valeur < numeroMort){
      incrementation++;
      valeur+=incrementation;
    }
    incrementation--;
    incrementation+=valeur-numeroMort;
    return -(1.5**(-(incrementation-9.648)))+50+20
  }

  getTop(index: number): number{
    let numeroMort: number = this.nomMorts.length-index;
    let incrementation:number = 0;
    while(numeroMort >0){
      incrementation++;
      numeroMort-=incrementation;
    }
    incrementation--;
    incrementation+=numeroMort;
    return (1.5**(-(incrementation-9.648)))-50+55
  }

  ok(): void{
    this.audioService.jouerJour();
    this.router.navigate(["jeuComponent"]);
  }

  switchInfoAppareil(): void {
    this.isInfoAppareil=!this.isInfoAppareil;
  }

}
