import { Component, OnInit } from '@angular/core';
import { Calcul, Filtre, FiltrePersonnalise, Toune } from '../../../../common/toune';
import { AudiodjService } from '../services/audiodj.service';
import { CommunicationService } from '../services/communication.service';
import { SnackBarService } from '../services/snack-bar.service';

@Component({
  selector: 'app-djai',
  templateUrl: './djai.component.html',
  styleUrls: ['./djai.component.css']
})
export class DjaiComponent implements OnInit {

  couleurFond: string = "black"
  entrainDeJouer: boolean = false;
  pret: boolean = false;
  entrainDeLoad: boolean = false;
  filtreCache: Filtre[] = [];
  audioNouvelleToune: HTMLAudioElement;
  indexcurrentTime: number = 0;
  private audioKick: HTMLAudioElement;
  nouvelleToune?: Toune;
  ajoutToune: boolean = false;
  zoomStep:number = 1;
  zoomPlage: number[] = [20, 200];
  filtresPersonnalises: FiltrePersonnalise[];
  isModifierToune: boolean = false;


  constructor(public audioService: AudiodjService, private communicationService: CommunicationService, private snack: SnackBarService) {
    this.audioNouvelleToune = new Audio();
    this.audioKick = new Audio();
    this.filtresPersonnalises = [];
    this.filtresPersonnalises.push({
      nom: "Emilien",
      valeursFiltres:[0.8, 0.5, 0.5, 2022, 0, 0.5],
      importancesFiltres:[0.5, 0, 0, 0.3, 0.3, 0]
    })
    this.filtresPersonnalises.push({
      nom: "Latino Party",
      valeursFiltres:[0.8, 1, 0.5, 2022, 0, 0.1],
      importancesFiltres:[0.5, 1, 0.2, 0.7, 1, 0.1]
    })
    this.filtresPersonnalises.push({
      nom: "Party Retro",
      valeursFiltres:[0.7, 0.5, 0.5, 1995, 0.5, 0],
      importancesFiltres:[0.4, 0, 0.2, 1, 0, 0.5]
    })
  }

  ngOnInit(): void {
  //   this.filtreCache = [
  //     {nom: "Intensite", valeur: 0.5, importance: 0, min: 0, max: 1, pas: 0.01, calcul:Calcul.NORMAL},
  //     {nom: "Latino", valeur: 0.5, importance: 0, min: 0, max: 1, pas: 0.01, calcul:Calcul.NORMAL},
  //     {nom: "Karaoke", valeur: 0.5, importance: 0, min: 0, max: 1, pas: 0.01, calcul:Calcul.NORMAL},
  //     {nom: "Annee", valeur: 2022, importance: 1, min: 1950, max: 2022, pas: 1, calcul:Calcul.ANNEE},
  //     {nom: "Danse en ligne", valeur: 0.5, importance: 1, min: 0, max: 1, pas: 0.01, calcul:Calcul.NORMAL},
  //     {nom: "Electronic", valeur: 0.5, importance: 1, min: 0, max: 1, pas: 0.01, calcul:Calcul.NORMAL}
  //   ]
  //   this.setFiltrePersonnalise({target: {value:0}});
  //   this.audioService.filtres = this.filtreCache;
  //   this.audioService.onInit();
  // }

  // init(): void{
  //   this.audioService.init();
  //   this.attendrePret();
  // }

  // async attendrePret(){
  //   this.tentativePret(50);
  // }

  // tentativePret(tentative: number){
  //   setTimeout(()=>{
  //     this.pret = this.audioService.getPret();
  //     if(!this.pret){
  //       tentative--;
  //       if(tentative == 0){
  //         this.audioService.logs.push("fini dattendre");
  //       } else {
  //         this.tentativePret(tentative);
  //       }
  //     }
  //   }, 500);
  // }

  // jouer(): void{

  //   if(this.pret){
  //     if(!this.entrainDeJouer){
  //       this.audioService.jouerTheme();
  //       this.entrainDeJouer = true;
  //     } else {
  //       this.audioService.pause();
  //       this.entrainDeJouer = false;
  //     }
  //   } else {
  //     this.entrainDeLoad = true;
  //     this.init();
  //     this.attendrePret();
  //   }
  // }

  // appliquerFiltres(){
  //   this.audioService.filtres = this.filtreCache;
  //   this.audioService.rechangerNouveauFiltres();
  // }


  // ajouterToune(){
  //   this.ajoutToune = true;
  // }

  // modifierToune(){
  //   this.ajoutToune = true;
  //   this.isModifierToune = true;
  // }

  // loadToune(lien: string){
  //   const videoId: string = lien.split("v=")[1].split("&")[0];
  //   this.communicationService.convertMp3(videoId, false).subscribe((res: any)=>{
  //     const resultat = JSON.parse(res);
  //     if(resultat.dejaExistant){
  //       this.snack.showMessage('Cette vidéo est déjà dans la bd.');
  //     } else {
  //       this.nouvelleToune = {
  //         auComplet: true,
  //         caracteristiques: this.filtreCache.map((filtre: Filtre)=>{return [filtre.nom, 0]}),
  //         tempo: 100,
  //         temps:[0,5,10,15],
  //         temps0:0,
  //         tempsCles:[],
  //         titre: resultat.title,
  //         videoId: videoId,
  //         duration:resultat.duration,
  //         link: resultat.link,
  //         debut: false,
  //         pitch: resultat.pitch,
  //         loopChordsDebut: [],
  //         loopChordsFin: [],
  //         tempsLoopDebut: [0,0],
  //         tempsLoopFin: [0,0],
  //         tempsi: []
  //       }
  //       this.audioNouvelleToune.src = this.nouvelleToune.link!;
  //     }
  //   })
  }

