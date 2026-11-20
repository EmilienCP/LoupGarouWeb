import * as Tone from "tone"
import { ASortieAudio } from "./AsortieAudio";

export class SortieAudioTone extends ASortieAudio{
    audio: Tone.Player;
    audioTime: HTMLAudioElement;
    entrainDeJouer: boolean = false;
    filter: Tone.Filter;
    pitchshift: Tone.PitchShift;
    idShedule: number = -1;
    pitch: number = 0;

    constructor(audioContext: AudioContext){
        super(audioContext);
        this.audio = new Tone.Player();
        this.filter = new Tone.Filter(0, "highpass");
        this.pitchshift = new Tone.PitchShift(0);
        this.audioTime = new Audio();
        this.audioTime.volume = 0;
    }

    override play(): void {
        console.log("playyyy "+this.titre)
        this.audio.disconnect();
        this.audio.connect(this.filter);
        this.filter.connect(this.pitchshift.toDestination())
        this.audio.start(0, this.audioTime.currentTime);
        this.audioTime.play();
        this.entrainDeJouer = true;
    }

    override pause(): void {
        console.log("pause " +this.titre)
        if(this.entrainDeJouer){
            this.audio.stop();
            this.audioTime.pause();
        }
        this.entrainDeJouer = false;
    }

    override stop(): void {
        console.log("stop " +this.titre)
        if(this.entrainDeJouer){
            this.audio.stop();
            this.audioTime.pause();
        }
        this.entrainDeJouer = false;
    }

    override async testLoad(): Promise<void>{
        const fetchapi = await fetch(`https://youtube-mp36.p.rapidapi.com/dl?id=H7rhMqTQ4WI`,{
           "method" : "GET",
           "headers": {
           "X-RapidAPI-Key" :"69c7797440msh13130e2ff8168efp1a4202jsnc726b844e1c5",
           "X-RapidAPI-Host": "youtube-mp36.p.rapidapi.com"
           }
        })

        const fetchresponse = await fetchapi.json();
        const response = await fetch(fetchresponse.link, {
        headers: {
            'X-RUN': 'e994b872595108c415676502bc806107'
        }
        });

        console.log('Status:', response.status);
        console.log('Content-Type:', response.headers.get('Content-Type'));

        if (!response.ok) {
        throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const blob = await response.blob();
        const audioUrl = URL.createObjectURL(blob);

        const audio = new Audio(audioUrl);
        await audio.play();
    }

    override preparerToune(path: string, timeUpdate: any, finished: any, logOutPut: any, logs: string[], titre: string): void {
        super.preparerToune(path, timeUpdate, finished, logOutPut, logs, titre);
        this.audioTime.ontimeupdate = ()=>{};

        this.audioTime.src = path;
        this.audioTime.oncanplay = ()=>{
            this.audioTime.oncanplay = ()=>{};
            this.audioTime.onerror = ()=>{};
            this.audio = new Tone.Player({
                url: path,
                autostart: false,
                onload: () => {
                    logOutPut();
                    this.audioTime.ontimeupdate = ()=>{
                        timeUpdate();
                    }
                    finished();
                    },
                onerror: (error) => {
                    console.error('Erreur de chargement :', error);
                }
            }).toDestination();
        }
        this.tentativeLoad(this.audioTime, 4, logs);
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
        return !this.entrainDeJouer;
    }
    override getCurrentTimeImp(): number {
        return this.audioTime.currentTime;
    }
    override setCurrentTimeImp(value: number, fctApresOnStop?: any): void {
        //console.log("set current time "+ value + " titre "+this.titre)
        if(this.entrainDeJouer){
            this.audio.onstop = ()=>{
                this.audio.onstop = ()=>{};
                this.audio.start(0, value);
                if(fctApresOnStop){
                    fctApresOnStop();
                }
            }
            this.audio.stop();
        }
        this.audioTime.currentTime = value;
    }
    override setVolume(value: number): void {
        //console.log("set volume "+ 10*Math.log10(value) + " titre "+this.titre)
        this.audio.volume.value = 10*Math.log10(value);
    }
    override setFrequencyType(high: boolean): void {
        //console.log("type frequence "+ high + " titre "+ this.titre)
        this.filter.type = high? "highpass":"lowpass"
    }
    override setFrequencyValue(value: number): void {
        const milieu: number = 500;
        const max: number = 10000;
        if(value<0.5){
            //console.log("frequence "+ milieu*value + " titre "+ this.titre)
            this.filter.frequency.value = milieu*value*2;
        } else{
            //console.log("frequence "+ ((max-milieu)*2*value-(max-milieu*2)) + " titre "+ this.titre)
            this.filter.frequency.value = (max-milieu)*2*value-(max-milieu*2);
        }
    }
    override setPlaybackRate(value: number): void {
        //console.log("rate "+ value+ " titre "+ this.titre)
        this.audioTime.playbackRate = value;
        this.audio.playbackRate = value;
        this.ajustPitchPlayBackRate();
    }
    
    override setPitch(value: number): void{
        //console.log("pitch "+ value+ " titre "+ this.titre)
        this.pitch = value
        this.ajustPitchPlayBackRate();
    }

    private ajustPitchPlayBackRate(): void{
        //console.log("ajust " +this.pitch + " "+ (-(12/(Math.log(2)/Math.log(12)))*Math.log(this.audio.playbackRate)/Math.log(12)));
        this.pitchshift.pitch = this.pitch-(12/(Math.log(2)/Math.log(12)))*Math.log(this.audio.playbackRate)/Math.log(12);
    }

    override getPitch(): number{
        return this.pitch;
    }

    override pitchable(): boolean{
        return true;
    }
}
