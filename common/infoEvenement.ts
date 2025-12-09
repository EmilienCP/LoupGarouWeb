import { EvenementDeGroupe, EvenementIndividuel } from "./evenements";

export interface InfoEvenement{
    evenement: EvenementIndividuel | EvenementDeGroupe;
    peutPasser: boolean;
    passer: boolean;
    timer: number;
}