import { Injectable } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackBarService {

  errorMsgOnDisplay = false;
  errorMsgDuration = 6000;

  constructor(private snackBar: MatSnackBar) { }

  showMessage(message: string, duration?: number): void {
    this.snackBar.open(message, '', {
      duration: duration ? duration : 2000,
    });
  }

  showLostConnection(): void {
    if (!this.errorMsgOnDisplay) {
      this.errorMsgOnDisplay = true;
      this.snackBar.open('Le serveur est inaccessible. Veuillez vérifier votre connexion.', '', {
        duration: this.errorMsgDuration,
      });
      setTimeout(() => { this.errorMsgOnDisplay = false; }, this.errorMsgDuration);
    }
  }
}
