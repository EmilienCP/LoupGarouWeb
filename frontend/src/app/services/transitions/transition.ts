import { Toune, Transition } from '../../../../../common/toune';
import { ASortieAudio } from "../sortieAudio/AsortieAudio";

export abstract class Transitions{

    protected audio: ASortieAudio;
    protected audio2: ASortieAudio;
    private triggeredTransition: boolean;
    private triggeredDebut: boolean;
    protected touneCourante: Toune;
    private tounePrecedente?:Toune;
    protected touneSuivante?: Toune;
    protected loop: boolean = false;
    protected loopCommence: boolean = false;
    protected nombreLoops: number = 0;
    protected NB_LOOPS: number = 4;
    constructor(audio: ASortieAudio, audioReference: ASortieAudio, audioReference2: ASortieAudio,  tounes: Toune[], indexToune: number, loop: boolean){
        if(audio == audioReference){
            this.audio = audioReference;
            this.audio2 = audioReference2;
        } else{
            this.audio = audioReference2;
            this.audio2 = audioReference;
        }
        this.triggeredTransition = false;
        this.triggeredDebut = false;
        this.touneCourante = tounes[indexToune];
        this.tounePrecedente = tounes[indexToune-1];
        this.touneSuivante = tounes[indexToune+1];
        this.loop = loop;
        if(this.loop){
            if(this.tounePrecedente?.transition != Transition.LOOP_SWITCH_LOW){
                let i: number = indexToune;
                let pitches: number[] = [];
                while(i < tounes.length && tounes[i].transition === Transition.LOOP_SWITCH_LOW){
                    pitches.push(tounes[i].pitch!);
                    i++;
                }
                pitches = pitches.sort();
                let max: number = 0;
                let bestPitch: number | undefined;
                pitches.forEach((pitch: number, index: number)=>{
                    let nextPitch: number = 0;
                    if(pitches[index+1] == undefined){
                        nextPitch = pitches[0];
                    } else {
                        nextPitch = pitches[index+1];
                    }
                    if((nextPitch-pitch)%12>max){
                        max=(nextPitch-pitch)%12;
                        bestPitch = nextPitch;
                    }
                })
                let bestPitch1: number = -((-(bestPitch!-this.touneCourante.pitch!)+12)%12);
                console.log("best pitch " + (-11)%12+ " "+ ((-(bestPitch!-this.touneCourante.pitch!))%12))
                let bestPitch2: number = -((-(bestPitch!-this.touneSuivante!.pitch!)+12)%12);
                this.audio.setPitch(bestPitch1);
                this.audio2.setPitch(bestPitch2);
            }
        }
    }

    timeUpdate(enPause: boolean): boolean[]{
        const snapShotCurrentTime: number = this.audio.getCurrentTime(this.touneCourante);
        if(snapShotCurrentTime < this.touneCourante.temps[1] && this.touneCourante.debut){
            if(!this.triggeredDebut){
                this.triggeredDebut = true;
                this.triggerDebut();
            }
            this.ajustementDebut(snapShotCurrentTime);
        }
        if(snapShotCurrentTime > this.touneCourante.temps[1]+8 && this.touneCourante.temps[2]-30>snapShotCurrentTime){
            this.audio.setCurrentTime(snapShotCurrentTime+16, this.touneCourante);
        }
        if(!this.loopCommence && snapShotCurrentTime > this.touneCourante.temps[2]){
            console.log("dedans", snapShotCurrentTime)
            return this.ajustementTransition(enPause, snapShotCurrentTime);
        }
        if(this.loopCommence){
            if(snapShotCurrentTime < this.touneCourante.tempsLoopFin![1]){
                if(this.ajustementTransition(enPause, snapShotCurrentTime)){
                    return [true, false];
                }
            } else {
                if(this.nouvelleLoop()){
                    this.triggerFin();
                    return [false, true];
                }
            }
        }

        
        
        return [false, false]
    }

