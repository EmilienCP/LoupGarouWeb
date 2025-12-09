import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SnackBarService } from './snack-bar.service';
import * as io from 'socket.io-client';
import { JoindrePartieInfo } from '../../../../common/joindrePartieInfo';
import { EvenementIndividuel, EvenementDeGroupe, Victoire, RaisonPasVoter } from '../../../../common/evenements'
import { Joueur, JoueurExtensionLoups, Role } from '../../../../common/Joueur'
import {InfoPartie } from '../../../../common/infoPartie'
import {MomentFort } from '../../../../common/momentFort'
import { InfoVideo } from '../../../../common/infoVideo'
import { InfoEvenement } from '../../../../common/infoEvenement'
import { InfoPointsDeVictoire } from '../../../../common/infoPointsDeVictoire'
import { environment } from 'src/environments/environment';
import { Toune } from '../../../../common/toune';
import { InfoAppareilDetail } from '../../../../common/infoAppareilDetail';


@Injectable({
  providedIn: 'root'
})
export class CommunicationService {

  ROOT_HOST = environment.server_host;
  ROOT_PORT = 5030;
  ROOT_URL = `${this.ROOT_HOST}:${this.ROOT_PORT}/`;
  socket!: io.Socket;
  idSocket: string = "";
  jour: boolean = true;
  numeroJour: number = 0;
  isMeneurDeJeu: boolean = false;
  isUnMeneurDeJeu: boolean = false;
  historiquePartie: string = "";
  listeners: any;
  infoVillage: Joueur[] = [];

  constructor(private http: HttpClient, private snack: SnackBarService) {}

  public connectSocket(): void{
    this.socket = io.connect(this.ROOT_URL)
    this.socket.on("connect", ()=>{
      if(this.idSocket!=""){
        this.socket.emit("reconnecter", this.idSocket);
      }
      this.idSocket = this.socket.id as string;
    })
  }

  public getSocket(): io.Socket{
    return this.socket;
  }

  getInfoPartie(): Observable<InfoPartie>{
    return this.http.get<InfoPartie>(this.ROOT_URL + 'infoPartie/'+this.idSocket);
  }

  getJoindrePartieInfo(): Observable<JoindrePartieInfo[]>{
    return this.http.get<JoindrePartieInfo[]>(this.ROOT_URL + 'joindrePartieInfo/')
    .pipe(catchError(err => this.handleError(err)));
  }

  getInfoEvenement(): Observable<InfoEvenement>{
    return this.http.get<InfoEvenement>(this.ROOT_URL + 'infoEvenement/'+this.idSocket)
    .pipe(catchError(err => this.handleError(err)));
  } 

  getInfoJoueurPresent(): Observable<Joueur>{
    return this.http.get<Joueur>(this.ROOT_URL + 'infoJoueurPresent/'+this.idSocket)
    .pipe(catchError(err => this.handleError(err))); 
  }

  getRoleVoyante(): Observable<Role>{
    return this.http.get<Role>(this.ROOT_URL + 'roleVoyante/'+this.idSocket)
    .pipe(catchError(err => this.handleError(err))); 
  }

  getInfoVillage(): Observable<Joueur[]>{
    return this.http.get<Joueur[]>(this.ROOT_URL + 'infoVillage/'+this.idSocket)
    .pipe(catchError(err => this.handleError(err))); 
  }

  getInfoVillageExtensionLoups(): Observable<JoueurExtensionLoups[]>{
    return this.http.get<JoueurExtensionLoups[]>(this.ROOT_URL + 'infoVillageExtensionLoups/'+this.idSocket)
    .pipe(catchError(err => this.handleError(err))); 
  }

  getInfoVillageArriverMilieuDePartie(): Observable<Joueur[]>{
    return this.http.get<Joueur[]>(this.ROOT_URL + 'infoVillageArriverMilieuDePartie/'+this.idSocket)
    .pipe(catchError(err => this.handleError(err))); 
  }
  
  getInfoVillageMort(): Observable<Joueur[]>{
    return this.http.get<Joueur[]>(this.ROOT_URL + 'infoVillageMort/'+this.idSocket)
    .pipe(catchError(err => this.handleError(err))); 
  }

