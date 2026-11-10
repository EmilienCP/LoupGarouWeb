import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { InfoAppareil } from '../../../../common/infoAppareil';
import { CommunicationService } from '../services/communication.service';

@Component({
  selector: 'app-appareil',
  styleUrl: './appareil.component.css',
  templateUrl: './appareil.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class AppareilComponent implements OnInit {
  @Input() appareil: InfoAppareil = { noms: [], pret: false, disconnect: false };
  @Output() termine: EventEmitter<boolean> = new EventEmitter<boolean>();
  constructor(public communicationService: CommunicationService) { }

  ngOnInit(): void {
  }  

  renommer(event: any, idJoueur: number){
    let nomJoueur: string = event.target.value;
    if(this.communicationService.infoPartie.noms.flat().includes(nomJoueur)){
      nomJoueur = nomJoueur + " (1)";
    }
    if(nomJoueur.length>40 || this.communicationService.infoPartie.noms.flat().includes(nomJoueur)){
      nomJoueur = nomJoueur.substring(0,40);
    }
    this.appareil.noms[idJoueur] = nomJoueur;
  }

  changerTexte(event: any){
    if(event.target.value.length > 30){
      event.target.value = event.target.value.slice(0, event.target.value.length-1)
    }
  }

  retirer(idJoueur: number): void{
    this.appareil.noms.splice(idJoueur,1);
  }

  ajouter(): void{
    let nomJoueur: string = "Joueur " + this.communicationService.infoPartie.appareils.reduce(
    (total, appareil) => total + appareil.noms.length,
    0
    );
    this.appareil.noms.push(nomJoueur);
  }

  ok(){
    this.termine.emit(true);
  }
}
