import { RaisonAccusation } from "../../../common/accusation";
import { Partie } from "./partie";
import { Villageois } from "./Personnages/villageois";

export class Vote {

    private electeurs: Villageois[][] = [];
    private accuses: Villageois[] = [];
    private raisons: RaisonAccusation[] = [];
    private joueursPointes: Villageois[][] = [];
    private voteCorbeau?: Villageois;

    copier(): Vote{
        const nouveauVote: Vote = new Vote();
        nouveauVote.electeurs = this.electeurs;
        nouveauVote.accuses = this.accuses;
        nouveauVote.raisons = this.raisons;
        nouveauVote.joueursPointes = this.joueursPointes;
        return nouveauVote;
    }

    voter(electeur: Villageois, accuse: Villageois): void {
        if(electeur == undefined){
            throw new Error("Un electeur inconnu tente de voter");
        }
        if(!this.accuses.includes(accuse)){
            throw new Error("L'electeur "+ electeur.nom + " tente de voter pour "+ (accuse? accuse.nom:"undefined ") + " qui n'est pas accusé.");
        }
        this.electeurs[this.accuses.indexOf(accuse)].push(electeur);
    }

    accuser(electeur: Villageois, accuse: Villageois, raison: RaisonAccusation): void{
        this.electeurs.push([electeur]);
        this.accuses.push(accuse);
        this.raisons.push(raison);
    }

    pointer(electeur: Villageois, accuse: Villageois): void{
        if(electeur == undefined){
            throw new Error("Un electeur inconnu tente de pointer");
        }
        if(!this.accuses.includes(accuse)){
            throw new Error("L'electeur "+ electeur.nom + " tente de pointer "+ (accuse? accuse.nom:"undefined ") + " qui n'est pas accusé.");
        }
        this.joueursPointes.forEach((liste: Villageois[])=>{
            if(liste.includes(electeur)){
                liste.splice(liste.indexOf(electeur), 1);
            }
        })
        this.joueursPointes[this.accuses.indexOf(accuse)].push(electeur);
    }

    accuserToutLeMonde(accuses: Villageois[]): void {
        this.accuses = accuses.slice(0, accuses.length);
        accuses.forEach(()=>{
            this.electeurs.push([]);
            this.joueursPointes.push([]);
        })
    }

    estAccuser(accuse: Villageois){
        return this.accuses.includes(accuse) || this.voteCorbeau == accuse;
    }

    aAccuser(electeur: Villageois): boolean{
        return this.electeurs.filter((liste: Villageois[])=>{
            return liste.includes(electeur);
        }).length>0;
    }

    peutAccuser(electeur: Villageois, partie: Partie): boolean{
        let joueursPasAccuses: Villageois[] = partie.joueursVivants.filter((joueur)=>!this.accuses.includes(joueur));
        return !this.aAccuser(electeur) && (joueursPasAccuses.length>1 || joueursPasAccuses[0] != electeur)
    }

    gagnantVote(partie: Partie): Villageois { // En cas d'égalité, rendre le choix du gagnant aléatoire
        let gagnants: Villageois[] = this.gagnantsVote();
        return gagnants[partie.random(gagnants.length)];
    }

    gagnantsVote(): Villageois[]{
        let tailleElecteurs: number[] = this.getTailleElecteurs();
        let elementMax: number = Math.max(...tailleElecteurs);
        return this.accuses.filter((accuse: Villageois, index: number)=>{
            return tailleElecteurs[index] == elementMax;
        })
    }

    getTailleElecteurs(): number[]{
        return this.electeurs.map((tableauVillageois: Villageois[], indexAccuse: number) => {
            return tableauVillageois.length + (this.voteCorbeau == this.accuses[indexAccuse]?1:0);
        })
    }

    genererInfoVotes(): string[][]{
        let infos: string[][] = [];
        if(this.voteCorbeau){
            infos.push(["Le Corbeau", this.voteCorbeau.nom]);
        }
        this.electeurs.forEach((liste: Villageois[], index: number)=>{
            liste.forEach((villageois: Villageois)=>{
                infos.push([villageois.nom, this.accuses[index].nom]);
            })
        })
        return infos;
    }

    genererInfoVotesPointeurs(): Villageois[][]{
        let infos: Villageois[][] = [];
        this.electeurs.forEach((liste: Villageois[], index: number)=>{
            liste.forEach((villageois: Villageois)=>{
                infos.push([villageois, this.accuses[index]]);
            })
        })
        return infos;
    }

    genererAccusation(): string[]{
        let liste: string[] = [];
        if(this.voteCorbeau){
            liste.push("Le Corbeau accuse "+this.voteCorbeau.nom);
        }
        this.accuses.forEach((accuse: Villageois, index: number)=>{
            liste.push(this.raisonAccusationEnTexte(this.raisons[index], this.electeurs[index][0].nom, accuse.nom))
        })

        return liste;
    }

