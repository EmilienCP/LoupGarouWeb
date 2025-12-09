import { EvenementDeGroupe, EvenementIndividuel, RaisonPasVoter } from "../../../../common/evenements";
import { Partie } from "../partie";
import { Sorciere } from "../Personnages/sorciere";
import { Villageois } from "../Personnages/villageois";
import { IA } from "./ia";

export class IASorciere extends IA{

    constructor(soricere: Sorciere, partie: Partie){
        super(soricere, partie);
    }

    jouerUnEvenement(evenement: EvenementDeGroupe|EvenementIndividuel): void{
        super.jouerUnEvenement(evenement);
        if(+evenement == EvenementIndividuel.JOUER_SORCIERE_PROTEGER){
            this.villageois.choisirJoueur(this.getMaxOuMinCote(true, this.joueursAucuneRaisonPasVoter(true)), evenement, true)
        }
        if(+evenement == EvenementIndividuel.JOUER_SORCIERE_TUER){
            let joueursVotePotentiel: Villageois[] = this.joueursAucuneRaisonPasVoterSortMortel();
            const pireCote: number = this.getValeurMinMax(false, this.getValeursCotes(this.conjonction([joueursVotePotentiel], [this.getJoueursMemeEquipeAssuree(), this.getJoueursPasMemeEquipeAssuree()])));
            if(pireCote < -4 || this.conjonction([this.getJoueursPasMemeEquipeAssuree(), joueursVotePotentiel]).length>0) {
                //va choisir naturellement dans la liste des joueurs pas meme equipe si ca en contient
                const cible: Villageois = this.getMaxOuMinCote(false, joueursVotePotentiel);
                this.villageois.choisirJoueur(cible, EvenementIndividuel.JOUER_SORCIERE_TUER, false);
            }
        }
    }

    protected joueursAucuneRaisonPasVoterSortMortel(): Villageois[]{
        let raisons: RaisonPasVoter[] = (this.villageois as Sorciere).getRaisonsPasVoterSortMortel();
        return this.obtenirJoueursAucuneRaisonPasVoter(this.partie.joueursVivants, raisons, true);
    } 
}