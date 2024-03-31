import crypto from 'crypto';
import { randInt } from '../examples/sudoku/utils';

export type Matrix<T> = T[][];

function copyMatrix<T>(matrix: Matrix<T>): Matrix<T> {
    const copy: Matrix<T> = [];

    for (let i = 0; i < matrix.length; i++) {
        const row: T[] = [];
        for (let j = 0; j < matrix[i].length; j++) {
            row.push(matrix[i][j]);
        }
        copy.push(row);
    }

    return copy;
}

/**
 * Row-wise matrix crossover
 * - Randomly choose a crossover point
 * - Copy rows up to the crossover point from parent1 to offspring1 and from parent2 to offspring2
 * - Copy rows after the crossover point from parent2 to offspring1 and from parent1 to offspring2
 * @param parent1 
 * @param parent2 
 * @returns 
 */
export function rowWiseMatrixCrossover<T>(
    parent1: Matrix<T>,
    parent2: Matrix<T>
): Matrix<T>[] {
    let offspring1: Matrix<T> = copyMatrix(parent1);
    let offspring2: Matrix<T> = copyMatrix(parent2);

    let crossoverCount = 1;

    while(crossoverCount > 0) {
        
        const crossoverPoint = randInt(0, parent1.length);
        // Copy rows up to the crossover point
        for (let i = 0; i < crossoverPoint; i++) {
            // Randomly choose a crossover point
            const tmp: T[] = offspring1[i];
            offspring1[i] = offspring2[i];
            offspring2[i] = tmp;
        }

        crossoverCount--;
    }

    return [offspring1, offspring2];
}

export const Crossovers = {
    rowWiseMatrixCrossover
};