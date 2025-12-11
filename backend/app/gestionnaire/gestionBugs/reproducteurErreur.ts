import { EvenementDeGroupe, EvenementIndividuel } from "../../../../common/evenements";
import { Role } from "../../../../common/Joueur";
import { Appareil } from "../appareil";
import { Partie } from "../partie";
import { ServanteDevouee } from "../Personnages/servanteDevouee";
import { Action, HistoriquePartie } from "./historiquePartie";

let historiquePartie: HistoriquePartie = JSON.parse(
    '{"actions":[[5,0],[5,1],[5,5],[5,2],[5,6],[5,4],[5,7],[5,3],[5,7],[5,3],[5,5],[5,4],[5,1],[5,2],[5,6],[5,2],[5,2],[0],[5,0],[5,2],[5,7],[5,4],[5,1],[5,6],[5,3],[5,5],[5,2],[5,4],[5,3],[5,2],[5,2],[4,1],[5,4],[5,1],[5,4],[5,5],[5,1],[5,7],[5,4],[5,1],[4,3],[5,5],[5,7],[5,5],[1,13,1,8],[4,1],[1,13,1,9],[5,2],[5,3],[5,3],[1,5,3,6],[5,4],[5,6],[5,6],[5,6],[4,5],[1,5,5,6],[5,6],[5,7],[4,6],[1,5,6,3],[5,7],[0],[5,0],[5,3],[5,7],[5,5],[5,2],[5,6],[5,1],[5,4],[5,0],[5,2],[5,3],[5,5],[5,6],[5,1],[5,7],[5,4],[0],[5,0],[5,3],[5,2],[5,1],[5,6],[5,5],[5,4],[5,7],[5,3],[5,7],[5,5],[5,6],[5,2],[5,1],[5,4],[0],[5,0],[5,2],[5,3],[5,5],[5,1],[5,6],[5,7],[5,4],[5,1],[5,2],[5,7],[5,6],[5,3],[5,5],[5,4],[0],[5,0],[5,6],[5,3],[5,5],[5,7],[5,2],[5,4],[5,1],[4,5],[4,4],[4,2],[4,0],[4,3],[4,1],[4,6],[5,6],[1,21,0,5],[5,1],[1,33,3,4],[5,4],[5,7],[5,2],[1,6,2,7],[1,6,2,7],[1,6,2,10],[5,3],[1,11,4,6],[5,5],[0],[5,0],[5,5],[5,4],[5,3],[5,1],[5,2],[5,6],[5,7],[5,1],[5,0],[5,5],[5,3],[5,4],[5,2],[5,7],[5,6],[0],[5,0],[5,4],[5,5],[5,3],[5,1],[5,7],[5,6],[5,2],[5,2],[5,0],[5,5],[5,3],[5,1],[5,4],[5,7],[5,6],[0],[5,0],[5,6],[5,7],[5,4],[5,3],[5,5],[5,2],[5,1],[5,6],[5,1],[5,4],[5,7],[5,2],[5,5],[5,3],[0],[5,0],[5,3],[5,2],[5,5],[5,6],[5,7],[5,1],[5,4],[0],[5,0],[5,0],[5,6],[5,2],[5,1],[5,3],[5,7],[5,5],[5,4],[5,3],[5,5],[5,1],[5,0],[5,2],[5,7],[5,6],[5,4],[0],[5,0],[5,3],[5,5],[5,7],[5,1],[5,2],[5,4],[5,6],[5,1],[5,0],[5,3],[5,5],[5,2],[5,4],[5,7],[5,6],[0],[5,0],[5,7],[5,3],[5,5],[5,2],[5,1],[5,6],[5,4],[5,1],[5,5],[1,40,5,14],[5,0],[1,40,3,12],[5,0],[0],[5,0],[5,0],[5,7],[5,5],[5,3],[5,1],[5,4],[5,6],[5,2],[1,36,1,16],[5,2],[0],[5,0],[5,2],[5,3],[5,5],[5,1],[5,6],[5,7],[5,4],[5,6],[5,7],[5,3],[5,1],[5,5],[5,0],[5,2],[5,4],[0],[5,0],[5,5],[5,1],[5,7],[5,6],[5,4],[5,2],[5,3],[4,4],[4,5],[4,0],[4,2],[4,1],[4,3],[4,6],[1,4,5,12],[5,6],[1,4,2,12],[5,3],[1,4,3,12],[5,4],[1,4,1,12],[5,2],[1,4,0,12],[5,1],[1,4,6,12],[5,7],[1,4,4,14],[5,5],[0],[5,0],[5,5],[5,3],[5,4],[5,6],[5,2],[5,7],[5,1],[5,0],[5,5],[5,3],[5,6],[5,2],[5,1],[5,4],[5,7],[0],[5,0],[5,1],[5,3],[5,5],[5,6],[5,4],[5,7],[5,2],[5,1],[5,5],[5,0],[5,3],[5,6],[5,4],[5,7],[5,2]],"choixPersonnages":[3,4,5,6,7,8,9,10,11,12,13,14,15,16,18],"nbAppareils":7,"nbJoueurs":17,"nbLoups":1,"seed":409,"modePatateChaude":true,"modeExtensionVillage":true,"modeVillageoisVillageois":true,"modeVideo":true,"meneurDeJeu":true,"noms":[[],["Alex"],["Liliane"],["Emilien"],["Miam500"],["Gaby"],["(⁠╯⁠°⁠□⁠°⁠）⁠╯⁠︵⁠ ⁠┻⁠━⁠"],["Raph"]],"points":[[],[0],[0],[0],[0],[0],[0],[0]]}'
)
    
    
let partie: Partie = new Partie("0", historiquePartie.seed);
for(let i: number = 0; i < historiquePartie.nbAppareils-1; i++){
    partie.appareils.push(new Appareil(""+i, "Joueur "+i));
}
if(historiquePartie.meneurDeJeu){
    partie.appareils.push(new Appareil(""+(partie.appareils.length-1), "Joueur "+(partie.appareils.length-1)));
    partie.appareils[0].switchMeneurDeJeu();
}
partie.appareils.forEach((appareil: Appareil, i: number)=>{
    appareil.nomsJoueurs = historiquePartie.noms[i];
})

