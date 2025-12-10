import { Equipe, Role } from "../../../../common/Joueur";
import { EvenementDeGroupe, EvenementIndividuel, RaisonPasVoter } from "../../../../common/evenements";
import { Partie } from "../partie";
import { Villageois } from "../Personnages/villageois";
import { Vote } from "../vote";
import { MontreurOurs } from "../Personnages/montreurOurs";
import { Corbeau } from "../Personnages/corbeau";
import { RaisonAccusation } from "../../../../common/accusation";
import { ServanteDevouee } from "../Personnages/servanteDevouee";
import { Matin } from "../temps/matin";

export class IA {
    villageois: Villageois;
    partie: Partie;
    evenementsEnAttente: (EvenementDeGroupe|EvenementIndividuel)[];
    cotes: Map<Villageois, number[]>;
    private joueursMemeEquipeAssuree: Villageois[];
    private joueursPasMemeEquipeAssuree: Villageois[]; // cette liste sert juste aux villlageois pas independants;
    villageoisPublics: Villageois[];
    villageoisPublicsNonIndependants: Villageois[];
    loupsPublics: Villageois[];
    loupsNouveaux: Villageois[]; //pour les loups seulement;
    loupsAnciens: Villageois[]; //pour les loups seulement;
    voteDuJour: Vote;
    rolePretendEtre?: Role;

    constructor(villageois: Villageois, partie: Partie) {
        this.villageois = villageois;
        this.partie = partie;
        this.evenementsEnAttente = [];
        this.cotes = new Map<Villageois, number[]>();
        this.joueursMemeEquipeAssuree = [];
        this.joueursPasMemeEquipeAssuree = [];
        this.villageoisPublics = [];
        this.villageoisPublicsNonIndependants = [];
        this.loupsPublics = [];
        this.loupsNouveaux = [];
        this.loupsAnciens = [];
    }

    copierVillageoisVillageois(ia: IA): IA{ // pour la servante devouee et le villageois villageois
        ia.evenementsEnAttente = this.evenementsEnAttente;
        ia.cotes = this.cotes;
        ia.voteDuJour = this.voteDuJour;
        ia.villageoisPublics = this.villageoisPublics;
        ia.villageoisPublicsNonIndependants = this.villageoisPublicsNonIndependants;
        ia.loupsPublics = this.loupsPublics;
        ia.joueursMemeEquipeAssuree = this.joueursMemeEquipeAssuree;
        ia.joueursPasMemeEquipeAssuree = this.joueursPasMemeEquipeAssuree;
        ia.rolePretendEtre = Role.VILLAGEOIS_VILLAGEOIS;
        return ia;
    }

    copierServanteDevouee(ia: IA): IA{
        ia.evenementsEnAttente = this.evenementsEnAttente;
        ia.cotes = this.cotes;
        ia.voteDuJour = this.voteDuJour;
        ia.villageoisPublics = this.villageoisPublics;
        ia.villageoisPublicsNonIndependants = this.villageoisPublicsNonIndependants;
        ia.loupsPublics = this.loupsPublics;
        if(ia.villageois.equipeReelle != this.villageois.equipeReelle){
            //garder les amoureux sil est en amour, retirer les autres joueurs seulement sil change dequipe
            ia.joueursMemeEquipeAssuree = [this.villageois];
            ia.joueursPasMemeEquipeAssuree = [];
        } else {
            ia.joueursMemeEquipeAssuree = this.joueursMemeEquipeAssuree;
            ia.joueursPasMemeEquipeAssuree = this.joueursPasMemeEquipeAssuree;
        }
        return ia;
    }

    changerPointeur(ancienJoueur: Villageois, nouveauJoueur: Villageois){
        if(this.villageois == ancienJoueur){
            this.villageois = nouveauJoueur;
        }
        if(this.villageoisPublics.includes(ancienJoueur)){
            this.villageoisPublics[this.villageoisPublics.indexOf(ancienJoueur)] = nouveauJoueur;
        }
        if(this.villageoisPublicsNonIndependants.includes(ancienJoueur)){
            this.villageoisPublicsNonIndependants[this.villageoisPublicsNonIndependants.indexOf(ancienJoueur)] = nouveauJoueur;
        }
        if(this.loupsPublics.includes(ancienJoueur)){
            this.loupsPublics[this.loupsPublics.indexOf(ancienJoueur)] = nouveauJoueur;
        }
        if(this.joueursMemeEquipeAssuree.includes(ancienJoueur)){
            this.joueursMemeEquipeAssuree[this.joueursMemeEquipeAssuree.indexOf(ancienJoueur)] = nouveauJoueur;
        }
        if(this.joueursPasMemeEquipeAssuree.includes(ancienJoueur)){
            this.joueursPasMemeEquipeAssuree[this.joueursPasMemeEquipeAssuree.indexOf(ancienJoueur)] = nouveauJoueur;
        }
        if(this.loupsNouveaux.includes(ancienJoueur)){
            this.loupsNouveaux[this.loupsNouveaux.indexOf(ancienJoueur)] = nouveauJoueur;
        }
        if(this.loupsAnciens.includes(ancienJoueur)){
            this.loupsAnciens[this.loupsAnciens.indexOf(ancienJoueur)] = nouveauJoueur;
        }
        if(ancienJoueur!== this.villageois){
            let cotes: number[] = this.cotes.get(ancienJoueur)!;
            this.cotes.delete(ancienJoueur);
            this.cotes.set(nouveauJoueur, cotes);
        }
    }

