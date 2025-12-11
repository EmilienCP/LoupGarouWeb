import { ASortieAudio } from "./AsortieAudio";

export class SortieAudio2 extends ASortieAudio{
    audio: AudioBufferSourceNode;
    htmlAudio: HTMLAudioElement;
    //gainNode: GainNode;
    currentTime: number = 0;
    entrainDeJouer: boolean = false;

    constructor(audioContext: AudioContext){
        super(audioContext);
        this.htmlAudio = new Audio();
        this.htmlAudio.crossOrigin = "anonymous";
        this.audio = this.audioContext.createBufferSource();
        //this.gainNode = audioContext.createGain();
        //this.audio.connect(this.gainNode);
        //this.gainNode.connect(audioContext.destination);

        // const audioMediaSource = this.audioContext.createMediaElementSource(this.htmlAudio);
        // const analyser = this.audioContext.createAnalyser();
        // analyser.fftSize = 256;
        // let audioFilter = this.audioContext.createBiquadFilter();
        // audioFilter.type = 'lowpass';
        // audioFilter.frequency.value = 6000;
        // audioMediaSource.connect(audioFilter);
        // this.audio.connect(audioFilter);
        // audioFilter.connect(analyser);
        // analyser.connect(this.audioContext.destination);
        var pitchShifter = audioContext.createBiquadFilter();
            pitchShifter.type = "allpass";
            pitchShifter.frequency.value = 0;
            pitchShifter.Q.value = 0;
            pitchShifter.detune.value = 300;

        
        this.audio.connect(pitchShifter);
        pitchShifter.connect(audioContext.destination);

        //audioMediaSource.connect(audioContext.destination);
        const source = this.audioContext.createBufferSource();
        source.playbackRate.value = 0.1;
        source.loop = true;
        const streamNode = this.audioContext.createMediaStreamDestination();
        source.connect(streamNode);
        // this.htmlAudio.srcObject = streamNode.stream;
        this.htmlAudio.src = "https://mbeta.123tokyo.xyz/get.php/5/1e/H7rhMqTQ4WI.mp3?cid=MmEwMTo0Zjg6YzAxMDo5ZmE2OjoxfE5BfERF&h=dKcCIXL0J0igl5LtC-xgDQ&s=1708654102&n=Khaled%20-%20C%27est%20la%20vie%20%28Clip%20officiel%29";
        // this.htmlAudio.oncanplay = ()=>{
        //     this.htmlAudio.play();
        // }
        // this.htmlAudio.load();
        // this.htmlAudio.play();
        console.log("play")
    }

    override play(): void {
        this.audio.start(this.currentTime);
        this.entrainDeJouer = true;
    }

    override pause(): void {
        if(this.entrainDeJouer){
            this.audio.stop();
        }
        this.entrainDeJouer = false;
    }
    override stop(): void {
        if(this.entrainDeJouer){
            this.audio.stop();
        }
        this.entrainDeJouer = false;
    }

    override preparerToune(path: string, timeUpdate: any, finished: any, logOutPut: any, logs: string[], titre: string): void {
        super.preparerToune(path, timeUpdate, finished, logOutPut, logs, titre);
        //fetch("https://dl.dropboxusercontent.com/s/1cdwpm3gca9mlo0/kick.mp3")
        //const fetchapi = fetch(`https://malpha.123tokyo.xyz/get.php/5/1e/H7rhMqTQ4WI.mp3?cid=MmEwMTo0Zjg6YzAxMDo5ZmE2OjoxfE5BfERF&h=mIbDaTJBYHYbMpB-T8qJSw&s=1704951341&n=Khaled%20-%20C%27est%20la%20vie%20%28Clip%20officiel%29`,{
        const fetchapi = fetch(`https://youtube-mp36.p.rapidapi.com/dl?id=H7rhMqTQ4WI`,{
           "method" : "GET",
           "headers": {
           "X-RapidAPI-Key" :"69c7797440msh13130e2ff8168efp1a4202jsnc726b844e1c5",
           "X-RapidAPI-Host": "youtube-mp36.p.rapidapi.com"
           }
        });
        fetchapi
        .then(resp => {
            //console.log(resp.arrayBuffer());
            return resp.arrayBuffer()
        })
        .then(buf => this.audioContext.decodeAudioData(buf))
        .then(audioBuffer => {
            this.audio.buffer = audioBuffer;
            //source.detune.value = 400;
            //this.audio.playbackRate.value = 0.1;
            this.audio.loop = true;
            timeUpdate();
            finished();
            //const streamNode = this.audioContext.createMediaStreamDestination();
            //source.connect(streamNode);
            //this.audio.controls = true;
            //document.body.appendChild(this.audio);
            //this.audio.srcObject = streamNode.stream;
            //this.audio.play();
            //console.log("play")
        })
        // .catch(console.error);
    }
    override paused(): boolean {
        return !this.entrainDeJouer;
    }
    override getCurrentTimeImp(): number {
        return this.audioContext.currentTime-this.currentTime;
    }

    override setCurrentTimeImp(value: number, fctApresOnStop?: any): void {
        this.currentTime = value;
        if(this.entrainDeJouer){
            this.pause();
            this.play();
        }
    }
    override setVolume(value: number): void {
        //this.gainNode.gain.value = 1;
        //this.gainNode.gain.value = value;
    }
    override setFrequencyType(high: boolean): void {
        return;
    }
    override setFrequencyValue(value: number): void {
        return;
    }
    override setPlaybackRate(value: number): void {
        this.audio.playbackRate.value = value;
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
