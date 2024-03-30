import { EvaluatedIndividual } from "./abstract-evolution-engine";
import crypto from 'crypto';

/**
 * Tournament selection implementation
 * - Randomly select two individuals from the population
 * - Select the one with the best fitness
 * - Repeat the process until the desired selection count is reached
 * @param population 
 * @param selectionCount 
 * @param fitnessDirection 
 * @returns 
 */
export function tournamentSelection<T>(
    population: EvaluatedIndividual<T>[],
    selectionCount: number,
    fitnessDirection: 'min' | 'max' = 'min'
): EvaluatedIndividual<T>[] {
    const newPopulation: EvaluatedIndividual<T>[] = [];
    for (let i = 0; i < selectionCount; i++) {
        const firstCompetitorIdx = crypto.randomInt(0, population.length)
        const secondCompetitorIdx = crypto.randomInt(0, population.length)

        const firstCompetitor = population[firstCompetitorIdx];
        const secondCompetitor = population[secondCompetitorIdx];

        if (fitnessDirection === 'min') {
            newPopulation.push(firstCompetitor.fitness < secondCompetitor.fitness ? firstCompetitor : secondCompetitor);
        }

        if (fitnessDirection === 'max') {
            newPopulation.push(firstCompetitor.fitness > secondCompetitor.fitness ? firstCompetitor : secondCompetitor);
        }
    }

    return newPopulation;
}

export const Selections = {
    tournamentSelection
};