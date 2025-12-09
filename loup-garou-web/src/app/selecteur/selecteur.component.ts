import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Socket } from 'socket.io-client';
import { Joueur, Equipe, Role, JoueurExtensionLoups } from '../../../../common/Joueur';
import { EvenementDeGroupe, EvenementIndividuel, RaisonPasVoter } from '../../../../common/evenements';
import { CommunicationService } from '../services/communication.service';
import { InfoEvenement } from '../../../../common/infoEvenement';
import * as utils from '../services/fontionsUtiles';
import { InfoPartie } from '../../../../common/infoPartie';

@Component({
  selector: 'app-selecteur',
  templateUrl: './selecteur.component.html',
  styleUrls: ['./selecteur.component.css']
})
export class SelecteurComponent implements OnInit {

  texte: string = "";
  evenement: EvenementIndividuel|EvenementDeGroupe|undefined;
  nbVotes: number = 0;
  socket: Socket;
  raisonsPasVoter: RaisonPasVoter[]=[];
  messageAvertissement: string = "";
  siQuiEtesVous: boolean = false;
  peutPasser: boolean = false;
  pretAPasser: boolean = false;
  tempsAvantDePasser: number = 0;
  idJoueurSelectionne: number = -1;
  detailsVillage: boolean = false;
  infoVillageExtensionLoups: JoueurExtensionLoups[] = [];