  getInfoVillageVerite(): Observable<Joueur[]>{
    return this.http.get<Joueur[]>(this.ROOT_URL + 'infoVillageVerite/'+this.idSocket)
    .pipe(catchError(err => this.handleError(err))); 
  }

  voterVillageois(index: number, evenement: EvenementDeGroupe|EvenementIndividuel): Observable<boolean>{
    return this.http.post<boolean>(this.ROOT_URL + 'voterVillageois/', {index: index, idSocket: this.idSocket, evenement: evenement})
    .pipe(catchError(err => this.handleError(err)));
  }

  isDerniereAccusation(): Observable<boolean>{
    return this.http.get<boolean>(this.ROOT_URL + 'isDerniereAccusation/'+this.idSocket)
    .pipe(catchError(err => this.handleError(err)));
  }

  getNouvellesRaisonsPasVoter(): Observable<RaisonPasVoter[]>{
    return this.http.get<RaisonPasVoter[]>(this.ROOT_URL + 'nouvellesRaisonsPasVoter/'+this.idSocket)
    .pipe(catchError(err => this.handleError(err)));
  }

  getHistoriqueEvenements(): Observable<string[][]>{
    return this.http.get<string[][]>(this.ROOT_URL + 'historiqueEvenements/'+this.idSocket)
    .pipe(catchError(err => this.handleError(err)));
  }
  
  getInfoVideo(): Observable<InfoVideo>{
    return this.http.get<InfoVideo>(this.ROOT_URL + 'infoVideo/'+this.idSocket)
    .pipe(catchError(err => this.handleError(err)));
  }

  getVictoire(): Observable<Victoire>{
    return this.http.get<Victoire>(this.ROOT_URL + 'victoire/'+this.idSocket)
    .pipe(catchError(err => this.handleError(err)));
  }

  getRaisonsPasVoter(): Observable<RaisonPasVoter[]>{
    return this.http.get<RaisonPasVoter[]>(this.ROOT_URL + 'raisonsPasVoter/'+this.idSocket)
    .pipe(catchError(err => this.handleError(err)));
  } 

  getRaisonsPasVoterAccusation(): Observable<RaisonPasVoter[]>{
    return this.http.get<RaisonPasVoter[]>(this.ROOT_URL + 'raisonsPasVoterAccusation/'+this.idSocket)
    .pipe(catchError(err => this.handleError(err)));
  } 

  getRaisonsPasVoterAccusationQuiEtesVous(): Observable<RaisonPasVoter[]>{
    return this.http.get<RaisonPasVoter[]>(this.ROOT_URL + 'raisonsPasVoterAccusationQuiEtesVous/'+this.idSocket)
    .pipe(catchError(err => this.handleError(err)));
  } 

  getRaisonsPasVoterSortMortel(): Observable<RaisonPasVoter[]>{
    return this.http.get<RaisonPasVoter[]>(this.ROOT_URL + 'raisonsPasVoterSortMortel/'+this.idSocket)
    .pipe(catchError(err => this.handleError(err)));
  } 

  getRaisonsPasVoterInstitutrice(): Observable<RaisonPasVoter[]>{
    return this.http.get<RaisonPasVoter[]>(this.ROOT_URL + 'raisonsPasVoterInstitutrice/'+this.idSocket)
    .pipe(catchError(err => this.handleError(err)));
  } 

  getRaisonsPasVoterArriverMilieuDePartie(): Observable<RaisonPasVoter[]>{
    return this.http.get<RaisonPasVoter[]>(this.ROOT_URL + 'raisonsPasVoterArriverMilieuDePartie/'+this.idSocket)
    .pipe(catchError(err => this.handleError(err)));
  } 

  siPlusieursPersonnesPeuventAccuser(): Observable<boolean>{
    return this.http.get<boolean>(this.ROOT_URL + 'siPlusieursPersonnesPeuventAccuser/'+this.idSocket)
    .pipe(catchError(err => this.handleError(err)));
  }