    aDeja2Votes(electeur: Villageois, cible: Villageois){
        const electeurs: Villageois[] = this.electeurs[this.accuses.indexOf(cible)];
        return electeurs.filter((villageois: Villageois)=>{
            return villageois == electeur;
        }).length >= 2;
    }

    clean(): void{
        this.accuses = [];
        this.electeurs = [];
        this.raisons = [];
        this.joueursPointes = [];
        this.voteCorbeau = undefined;
    }

    cleanElecteurs(): void {
        this.electeurs.forEach((e: Villageois[], index: number)=>{
            this.electeurs[index] = [];
        });
    }

    auMoinsUnAccuse(): boolean{
        return this.accuses.length > 0 || this.voteCorbeau != undefined;
    }

    auMoinsUnVote(): boolean{
        return this.electeurs.filter((voteurs: Villageois[])=>{
            return voteurs.length>0;
        }).length>0 || this.voteCorbeau!= undefined;
    }

    getElecteurs(): Villageois[][]{
        return this.electeurs;
    }

    getAccuses(): Villageois[]{
        if(this.voteCorbeau){
            return this.accuses.concat(this.voteCorbeau);
        }
        return this.accuses;
    }

    getJoueursPointes(): Villageois[][]{
        return this.joueursPointes;
    }

    //juste pour la nuit avec linfect pere des loups
    retirerAccuse(cible: Villageois): void{
        const index: number = this.accuses.indexOf(cible);
        this.accuses.splice(index,1);
        this.electeurs.splice(index,1);
    }

    retirerElecteur(cible: Villageois): void{
        this.electeurs.forEach((elects: Villageois[])=>{
            if(elects.includes(cible)){
                elects.splice(elects.indexOf(cible), 1);
            }
        })
    }

    getAccuseDe(electeur: Villageois): Villageois{
        return this.accuses.filter((accuse: Villageois, index: number)=>{
            return this.electeurs[index].includes(electeur);
        })[0];
    }

    voterCorbeau(cible: Villageois){
        this.voteCorbeau = cible;
    }

    ajouterAccuserDuCorbeau(cible: Villageois){
        this.accuses.push(cible);
        this.electeurs.push([]);
    }

    private raisonAccusationEnTexte(raison: RaisonAccusation, electeur: string, cible: string): string {
        let texteRaison: string = electeur + " accuse " + cible + " ";
        switch(raison){
            case RaisonAccusation.AUCUN: return texteRaison;
            case RaisonAccusation.ALEATOIRE: return this.raisonAccusationAleatoire(electeur, cible);
            case RaisonAccusation.VOYANTE: return texteRaison+"parce qu'il dit qu'il est la voyante et qu'il a vu son personnage";
            case RaisonAccusation.MONTREUR_OURS: return texteRaison+"parce qu'il dit qu'il est le montreur d'ours et que son ours a grogné";
            case RaisonAccusation.JOUEUR_DE_FLUTE: return texteRaison+"parce qu'il soupçonne que c'est le joueur de flûte";
            case RaisonAccusation.CONTRE_ACCUSATION: return texteRaison+"pour se venger de l'avoir accusé";
            case RaisonAccusation.RENARD: return texteRaison+"parce qu'il dit qu'il est le renard et qu'il l'a flairé.";
          }
    }

    private raisonAccusationAleatoire(electeur: string, cible: string): string {
        let texteRaison: string = electeur + " accuse " + cible + " ";
        let raisons: string[] = ["sans raisons précises.",
            "parce qu'il l'a vu manger du steak la nuit.",
            "parce qu'il trouve ses actions louches.",
            "parce qu'il trouve qu'il a une attitude agressive.",
            "parce qu'il s'appelle "+cible+". On a tous déjà vu un loup qui s'appelle "+cible,
            "parce qu'il a dit bonjour trop fort ce matin. Clairement il compense quelque chose.",
            "parce que "+cible+" respire beaucoup trop calmement pour quelqu’un d’innocent.",
            "parce que, quand on a parlé de la nuit, "+cible+" a souri. Les loups aiment la nuit.",
            "parce qu'il a dit qu'il était innocent. Franchement, qui dit ça à part un loup?",
            "parce qu'il est encore en vie. Statistiquement, c’est très louche.",
            "parce qu'il a entendu des drôles de bruits dans sa maison la nuit.",
            "parce qu'il l'a vu en loup dans son rêve, et les rêves sont porteurs de vérité.",
            "parce que la veille au soir, "+electeur+" a vu "+cible+" perdre au poker. Louchement, quelqu'un est mort.",
            "parce que chaque nuit, "+electeur+" entend des bruits de pas venant de chez "+cible+".",
            "parce qu'il l'a vu réveillé la nuit. Qui se réveille la nuit à part les loups?"];
        return texteRaison + raisons[Math.floor(Math.random() * raisons.length)];
    }



}