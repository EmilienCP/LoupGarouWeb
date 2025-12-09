import { EvenementDeGroupe, EvenementIndividuel } from "../../../../common/evenements";
import { Equipe, Role } from "../../../../common/Joueur";
import { IA } from "../IAS/ia";
import { Partie } from "../partie";
import { Chasseur } from "../Personnages/chasseur";
import { ChevalierALepeeRouillee } from "../Personnages/chevalierALepeeRouillee";
import { GrandMechantLoup } from "../Personnages/grantMechantLoup";
import { InfectPereDesLoups } from "../Personnages/infectPereDesLoups";
import { ServanteDevouee } from "../Personnages/servanteDevouee";
import { Villageois } from "../Personnages/villageois";
import { GestionnaireDeTemps } from "./gestionnaireDeTemps";
import { Victoire } from "./victoire";

export class VerificationMorts extends GestionnaireDeTemps{

    private capitaineMort?: Villageois;
    victoire: Victoire;
    amoureux?: Villageois;
    chasseursMorts: Villageois[];
    servanteDevoueeVivante?: Villageois;
    dejaMisVillageoisVillageois: boolean = false;

    constructor(partie: Partie){
        super(["Mort Amoureux", "Ajouter Amoureux", "Servante Devouee Question", "Servante Devouee Action", "Servante Devouee Info", "Prendre Personnage Servante Devouee","Verifier Infecter Mort", "Montrer Roles Morts", "VerifierVillageoisVillageois", "EnleverPouvoirGrandMechantLoup", "Capitaine Mort", "Successeur Capitaine", "Info Successeur", "Info Chevalier A Lepee Rouillee", "Info Mort Chasseur", "Jouer Chasseur", "Info Choix Chasseur", "Annuler Role", "RendreVillageoisVillageois", "Eliminer Morts", "Mettre A Jour IAs Nouveau Village", "Verifier Victoire"], partie)
        this.victoire = new Victoire(partie)
    }
    