    initialiserCotes():void{
        this.partie.joueursVivants.forEach((villageois: Villageois)=>{
            this.cotes.set(villageois, [0,0]);
        })
        this.ajouterJoueursMemeEquipeAssuree(this.villageois);
    }

    retirerJoueur(villageois: Villageois): void{
        this.cotes.delete(villageois);
        if(this.villageoisPublics.includes(villageois)){
            this.villageoisPublics.splice(this.villageoisPublics.indexOf(villageois), 1);
        }
        if(this.villageoisPublicsNonIndependants.includes(villageois)){
            this.villageoisPublicsNonIndependants.splice(this.villageoisPublicsNonIndependants.indexOf(villageois), 1);
        }
        if(this.loupsPublics.includes(villageois)){
            this.loupsPublics.splice(this.loupsPublics.indexOf(villageois), 1);
        }
        if(this.joueursMemeEquipeAssuree.includes(villageois)){
            this.joueursMemeEquipeAssuree.splice(this.joueursMemeEquipeAssuree.indexOf(villageois), 1);
        }
        if(this.joueursPasMemeEquipeAssuree.includes(villageois)){
            this.joueursPasMemeEquipeAssuree.splice(this.joueursPasMemeEquipeAssuree.indexOf(villageois), 1);
        }
    }

    mettreAJourNouveauVillage(): void{
        this.partie.getPersonnages(Role.VILLAGEOIS_VILLAGEOIS).forEach((joueur: Villageois)=>{
            if(this.siJoueurSafe(joueur, false, false, false, false, true)){
                if(!this.villageoisPublics.includes(joueur)){
                    this.villageoisPublics.push(joueur);
                }
            }
            if(this.siJoueurSafe(joueur,true, false, false, false, true)){
                if(!this.villageoisPublicsNonIndependants.includes(joueur)){
                    this.villageoisPublicsNonIndependants.push(joueur);
                }
                if(this.villageois.equipeReelle == Equipe.VILLAGEOIS){
                    this.ajouterJoueursMemeEquipeAssuree(joueur);
                }
            }
        })
        this.villageoisPublics.forEach((joueur: Villageois)=>{
            if(this.siJoueurSafe(joueur, true, true, true, false, true)){
                if(!this.villageoisPublicsNonIndependants.includes(joueur)){
                    this.villageoisPublicsNonIndependants.push(joueur);
                }
            }
        })
        if(this.villageois.equipeApparente == Equipe.LOUPS){
            this.partie.joueursVivants.forEach((joueur: Villageois)=>{
                if(this.siJoueurSafe(joueur, true, false, false, true, false)){
                    if(joueur.equipeApparente == Equipe.LOUPS){
                        this.ajouterJoueursMemeEquipeAssuree(joueur);
                    }
                }
                if(joueur.equipeApparente == Equipe.LOUPS && !this.loupsAnciens.includes(joueur)){
                    if(!this.loupsNouveaux.includes(joueur)){
                        this.loupsNouveaux.push(joueur);
                        if(this.villageois.equipeReelle == Equipe.LOUPS){
                            this.augmenterDiminuerCote(joueur, 2, true)
                        } else{
                            this.augmenterDiminuerCote(joueur, 1, true)
                        }
                    }
                }
                //Pour l'infecter seulement
                if(this.siJoueurSafe(joueur, true, true, false, false, false) && this.loupsNouveaux.includes(joueur)){
                    this.ajouterJoueursMemeEquipeAssuree(joueur)
                }
            });
        }
    }

    preparerEvenementsIndividuels(listeVillageois: Villageois[] = []){
        if(listeVillageois.length == 0 || listeVillageois.includes(this.villageois)){
            this.evenementsEnAttente = this.evenementsEnAttente.concat(this.villageois.viderEvenementsIndividuels());
        }
    }

    jouer(): void {
        this.evenementsEnAttente.forEach((evenement: EvenementDeGroupe|EvenementIndividuel)=>{
            this.jouerUnEvenement(evenement);
        })
        this.evenementsEnAttente = [];
    }

