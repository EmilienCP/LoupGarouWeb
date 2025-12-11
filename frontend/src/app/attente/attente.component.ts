import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Socket } from 'socket.io-client';
import { EvenementDeGroupe, EvenementIndividuel } from '../../../../common/evenements';
import { CommunicationService } from '../services/communication.service';
import { InfoEvenement } from '../../../../common/infoEvenement';
import { Joueur } from '../../../../common/Joueur';

@Component({
  selector: 'app-attente',
  templateUrl: './attente.component.html',
  styleUrls: ['./attente.component.css']
})
export class AttenteComponent implements OnInit {

  socket: Socket;
  texte: string = "";
  nomsEnAttente: string[] = [];
  isInfoAppareil: boolean = false;


  constructor(public communicationService: CommunicationService, private router: Router) {
    this.socket = this.communicationService.getSocket();
  }

  ngOnInit(): void {
    this.socket = this.communicationService.getSocket();
    this.socket.on("prochaineEtape", ()=>{
      if(!this.socket.hasListeners("prochaineEtape")){
        this.socket.on("prochaineEtape", ()=>{
          this.suiteInfos();
        })
      }
      this.suiteInfos();
    })
    this.suiteInfos();
    this.socket.on("nouvelleAccusation", ()=>{
      this.suiteInfos();
    })
  }

  private suiteInfos(): void{
    this.communicationService.getInfoEvenement().subscribe((infoEvenement: InfoEvenement)=>{
      this.communicationService.getInfoVillage().subscribe((infoVillage: Joueur[])=>{
        this.communicationService.infoVillage = infoVillage;
        this.prochainLayout(infoEvenement);
      })
    })
  }

  private eteindreSockets(): void{
    this.socket.off("nouvelleAccusation");
    this.socket.off("prochaineEtape");
    this.socket.off("appareilTermine")
  }

