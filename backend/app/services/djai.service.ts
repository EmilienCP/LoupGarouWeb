import { injectable } from "inversify";
import { Toune } from "../../../common/toune";
import * as config from 'config';

@injectable()
export class DJAIService {
    private tounes: Toune[] = [];

    constructor(){
        var fs = require('fs');
        fs.readFile('tounes.json', 'utf8', (err: any, data: any)=>{
           JSON.parse(data).forEach((value: any)=>{
               this.tounes.push((value as Toune));
           })
        })
    }

    async getNouveauLink(videoId: string, ajouterDansFichier: boolean = true): Promise<any>{
        //throw new Error("tente de load un nouveau shit");
        console.log("get nouveau link de "+videoId);
        if(ajouterDansFichier == false && this.tounes.map((toune)=>{return toune.videoId}).includes(videoId)){
            return {dejaExistant: true};
        }
        const fetch = require('node-fetch');
        const fetchapi = await fetch(`https://youtube-mp36.p.rapidapi.com/dl?id=${videoId}`,{
           "method" : "GET",
           "headers": {
           //"X-RapidAPI-Key" :"69c7797440msh13130e2ff8168efp1a4202jsnc726b844e1c5",
           "X-RapidAPI-Key" :process.env.OPEN_API_KEY!,
           "X-RapidAPI-Host": "youtube-mp36.p.rapidapi.com"
           }
        })

        const fetchresponse = await fetchapi.json();
        if(fetchresponse.status === "ok"){
            if(ajouterDansFichier){
                let index: number =this.tounes.map((toune)=>toune.videoId).indexOf(videoId);
                this.tounes[index].link = fetchresponse.link;
                this.tounes[index].titre = fetchresponse.title;
                this.tounes[index].duration = fetchresponse.duration;
                this.ecrireFichier();
            }
            return fetchresponse;
        } else {
            console.log(fetchresponse);
           return undefined;
        }
    }

    async creerNouvelleToune(toune: Toune){
        this.tounes.push(toune);
        this.ecrireFichier();
    }

    async modifierToune(toune:Toune, indexToune: number){
        console.log("modifier Toune")
        console.log(indexToune)
        toune.transition = undefined;
        this.tounes[indexToune] = toune;
        this.ecrireFichier();
    }

    ecrireFichier(): void{
        var fs = require('fs');
        let valeurAEcrire: string = JSON.stringify(this.tounes);
        valeurAEcrire = valeurAEcrire.replace(/,"/g, ",\n\"")
        valeurAEcrire = valeurAEcrire.replace(/{/g, "{\n")
        valeurAEcrire = valeurAEcrire.replace(/}/g, "\n}")
        fs.writeFile('tounes.json', valeurAEcrire, 'utf8', ()=>{});
    }

    getTounes(): Toune[]{
        return this.tounes;
    }
}