import { Toune } from "../../../../../common/toune";
import { ASortieAudio } from "../sortieAudio/AsortieAudio";
import { Transitions } from "./transition";

export class Fondu extends Transitions{
    
    constructor(audio: ASortieAudio, audioReference: ASortieAudio, audioReference2: ASortieAudio,  tounes: Toune[], indexToune: number){
        super(audio, audioReference, audioReference2, tounes, indexToune, false);
    }

    protected override modifierAudios(progression: number, tempsApresDebut: number, tempsAvantFin: number, tempsDebutaudio1: number, tempsDebutaudio2: number): void {
        this.modifierTempos(progression, tempsDebutaudio1, tempsDebutaudio2);
        this.modifierVolumes(progression);
    }

    protected override commencerAudio2(){
        this.audio2.setVolume(0);
    }

    protected override triggerFin(){
        super.triggerFin();
        this.audio.setVolume(0);
        this.audio2.setVolume(1);
        this.audio2.setPlaybackRate(1);
    }
}