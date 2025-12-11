import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Socket } from 'socket.io-client';
import { Equipe, Joueur, Role } from '../../../../common/Joueur';
import { EvenementDeGroupe, EvenementIndividuel, Victoire } from '../../../../common/evenements';
import { CommunicationService } from '../services/communication.service';
import * as utils from '../services/fontionsUtiles';
import { InfoEvenement } from '../../../../common/infoEvenement';
import { InfoPointsDeVictoire } from '../../../../common/infoPointsDeVictoire';
import { AudioService } from '../services/audio.service';
import { MomentFort, MomentFortType } from '../../../../common/momentFort';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-informations',
  templateUrl: './informations.component.html',
  styleUrls: ['./informations.component.css'],
  animations: [
    trigger("progressBar", [
      state("false",style({width: "0%"})),
      transition("false=>true",[
        style({width: "100%"}),
        animate("{{time}}s", style({width: "0%"}))
      ])
    ])
  ]
})
export class InformationsComponent implements OnInit {

  infoEvenement?: InfoEvenement;
  historiqueEvenements: string[][] = [];
  textePrincipal: string[] = [];
  infoAccuser: boolean = false;
  timer: any;
  timer2: any
  valeurTimer: number = 0;
  isTimer: boolean = false;
  isInfoAppareil: boolean = false;
  private socket: Socket;

