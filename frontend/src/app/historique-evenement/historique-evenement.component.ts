import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-historique-evenement',
  templateUrl: './historique-evenement.component.html',
  styleUrls: ['./historique-evenement.component.css']
})
export class HistoriqueEvenementComponent implements OnInit {

  @Input() historiqueEvenements: string[][] = [];
  
  constructor() { }

  ngOnInit(): void {
  }

}