    protected jouerUnEvenement(evenement: EvenementDeGroupe|EvenementIndividuel): void{
        switch(+evenement){
            //ajuster la cote en fonction des resultats des votes
            case EvenementIndividuel.VOTER_CAPITAINE:{
                this.villageois.choisirJoueur(this.getVillageoisAuHasard(this.joueursAucuneRaisonPasVoter(false)), evenement, false);
                break;
            }
            case EvenementIndividuel.JOUER_VILLAGEOIS:{
                this.villageois.popRaisonsPasVoter();
                break;
            }
            case EvenementIndividuel.JOUER_LOUP_GAROU:{
                if(this.partie.numeroJour == 0){
                    this.majCotesDevenirLoup();
                }
                let joueursAucuneRaisonPasVoter: Villageois[] = this.joueursAucuneRaisonPasVoter(false);
                //joueur de flute
                let voteJoueurDeFlute: boolean = false;
                if(this.villageois.role !== Role.JOUEUR_DE_FLUTE && this.partie.getPersonnages(Role.JOUEUR_DE_FLUTE).length>0 && this.villageois.estCharmer){
                    let joueursNonCharmer: Villageois[] = this.partie.joueursVivants.filter((joueur: Villageois)=>{
                        return !joueur.estCharmer && joueur.role !== Role.VILLAGEOIS_VILLAGEOIS
                    })
                    if(joueursNonCharmer.length<=3){
                        joueursNonCharmer = this.conjonction([joueursNonCharmer, joueursAucuneRaisonPasVoter], [this.joueursMemeEquipeAssuree])
                        if(this.loupsAnciens.includes(this.villageois)){
                            joueursNonCharmer = this.conjonction([joueursNonCharmer], [this.loupsAnciens])
                        }
                        if(joueursNonCharmer.length >0){
                            voteJoueurDeFlute = true;
                            joueursAucuneRaisonPasVoter = joueursNonCharmer;
                        }
                    }
                }
                if(voteJoueurDeFlute){
                    this.villageois.choisirJoueur(this.getMaxOuMinCote(false, this.ciblePourLoups(joueursAucuneRaisonPasVoter)), evenement, false);
                    this.villageois.choisirJoueur(this.getMaxOuMinCote(false, this.ciblePourLoups(joueursAucuneRaisonPasVoter)), evenement, false);
                } else {
                    this.villageois.choisirJoueur(this.getMaxOuMinCote(false, this.ciblePourLoups(joueursAucuneRaisonPasVoter)), evenement, false);
                    this.villageois.choisirJoueur(this.getMaxOuMinCote(false, this.ciblePourLoups(this.joueursAucuneRaisonPasVoterLoups(false))), evenement, false);
                    let dernierChoixPotentiels: Villageois[] = this.joueursAucuneRaisonPasVoterLoups(true);
                    if(dernierChoixPotentiels.length >0){
                        this.villageois.choisirJoueur(this.getMaxOuMinCote(false, this.ciblePourLoups(dernierChoixPotentiels)), evenement, true);
                    }
                }
                break;
            }
            case EvenementIndividuel.CHOISIR_SUCCESSEUR:{
                if(this.villageois.equipeReelle == Equipe.LOUPS){
                    this.villageois.choisirJoueur(this.getVillageoisAuHasard(this.joueursAucuneRaisonPasVoter(false)), evenement, false);
                } else {
                    this.villageois.choisirJoueur(this.getMaxOuMinCote(true, this.joueursAucuneRaisonPasVoter(false)), evenement, false);
                }
                break;
            }
            case EvenementIndividuel.TRANCHER_CAPITAINE:{
                if(this.villageois.estCapitaine){
                    this.villageois.choisirJoueur(this.getMaxOuMinCote(false, this.joueursAucuneRaisonPasVoter(false)), evenement, false);
                }
                break;
            }
            case EvenementIndividuel.VOTER:{
                this.voter(evenement);
                break;
            }
            case EvenementDeGroupe.INFO_VOTES:{
                if(this.partie.numeroJour > 0){
                    this.majCotesDesVotes();
                }
                break;
            }
            case EvenementDeGroupe.PERSONNAGE_MORTS:{
                if(this.partie.numeroJour > 1){
                    this.majCotesMontrerMort();
                }
                this.changementRolePretendEtreMontrerMorts();
                break;
            }
            case EvenementIndividuel.INFO_AMOUREUX:{
                this.tomberEnAmour();
                break;
            }
            case EvenementIndividuel.INFO_ASSOCIER_MORT:
            case EvenementIndividuel.INFO_INFECTE: {
                this.majCotesDevenirLoup();
                this.loupsAnciens.splice(this.loupsAnciens.indexOf(this.villageois), 1);
                break;
            }
            case EvenementDeGroupe.CORBEAU: {
                if(this.villageois.role != Role.CORBEAU){
                    this.partie.getPersonnages(Role.CORBEAU).forEach((corbeau: Villageois)=>{
                        if(this.villageois.equipeReelle == Equipe.VILLAGEOIS && (corbeau as Corbeau).joueurVu! !== this.villageois){
                            //corbeau trop exagerer donc diminuer limpact de 1/3
                            //les joueurs pas villageois ne seront pas affecter par ce changement
                            if(this.partie.random(Math.floor(this.partie.joueursVivants.length/2)) == 0){
                                this.augmenterDiminuerCote((corbeau as Corbeau).joueurVu!, -1, false)
                            }
                        }
                    })
                }
                break;
            }
            case EvenementIndividuel.JOUER_PATATE_CHAUDE:{
                this.villageois.choisirJoueur(this.getMaxOuMinCote(false, this.joueursAucuneRaisonPasVoter(false)),evenement,false);
                break;
            }
            case EvenementDeGroupe.INFO_SERVANTE_DEVOUEE: {
                let servante: ServanteDevouee = (this.partie.getPersonnages(Role.SERVANTE_DEVOUEE)[0] as ServanteDevouee);
                if(this.villageois.equipeReelle == Equipe.VILLAGEOIS){
                    //uniquement transferer les cotes quand cest un villlageois pcq les loups veulent garder la cote de la servante;
                    //possible que la cible n'ait pas de cote, ca peut etre un joueur dans les liste dequipe assurer etc;
                    if(this.cotes.get(servante.cible)){
                        this.cotes.set(servante, this.cotes.get(servante.cible)!);
                    }

                    //si la servante dévouée prend le role de qqn qui est mort la nuit
                    if(this.partie.gestionnaireEtape.gestionnaireDeTemps instanceof Matin){
                        //il y a beaucoup de chances que le nouveau role de la servante soit villageois. sauf si la sorciere a tué un loup.
                        this.augmenterDiminuerCote(servante, 2, true);
                    }
                }
                break;
            }
            case EvenementDeGroupe.INFO_VILLAGEOIS_VILLAGEOIS:{
                //se fait en 2 parties: 1 doit augmenter la cote par rapport a tous les joueurs une seule fois. 2 à chaque nouveau mort verifier si le villageois villageois est safe (fait dans une autre section du cote);
                //quil soit loup ou villageois augmenter la cote au moins pour pas etre super louche a accuser un villlageois villageois
                this.partie.joueursMorts.forEach((joueur: Villageois)=>{
                    this.augmenterDiminuerCote(joueur, 1, true);
                })
                break;
            }
            case EvenementIndividuel.JOUER_INSTITUTRICE:{
                this.jouerInstitutrice();
                break;
            }
        }
    }