  getInfoAppareilDetails(): Observable<InfoAppareilDetail[]>{
    return this.http.get<InfoAppareilDetail[]>(this.ROOT_URL + 'infoAppareilDetails/'+this.idSocket)
    .pipe(catchError(err => this.handleError(err)));
  }

  switchAppareilDisconnect(index: number): Observable<boolean>{
    return this.http.post<boolean>(this.ROOT_URL + 'switchAppareilDisconnect/', {index: index, idSocket: this.idSocket})
    .pipe(catchError(err => this.handleError(err)));
  }

  retirerAppareil(index: number): Observable<boolean>{
    return this.http.post<boolean>(this.ROOT_URL + 'retirerAppareil/', {index: index, idSocket: this.idSocket})
    .pipe(catchError(err => this.handleError(err)));
  }
  
  getOursGrogne(): Observable<boolean>{
    return this.http.get<boolean>(this.ROOT_URL + 'oursGrogne/'+this.idSocket)
    .pipe(catchError(err => this.handleError(err)));
  }

  getReponseRenard(): Observable<boolean>{
    return this.http.get<boolean>(this.ROOT_URL + 'reponseRenard/'+this.idSocket)
    .pipe(catchError(err => this.handleError(err)));
  }

  voirHistorique(): Observable<string>{
    return this.http.get<string>(this.ROOT_URL + 'historique/')
    .pipe(catchError(err => this.handleError(err)));
  }

  ouiServanteDevouee(): Observable<boolean>{
    return this.http.post<boolean>(this.ROOT_URL + 'ouiServanteDevouee/', {idSocket: this.idSocket})
    .pipe(catchError(err => this.handleError(err)));
  }

  getInfosPointsDeVictoire(): Observable<InfoPointsDeVictoire[]>{
    return this.http.get<InfoPointsDeVictoire[]>(this.ROOT_URL + 'infosPointsDeVictoire/'+this.idSocket)
    .pipe(catchError(err => this.handleError(err)));
  }

  getJoueursEnAttente(): Observable<string[]>{
    return this.http.get<string[]>(this.ROOT_URL + 'joueursEnAttente/'+this.idSocket)
    .pipe(catchError(err => this.handleError(err)));
  }

  getIntroHistoire(): Observable<string>{
    return this.http.get<string[]>(this.ROOT_URL + 'introHistoire/'+this.idSocket)
    .pipe(catchError(err => this.handleError(err)));
  }

  getUnMomentFort(): Observable<MomentFort>{
    return this.http.get<MomentFort>(this.ROOT_URL + 'getUnMomentFort/'+this.idSocket)
    .pipe(catchError(err => this.handleError(err)));
  }

  
  convertMp3(videoId: string, ajouterDansFichier: boolean): Observable<string>{
    return this.http.post<string>(this.ROOT_URL + 'convert-mp3/', {videoId: videoId, ajouterDansFichier: ajouterDansFichier})
    .pipe(catchError(err => this.handleError(err)));
  }

  getTounes(): Observable<Toune[]>{
    return this.http.get<Toune[]>(this.ROOT_URL + 'tounes/')
    .pipe(catchError(err => this.handleError(err)));
  }

  creerToune(toune: Toune): Observable<boolean>{
    return this.http.post<boolean>(this.ROOT_URL + 'creerToune/', {toune: toune})
    .pipe(catchError(err => this.handleError(err)));
  }

  modifierToune(toune: Toune, index: number): Observable<boolean>{
    return this.http.post<boolean>(this.ROOT_URL + 'modifierToune/', {toune: toune, index: index})
    .pipe(catchError(err => this.handleError(err)));
  }
  


  handleError(err: HttpErrorResponse, propagateError?: boolean, ignoreMessage?: boolean): Observable<any> {
    const errorMessageDuration = 5000;
    if (err.status === 0) { this.snack.showLostConnection(); }
    else if (err.error?.message) { this.snack.showMessage(err.error?.message, errorMessageDuration); }
    else if (err.status === 500 && !ignoreMessage) {
      this.snack.showMessage('L\'opération n\'a pas pu être effectuée. Veuillez réessayer.', errorMessageDuration);
    }
    return propagateError ? throwError('') : EMPTY;
  }
}