  zoom(){
    this.zoomStep/=10;
    this.zoomPlage = [this.nouvelleToune!.tempo-this.zoomStep*100, this.nouvelleToune!.tempo+this.zoomStep*100]
  }

  dezoom(){
    this.zoomStep*=10;
    this.zoomPlage = [this.nouvelleToune!.tempo-this.zoomStep*100, this.nouvelleToune!.tempo+this.zoomStep*100]
  }

  jouerNouvelleToune(){
    this.audioNouvelleToune.ontimeupdate = ()=>{
      this.indexcurrentTime = this.convertCurrentTimeToIndex(this.audioNouvelleToune.currentTime);
    }
    this.jouerToune();
  }

  changerCurrentTime(event: any, currentTimeOrIndex: boolean){
    if(currentTimeOrIndex){
      this.audioNouvelleToune.currentTime = parseFloat((event.target.value as string).replace(",", ".")) as number;
      this.indexcurrentTime = this.convertCurrentTimeToIndex(this.audioNouvelleToune.currentTime);
    } else {
      this.audioNouvelleToune.currentTime = this.convertIndexToCurrentTime(this.indexcurrentTime);
    }
  }

  private jouerToune(){
    if(!this.entrainDeJouer){
      this.audioNouvelleToune.play();
      this.entrainDeJouer = true;
    } else {
      this.audioNouvelleToune.ontimeupdate=()=>{}
      this.audioNouvelleToune.volume = 1;
      this.audioNouvelleToune.currentTime = +this.audioNouvelleToune.currentTime.toPrecision(this.audioNouvelleToune.currentTime>10?(this.audioNouvelleToune.currentTime>100?6:5):4);
      this.audioNouvelleToune.pause();
      this.indexcurrentTime = this.convertCurrentTimeToIndex(this.audioNouvelleToune.currentTime);
      this.entrainDeJouer = false;
    }
  }

  convertIndexToCurrentTime(indexAPrendre: number): number{
    return this.nouvelleToune!.tempsi[Math.floor(indexAPrendre)]+(this.nouvelleToune!.tempsi[Math.floor(indexAPrendre+1)]-this.nouvelleToune!.tempsi[Math.floor(indexAPrendre)])*(indexAPrendre-Math.floor(indexAPrendre));
  }

  convertCurrentTimeToIndex(currentTime: number): number{
    let i = this.nouvelleToune!.tempsi.findIndex((value)=>{return value >= currentTime});
    i+=(currentTime-this.nouvelleToune!.tempsi[i])/(this.nouvelleToune!.tempsi[i+1]-this.nouvelleToune!.tempsi[i]);
    return i;
  }

