import { Role } from "../../common/Joueur";

let nbPersonnages: number = Object.keys(Role).length/2-3;
const facteursPersonnages: Map<Role, number> = new Map();
for (let role: Role =3; role < nbPersonnages+3; role++){
    facteursPersonnages.set(role as Role, getFacteurPersonnage(role));
}

console.log(facteursPersonnages);



var fs = require('fs');
// fs.writeFile('matrix.json', "", 'utf8', ()=>{});
// fs.appendFile('matrix.json', "[\n", 'utf8', ()=>{});
const memoireCache: Map<string, number> = initialiserMemoireCache();
console.log("yoyo", nbPersonnages, Math.floor((2**(nbPersonnages))/1.945), Math.floor((2**(nbPersonnages))/1.93), Math.floor((2**(nbPersonnages))));
nbPersonnages = 18;
for(let paramsRoles: number = Math.floor((2**(nbPersonnages))/1.945); paramsRoles < Math.floor((2**(nbPersonnages))/1.93); paramsRoles++){
    let infos: number[] =[];
    for(let nbJoueurs: number = 3; nbJoueurs<30; nbJoueurs++){
        let nbLoups: number = Math.floor(nbJoueurs/4);
        let ancienneprobabilite: number= getProbabiliteTotale(nbJoueurs, nbLoups, paramsRoles);
        let montee: boolean = ancienneprobabilite < 0.5;
        let nouvProbabilite: number = ancienneprobabilite;
        while(montee && nouvProbabilite<0.5 || !montee && nouvProbabilite>0.5){
            nbLoups += 1*(montee?1:-1);
            if(nbLoups < 0){
                break;
            }
            ancienneprobabilite = nouvProbabilite;
            nouvProbabilite = getProbabiliteTotale(nbJoueurs, nbLoups, paramsRoles);
        }
        if(Math.abs(ancienneprobabilite-0.5) > Math.abs(nouvProbabilite-0.5) || ancienneprobabilite == 0.5){
        } else {
            nbLoups -= 1*(montee?1:-1);
        }
        if(nbLoups < infos[infos.length-1]){
            nbLoups = infos[infos.length-1];
        }
        console.log("nouveau push", nbJoueurs, nbLoups);
        infos.push(nbLoups);
    }
    let virgule: string = (paramsRoles == ((2**(nbPersonnages))-1))?"":",";
    fs.appendFile('matrix.json', JSON.stringify(infos)+virgule+"\n", 'utf8', ()=>{});
    infos = [];
}
fs.appendFile('matrix.json', "]", 'utf8', ()=>{});
//console.log(memoireCache);
//console.log(infos);



function getProbabiliteTotale(nbJoueurs: number, nbLoups: number, paramsRoles: number): number{
    //console.log("")
    //console.log("")
    //console.log("")
    //console.log("get prob totale nb Joueurs: "+nbJoueurs+ " nb loups: "+ nbLoups)
    let ajustementNbLoups: number = 0+nbLoups;
    const listeRoles: Role[] = paramRoleEnListe(paramsRoles);
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
        nuit: true
    }
    const arbre: Arbre = getProbabilite(etatInitial);
    //console.log(memoireCache);
    //console.log("calculer arbre");
    //const util = require('util')
    //console.log(util.inspect(arbre, {showHidden: false, depth: null, colors: true}))
    const calcul: number = calculerArbre(arbre);
    //console.log("resultaaaaat : "+ calcul)
    return calcul * getFacteurPersonnages(paramRoleEnListe(paramsRoles));
}


function getProbabilite(etat: Etat): Arbre{
    if(etat.capitaineElu){
        const probDeMemoireCache: number|undefined = getMemoireCache(etat);
        if(probDeMemoireCache){
            return {prob:probDeMemoireCache!};
        }
    }
    if(etat.nbLoups == 0){
        return {prob:0};
    } else if(etat.nbLoups == etat.nbJoueurs){
        return {prob:1};
    }
    let arbre: Arbre;
    if(etat.capitaineElu){
        if(etat.nuit){
            arbre = nuit(etat);
        } else {
            arbre = jour(etat);
        }

    } else {
        arbre = choisirCapitaine(etat);
    }
    const calcul: number = calculerArbre(arbre);
    if(etat.capitaineElu){
        setMemoireCache(etat, calcul);
    }
    return arbre;
}