    protected async executerProchaineEtape(etapeCourante: number): Promise<boolean> {
        switch(this.listeEtapes[etapeCourante]){
            case "Mort Amoureux":
                if(!this.partie.modeVillageoisVillageois || this.partie.numeroJour>1 || this.dejaMisVillageoisVillageois){
                    let mortsEnAmour: Villageois[] = this.partie.joueursMorts.filter((mort: Villageois)=>{
                        return mort.amoureux != undefined;
                    });
                    if(mortsEnAmour.length == 0){
                        return true;
                    }
                    if(mortsEnAmour.length == 1){
                        this.amoureux = mortsEnAmour[0].amoureux;
                        this.partie.historiqueEvenements.push([this.amoureux!.nom + " meurt aussi puisque ce joueur est en amour avec "+ mortsEnAmour[0].nom]);
                    }
                    if(mortsEnAmour.length == 2){
                        this.partie.historiqueEvenements.push([mortsEnAmour[0].nom + " et " + mortsEnAmour[1].nom + " étaient en amour."]);
                    }
                    if(this.partie.seed){
                        console.log(this.partie.historiqueEvenements[this.partie.historiqueEvenements.length-1][0]);
                    }
                    this.partie.preparerEvenementDeGroupe(EvenementDeGroupe.MORT_AMOUREUX, EvenementDeGroupe.MORT_AMOUREUX)
                    return false;
                }
                return true;
            case "Ajouter Amoureux":
                if(this.amoureux){
                    this.partie.joueursMorts.push(this.amoureux);
                }
                return true;
            case "VerifierVictoireAssumantMorts":
                if(this.partie.verifierVictoireAssumantMorts()){
                    this.retourAEtape(this.listeEtapes.indexOf("Verifier Victoire"))
                }
                return true;
            case "Servante Devouee Question":{
                if(this.partie.joueursMorts.length > 0){
                    this.servanteDevoueeVivante = this.partie.getPersonnages(Role.SERVANTE_DEVOUEE).filter((servante: Villageois)=>{
                        return !this.partie.joueursMorts.includes(servante)
                    })[0]
                    if(this.servanteDevoueeVivante){
                        let joueursRestants: Villageois[] = this.partie.getJoueursReelsEncoreVivants();
                        if(this.dejaMisVillageoisVillageois){
                            joueursRestants=joueursRestants.filter(j=>!this.partie.joueursMorts.includes(j));
                        }
                        if(joueursRestants.length < 2 && !joueursRestants.some((joueur: Villageois)=>{return joueur == this.servanteDevoueeVivante})){
                            this.partie.ias.filter(ia=>ia.villageois == this.servanteDevoueeVivante)[0].evenementsEnAttente.push(EvenementDeGroupe.SERVANTE_DEVOUEE_QUESTION)
                            return false;
                        }
                        if(this.partie.getMeneursDeJeu().length==0 || joueursRestants.length<2){
                            this.partie.preparerEvenementDeGroupe(EvenementDeGroupe.SERVANTE_DEVOUEE_QUESTION, EvenementDeGroupe.SERVANTE_DEVOUEE_QUESTION_MENEUR);
                            return false;
                        } 
                        if(!joueursRestants.some((joueur: Villageois)=>{return joueur == this.servanteDevoueeVivante})){
                            let iaServante: IA = this.partie.ias.filter(ia=>ia.villageois == this.servanteDevoueeVivante)[0];
                            iaServante.evenementsEnAttente.push(EvenementDeGroupe.SERVANTE_DEVOUEE_QUESTION)
                            iaServante.jouer();
                            if((iaServante.villageois as ServanteDevouee).veutPrendrePersonnage){
                                return true;
                            } else {
                                this.partie.preparerEvenementDeGroupe(EvenementDeGroupe.SERVANTE_DEVOUEE_QUESTION_MENEUR, EvenementDeGroupe.SERVANTE_DEVOUEE_QUESTION, [this.servanteDevoueeVivante])
                                return false;
                            }
                        }
                        this.partie.preparerEvenementDeGroupe(EvenementDeGroupe.SERVANTE_DEVOUEE_QUESTION_MENEUR, EvenementDeGroupe.SERVANTE_DEVOUEE_QUESTION)
                        return false
                    }
                }
                return true;
            }
            case "Servante Devouee Action":{
                if((this.servanteDevoueeVivante as ServanteDevouee)?.veutPrendrePersonnage){
                    if((this.servanteDevoueeVivante as ServanteDevouee)!.jouerServante()){
                        return true;
                    }
                    this.partie.preparerEvenementDeGroupe(EvenementDeGroupe.JOUER_SERVANTE_DEVOUEE, EvenementDeGroupe.JOUER_SERVANTE_DEVOUEE, [this.servanteDevoueeVivante!]);
                    this.partie.preparerEvenementsIndividuels(EvenementDeGroupe.JOUER_SERVANTE_DEVOUEE, [this.servanteDevoueeVivante!]);
                    return false;
                }
                return true;
            }
            case "Servante Devouee Info":{
                if((this.servanteDevoueeVivante as ServanteDevouee)?.veutPrendrePersonnage){
                    this.partie.preparerEvenementDeGroupe(EvenementDeGroupe.INFO_SERVANTE_DEVOUEE, EvenementDeGroupe.INFO_SERVANTE_DEVOUEE);
                    this.partie.historiqueEvenements.push(["La Servante dévouée, soit "+this.servanteDevoueeVivante!.nom+" a pris le rôle de " + (this.servanteDevoueeVivante! as ServanteDevouee).cible.nom]);
                    return false;
                }
                return true;
            }
            case "Prendre Personnage Servante Devouee":{
                if((this.servanteDevoueeVivante as ServanteDevouee)?.cible){
                    const cible: Villageois = (this.servanteDevoueeVivante as ServanteDevouee).cible;
                    let nouveauVillageois: Villageois = this.partie.creerVillageois(cible.role, true);
                    nouveauVillageois = this.servanteDevoueeVivante!.copier(nouveauVillageois);
                    nouveauVillageois.estCharmer = false;
                    if(cible.estInfecte){
                        nouveauVillageois.unshiftEvenementIndividuelSansRaisons(EvenementIndividuel.INFO_INFECTE);
                    }
                    nouveauVillageois.unshiftEvenementIndividuelSansRaisons(EvenementIndividuel.MONTRER_PERSONNAGE);
                    nouveauVillageois.unshiftEvenementIndividuelSansRaisons(EvenementIndividuel.CACHER_APPAREIL);
                    this.partie.changerPointeur(this.servanteDevoueeVivante!, nouveauVillageois);
                    nouveauVillageois.actionExServante(cible);
                    cible.role = Role.SERVANTE_DEVOUEE;
                }
                return true;
            }
            case "Verifier Infecter Mort":{
                const joueurCible: Villageois|undefined = this.partie.joueursMorts.find((joueur: Villageois)=>{
                    return joueur.estInfecte && joueur.evenementsIndividuels.includes(EvenementIndividuel.INFO_INFECTE);
                });
                if(joueurCible){
                    joueurCible.estInfecte = false;
                    joueurCible.equipeApparente = Equipe.VILLAGEOIS;
                    joueurCible.evenementsIndividuels.splice(joueurCible.evenementsIndividuels.indexOf(EvenementIndividuel.INFO_INFECTE), 1);
                    if((this.servanteDevoueeVivante as ServanteDevouee)?.cible !== joueurCible){
                        if(this.partie.seed){
                            console.log("L'infect père des loups récupère son pouvoir");
                        }
                        const infectPere: InfectPereDesLoups = this.partie.getPersonnages(Role.INFECT_PERE_LOUPS)[0] as InfectPereDesLoups;
                        infectPere.recupererPouvoir();
                    }
                }
                return true;
            }
            case "Montrer Roles Morts":
                //enlever le mort de la servante pour pas devoiler son role
                if((this.servanteDevoueeVivante as ServanteDevouee)?.cible){
                    this.partie.joueursMorts.splice(this.partie.joueursMorts.indexOf((this.servanteDevoueeVivante as ServanteDevouee)?.cible), 1);
                }

                //verifier la liste des chasseurs ici pour ne pas quil disparaissent au villageois villageois
                if(this.partie.joueursMorts.length == 0){
                    return true;
                }
                // aller chercher les infos des morts du jeu
                let texteListe: string[] = [];
                let texte: string = "";
                this.partie.joueursMorts.forEach((mort: Villageois)=>{
                    texte = ""
                    texte += mort.nom + " était ";
                    texte += this.convertirRoleTexte(mort.role!);
                    texte += ((mort.estInfecte) ? " infecté en loup garou" : "");
                    texteListe.push(texte);
                    if(this.partie.seed){
                        console.log(texte);
                    }
                })
                this.partie.historiqueEvenements.push(texteListe);
                this.partie.preparerEvenementDeGroupe(EvenementDeGroupe.PERSONNAGE_MORTS, EvenementDeGroupe.PERSONNAGE_MORTS);
                return false;
            case "VerifierVillageoisVillageois":{
                // remmettre le joueur mort de la servante devouee
                if((this.servanteDevoueeVivante as ServanteDevouee)?.cible){
                    this.partie.joueursMorts.push((this.servanteDevoueeVivante as ServanteDevouee)?.cible);
                }

                let mortsPasLoups: Villageois[] = this.partie.joueursMorts.filter((mort: Villageois)=>{return mort.equipeApparente!=Equipe.LOUPS});
                if(this.partie.modeVillageoisVillageois && this.partie.numeroJour == 1 && mortsPasLoups.length > 0 && !this.dejaMisVillageoisVillageois){
                    this.partie.historiqueEvenements.push(["Puisque c'est la première nuit, " + this.getNomsEnListe(this.partie.joueursMorts.map((mort: Villageois) =>mort.nom)) + " " + (this.partie.joueursMorts.length>1? "vont": "va") + " revivre en tant que Villageois Villageois"])
                    this.partie.preparerEvenementDeGroupe(EvenementDeGroupe.INFO_VILLAGEOIS_VILLAGEOIS, EvenementDeGroupe.INFO_VILLAGEOIS_VILLAGEOIS)
                    return false;
                }
                return true;
            }
            case "EnleverPouvoirGrandMechantLoup":{
                let grandLoups: Villageois[] = this.partie.getPersonnages(Role.GRAND_MECHANT_LOUP);
                if(grandLoups.some((loup: GrandMechantLoup)=>{return !loup.perdrePouvoir})){
                    if(this.partie.joueursMorts.some((joueur: Villageois)=>{return joueur.equipeApparente == Equipe.LOUPS && !grandLoups.includes(joueur)})){
                        grandLoups.forEach((loup: GrandMechantLoup)=>{loup.enleverPouvoir()});
                        this.partie.historiqueEvenements.push(["Puisqu'un loup garou est éliminé, le grand méchant loup perd son pouvoir."])
                        this.partie.preparerEvenementDeGroupe(EvenementDeGroupe.GRAND_MECHANT_LOUP_PERDRE_POUVOIR, EvenementDeGroupe.GRAND_MECHANT_LOUP_PERDRE_POUVOIR);
                        return false;
                    }
                }
                return true;
            }
            case "Capitaine Mort":
                const listeCapitaineMort: Villageois[] =this.partie.joueursMorts.filter((Villageois: Villageois)=>{
                    return Villageois.estCapitaine;
                }); 

                //verifier qu'il y a au moins 1 personne en vie pcq le dernier mort pourrait etre tué par le chasseur (ou la sorciere qui tue la nuit en meme temps que le loup la tue);
                const joueursVivants: Villageois[] = this.partie.joueursVivants.filter((joueur: Villageois)=>{return !this.partie.joueursMorts.includes(joueur)});
                if(listeCapitaineMort.length == 1 && joueursVivants.length>0 &&(!this.partie.modeVillageoisVillageois || this.partie.numeroJour != 1 || this.dejaMisVillageoisVillageois || listeCapitaineMort[0].equipeApparente==Equipe.LOUPS)){
                    this.capitaineMort = listeCapitaineMort[0];
                    this.partie.historiqueEvenements.push([listeCapitaineMort[0].nom + " était le capitaine. " + listeCapitaineMort[0].nom + " va donc choisir son successeur."])
                    this.partie.preparerEvenementDeGroupe(EvenementDeGroupe.INFO_MORT_CAPITAINE, EvenementDeGroupe.INFO_MORT_CAPITAINE);
                    return false;
                }
                return true;
            case "Successeur Capitaine":
                if(this.capitaineMort){
                    this.partie.preparerEvenementDeGroupe(EvenementDeGroupe.CHOISIR_SUCCESSEUR, EvenementDeGroupe.CHOISIR_SUCCESSEUR, [this.capitaineMort]);
                    this.capitaineMort.choisirSuccesseurPreparer()
                    this.partie.preparerEvenementsIndividuels(EvenementDeGroupe.CHOISIR_SUCCESSEUR, [this.capitaineMort]);
                    return false;
                }
                return true;
            case "Info Successeur":
                if(this.capitaineMort){
                    let capitaine: Villageois | undefined = this.partie.joueursVivants.find((villageois: Villageois)=> {return villageois.estCapitaine})
                    this.partie.historiqueEvenements.push(["Le capitaine a choisi "+ capitaine!.nom + " comme successeur."])
                    this.partie.preparerEvenementDeGroupe(EvenementDeGroupe.INFO_SUCCESSEUR, EvenementDeGroupe.INFO_SUCCESSEUR);
                    return false;
                }
                return true;
            
            case "Info Chevalier A Lepee Rouillee":

                const chevaliers: Villageois[] = this.partie.joueursMorts.filter((joueur: Villageois)=>{return joueur.role == Role.CHEVALIER_A_LEPEE_ROUILLEE});
                if(chevaliers.length>0 && this.partie.joueursVivants.filter((joueur: Villageois)=>{return joueur.equipeApparente == Equipe.LOUPS && !chevaliers.includes(joueur)}).length>0){
                    chevaliers.forEach((chevalier: Villageois)=>{
                        (chevalier as ChevalierALepeeRouillee).trouverLoupTetanos();
                    })
                    this.partie.preparerEvenementDeGroupe(EvenementDeGroupe.INFO_CHEVALIER_A_LEPEE_ROUILLEE, EvenementDeGroupe.INFO_CHEVALIER_A_LEPEE_ROUILLEE)
                    return false;
                }
                return true;
            case "Info Mort Chasseur":{
                this.chasseursMorts = this.partie.joueursMorts.filter((mort: Villageois)=>{
                    return mort.role == Role.CHASSEUR;
                })
                if(this.chasseursMorts.length > 0){
                    this.partie.preparerEvenementDeGroupe(EvenementDeGroupe.INFO_CHASSEUR_MORT, EvenementDeGroupe.INFO_CHASSEUR_MORT)
                    return false;
                }
                return true;
            }
            case "Jouer Chasseur":{
                if(this.chasseursMorts.length > 0){
                    this.partie.preparerEvenementDeGroupe(EvenementDeGroupe.JOUER_CHASSEUR, EvenementDeGroupe.JOUER_CHASSEUR, this.chasseursMorts);
                    this.chasseursMorts.forEach((chasseur: Villageois)=>{
                        (chasseur as Chasseur).jouerChasseur();
                    })
                    this.partie.preparerEvenementsIndividuels(EvenementDeGroupe.JOUER_CHASSEUR, this.chasseursMorts);
                    return false;
                }
                return true;
            }
            case "Info Choix Chasseur":{
                if(this.chasseursMorts.length > 0){
                    this.partie.getPersonnages(Role.CHASSEUR).forEach((chasseur: Chasseur)=>{
                        if(chasseur.choix){
                            this.partie.historiqueEvenements.push([chasseur.nom + " a décidé d'éliminer "+ chasseur.choix.nom]);
                        }
                      })
                    this.partie.preparerEvenementDeGroupe(EvenementDeGroupe.INFO_CHOIX_CHASSEUR, EvenementDeGroupe.INFO_CHOIX_CHASSEUR);
                    return false;
                }
                return true;
            }
            case "Annuler Role":{
                this.partie.joueursMorts.forEach((mort: Villageois)=>{
                    mort.annulerRole((this.servanteDevoueeVivante as ServanteDevouee)?.cible == mort);
                })
                return true;
            }
            case "RendreVillageoisVillageois":{
                if(this.partie.modeVillageoisVillageois && this.partie.numeroJour == 1 && this.partie.joueursMorts.length > 0 && ! this.dejaMisVillageoisVillageois){
                    this.dejaMisVillageoisVillageois = true;
                    this.partie.joueursMorts = this.partie.joueursMorts.filter((mort: Villageois)=>{
                        if(mort.equipeApparente != Equipe.LOUPS) {
                            let villageois: Villageois = this.partie.creerVillageois(Role.VILLAGEOIS);
                            villageois.role = Role.VILLAGEOIS_VILLAGEOIS;
                            villageois = mort.copier(villageois);
                            //le joueur de flute ne doit pas rester independant lorsqu'il devient villageois villageois
                            if(mort.role == Role.JOUEUR_DE_FLUTE && mort.amoureux== undefined){
                                villageois.equipeReelle = villageois.equipeApparente;
                            }
                            if(this.partie.seed){
                                console.log("Rendre villageois villageois "+villageois.nom);
                            }
                            this.partie.changerPointeur(mort, villageois);
                            this.partie.joueursDejaMorts.push(mort);
                            return false;
                        }
                        return true;
                    })
                }
                return true;
            }
            case "Eliminer Morts":
                this.partie.tuerDefinitivementMorts();
                this.partie.joueursMorts = this.chasseursMorts.map((chasseur: Villageois) => {return (chasseur as Chasseur).choix!})
                if(this.partie.joueursMorts.length > 0){
                    this.retourAEtape(0)
                    this.chasseursMorts = [];
                    this.capitaineMort = undefined;
                    this.amoureux = undefined;
                    this.servanteDevoueeVivante = undefined;
                }
                return true;
            case "Mettre A Jour IAs Nouveau Village":
                this.partie.ias.forEach((ia: IA)=>{
                    ia.mettreAJourNouveauVillage();
                })
                return true;
            case "Verifier Victoire":
                if(this.partie.verifierVictoire(this.partie.joueursVivants, true)){
                    if(this.partie.seed){
                        console.log("numero de victoire", this.partie.victoire);
                    }
                    const fini: boolean =  await this.victoire.prochaineEtape();
                    if(!fini){
                        this.retourAEtape(etapeCourante);
                    }
                    return fini;
                } else {
                    return true;
                }
            default:
                return false;
        }
    }

