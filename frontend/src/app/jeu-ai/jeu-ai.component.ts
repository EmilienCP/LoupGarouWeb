import { Component, HostListener, OnInit } from '@angular/core';
import { delay } from 'rxjs';

@Component({
  selector: 'app-jeu-ai',
  templateUrl: './jeu-ai.component.html',
  styleUrls: ['./jeu-ai.component.css']
})
export class JeuAIComponent implements OnInit {

  public grille: number[][];
  public grilleFuture: number[][];
  public mort: boolean = false;
  public automatique: boolean = false;

  constructor() { 
    this.grille = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]
    this.grilleFuture = this.grille;
  }

  initialiser(){
    this.grille = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]
    this.grilleFuture = this.grille;
    this.ajouterValeurHasard();
    this.ajouterValeurHasard();

  }

  ajouterValeurHasard(){
    let i: number;
    let j: number;
    do{
      i = Math.floor(Math.random()*4);
      j = Math.floor(Math.random()*4);
    }
    while(this.grille[i][j] != 0);
    this.grille[i][j] = (Math.random()<(1/4))?4:2;
    if(this.voirSiMort()){
      this.mort = true;
    }
  }

  voirSiMort(): boolean{
    return !this.grille.some((liste: number[], i: number)=>{
      return liste.some((valeur: number, j: number)=>{
        return i<3 && valeur == this.grille[i+1][j] ||
               j<3 && valeur == this.grille[i][j+1] || valeur == 0
      })
    })
  }

  droite(simulation: boolean): boolean{
    return this.bouger(true, true,simulation);
  }

  gauche(simulation: boolean): boolean{
    return this.bouger(true, false,simulation);
  }

  haut(simulation: boolean): boolean{
    return this.bouger(false, false,simulation);
  }

  bas(simulation: boolean): boolean{
    return this.bouger(false, true,simulation);
  }

  bouger(rangee:boolean, ascendant: boolean, simulation: boolean): boolean{
    this.grilleFuture = this.grille.map((liste: number[])=>{return liste.map((valeur: number)=>{return valeur})});
    let aEuDeplacement: boolean = false;
    for(let a: number = 0; a<4; a++){
      let listeABouger: number[] = ascendant?[2,1,0,2,1,0,2,1,0]:[1,2,3,1,2,3,1,2,3];
      let casesFusionnees: number[][] = []; 
      if(rangee){
        listeABouger.forEach((valeur: number)=>{
          let retour: number = this.mettreDans(a, valeur, a, valeur+(ascendant?1:-1), casesFusionnees);
          aEuDeplacement = retour!=2 || aEuDeplacement;
          if(retour == 1){casesFusionnees.push([a, valeur+(ascendant?1:-1)])}
          if(retour == 0 && casesFusionnees.find((cases: number[])=>{return cases[0] == a && cases[1] == valeur})){
            let index: number = casesFusionnees.indexOf(casesFusionnees.find((cases: number[])=>{return cases[0] == a && cases[1] == valeur})!);
            casesFusionnees[index][0] = a
            casesFusionnees[index][1] = valeur+(ascendant?1:-1);
          }
        })
      } else {
        listeABouger.forEach((valeur: number)=>{
          let retour: number = this.mettreDans(valeur, a, valeur+(ascendant?1:-1), a, casesFusionnees);
          aEuDeplacement = retour!=2 || aEuDeplacement;
          if(retour == 1){casesFusionnees.push([valeur+(ascendant?1:-1), a])}
          if(retour == 0 && casesFusionnees.find((cases: number[])=>{return cases[0] == valeur && cases[1] == a})){
            let index: number = casesFusionnees.indexOf(casesFusionnees.find((cases: number[])=>{return cases[0] == valeur && cases[1] == a})!);
            casesFusionnees[index][0] = valeur+(ascendant?1:-1)
            casesFusionnees[index][1] = a;
          }
        })
      }
    }
    if(aEuDeplacement && !simulation){
      this.grille = this.grilleFuture;
      this.ajouterValeurHasard();
    }

    return aEuDeplacement;
  }

  mettreDans(i: number, j: number, i2: number, j2: number, casesFusionnees: number[][]): number{
    if(this.grilleFuture[i2][j2] == 0){
      this.grilleFuture[i2][j2] = this.grilleFuture[i][j];
      this.grilleFuture[i][j] = 0;
      return 0;
    } else if( this.grilleFuture[i2][j2] == this.grilleFuture[i][j] && !casesFusionnees.some((cases: number[])=>{return (cases[0]==i2 && cases[1]==j2) ||(cases[0]==i && cases[1]==j)})){
      this.grilleFuture[i2][j2] = this.grilleFuture[i][j]*2;
      this.grilleFuture[i][j] = 0;
      return 1;
    }
    return 2;
  }

  jouerAI(test: boolean = false, logs: boolean = false): void{
    let droite: boolean = this.droite(true);
    let nbDroite = droite?this.calculerPoints():0;
    let gauche: boolean = this.gauche(true);
    let nbGauche = gauche?this.calculerPoints():0;
    let haut: boolean = this.haut(true);
    let nbHaut = haut?this.calculerPoints():0;
    let bas: boolean = this.bas(true);
    let nbBas = bas?this.calculerPoints():0;
    let valeurMax: number = Math.max(nbDroite, nbGauche, nbHaut, nbBas);
    if(logs){
      this.grilleFuture = this.grille;
      let pointsActuels: number =this.calculerPoints();
      console.log("gains et pertes:", "actuel", pointsActuels, "droite", nbDroite-pointsActuels, "gauche", nbGauche-pointsActuels, "haut", nbHaut-pointsActuels, "bas", nbBas-pointsActuels);
    }
    if(valeurMax == nbDroite){
      this.droite(test);
    }
    else if(valeurMax == nbGauche){
      this.gauche(test);
    }
    else if(valeurMax == nbHaut){
      this.haut(test);
    }
    else if(valeurMax == nbBas){
      this.bas(test);
    }
  }

  calculerPoints(): number{
    let pos: number[] = [3,0];
    let valeurCourante: number = this.grilleFuture[pos[0]][pos[1]];
    let valeurCase = 16;
    let points = 1;
    valeurCase--;
    let prochainpos: number[] = this.getCoordonnesDe(valeurCase);
    while(this.grilleFuture[pos[0]][pos[1]]<valeurCourante){
      pos = prochainpos;
      valeurCourante = this.grilleFuture[pos[0]][pos[1]];
      points++;
      valeurCase--;
      prochainpos = this.getCoordonnesDe(valeurCase);
    }
    console.log("points avant final", points, pos);
    points+= this.nbCasesAutourPlusPetite(pos)/4;
    console.log("points final", points);
    return points;
  }

  getCoordonnesDe(valeurCase: number): number[]{
    let matrice: number[][] = [[13,12,5,4],[14,11,6,3],[15,10,7,2],[16,9,8,1]];
    let i: number = matrice.indexOf(matrice.filter((liste: number[])=>{return liste.includes(valeurCase)})[0]);
    let j: number = matrice.filter((liste: number[])=>{return liste.includes(valeurCase)})[0].indexOf(valeurCase);
    return [i,j];
  }

  nbCasesAutourPlusPetite(pos: number[]): number{
    let valeur: number = this.grilleFuture[pos[0]][pos[1]];
    let distance1: number[][] = [[1,0],[0,1],[-1,0],[0,-1]];
    let valeurs: number[] = this.getValeurs(distance1.map((dist: number[])=>{return [pos[0]+dist[0], pos[1]+dist[1]]}));
    console.log("valeurs", valeurs);
    return valeurs.filter((val: number)=>{return val < valeur && val > -1}).length;
  }

  distanceMemeValeur(valeur: number, positionX: number, positionY: number): number{
    let distance1: number[][] = [[1,0],[0,1],[-1,0],[0,-1]];
    let valeurs: number[] = this.getValeurs(distance1.map((dist: number[])=>{return [positionX+dist[0], positionY+dist[1]]}));
    if(valeurs.includes(valeur)){
      return 1;
    }
    let distance2: number[][] = [[2,0],[0,2],[-2,0],[0,-2],[1,1],[-1,1],[1,-1],[-1,-1]];
    valeurs = this.getValeurs(distance2.map((dist: number[])=>{return [positionX+dist[0], positionY+dist[1]]}));
    if(valeurs.includes(valeur)){
      return 2;
    }
    let distance3: number[][] = [[3,0],[0,3],[-3,0],[0,-3],[2,1],[-2,1],[2,-1],[-2,-1],[1,2],[-1,2],[1,-2],[-1,-2]];
    valeurs = this.getValeurs(distance3.map((dist: number[])=>{return [positionX+dist[0], positionY+dist[1]]}));
    if(valeurs.includes(valeur)){
      return 4;
    }
    return 0;
  }

  getValeurs(positions:number[][]): number[]{
    let valeurs: number[] = [];
    positions.forEach((position: number[])=>{
      if(position[0]<0 || position[1]<0 ||position[0]>3 || position[1]>3){
        valeurs.push(-1);
      } else {
        valeurs.push(this.grilleFuture[position[0]][position[1]]);
      }
    })
    return valeurs
  }


  ngOnInit(): void {
    this.tests();
    this.initialiser();
  }

  @HostListener('document:keypress', ['$event'])
  async handleKeyboardEvent(event: KeyboardEvent) { 
    if(!this.mort){
      if(event.key == "d"){
        this.droite(false);
      }
      if(event.key == "a"){
        this.gauche(false);
      }
      if(event.key == "w"){
        this.haut(false);
      }
      if(event.key == "s"){
        this.bas(false);
      }
      
      if(event.key == "t"){
        this.automatique = !this.automatique;
        while(this.automatique && !this.mort){
          await new Promise( resolve => setTimeout(resolve, 1000) );
          this.jouerAI();
        }
      }
      if(event.key == "y"){
        this.jouerAI();
      }
    }
  }

  test(entree: number[][], sortie: number[][]){
    this.grille = entree;
    this.jouerAI(true);
    let reussi: boolean = true;
    this.grilleFuture.forEach((liste: number[], i: number)=>{
      liste.forEach((valeur: number, j: number)=>{
        if(valeur != sortie[i][j]){
          reussi = false;
        }
      })
    })
    if(!reussi){
      console.log("test echouer", "entree", entree, "sortie attendue", sortie, "sortie reelle", this.grilleFuture);
      this.jouerAI(true,true);
    } else {
      console.log("test reussi")
    }
  }

  tests(){
    this.test([[32,0,0,0],
               [32,0,0,0],
               [64,0,0,0],
               [128,0,0,0]],
              [[0,0,0,0],
               [64,0,0,0],
               [64,0,0,0],
               [128,0,0,0]])
    
  
    this.test([[0,0,0,0],
               [0,0,0,0],
               [4,4,0,0],
               [4,0,0,0]],
              [[0,0,0,0],
               [0,0,0,0],
               [0,0,0,0],
               [8,4,0,0]])
  }
}
