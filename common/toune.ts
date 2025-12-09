export interface Toune{
    titre: string;
    videoId: string;
    temps: number[];
    tempsi: number[];
    temps0: number;
    tempsCles: number[];
    tempo: number;
    auComplet: boolean;
    caracteristiques: (string|number)[][];
    duration?: number;
    link?: string;
    transition?:Transition;
    debut: boolean;
    pitch?: number; // 0 = Do, 1 = Do#
    loopChordsDebut: number[][];
    loopChordsFin: number[][];
    tempsLoopDebut?: number[];
    tempsLoopFin?: number[];
}

export interface Filtre{
    nom: string,
    min: number,
    max: number,
    pas: number,
    valeur: number,
    importance: number,
    calcul: Calcul
}

export interface FiltrePersonnalise{
    nom: string,
    valeursFiltres: number[];
    importancesFiltres: number[];
}

export enum Transition{
    FONDU,
    DIVISION_FREQUENCES,
    LONGUE_DIVISION_FREQUENCES,
    SWITCH_LOW,
    LOOP_SWITCH_LOW
}

export enum Calcul{
    NORMAL,
    ANNEE,
    TEMPO
}