import crypto from 'crypto';

export type Matrix<T> = T[][];

export function rowWiseMatrixCrossover<T>(
    parent1: Matrix<T>,
    parent2: Matrix<T>
): Matrix<T>[] {
    const offspring1: Matrix<T> = [];
    const offspring2: Matrix<T> = [];

    // Randomly choose a crossover point
    const crossoverPoint = crypto.randomInt(parent1.length);

    // Copy rows up to the crossover point
    for (let i = 0; i < crossoverPoint; i++) {
        const newRow1: T[] = [];
        const newRow2: T[] = [];

        for (let j = 0; j < parent1[i].length; j++) {
            newRow1.push(parent1[i][j]);
            newRow2.push(parent2[i][j]);
        }
        
        offspring1.push(newRow1);
        offspring2.push(newRow2);
    }

    // Copy rows after the crossover point
    for (let i = crossoverPoint; i < parent1.length; i++) {
        const newRow1: T[] = [];
        const newRow2: T[] = [];

        for (let j = 0; j < parent1[i].length; j++) {
            newRow1.push(parent2[i][j]);
            newRow2.push(parent1[i][j]);
        }

        offspring1.push(newRow1);
        offspring2.push(newRow2);
    }

    return [offspring1, offspring2];
}

export const Crossovers = {
    rowWiseMatrixCrossover
};