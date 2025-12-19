import { animate, state, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, timeout } from 'rxjs/operators';
import { Socket } from 'socket.io-client';
import { InfoPartie } from '../../../../common/infoPartie';
import { InfoPointsDeVictoire } from '../../../../common/infoPointsDeVictoire';
import { Role } from '../../../../common/Joueur';
import { AudioService } from '../services/audio.service';
import { CommunicationService } from '../services/communication.service';
import * as utils from '../services/fontionsUtiles';
import * as qrcode from 'qrcode';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-creation',
  templateUrl: './creation.component.html',
  styleUrls: ['./creation.component.css'],
  animations:[
    trigger("texte", [
      transition(":enter", [
        style({opacity: 1}),
        animate("0.7s", style({opacity: 0}))
      ]),
      transition(":decrement", [
        style({opacity: 1}),
        animate("0.7s", style({opacity: 0}))
      ])
    ]),
    trigger('parent', [
      transition(':enter', [])
    ]),
    trigger("appareilsInfo", [
      state('deplacement', style({marginLeft: "{{marginFinal}}px"}), {params : { marginFinal: 0}}),
      state('0', style({marginLeft: "0%"})),
      state('1', style({marginLeft: "-100%"})),
      state('2', style({marginLeft: "-200%"})),
      transition("0 <=> 1", [animate("0.2s")]),
      transition("0 <=> 2", [animate("0.2s")]),
      transition("1 <=> 2", [animate("0.2s")]),
      transition("deplacement => *", [animate("0.2s")])
    ]),
    trigger("partieInfo", [
      state('deplacement', style({marginLeft: "{{marginFinal}}px"}), {params : { marginFinal: 0}}),
      state('0', style({marginLeft: "100%"})),
      state('1', style({marginLeft: "0%"})),
      state('2', style({marginLeft: "-100%"})),
      transition("0 <=> 1", [animate("0.2s")]),
      transition("0 <=> 2", [animate("0.2s")]),
      transition("1 <=> 2", [animate("0.2s")]),
      transition("deplacement => *", [animate("0.2s")])
    ]),
    trigger("pointageInfo", [
      state('deplacement', style({marginLeft: "{{marginFinal}}px"}), {params : { marginFinal: 0}}),
      state('0', style({marginLeft: "200%"})),
      state('1', style({marginLeft: "100%"})),
      state('2', style({marginLeft: "0%"})),
      transition("0 <=> 1", [animate("0.2s")]),
      transition("0 <=> 2", [animate("0.2s")]),
      transition("1 <=> 2", [animate("0.2s")]),
      transition("deplacement => *", [animate("0.2s")])
    ])
  ]
})
export class CreationComponent implements OnInit {

  @ViewChild('parent') myDiv?: ElementRef;
  @ViewChild('qrcode') imageQrCode?: ElementRef;

  couleurFond: string = "black";
  urlImage:string = "assets/moon.gif"
  infoAppareils: string[][] = [];
  infosPointsDeVictoire: InfoPointsDeVictoire[] = [];
  nbJoueurs: number = 0;
  nbLoups: number = 0;
  nbVillageois: number = 0;
  socket: Socket;
  modeVideo: boolean = false;
  modePatateChaude: boolean = false;
  modeExtensionVillage: boolean = false;
  modeVillageoisVillageois: boolean = false;
  backup: boolean = false;
  histoire: boolean = false;
  nomsPersonnages: string[] = [];
  preferencesPersonnages: boolean[] = [];
  idAppareil: number = -1;
  idJeu: number = -1;
  idMeneurDeJeu: number = -1;
  decompte: boolean = false;
  compteur: number =5;
  indexOnglet: number = 0;
  isDescriptionRole: boolean = false;
  roleChoisiPourDescription?: Role;
  peutCommencer: boolean = false;
  entrainDeDrag: boolean = false;
  positionInitialeX: number = 0;
  marginFinal: number = 0;
  qrcodeurl: string = "";
  constructor(private router: Router, public communicationService: CommunicationService, private audioService: AudioService) { 
    this.socket = communicationService.getSocket();
  }