    protected voter(evenement: EvenementIndividuel|EvenementDeGroupe){
        const choixPossibles: Villageois[] = this.joueursAucuneRaisonPasVoter(false);
        const filtreloupsPublics: Villageois[] = choixPossibles.filter((villageois: Villageois)=>{return this.loupsPublics.includes(villageois)});
        const filtreVillageoisPublicsNonIndependants: Villageois[] = choixPossibles.filter((villageois: Villageois)=>{return this.villageoisPublicsNonIndependants.includes(villageois)});
        let choixFinal: Villageois;
        if(filtreloupsPublics.length>0){
            choixFinal = this.getMaxOuMinCote(false, filtreloupsPublics);
        } else if(filtreVillageoisPublicsNonIndependants.length > 0 && filtreVillageoisPublicsNonIndependants.length < choixPossibles.length){
            // voter pour tous ceux qui ne sont pas des villageois publics non independants
            const soustraction: Villageois[] = choixPossibles.filter((choix: Villageois)=>{return !filtreVillageoisPublicsNonIndependants.includes(choix)});
            choixFinal = this.getMaxOuMinCote(false, soustraction);
        } else {
            choixFinal = this.getMaxOuMinCote(false, choixPossibles);
        }
        this.villageois.choisirJoueur(choixFinal, evenement, false);
    }

    jouerInstitutrice(){
        const choixPossibles: Villageois[] = this.obtenirJoueursAucuneRaisonPasVoter(this.partie.joueursVivants, this.villageois.getRaisonsPasVoterInstitutrice(), true);
        if(choixPossibles.length>0){
            this.villageois.institutricePunir(this.getVillageoisAuHasard(choixPossibles));
        }
    }

    private ciblePourLoups(liste: Villageois[]): Villageois[]{
        const listeFiltree: Villageois[] = liste.filter((joueur: Villageois)=>{
            return this.villageoisPublics.includes(joueur) && joueur.role != Role.VILLAGEOIS_VILLAGEOIS;
        })
        if(listeFiltree.length >0){
            return listeFiltree;
        }
        return liste;
    }

    protected getVillageoisAuHasard(liste: Villageois[]): Villageois{
        let index:number = Math.floor(this.partie.random(liste.length));
        if(liste[index]== undefined){
            throw new Error(this.villageois.nom + " tente de choisir le joueur #"+index+" mais cest undefined. Info de la liste "+liste.map(joueur=>joueur.nom))
        }
        return liste[index];
    }

    protected obtenirJoueursAucuneRaisonPasVoter(village: Villageois[], raisons: RaisonPasVoter[], normalDavoirPersonne: boolean): Villageois[] {
        if(!raisons.includes(RaisonPasVoter.AUCUN) && !normalDavoirPersonne){
            throw new Error(this.villageois.nom + " tente de faire un choix du village mais n'a personne pour qui voter")
        }
        return this.partie.joueursVivants.filter((villageois: Villageois, index: number)=>{
            return raisons[index] == RaisonPasVoter.AUCUN && village.includes(villageois);
        })
    }

