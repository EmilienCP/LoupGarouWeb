import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccusationsComponent } from './accusations/accusations.component';
import { AttenteComponent } from './attente/attente.component';
import { BoutonMenuComponent } from './bouton-menu/bouton-menu.component';
import { CreationComponent } from './creation/creation.component';
import { CreditsComponent } from './credits/credits.component';
import { DjaiComponent } from './djai/djai.component';
import { HomeComponent } from './home/home.component';
import { InfoVillageComponent } from './info-village/info-village.component';
import { InformationsComponent } from './informations/informations.component';
import { JoindreComponent } from './joindre/joindre.component';
import { JourSeLeveComponent } from './jour-se-leve/jour-se-leve.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';
import { MenuRolesComponent } from './menu-roles/menu-roles.component';
import { MenuComponent } from './menu/menu.component';
import { MontrerPersonnageComponent } from './montrer-personnage/montrer-personnage.component';
import { SelecteurComponent } from './selecteur/selecteur.component';
import { VideoMatinComponent } from './video-matin/video-matin.component';
import { VoirHistoriqueComponent } from './voir-historique/voir-historique.component';
import { JeuComponent } from './jeu/jeu.component';
import { JeuAIComponent } from './jeu-ai/jeu-ai.component';

const routes: Routes = [
  {path: '', component: BoutonMenuComponent},
  {path: 'creationComponent', component: CreationComponent},
  {path: 'joindreComponent', component: JoindreComponent},
  {path: 'djai', component: DjaiComponent},
  {path: '2048', component: JeuAIComponent},
  {path: 'historique', component: VoirHistoriqueComponent},
  {path: 'menuRolesComponent', component: MenuRolesComponent},
  {path: 'creditsComponent', component: CreditsComponent},
  {path: 'jeuComponent', component: JeuComponent, children: [
    {path: '', component: AttenteComponent},
    {path: 'informationsComponent', component: InformationsComponent},
    {path: 'montrerPersonnageComponent', component: MontrerPersonnageComponent},
    {path: 'jourSeLeveComponent', component: JourSeLeveComponent},
    {path: 'selecteurComponent', component: SelecteurComponent},
    {path: 'accusationsComponent', component: AccusationsComponent},
    {path: 'videoMatinComponent', component: VideoMatinComponent},
    {path: 'infoVillage', component: InfoVillageComponent},
    {path: 'leaderBoardComponent', component: LeaderboardComponent},
    {path: 'creditsComponent', component: CreditsComponent}
  ]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {scrollPositionRestoration: 'disabled'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