  ngOnInit(): void {
    qrcode.toDataURL(environment.server_host+':4200', (err, url)=>{
      if(err){console.log(err)}
      else{
        this.qrcodeurl = url;
      }
    })
    for(let i: number = 0; i< Object.keys(Role).length/2-3;i++){
      this.nomsPersonnages.push(utils.convertirRoleTexte(this.preferenceEnRole(i)));
    }
    this.majInfosJeu();
    this.socket.on("reloadPartie" , ()=>{
      this.majInfosJeu()
    })
    this.socket.on("decompte", ()=>{
      this.audioService.jouerDebutPartie();
      this.decompte = true;
      this.compteur--;
      setTimeout( () => { 
        this.compteur--;
        setTimeout( () => { 
          this.compteur--;
          setTimeout( () => { 
            this.compteur--;
            setTimeout( () => { 
              if(this.peutCommencer){
                this.quitterComponent();
                if(!this.histoire){
                  this.communicationService.jour = true;
                  this.audioService.jouerJour();
                }
                this.router.navigate(["jeuComponent"])
              }
              this.peutCommencer=true;
              }, 1000 );
            }, 1000 );
         }, 1000 );
       }, 1000 );
    });
    this.socket.on("partieCommencee", ()=>{
      if(this.peutCommencer){
        this.quitterComponent();
        this.router.navigate(["jeuComponent"])
      }
      this.peutCommencer=true;
    })
  }

  quitterComponent(): void{
    this.socket.off("reloadPartie")
    this.socket.off("partieCommencee")
    this.socket.off("appareilDeconnecte")
  }

  majInfosJeu(){
    this.communicationService.getInfoPartie().pipe(catchError(err => {
      this.router.navigate([""]);
      return this.communicationService.handleError(err);
    })).subscribe((info: InfoPartie)=>{
      if(info){
        this.infoAppareils = info.noms;
        this.infosPointsDeVictoire = info.infosPointsDeVictoire;
        this.nbJoueurs = info.nbJoueurs;
        this.nbLoups = info.nbLoups;
        this.nbVillageois = info.nbVillageois;
        this.communicationService.isMeneurDeJeu = info.idMeneurDeJeu == info.idAppareil;
        this.communicationService.isUnMeneurDeJeu = info.idMeneurDeJeu !== -1;
        this.idMeneurDeJeu = info.idMeneurDeJeu;
        this.modeVideo = info.modeVideo;
        this.modePatateChaude = info.modePatateChaude;
        this.backup = info.backup;
        this.modeVillageoisVillageois = info.modeVillageoisVillageois;
        this.modeExtensionVillage = info.modeExtensionVillage;
        if(info.idAppareil == 0 && this.idAppareil == -1){
          this.audioService.jouerCreation();
        }
        this.idAppareil = info.idAppareil;
        this.idJeu = info.idJeu;
        const nbRoles: number = (Object.keys(Role).length / 2) - 3
        this.preferencesPersonnages = [];
        for(let i = 0; i < nbRoles; i++){
          this.preferencesPersonnages.push(info.preferencesPersonnages.includes(this.preferenceEnRole(i)))
        }
      } else {
        this.retour();
      }
      
    });
  }

  preferenceEnRole(index: number): Role{
    return index+3;
  }

  roleEnPreference(role: Role): number{
    return role-3
  }

  retour(){
    this.quitterComponent();
    this.socket.emit("quitterPartie");
    this.router.navigate([""]);
  }

  commencer(){
    if(this.backup){
      this.communicationService.isMeneurDeJeu = true;
    }
    if(this.idAppareil == 0){
      this.socket.emit("commencerPartie");
    }
  }

  menuAppareil(){
    this.indexOnglet = 0;
  }

  menuInfosPartie(){
    this.indexOnglet = 1;
  }

  menuLeaderBoard(){
    this.indexOnglet = 2
  }

  descriptionRole(event: Role | undefined){
    this.isDescriptionRole = true;
    this.roleChoisiPourDescription = event;
  }

  retourDescriptionRole(){
    this.isDescriptionRole = false;
  }

  mouseDown(event: any){
    this.entrainDeDrag = true;
    if(event.clientX){
      this.positionInitialeX = event.clientX;
    } else {
      this.positionInitialeX = event.touches[0].clientX;
    }
  }
  
  mouseMove(event: any){
    if(this.entrainDeDrag){
      if(event.clientX){
        this.marginFinal = event.clientX-this.positionInitialeX;
      } else {
        this.marginFinal = event.touches[0].clientX-this.positionInitialeX;
      }
    }
  }

  mouseUp(){
    this.entrainDeDrag = false;
    if(this.marginFinal < -(this.myDiv!.nativeElement.offsetWidth/3) && this.indexOnglet < 2){
      this.indexOnglet++;
    }
    if(this.marginFinal > (this.myDiv!.nativeElement.offsetWidth/3) && this.indexOnglet > 0){
      this.indexOnglet--;
    }
    this.marginFinal = 0;
  }

  
}
