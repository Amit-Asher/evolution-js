import { SudokuEvolutionEngine, Sudoku } from "./sudoku-evolution-engine";
import { createSudokuPuzzle, printSudoku } from "./sudoku-utils";

const sudoku: Sudoku = createSudokuPuzzle({
    emptyCellsCount: 43
});

printSudoku(sudoku);
console.log('Solving...');

const engine = new SudokuEvolutionEngine({
    populationSize: 10000,
    maxGenerations: 2000,
    elitism: 1000,
    bestDirection: 'min',
    puzzle: sudoku
});

const result = engine.doEvolution();
printSudoku(result.solution);

console.log(`Solution found in generation ${result.generation} with score ${result.fitness}`);
console.log('Done!');