function calculerArbre(arbre:Arbre): number{
    return arbre.prob * (arbre.enfants?arbre.enfants!.map((enfant:Arbre, index: number)=>{
        return calculerArbre(enfant)*arbre.probEnfants![index];
    }).reduce((p: number, c: number)=>{return p+c}):1);
}

interface Etat{
    nbJoueurs: number,
    nbLoups: number,
    capitaineElu: boolean,
    capitaineLoup: boolean,
    nuit: boolean
}

class Arbre{
    prob: number;
    probEnfants?: number[];
    enfants?: Arbre[];
}



function nuit(etat: Etat): Arbre{
    if(etat.capitaineLoup){
        return nuitCapitaineLoup(etat);
    }
    return nuitCapitaineVillageois(etat);
}

function nuitCapitaineLoup(etat: Etat): Arbre{
    return getProbabilite({
        capitaineElu: etat.capitaineLoup,
        capitaineLoup: etat.capitaineLoup,
        nbJoueurs: etat.nbJoueurs-1,
        nbLoups: etat.nbLoups,
        nuit: false
    })
}

function nuitCapitaineVillageois(etat: Etat): Arbre{
    const probTuerCapitaine: number = (etat.nbJoueurs-etat.nbLoups <= etat.nbLoups+1?1:(1/(etat.nbJoueurs-etat.nbLoups)));
        return {
            prob:1,
            probEnfants: [probTuerCapitaine, (1-probTuerCapitaine)],
            enfants: [getProbabilite({
                capitaineElu: false,
                capitaineLoup: false,
                nbJoueurs: etat.nbJoueurs-1,
                nbLoups: etat.nbLoups,
                nuit: false
            }), getProbabilite({
                capitaineElu: true,
                capitaineLoup: false,
                nbJoueurs: etat.nbJoueurs-1,
                nbLoups: etat.nbLoups,
                nuit: false
            })]
        }
}

function jour(etat: Etat):Arbre{
    if(etat.nbLoups == 1 && etat.nbJoueurs == 2){
        return {prob: etat.capitaineLoup?1:0};
    }
    if(etat.capitaineLoup){
        return jourCapitaineLoup(etat);
    }
    return jourCapitaineVillageois(etat);
}

function jourCapitaineLoup(etat: Etat): Arbre{
    const probCapitaineMort: number = getProbCapitaineMort(etat);
    const probLoupPasCapitaineMort: number = ((1-probCapitaineMort)/(etat.nbJoueurs-1))*(etat.nbLoups-1);
    const probMortVillageois: number = 1-probCapitaineMort-probLoupPasCapitaineMort;
    return {
        prob:1,
        probEnfants: [probCapitaineMort, probLoupPasCapitaineMort, probMortVillageois],
        enfants: [getProbabilite({
            capitaineElu: false,
            capitaineLoup: false,
            nbJoueurs: etat.nbJoueurs-1,
            nbLoups: etat.nbLoups-1,
            nuit: true
        }), getProbabilite({
            capitaineElu: true,
            capitaineLoup: true,
            nbJoueurs: etat.nbJoueurs-1,
            nbLoups: etat.nbLoups-1,
            nuit: true
        }), getProbabilite({
            capitaineElu: true,
            capitaineLoup: true,
            nbJoueurs: etat.nbJoueurs-1,
            nbLoups: etat.nbLoups,
            nuit: true
        })]
    }
}

function jourCapitaineVillageois(etat: Etat): Arbre{
    const probCapitaineMort = getProbCapitaineMort(etat);
    const probLoupMort: number = ((1-probCapitaineMort)/(etat.nbJoueurs-1))*etat.nbLoups;
    const probVillageoisMort: number= 1-probCapitaineMort-probLoupMort;
    return {
        prob:1,
        probEnfants: [probLoupMort, probCapitaineMort, probVillageoisMort],
        enfants: [getProbabilite({
            capitaineElu: true,
            capitaineLoup: true,
            nbJoueurs: etat.nbJoueurs-1,
            nbLoups: etat.nbLoups-1,
            nuit: true
        }), getProbabilite({
            capitaineElu: false,
            capitaineLoup: false,
            nbJoueurs: etat.nbJoueurs-1,
            nbLoups: etat.nbLoups,
            nuit: true
        }), getProbabilite({
            capitaineElu: true,
            capitaineLoup: false,
            nbJoueurs: etat.nbJoueurs-1,
            nbLoups: etat.nbLoups,
            nuit: true
        })]
    }
}