partie.choixPersonnages = historiquePartie.choixPersonnages;
partie.setNbJoueurs(historiquePartie.nbJoueurs, false);
partie.setNbLoups(historiquePartie.nbLoups, false);
partie.modePatateChaude = historiquePartie.modePatateChaude;
partie.modeVillageoisVillageois = historiquePartie.modeVillageoisVillageois;
partie.modeExtensionVillage = historiquePartie.modeExtensionVillage;
partie.modeVideo = historiquePartie.modeVideo;
console.log(partie.appareils[0].nomsJoueurs);

partie.commencerPartie().then(async ()=>{
    for(let i: number = 0; i<historiquePartie.actions.length; i++){
        await envoyerDansSwitch(historiquePartie.actions[i], i);
    }
})

async function envoyerDansSwitch(action:number[], index: number){
    console.log("action", action);
    switch(action[0]){
        case Action.PROCHAINE_ETAPE:{
            console.log("prochaine étape " + index);
            partie.appareils.forEach((appareil: Appareil)=>{appareil.terminerSonTour()});
            await partie.prochaineEtape().then(()=>{
            });
            break;
        }
        case Action.VOTER_VILLAGEOIS:{
            console.log("faire une action: "+ action)
            partie.joueursVivants[action[2]].choisirJoueur(partie.joueursVivants[action[3]], action[1], false);
            break;
        }
        case Action.PASSER:{
            partie.appareils[action[1]].passer = true;
            break;
        }
        case Action.OUI_SERVANTE_DEVOUEE:{
            (partie.getPersonnages(Role.SERVANTE_DEVOUEE)[0] as ServanteDevouee).ouiVeutPrendrePersonnage();
            break;
        }
        case Action.POP_RAISON_PAS_VOTER:{
            console.log("pop raisons pas voter de index joueur" +action[1])
            try{
                partie.joueursVivants[action[1]].popRaisonsPasVoter();
            } catch (e){
                console.log(e);
            }
            break;
        }
        case Action.GET_UN_EVENEMENT:{
            let evenement: EvenementIndividuel | EvenementDeGroupe = partie.appareils[action[1]].getUnEvenement();
            console.log("get ", evenement)
            break;
        }
        default:
            console.log(partie.joueursVivants.map((joueur=>joueur.nom)));
            throw new Error("repere");
    }
    
}