  jouerRepere(index: number){
    if(!this.entrainDeJouer){
      this.audioNouvelleToune.currentTime = this.convertIndexToCurrentTime(this.nouvelleToune!.temps[index]);
      this.audioKick.src = "../../assets/707 Kick.mp3";
      let compteur = Math.floor(this.convertCurrentTimeToIndex(this.audioNouvelleToune.currentTime));
      this.audioNouvelleToune.ontimeupdate = ()=>{
        this.indexcurrentTime = this.convertCurrentTimeToIndex(this.audioNouvelleToune.currentTime);
        if(this.indexcurrentTime > compteur){
          compteur++;
          setTimeout(()=>{
            this.audioKick.play();
          }, (this.convertIndexToCurrentTime(Math.floor(this.indexcurrentTime+1))-this.audioNouvelleToune.currentTime)*1000)
        }
      }
      this.audioNouvelleToune.volume = 0.5
      this.jouerToune();
    } 
  }

  jouerLoop(debut: boolean){
    if(!this.entrainDeJouer){
      const tempsCourants: number[] = debut?this.nouvelleToune!.tempsLoopDebut!: this.nouvelleToune!.tempsLoopFin!;
      this.audioNouvelleToune.currentTime = this.convertIndexToCurrentTime(tempsCourants[0]);
      this.audioKick.src = "../../assets/707 Kick.mp3";
      let compteur = 0;
      let compteurloop = 0;
      this.audioNouvelleToune.ontimeupdate = ()=>{
        this.indexcurrentTime = this.convertCurrentTimeToIndex(this.audioNouvelleToune.currentTime);
        if(this.indexcurrentTime>tempsCourants[1]){
          this.audioNouvelleToune.currentTime = this.convertIndexToCurrentTime(tempsCourants[0]+this.indexcurrentTime-tempsCourants[1]);
          compteur-=(tempsCourants[1]-tempsCourants[0]);
        }
        if(this.indexcurrentTime > compteur){
          compteur++;
          setTimeout(()=>{
            this.audioKick.play();
          }, (this.convertIndexToCurrentTime(Math.floor(this.indexcurrentTime+1))-this.audioNouvelleToune.currentTime)*1000)
        }
      }
      this.audioNouvelleToune.volume = 0.5
      this.jouerToune();
    } 
  }

  set(index:number){
    this.nouvelleToune!.temps[index] = this.audioNouvelleToune.currentTime;
  }

  enregistrer(){
    // this.filtreCache.forEach((filtre: Filtre)=>{
    //   this.nouvelleToune!.caracteristiques[this.nouvelleToune!.caracteristiques.map((caract)=>{return caract[0]}).indexOf(filtre.nom)][1] = filtre.valeur;
    // })
    // if(this.nouvelleToune!.tempsLoopDebut![0] == 0 && this.nouvelleToune!.tempsLoopDebut![1] == 0){
    //   this.nouvelleToune!.tempsLoopDebut = undefined;
    // }
    // if(this.nouvelleToune!.tempsLoopFin![0] == 0 && this.nouvelleToune!.tempsLoopFin![1] == 0){
    //   this.nouvelleToune!.tempsLoopFin = undefined;
    // }
    // if(this.isModifierToune){
    //   const indexToune: number = this.audioService.toutesLesTounes.map((toune: Toune)=>{return toune.titre}).indexOf(this.nouvelleToune!.titre);
    //   console.log(this.audioService.toutesLesTounes);
    //   this.communicationService.modifierToune(this.nouvelleToune!, indexToune).subscribe(()=>{
    //     this.nouvelleToune = undefined;
    //     this.ajoutToune = false;
    //     this.zoomStep = 1;
    //     this.zoomPlage = [20, 200];
    //   });
    // } else {
    //   this.communicationService.creerToune(this.nouvelleToune!).subscribe(()=>{
    //     this.nouvelleToune = undefined;
    //     this.ajoutToune = false;
    //     this.zoomStep = 1;
    //     this.zoomPlage = [20, 200];
    //   });

    // }
  }

  mettreAJourTemps(event: any, index: number){
    this.nouvelleToune!.temps[index] = parseFloat((event.target.value as string).replace(",", ".")) as number;
  }