  prochainLayout(infoEvenement: InfoEvenement){
    switch(+infoEvenement.evenement){
      case EvenementIndividuel.MONTRER_PERSONNAGE:
      case EvenementIndividuel.MONTRER_PERSONNAGE_PUBLIC:{
        this.eteindreSockets();
        this.router.navigate([this.router.url+"/montrerPersonnageComponent"], {queryParams: {"evenement": infoEvenement.evenement}})
        break;
      }
      case EvenementDeGroupe.SOLEIL_SE_COUCHE:
      case EvenementDeGroupe.JOUR_SE_LEVE:{
        this.communicationService.jour = (+infoEvenement.evenement == EvenementDeGroupe.JOUR_SE_LEVE);
        this.eteindreSockets();
        this.router.navigate([this.router.url+"/jourSeLeveComponent"], {queryParams: {"infoEvenement": JSON.stringify(infoEvenement)}});
        break;
      }
      case EvenementIndividuel.JOUER_CHASSEUR:
      case EvenementIndividuel.JOUER_VOYANTE:
      case EvenementIndividuel.JOUER_RENARD:
      case EvenementIndividuel.JOUER_CUPIDON:
      case EvenementIndividuel.JOUER_SORCIERE_PROTEGER:
      case EvenementIndividuel.CHOISIR_SUCCESSEUR:
      case EvenementIndividuel.TRANCHER_CAPITAINE:
      case EvenementIndividuel.JOUER_VILLAGEOIS:
      case EvenementIndividuel.JOUER_LOUP_GAROU:
      case EvenementIndividuel.JOUER_INFECTE_PERE_LOUPS:
      case EvenementIndividuel.JOUER_CORBEAU:
      case EvenementIndividuel.JOUER_FEMME_DE_MENAGE:
      case EvenementIndividuel.JOUER_HYPNOTISEUR:
      case EvenementIndividuel.JOUER_JOUEUR_DE_FLUTE:
      case EvenementIndividuel.JOUER_ENFANT_SAUVAGE:
      case EvenementIndividuel.JOUER_LOUP_BLANC:
      case EvenementIndividuel.JOUER_SERVANTE_DEVOUEE:
      case EvenementIndividuel.JOUER_GRAND_MECHANT_LOUP:
      case EvenementIndividuel.VOTER_CAPITAINE:
      case EvenementIndividuel.JOUER_PATATE_CHAUDE:
      case EvenementIndividuel.VOTER:{
        this.eteindreSockets();
        this.router.navigate([this.router.url+"/selecteurComponent"], {queryParams: {"evenement": infoEvenement.evenement}})
        break;
      }
      case EvenementDeGroupe.SERVANTE_DEVOUEE_QUESTION:
      case EvenementIndividuel.JOUER_SORCIERE_TUER:
      case EvenementIndividuel.JOUER_INSTITUTRICE:
      case EvenementDeGroupe.ACCUSER:{
        this.eteindreSockets();
        this.router.navigate([this.router.url+"/accusationsComponent"], {queryParams: {"evenement": infoEvenement.evenement}});
        break;
      }
      case EvenementDeGroupe.CHOISIR_SUCCESSEUR:{
        this.preparerAttente("Le capitaine est en train de choisir un successeur.");
        break;
      }
      case EvenementDeGroupe.TRANCHER_CAPITAINE:{
        this.preparerAttente("Le capitaine est en train de trancher.");
        break;
      }
      case EvenementDeGroupe.JOUER_CHASSEUR:{
        this.preparerAttente("Le chasseur est en train de choisir sa cible.");
        break;
      }
      case EvenementDeGroupe.JOUER_SERVANTE_DEVOUEE:{
        this.preparerAttente("La servante dévouée est en train de prendre un personnage.");
        break;
      }
      case EvenementDeGroupe.JOUER_NUIT:{
        this.preparerAttente("Faites votre action de nuit");
        break;
      }
      case EvenementDeGroupe.JOUER_INSTITUTRICE:{
        this.preparerAttente("L'institutrice veut-elle punir quelqu'un?");
        break;
      }
      case EvenementDeGroupe.SERVANTE_DEVOUEE_QUESTION_MENEUR:{
        if(!this.communicationService.isMeneurDeJeu){
          this.texte = "La servante dévouée veut-elle prendre le personnage d'un mort?"
        } else {
          this.preparerAttente("La servante dévouée veut-elle prendre le personnage d'un mort?");
        }
        break;
      }
      case EvenementIndividuel.ATTENTE:{
        this.preparerAttente("Attendez ...");
        break;
      }
      case EvenementDeGroupe.JOUER_JOUR:
      case EvenementDeGroupe.VICTOIRE:
      case EvenementDeGroupe.MONTRER_VIVANTS:
      case EvenementDeGroupe.INFO_TRANCHER_CAPITAINE:
      case EvenementDeGroupe.INFO_MORT_CAPITAINE:
      case EvenementDeGroupe.RESULTATS_VOTES:
      case EvenementDeGroupe.MORT_VOTES:
      case EvenementDeGroupe.INFO_VOTES:
      case EvenementDeGroupe.MONTRER_MORTS:
      case EvenementDeGroupe.INFO_ACCUSER:
      case EvenementIndividuel.CHANGER_JOUEUR:
      case EvenementIndividuel.MONTRER_TOUT_LE_MONDE:
      case EvenementDeGroupe.INFO_SUCCESSEUR:
      case EvenementDeGroupe.CHOIX_CAPITAINE:
      case EvenementDeGroupe.INFO_VILLAGEOIS_VILLAGEOIS:
      case EvenementIndividuel.INFO_AMOUREUX:
      case EvenementDeGroupe.MORT_AMOUREUX:
      case EvenementIndividuel.RECUPERER_SORT_MORTEL_SORCIERE:
      case EvenementDeGroupe.INFO_CHASSEUR_MORT:
      case EvenementDeGroupe.INFO_CHOIX_CHASSEUR:
      case EvenementDeGroupe.INFO_INSTITUTRICE:
      case EvenementIndividuel.INFO_INFECTE:
      case EvenementIndividuel.INFO_HYPNOTISER:
      case EvenementIndividuel.INFO_CHARMER:
      case EvenementIndividuel.INFO_ASSOCIER_MORT:
      case EvenementDeGroupe.OURS_GROGNE:
      case EvenementDeGroupe.CORBEAU:
      case EvenementDeGroupe.INFO_SERVANTE_DEVOUEE:
      case EvenementDeGroupe.INFO_CHEVALIER_A_LEPEE_ROUILLEE:
      case EvenementIndividuel.INFO_PATATE_CHAUDE:
      case EvenementDeGroupe.PERSONNAGE_MORTS:
      case EvenementDeGroupe.MOMENTS_FORTS:
      case EvenementDeGroupe.MOMENTS_FORTS_INFO:
      case EvenementDeGroupe.GRAND_MECHANT_LOUP_PERDRE_POUVOIR:
      case EvenementDeGroupe.INTRO:
      case EvenementIndividuel.CACHER_APPAREIL:
      case EvenementIndividuel.INFECT_PERE_RECUPERER_POUVOIR:{
        this.eteindreSockets();
        this.router.navigate([this.router.url+"/informationsComponent"],  {queryParams: {"infoEvenement": JSON.stringify(infoEvenement)}})
        break;
      }
      case EvenementDeGroupe.INTRO_HISTOIRE:{
        this.communicationService.jour = false;
        this.eteindreSockets();
        this.router.navigate([this.router.url+"/informationsComponent"],  {queryParams: {"infoEvenement": JSON.stringify(infoEvenement)}})
        break;
      }
      case EvenementDeGroupe.VIDEO_MATIN:{
        this.communicationService.jour = true;
        this.eteindreSockets();
        this.router.navigate([this.router.url+"/videoMatinComponent"],  {queryParams: {"infoEvenement": JSON.stringify(infoEvenement)}})
        break;
      }
      case EvenementDeGroupe.CREDITS:{
        this.eteindreSockets();
        this.router.navigate([this.router.url+"/creditsComponent"])
        break;
      }
      case EvenementDeGroupe.MONTRER_POINTS_VICTOIRES:{
        this.eteindreSockets();
        this.router.navigate([this.router.url+"/leaderBoardComponent"],  {queryParams: {"infoEvenement": JSON.stringify(infoEvenement)}});
        break;
      }
      default:{
        this.texte = "Aucun evenement trouvé";
      }

    }
  }

  preparerAttente(texte: string): void{
    this.texte = texte;
    this.socket.on("appareilTermine", ()=>{
      this.getJoueursEnAttente();
    })
    this.socket.emit("termine");
  }

  getJoueursEnAttente(): void{
    this.communicationService.getJoueursEnAttente().subscribe((noms: string[])=>{
      this.nomsEnAttente = noms;
    })
  }

  switchInfoAppareil(){
    this.isInfoAppareil = !this.isInfoAppareil;
  }

}
