import { Component, Input, OnInit } from '@angular/core';
import { Joueur, Role } from '../../../../common/Joueur';
import { CommunicationService } from '../services/communication.service';
import * as utils from "../services/fontionsUtiles";

@Component({
  selector: 'app-village-onglet',
  templateUrl: './village-onglet.component.html',
  styleUrls: ['./village-onglet.component.css']
})
export class VillageOngletComponent implements OnInit {

  @Input()rolesVivants: string[] = [];
  @Input()rolesMorts: string[] = [];
  @Input()rolesVivantsEnum: Role[] = [];
  @Input()rolesMortsEnum: Role[] = [];
  roleChoisi?: Role;
  
  constructor(public communicationService: CommunicationService) {

  }

  ngOnInit(): void {
  }

  fermerDescriptionRole(): void{
    this.roleChoisi = undefined;
  }

  voirRoleVivant(index: number): void{
    this.roleChoisi = this.rolesVivantsEnum[index];
  }

  voirRoleMort(index: number): void{
    this.roleChoisi = this.rolesMortsEnum[index];
  }

  imageRole(role: Role): string{
    return utils.imageRole(role);
  }

}
