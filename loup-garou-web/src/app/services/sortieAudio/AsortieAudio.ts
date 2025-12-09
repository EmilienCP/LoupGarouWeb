import { Toune } from "../../../../../common/toune";

export abstract class ASortieAudio{
    audioContext: AudioContext;
    titre: string;
    constructor(audioContext: AudioContext){
        this.audioContext = audioContext
        this.titre= "";
    }

    abstract play(): void
    abstract pause(): void
    preparerToune(path: string, timeUpdate: any, finished: any, logOutPut: any, logs:string[], titre: string): void{
        this.titre = titre;
    }
    abstract stop(): void
    abstract paused(): boolean

    getCurrentTime(toune: Toune): number{
        return this.convertCurrentTimeToIndex(this.getCurrentTimeImp(), toune);
    }

    setCurrentTime(value: number, toune: Toune, fctApresOnStop?: any): void{
        this.setCurrentTimeImp(this.convertIndexToCurrentTime(value, toune), fctApresOnStop);
    }

    abstract getCurrentTimeImp(): number
    abstract setCurrentTimeImp(value: number, fctApresOnStop?: any): void
    abstract setVolume(value: number): void
    abstract setFrequencyType(high: boolean): void
    abstract setFrequencyValue(value: number): void
    abstract setPlaybackRate(value: number): void
    abstract setPitch(value: number): void
    abstract getPitch(): number
    abstract pitchable(): boolean

    private convertIndexToCurrentTime(indexAPrendre: number, toune: Toune): number{
        return toune.tempsi[Math.floor(indexAPrendre)]+(toune.tempsi[Math.floor(indexAPrendre+1)]-toune.tempsi[Math.floor(indexAPrendre)])*(indexAPrendre-Math.floor(indexAPrendre));
    }

    private convertCurrentTimeToIndex(currentTime: number, toune: Toune): number{
    let i = toune.tempsi.findIndex((value)=>{return value >= currentTime});
    i+=(currentTime-toune.tempsi[i])/(toune.tempsi[i+1]-toune.tempsi[i]);
    return i;
    }

}