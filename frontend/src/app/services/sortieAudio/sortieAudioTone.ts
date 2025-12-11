// // import * as Tone from "tone"
// import { ASortieAudio } from "./AsortieAudio";

// export class SortieAudioTone extends ASortieAudio{
//     audio: Tone.Player;
//     audioTime: HTMLAudioElement;
//     entrainDeJouer: boolean = false;
//     filter: Tone.Filter;
//     pitchshift: Tone.PitchShift;
//     idShedule: number = -1;
//     pitch: number = 0;

//     constructor(audioContext: AudioContext){
//         super(audioContext);
//         this.audio = new Tone.Player();
//         this.filter = new Tone.Filter(0, "highpass");
//         this.pitchshift = new Tone.PitchShift(0);
//         this.audioTime = new Audio();
//         this.audioTime.volume = 0;
//     }

//     override play(): void {
//         console.log("playyyy "+this.titre)
//         this.audio.disconnect();
//         this.audio.connect(this.filter);
//         this.filter.connect(this.pitchshift.toDestination())
//         this.audio.start(0, this.audioTime.currentTime);
//         this.audioTime.play();
//         this.entrainDeJouer = true;
//     }

//     override pause(): void {
//         console.log("pause " +this.titre)
//         if(this.entrainDeJouer){
//             this.audio.stop();
//             this.audioTime.pause();
//         }
//         this.entrainDeJouer = false;
//     }

//     override stop(): void {
//         console.log("stop " +this.titre)
//         if(this.entrainDeJouer){
//             this.audio.stop();
//             this.audioTime.pause();
//         }
//         this.entrainDeJouer = false;
//     }

//     override preparerToune(path: string, timeUpdate: any, finished: any, logOutPut: any, logs: string[], titre: string): void {
//         super.preparerToune(path, timeUpdate, finished, logOutPut, logs, titre);
//         console.log("lloooaaad " + this.titre)
//         this.audioTime.ontimeupdate = ()=>{};
//         this.audio = new Tone.Player(path);
//         this.audioTime.src = path;
//         this.audioTime.oncanplay = ()=>{
//             this.audioTime.oncanplay = ()=>{};
//             this.audioTime.onerror = ()=>{};
//             console.log("essayer1")
//             this.audio.load(path).then(() => {
//                 console.log("essayer2")
//                 logOutPut();
//                 this.audioTime.ontimeupdate = ()=>{
//                     timeUpdate();
//                 }
//                 finished();
//                 console.log("fait");
//             }, (reason)=>{
//                 console.log("erreur "+reason)
//             });
//         }
//         console.log("essaie load2")
//         this.tentativeLoad(this.audioTime, 4, logs);
//     }
//     private tentativeLoad(audio: HTMLAudioElement, nbTentatives: number, logs: string[]){
//         audio.onerror = ()=>{
//           logs.push("tentative load echouee reste "+nbTentatives + " link "+audio.src);
//           if(nbTentatives>0){
//             nbTentatives--;
//             this.tentativeLoad(audio, nbTentatives, logs);
//           } else {
//             logs.push("tentative de load echouee")
//           }
//         }
//         console.log("essaie load")
//         audio.load();
//     }

//     override paused(): boolean {
//         return !this.entrainDeJouer;
//     }
//     override getCurrentTimeImp(): number {
//         return this.audioTime.currentTime;
//     }
//     override setCurrentTimeImp(value: number, fctApresOnStop?: any): void {
//         //console.log("set current time "+ value + " titre "+this.titre)
//         if(this.entrainDeJouer){
//             this.audio.onstop = ()=>{
//                 this.audio.onstop = ()=>{};
//                 this.audio.start(0, value);
//                 if(fctApresOnStop){
//                     fctApresOnStop();
//                 }
//             }
//             this.audio.stop();
//         }
//         this.audioTime.currentTime = value;
//     }
//     override setVolume(value: number): void {
//         console.log("set volume "+ 10*Math.log10(value) + " titre "+this.titre)
//         this.audio.volume.value = 10*Math.log10(value);
//     }
//     override setFrequencyType(high: boolean): void {
//         //console.log("type frequence "+ high + " titre "+ this.titre)
//         this.filter.type = high? "highpass":"lowpass"
//     }
//     override setFrequencyValue(value: number): void {
//         const milieu: number = 500;
//         const max: number = 10000;
//         if(value<0.5){
//             //console.log("frequence "+ milieu*value + " titre "+ this.titre)
//             this.filter.frequency.value = milieu*value*2;
//         } else{
//             //console.log("frequence "+ ((max-milieu)*2*value-(max-milieu*2)) + " titre "+ this.titre)
//             this.filter.frequency.value = (max-milieu)*2*value-(max-milieu*2);
//         }
//     }
//     override setPlaybackRate(value: number): void {
//         //console.log("rate "+ value+ " titre "+ this.titre)
//         this.audioTime.playbackRate = value;
//         this.audio.playbackRate = value;
//         this.ajustPitchPlayBackRate();
//     }
    
//     override setPitch(value: number): void{
//         //console.log("pitch "+ value+ " titre "+ this.titre)
//         this.pitch = value
//         this.ajustPitchPlayBackRate();
//     }

//     private ajustPitchPlayBackRate(): void{
//         //console.log("ajust " +this.pitch + " "+ (-(12/(Math.log(2)/Math.log(12)))*Math.log(this.audio.playbackRate)/Math.log(12)));
//         this.pitchshift.pitch = this.pitch-(12/(Math.log(2)/Math.log(12)))*Math.log(this.audio.playbackRate)/Math.log(12);
//     }

//     override getPitch(): number{
//         return this.pitch;
//     }

//     override pitchable(): boolean{
//         return true;
//     }
// }