    nouvelleLoop(): boolean{
        this.nombreLoops++;
        if(this.nombreLoops == this.NB_LOOPS){
            return true;
        }
        let snapShotCurrentTime: number = this.audio.getCurrentTime(this.touneCourante);
        this.audio2.setCurrentTime(this.touneSuivante!.tempsLoopDebut![0]+snapShotCurrentTime-this.touneCourante.tempsLoopFin![1], this.touneSuivante!); // on doit ajuster en fonction du meme decallage que le premier audio.
        this.audio.setCurrentTime(this.touneCourante.tempsLoopFin![0]+snapShotCurrentTime-this.touneCourante.tempsLoopFin![1], this.touneCourante);
        return false;

    }

    protected ajustementDebut(snapShotCurrentTime: number): void {
        
        let progression =((snapShotCurrentTime- this.touneCourante.temps[0])/ Math.min(this.touneCourante.temps[1]- this.touneCourante.temps[0], 5))
        if(progression < 0){
            progression = 0;
        }
        if(progression >1){
            progression = 1;
        }
        this.audio.setVolume(progression);
    }

    protected triggerDebut(){
        this.audio.setVolume(0);
    }


    private triggerTransition(partirLaudio: boolean): boolean[]{
        if(!this.touneSuivante){
            console.log("pu de toune trouvée")
            return [false, false];
        }
        if(partirLaudio && this.audio2.paused()){
            this.commencerAudio2();
            let snapShotCurrentTime: number = this.audio.getCurrentTime(this.touneCourante);
            if(this.loop){
                this.audio2.setCurrentTime(this.touneSuivante!.tempsLoopDebut![0]+snapShotCurrentTime-this.touneCourante.temps[2], this.touneSuivante!);
                this.audio.setCurrentTime(this.touneCourante.tempsLoopFin![0]+snapShotCurrentTime-this.touneCourante.temps[2], this.touneCourante, ()=>{
                    this.audio2.play()
                });
                this.loopCommence = true;
            } else {
                this.audio2.setCurrentTime(this.touneSuivante!.temps[0]+snapShotCurrentTime-this.touneCourante.temps[2], this.touneSuivante!);
                this.audio2.play()
            }
            return [true, false];
        }
        return [false, false];
    }

    protected abstract commencerAudio2(): void

    ajustementTransition(partirLaudio: boolean, snapShotCurrentTime: number): boolean[]{
        if(!this.triggeredTransition){
            this.triggeredTransition = true;
            return this.triggerTransition(partirLaudio);
        }
        console.log("dans ajustement transitions")
        let longueurMin: number =this.touneCourante.temps[3]-this.touneCourante.temps[2];
        if(this.touneSuivante){
          let longueurDebutProchaineToune: number = this.touneSuivante.temps[1]-this.touneSuivante.temps[0];
          longueurMin = Math.min(longueurMin,longueurDebutProchaineToune);
        }
        let referenceTemps: number = this.touneCourante.temps[2];
        let referenceTemps2: number = this.touneSuivante!.temps[0];
        let progression: number = (snapShotCurrentTime - referenceTemps)/longueurMin;
        if(this.loop){
            progression = (((snapShotCurrentTime-this.touneCourante.tempsLoopFin![0])/(this.touneCourante.tempsLoopFin![1]-this.touneCourante.tempsLoopFin![0]))+this.nombreLoops)/this.NB_LOOPS;
        }
        let tempsApresDebut: number = snapShotCurrentTime - referenceTemps;
        let tempsAvantFin: number = referenceTemps + longueurMin - snapShotCurrentTime;
        if(this.loop){
            referenceTemps=this.touneCourante.tempsLoopFin![0];
            referenceTemps2=this.touneSuivante!.tempsLoopDebut![0];
            tempsApresDebut = progression*(this.touneCourante.tempsLoopFin![1]-referenceTemps)*this.NB_LOOPS;
            tempsAvantFin = (1-progression)*(this.touneCourante.tempsLoopFin![1]-referenceTemps)*this.NB_LOOPS;
        }
        if(progression >1){
            this.triggerFin();
            return [false, true];
        }
        if(progression < 0){
          progression = 0;
        }
        this.modifierAudios(progression, tempsApresDebut, tempsAvantFin, referenceTemps, referenceTemps2);
        return [false, false];
    }

