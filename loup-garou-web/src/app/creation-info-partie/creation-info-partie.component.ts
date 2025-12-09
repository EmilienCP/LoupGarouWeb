import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Role } from '../../../../common/Joueur';
import { Socket } from 'socket.io-client';
import { CommunicationService } from '../services/communication.service';
import * as utils from '../services/fontionsUtiles';

@Component({
  selector: 'app-creation-info-partie',
  templateUrl: './creation-info-partie.component.html',
  styleUrls: ['./creation-info-partie.component.css']
})
export class CreationInfoPartieComponent implements OnInit {

  socket: Socket;
  @Input() nomsPersonnages: string[] = [];
  @Input() idAppareil: number = -1;
  @Input() preferencesPersonnages: boolean[] = [];
  @Input() modeVideo: boolean = false;
  @Input() modePatateChaude: boolean = false;
  @Input() modeExtensionVillage: boolean = false;
  @Input() modeVillageoisVillageois: boolean = false;
  @Input() backup: boolean = false;
  @Input() histoire: boolean = false;
  @Input() nbJoueurs: number = 0;
  @Input() nbLoups: number = 0;
  @Input() nbVillageois: number = 0;
  @Output() description = new EventEmitter<Role | undefined>();

  
  constructor(public communicationService: CommunicationService) {
    this.socket = communicationService.getSocket();
  }

  ngOnInit(): void {
  }

  switchPerso(index: number){
    this.socket.emit("switchPerso", this.preferenceEnRole(index));
  }
  
  preferenceEnRole(index: number): Role{
    return index+3;
  }

  getNomRole(index: number): string{
    return utils.convertirRoleTexte(this.preferenceEnRole(index), true);
  }

  switchVideo(){
    this.socket.emit("switchVideo");
  }

  switchPatateChaude(){
    this.socket.emit("switchPatateChaude");
  }

  switchBackup(){
    this.socket.emit("switchBackup");
  }
  
  switchVillageoisVillageois(){
    this.socket.emit("switchVillageoisVillageois");
  }

  switchExtensionVillage(){
    this.socket.emit("switchExtensionVillage");
  }

  setNbJoueurs(event: any){
    if(+event.target.value>29){
      event.target.value = 29;
    }

    if(+event.target.value<+this.nbLoups){
      event.target.value = this.nbLoups;
    }
    this.nbJoueurs = +event.target.value;
    this.socket.emit("changerNbJoueurs", this.nbJoueurs);
  }

  setNbLoups(event: any){
    if(+event.target.value > +this.nbJoueurs){
      event.target.value = this.nbJoueurs;
    }
    if(+event.target.value < 0){
      event.target.value = 0;
    }
    this.nbLoups = +event.target.value;
    this.socket.emit("changerNbDeLoups", this.nbLoups);
  }

  setNbVillageois(event: any){
    if(+event.target.value < 0){
      event.target.value = 0;
    }
    this.nbVillageois = +event.target.value;
    this.socket.emit("changerNbDeVillageois", this.nbVillageois);
  }

  descriptionRole(role: Role | undefined){
    this.description.emit(role);
  }

  imageRole(role: Role): string{
    return utils.imageRole(role);
  }

}