  constructor(private route: ActivatedRoute, private router: Router, public communicationService: CommunicationService, private audioService: AudioService, private cdRef: ChangeDetectorRef) { 
    this.socket = this.communicationService.getSocket();
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params =>{
      this.infoEvenement = JSON.parse(params["infoEvenement"]);
      if(this.infoEvenement!.passer || +this.infoEvenement!.evenement == EvenementDeGroupe.INFO_ACCUSER || this.communicationService.isMeneurDeJeu){
        //doit etre fait le plus vite possible, pcq si qqn a rien a faire, le meneur de jeu pourrait ne pas avoir le temps dattendre la prochaine etape
        this.attendreProchaineEtape();
      }
      this.communicationService.getHistoriqueEvenements().subscribe((historiqueEvenement: string[][])=>{
        this.historiqueEvenements = historiqueEvenement
        this.cdRef.detectChanges();
        this.valeurTimer = this.infoEvenement!.timer/1000;
        if(this.infoEvenement!.timer>0){
          this.isTimer=true;
          this.timer = setTimeout(()=>{
            this.ok();
          }, this.infoEvenement!.timer)
        }
        if(+this.infoEvenement!.evenement == EvenementDeGroupe.INFO_ACCUSER){
          this.infoAccuser = this.communicationService.isUnMeneurDeJeu;
          this.communicationService.socket.on("derniereAccusation", ()=>{
            this.communicationService.getHistoriqueEvenements().subscribe((historiqueEvenement: string[][])=>{
              this.historiqueEvenements = historiqueEvenement
              this.infoAccuser = false;
            })
          })
          this.communicationService.socket.on("nouvelleAccusation", ()=>{
            this.communicationService.getHistoriqueEvenements().subscribe((historiqueEvenement: string[][])=>{
              this.historiqueEvenements = historiqueEvenement
              this.changerTexte();
            })
          })
          this.changerTexte();
          this.communicationService.isDerniereAccusation().subscribe((oui: boolean)=>{
            if(oui){
              this.infoAccuser = false;
            }
          })
        } else {
          this.partirAudio();
          this.changerTexte();
        }
      })
    })
  }

  partirAudio(){
    if(this.communicationService.isMeneurDeJeu || !this.communicationService.isUnMeneurDeJeu){
      if(+this.infoEvenement!.evenement == EvenementDeGroupe.OURS_GROGNE){
        this.communicationService.getOursGrogne().subscribe((oui: boolean)=>{
          if(oui){
            this.audioService.jouerOursGrogne();
          }
        })
      } else if(+this.infoEvenement!.evenement == EvenementDeGroupe.CORBEAU){
        this.audioService.jouerCorbeau();
      }
    }
  }

  attendreProchaineEtape(): void{
    this.socket.on("prochaineEtape", ()=>{
      this.socket.off("prochaineEtape")
      this.ok();
    })
    this.timer2 = setTimeout(()=>{
      if(!this.socket.hasListeners("prochaineEtape")){
        this.attendreProchaineEtape();
      }
    }, 2000)
  }

  eteindreSocket(): void{
    if(this.timer){
      clearTimeout(this.timer);
    }
    if(this.timer2){
      clearTimeout(this.timer2);
    }
    this.socket.off("nouvelleAccusation")
    this.socket.off("derniereAccusation")
  }

  changerTexte(): void {
    if(this.communicationService.isUnMeneurDeJeu && !this.communicationService.isMeneurDeJeu &&
       +this.infoEvenement!.evenement !== EvenementDeGroupe.INFO_VOTES && 
       +this.infoEvenement!.evenement !== EvenementIndividuel.CHANGER_JOUEUR && 
       +this.infoEvenement!.evenement !== EvenementIndividuel.MONTRER_TOUT_LE_MONDE &&
       +this.infoEvenement!.evenement !== EvenementIndividuel.INFO_AMOUREUX &&
       +this.infoEvenement!.evenement !== EvenementIndividuel.INFO_INFECTE &&
       +this.infoEvenement!.evenement !== EvenementIndividuel.INFO_HYPNOTISER &&
       +this.infoEvenement!.evenement !== EvenementIndividuel.RECUPERER_SORT_MORTEL_SORCIERE &&
       +this.infoEvenement!.evenement !== EvenementIndividuel.INFO_CHARMER &&
       +this.infoEvenement!.evenement !== EvenementIndividuel.INFO_ASSOCIER_MORT &&
       +this.infoEvenement!.evenement !== EvenementIndividuel.JOUER_RENARD &&
       +this.infoEvenement!.evenement !== EvenementIndividuel.INFO_PATATE_CHAUDE &&
       +this.infoEvenement!.evenement !== EvenementIndividuel.CACHER_APPAREIL &&
       +this.infoEvenement!.evenement !== EvenementDeGroupe.INFO_ACCUSER){
      this.textePrincipal.push("Lisez l'écran du meneur de jeu et appuyez sur Ok")
      this.cdRef.detectChanges();
      return;
    }
    let evenementTexte: string[] = []
    switch(+this.infoEvenement!.evenement){
      case EvenementDeGroupe.INFO_ACCUSER:
      case EvenementDeGroupe.MONTRER_MORTS:
      case EvenementDeGroupe.PERSONNAGE_MORTS:
      case EvenementDeGroupe.INFO_MORT_CAPITAINE:
      case EvenementDeGroupe.INFO_SUCCESSEUR:
      case EvenementDeGroupe.INFO_VILLAGEOIS_VILLAGEOIS:
      case EvenementDeGroupe.INFO_TRANCHER_CAPITAINE:
      case EvenementDeGroupe.MORT_AMOUREUX:
      case EvenementDeGroupe.INFO_CHOIX_CHASSEUR:
      case EvenementDeGroupe.OURS_GROGNE:
      case EvenementDeGroupe.MONTRER_VIVANTS:
      case EvenementDeGroupe.CORBEAU:
      case EvenementDeGroupe.INFO_SERVANTE_DEVOUEE:
      case EvenementDeGroupe.INFO_INSTITUTRICE:
      case EvenementDeGroupe.GRAND_MECHANT_LOUP_PERDRE_POUVOIR:{
        evenementTexte = this.historiqueEvenements.pop()!;
        break;
      }
      case EvenementDeGroupe.INFO_VOTES:
      case EvenementDeGroupe.CHOIX_CAPITAINE:
      case EvenementDeGroupe.MORT_VOTES:{
        evenementTexte = this.historiqueEvenements.pop()!;
        if(this.communicationService.isMeneurDeJeu && this.communicationService.isUnMeneurDeJeu){
          evenementTexte = this.historiqueEvenements.pop()!;
        }
        break;
      }
      case EvenementDeGroupe.RESULTATS_VOTES:{
        this.audioService.jouerResultatVote();
        evenementTexte.push("Résultat des votes");
        break;
      }
      case EvenementDeGroupe.VICTOIRE:{
        this.communicationService.getVictoire().subscribe((victoire: Victoire)=>{
          if(!this.communicationService.isUnMeneurDeJeu || this.communicationService.isMeneurDeJeu){
            this.audioService.jouerVictoire();
          }
          evenementTexte.push(this.getTexteVictoire(+victoire));
        })
        break;
      }
      case EvenementIndividuel.CHANGER_JOUEUR:{
        this.communicationService.getInfoJoueurPresent().subscribe((joueur: Joueur)=>{
          evenementTexte.push("Passez l'appareil à "+joueur.nom);
        });
        break;
      }
      case EvenementIndividuel.MONTRER_TOUT_LE_MONDE:{
        evenementTexte.push("Montrez l'appareil à tout le monde");
        break;
      }
      case EvenementDeGroupe.INTRO:{
        evenementTexte.push("Regardez votre personnage et votez pour un capitaine.");
        break;
      }
      case EvenementDeGroupe.JOUER_JOUR:{
        evenementTexte.push("Faites votre vote du jour");
        break;
      }
      case EvenementIndividuel.INFO_AMOUREUX:{
        this.communicationService.getInfoJoueurPresent().subscribe((joueur:Joueur)=>{
          evenementTexte.push("Vous êtes en amour avec "+ joueur.amoureux+". Vous devez désormais gagner seul avec votre amoureux. Si l'un de vous est éliminé, l'autre le sera aussi par amour.");
        })
        break;
      }
      case EvenementIndividuel.INFO_INFECTE:{
        this.communicationService.getInfoJoueurPresent().subscribe((joueur:Joueur)=>{
          if(joueur.equipeReelle == Equipe.INDEPENDANT) {
            evenementTexte.push("Vous avez été infecté par l'infect Père des loups. Vous participerez désormais à la chasse nocturne des loup-garous. Cependant, votre objectif n'est pas de gagner avec eux.");
          } else {
            evenementTexte.push("Vous avez été infecté par l'infect Père des loups. Vous êtes désormais un loup-garou.");
          }
        })
        break;
      }
      case EvenementIndividuel.INFO_HYPNOTISER:{
        evenementTexte.push("Vous avez été hypnotisé. Votre vote du jour sera le même que l'hypnotiseur, s'il ne vote pas pour vous-même.");
        break;
      }
      case EvenementIndividuel.RECUPERER_SORT_MORTEL_SORCIERE:{
        evenementTexte.push("Les loup-garous ont éliminé le joueur sur lequel vous avez utilisé votre sort mortel. Vous récupérez donc votre sort.");
        break;
      }
      case EvenementDeGroupe.INFO_CHASSEUR_MORT:{
        evenementTexte.push("Le chasseur a été éliminé. Il va donc choisir une cible à éliminer aussi.");
        break;
      }
      case EvenementIndividuel.INFO_CHARMER:{
        evenementTexte.push("Vous avez été charmé.");
        break;
      }
      case EvenementIndividuel.INFO_ASSOCIER_MORT:{
        evenementTexte.push("Votre associé a été élimininé. Vous êtes maintenant un loup-garou");
        break;
      }
      case EvenementIndividuel.JOUER_RENARD:{
        this.communicationService.getReponseRenard().subscribe((reponseRenard: boolean) => {
          if(reponseRenard) {
            evenementTexte.push("Il y a un loup-garou parmi ces trois joueurs!");
          }
          else {
            evenementTexte.push("Il n'y a pas de loup-garou parmi ces trois joueurs.");
          }
        });
        break;
      }
      case EvenementDeGroupe.MONTRER_POINTS_VICTOIRES:{
        this.communicationService.getInfosPointsDeVictoire().subscribe((infos: InfoPointsDeVictoire[]) => {
            infos.forEach((info: InfoPointsDeVictoire)=>{
              evenementTexte.push(info.nom + " a gagné "+info.pointsGagnes + " point" + ((info.pointsGagnes > 1)?"s":"")+".");
            })
        });
        break;
      }
      case EvenementDeGroupe.INFO_CHEVALIER_A_LEPEE_ROUILLEE:{
        evenementTexte.push("Le Chevalier À l'Épée Rouillée est éliminé. Le premier loup garou à sa gauche va mourir la prochaine nuit.");
        break;
      }
      case EvenementIndividuel.INFO_PATATE_CHAUDE:{
        this.communicationService.getInfoJoueurPresent().subscribe((joueur: Joueur)=>{
          if(joueur.role === Role.CORBEAU){
            evenementTexte.push("Vous avez reçu la patate chaude. Votre pouvoir ne fonctionnera pas cette nuit. Votre cible sera choisie au hasard.");
          } else {
            evenementTexte.push("Vous avez reçu la patate chaude. Votre pouvoir ne fonctionnera pas cette nuit.");
          }
        });
        break;
      }
      case EvenementIndividuel.INFECT_PERE_RECUPERER_POUVOIR:{
        evenementTexte.push("La personne que vous avez infectée est aussi morte pendant la nuit. Vous récupérez votre pouvoir d'infection.");
        break;
      }
      case EvenementDeGroupe.MOMENTS_FORTS_INFO:{
        evenementTexte.push("Moments forts du jeu");
        break;
      }
      case EvenementIndividuel.CACHER_APPAREIL:{
        evenementTexte.push("Cachez votre écran des autres joueurs, votre personnage sera dévoilé.");
        break;
      }
      case EvenementDeGroupe.INTRO_HISTOIRE:{
        this.audioService.jouerIntro();
        this.communicationService.getIntroHistoire().subscribe((response: string)=>{
          evenementTexte.push(response)
        })
        break;
      }
      case EvenementDeGroupe.MOMENTS_FORTS:{
        this.communicationService.getUnMomentFort().subscribe((moment: MomentFort)=>{
          switch (moment.type){
            case MomentFortType.VOYANTE:
              evenementTexte.push("La Voyante, soit "+moment.params[0]+", a vu que "+ moment.params[1]+" était "+utils.convertirRoleTexte(moment.params[2])+".")
              break;
            case MomentFortType.LOUP_BLANC_ACCUSE:
              evenementTexte.push("Un joueur de l'équipe des loups, soit "+moment.params[0]+", a accusé le Loup-Garou Blanc, soit "+ moment.params[1]+".");
              break;
            case MomentFortType.FEMME_DE_MENAGE:
              evenementTexte.push("La Femme de ménage, soit "+moment.params[0]+", s'est échappée des loups-garous en se cachant chez "+ moment.params[1]+ ".");
              break;
            case MomentFortType.SORCIERE_PROTEGER:
              if(moment.params[2]){
                evenementTexte.push("La Sorcière, soit "+moment.params[0]+", s'est sauvée des loups-garous en se protégeant elle même.")
              } else{
                evenementTexte.push("La Sorcière, soit "+moment.params[0]+", a permis à "+ moment.params[1]+ " de se protéger des loups-garous.");
              }
              break;
            case MomentFortType.SORCIERE_SORT_MORT:
              evenementTexte.push("La Sorcière, soit "+moment.params[0]+", a utilisé son sort de mort pour éliminer "+moment.params[1]+".")
              break;
            case MomentFortType.HYPNOTISEUR_LOUP:
              evenementTexte.push("L'Hypnotiseur, soit "+moment.params[0]+", a forcé un loup-garou, soit "+moment.params[1]+", à voter contre un autre loup: "+moment.params[2]+".")
              break;
            case MomentFortType.HYPNOTISEUR_AMOUREUX:
              evenementTexte.push("L'Hypnotiseur, soit "+moment.params[0]+", a forcé "+moment.params[1]+" à voter contre son amoureux: "+moment.params[2]+".")
              break;
            case MomentFortType.HYPNOTISEUR_INFECTE_VILLAGEOIS:
              evenementTexte.push("L'Hypnotiseur infecté, soit "+moment.params[0]+", a forcé un villageois, soit "+moment.params[1]+" à voter contre un autre villageois: "+moment.params[2]+".")
              break;
          }
        })
        break;
      }
      default:{
        evenementTexte = ["Aucun evenement trouvé"]
      }
    }
    this.textePrincipal = evenementTexte;
    this.cdRef.detectChanges();
  }

  ok(){
    this.eteindreSocket();
    if(+this.infoEvenement!.evenement == EvenementDeGroupe.INTRO_HISTOIRE){
      this.audioService.jouerJour();
      this.communicationService.jour = true;
    }
    this.router.navigate(["jeuComponent"]);
  }

  passer(){
    this.eteindreSocket();
    this.socket.emit("passer");
    this.router.navigate(["jeuComponent"]);
  }

  private getTexteVictoire(victoire: Victoire): string{
    switch(victoire){
      case Victoire.LOUP_GAROU: return "Les Loups-Garous remportent la partie !!!";
      case Victoire.VILLAGEOIS: return "Les Villageois remportent la partie !!!";
      case Victoire.AMOUREUX: return "Les amoureux remportent la partie !!!";
      case Victoire.JOUEUR_DE_FLUTE: return "Le Joueur de Flûte remporte la partie !!!";
      case Victoire.LOUP_BLANC: return "Le Loup-Garou Blanc remporte la partie !!!";
      case Victoire.PERSONNE: return "Personne ne gagne la partie!";
      case Victoire.AUCUN: return "Pas supposé arriver ici.";
    }
  }

  switchInfoAppareil(): void {
    this.isInfoAppareil=!this.isInfoAppareil;
  }

}
