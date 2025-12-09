import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Socket } from 'socket.io-client';
import { CommunicationService } from '../services/communication.service';
import { InfoAppareilDetail } from '../../../../common/infoAppareilDetail';
import { InfoPartie } from '../../../../common/infoPartie';
import { Router } from '@angular/router';

@Component({
  selector: 'app-creation-appareils',
  templateUrl: './creation-appareils.component.html',
  styleUrls: ['./creation-appareils.component.css']
})
export class CreationAppareilsComponent implements OnInit {

  
  socket: Socket;
  @Input() idAppareil: number = -1;
  @Input() infoAppareils: string[][] = [];
  @Input() idMeneurDeJeu: number = -1;
  @Output() majInfosJeu = new EventEmitter<boolean>();
  @Output() retourAppareil = new EventEmitter<boolean>();

  infoAppareilsDetails: InfoAppareilDetail[] = [];

  constructor(public communicationService: CommunicationService, private router: Router) {
    this.socket = communicationService.getSocket();
  }

  ngOnInit(): void {
    if(this.idAppareil == -1){
      this.communicationService.getInfoPartie().subscribe((infos: InfoPartie)=>{
        this.infoAppareils = infos.noms;
        this.getInfoAppareilDetails();
        this.communicationService.voirHistorique().subscribe((historique: string)=>{
          this.communicationService.historiquePartie = historique;
        })
      })
    }
  }

  getInfoAppareilDetails(){
    this.communicationService.getInfoAppareilDetails().subscribe((infos: InfoAppareilDetail[])=>{
      this.infoAppareilsDetails = infos;
    })
  }

  ajouter(): void{
    let nomJoueur: string = "Joueur " + this.infoAppareils[this.idAppareil].length
    this.infoAppareils[this.idAppareil].push(nomJoueur);
    this.socket.emit("ajouterJoueur", nomJoueur)
  }

  retirer(idJoueur: number): void{
    this.infoAppareils[this.idAppareil].splice(idJoueur,1);
    this.socket.emit("retirerJoueur", idJoueur)
  }

  focus(){
    this.socket.off("reloadPartie");
  }

  renommer(event: any, idJoueur: number){
    this.socket.on("reloadPartie" , ()=>{
      this.majInfosJeu.emit();
    })
    let nomJoueur: string = event.target.value;
    if(nomJoueur.length>30){
      nomJoueur = nomJoueur.substring(0,30);
    }
    this.infoAppareils[this.idAppareil][idJoueur] = nomJoueur;
    this.socket.emit("renommerJoueur", idJoueur, nomJoueur)
  }

  changerTexte(event: any){
    if(event.target.value.length > 20){
      event.target.value = event.target.value.slice(0, event.target.value.length-1)
    }
  }

  switch(){
    this.socket.emit("switchMeneurDeJeu");
  }

  versLeHaut(index: number){
    this.socket.emit("versLeHaut", index);
  }

  switchPret(index: number){
    this.socket.emit("switchAppareilPret", index);
    this.getInfoAppareilDetails();
  }

  switchDisconnect(index: number){
    this.communicationService.switchAppareilDisconnect(index).subscribe((ok: boolean)=>{
      if(ok){
        this.getInfoAppareilDetails();
      }
    })
  }

  retirerAppareil(index: number){
    this.communicationService.retirerAppareil(index).subscribe((ok: boolean)=>{
      if(ok){
        this.infoAppareils.splice(index,1);
        this.getInfoAppareilDetails();
      }
    })
  }

  retour(){
    this.retourAppareil.emit();
  }

  triggerProchaineEtape(){
    this.socket.emit("prochaineEtape");
    this.router.navigate(["attenteComponent"]);
  }

}
