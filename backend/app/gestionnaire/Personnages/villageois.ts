import { Equipe, Role, RolePublic } from "../../../../common/Joueur";
import { EvenementDeGroupe, EvenementIndividuel, RaisonPasVoter, Victoire } from "../../../../common/evenements";
import { Partie } from "../partie";
import { Hypnotiseur } from "./hypnotiseur";
import { RaisonAccusation } from "../../../../common/accusation";
import { MomentFortType } from "../../../../common/momentFort";

export class Villageois{
    nom: string;
    equipeApparente: Equipe; // peut juste etre villageois ou loup garou
    equipeReelle: Equipe; // peut etre independant, amoureux, etc
    role: Role;
    evenementsIndividuels: EvenementIndividuel[] = [];
    estCapitaine: boolean;
    partie: Partie;
    raisonsPasVoter: RaisonPasVoter[][];
    amoureux?: Villageois;
    estInfecte: boolean;
    estCharmer: boolean;
    patateChaude: boolean;
    joueurPunit?: Villageois;
    backupRaisonPasVoter?: RaisonPasVoter[];
    rolePublic: RolePublic;

    constructor(estLoup: boolean, partie: Partie) {
        this.role = estLoup ? Role.LOUP_GAROU: Role.VILLAGEOIS;
        this.equipeApparente = estLoup ? Equipe.LOUPS : Equipe.VILLAGEOIS;
        this.equipeReelle = estLoup ? Equipe.LOUPS : Equipe.VILLAGEOIS;
        this.estCapitaine = false;
        this.partie = partie;
        this.raisonsPasVoter = [];
        this.estInfecte = false;
        this.estCharmer = false;
        this.patateChaude = false;
    }

    copier(villageois: Villageois): Villageois{
        villageois.nom = this.nom;
        villageois.rolePublic = this.rolePublic;
        villageois.estCapitaine = this.estCapitaine;
        villageois.raisonsPasVoter = this.raisonsPasVoter;
        villageois.evenementsIndividuels = this.evenementsIndividuels;
        if(this.amoureux){
            villageois.amoureux = this.amoureux;
            this.amoureux.amoureux = villageois;
        }
        villageois.estInfecte = this.estInfecte;
        villageois.estCharmer = this.estCharmer;
        villageois.patateChaude = this.patateChaude;
        if(this.equipeApparente == Equipe.LOUPS){
            villageois.equipeApparente = Equipe.LOUPS;
        }
        if(this.equipeReelle == Equipe.LOUPS && villageois.equipeReelle == Equipe.VILLAGEOIS){
            villageois.equipeReelle = Equipe.LOUPS;
        }
        if(this.equipeReelle == Equipe.INDEPENDANT && villageois.equipeReelle != Equipe.INDEPENDANT){
            villageois.equipeReelle = Equipe.INDEPENDANT;
        }
        return villageois;
    }

    actionIntro(): void{
        
    }

    actionJour(): void {
        if(!this.partie.joueursVivants.some(j=>j.joueurPunit==this)){
            this.evenementsIndividuels.push(EvenementIndividuel.VOTER);
            // un joueur peut voter pour lui meme le jour
            this.raisonsPasVoter.push(this.getRaisonsPasVoter([RaisonPasVoter.PAS_ACCUSE]));
        } else {
            this.partie.joueursVivants.filter(j=>j.joueurPunit==this).forEach((j=>{
                j.joueurPunit = undefined;
            }))
        }
    }

    jouerInstitutrice(): void{
        this.ajouterEvenementIndividuelSansRaisons(EvenementIndividuel.JOUER_INSTITUTRICE);
    }

    actionNuit(): void {
        if(this.patateChaude){
            this.ajouterEvenementIndividuelSansRaisons(EvenementIndividuel.JOUER_PATATE_CHAUDE);
            this.raisonsPasVoter.push(this.getRaisonsPasVoter([RaisonPasVoter.SOI_MEME]));
        } else {
            if(this.equipeApparente == Equipe.LOUPS) {
                this.ajouterEvenementIndividuelSansRaisons(EvenementIndividuel.JOUER_LOUP_GAROU);
                this.raisonsPasVoter.push(this.getRaisonsPasVoterLoups());
            }
            this.jouerRole();
        }
    }

    actionFinNuit(): void {
        if(this.patateChaude){
            this.unshiftEvenementIndividuelSansRaisons(EvenementIndividuel.INFO_PATATE_CHAUDE);
        }
    }

    actionFinNuit2eTour(): void {

    }

    protected jouerRole(): void {
        if(this.equipeApparente == Equipe.VILLAGEOIS) {
            this.evenementsIndividuels.push(EvenementIndividuel.JOUER_VILLAGEOIS);
            this.raisonsPasVoter.push(this.getRaisonsPasVoter([]));
        }
    }

    voterCapitaine(): void{
        this.evenementsIndividuels.push(EvenementIndividuel.VOTER_CAPITAINE);
        this.raisonsPasVoter.push(this.getRaisonsPasVoter([RaisonPasVoter.SOI_MEME, RaisonPasVoter.PAS_ACCUSE]));
    }