  mettreAJourTempsLoop(event: any, loopDebut: boolean, index: number){
    if(loopDebut){
      this.nouvelleToune!.tempsLoopDebut![index] = parseFloat((event.target.value as string).replace(",", ".")) as number;
    } else {
      this.nouvelleToune!.tempsLoopFin![index] = parseFloat((event.target.value as string).replace(",", ".")) as number;
    }
  }

  mettreAJourTempsCles(event: any, index: number){
    this.nouvelleToune!.tempsCles[index]=parseFloat((event.target.value as string).replace(",", ".")) as number;
    this.nouvelleToune!.tempsCles.sort((a:number,b:number)=>{return a-b});
  }

  setFiltrePersonnalise(event: any){
    this.filtreCache.forEach((filtre: Filtre, index: number)=>{
      filtre.valeur = this.filtresPersonnalises[event.target.value].valeursFiltres[index];
      filtre.importance = this.filtresPersonnalises[event.target.value].importancesFiltres[index];
    })
  }

  choisirToune(toune: Toune){
    // this.audioNouvelleToune.onerror = ()=>{
    //   this.audioService.logs.push("va chercher un nouveau link dune musique. titre="+toune.titre)
    //   this.communicationService.convertMp3(toune.videoId, true).subscribe((res: any)=>{
    //     const response = JSON.parse(res);
    //     if(response.link){
    //       this.nouvelleToune!.link = response.link
    //       this.audioNouvelleToune.src = this.nouvelleToune!.link!;
    //       this.audioNouvelleToune.load();
    //     }
    //   }, (err)=>{
    //     this.audioService.logs.push(err);
    //   })
    // }
    // console.log(toune);
    // this.nouvelleToune = toune;
    // if(!this.nouvelleToune.tempsLoopDebut){
    //   this.nouvelleToune.tempsLoopDebut = [0,0];
    // }
    // if(!this.nouvelleToune.tempsLoopFin){
    //   this.nouvelleToune.tempsLoopFin = [0,0];
    // }
    // if(!this.nouvelleToune.loopChordsDebut){
    //   this.nouvelleToune.loopChordsDebut = [];
    // }
    // if(!this.nouvelleToune.loopChordsFin){
    //   this.nouvelleToune.loopChordsFin = [];
    // }
    // this.audioNouvelleToune.src = this.nouvelleToune.link!;
    // this.filtreCache.forEach((filtre: Filtre)=>{
    //   const index = toune.caracteristiques.map((value:(string|number)[])=>{return value[0]}).indexOf(filtre.nom);
    //   filtre.valeur = +toune.caracteristiques[index][1];
    // })
  }

  remplirTemps(): void {
    const step: number = 60/this.nouvelleToune!.tempo;
    let currentTime: number = this.nouvelleToune!.temps0;
    let iTempsCle: number = 0;
    this.nouvelleToune!.tempsi = [];
    this.nouvelleToune!.tempsi.push(+currentTime.toPrecision(5));
    while(currentTime<this.audioNouvelleToune.duration){
      currentTime+=step;
      if(this.nouvelleToune!.tempsCles.length > 0 && this.nouvelleToune!.tempsCles[iTempsCle]<currentTime+step/2){
        currentTime = this.nouvelleToune!.tempsCles[iTempsCle];
        iTempsCle++;
      }
      this.nouvelleToune!.tempsi.push(+currentTime.toPrecision(5));
    }
  }

  ajouterTempsCle(){
    this.nouvelleToune!.tempsCles.push(this.audioNouvelleToune.currentTime);
    this.nouvelleToune!.tempsCles.sort((a:number,b:number)=>{return a-b});
  }

  retirerTempsCle(index: number){
    this.nouvelleToune!.tempsCles.splice(index,1);
  }

  retirerLoopChord(fin: number, index: number){
    if(fin == 0){
      this.nouvelleToune!.loopChordsDebut!.splice(index,1);
    } else {
      this.nouvelleToune!.loopChordsFin!.splice(index,1);
    }
  }

  ajouterLoopChord(fin: number){
    if(fin == 0){
      this.nouvelleToune!.loopChordsDebut!.push([0,0]);
    } else {
      this.nouvelleToune!.loopChordsFin!.push([0,0]);
    }
  }


}
