import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Equipe, Joueur, JoueurExtensionLoups, Role, RolePublic } from '../../../../common/Joueur';
import { EvenementDeGroupe, EvenementIndividuel, RaisonPasVoter } from '../../../../common/evenements';
import * as utils from '../services/fontionsUtiles';
import { Socket } from 'socket.io-client';
import { CommunicationService } from '../services/communication.service';

@Component({
  selector: 'app-selecteur-village',
  templateUrl: './selecteur-village.component.html',
  styleUrls: ['./selecteur-village.component.css']
})
export class SelecteurVillageComponent implements OnInit {

  @Input() evenement: EvenementIndividuel|EvenementDeGroupe|undefined = undefined;
  @Input() nbVotes: number = 0;
  @Input() detailsVillage: boolean = false;
  @Input() messageAvertissement: string = "";
  @Input() infoVillageExtensionLoups: JoueurExtensionLoups[] = [];
  @Input() raisonsPasVoter: RaisonPasVoter[]=[];
  @Output() selection = new EventEmitter<number>();
  idJoueurSelectionne: number = -1;
  
  socket: Socket;

  constructor(public communicationService: CommunicationService) {
    this.socket = this.communicationService.getSocket();
  }

  ngOnInit(): void {}

  estAmoureux(index: number): boolean{
    return this.communicationService.infoVillage[index].amoureux != undefined && this.evenement != EvenementIndividuel.VOTER_CAPITAINE;
  }

  estCharme(index: number): boolean{
    return this.communicationService.infoVillage[index].estCharmer && this.evenement != EvenementIndividuel.VOTER_CAPITAINE;
  }

  estAssocie(index: number): boolean{
    return this.communicationService.infoVillage[index].estAssocier;
  }

  estEquipeLoups(index: number): boolean{
    return this.communicationService.infoVillage[index].equipeApparente == Equipe.LOUPS && this.evenement != EvenementIndividuel.VOTER_CAPITAINE && this.evenement != EvenementDeGroupe.ACCUSER;
  }

  estSoeur(index: number){
    return this.communicationService.infoVillage[index].estSoeur;
  }

  estFrere(index: number){
    return this.communicationService.infoVillage[index].estFrere;
  }

  getNomRole(index: number): string{
    return utils.convertirRoleTexte(this.communicationService.infoVillage[index].role!);
  }

  imageRole(index: number): string{
    return utils.imageRole(this.communicationService.infoVillage[index].role!);
  }

  getNomRolePublic(index: number): string{
    return utils.convertirRolePublicTexte(this.communicationService.infoVillage[index].rolePublic!);
  }

  imageRolePublic(index: number): string{
    return utils.imageRolePublic(this.communicationService.infoVillage[index].rolePublic!);
  }
  
  estVillageoisVillageois(index: number): boolean{
    return this.communicationService.infoVillage[index].role == Role.VILLAGEOIS_VILLAGEOIS;
  }

  isRole(index: number): boolean{
    return this.communicationService.infoVillage[index].role != undefined;
  }  
  
  isRolePublic(index: number): boolean{
    return this.communicationService.infoVillage[index].rolePublic != undefined;
  }

  selectionner(index: number){
    this.idJoueurSelectionne = index;
    if(this.raisonsPasVoter.length > 0){
      this.selection.emit(index);
    }
  }

  getClasseBouton(index: number): string{
    if(this.raisonsPasVoter.length == 0){
      return 'pasBouton'
    }
    return this.raisonsPasVoter[index] == RaisonPasVoter.AUCUN?'peutChoisir':'peutPasChoisir'
  }

  getClasseBoutonCercle(index: number): string{
    if(this.raisonsPasVoter.length == 0){
      return 'pasBoutonCercle'
    }
    return this.raisonsPasVoter[index] == RaisonPasVoter.AUCUN?'peutChoisirCercle':'peutPasChoisirCercle'
  }

  evenementAccusation(): boolean{
    return this.evenement != undefined && +this.evenement == EvenementDeGroupe.ACCUSER;
  }

  getBorder(index: number): string{
    if(this.idJoueurSelectionne == index){
      return 'border-style: solid; border-color: #441111; border-width: 3px;';
    }else if(+this.evenement! == EvenementIndividuel.JOUER_LOUP_GAROU && this.infoVillageExtensionLoups.length>0 && this.infoVillageExtensionLoups[index].joueursQuiLePointent!.length >0){
      return 'border-style: solid; border-color: yellow; border-width: 3px;';
    }
    return '';
  }

  getRotationCercle(index: number): string{
    const indexJoueurPresent: number = this.getIndexJoueurPresent();
    const deltaAngle: number = 2*Math.PI/this.communicationService.infoVillage.length;
    const angleActuel: number = -deltaAngle*(index-indexJoueurPresent);
    return "transform: rotate("+angleActuel+"rad);";
  }

  getLeftCercle(index: number): string{
    const indexJoueurPresent: number = this.getIndexJoueurPresent();
    const deltaAngle: number = 2*Math.PI/this.communicationService.infoVillage.length;
    const angleActuel: number = -deltaAngle*(index-indexJoueurPresent) + Math.PI/2;
    const valeur: number = Math.cos(angleActuel)*46 +46;
    return "left: "+valeur+"%;";
  }

  getTopCercle(index: number): string{
    const indexJoueurPresent: number = this.getIndexJoueurPresent();
    const deltaAngle: number = 2*Math.PI/this.communicationService.infoVillage.length;
    const angleActuel: number = -deltaAngle*(index-indexJoueurPresent) + Math.PI/2;
    const valeur: number = Math.sin(angleActuel)*46+46;
    return "top: "+valeur+"%;";
  }

  private getIndexJoueurPresent(): number{
    return this.communicationService.infoVillage.indexOf(this.communicationService.infoVillage.filter((joueur: Joueur)=>{return joueur.soiMeme})[0])
  }

  getNomsPointent(index: number): string{
    let texte: string = "";
    if(this.infoVillageExtensionLoups.length == 0 || this.infoVillageExtensionLoups[index].joueursQuiLePointent!.length==0){
      return "";
    }
    this.infoVillageExtensionLoups[index].joueursQuiLePointent!.forEach((joueur: string, i: number, liste: string[])=>{
      texte+=joueur;
      if(i < liste.length-2){
        texte+=", ";
      } else if(i == liste.length-2) {
        texte+=" et "
      }
    })
    texte+=this.infoVillageExtensionLoups[index].joueursQuiLePointent!.length>1?" pointent ce joueur":" pointe ce joueur";
    return texte;
  }
}