    protected joueursAucuneRaisonPasVoter(normalDavoirPersonne: boolean): Villageois[]{
        let raisons: RaisonPasVoter[] = this.villageois.popRaisonsPasVoter();
        return this.obtenirJoueursAucuneRaisonPasVoter(this.partie.joueursVivants, raisons, normalDavoirPersonne);
    } 

    protected joueursAucuneRaisonPasVoterLoups(normalDavoirPersonne: boolean): Villageois[]{
        let raisons: RaisonPasVoter[] = this.villageois.getRaisonsPasVoterLoups();
        return this.obtenirJoueursAucuneRaisonPasVoter(this.partie.joueursVivants, raisons, normalDavoirPersonne);
    } 

    protected joueursAucuneRaisonPasVoterAccuser(village: Villageois[] = this.partie.joueursVivants): Villageois[]{
        let raisons: RaisonPasVoter[] = this.villageois.getRaisonsPasVoterAccusation();
        let joueursFiltres: Villageois[] = this.obtenirJoueursAucuneRaisonPasVoter(village, raisons, true);

        //enlever certaines personnes de la liste si cest un loup ou un independant
        if(this.villageois.equipeReelle!== Equipe.VILLAGEOIS){
            const joueursFiltres2: Villageois[] = joueursFiltres.filter((joueur: Villageois)=>{
                return !this.villageoisPublicsNonIndependants.includes(joueur);
            })
            if(joueursFiltres2.length>0){
                joueursFiltres = joueursFiltres2;
            }
        }
        //specifique aux ias, enlever leurs joueurs que cest SUR quils vont jamais accuser
        joueursFiltres = joueursFiltres.filter((joueur: Villageois)=>{return !this.joueursMemeEquipeAssuree.includes(joueur)});
        return joueursFiltres;
    }

    tomberEnAmour(): void{
        this.ajouterJoueursMemeEquipeAssuree(this.villageois.amoureux!);
    }

    ajustementCoteAccusation(electeur: Villageois, cible: Villageois): void{
        //les raisons daccusations ne devraient pas etre incluees, pcq on saura jamais les raisons des joueurs reels
        if(this.joueursMemeEquipeAssuree.includes(cible)){
            this.augmenterDiminuerCote(electeur, -2, true);
        } else if(this.villageois.equipeApparente == Equipe.LOUPS){
            this.augmenterDiminuerCote(electeur, cible.equipeApparente == Equipe.LOUPS? 1: -1, false);
        }
    }

    majCotesDesVotes(): void{
        this.voteDuJour = this.partie.voteCourant.copier();
        this.voteDuJour.getAccuses().forEach((accuse: Villageois, indexAccuse: number)=>{
            if(this.joueursMemeEquipeAssuree.includes(accuse)){
                this.voteDuJour.getElecteurs()[indexAccuse].forEach((electeur: Villageois)=>{
                    this.augmenterDiminuerCote(electeur, -1, true);
                });
            } else if(this.villageois.equipeApparente == Equipe.LOUPS){
                this.voteDuJour.getElecteurs()[indexAccuse].forEach((electeur: Villageois)=>{
                    this.augmenterDiminuerCote(electeur, accuse.equipeApparente == Equipe.LOUPS?1:-1, false);
                });
            }
        });
    }

    protected majCotesMontrerMort(): void{
        // se produit pour un mort le matin ou le soir, meme si cest le matin, cest bon de savoir le role et dajuster la cote du dernier vote du jour
        this.partie.joueursMorts.forEach((mort: Villageois)=>{
            if(this.voteDuJour.estAccuser(mort) && this.villageois.equipeApparente == Equipe.VILLAGEOIS){
                if(mort.equipeApparente == Equipe.LOUPS){
                    this.voteDuJour.getElecteurs()[this.voteDuJour.getAccuses().indexOf(mort)].forEach((electeur: Villageois)=>{
                        this.augmenterDiminuerCote(electeur, 1, false);
                    })
                } else if(mort.equipeApparente == Equipe.VILLAGEOIS){
                    this.voteDuJour.getElecteurs()[this.voteDuJour.getAccuses().indexOf(mort)].forEach((electeur: Villageois)=>{
                        this.augmenterDiminuerCote(electeur, -1, false);
                    })
                }
            }
            if(mort.role == Role.MONTREUR_OURS){ // quil soit villageois ou loup garou ca sapplique
                let joueurDroit: Villageois = this.partie.joueursVivants[this.partie.joueurVoisin(false, mort)];
                let joueurGauche: Villageois = this.partie.joueursVivants[this.partie.joueurVoisin(true, mort)];
                if(!(mort as MontreurOurs).oursGrogne()){
                    this.villageoisPublicPourOurs(joueurDroit);
                    this.villageoisPublicPourOurs(joueurGauche);
                } else {
                    //ne pas tenir compte des amoureux ici, le loup public peut quand meme etre trouvé
                    //Ici, il manque encore du travail, ce n'est pas seulement les villageois villageois qui peuvent permettre de déduire les loups publics
                    if(this.siJoueurSafe(joueurGauche, false, false, true, false, true) && this.villageoisPublics.includes(joueurDroit)){
                        this.loupPublic(joueurGauche);
                    } else if(this.siJoueurSafe(joueurDroit, false, false, true, false, true) && this.villageoisPublics.includes(joueurGauche)){
                        this.loupPublic(joueurDroit);
                    } else {
                        //ce truc n'affecte pas les independants
                        if(this.villageois.equipeApparente == Equipe.VILLAGEOIS){
                            this.augmenterDiminuerCote(joueurDroit, -1, false)
                            this.augmenterDiminuerCote(joueurGauche, -1, false)
                        }
                    }
                }
            }
        })
    }

