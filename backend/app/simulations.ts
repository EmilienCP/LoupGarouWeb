import { Partie } from "./gestionnaire/partie";
    
let partie: Partie = new Partie("0",undefined, true);
partie.modeExtensionVillage = true;
partie.modePatateChaude = true;

let nbparties: number = 1; 

partie.commencerPartie().then(async ()=>{
    while(nbparties<30){
        await partie.commencerPartie();
        nbparties++;
    }
})