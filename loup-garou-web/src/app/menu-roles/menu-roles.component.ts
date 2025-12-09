import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Role, RolePublic } from '../../../../common/Joueur';
import * as utils from '../services/fontionsUtiles';

@Component({
  selector: 'app-menu-roles',
  templateUrl: './menu-roles.component.html',
  styleUrls: ['./menu-roles.component.css']
})
export class MenuRolesComponent implements OnInit {

  nomsRoles: string[] = [];
  nomsRolesPublics: string[] = [];
  roleChoisi?: Role|RolePublic;
  rolePublic: boolean = false;
  images: string[] = [];
  imagesRolesPublics: string[] = [];

  constructor(private router: Router) {
    for(let i = 0; i<Object.keys(Role).length / 2; i++){
      this.nomsRoles.push(utils.convertirRoleTexte(i as Role, true));
      this.images.push(utils.imageRole(i));
    }
    for(let i = 0; i<Object.keys(RolePublic).length / 2; i++){
      this.nomsRolesPublics.push(utils.convertirRolePublicTexte(i as RolePublic));
      this.imagesRolesPublics.push(utils.imageRolePublic(i));
    }
  }

  ngOnInit(): void {
    
  }

  descriptionRole(i: number, rolePublic: boolean){
    this.roleChoisi = i;
    this.rolePublic = rolePublic;
  }

  fermerDescriptionRole(){
    this.roleChoisi = undefined;
  }

  retour(){
    this.router.navigate([""])
  }

}
