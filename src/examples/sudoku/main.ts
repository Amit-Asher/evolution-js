import { SudokuEvolutionEngine, Sudoku } from "./sudoku-evolution-engine";
import { createSudokuPuzzle, printSudoku } from "./utils";

const sudoku: Sudoku = createSudokuPuzzle({
    emptyCellsCount: 50
});

printSudoku(sudoku);
console.log('Solving...');

const engine = new SudokuEvolutionEngine({
    populationSize: 5000,
    maxGenerations: 2000,
    elitism: 250,
    bestDirection: 'min',
    puzzle: sudoku
});

const result = engine.doEvolution();
printSudoku(result.solution);

console.log(`Solution found in generation ${result.generation} with score ${result.fitness}`);
console.log('Done!');