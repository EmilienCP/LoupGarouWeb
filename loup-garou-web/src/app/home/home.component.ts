import { Component, HostListener, Injectable, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators'
import { Socket } from 'socket.io-client';
import { CommunicationService } from '../services/communication.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
@Injectable()
export class HomeComponent implements OnInit {

  partie_commencee: boolean = false;
  socket: Socket;
  public innerWidth: any;
  public innerHeight: any;

  constructor(private router: Router, private communicationService: CommunicationService) {
    this.socket = this.communicationService.getSocket();
  }

  ngOnInit(): void {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
    this.router.events
    .pipe(filter((rs): rs is NavigationEnd => rs instanceof NavigationEnd))
    .subscribe(event => {
      if (
        event.id === 1 &&
        event.url === event.urlAfterRedirects 
      ) {
        if(event.url === "/djai"){
          this.partie_commencee = true;
          this.router.navigate(["djai"])
        } else if(event.url === "/historique"){
          this.partie_commencee = true;
          this.router.navigate(["historique"])
        } else if(event.url === "/2048"){
          this.partie_commencee = true;
          this.router.navigate(["2048"])
        } else{
          this.router.navigate([""])
        }
      }
    })
  }

  jouer(): void{
    this.partie_commencee = true;
  }



  ngAfterViewInit(): void {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
  }

  getMarginLeft(): number{
    return (this.innerWidth-Math.min(this.innerWidth, innerHeight/1.12))/2
  }

  getMaxHeight(): number{
    return this.innerWidth*8/5;
  }

  getFont(): number{
    return Math.min(this.innerWidth, innerHeight/1.12)/20
  }

  getBorderRadius(): number{
    return Math.pow(this.innerWidth/this.innerHeight,1/4)*35
  }
  
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
  }

}
