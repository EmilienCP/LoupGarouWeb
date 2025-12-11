import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Socket } from 'socket.io-client';
import { AudioService } from '../services/audio.service';
import { CommunicationService } from '../services/communication.service';

@Component({
  selector: 'app-bouton-menu',
  templateUrl: './bouton-menu.component.html',
  styleUrls: ['./bouton-menu.component.css']
})
export class BoutonMenuComponent implements OnInit {

  private socket: Socket;
  messageErreur: string = "";

  constructor(private router: Router, private communicationService: CommunicationService, private audioService: AudioService) {
    this.socket = communicationService.getSocket();
  }
  urlImage = "../../assets/fondEcran.png"

  ngOnInit(): void {
    this.socket.on("Plus de parties disponibles", ()=>{
      this.messageErreur = "Le nombre de parties créées a atteint son maximum. Attendez qu'une partie se libère.";
    })
    this.audioService.jouerTheme();
  }

  eteindreSockets(): void{
    this.socket.off("reloadPartie")
    this.socket.off("Plus de parties disponibles")
  }

  creerPartie(): void {
    this.socket.on("reloadPartie", ()=>{
      this.audioService.arreter();
      this.eteindreSockets();
      this.router.navigate(["creationComponent"]);
    })
    this.socket.emit("creerPartie");
  }

  joindrePartie(): void{
    this.audioService.arreter();
    this.eteindreSockets();
    this.router.navigate(["joindreComponent"]);
  }

  credits(): void{
    this.eteindreSockets();
    this.router.navigate(["creditsComponent"], {queryParams:{isMenu: true}});
  }

  menuRoles(): void{
    this.audioService.arreter();
    this.eteindreSockets();
    this.router.navigate(["menuRolesComponent"], {queryParams:{isMenu: true}});
  }
}
