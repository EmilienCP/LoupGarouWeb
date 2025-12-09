import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, HostListener, NgZone, OnInit, ViewChild } from '@angular/core';
import { CommunicationService } from '../services/communication.service';
import { SelecteurComponent } from '../selecteur/selecteur.component';
import { Joueur, Role } from '../../../../common/Joueur';
import { convertirRoleTexte } from '../services/fontionsUtiles';
import { InformationsComponent } from '../informations/informations.component';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { EvenementDeGroupe } from '../../../../common/evenements';
import { InfoEvenement } from '../../../../common/infoEvenement';
import { AttenteComponent } from '../attente/attente.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-jeu',
  templateUrl: './jeu.component.html',
  styleUrls: ['./jeu.component.css'],
  animations:[
    trigger('parent', [
      transition(':enter', [])
    ]),
    trigger("evenements", [
      state('deplacement', style({marginLeft: "{{marginFinal}}px"}), {params : { marginFinal: 0}}),
      state('0', style({marginLeft: "0%"})),
      state('1', style({marginLeft: "-100%"})),
      state('2', style({marginLeft: "-200%"})),
      transition("0 <=> 1", [animate("0.2s")]),
      transition("0 <=> 2", [animate("0.2s")]),
      transition("1 <=> 2", [animate("0.2s")]),
      transition("deplacement => *", [animate("0.2s")])
    ]),
    trigger("village", [
      state('deplacement', style({marginLeft: "{{marginFinal}}px"}), {params : { marginFinal: 0}}),
      state('0', style({marginLeft: "100%"})),
      state('1', style({marginLeft: "0%"})),
      state('2', style({marginLeft: "-100%"})),
      transition("0 <=> 1", [animate("0.2s")]),
      transition("0 <=> 2", [animate("0.2s")]),
      transition("1 <=> 2", [animate("0.2s")]),
      transition("deplacement => *", [animate("0.2s")])
    ]),
    trigger("historique", [
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
export class JeuComponent implements OnInit {

  @ViewChild('parent') myDiv?: ElementRef;
  
  indexOnglet: number = 0;
  infoVillage: Joueur[] = [];
  proprieteFondEcran: string = "background-image: url(../../assets/fondEcran.png);";
  joueursVivants: Joueur[] = [];
  joueursMorts: Joueur[] = [];
  rolesVivants: string[] = [];
  rolesMorts: string[] = [];
  rolesVivantsEnum: Role[] = [];
  rolesMortsEnum: Role[] = [];
  historiqueEvenements: string[][] = [];

  
  entrainDeDrag: boolean = false;
  positionInitialeX: number = 0;
  marginFinal: number = 0;

  permetOnglets: boolean = true;
  private routerSub?: Subscription;

  constructor(private ngZone: NgZone,public communicationService: CommunicationService, public router: Router, public route: ActivatedRoute) { }

  // handler popstate nommé, obligatoire pour removeEventListener
  private onPopState = (event: PopStateEvent) => {
    console.log('popstate intercepté');

    // Empêche le navigateur et Angular d'exécuter le retour
    event.preventDefault?.();
    event.stopImmediatePropagation?.();

    // Repousse l'état pour rester sur la même page
    history.pushState(null, '', window.location.href);
    alert("Retour arrière désactivé pendant la partie !");
  };


  ngOnInit(): void {
    // Ajout de deux états factices
    history.pushState(null, '', window.location.href);
    history.pushState(null, '', window.location.href);

    // Ajout du listener en mode capture (avant Angular)
    window.addEventListener('popstate', this.onPopState, true);

    // Deuxième couche : bloquer navigation Angular déclenchée par back
    this.routerSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        if ((event as any).navigationTrigger === 'popstate') {
          console.log('Navigation back Angular détectée, blocage');
          this.router.navigateByUrl(this.router.url, { replaceUrl: true });
          history.pushState(null, '', window.location.href);
        }
      }
    });
  }
  
  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
    window.removeEventListener('popstate', this.onPopState, true);
  }

  evenementsOnglet(){
    this.indexOnglet = 0;
  }

  villageOnglet(){
    this.indexOnglet = 1;
  }

  historiqueEvenement(){
    this.indexOnglet = 2;
  }

  getHeight(): string{
    if(this.communicationService.isMeneurDeJeu){
      return "height:100%;";
    }else {
      return "height:93%;";
    }
  }

  
  onActivate(component: any){
    this.permetOnglets = true;
    if(component instanceof SelecteurComponent && !this.communicationService.isMeneurDeJeu){
      this.communicationService.getInfoVillageVerite().subscribe((infoVillage: Joueur[])=>{
        this.joueursVivants = infoVillage;
        this.rolesVivantsEnum = this.joueursVivants.map((joueur: Joueur)=>{
          return joueur.role!
        }).sort((a,b) => a-b);
        this.rolesVivants = this.rolesVivantsEnum.map((role: Role)=>{
          return convertirRoleTexte(role);
        })
      })
      this.communicationService.getInfoVillageMort().subscribe((infoVillageMort: Joueur[])=>{
        this.joueursMorts = infoVillageMort;
        this.rolesMortsEnum = this.joueursMorts.map((joueur: Joueur)=>{
          return joueur.role!;
        }).sort(((a,b) => a-b));
        this.rolesMorts = this.rolesMortsEnum.map((role: Role)=>{
          return convertirRoleTexte(role);
        })
      })
    }
    if(component instanceof InformationsComponent){
      this.route.queryParams.subscribe(params =>{
        if(JSON.parse(params["infoEvenement"]) && (JSON.parse(params["infoEvenement"]) as InfoEvenement).evenement == EvenementDeGroupe.INTRO_HISTOIRE){
          this.permetOnglets = false;
        }
      })
      this.communicationService.getHistoriqueEvenements().subscribe((historique: string[][])=>{
        this.historiqueEvenements = historique;
      })
    }
    this.ngZone.runOutsideAngular(()=>{
      let nouvellePropriete: string = "";
      if(component.urlImage){
        nouvellePropriete += "background-image: url("+component.urlImage+");"
      }
      if(component.couleurFond){
        nouvellePropriete += "background-color:"+component.couleurFond+";"
      }
      if(nouvellePropriete == ""){
        if(this.communicationService.jour){
          nouvellePropriete += "background-image: url('../../assets/soleilTentative8.jpg');"
        } else {
          nouvellePropriete += "background-image: url('../../assets/soleilTentative0.jpg');"
        }
      }
      this.proprieteFondEcran = nouvellePropriete;
    })
  }

  mouseDown(event: any){
    if(this.permetOnglets && !this.communicationService.isMeneurDeJeu){
      this.entrainDeDrag = true;
      if(event.clientX){
        this.positionInitialeX = event.clientX;
      } else {
        this.positionInitialeX = event.touches[0].clientX;
      }
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
