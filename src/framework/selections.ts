import { EvaluatedIndividual } from "./abstract-evolution-engine";
import crypto from 'crypto';

export function tournamentSelection<T>(
    population: EvaluatedIndividual<T>[],
    selectionCount: number
): EvaluatedIndividual<T>[] {
    const newPopulation: EvaluatedIndividual<T>[] = [];
    for (let i = 0; i < selectionCount; i++) {
        const firstCompetitorIdx = crypto.randomInt(0, population.length)
        const secondCompetitorIdx = crypto.randomInt(0, population.length)

        const firstCompetitor = population[firstCompetitorIdx];
        const secondCompetitor = population[secondCompetitorIdx];

        const moreFit = firstCompetitor.fitness < secondCompetitor.fitness ? firstCompetitor : secondCompetitor;
        newPopulation.push(moreFit);
    }

    return newPopulation;
}

export const Selections = {
    tournamentSelection
};