    protected triggerFin(){
        console.log("trigger fin")
        this.audio.stop();
        if(this.loop && this.touneSuivante && this.touneSuivante.transition! == Transition.LOOP_SWITCH_LOW){
            let bestPitch: number = (this.audio.getPitch()-this.touneCourante.pitch!)%12;
            bestPitch = (this.touneSuivante!.pitch!+bestPitch!-(bestPitch==0?0:12));
            this.audio.setPitch(bestPitch);
        }
    }

    protected modifierTempos(progression: number, tempsDebutaudio1: number, tempsDebutaudio2: number){
        const indexAudio1: number = this.audio.getCurrentTime(this.touneCourante);
        const indexAudio2: number = this.audio2.getCurrentTime(this.touneSuivante!);
        const tempsTempsPrecedant: number = this.touneCourante.tempsi[Math.floor(indexAudio1)]
        const tempsTempsEntre: number = this.touneCourante.tempsi[Math.floor(indexAudio1)+1]
        //const tempsTempsSuivant: number = this.touneCourante.tempsi[Math.floor(indexAudio1)+2]
        const tempsEnVraiTemps: number = ((tempsTempsEntre-tempsTempsPrecedant)*(indexAudio1-Math.floor(indexAudio1)))+tempsTempsPrecedant;
        const tempsAvantProchainTemps: number = tempsTempsEntre-tempsEnVraiTemps;
        const objectifAudio1: number = Math.floor(indexAudio1)+1-tempsDebutaudio1;
        const objectifAudio2: number = tempsDebutaudio2+objectifAudio1;

        const tempsTempsPrecedant2: number = this.touneSuivante!.tempsi[Math.floor(indexAudio2)]
        const tempsTempsEntre2: number = this.touneSuivante!.tempsi[Math.floor(indexAudio2)+1]
        const tempsTempsSuivant2: number = this.touneSuivante!.tempsi[objectifAudio2]
        const tempsEnVraiTemps2: number = ((tempsTempsEntre2-tempsTempsPrecedant2)*(indexAudio2-Math.floor(indexAudio2)))+tempsTempsPrecedant2;
        const tempsAvantProchainTemps2: number = tempsTempsSuivant2-tempsEnVraiTemps2;
        
        let dividende: number = tempsAvantProchainTemps2/tempsAvantProchainTemps
        if(dividende<0.75 || dividende>1.25){
            console.log("pas normal")
            console.log("indexAudio1", indexAudio1)
            console.log("indexAudio2", indexAudio2)
            console.log("tempsTempsPrecedant", tempsTempsPrecedant)
            console.log("tempsTempsEntre", tempsTempsEntre)
            //console.log("tempsTempsSuivant", tempsTempsSuivant)
            console.log("tempsEnVraiTemps", tempsEnVraiTemps)
            console.log("tempsAvantProchainTemps", tempsAvantProchainTemps)
            console.log("objectifAudio1", objectifAudio1)
            console.log("objectifAudio2", objectifAudio2)
            console.log("tempsTempsPrecedant2", tempsTempsPrecedant2)
            console.log("tempsTempsEntre2", tempsTempsEntre2)
            console.log("tempsTempsSuivant2", tempsTempsSuivant2)
            console.log("tempsEnVraiTemps2", tempsEnVraiTemps2)
            console.log("tempsAvantProchainTemps2", tempsAvantProchainTemps2)
            dividende = Math.max(Math.min(dividende, 1.25), 0.75)
        }
        console.log(dividende, progression);

        this.audio.setPlaybackRate(((this.touneSuivante!.tempo-this.touneCourante.tempo)*progression+this.touneCourante.tempo)/this.touneCourante.tempo)
        this.audio2.setPlaybackRate(dividende);
    }

    protected modifierFiltres(progression: number){
        this.audio.setFrequencyValue((1-progression))
        this.audio2.setFrequencyValue((1-progression))
    }

    protected modifierVolumes(progression: number){
        this.audio.setVolume(1-progression)
        this.audio2.setVolume(progression)
    }
    
    protected modifierAudios
    (progression: number, tempsApresDebut: number, tempsAvantFin: number, tempsDebutaudio1: number, tempsDebutaudio2: number){
    }
}
