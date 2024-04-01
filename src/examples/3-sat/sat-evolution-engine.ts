// import { Crossovers } from "../../framework/crossovers";
// import { Selections } from "../../framework/selections";
// import { AbstractEvolutionEngine, EngineConfig, EvaluatedIndividual, EvaluatedPopulation } from '../../framework/abstract-evolution-engine';
// import { randInt } from "../../framework/common";


// export interface SatEngineConfig extends EngineConfig {
//     formula: SatFormula;
// }

export interface SatFormula {
    variables: string[];
    clauses: string[][];
}

// export interface SatAssignment {
//     [variable: string]: boolean;
// }

// export class SATEvolutionEngine extends AbstractEvolutionEngine<SatAssignment> {
//     private formula: SatFormula;

//     public constructor(config: SatEngineConfig) {
//         super({
//             populationSize: config.populationSize || 5000,
//             maxGenerations: config.maxGenerations || 1000,
//             elitism: config.elitism || 250,
//             bestDirection: 'min'
//         });
//         this.formula = config.formula;
//     }

//     public generateSolution(): SatAssignment {
//         let solution: SatAssignment = {};
//         for (const variable of this.formula.variables) {
//             // randomly assign true or false to the variable
//             solution[variable] = randInt(0, 2) === 0;
//         }
//         return solution;
//     }

//     public doCrossover(parent1: SatAssignment, parent2: SatAssignment): SatAssignment[] {
//         return Crossovers.propertyCrossover(parent1, parent2);
//     }

//     public doSelection(
//         population: EvaluatedIndividual<SatAssignment>[],
//         selectionCount: number
//     ): EvaluatedIndividual<SatAssignment>[] {
//         return Selections.tournamentSelection(population, selectionCount);
//     }

//     private isCellFixed(i: number, j: number) {
//         return this.puzzle[i][j] === 0;
//     }

//     private isSwapAddFixedConflict(
//         solution: Sudoku,
//         rowToMutate: number,
//         colToSwap1: number,
//         colToSwap2: number
//     ) {
//         for (let row = 0; row < solution.length; row++) {
//             // conflict between a fixed cell in the column of cell1 to cell2
//             if (this.isCellFixed(row, colToSwap1) && solution[row][colToSwap1] === solution[rowToMutate][colToSwap2]) {
//                 return true;
//             }

//             // conflict between a fixed cell in the column of cell2 to cell1
//             if (this.isCellFixed(row, colToSwap2) && solution[row][colToSwap2] === solution[rowToMutate][colToSwap1]) {
//                 return true;
//             }
//         }

//         let subGridStartRow = Math.floor(rowToMutate / 3) * 3;
//         let subGridStartCol = Math.floor(colToSwap1 / 3) * 3;

//         for (let row = subGridStartRow; row < subGridStartRow + 3; row++) {
//             for (let col = subGridStartCol; col < subGridStartCol + 3; col++) {
//                 // conflict between a fixed cell in the sub-grid of cell1 to cell2
//                 if (this.isCellFixed(row, col) && solution[row][col] === solution[rowToMutate][colToSwap2]) {
//                     return true;
//                 }
//             }
//         }

//         subGridStartCol = Math.floor(colToSwap2 / 3) * 3;
//         for (let row = subGridStartRow; row < subGridStartRow + 3; row++) {
//             for (let col = subGridStartCol; col < subGridStartCol + 3; col++) {
//                 // conflict between a fixed cell in the sub-grid of cell2 to cell1
//                 if (this.isCellFixed(row, col) && solution[row][col] === solution[rowToMutate][colToSwap1]) {
//                     return true;
//                 }
//             }
//         }

//         return false;
//     }

//     public isSwapRemoveFixedConflict(solution: Sudoku, rowToMutate: number, colToSwap1: number, colToSwap2: number) {
//         for (let row = 0; row < solution.length; row++) {
//             // remove conflict between a fixed cell in the column of cell1 to cell1
//             if (this.isCellFixed(row, colToSwap1) && solution[row][colToSwap1] === solution[row][colToSwap1]) {
//                 return true;
//             }