    choisirSuccesseurPreparer(): void{
        this.evenementsIndividuels.push(EvenementIndividuel.CHOISIR_SUCCESSEUR);
        if(this.partie.modeExtensionVillage && this.partie.joueursVivants.filter(j=>!this.partie.joueursMorts.includes(j)).some((joueur: Villageois)=>{return joueur.rolePublic == RolePublic.FERMIER})){
            this.raisonsPasVoter.push(this.getRaisonsPasVoter([RaisonPasVoter.SOI_MEME, RaisonPasVoter.DEJA_MORT, RaisonPasVoter.PAS_FERMIER]));
        } else {
            this.raisonsPasVoter.push(this.getRaisonsPasVoter([RaisonPasVoter.SOI_MEME, RaisonPasVoter.DEJA_MORT]));
        }
    }

    trancherCapitainePreparer(): void{
        this.evenementsIndividuels.push(EvenementIndividuel.TRANCHER_CAPITAINE);
        this.raisonsPasVoter.push(this.getRaisonsPasVoter([RaisonPasVoter.SOI_MEME, RaisonPasVoter.PAS_MORT]));
    }

    getRaisonsPasVoterLoups(): RaisonPasVoter[] {
        try{
            return this.getRaisonsPasVoter([RaisonPasVoter.SOI_MEME, RaisonPasVoter.AMI_LOUP, RaisonPasVoter.DEJA_2_VOTES]);
        } catch (e){
            return this.getRaisonsPasVoter([RaisonPasVoter.SOI_MEME, RaisonPasVoter.AMI_LOUP]);
        }
    }

    ajouterEvenementIndividuelSansRaisons(evenement: EvenementIndividuel){
        this.evenementsIndividuels.push(evenement);
    }

    unshiftEvenementIndividuelSansRaisons(evenement: EvenementIndividuel){
        this.evenementsIndividuels.unshift(evenement);
    }

    protected getRaisonsPasVoter(listeRaisons: RaisonPasVoter[]): RaisonPasVoter[]{
        let raisons: RaisonPasVoter[] = [];
        this.partie.joueursVivants.forEach((villageois: Villageois)=>{
            if(listeRaisons.includes(RaisonPasVoter.SOI_MEME) && villageois == this){
                raisons.push(RaisonPasVoter.SOI_MEME);
            } else if(listeRaisons.includes(RaisonPasVoter.AMI_LOUP) && this.equipeApparente == Equipe.LOUPS && villageois.equipeApparente == Equipe.LOUPS){
                raisons.push(RaisonPasVoter.AMI_LOUP);
            } else if(listeRaisons.includes(RaisonPasVoter.DEJA_2_VOTES) && this.partie.voteCourant.aDeja2Votes(this, villageois)){
                raisons.push(RaisonPasVoter.DEJA_2_VOTES);
            } else if(listeRaisons.includes(RaisonPasVoter.PAS_ACCUSE) && !this.partie.voteCourant.estAccuser(villageois)){
                raisons.push(RaisonPasVoter.PAS_ACCUSE);
            } else if(listeRaisons.includes(RaisonPasVoter.DEJA_ACCUSE) && this.partie.voteCourant.estAccuser(villageois)){
                raisons.push(RaisonPasVoter.DEJA_ACCUSE);
            } else if(listeRaisons.includes(RaisonPasVoter.PAS_MORT) && !this.partie.joueursMorts.includes(villageois)){
                raisons.push(RaisonPasVoter.PAS_MORT);
            } else if(listeRaisons.includes(RaisonPasVoter.DEJA_MORT) && this.partie.joueursMorts.includes(villageois)){
                raisons.push(RaisonPasVoter.DEJA_MORT);
            } else if(listeRaisons.includes(RaisonPasVoter.PAS_LOUP) && (villageois.equipeApparente != Equipe.LOUPS)){
                raisons.push(RaisonPasVoter.PAS_LOUP);
            } else if(listeRaisons.includes(RaisonPasVoter.DEJA_CHARMER) && villageois.estCharmer){
                raisons.push(RaisonPasVoter.DEJA_CHARMER);
            } else if(listeRaisons.includes(RaisonPasVoter.AMOUREUX) && villageois.amoureux == this){
                raisons.push(RaisonPasVoter.AMOUREUX);
            } else if(listeRaisons.includes(RaisonPasVoter.PAS_FERMIER) && villageois.rolePublic != RolePublic.FERMIER){
                raisons.push(RaisonPasVoter.PAS_FERMIER);
            } else if(listeRaisons.includes(RaisonPasVoter.VAGABOND) && villageois.rolePublic == RolePublic.VAGABOND){
                raisons.push(RaisonPasVoter.VAGABOND);
            } else{
                raisons.push(RaisonPasVoter.AUCUN);
            }
        })
        return raisons
    }

    voter(cible: Villageois): void {
        this.partie.voteCourant.voter(this, cible);
    }

    private accuser(cible: Villageois, raison: RaisonAccusation): void {
        if(this.equipeApparente == Equipe.LOUPS && cible.role == Role.LOUP_BLANC){
            this.partie.momentsForts.push({type: MomentFortType.LOUP_BLANC_ACCUSE,params:[this.nom, cible.nom]})
        }
        this.partie.voteCourant.accuser(this, cible, raison);
        this.partie.nouvelleAccusation(this, cible);
    }

