import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Socket } from 'socket.io-client';
import { EvenementDeGroupe, EvenementIndividuel } from '../../../../common/evenements';
import { CommunicationService } from '../services/communication.service';

@Component({
  selector: 'app-accusations',
  templateUrl: './accusations.component.html',
  styleUrls: ['./accusations.component.css']
})
export class AccusationsComponent implements OnInit {

  private socket:Socket;
  texteQuestion: string= "";
  evenement?: EvenementIndividuel | EvenementDeGroupe;

  constructor(private router: Router, private communicationService: CommunicationService, private route: ActivatedRoute, private cdRef: ChangeDetectorRef) {
    this.socket = this.communicationService.getSocket();
  }

  ngOnInit(): void {
    this.cdRef.detectChanges();
    this.route.queryParams.subscribe((params =>{
      this.evenement = params["evenement"];
      this.texteQuestion = this.determinerTexteQuestion();
      if(+this.evenement! == EvenementDeGroupe.ACCUSER){
        this.socket.on("nouvelleAccusation", ()=>{
          this.socket.off("nouvelleAccusation")
          this.router.navigate(["attenteComponent"]);
        })
      }
    }));
  }

  determinerTexteQuestion(): string {
    switch(+this.evenement!) {
      case EvenementIndividuel.JOUER_SORCIERE_TUER:
        return "Voulez-vous utiliser votre sort mortel?";
      case EvenementDeGroupe.SERVANTE_DEVOUEE_QUESTION:
        return "La Servante Dévouée veut-elle prendre le personnage d'un mort?";
      case EvenementDeGroupe.ACCUSER:
        return "Voulez-vous accuser quelqu'un?";
      case EvenementIndividuel.JOUER_INSTITUTRICE:
        return "Voulez-vous punir quelqu'un?";
      default:
        return "Oups! Pas d'évènement trouvé pour l'étape accusation !!"
    }
  }

  oui(){
    if(this.evenement == EvenementDeGroupe.SERVANTE_DEVOUEE_QUESTION){
      this.communicationService.ouiServanteDevouee().subscribe((ok: boolean)=>{
        if(ok){
          if(this.communicationService.isMeneurDeJeu){
            this.socket.emit("prochaineEtape")
          }
          this.router.navigate(["jeuComponent"]);
        }
      })
    } else {
      this.router.navigate(["jeuComponent/selecteurComponent"], {queryParams:{evenement: this.evenement!}})
    }
  }

  non(){
    if(this.communicationService.isMeneurDeJeu && (this.evenement == EvenementDeGroupe.ACCUSER||this.evenement == EvenementDeGroupe.SERVANTE_DEVOUEE_QUESTION)){
      this.socket.emit("prochaineEtape")
    }
    this.router.navigate(["jeuComponent"])
  }

}
