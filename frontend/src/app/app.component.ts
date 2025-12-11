import { Component, Injectable, OnDestroy, OnInit } from '@angular/core';
import { CommunicationService } from './services/communication.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
@Injectable({
	providedIn: 'root'
})
export class AppComponent implements OnInit{
  title = 'loup-garou-web';
  constructor(private communicationService: CommunicationService){
  }

  ngOnInit(): void {
    this.communicationService.connectSocket();
  }
}