    private choisirSuccesseur(cible: Villageois): void{
        if(!this.estCapitaine){
            throw new Error(this.nom + " tente de choisir un successeur mais nest pas capitaine")
        }
        this.estCapitaine = false;
        cible.estCapitaine = true;
    }

    private trancherCapitaine(cible: Villageois): void{
        if(!this.estCapitaine){
            throw new Error(this.nom + " tente de trancher mais nest pas capitaine")
        }
        this.partie.joueursMorts = [cible];
    }

    private switchPatateChaude(cible: Villageois): void{
        this.patateChaude = false;
        cible.patateChaude = true;
    }

    institutricePunir(cible: Villageois): void{
        if(this.partie.seed){
            console.log("L'institutrice "+this.nom+ " punis "+ cible.nom);
        }
        this.joueurPunit = cible;
    }

    choisirJoueur(cible: Villageois, evenement: EvenementIndividuel|EvenementDeGroupe, passerSiUndefined: boolean, raisonAccusation: RaisonAccusation = RaisonAccusation.AUCUN): void{
        if(cible == undefined && !passerSiUndefined){
            throw new Error(this.nom + " tente de choisir une cible qui est undefined. Evenement: "+ evenement);
        }
        if(cible !== undefined){
            switch(+evenement){
                case EvenementIndividuel.VOTER_CAPITAINE:
                case EvenementIndividuel.JOUER_LOUP_GAROU:
                    this.voter(cible)
                    break;
                case EvenementIndividuel.VOTER:
                    const hypnotiseurs: Villageois[] = this.partie.getPersonnages(Role.HYPNOTISEUR).filter((hypnotiseur: Hypnotiseur)=>{
                        return hypnotiseur.joueurChoisi == this;
                    });
                    if(hypnotiseurs.length>0){
                        if(!this.partie.voteCourant.aAccuser((hypnotiseurs[0] as Hypnotiseur)) || !(this.partie.voteCourant.aAccuser(this))){
                            this.voter(cible);
                        }
                    } else {
                        this.voter(cible);
                    }
                    break;
                case EvenementDeGroupe.ACCUSER:
                    this.accuser(cible, raisonAccusation);
                    break;
                case EvenementIndividuel.CHOISIR_SUCCESSEUR:
                    this.choisirSuccesseur(cible)
                    break;
                case EvenementIndividuel.TRANCHER_CAPITAINE:
                    this.trancherCapitaine(cible)
                    break;
                case EvenementIndividuel.JOUER_PATATE_CHAUDE:
                    if(this.partie.seed){
                        console.log(this.nom+ " passe la patate chaude a "+ cible.nom);
                    }
                    this.switchPatateChaude(cible);
                    break;
                case EvenementIndividuel.JOUER_INSTITUTRICE:
                    this.institutricePunir(cible);
                    break;
            }
        }
    }


    viderEvenementsIndividuels(): EvenementIndividuel[]{
        return this.evenementsIndividuels.splice(0, this.evenementsIndividuels.length);
    }

    popRaisonsPasVoter(): RaisonPasVoter[]{
        if(this.raisonsPasVoter.length == 0){
            //throw new Error(this.nom + " tente de trouver une liste de raisons de ne pas voter mais nen a aucune");
        }
        this.backupRaisonPasVoter = this.raisonsPasVoter.splice(0, 1)[0];
        return this.backupRaisonPasVoter;
    }

    getRaisonsPasVoterAccusation(): RaisonPasVoter[]{
        return this.getRaisonsPasVoter([RaisonPasVoter.SOI_MEME, RaisonPasVoter.DEJA_ACCUSE]);
    }

    getRaisonsPasVoterInstitutrice(): RaisonPasVoter[]{
        return this.getRaisonsPasVoter([RaisonPasVoter.SOI_MEME, RaisonPasVoter.VAGABOND]);
    }

    annulerRole(servanteAPrisSonRole: boolean): void {
        
    }

    actionExServante(joueurQuelleAPris: Villageois): void {

    }

    changerPointeur(ancienJoueur: Villageois, nouveauJoueur: Villageois){

    }

    pointsDeVictoire(): number{
        if(this.partie.victoire == Victoire.VILLAGEOIS && this.equipeReelle == Equipe.VILLAGEOIS){
            return 1;
        }
        if(this.partie.victoire == Victoire.LOUP_GAROU && this.equipeReelle == Equipe.LOUPS){
            return 1;
        }
        if(this.partie.victoire == Victoire.AMOUREUX && this.amoureux){
            return 2;
        }
        return 0;
    }

    getSorteVictoireSilGagne(): Victoire{
        if(this.equipeReelle == Equipe.VILLAGEOIS){
            return Victoire.VILLAGEOIS;
        }
        if(this.equipeReelle == Equipe.LOUPS){
            return Victoire.LOUP_GAROU;
        }
        throw new Error("Un villageois independant se retrouve seul a gagner, pas normal.")
    }
    
}