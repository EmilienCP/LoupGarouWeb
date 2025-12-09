export enum MomentFortType{
    VOYANTE,
    LOUP_BLANC_ACCUSE,
    FEMME_DE_MENAGE,
    SORCIERE_PROTEGER,
    SORCIERE_SORT_MORT,
    HYPNOTISEUR_LOUP,
    HYPNOTISEUR_AMOUREUX,
    HYPNOTISEUR_INFECTE_VILLAGEOIS
}
export interface MomentFort{
    type: MomentFortType;
    params: any[];
}