    changementRolePretendEtreMontrerMorts(): void{
        this.partie.joueursMorts.forEach((mort: Villageois)=>{
            if(mort.role == this.rolePretendEtre){
                this.rolePretendEtre = undefined;
            }
        })
    }

    majCotesDevenirLoup(): void{
        this.partie.joueursVivants.forEach((villageois: Villageois)=>{
            if(villageois.equipeApparente == Equipe.LOUPS){
                if(this.siJoueurSafe(villageois, true, false, false, true, false) && this.villageois.equipeReelle == Equipe.LOUPS){
                    this.ajouterJoueursMemeEquipeAssuree(villageois)
                } else if(this.villageois.equipeReelle == Equipe.LOUPS) {
                    this.augmenterDiminuerCote(villageois, 2, true);
                } else {
                    this.augmenterDiminuerCote(villageois, 1, true);
                }
                this.loupsAnciens.push(villageois);
            }
        })
    }

    augmenterDiminuerCote(villageois: Villageois, valeur: number, appreciationOuEquipe: boolean){
        if(this.cotes.get(villageois) == undefined){
            //peut etre normal, quand il augmente et diminue des cotes de gens qu'il a déjà classé dans son équipe ou non, pu besoin de tenir compte de sa cote
            return;
        }
        let cote: number = this.cotes.get(villageois)![appreciationOuEquipe?0:1];
        let autreCote: number = this.cotes.get(villageois)![appreciationOuEquipe?1:0];
        cote+= valeur;
        if(cote > 10){
            cote = 10
        } else if(cote < -10){
            cote = -10
        }
        this.cotes.set(villageois, [appreciationOuEquipe?cote:autreCote, appreciationOuEquipe?autreCote:cote])
    }

    getMaxOuMinCote(max: boolean, listeVillageois: Villageois[]): Villageois{
        const listePriorite: Villageois[] = max? this.joueursMemeEquipeAssuree: this.joueursPasMemeEquipeAssuree;
        const listeAEnlever: Villageois[] = max? this.joueursPasMemeEquipeAssuree: this.joueursMemeEquipeAssuree;

        const APrioriser: Villageois[] = listeVillageois.filter((villageois) => {
            return listePriorite.includes(villageois);
        })
        if(APrioriser.length > 0) {
            return this.getVillageoisAuHasard(APrioriser);
        }

        const AConserver: Villageois[] = listeVillageois.filter((villageois) => {
            return !listeAEnlever.includes(villageois);
        })
        if(AConserver.length == 0) {
            //si tous les choix sont dans la liste a enlever
            return this.getVillageoisAuHasard(listeVillageois);
        }

        //si tous les choix sont ni dans la listePriorite, ni dans la listeAEnlever
        let cotes: number[] = this.getValeursCotes(AConserver);
        const minMax: number = this.getValeurMinMax(max, cotes);
        const nouveauxChoix: (Villageois | undefined)[] = cotes.map((valeurCote: number, indexJoueur: number)=>{
            return (valeurCote == minMax)?this.partie.joueursVivants[this.partie.joueursVivants.indexOf(AConserver[indexJoueur])]: undefined;
        }).filter((valeur: Villageois | undefined)=>{
            return valeur != undefined;
        })
        return nouveauxChoix[this.partie.random(nouveauxChoix.length)]!;
    }

    protected getValeursCotes(listeVillageois: Villageois[]): number[]{
        if(listeVillageois.some((villageois:Villageois)=>{return this.cotes.get(villageois)== undefined})){
            throw new Error(this.villageois.nom+ " essaie de get valeurs des cotes de villageois qui n'ont pas de cote! Liste des villageois problematiques : "+ listeVillageois.filter(villageois=>this.cotes.get(villageois)== undefined).map(villageois=>villageois.nom));
        }
        //possible de vouloir aller chercher uniquement la valeur de la cote d'une liste qui contient des joueurs qui n'ont pas de cotes
        return listeVillageois.map((villageois: Villageois)=>{
            let facteurEquipe: number = 0;
            if(this.villageois.equipeReelle == Equipe.LOUPS){
                facteurEquipe = -1;
            } else if(this.villageois.equipeReelle == Equipe.VILLAGEOIS){
                facteurEquipe = 1;
            }
            return this.cotes.get(villageois)![0]+this.cotes.get(villageois)![1]*facteurEquipe;
        })
    }

    protected getValeurMinMax(max: boolean, cotes: number[]): number{
        return max?Math.max(...cotes):Math.min(...cotes);
    }

