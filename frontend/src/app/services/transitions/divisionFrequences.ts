import { Toune } from '../../../../../common/toune';
import { ASortieAudio } from "../sortieAudio/AsortieAudio";
import { Transitions } from "./transition";

export class DivisionFrequences extends Transitions{
    constructor(audio: ASortieAudio, audioReference: ASortieAudio, audioReference2: ASortieAudio,  tounes: Toune[], indexToune: number){
        super(audio, audioReference, audioReference2, tounes, indexToune, false);
    }

    protected override modifierAudios(progression: number, tempsApresDebut: number, tempsAvantFin: number, tempsDebutaudio1: number, tempsDebutaudio2: number): void {
        this.modifierTempos(progression, tempsDebutaudio1, tempsDebutaudio2);
        this.modifierFiltres(progression);
    }

    protected override commencerAudio2(){
        this.audio.setFrequencyType(false);
        this.audio2.setFrequencyType(true);
        this.audio2.setFrequencyValue(0);
        this.audio2.setVolume(1);
    }

    protected override triggerFin(){
        super.triggerFin();
        this.audio.setFrequencyType(true);
        this.audio.setFrequencyValue(1);
        
        this.audio2.setPlaybackRate(1);
        this.audio2.setFrequencyType(false);
        this.audio2.setFrequencyValue(1);
    }
}