//             // remove conflict between a fixed cell in the column of cell2 to cell2
//             if (this.isCellFixed(row, colToSwap2) && solution[row][colToSwap2] === solution[row][colToSwap2]) {
//                 return true;
//             }
//         }

//         let subGridStartRow = Math.floor(rowToMutate / 3) * 3;
//         let subGridStartCol = Math.floor(colToSwap1 / 3) * 3;

//         for (let row = subGridStartRow; row < subGridStartRow + 3; row++) {
//             for (let col = subGridStartCol; col < subGridStartCol + 3; col++) {
//                 // remove conflict between a fixed cell in the sub-grid of cell1 to cell1
//                 if (this.isCellFixed(row, col) && solution[row][col] === solution[rowToMutate][colToSwap1]) {
//                     return true;
//                 }
//             }
//         }

//         subGridStartCol = Math.floor(colToSwap2 / 3) * 3;
//         for (let row = subGridStartRow; row < subGridStartRow + 3; row++) {
//             for (let col = subGridStartCol; col < subGridStartCol + 3; col++) {
//                 // remove conflict between a fixed cell in the sub-grid of cell2 to cell2
//                 if (this.isCellFixed(row, col) && solution[row][col] === solution[rowToMutate][colToSwap2]) {
//                     return true;
//                 }
//             }
//         }

//         return false;
//     }

//     public mutate(solution: SatAssignment): SatAssignment {
//         let mutationCount = poissonDistribution();

//         while (mutationCount > 0) {
//             let rowToMutate = this.rowsToMutate[randInt(0, this.rowsToMutate.length)].idx;
//             let rowNumbers = this.rowsToMutate.find(({ idx }) => idx === rowToMutate)?.numbers;
//             if (!rowNumbers) {
//                 continue;
//             }

//             const rowNumbersShuffled = rowNumbers.map(n => n);
//             rowNumbersShuffled.sort(() => randInt(0, 2) - 1);

//             const idx1 = rowNumbersShuffled[0];
//             const idx2 = rowNumbersShuffled[1];

//             if (!this.isSwapAddFixedConflict(solution, rowToMutate, idx1, idx2) ||
//                 this.isSwapRemoveFixedConflict(solution, rowToMutate, idx1, idx2)
//             ) {
//                 // Swap the values
//                 const temp = solution[rowToMutate][idx1];
//                 solution[rowToMutate][idx1] = solution[rowToMutate][idx2];
//                 solution[rowToMutate][idx2] = temp;
//                 mutationCount--;
//             }
//         }

//         return solution;
//     }

//     /**
//      * the lower the score the better the solution
//      * sum of duplicates in columns and sub-grids
//      */
//     public evaluate(solution: SatAssignment): number {
//         let score = 0;

//         // check the numbers
//         for (let j = 0; j < 9; j++) {
//             const missingInRow = new Set<number>([1, 2, 3, 4, 5, 6, 7, 8, 9]);
//             for (let i = 0; i < 9; i++) {
//                 missingInRow.delete(solution[i][j]);
//             }
//             score += missingInRow.size;
//         }

//         // check missing numbers in sub-grids
//         for (let i = 0; i < 9; i += 3) {
//             for (let j = 0; j < 9; j += 3) {
//                 const missingInSubGrid = new Set<number>([1, 2, 3, 4, 5, 6, 7, 8, 9]);
//                 for (let k = i; k < i + 3; k++) {
//                     for (let l = j; l < j + 3; l++) {
//                         missingInSubGrid.delete(solution[k][l]);
//                     }
//                 }
//                 score += missingInSubGrid.size;
//             }
//         }

//         return score;
//     }

//     public updateProgress(generation: number, evaulatedPopulation: EvaluatedPopulation<SatAssignment>): void {
//         const bestIndividual = evaulatedPopulation.bestIndividual;
//         if (generation % 1 === 0) {
//             console.log(`Generation: ${generation}, Best Score: ${bestIndividual.fitness}`);
//         }
//     }

//     public isEvolutionFinished(generation: number, bestFitness: number): boolean {
//         return generation === this.maxGenerations || bestFitness === 0;
//     }
// }

export const test= 1;