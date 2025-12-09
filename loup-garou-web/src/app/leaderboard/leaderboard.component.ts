import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InfoPointsDeVictoire } from '../../../../common/infoPointsDeVictoire';
import { CommunicationService } from '../services/communication.service';
import { Socket } from 'socket.io-client';
import { AudioService } from '../services/audio.service';
import { InfoEvenement } from '../../../../common/infoEvenement';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css']
})
export class LeaderboardComponent implements OnInit,OnChanges {

  @Input() infos: InfoPointsDeVictoire[] = [];
  @Input() menu: boolean = false;
  @Input() idAppareil: number = -1;
  isInfoAppareil: boolean = false;
  private socket: Socket;
  infoEvenement?: InfoEvenement;
  timer: any;

  constructor(private router: Router, public communicationService: CommunicationService, private audioService: AudioService, private route: ActivatedRoute) {
    this.socket = this.communicationService.getSocket();
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params =>{
      this.infoEvenement = JSON.parse(params["infoEvenement"]);
      if(this.infoEvenement!.timer>0){
        this.timer = setTimeout(()=>{
          this.ok();
        }, this.infoEvenement!.timer)
      }
    });
    if(this.communicationService.isMeneurDeJeu){
      this.socket.on("prochaineEtape", ()=>{
        this.socket.off("prochaineEtape");
        this.router.navigate(["jeuComponent"])
      })
    }
    if(!this.menu){
      if(!this.communicationService.isUnMeneurDeJeu || this.communicationService.isMeneurDeJeu){
        this.audioService.jouerCredits();
      }
      this.communicationService.getInfosPointsDeVictoire().subscribe((infos)=>{
        this.infos = infos;
        this.infos.sort((info1: InfoPointsDeVictoire, info2: InfoPointsDeVictoire)=>{
          return info2.points-info1.points;
        });
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.infos.sort((info1: InfoPointsDeVictoire, info2: InfoPointsDeVictoire)=>{
      return info2.points-info1.points;
    });
  }

  ok(){
    if(this.timer){
      clearTimeout(this.timer);
    }
    this.router.navigate(["jeuComponent"]);
  }

  setNbPoints(event: any, index: number){
    this.infos[index].points =+event.target.value;
    this.socket.emit("changerPointage", this.infos[index].idAppareil, this.infos[index].idJoueur, this.infos[index].points);
  }

  switchInfoAppareil(){
    this.isInfoAppareil = !this.isInfoAppareil;
  }

}
