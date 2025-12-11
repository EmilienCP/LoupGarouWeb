import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Joueur, Role, RolePublic } from '../../../../common/Joueur';
import { EvenementIndividuel } from '../../../../common/evenements';
import { CommunicationService } from '../services/communication.service';
import * as utils from '../services/fontionsUtiles';
import { animate, sequence, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-montrer-personnage',
  templateUrl: './montrer-personnage.component.html',
  styleUrls: ['./montrer-personnage.component.css'],
  animations:[
    trigger("carte", [
    transition(":enter",[
      sequence([
        style({transform: "rotate(0) scale(0.5)"}),
        animate("1.5s", style({transform: "rotate(1440deg) scale(1)"}))
      ])
    ])
  ]),
    trigger("texte", [
      transition(":enter",[
        sequence([
          style({transform: "translateY(-500px)"}),
          animate("1.5s", style({transform: "translateY(-500px)"})),
          animate("0.5s", style({transform: "translateY(0)"}))
        ])
      ])
  ])]
})
export class MontrerPersonnageComponent implements OnInit {

  rolePersonnage: string = "";
  texte: string = "";
  image: string = "loupBlanc.jpg";
  description: boolean = false;
  role?: Role|RolePublic;

  constructor(private communicationService: CommunicationService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params =>{
      let evenement: EvenementIndividuel = params["evenement"];
      this.texte = this.determinerTexteAfficherRole(evenement);
      this.obtenirRoleJoueur(evenement);
    }));
  }

  ok():void{
    this.router.navigate(["jeuComponent"]);
  }

  determinerTexteAfficherRole(evenement: EvenementIndividuel): string {
    switch(+evenement) {
      case EvenementIndividuel.MONTRER_PERSONNAGE:
      case EvenementIndividuel.MONTRER_PERSONNAGE_PUBLIC:
        return "Vous êtes ...";
      case EvenementIndividuel.JOUER_VOYANTE:
        return "Ce joueur est ...";
      default:
        return "Oups! Pas d'évènement trouvé pour l'étape montrer personnage !!"
    }
  }

  obtenirRoleJoueur(evenement: EvenementIndividuel): void {
    switch(+evenement) {
      case EvenementIndividuel.MONTRER_PERSONNAGE:
        this.communicationService.getInfoJoueurPresent().subscribe((joueur: Joueur)=>{
          this.rolePersonnage = utils.convertirRoleTexte(joueur.role!);
          this.image = utils.imageRole(joueur.role!);
          this.role = joueur.role
        })
        break;
      case EvenementIndividuel.MONTRER_PERSONNAGE_PUBLIC:
        this.communicationService.getInfoJoueurPresent().subscribe((joueur: Joueur)=>{
          this.rolePersonnage = utils.convertirRolePublicTexte(joueur.rolePublic!);
          this.image = utils.imageRolePublic(joueur.rolePublic!);
          this.role = joueur.rolePublic
        })
        break;
      case EvenementIndividuel.JOUER_VOYANTE:
        this.communicationService.getRoleVoyante().subscribe((role: Role)=>{
          this.rolePersonnage = utils.convertirRoleTexte(role);
          this.image = utils.imageRole(role);
          this.role = role;
        })
        break;
    }
  }

  i(): void{
    this.description = true;
  }

  fermerDescriptionRole(){
    this.description = false;
  }
}
