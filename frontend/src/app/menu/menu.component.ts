import { AfterViewInit, Component, HostListener, NgZone, OnInit } from '@angular/core';
import { CommunicationService } from '../services/communication.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit, AfterViewInit {

  public innerWidth: any;
  public innerHeight: any;
  proprieteFondEcran = "background-image: url(../../assets/fondEcran.png);"
  constructor(private ngZone: NgZone, private communicationService: CommunicationService) { }


  ngOnInit() {
      this.innerWidth = window.innerWidth;
      this.innerHeight = window.innerHeight;
  }

  ngAfterViewInit(): void {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
  }

  getMarginLeft(): number{
    return (this.innerWidth-Math.min(this.innerWidth, innerHeight/1.12))/2
  }

  getMarginTop(): number{
    if(this.innerWidth*8/5 < this.innerHeight){
      return (this.innerHeight-this.innerWidth*8/5)/2
    }
    return 0;
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

  onActivate(component: any){
    this.ngZone.runOutsideAngular(()=>{
      let nouvellePropriete: string = ""
      if(component.urlImage){
        nouvellePropriete += "background-image: url("+component.urlImage+");"
      }
      if(component.couleurFond){
        nouvellePropriete += "background-color:"+component.couleurFond+";"
      }
      if(nouvellePropriete == ""){
        if(this.communicationService.jour){
          nouvellePropriete += "background-image: url('../../assets/soleilTentative8.jpg');"
        } else {
          nouvellePropriete += "background-image: url('../../assets/soleilTentative0.jpg');"
        }
      }
      this.proprieteFondEcran = nouvellePropriete;
    })
  }
}
