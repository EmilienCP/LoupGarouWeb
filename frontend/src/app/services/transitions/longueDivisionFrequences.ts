import { Toune } from '../../../../../common/toune';
import { ASortieAudio } from "../sortieAudio/AsortieAudio";
import { Transitions } from "./transition";

export class LongueDivisionFrequences extends Transitions{

    constructor(audio: ASortieAudio, audioReference: ASortieAudio, audioReference2: ASortieAudio,  tounes: Toune[], indexToune: number){
        super(audio, audioReference, audioReference2, tounes, indexToune, false);
    }

    protected override modifierAudios(progression: number, tempsApresDebut: number, tempsAvantFin: number, tempsDebutaudio1: number, tempsDebutaudio2: number): void {
        console.log("dans longue division frequence")
        this.modifierTempos(progression, tempsDebutaudio1, tempsDebutaudio2);
        if(tempsApresDebut<2){
            console.log("debut")
            this.audio.setFrequencyValue(-0.5*(tempsApresDebut/2)+1);
            this.audio2.setFrequencyValue(-0.5*(tempsApresDebut/2)+1);
        } else if(tempsAvantFin<2){
            console.log("fin")
            this.audio.setFrequencyValue(0.5*(tempsAvantFin/2));
            this.audio2.setFrequencyValue(0.5*(tempsAvantFin/2));
        } else {
            console.log("milieu")
            this.audio.setFrequencyValue(0.5);
            this.audio2.setFrequencyValue(0.5);
        }
    }

    protected override commencerAudio2(){
        this.audio2.setVolume(1);
        this.audio2.setFrequencyType(true);
        this.audio2.setFrequencyValue(0);
    }

    protected override triggerFin(){
        super.triggerFin();
        this.audio.setVolume(0);
        this.audio.setFrequencyType(true);
        this.audio.setFrequencyValue(1);
        
        this.audio2.setVolume(1);
        this.audio2.setPlaybackRate(1);
        this.audio2.setFrequencyValue(1);
    }
}
