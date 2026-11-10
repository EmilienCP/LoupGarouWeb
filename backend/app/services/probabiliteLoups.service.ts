import { injectable } from "inversify/lib/annotation/injectable";
import { Role } from "../../../common/Joueur";

interface Etat{
    nbJoueurs: number,
    nbLoups: number,
    capitaineElu: boolean,
    capitaineLoup: boolean,
    nuit: boolean,
    modeVillageoisVillageois: boolean
}

@injectable()
export class ProbabiliteLoupsService {

    memoireCache: (Etat|number)[][]=[]; //[etat, prob, nombre d'utilisations]
    debug?: boolean = false;
    toutlog?: boolean = false;

    constructor(debug?: boolean, toutlog?: boolean){
        this.debug = debug;
        this.toutlog = toutlog;
    }

    getNbLoups(nbJoueurs: number, listeRoles: Role[], modeVillageoisVillageois: boolean): number {
        if(this.debug && this.toutlog){console.log("debut get Nb Loups")}
        let nbLoups: number = Math.floor(nbJoueurs/4);
        if(this.debug && this.toutlog){console.log("va dans getProbabiliteTotale",nbJoueurs, nbLoups, listeRoles, modeVillageoisVillageois)}
        let ancienneprobabilite: number= this.getProbabiliteTotale(nbJoueurs, nbLoups, listeRoles, modeVillageoisVillageois);
        let montee: boolean = ancienneprobabilite < 0.5;
        let nouvProbabilite: number = ancienneprobabilite;
        while(montee && nouvProbabilite<0.5 || !montee && nouvProbabilite>0.5){
            nbLoups += 1*(montee?1:-1);
            if(nbLoups < 0){
                nbLoups = 0;
                break;
            }
            ancienneprobabilite = nouvProbabilite;
            if(this.debug && this.toutlog){console.log("va dans getProbabiliteTotale",nbJoueurs, nbLoups, listeRoles, modeVillageoisVillageois)}
            nouvProbabilite = this.getProbabiliteTotale(nbJoueurs, nbLoups, listeRoles, modeVillageoisVillageois);
        }
        if(Math.abs(ancienneprobabilite-0.5) > Math.abs(nouvProbabilite-0.5) || ancienneprobabilite == 0.5){
        } else {
            nbLoups -= 1*(montee?1:-1);
        }
        return nbLoups;
    }

    private getProbabiliteTotale(nbJoueurs: number, nbLoups: number, listeRoles: Role[], modeVillageoisVillageois: boolean): number{
        let ajustementNbLoups: number = 0+nbLoups;
        listeRoles.forEach((role: Role)=>{
            if(role == Role.INFECT_PERE_LOUPS){
                ajustementNbLoups+=2;
            }
            if(role == Role.LOUP_BLANC){
                ajustementNbLoups+=1;
            }
            if(role == Role.GRAND_MECHANT_LOUP){
                ajustementNbLoups+=1;
            }
        })
    
        const etatInitial: Etat = {
            capitaineElu: false,
            capitaineLoup: false,
            nbJoueurs: nbJoueurs,
            nbLoups: ajustementNbLoups,
            nuit: true,
            modeVillageoisVillageois: modeVillageoisVillageois
        }
        if(this.debug && this.toutlog){console.log("va dans getProbabilite")}
        const prob: number = this.getProbabilite(etatInitial);
        if(this.debug){console.log("calcul probabilite totale", nbJoueurs, nbLoups, prob * this.getFacteurPersonnages(listeRoles))}
        return prob * this.getFacteurPersonnages(listeRoles); // je comprends pas pk les loups ont autant de chances de gagner
    }

    private getProbabilite(etat: Etat): number{
        let etatDejaTrouve: (Etat | number)[] | undefined = this.memoireCache.find((value: (number|Etat)[])=>{
               return this.memeEtat(value[0] as Etat, etat);
            });
        if(etatDejaTrouve){
            if(this.debug && this.toutlog){console.log("va dans etatDejaTrouve")}
            (etatDejaTrouve[2] as number)++;
            if(this.debug && this.toutlog){console.log("return",[etat, etatDejaTrouve[1]])}
            return etatDejaTrouve[1] as number;
        }
        if(etat.nbLoups == 0){
            if(this.debug && this.toutlog){console.log("return",[etat, 0])}
            return 0;
        } else if(etat.nbLoups == etat.nbJoueurs){
            if(this.debug && this.toutlog){console.log("return",[etat, 1])}
            return 1;
        }
        let prob: number;
        if(etat.capitaineElu){
            if(etat.nuit){
                if(this.debug && this.toutlog){console.log("va dans nuit")}
                prob = this.nuit(etat);
            } else {
                if(this.debug && this.toutlog){console.log("va dans jour")}
                prob = this.jour(etat);
            }

        } else {
            if(this.debug && this.toutlog){console.log("va dans choisir capitaine")}
            prob = this.choisirCapitaine(etat);
        }
        if(this.debug && this.toutlog){console.log("return",[etat, prob])}
        this.ajouterMemoireCache([etat, prob, 0]);
        return prob;
    }