  constructor(private communicationService: CommunicationService, private route: ActivatedRoute, private router: Router) {
    this.socket = communicationService.getSocket();
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params =>{
      this.evenement = params["evenement"]
      if(+this.evenement! !== EvenementIndividuel.ARRIVER_EN_MILIEU_DE_PARTIE){
        this.communicationService.getInfoVillage().subscribe((infoVillage: Joueur[])=>{
          this.communicationService.infoVillage = infoVillage;
        })
      } else {
        this.communicationService.getInfoVillageArriverMilieuDePartie().subscribe((infoVillage: Joueur[])=>{
          this.communicationService.infoVillage = infoVillage;
        })
      }
      if(+this.evenement! ==  EvenementIndividuel.JOUER_LOUP_GAROU){
        this.nbVotes = 3;
        this.communicationService.getInfoVillageExtensionLoups().subscribe((infoVillageExtensionLoups: JoueurExtensionLoups[])=>{
          this.infoVillageExtensionLoups = infoVillageExtensionLoups;
        });
        this.socket.on("miseAJourLoups", ()=>{
          this.communicationService.getInfoVillageExtensionLoups().subscribe((infoVillageExtensionLoups: JoueurExtensionLoups[])=>{
            this.infoVillageExtensionLoups = infoVillageExtensionLoups;
          });
        })
      }
      this.peutPasser = this.getPeutPasser();
      this.detailsVillage = this.getDetailsVillageDefault();
      if(+this.evenement! ==  EvenementDeGroupe.ACCUSER){
        this.communicationService.siPlusieursPersonnesPeuventAccuser().subscribe((oui: boolean)=>{
          if(oui){
            this.siQuiEtesVous = true;
            this.communicationService.getRaisonsPasVoterAccusationQuiEtesVous().subscribe((raisons: RaisonPasVoter[])=>{
              this.raisonsPasVoter = raisons;
              this.texte = "Qui êtes-vous?"
            })
          } else {
            this.preparerAccusation();
          }
        })
      } else if(+this.evenement! == EvenementIndividuel.JOUER_SORCIERE_TUER){
        this.texte = this.changerTexte();
        this.communicationService.getRaisonsPasVoterSortMortel().subscribe((raisons: RaisonPasVoter[])=>{
          this.raisonsPasVoter = raisons;
        })
      } else if(+this.evenement! == EvenementIndividuel.JOUER_INSTITUTRICE){
        this.texte = this.changerTexte();
        this.communicationService.getRaisonsPasVoterInstitutrice().subscribe((raisons: RaisonPasVoter[])=>{
          this.raisonsPasVoter = raisons;
        })
      } 
      else if(+this.evenement! == EvenementIndividuel.ARRIVER_EN_MILIEU_DE_PARTIE){
        this.texte = this.changerTexte();
        this.communicationService.getRaisonsPasVoterArriverMilieuDePartie().subscribe((raisons: RaisonPasVoter[])=>{
          this.raisonsPasVoter = raisons;
        })
      } 
      else {
        this.texte = this.changerTexte();
        this.communicationService.getRaisonsPasVoter().subscribe((raisons: RaisonPasVoter[])=>{
          this.raisonsPasVoter = raisons;
        })
      }
      this.tempsAvantDePasser = this.getCompteurPretAPasser();
    }))
  }

  preparerAccusation(): void {
    this.communicationService.getRaisonsPasVoterAccusation().subscribe((raisons: RaisonPasVoter[])=>{
      this.raisonsPasVoter = raisons;
      this.texte = "Qui voulez-vous accuser?"
    })
  }

  changerTexte(): string{
    switch(+this.evenement!){
      case EvenementIndividuel.VOTER:
        return "Pour qui voulez-vous voter?";
      case EvenementDeGroupe.ACCUSER:
        return "Qui voulez-vous accuser?";
      case EvenementIndividuel.VOTER_CAPITAINE:
        return "Votez pour un capitaine"
      case EvenementIndividuel.TRANCHER_CAPITAINE:
        return "Qui voulez-vous élimininer?"
      case EvenementIndividuel.CHOISIR_SUCCESSEUR:
        return "Qui voulez-vous choisir comme successeur?"
      case EvenementIndividuel.JOUER_VILLAGEOIS:
        return "Vous n'avez pas de pouvoir de nuit, faites semblant de jouer."
      case EvenementIndividuel.JOUER_LOUP_GAROU:
        return "Qui voulez-vous éliminer cette nuit?"
      case EvenementIndividuel.JOUER_INFECTE_PERE_LOUPS:
        return "Qui voulez-vous infecter?"
      case EvenementIndividuel.JOUER_VOYANTE:
        return "Choisissez le joueur dont vous voulez connaître le rôle"
      case EvenementIndividuel.JOUER_RENARD:
        return "Choisissez un joueur au centre d'un groupe de trois"
      case EvenementIndividuel.JOUER_CUPIDON:
        return "Qui voulez-vous rendre amoureux?"
      case EvenementIndividuel.JOUER_SORCIERE_PROTEGER:
        return "Qui voulez-vous protéger cette nuit?"
      case EvenementIndividuel.JOUER_SORCIERE_TUER:
      case EvenementIndividuel.JOUER_CHASSEUR:
        return "Qui voulez-vous éliminer?"
      case EvenementIndividuel.JOUER_CORBEAU:
        return "Qui soupconnez-vous d'être un loup-garou?"
      case EvenementIndividuel.JOUER_FEMME_DE_MENAGE:
        return "Chez qui voulez-vous faire le ménage cette nuit?"
      case EvenementIndividuel.ARRIVER_EN_MILIEU_DE_PARTIE:
        return "Quel personnage étiez-vous?"
      case EvenementIndividuel.JOUER_HYPNOTISEUR:
        return "Qui voulez-vous hypnotiser cette nuit?"
      case EvenementIndividuel.JOUER_JOUEUR_DE_FLUTE:
        return "Qui voulez-vous charmer cette nuit?"
      case EvenementIndividuel.JOUER_ENFANT_SAUVAGE:
        return "Choisissez un associé"
      case EvenementIndividuel.JOUER_LOUP_BLANC:
        return "Voulez-vous tuer un loup?"
      case EvenementIndividuel.JOUER_SERVANTE_DEVOUEE:
        return "Quel personnage voulez-vous prendre son rôle?"
      case EvenementIndividuel.JOUER_GRAND_MECHANT_LOUP:
        return "Voulez-vous dévorer un autre villageois?"
      case EvenementIndividuel.JOUER_PATATE_CHAUDE:
        return "À qui voulez-vous donner la patate chaude?"
      case EvenementIndividuel.JOUER_INSTITUTRICE:
        return "Qui voulez-vous punir?"
    }
    return "Aucun evenement trouvé"
  }

  choisir(){
    if(!this.pretAPasser){
      return;
    }
    if(this.raisonsPasVoter[this.idJoueurSelectionne] !== RaisonPasVoter.AUCUN){
      this.messageAvertissement = this.getMessageAvertissement(this.raisonsPasVoter[this.idJoueurSelectionne]); 
    } else{
      this.executerChoix(this.idJoueurSelectionne);
    }
  }

  selectionner(index: number){
    this.idJoueurSelectionne = index;
    this.messageAvertissement = "";
    if(+this.evenement! == EvenementIndividuel.JOUER_LOUP_GAROU){
      this.socket.emit("pointer", index);
    }
  }

  private getMessageAvertissement(raison: RaisonPasVoter): string{
    switch(raison){
        case RaisonPasVoter.SOI_MEME:
          return "Vous ne pouvez pas vous choisir vous-même"
        case RaisonPasVoter.AMI_LOUP:
          return "Ce joueur est déjà loup garou"
        case RaisonPasVoter.PAS_ACCUSE:
          return "Ce joueur n'est pas accusé"
        case RaisonPasVoter.DEJA_ACCUSE:
          return "Ce joueur est déjà accusé"
        case RaisonPasVoter.DEJA_2_VOTES:
          return "Vous avez déjà mis 2 votes pour ce joueur"
        case RaisonPasVoter.PAS_MORT:
          return "Ce joueur n'est pas dans les choix"
        case RaisonPasVoter.PAS_APPAREIL:
          return "Ce joueur n'est pas sur votre appareil"
        case RaisonPasVoter.DEJA_CHOISI:
          return "Ce joueur a déjà été choisi"
        case RaisonPasVoter.DEJA_MORT:
          return "Ce joueur est déjà mort"
        case RaisonPasVoter.DEJA_VILLAGEOIS_VILLAGEOIS:
          return "Ce joueur est villageois villageois, vous connaissez déjà le rôle"
        case RaisonPasVoter.DEJA_CHARMER:
          return "Ce joueur est déjà charmé"
        case RaisonPasVoter.PAS_LOUP:
          return "Ce joueur n'est pas un loup"
        case RaisonPasVoter.AMOUREUX:
          return "Ce joueur est votre amoureux"
        case RaisonPasVoter.PAS_FERMIER:
          return "Ce joueur n'est pas un fermier"
        case RaisonPasVoter.VAGABOND:
          return "Ce joueur est un vagabond"
        case RaisonPasVoter.AUCUN:
          return "Pas supposé afficher ceci"
    }
  }

  private executerChoix(index: number): void{
    switch(+this.evenement!){
        case EvenementIndividuel.VOTER_CAPITAINE:
        case EvenementIndividuel.TRANCHER_CAPITAINE:
        case EvenementIndividuel.CHOISIR_SUCCESSEUR:
        case EvenementIndividuel.JOUER_SORCIERE_PROTEGER:
        case EvenementIndividuel.JOUER_SORCIERE_TUER:
        case EvenementIndividuel.JOUER_INFECTE_PERE_LOUPS:
        case EvenementIndividuel.JOUER_CHASSEUR:
        case EvenementIndividuel.JOUER_CORBEAU:
        case EvenementIndividuel.JOUER_FEMME_DE_MENAGE:
        case EvenementIndividuel.VOTER:
        case EvenementIndividuel.JOUER_HYPNOTISEUR:
        case EvenementIndividuel.JOUER_ENFANT_SAUVAGE:
        case EvenementIndividuel.JOUER_LOUP_BLANC:
        case EvenementIndividuel.JOUER_PATATE_CHAUDE:
        case EvenementIndividuel.JOUER_SERVANTE_DEVOUEE:
        case EvenementIndividuel.JOUER_INSTITUTRICE:
        case EvenementIndividuel.JOUER_GRAND_MECHANT_LOUP:
            this.communicationService.voterVillageois(index, this.evenement!).subscribe((ok: boolean)=>{
                if(ok){
                    this.router.navigate(["jeuComponent"]);
                }
            })
            break;
        case EvenementIndividuel.ARRIVER_EN_MILIEU_DE_PARTIE:
          this.communicationService.voterVillageois(index, this.evenement!).subscribe((ok: boolean)=>{
              if(ok){
                if(this.communicationService.isUnMeneurDeJeu){
                  this.communicationService.getInfoPartie().subscribe((info: InfoPartie)=>{
                    if(info.idAppareil == info.idMeneurDeJeu){
                      this.communicationService.isMeneurDeJeu = true;
                    }
                    this.router.navigate(["jeuComponent"]);
                  })
                }else {
                  this.router.navigate(["jeuComponent"]);
                }
              }
          })
          break;
        case EvenementDeGroupe.ACCUSER:
            if(this.siQuiEtesVous){
              this.communicationService.voterVillageois(index, this.evenement!).subscribe((ok: boolean)=>{
                if(ok){
                this.siQuiEtesVous = false;
                this.preparerAccusation();
                }
              })
            } else {
              this.socket.on("nouvelleAccusation", ()=>{
                this.socket.off("nouvelleAccusation");
                this.router.navigate(["jeuComponent"]);
              })
              this.socket.emit("accusation", index);
            }
            break;
        case EvenementIndividuel.JOUER_VILLAGEOIS:
            this.router.navigate(["jeuComponent"])
            break;
        case EvenementIndividuel.JOUER_LOUP_GAROU:
            this.communicationService.voterVillageois(index, this.evenement!).subscribe((ok: boolean)=>{
                if(ok){
                    this.socket.emit("changementLoups");
                    this.communicationService.getNouvellesRaisonsPasVoter().subscribe((raisons: RaisonPasVoter[])=>{
                        this.raisonsPasVoter = raisons;
                    })
                    this.nbVotes--;
                    if(this.nbVotes == 0){
                        this.socket.off("miseAJourLoups")
                        this.router.navigate(["jeuComponent"]);
                    }
                }
            })
            break;
      
        case EvenementIndividuel.JOUER_VOYANTE:
            this.communicationService.voterVillageois(index, this.evenement!).subscribe((ok: boolean)=>{
            if(ok){
                this.router.navigate(["jeuComponent/montrerPersonnageComponent"], {queryParams: {"evenement": this.evenement}});
            }
            })
            break;
        case EvenementIndividuel.JOUER_RENARD:
            this.communicationService.voterVillageois(index, this.evenement!).subscribe((ok: boolean)=>{
              if(ok){
                const info: InfoEvenement = {
                  evenement: this.evenement!,
                  passer: false,
                  peutPasser: false,
                  timer: 0
                }
                this.router.navigate(["jeuComponent/informationsComponent"], {queryParams: {"infoEvenement": JSON.stringify(info)}});
              }
            })
            break;
        case EvenementIndividuel.JOUER_CUPIDON:
            this.communicationService.voterVillageois(index, this.evenement!).subscribe((ok: boolean)=>{
            if(ok){
                this.nbVotes--;
                if(this.nbVotes == -2){
                this.router.navigate(["jeuComponent"]);
                } else {
                this.communicationService.getRaisonsPasVoter().subscribe((raisons: RaisonPasVoter[])=>{
                    this.raisonsPasVoter = raisons;
                })
                }
            }
            })
        break;
        case EvenementIndividuel.JOUER_JOUEUR_DE_FLUTE:
            this.communicationService.voterVillageois(index, this.evenement!).subscribe((ok: boolean)=>{
            if(ok){
                this.nbVotes--;
                if(this.nbVotes == -2){
                this.router.navigate(["jeuComponent"]);
                } else {
                this.communicationService.getRaisonsPasVoter().subscribe((raisons: RaisonPasVoter[])=>{
                    this.raisonsPasVoter = raisons;
                })
                }
            }
            })
        break;
    }
  }

  passer(): void {
    if(!this.pretAPasser){
      return;
    }
    if(+this.evenement! == EvenementDeGroupe.ACCUSER || +this.evenement! == EvenementIndividuel.JOUER_SORCIERE_TUER) {
      this.router.navigate(["jeuComponent/accusationsComponent"], {queryParams: {"evenement": this.evenement}});
    } else{
      this.router.navigate(["jeuComponent"]);
    }
  }

  getClasseBouton(index: number): string{
    return this.raisonsPasVoter[index] == RaisonPasVoter.AUCUN?'peutChoisir':'peutPasChoisir'
  }

  getPeutPasser(): boolean{
    if(+this.evenement! ==  EvenementIndividuel.JOUER_LOUP_GAROU 
      || +this.evenement! ==  EvenementDeGroupe.ACCUSER
      || +this.evenement! ==  EvenementIndividuel.JOUER_SORCIERE_PROTEGER 
      || +this.evenement! ==  EvenementIndividuel.JOUER_SORCIERE_TUER
      || +this.evenement! ==  EvenementIndividuel.JOUER_VOYANTE
      || +this.evenement! ==  EvenementIndividuel.JOUER_RENARD
      || +this.evenement! ==  EvenementIndividuel.JOUER_INFECTE_PERE_LOUPS
      || +this.evenement! ==  EvenementIndividuel.JOUER_INSTITUTRICE
      || +this.evenement! ==  EvenementIndividuel.JOUER_LOUP_BLANC
      || +this.evenement! ==  EvenementIndividuel.JOUER_GRAND_MECHANT_LOUP
      || +this.evenement! ==  EvenementIndividuel.JOUER_JOUEUR_DE_FLUTE ){
      return true;
    }

    return false;
  }

  compteurPretAPasser(){
    setTimeout(()=>{
        this.tempsAvantDePasser--;
        if(this.tempsAvantDePasser <= 0){
          this.pretAPasser = true;
        } else {
          this.compteurPretAPasser();
        }
      }, 1000)
  }

  getCompteurPretAPasser(): number{
    switch(+this.evenement!){
      case EvenementIndividuel.VOTER:
      case EvenementIndividuel.VOTER_CAPITAINE:
      case EvenementIndividuel.JOUER_SORCIERE_TUER:
      case EvenementIndividuel.JOUER_INFECTE_PERE_LOUPS:
      case EvenementIndividuel.JOUER_CUPIDON:
      case EvenementIndividuel.JOUER_INSTITUTRICE:
      case EvenementIndividuel.TRANCHER_CAPITAINE:
      case EvenementIndividuel.CHOISIR_SUCCESSEUR:
      case EvenementIndividuel.ARRIVER_EN_MILIEU_DE_PARTIE:
      case EvenementIndividuel.JOUER_ENFANT_SAUVAGE:
      case EvenementIndividuel.JOUER_LOUP_BLANC:
      case EvenementIndividuel.JOUER_SERVANTE_DEVOUEE:
      case EvenementIndividuel.JOUER_GRAND_MECHANT_LOUP:
      case EvenementDeGroupe.ACCUSER:
        this.pretAPasser = true;
        return 0;
      default:
        this.compteurPretAPasser();
        return 5;
    }
  }

  getDetailsVillageDefault(): boolean{
    if(+this.evenement! ==  EvenementIndividuel.JOUER_LOUP_GAROU 
      || +this.evenement! ==  EvenementIndividuel.JOUER_SORCIERE_PROTEGER 
      || +this.evenement! ==  EvenementIndividuel.JOUER_SORCIERE_TUER
      || +this.evenement! ==  EvenementIndividuel.JOUER_VOYANTE
      || +this.evenement! ==  EvenementIndividuel.JOUER_RENARD
      || +this.evenement! ==  EvenementIndividuel.JOUER_INFECTE_PERE_LOUPS
      || +this.evenement! ==  EvenementIndividuel.JOUER_GRAND_MECHANT_LOUP
      || +this.evenement! ==  EvenementIndividuel.JOUER_LOUP_BLANC
      || +this.evenement! ==  EvenementIndividuel.JOUER_CORBEAU
      || +this.evenement! ==  EvenementIndividuel.JOUER_HYPNOTISEUR
      || +this.evenement! ==  EvenementIndividuel.JOUER_VILLAGEOIS
      || +this.evenement! ==  EvenementIndividuel.JOUER_FEMME_DE_MENAGE
      || +this.evenement! ==  EvenementIndividuel.JOUER_PATATE_CHAUDE
      || +this.evenement! ==  EvenementIndividuel.JOUER_JOUEUR_DE_FLUTE ){
      return true;
    }
    return false;
  }

}
