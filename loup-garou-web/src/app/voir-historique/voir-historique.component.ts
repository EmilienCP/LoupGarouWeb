import { Component, OnInit } from '@angular/core';
import { CommunicationService } from '../services/communication.service';

@Component({
  selector: 'app-voir-historique',
  templateUrl: './voir-historique.component.html',
  styleUrls: ['./voir-historique.component.css']
})
export class VoirHistoriqueComponent implements OnInit {

  infos: string = "";

  constructor(private communicationService: CommunicationService) { }

  ngOnInit(): void {
    this.communicationService.voirHistorique().subscribe((historique: string)=>{
      this.infos = historique;
    })
  }

}
