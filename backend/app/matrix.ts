
function factorielle(nombre: number): bigint {
    let valeur = 1n;

    for (let i = 2; i <= nombre; i++) {
        valeur *= BigInt(i);
    }

    return valeur;
}

function combinaison(n: number, r: number, factorielles: bigint[]): bigint {
    return factorielles[n] /
        (factorielles[r] * factorielles[n - r]);
}

function compterRepartition(d: number[], n: number, factorielles: bigint[]): bigint {
    let total = 0n;

    const valeurs: number[] = [];
    const multiplicites: number[] = [];

    // Regrouper les personnes ayant le même nombre de votes
    for (const valeur of d) {
        if (valeurs.length > 0 && valeurs[valeurs.length - 1] === valeur) {
            multiplicites[multiplicites.length - 1]++;
        } else {
            valeurs.push(valeur);
            multiplicites.push(1);
        }
    }

    function calculer(
        pos: number,
        nbFixes: number,
        denominateur: bigint,
        coefficient: bigint
    ): void {
        if (pos === valeurs.length) {
            const nb = coefficient * factorielles[n - nbFixes] / denominateur;

            total += nbFixes % 2 === 0 ? nb : -nb;
            return;
        }

        const valeur = valeurs[pos];
        const multiplicite = multiplicites[pos];

        for (let i = 0; i <= multiplicite; i++) {
            if (valeur === 0 && i > 0) continue;

            let nouveauDenominateur = denominateur;

            for (let j = 0; j < multiplicite - i; j++) {
                nouveauDenominateur *= factorielles[valeur];
            }

            for (let j = 0; j < i; j++) {
                nouveauDenominateur *= factorielles[valeur - 1];
            }

            const nouveauCoefficient =
                coefficient * combinaison(multiplicite, i, factorielles);

            calculer(
                pos + 1,
                nbFixes + i,
                nouveauDenominateur,
                nouveauCoefficient
            );
        }
    }

    calculer(0, 0, 1n, 1n);

    return total;
}

function getProbCapitaineMort(n: number): number {
    if (n < 2 || !Number.isInteger(n)) {
        throw new Error("Le nombre de joueurs doit être un entier supérieur ou égal à 2.");
    }

    const factorielles: bigint[] = [];

    for (let i = 0; i <= n; i++) {
        factorielles.push(factorielle(i));
    }

    let egalites = 0n;
    const d: number[] = [];

    // Générer uniquement les partitions distinctes de n
    function generer(restant: number, maximum: number): void {
        if (restant === 0) {
            const repartition = [...d];

            while (repartition.length < n) {
                repartition.push(0);
            }

            // Vérifier si le maximum est atteint plusieurs fois
            let nbMaximum = 0;

            for (const valeur of repartition) {
                if (valeur === repartition[0]) {
                    nbMaximum++;
                }
            }

            if (nbMaximum < 2) return;

            // Compter les permutations distinctes de cette partition
            let denominateur = 1n;

            for (let i = 0; i < n;) {
                let j = i + 1;

                while (j < n && repartition[j] === repartition[i]) {
                    j++;
                }

                denominateur *= factorielles[j - i];
                i = j;
            }

            const permutations =
                factorielles[n] / denominateur;

            egalites += permutations *
                compterRepartition(repartition, n, factorielles);

            return;
        }

        for (let i = Math.min(restant, maximum); i >= 1; i--) {
            d.push(i);
            generer(restant - i, i);
            d.pop();
        }
    }

    generer(n, n);

    const total = BigInt(n - 1) ** BigInt(n);
    const sansEgalite = total - egalites;

    // Conversion finale en number pour retourner une probabilité
    return Number(sansEgalite) / Number(total) / n;
}

// const resultats: number[] = []
// for (let i = 3; i<30; i++){
//     let resultat: number = getProbCapitaineMort(i);
//     resultats.push(resultat);
// }
// console.log(resultats);
getProbCapitaineMort(3);
import "reflect-metadata";
import { ProbabiliteLoupsService } from "./services/probabiliteLoups.service";

const service = new ProbabiliteLoupsService(true, false);

console.log(service.getNbLoups(6, [], false));