    loupPublic(cible: Villageois): void {
        if(!this.loupsPublics.includes(cible)){
            this.loupsPublics.push(cible);
        }
    }

    siJoueurSafe(joueur: Villageois, enAmour: boolean, joueurDeFlute: boolean, enfantSauvage: boolean, loupBlanc: boolean, infecte: boolean):boolean{
        if(enAmour && this.partie.joueursVivants.some((joueur: Villageois)=>{return joueur.amoureux !== undefined})){
            return false;
        }
        if(joueurDeFlute && this.partie.getPersonnages(Role.JOUEUR_DE_FLUTE).length>0){
            return false;
        }
        if(enfantSauvage && this.partie.getPersonnages(Role.ENFANT_SAUVAGE).length>0){
            return false;
        }
        if(loupBlanc  && this.partie.getPersonnages(Role.LOUP_BLANC).length>0){
            return false;
        }
        if(infecte && (this.partie.joueursDejaMorts.some((joueur: Villageois)=>{return joueur.estInfecte})|| !this.partie.joueursVivants.concat(this.partie.joueursDejaMorts).some((joueur: Villageois)=>{joueur.role == Role.INFECT_PERE_LOUPS}))){
            return false;
        }
        return true;
    }

    private villageoisPublicPourOurs(cible: Villageois): void {
        if(this.siJoueurSafe(cible ,false, false, true, false, true)){
            if(!this.villageoisPublics.includes(cible)){
                this.villageoisPublics.push(cible);
                if(this.villageois.equipeApparente == Equipe.LOUPS){
                    //si le joueur est un loup, alors il voudra tuer la nuit les villageois public pour pas etre pogner a les accuser plus tard
                    this.augmenterDiminuerCote(cible, -1, true);
                }
            }
            if(this.siJoueurSafe(cible, true, true, true, false, true)){
                if(!this.villageoisPublicsNonIndependants.includes(cible)){
                    this.villageoisPublicsNonIndependants.push(cible);
                    if(this.villageois.equipeApparente == Equipe.LOUPS){
                        //si le joueur est un loup, alors il voudra tuer la nuit les villageois public pour pas etre pogner a les accuser plus tard
                        this.augmenterDiminuerCote(cible, -1, true);
                    }
                }
            }
        } else {
            this.augmenterDiminuerCote(cible, 1, true);
        }
    }

    //Phases d'accusations:
    //Phase 1: accuserSiInsister
    accuserSiInsister(): boolean{
        const pireCote: number = this.getValeurMinMax(false, this.getValeursCotes(this.conjonction([this.joueursAucuneRaisonPasVoterAccuser()], [this.joueursMemeEquipeAssuree, this.joueursPasMemeEquipeAssuree])));
        const pireJoueursNonAccuses: Villageois[] =  this.joueursAucuneRaisonPasVoterAccuser().filter((joueur: Villageois)=>{return this.joueursPasMemeEquipeAssuree.includes(joueur)})
        if(pireCote < -5 || pireJoueursNonAccuses.length>0){
            const cible: Villageois = this.getMaxOuMinCote(false, this.joueursAucuneRaisonPasVoterAccuser());
            if(!this.partie.voteCourant.estAccuser(cible)){
                this.villageois.choisirJoueur(cible, EvenementDeGroupe.ACCUSER, false, this.trouverRaisonParDefaut(cible))
                return true;
            }
        }
        return false;
    }

    protected trouverRaisonParDefaut(cible: Villageois): RaisonAccusation{
        if(this.partie.random(this.partie.joueursVivants.length) == 0){
            if(this.partie.getPersonnages((Role.MONTREUR_OURS)).filter((montreur: MontreurOurs)=>{
                return montreur.oursGrogne();
            }).length >0 && (this.partie.joueurVoisin(true, this.villageois)==this.partie.joueursVivants.indexOf(cible) ||
                this.partie.joueurVoisin(false, this.villageois)==this.partie.joueursVivants.indexOf(cible))&&
                this.rolePretendEtre == undefined || this.rolePretendEtre == Role.MONTREUR_OURS){
                this.rolePretendEtre = Role.MONTREUR_OURS;
                return RaisonAccusation.MONTREUR_OURS;
            }else{
                if((this.rolePretendEtre == Role.VOYANTE || this.rolePretendEtre == undefined && this.partie.getPersonnages(Role.VOYANTE).length>0)
                && cible.role != Role.VILLAGEOIS_VILLAGEOIS){
                    //dans la condition juste au dessus, on ne peut pas regarder la liste des villageois publics, pcq le joueur de flute peut etre un villageois public.
                    this.rolePretendEtre = Role.VOYANTE;
                    return RaisonAccusation.VOYANTE;
                } else if(this.rolePretendEtre == undefined  && this.partie.getPersonnages(Role.RENARD).length>0
                    || this.rolePretendEtre == Role.RENARD){
                    this.rolePretendEtre = Role.RENARD;
                    return RaisonAccusation.RENARD;
                }
            }
        }
        if(this.partie.voteCourant.aAccuser(cible) && (this.partie.voteCourant.getAccuseDe(cible) == this.villageois)){
            return RaisonAccusation.CONTRE_ACCUSATION
        }
        return this.partie.random(5);
    }

