import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Joueur, Role } from '../../../../common/Joueur';
import { CommunicationService } from '../services/communication.service';
import { convertirRoleTexte, descriptionRole } from '../services/fontionsUtiles';

@Component({
  selector: 'app-info-village',
  templateUrl: './info-village.component.html',
  styleUrls: ['./info-village.component.css']
})
export class InfoVillageComponent implements OnInit {
  
  @Output() terminer = new EventEmitter<boolean>();
  joueursVivants: Joueur[] = [];
  joueursMorts: Joueur[] = [];
  rolesVivants: string[] = [];
  rolesMorts: string[] = [];
  rolesVivantsEnum: Role[] = [];
  rolesMortsEnum: Role[] = [];
  roleChoisi?: Role;
  constructor(private communicationService: CommunicationService, private route: ActivatedRoute) { }

  ngOnInit(): void {
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

  retour(): void{
    this.terminer.emit();
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

}
