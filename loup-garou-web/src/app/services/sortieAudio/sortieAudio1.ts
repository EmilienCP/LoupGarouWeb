import { ASortieAudio } from "./AsortieAudio";

export class SortieAudio1 extends ASortieAudio{
    audio: HTMLAudioElement;
    audioMediaSource: MediaElementAudioSourceNode;
    audioFilter: BiquadFilterNode;

    constructor(audioContext: AudioContext){
        super(audioContext);
        this.audio = new Audio();
        this.audio.crossOrigin = "anonymous";
        this.audioMediaSource = this.audioContext.createMediaElementSource(this.audio);
        const analyser = this.audioContext.createAnalyser();
        analyser.fftSize = 256;
        this.audioFilter = this.audioContext.createBiquadFilter();
        this.audioFilter.type = 'lowpass';
        this.audioFilter.frequency.value = 20000;
        this.audioMediaSource.connect(this.audioFilter);
        this.audioFilter.connect(analyser);
        analyser.connect(this.audioContext.destination);
    }

    override play(): void {
        this.audio.play();
    }
    override pause(): void {
        this.audio.pause();
    }
    override stop(): void {
        this.audio.pause();
    }

    override preparerToune(path: string, timeUpdate: any, finished: any, logOutPut: any, logs:string[], titre: string): void {
        super.preparerToune(path, timeUpdate, finished, logOutPut, logs, titre);
        this.audio.src = path;
        this.audio.oncanplay = ()=>{
            logOutPut();
            this.audio.oncanplay = ()=>{};
            this.audio.onerror = ()=>{};
            this.audio.ontimeupdate = ()=>{
                timeUpdate();
            }
            finished();
        }
        this.tentativeLoad(this.audio, 4, logs);
    }

    private tentativeLoad(audio: HTMLAudioElement, nbTentatives: number, logs: string[]){
        audio.onerror = ()=>{
          logs.push("tentative load echouee reste "+nbTentatives + " link "+audio.src);
          if(nbTentatives>0){
            nbTentatives--;
            this.tentativeLoad(audio, nbTentatives, logs);
          } else {
            logs.push("tentative de load echouee")
          }
        }
        audio.load();
    }

    
    override paused(): boolean {
        return this.audio.paused;
    }

    override getCurrentTimeImp(): number{
        return this.audio.currentTime;
    }
    
    override setCurrentTimeImp(value: number, fctApresOnStop?: any): void{
        this.audio.currentTime = value;
        if(fctApresOnStop){
            fctApresOnStop();
        }
    }

    override setVolume(value: number): void{
        //console.log("volume", -((value-1)**2)+1, this.titre)
        this.audio.volume = -((value-1)**2)+1
        //this.audio.volume = value
    }

    override setFrequencyType(high: boolean): void{
        this.audioFilter.type = high? 'highpass': 'lowpass';
        console.log("type "+  this.audioFilter.type + " " + this.titre)
    }

    override setFrequencyValue(value: number): void{
        const milieu: number = 500;
        const max: number = 10000;
        if(value<0.5){
            console.log("frequence "+ milieu*value + " titre "+ this.titre)
            this.audioFilter.frequency.value = Math.floor(milieu*value*2);
        } else{
            console.log("frequence "+ ((max-milieu)*2*value-(max-milieu*2)) + " titre "+ this.titre)
            this.audioFilter.frequency.value = Math.floor((max-milieu)*2*value-(max-milieu*2));
        }
    }

    override setPlaybackRate(value: number): void{
        //console.log("playbackrate", value, this.titre);
        this.audio.playbackRate = value;
    }
    
    override setPitch(value: number): void{
        
    }

    override getPitch(): number{
        return -1;
    }

    override pitchable(): boolean{
        return false;
    }
    
}