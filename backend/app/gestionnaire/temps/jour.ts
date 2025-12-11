import { EvenementDeGroupe } from "../../../../common/evenements";
import { Role, RolePublic } from "../../../../common/Joueur";
import { Appareil } from "../appareil";
import { IA } from "../IAS/ia";
import { Partie } from "../partie";
import { Corbeau } from "../Personnages/corbeau";
import { Villageois } from "../Personnages/villageois";
import { GestionnaireDeTemps } from "./gestionnaireDeTemps";

export class Jour extends GestionnaireDeTemps{

    institutrice?: Villageois;

    constructor(partie: Partie){
        super(["Accusations", "Institutrice", "InstitutriceInfo", "Votes"], partie)
    }
    
    protected async executerProchaineEtape(etapeCourante: number): Promise<boolean> {
        switch(this.listeEtapes[etapeCourante]){
            case "Accusations":
                // evenement accusation
                this.partie.voteCourant.clean();
                this.partie.preparerEvenementsIndividuels();
                if(this.partie.getMeneursDeJeu().length>0){
                    if(this.partie.siqqnPeutAccuser()){
                        this.partie.preparerEvenementDeGroupe(EvenementDeGroupe.INFO_ACCUSER, EvenementDeGroupe.ACCUSER);
                    } else {
                        this.partie.preparerEvenementDeGroupe(EvenementDeGroupe.INFO_ACCUSER, EvenementDeGroupe.INFO_ACCUSER);
                    }
                } else {
                    this.partie.preparerEvenementDeGroupe(EvenementDeGroupe.ACCUSER, EvenementDeGroupe.INFO_ACCUSER, this.partie.joueursDejaMorts);
                }
                this.partie.historiqueEvenements.push([]);
                
                //corbeau
                let corbeaux: Corbeau[] = this.partie.getPersonnages(Role.CORBEAU) as Corbeau[];
                if(corbeaux.length >0 && corbeaux[0].joueurVu && this.partie.joueursVivants.includes(corbeaux[0].joueurVu)){
                    this.partie.voteCourant.voterCorbeau(corbeaux[0].joueurVu);
                    this.partie.appareils.forEach((appareil: Appareil)=>{
                        appareil.ajouterNouvelleAccusation(this.partie);
                    })
                }
                this.partie.historiqueEvenements.push(this.partie.voteCourant.genererAccusation());
                this.partie.faireAccuserIas();
                return false;

            case "Institutrice":
                this.institutrice = this.partie.joueursVivants.find((v)=>v.rolePublic == RolePublic.INSTITUTRICE);
                if(this.institutrice && this.partie.joueursVivants.some((j=>j.rolePublic!=RolePublic.VAGABOND && j!= this.institutrice))){
                    this.partie.preparerEvenementDeGroupe(EvenementDeGroupe.JOUER_INSTITUTRICE, EvenementDeGroupe.JOUER_INSTITUTRICE, [this.institutrice]);
                    this.institutrice.jouerInstitutrice();
                    this.partie.preparerEvenementsIndividuels(EvenementDeGroupe.JOUER_INSTITUTRICE, [this.institutrice])
                    return false
                }
                return true;
            case "InstitutriceInfo":
                if(this.institutrice && this.institutrice.joueurPunit){
                    this.partie.historiqueEvenements.push(["L'institutrice, soit "+ this.institutrice.nom+" a puni "+this.institutrice.joueurPunit.nom])
                    this.partie.preparerEvenementDeGroupe(EvenementDeGroupe.INFO_INSTITUTRICE, EvenementDeGroupe.INFO_INSTITUTRICE);
                    return false
                }
                return true;
            case "Votes":
                // faire voter tout le village
                this.partie.voteCourant.cleanElecteurs();
                //ajouter laccuse du corbeau
                let corbeau: Corbeau[] = this.partie.getPersonnages(Role.CORBEAU) as Corbeau[];
                if(corbeau.length >0 && corbeau[0].joueurVu && this.partie.joueursVivants.includes(corbeau[0].joueurVu)){
                    this.partie.voteCourant.ajouterAccuserDuCorbeau(corbeau[0].joueurVu);
                }

                this.partie.joueursVivants.forEach((villageois: Villageois)=>{
                    villageois.actionJour();
                });
                //doit preparer les evenements individuels pour permettre aux ias de jouer
                if(this.partie.getJoueursReelsEncoreVivants().length>0){
                    this.partie.preparerEvenementsIndividuels(EvenementDeGroupe.JOUER_JOUR);
                }else {
                    this.partie.ias.forEach((ia: IA)=>{
                        ia.preparerEvenementsIndividuels([]);
                    })
                }
                return false;
        }
        return false;
    }
    
}