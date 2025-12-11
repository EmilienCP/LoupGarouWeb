import { Injectable } from '@angular/core';
import { CommunicationService } from './communication.service';

@Injectable({
  providedIn: 'root'
})
export class AudioService {

  private audio: HTMLAudioElement;
  private audioSoundEffect: HTMLAudioElement;
  private pasJouer: boolean = false;
  constructor( private communicationService: CommunicationService) {
    this.audio = new Audio();
    this.audioSoundEffect = new Audio();
  }

  jouerTheme(): void {
    this.jouer("../../assets/Loup Garou.wav", this.audio)
  }

  jouerJour(): void {
    this.jouer("../../assets/jour.mp3", this.audio)
  }

  jouerNuit(): void {
    this.jouer("../../assets/nuit.mp3", this.audio)
  }

  jouerMatin(): void {
    this.jouer("../../assets/Loup Garou Matin.wav", this.audio, false)
  }

  jouerCredits(): void{
    this.jouer("../../assets/Loup Garou Crédits.mp3", this.audio, false)
  }

  jouerVictoire(): void{
    this.jouer("../../assets/loup_garou_victoire.wav", this.audio, false)
  }

  jouerOursGrogne(): void{
    this.jouer("../../assets/bearroar.wav", this.audioSoundEffect, false)
  }

  jouerCorbeau(): void{
    this.jouer("../../assets/corbeau.wav", this.audioSoundEffect, false)
  }

  jouerResultatVote(): void{
    this.jouer("../../assets/resultatVote.wav", this.audioSoundEffect, false)
  }

  jouerIntro(): void{
    this.jouer("../../assets/loup_garou_intro.wav", this.audio, false)
  }

  jouerCreation(): void{
    this.jouer("../../assets/loup_garou_creation.wav", this.audio, true)
  }

  jouerDebutPartie(): void{
    this.jouer("../../assets/loup_garou_debut_partie.wav", this.audio, false)
  }

  jouer(path: string, audio: HTMLAudioElement, loop: boolean = true){
    if(!this.pasJouer && (!this.communicationService.isUnMeneurDeJeu || this.communicationService.isMeneurDeJeu)){
      audio.pause();
      audio.src = path;
      audio.loop = loop;
      audio.load();
      audio.play();
    }
  }

  arreter(): void{
    this.audio.pause();
  }
}
