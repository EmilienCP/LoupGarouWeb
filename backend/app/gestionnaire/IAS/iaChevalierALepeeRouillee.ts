import { Partie } from "../partie";
import { ChevalierALepeeRouillee } from "../Personnages/chevalierALepeeRouillee";
import { IA } from "./ia";

export class IAChevalierALepeeRouillee extends IA{
    constructor(chevalier: ChevalierALepeeRouillee, partie: Partie){
        super(chevalier, partie);
    }
}