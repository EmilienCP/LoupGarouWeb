export enum EtatPartie{
    EN_ATTENTE = "En attente",
    EN_COURS = "En cours",
    TERMINEE = "Termine"
}

export interface JoindrePartieInfo{
    id: number,
    etat: EtatPartie,
    nombreDeJoueurs: number,
    nombreAppareilConnectes: number
}