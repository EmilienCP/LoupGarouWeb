import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Role, RolePublic } from '../../../../common/Joueur';
import * as utils from '../services/fontionsUtiles';

@Component({
  selector: 'app-description-role',
  templateUrl: './description-role.component.html',
  styleUrls: ['./description-role.component.css']
})
export class DescriptionRoleComponent implements OnInit {

  nomRole: string = "";
  descriptionRole: string = "";
  imageRole: string = "";

  @Input() role?: Role|RolePublic;
  @Input() rolePublic: boolean = false;
  @Input() modeVillageoisVillageois: boolean = false;
  @Output() fermer = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit(): void {
    if(this.modeVillageoisVillageois){
      this.nomRole = "Mode Villageois-Villageois";
      this.descriptionRole = "Le mode Villageois-Villageois laisse en vie la premiere victime des loup-garous, en lui retirant son rôle, le transformant en villageois-villageois."
      this.imageRole = "villageois.png";
    } else{
      if(this.rolePublic){
        this.nomRole = utils.convertirRolePublicTexte(this.role! as RolePublic);
        this.descriptionRole = utils.descriptionRolePublic(this.role! as RolePublic);
        this.imageRole = utils.imageRolePublic(this.role! as RolePublic);
      }else{
        this.nomRole = utils.convertirRoleTexte(this.role! as Role, true);
        this.descriptionRole = utils.descriptionRole(this.role! as Role);
        this.imageRole = utils.imageRole(this.role! as Role);
      }
    }
  }

  retour(): void {
    this.fermer.emit();
  }

}
