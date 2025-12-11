import { Injectable } from '@angular/core';
// import * as Tone from 'tone';
// import { Calcul, Filtre, Toune, Transition } from '../../../common/toune';
// import { CommunicationService } from './communication.service';
// import { Transitions } from './transitions/transition';
// import { Fondu } from './transitions/fondu';
// import { DivisionFrequences } from './transitions/divisionFrequences';
// import { LongueDivisionFrequences } from './transitions/longueDivisionFrequences';
// import { SwitchLow } from './transitions/switchLow';
// import { ASortieAudio } from './sortieAudio/AsortieAudio';
// import { SortieAudio2 } from './sortieAudio/sortieAudio2';
// import { SortieAudio1 } from './sortieAudio/sortieAudio1';
// import { LoopSwitchLow } from './transitions/loopSwitchLow';

@Injectable({
  providedIn: 'root'
})
export class AudiodjService {

//   private audioContext: AudioContext = new AudioContext()
//   private audio: ASortieAudio;
//   private audio2: ASortieAudio;
//   public toutesLesTounes: Toune[]=[]
//   private tounesRestantes: Toune[]= [];
//   private tounes: Toune[]= [];
//   private enpause: boolean[] = [false, false];
//   private pret: boolean[]= [false, false];
//   public logs: string[] = [];
//   public touneCourante?: Toune;
//   public prochaineToune?: Toune;

//   //filtres
//   filtres: Filtre[] = [];

//   constructor(private communicationService: CommunicationService) {
//     this.audio = new SortieAudio1(this.audioContext);
//     this.audio2 = new SortieAudio1(this.audioContext);
//   }

//   onInit(){
//     this.communicationService.getTounes().subscribe((tounes: Toune[])=>{
//       this.toutesLesTounes = tounes.slice(0, tounes.length);
//       console.log(this.tounes);
//       this.tounesRestantes = tounes;
//       this.tounes = this.tounes.sort(() => Math.random() - 0.5);
//       this.ajouter10Tounes();

//       let index: number = 0;
//       let touneEnPremier: Toune = this.tounes[index];
//       while(touneEnPremier.titre != "Alan Walker - The Spectre"){
//       //while(touneEnPremier.titre != "MAGIC SYSTEM - Magic In The Air Feat. Chawki [Clip Officiel]"){
//         index++;
//         touneEnPremier = this.toutesLesTounes[index];
//       }
//       if(this.tounes.includes(touneEnPremier)){
//         this.tounes.splice(this.tounes.indexOf(touneEnPremier), 1)
//       }
//       this.tounes.unshift(touneEnPremier);
//       index = 0;
//       touneEnPremier = this.tounes[index];
//       while(touneEnPremier.titre != "Dancing Line - The Amusement Park (Soundtrack)"){
//       //while(touneEnPremier.titre != "Khaled - C'est la vie (Clip officiel)"){
//         index++;
//         touneEnPremier = this.toutesLesTounes[index];
//       }
//       if(this.tounes.includes(touneEnPremier)){
//         this.tounes.splice(this.tounes.indexOf(touneEnPremier), 1)
//       }
//       this.tounes.unshift(touneEnPremier);
//       this.tounes[0].transition = Transition.LOOP_SWITCH_LOW;
//       this.tounes[1].transition = Transition.SWITCH_LOW;

//       this.tounes[0].debut = true;
//     })
    
//   }

//   init(){
//     // this.audio.src = "https://malpha.123tokyo.xyz/get.php/5/1e/H7rhMqTQ4WI.mp3?cid=MmEwMTo0Zjg6YzAxMDo5ZmE2OjoxfE5BfERF&h=mIbDaTJBYHYbMpB-T8qJSw&s=1704951341&n=Khaled%20-%20C%27est%20la%20vie%20%28Clip%20officiel%29";
//     // this.audio.load();
//     // fetch("https://dl.dropboxusercontent.com/s/1cdwpm3gca9mlo0/kick.mp3")
//     // // fetch("https://youtube-mp36.p.rapidapi.com/dl?id=H7rhMqTQ4WI")
//     // .then(resp => resp.arrayBuffer())
//     // .then(buf => this.audioContext.decodeAudioData(buf))
//     // .then(audioBuffer => {
//     //   const source = this.audioContext.createBufferSource();
//     //   source.buffer = audioBuffer;
//     //   //source.detune.value = 400;
//     //   source.playbackRate.value = 0.1;
//     //   source.loop = true;
//     //   source.start(0);
//     //   const streamNode = this.audioContext.createMediaStreamDestination();
//     //   source.connect(streamNode);
//     //   this.audio.controls = true;
//     //   document.body.appendChild(this.audio);
//     //   this.audio.srcObject = streamNode.stream;
//     //   this.audio.play();
//     //   console.log("play")
//     // })
//     // .catch(console.error);
//     this.preparerToune(0, this.audio);
//     this.preparerToune(1, this.audio2);
//     this.changerTitres(0)
//   }

//   getPret(): boolean{
//     return this.pret[0] && this.pret[1];
//   }

//   jouerTheme() {
//     console.log("jouer theme")
//     if(!this.enpause[0] && !this.enpause[1]){
//       this.audio.play();
//     }
//     if(this.enpause[0]){
//       this.enpause[0] = false;
//       this.audio.play();
//     }
//     if(this.enpause[1]){
//       this.enpause[1] = false;
//       this.audio2.play();
//     }
//   }

//   preparerToune(indexToune: number, audio: ASortieAudio): void{
//     if(this.tounes[indexToune+1] == undefined){
//       this.ajouter10Tounes();
//       if(this.tounes[indexToune] == undefined){
//         console.log("what")
//         return;
//       }
//     }
//     const toune: Toune = this.tounes[indexToune];
//     if(toune){
//       if(toune.link){
//         new Tone.Player(toune.link);
//         Tone.loaded().then(() => {
//           this.logs.push("tentative de load fonctionne. Commence a load pour vrai. titre="+toune.titre)
//           this.preparerTouneAvecPath(indexToune, audio, toune.link!);
//         }, ()=>{
//           this.logs.push("va chercher un nouveau link dune musique. titre="+toune.titre)
//           this.communicationService.convertMp3(toune.videoId, true).subscribe((res: any)=>{
//             const response = JSON.parse(res);
//             if(response.link){
//               toune.link = response.link
//               this.preparerTouneAvecPath(indexToune, audio, toune.link!);
//             }
//           }, (err)=>{
//             this.logs.push(err);
//             this.mettrePret(indexToune);
//           })
//         })
//       } else {
//         this.logs.push("va chercher un link dune nouvelle musique. titre="+toune.titre);
//         this.communicationService.convertMp3(toune.videoId, true).subscribe((res: any)=>{
//           const response = JSON.parse(res);
//           if(response.link){
//             toune.link = response.link
//             this.preparerTouneAvecPath(indexToune, audio, toune.link!);
//           }
//         }, (err)=>{
//           this.logs.push(err);
//           this.mettrePret(indexToune);
//         })
//       }
//     } else {
//       this.logs.push("tente de preparer une toune qui nexiste pas. Index: "+ indexToune)
//       this.mettrePret(indexToune);
//     }
//   }

//   private preparerTouneAvecPath(indexToune: number, audio: ASortieAudio, path: string): void{
//     const toune: Toune = this.tounes[indexToune];
//     console.log("nouvelleTransition")
//     let transitionCourante: Transitions;
//     console.log(toune.transition)
//     switch(toune.transition){
//       case Transition.FONDU:
//         transitionCourante = new Fondu(audio, this.audio, this.audio2, this.tounes, indexToune);
//         break;
//       case Transition.DIVISION_FREQUENCES:
//         transitionCourante = new DivisionFrequences(audio, this.audio, this.audio2, this.tounes, indexToune);
//         break;
//       case Transition.LONGUE_DIVISION_FREQUENCES:
//         transitionCourante = new LongueDivisionFrequences(audio, this.audio, this.audio2, this.tounes, indexToune);
//         break;
//       case Transition.SWITCH_LOW:
//         transitionCourante = new SwitchLow(audio, this.audio, this.audio2, this.tounes, indexToune);
//         break;
//       case Transition.LOOP_SWITCH_LOW:
//         transitionCourante = new LoopSwitchLow(audio, this.audio, this.audio2, this.tounes, indexToune);
//         break;
//     }
//     audio.preparerToune(path, ()=>{
//       const reponses: boolean[] = transitionCourante.timeUpdate(!this.enpause[(this.audio == audio)?1:0]);
//         if(reponses[0]){
//           this.changerTitres(indexToune+1);
//         }
//         if(reponses[1]){
//           this.preparerToune(indexToune+2, audio);
//         }
//     }, ()=>{
//       if(this.tounes[indexToune-1] !== undefined && this.tounes[indexToune-1].transition == Transition.LOOP_SWITCH_LOW){
//         audio.setCurrentTime(this.tounes[indexToune].tempsLoopDebut![0], this.tounes[indexToune]);
//       } else {
//         audio.setCurrentTime(this.tounes[indexToune].temps[0], this.tounes[indexToune]);
//       }
//       // if(this.tounes[indexToune].debut){
//       //   audio.setCurrentTime(315, this.tounes[indexToune]);
//       // }
//       this.mettrePret(indexToune);
//     }, ()=>{
//       this.logs.push("fini de load. Titre: "+this.tounes[indexToune].titre);
//     }, this.logs, this.tounes[indexToune].titre);
//   }

//   pause(): void{
//     if(!this.audio.paused()){
//       this.audio.pause();
//       this.enpause[0] = true;
//     }
//     if(!this.audio2.paused()){
//       this.audio2.pause();
//       this.enpause[1] = true;
//     }
//   }

//   tentativeLoad(audio: HTMLAudioElement, nbTentatives: number){
//     audio.onerror = ()=>{
//       this.logs.push("tentative load echouee reste "+nbTentatives + " link "+audio.src);
//       if(nbTentatives>0){
//         nbTentatives--;
//         this.tentativeLoad(audio, nbTentatives);
//       } else {
//         this.logs.push("tentative de load echouee")
//       }
//     }
//     audio.load();
//   }

//   mettrePret(indexToune: number):void{
//     if(indexToune ==0 || indexToune == 1){
//       this.pret[indexToune] = true;
//     }
//   }

//   rechangerNouveauFiltres(){
//     let indexTouneSuivante: number = this.tounes.indexOf(this.prochaineToune!);
//     this.tounesRestantes.push(...this.tounes.splice(indexTouneSuivante+1, this.tounes.length-1-(indexTouneSuivante+1)));
//     this.ajouter10Tounes();
//   }

//   ajouter10Tounes(){
//     if(this.tounesRestantes.length == 0){
//       return;
//     }
//     const tounesAuHasard: Toune[] = this.tounesRestantes.slice(0, this.tounesRestantes.length);
//     tounesAuHasard.sort(() => Math.random() - 0.5).filter((toune, index)=>{return index < 10});
//     const tounesEnOrdre: Toune[] = [];
//     let tounePossible: Toune|undefined = this.tounes.length > 0? this.tounes[this.tounes.length-1]:undefined;
//     let touneCourante: Toune = this.trouverProchaineToune(tounePossible, tounesAuHasard);
//     this.tounesRestantes.splice(this.tounesRestantes.indexOf(touneCourante),1)[0];
//     let tounePrecedente: Toune|undefined;
//     for(let i: number = 0; i<10; i++){
//       //Trouver sa transition
//       touneCourante.transition =Transition.SWITCH_LOW;
//       if(tounePrecedente){
//         if(touneCourante.tempsLoopDebut && tounePrecedente.tempsLoopFin){
//           tounePrecedente.transition = Transition.LOOP_SWITCH_LOW;
//         }
//       }


//       tounesEnOrdre.push(touneCourante);
//       if(this.tounesRestantes.length == 0){
//         break;
//       }
//       const touneChoisie = this.trouverProchaineToune(touneCourante, this.tounesRestantes);
//       this.tounesRestantes.splice(this.tounesRestantes.indexOf(touneChoisie),1)[0];
//       tounePrecedente = touneCourante;
//       touneCourante = touneChoisie;
//     }
//     this.tounes.push(...tounesEnOrdre);
//     console.log(this.tounes.map((toune)=>toune.titre))
//     console.log(this.tounes.map((toune)=>toune.transition))
//   }

//   private trouverProchaineToune(touneCourante: Toune|undefined = undefined, choix: Toune[]): Toune{
//     let rapprochementMax: number = 0;
//     let touneChoisie: Toune = this.tounes[0];
//     choix.forEach((toune: Toune)=>{
//       const rapprochement: number = this.calculerRapprochement(touneCourante, toune);
//       if(rapprochement > rapprochementMax){
//         rapprochementMax = rapprochement;
//         touneChoisie = toune;
//       }
//     })
//     return touneChoisie;
//   }

//   private changerTitres(indexToune: number): void{
//     this.touneCourante = this.tounes[indexToune];
//     if(this.tounes[indexToune+1]){
//       this.prochaineToune = this.tounes[indexToune+1];
//     } else {
//       this.prochaineToune = undefined;
//     }
//   }

//   calculerRapprochement(touneCourante: Toune|undefined = undefined, tounePotentielle: Toune): number{
//     let sommeTotale: number = 0;
//     this.filtres.forEach((filtre: Filtre)=>{
//       let rapprochement: number = 0;
//       let rapprochementFiltre: number = 0;
//       if(filtre.calcul == Calcul.NORMAL){
//         if(touneCourante){
//           rapprochement = 1-Math.abs(this.getCaract(touneCourante, filtre.nom)-this.getCaract(tounePotentielle, filtre.nom))
//         }
//         rapprochementFiltre = 1-Math.abs(filtre.valeur-this.getCaract(tounePotentielle, filtre.nom))
//       } else if(filtre.calcul == Calcul.ANNEE){
//         if(touneCourante){
//           rapprochement = Math.pow(1.01, -((this.getCaract(tounePotentielle, filtre.nom)-this.getCaract(touneCourante, filtre.nom))**2))
//         }
//         rapprochementFiltre = Math.pow(1.01, -((this.getCaract(tounePotentielle, filtre.nom)-filtre.valeur)**2))
//       }
      
//       sommeTotale+=rapprochement*(1-filtre.importance)+2*rapprochementFiltre*filtre.importance
//     })


//     //Tempo
//     let tempo: number = Math.random()*100+60;
//     if(touneCourante){
//       tempo = touneCourante.tempo;
//     }
//     const valeurDivision: number = Math.max(tounePotentielle.tempo, tempo)/Math.min(tounePotentielle.tempo, tempo);
//     const valeurDifference: number = valeurDivision-Math.floor(valeurDivision);
//     const rapprochementTempo: number = Math.abs((valeurDifference-0.5)*2);
//       sommeTotale+=rapprochementTempo*2;
//     return sommeTotale;
//   }

//   getCaract(toune: Toune, caract: String):number{
//     return toune.caracteristiques.filter((carac: (string|number)[])=>{
//       return carac[0] == caract;
//     })[0][1] as number
//   }
}
