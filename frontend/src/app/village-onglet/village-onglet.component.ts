import { Component, Input, OnInit } from '@angular/core';
import { EtatsSpeciaux, Joueur, Role } from '../../../../common/Joueur';
import { CommunicationService } from '../services/communication.service';
import * as utils from "../services/fontionsUtiles";

@Component({
  selector: 'app-village-onglet',
  templateUrl: './village-onglet.component.html',
  styleUrls: ['./village-onglet.component.css']
})
export class VillageOngletComponent implements OnInit {

  roleChoisi?: Role;
  
  constructor(public communicationService: CommunicationService) {

  }

  ngOnInit(): void {
  }

  fermerDescriptionRole(): void{
    this.roleChoisi = undefined;
  }

  voirRoleVivant(index: number): void{
    if(Object.values(Role).includes(this.communicationService.infoPartie.rolesVivants[index] as Role)){
      this.roleChoisi = this.communicationService.infoPartie.rolesVivants[index] as Role;
    }
  }

  voirRoleMort(index: number): void{
    if(Object.values(Role).includes(this.communicationService.infoPartie.rolesMorts[index] as Role)){
      this.roleChoisi = this.communicationService.infoPartie.rolesMorts[index] as Role;
    }
  }

  imageRole(role: Role | EtatsSpeciaux): string{
    return utils.imageRole(role);
  }

  roleTexte(role: Role | EtatsSpeciaux): string{
    return utils.convertirRoleTexte(role, true);
  }

}