    private memeEtat(etat1: Etat, etat2: Etat): boolean{
        return etat1.capitaineElu == etat2.capitaineElu &&
                etat1.capitaineLoup == etat2.capitaineLoup &&
                etat1.modeVillageoisVillageois == etat2.modeVillageoisVillageois &&
                etat1.nbJoueurs == etat2.nbJoueurs &&
                etat1.nbLoups == etat2.nbLoups &&
                etat1.nuit == etat2.nuit
    }

    private ajouterMemoireCache(etat: (Etat | number)[]){
        let max: number = 400;
        if(this.memoireCache.length<max){
            this.memoireCache.push(etat);
        } else {
            let etatMinimum! :(Etat|number)[];
            for (const mem of this.memoireCache){
                if(!etatMinimum || (mem[2] as number)<(etatMinimum[2] as number)){
                    etatMinimum = mem;
                }
                if((mem[2] as number)==(etatMinimum[2] as number) &&
                    (mem[0] as Etat).nbJoueurs>(etatMinimum[0] as Etat).nbJoueurs){
                    etatMinimum = mem;
                }
            }
            this.memoireCache.splice(this.memoireCache.indexOf(etatMinimum), 1, etat);
        }
    }
    
    private nuit(etat: Etat): number{
        if(etat.modeVillageoisVillageois){
            if(this.debug && this.toutlog){console.log("va dans jour,eleve mode villageois villageois")}
            return this.jour({... etat, modeVillageoisVillageois: false, nuit: false});
        }
        if(etat.capitaineLoup){
            if(this.debug && this.toutlog){console.log("va dans nuit capitaine loup")}
            return this.nuitCapitaineLoup(etat);
        }
        if(this.debug && this.toutlog){console.log("va dans nuit capitaine villageois")}
        return this.nuitCapitaineVillageois(etat);
    }
    
    private nuitCapitaineLoup(etat: Etat): number{
        return this.getProbabilite({
            capitaineElu: etat.capitaineLoup,
            capitaineLoup: etat.capitaineLoup,
            nbJoueurs: etat.nbJoueurs-1,
            nbLoups: etat.nbLoups,
            nuit: false,
            modeVillageoisVillageois: etat.modeVillageoisVillageois
        })
    }
    
    private nuitCapitaineVillageois(etat: Etat): number{
        const probTuerCapitaine: number = (etat.nbJoueurs-etat.nbLoups <= etat.nbLoups+1?1:(1/(etat.nbJoueurs-etat.nbLoups)));
        return probTuerCapitaine * this.getProbabilite({
                    capitaineElu: false,
                    capitaineLoup: false,
                    nbJoueurs: etat.nbJoueurs-1,
                    nbLoups: etat.nbLoups,
                    nuit: false,
                    modeVillageoisVillageois: etat.modeVillageoisVillageois
                }) + (1-probTuerCapitaine) * this.getProbabilite({
                    capitaineElu: true,
                    capitaineLoup: false,
                    nbJoueurs: etat.nbJoueurs-1,
                    nbLoups: etat.nbLoups,
                    nuit: false,
                    modeVillageoisVillageois: etat.modeVillageoisVillageois
                })
    }
    
    private jour(etat: Etat):number{
        if(etat.nbLoups == 1 && etat.nbJoueurs == 2){
            if(this.debug && this.toutlog){console.log("return", etat.capitaineLoup?1:0)}
            return etat.capitaineLoup?1:0;
        }
        if(etat.capitaineLoup){
            if(this.debug && this.toutlog){console.log("va dans jour capitaine loup", etat.nbJoueurs+" joueurs", etat.nbLoups+" loups")}
            return this.jourCapitaineLoup(etat);
        }
        if(this.debug && this.toutlog){console.log("va dans jour capitaine villageois", etat.nbJoueurs+" joueurs", etat.nbLoups+" loups")}
        return this.jourCapitaineVillageois(etat);
    }
    
    private jourCapitaineLoup(etat: Etat): number{
        const probCapitaineMort: number = this.getProbCapitaineMort(etat);
        const probLoupPasCapitaineMort: number = ((1-probCapitaineMort)/(etat.nbJoueurs-1))*(etat.nbLoups-1);
        const probMortVillageois: number = 1-probCapitaineMort-probLoupPasCapitaineMort;
        if(this.debug && this.toutlog){console.log("probs",probCapitaineMort,probLoupPasCapitaineMort,probMortVillageois)};
        return probCapitaineMort * this.getProbabilite({
                capitaineElu: false,
                capitaineLoup: false,
                nbJoueurs: etat.nbJoueurs-1,
                nbLoups: etat.nbLoups-1,
                nuit: true,
                modeVillageoisVillageois: etat.modeVillageoisVillageois
            }) + probLoupPasCapitaineMort * this.getProbabilite({
                capitaineElu: true,
                capitaineLoup: true,
                nbJoueurs: etat.nbJoueurs-1,
                nbLoups: etat.nbLoups-1,
                nuit: true,
                modeVillageoisVillageois: etat.modeVillageoisVillageois
            }) + probMortVillageois * this.getProbabilite({
                capitaineElu: true,
                capitaineLoup: true,
                nbJoueurs: etat.nbJoueurs-1,
                nbLoups: etat.nbLoups,
                nuit: true,
                modeVillageoisVillageois: etat.modeVillageoisVillageois
            });
    }
    