    convertirRoleTexte(role: Role): string {
        switch(role){
            case Role.VILLAGEOIS: return "un Villageois";
            case Role.LOUP_GAROU: return "un Loup-Garou";
            case Role.VILLAGEOIS_VILLAGEOIS: return "un Villageois-Villageois";
            case Role.VOYANTE: return "la Voyante";
            case Role.CUPIDON: return "le Cupidon";
            case Role.SORCIERE: return "la Sorcière";
            case Role.CHASSEUR: return "le Chasseur";
            case Role.INFECT_PERE_LOUPS: return "l'Infect Père des Loups";
            case Role.MONTREUR_OURS: return "le Montreur d'Ours";
            case Role.RENARD: return "le Renard";
            case Role.CORBEAU: return "le Corbeau";
            case Role.FEMME_DE_MENAGE: return "la Femme de Ménage";
            case Role.HYPNOTISEUR: return "l'Hypnotiseur";
            case Role.JOUEUR_DE_FLUTE: return "le Joueur de Flûte";
            case Role.ENFANT_SAUVAGE: return "l'Enfant Sauvage";
            case Role.LOUP_BLANC: return "le Loup-Garou Blanc";
            case Role.SERVANTE_DEVOUEE: return "la Servante Dévouée";
            case Role.CHEVALIER_A_LEPEE_ROUILLEE: return "le Chevalier À l'Épée Rouillée";
            case Role.DEUX_SOEURS: return "l'une des Deux Soeurs";
            case Role.TROIS_FRERES: return "l'un des Trois Frères";
            case Role.GRAND_MECHANT_LOUP: return "le Grand Méchant Loup";
          }
    }

    private getNomsEnListe(noms: string[]): string{
        let texte: string = ""
        noms.forEach((nom: string, index: number)=>{
          texte+=" "+nom;
          if(index < noms.length-2){
            texte+=","
          } else if(index == noms.length-2) {
            texte+=" et"
          }
        })
        return texte;
      }
    
}