function choisirCapitaine(etat: Etat):Arbre{
    const probLoupCapitaine: number= etat.nbLoups/etat.nbJoueurs;
        return {
            prob:1,
            probEnfants: [probLoupCapitaine, (1-probLoupCapitaine)],
            enfants: [getProbabilite({
                capitaineElu: true,
                capitaineLoup: true,
                nbJoueurs: etat.nbJoueurs,
                nbLoups: etat.nbLoups,
                nuit: etat.nuit
            }), getProbabilite({
                capitaineElu: true,
                capitaineLoup: false,
                nbJoueurs: etat.nbJoueurs,
                nbLoups: etat.nbLoups,
                nuit: etat.nuit
            })]
        }
}

function factorielle(nombre: number): number{
    let valeur: number = 1;
    for(let i: number= nombre; i>0; i--){
        valeur*=i;
    }
    return valeur;
}

//function combinaison(n: number, k: number): number{
//    return factorielle(n)/(factorielle(k)*factorielle(n-k));
//}

function getProbCapitaineMort(etat: Etat): number{
    let nbCasMortCapitaine: number = etat.nbJoueurs-1;
    for(let i = 1; i<=etat.nbJoueurs-3; i++){
        let nbCasTotaux: number = (factorielle(etat.nbJoueurs-1)/factorielle(etat.nbJoueurs-1-i)); 
        nbCasMortCapitaine+= ((nbCasTotaux)-(nbCasTotaux*(i/(etat.nbJoueurs-1))-(((i-1)**i))))*(etat.nbJoueurs-i-1)
    }
    return nbCasMortCapitaine/((etat.nbJoueurs-1)**(etat.nbJoueurs)-factorielle(etat.nbJoueurs-1));
    return 1/etat.nbJoueurs;
}

function initialiserMemoireCache(): Map<string, number>{
    const map: Map<string, number> = new Map();
    map.set("j1l0lc0n0", 0)
    map.set("j1l0lc1n0", 0)
    map.set("j1l0lc0n1", 0)
    map.set("j1l0lc1n1", 0)
    map.set("j1l1lc0n0", 1)
    map.set("j1l1lc1n0", 1)
    map.set("j1l1lc0n1", 1)
    map.set("j1l1lc1n1", 1)
    return map;
}

function getMemoireCache(etat: Etat): number|undefined{
    //console.log("get "+"j"+etat.nbJoueurs+"l"+etat.nbLoups+"lc"+(+etat.capitaineLoup)+"n"+(+etat.nuit) + " "+memoireCache.get("j"+etat.nbJoueurs+"l"+etat.nbLoups+"lc"+(+etat.capitaineLoup)+"n"+(+etat.nuit)));
    return memoireCache.get("j"+etat.nbJoueurs+"l"+etat.nbLoups+"lc"+(+etat.capitaineLoup)+"n"+(+etat.nuit));
}

function setMemoireCache(etat: Etat, prob:number){
    //console.log("set "+"j"+etat.nbJoueurs+"l"+etat.nbLoups+"lc"+(+etat.capitaineLoup)+"n"+(+etat.nuit))
    memoireCache.set("j"+etat.nbJoueurs+"l"+etat.nbLoups+"lc"+(+etat.capitaineLoup)+"n"+(+etat.nuit), prob)
}  

function getFacteurPersonnage(role: Role): number{
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

function getFacteurPersonnages(roles: Role[]): number{
    let valeur: number = 1;
    roles.forEach((role: Role)=>{
        valeur *= (facteursPersonnages.get(role)!);
    })
    valeur = (valeur/2)+0.5;
    //console.log("get Facteur personnages "+roles+" "+valeur)
    return valeur;
}

function paramRoleEnListe(param: number): Role[]{
    const listeRoles: Role[] = [];
    let facteurDivision: number = 1;
    for(let roleCourant = 0; roleCourant < nbPersonnages; roleCourant++){
        const valeur: number = Math.floor(param/facteurDivision);
        facteurDivision *= 2;
        const siExiste: number = valeur%2;
        if(siExiste == 1){
            listeRoles.push(roleCourant+3);
        }
    }
    //console.log("get paramRoleEnListe "+param+" "+listeRoles)
    return listeRoles;

}

// function listeRoleEnParam(roles: Role[]): number{
//     let param: number = 0;
//     roles.forEach((role: Role)=>{
//         param+=2**(role-3);
//     })
//     return param;
// }