    //Phase 2: accuserSiHasard
    accuserSiHasard(): boolean{
        const choix: Villageois[] = this.joueursAucuneRaisonPasVoterAccuser();
        if(choix.length > 0 && this.partie.random(this.partie.joueursVivants.length+1)==0){
            const cible: Villageois = this.getMaxOuMinCote(false, choix);
            this.villageois.choisirJoueur(cible, EvenementDeGroupe.ACCUSER, false, this.trouverRaisonParDefaut(cible))
            return true;
        }
        return false;
    }

    //Phase 3: accuserSiDanger
    accuserSiDanger(): boolean{
        //joueur de flute
        if(this.villageois.role !== Role.JOUEUR_DE_FLUTE && this.partie.getPersonnages(Role.JOUEUR_DE_FLUTE).length>0 && this.villageois.estCharmer){
            let joueursNonCharmer: Villageois[] = this.partie.joueursVivants.filter((joueur: Villageois)=>{
                return !joueur.estCharmer
            })
            if(joueursNonCharmer.length<=3){
                let joueursNonCharmerPasSafe: Villageois[] = this.conjonction([joueursNonCharmer], [this.joueursMemeEquipeAssuree, this.partie.getPersonnages(Role.VILLAGEOIS_VILLAGEOIS)])
                if(this.loupsAnciens.includes(this.villageois)){
                    this.conjonction([joueursNonCharmerPasSafe], [this.loupsAnciens]);
                }
                let joueursPasSafeNonAccuses: Villageois[] = this.conjonction([joueursNonCharmerPasSafe], [this.partie.voteCourant.getAccuses()])
                if(joueursPasSafeNonAccuses.length==joueursNonCharmerPasSafe.length){
                    this.villageois.choisirJoueur(this.getMaxOuMinCote(false, this.joueursAucuneRaisonPasVoterAccuser(joueursPasSafeNonAccuses)), EvenementDeGroupe.ACCUSER, true, RaisonAccusation.JOUEUR_DE_FLUTE);
                    return true;
                }
            }
        }
        if(this.partie.voteCourant.auMoinsUnAccuse() &&
            !this.partie.voteCourant.getAccuses().some((accuse: Villageois)=>{
                return !this.joueursMemeEquipeAssuree.includes(accuse);
            })){
                const cible: Villageois = this.getMaxOuMinCote(false, this.joueursAucuneRaisonPasVoterAccuser());
                this.villageois.choisirJoueur(cible, EvenementDeGroupe.ACCUSER, false, this.trouverRaisonParDefaut(cible));
                return true;
        }
        return false;
    }

    //Phase 4: forcerAAccuser
    accusationForcee(): void{
        if(this.partie.voteCourant.auMoinsUnAccuse()){
            throw new Error(this.villageois.nom + " est forcé d'accuser, mais il n'est pas supposé. Votes: "+this.partie.voteCourant.genererInfoVotes())
        }
        const cible: Villageois = this.getMaxOuMinCote(false, this.joueursAucuneRaisonPasVoterAccuser());
        this.villageois.choisirJoueur(cible, EvenementDeGroupe.ACCUSER, false, this.trouverRaisonParDefaut(cible));
    }

    afficherCotes(){
        console.log("cotes de "+this.villageois.nom);
        const cotes: number[] = this.getValeursCotes(this.partie.joueursVivants.filter((joueur: Villageois)=>{return this.cotes.has(joueur)}));
        this.cotes.forEach((valeur: number[], key: Villageois)=>{
            let index: number = this.partie.joueursVivants.filter((joueur: Villageois)=>{return this.cotes.has(joueur)}).indexOf(key);
            
            console.log(key.nom, valeur,(index == -1? "aucune cote finale":cotes[index]));
        })
    }

    conjonction(listes: Villageois[][], pasDansListes: Villageois[][] = []): Villageois[]{
        return listes[0].filter((element: Villageois)=>{
            return !listes.some((liste: Villageois[])=>{!liste.includes(element)}) && !pasDansListes.some((liste: Villageois[])=>{return liste.includes(element)});
        })
    }

    getJoueursMemeEquipeAssuree(): Villageois[]{
        return this.joueursMemeEquipeAssuree;
    }

    getJoueursPasMemeEquipeAssuree(): Villageois[]{
        return this.joueursPasMemeEquipeAssuree;
    }

    ajouterJoueursMemeEquipeAssuree(villageois: Villageois): void{
        if(!this.joueursMemeEquipeAssuree.includes(villageois)){
            this.joueursMemeEquipeAssuree.push(villageois);
            this.cotes.delete(villageois);
        }
    }

    ajouterJoueursPasMemeEquipeAssuree(villageois: Villageois): void{
        if(!this.joueursPasMemeEquipeAssuree.includes(villageois)){
            this.joueursPasMemeEquipeAssuree.push(villageois);
            this.cotes.delete(villageois);
        }
    }
    
}