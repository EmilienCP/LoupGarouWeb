import { Toune } from '../../../../../common/toune';
import { ASortieAudio } from "../sortieAudio/AsortieAudio";
import { Transitions } from "./transition";

export class LoopSwitchLow extends Transitions{
    constructor(audio: ASortieAudio, audioReference: ASortieAudio, audioReference2: ASortieAudio, tounes: Toune[], indexToune: number){
        super(audio, audioReference, audioReference2, tounes, indexToune, true);
    }

    protected override modifierAudios(progression: number, tempsApresDebut: number, tempsAvantFin: number, tempsDebutaudio1: number, tempsDebutaudio2: number): void {
        const tempsDebut: number = 7;
        const tempsFin: number = 7;
        this.modifierTempos(progression, tempsDebutaudio1, tempsDebutaudio2);
        if(tempsApresDebut<tempsDebut){
            this.modifierVolumes(tempsApresDebut/(tempsDebut*2));
        } else if(tempsAvantFin<tempsFin){
            this.modifierVolumes(Math.min(-tempsAvantFin/(tempsFin*2)+1,1));
        } else {
            let progressionEntre2: number = (tempsApresDebut-tempsDebut)/((tempsApresDebut-tempsDebut)+(tempsAvantFin-tempsFin))
            this.audio.setFrequencyValue(progressionEntre2*0.5)
            this.audio2.setFrequencyValue((1-progressionEntre2)*0.5)
        }
    }

    protected override commencerAudio2(){
        this.audio2.setFrequencyType(true);
        this.audio.setFrequencyType(true);
        this.audio.setFrequencyValue(0);
        this.audio2.setFrequencyValue(0.5);
    }

    protected override triggerFin(){
        super.triggerFin();
        this.audio.setVolume(0);
        this.audio.setFrequencyValue(1);
        
        this.audio2.setVolume(1);
        this.audio2.setPlaybackRate(1);
        this.audio2.setFrequencyValue(0);
    }
    
}