    private jourCapitaineVillageois(etat: Etat): number{
        const probCapitaineMort = this.getProbCapitaineMort(etat);
        const probLoupMort: number = ((1-probCapitaineMort)/(etat.nbJoueurs-1))*etat.nbLoups;
        const probVillageoisMort: number= 1-probCapitaineMort-probLoupMort;
        if(this.debug && this.toutlog){console.log("probs",probCapitaineMort,probLoupMort,probVillageoisMort)};
        return probLoupMort * this.getProbabilite({
                capitaineElu: true,
                capitaineLoup: true,
                nbJoueurs: etat.nbJoueurs-1,
                nbLoups: etat.nbLoups-1,
                nuit: true,
                modeVillageoisVillageois: etat.modeVillageoisVillageois
            }) + probCapitaineMort * this.getProbabilite({
                capitaineElu: false,
                capitaineLoup: false,
                nbJoueurs: etat.nbJoueurs-1,
                nbLoups: etat.nbLoups,
                nuit: true,
                modeVillageoisVillageois: etat.modeVillageoisVillageois
            }) + probVillageoisMort * this.getProbabilite({
                capitaineElu: true,
                capitaineLoup: false,
                nbJoueurs: etat.nbJoueurs-1,
                nbLoups: etat.nbLoups,
                nuit: true,
                modeVillageoisVillageois: etat.modeVillageoisVillageois
            });
    }
    
    
    private choisirCapitaine(etat: Etat):number{
        const probLoupCapitaine: number= etat.nbLoups/etat.nbJoueurs;
        return probLoupCapitaine * this.getProbabilite({
                    capitaineElu: true,
                    capitaineLoup: true,
                    nbJoueurs: etat.nbJoueurs,
                    nbLoups: etat.nbLoups,
                    nuit: etat.nuit,
                    modeVillageoisVillageois: etat.modeVillageoisVillageois
                }) + (1-probLoupCapitaine) * this.getProbabilite({
                    capitaineElu: true,
                    capitaineLoup: false,
                    nbJoueurs: etat.nbJoueurs,
                    nbLoups: etat.nbLoups,
                    nuit: etat.nuit,
                    modeVillageoisVillageois: etat.modeVillageoisVillageois
                });
    }

    getProbCapitaineMort(etat: Etat): number {
        const tableau: number[] = [0.25, 0.18518518518518517, 0.1328125, 0.09696,
                    0.07675325788751715, 0.06543434890467165, 0.05860787630081177, 0.053893399014320074,
                    0.050153338299999996, 0.04689084724557426, 0.043907610878764256, 0.04113266793694512,
                    0.03854399520054189, 0.036135251334296556, 0.03390295976827827, 0.03184234008712631,
                    0.029946511033772216, 0.02820683663858421, 0.026613538003797715, 0.025156262186664145,
                    0.023824525175367598, 0.022608027409627404, 0.021496864400206945, 0.02048165800248121,
                    0.01955363025749308, 0.018704636816420213, 0.017927172578401856];
        if(etat.nbJoueurs-3 >= tableau.length || etat.nbJoueurs <= 2){
            return 0;
        }
        return tableau[etat.nbJoueurs-3];
    }
    
    private getFacteurPersonnage(role: Role): number{
        switch(role){
            case Role.VOYANTE: return 0.5;
            case Role.CUPIDON: return 1;
            case Role.CHASSEUR: return 0.9;
            case Role.SORCIERE: return 0.5;
            case Role.INFECT_PERE_LOUPS: return 1.4;
            case Role.MONTREUR_OURS: return 0.6;
            case Role.RENARD: return 0.6;
            case Role.CORBEAU: return 0.8;
            case Role.FEMME_DE_MENAGE: return 0.8;
            case Role.HYPNOTISEUR: return 0.9;
            case Role.JOUEUR_DE_FLUTE: return 1;
            case Role.ENFANT_SAUVAGE: return 1.4;
            case Role.LOUP_BLANC: return 0.4;
            case Role.SERVANTE_DEVOUEE: return 0.95;
            case Role.CHEVALIER_A_LEPEE_ROUILLEE: return 0.5;
            case Role.DEUX_SOEURS: return 0.85;
            case Role.TROIS_FRERES: return 0.8;
            case Role.GRAND_MECHANT_LOUP: return 1.4;
            default: throw new Error("manque un facteur personnage pour matrice");
        }
    }
    
    private getFacteurPersonnages(roles: Role[]): number{
        let valeur: number = 1;
        roles.forEach((role: Role)=>{
            valeur *= (this.getFacteurPersonnage(role));
        })
        valeur = (valeur/2)+0.5;
        return valeur;
    }
}