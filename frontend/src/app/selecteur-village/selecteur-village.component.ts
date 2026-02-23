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
    return this.communicationService.infoPartie.village[index].amoureux != undefined && this.evenement != EvenementIndividuel.VOTER_CAPITAINE;
  }

  estCharme(index: number): boolean{
    return this.communicationService.infoPartie.village[index].estCharmer && this.evenement != EvenementIndividuel.VOTER_CAPITAINE;
  }

  estAssocie(index: number): boolean{
    return this.communicationService.infoPartie.village[index].estAssocier;
  }

  estEquipeLoups(index: number): boolean{
    return this.communicationService.infoPartie.village[index].equipeApparente == Equipe.LOUPS && this.evenement != EvenementIndividuel.VOTER_CAPITAINE && this.evenement != EvenementDeGroupe.ACCUSER;
  }

  estSoeur(index: number){
    return this.communicationService.infoPartie.village[index].estSoeur;
  }

  estFrere(index: number){
    return this.communicationService.infoPartie.village[index].estFrere;
  }

  estMort(index: number): boolean{
    return this.communicationService.infoPartie.village[index].estMort;
  }

  getNomRole(index: number): string{
    return utils.convertirRoleTexte(this.communicationService.infoPartie.village[index].role!);
  }

  imageRole(index: number): string{
    return utils.imageRole(this.communicationService.infoPartie.village[index].role!);
  }

  getNomRolePublic(index: number): string{
    return utils.convertirRolePublicTexte(this.communicationService.infoPartie.village[index].rolePublic!);
  }

  imageRolePublic(index: number): string{
    return utils.imageRolePublic(this.communicationService.infoPartie.village[index].rolePublic!);
  }
  
  estVillageoisVillageois(index: number): boolean{
    return this.communicationService.infoPartie.village[index].role == Role.VILLAGEOIS_VILLAGEOIS;
  }

  isRole(index: number): boolean{
    return this.communicationService.infoPartie.village[index].role != undefined;
  }  
  
  isRolePublic(index: number): boolean{
    return this.communicationService.infoPartie.village[index].rolePublic != undefined;
  }

  selectionner(index: number){
    this.idJoueurSelectionne = index;
    if(this.raisonsPasVoter.length > 0){
      this.selection.emit(index);
    }
  }

  getClasseBouton(index: number): string{
    if(this.communicationService.infoPartie.village[index].estMort){
      return 'peutPasChoisirMort'
    }
    if(this.raisonsPasVoter.length == 0){
      return 'pasBouton'
    }
    return this.raisonsPasVoter[index] == RaisonPasVoter.AUCUN?'peutChoisir':'peutPasChoisir'
  }

  getClasseBoutonCercle(index: number): string{
    return this.getClasseBouton(index) + "Cercle";
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
    const deltaAngle: number = 2*Math.PI/this.communicationService.infoPartie.village.length;
    const angleActuel: number = -deltaAngle*(index-indexJoueurPresent);
    return "transform: rotate("+angleActuel+"rad);";
  }

  getLeftCercle(index: number): string{
    const indexJoueurPresent: number = this.getIndexJoueurPresent();
    const deltaAngle: number = 2*Math.PI/this.communicationService.infoPartie.village.length;
    const angleActuel: number = -deltaAngle*(index-indexJoueurPresent) + Math.PI/2;
    const valeur: number = Math.cos(angleActuel)*46 +46;
    return "left: "+valeur+"%;";
  }

  getTopCercle(index: number): string{
    const indexJoueurPresent: number = this.getIndexJoueurPresent();
    const deltaAngle: number = 2*Math.PI/this.communicationService.infoPartie.village.length;
    const angleActuel: number = -deltaAngle*(index-indexJoueurPresent) + Math.PI/2;
    const valeur: number = Math.sin(angleActuel)*46+46;
    return "top: "+valeur+"%;";
  }

  private getIndexJoueurPresent(): number{
    return this.communicationService.infoPartie.village.indexOf(this.communicationService.infoPartie.village.filter((joueur: Joueur)=>{return joueur.soiMeme})[0])
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
