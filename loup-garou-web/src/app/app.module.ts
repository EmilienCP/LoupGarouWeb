import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatRippleModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatGridListModule} from '@angular/material/grid-list';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MenuComponent } from './menu/menu.component';
import { HomeComponent } from './home/home.component';
import { CreationComponent } from './creation/creation.component';
import { BoutonMenuComponent } from './bouton-menu/bouton-menu.component';
import { JoindreComponent } from './joindre/joindre.component';
import { AttenteComponent } from './attente/attente.component';
import { MontrerPersonnageComponent } from './montrer-personnage/montrer-personnage.component';
import { JourSeLeveComponent } from './jour-se-leve/jour-se-leve.component';
import { SelecteurComponent } from './selecteur/selecteur.component';
import { AccusationsComponent } from './accusations/accusations.component';
import { InformationsComponent } from './informations/informations.component';
import { VideoMatinComponent } from './video-matin/video-matin.component';
import { CreditsComponent } from './credits/credits.component';
import { DjaiComponent } from './djai/djai.component';
import { VoirHistoriqueComponent } from './voir-historique/voir-historique.component';
import { InfoVillageComponent } from './info-village/info-village.component';
import { CreationAppareilsComponent } from './creation-appareils/creation-appareils.component';
import { CreationInfoPartieComponent } from './creation-info-partie/creation-info-partie.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';
import { DescriptionRoleComponent } from './description-role/description-role.component';
import { MenuRolesComponent } from './menu-roles/menu-roles.component';
import { SelecteurVillageComponent } from './selecteur-village/selecteur-village.component';
import { JeuComponent } from './jeu/jeu.component';
import { VillageOngletComponent } from './village-onglet/village-onglet.component';
import { HistoriqueEvenementComponent } from './historique-evenement/historique-evenement.component';
import { JeuAIComponent } from './jeu-ai/jeu-ai.component';

@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    HomeComponent,
    CreationComponent,
    BoutonMenuComponent,
    JoindreComponent,
    AttenteComponent,
    MontrerPersonnageComponent,
    JourSeLeveComponent,
    SelecteurComponent,
    AccusationsComponent,
    InformationsComponent,
    VideoMatinComponent,
    CreditsComponent,
    DjaiComponent,
    VoirHistoriqueComponent,
    InfoVillageComponent,
    CreationAppareilsComponent,
    CreationInfoPartieComponent,
    LeaderboardComponent,
    DescriptionRoleComponent,
    MenuRolesComponent,
    SelecteurVillageComponent,
    JeuComponent,
    VillageOngletComponent,
    HistoriqueEvenementComponent,
    JeuAIComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,

    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatExpansionModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatRippleModule,
    MatSelectModule,
    MatSnackBarModule,
    MatStepperModule,
    MatTooltipModule,
    FormsModule,
    ReactiveFormsModule,
    MatGridListModule,
    DragDropModule,
    MatToolbarModule,
    MatTabsModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    ScrollingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
