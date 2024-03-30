import { Sudoku } from "./sudoku-evolution-engine";
import crypto from 'crypto';

// Function to check if a number can be placed in a given position in the grid
function isValid(sudoku: Sudoku, row: number, col: number, num: number) {
    // Check if the number is already present in the row or column
    for (let i = 0; i < 9; i++) {
        if (sudoku[row][i] === num && i !== col) {
            return false;
        }

        if (sudoku[i][col] === num && i !== row) {
            return false;
        }
    }

    // Check if the number is already present in the 3x3 subgrid
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (i === row && j === col) {
                continue;
            }

            if (sudoku[startRow + i][startCol + j] === num) {
                return false;
            }
        }
    }

    return true;
}

// Function to solve Sudoku using backtracking with randomization
function completeSudoku(sudoku: Sudoku) {
    // Create an array to hold the numbers 1 to 9
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    // Shuffle the array to introduce randomness
    for (let i = numbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            // Find empty cell
            if (sudoku[row][col] === 0) {
                // Try placing numbers in shuffled order
                for (const num of numbers) {
                    if (isValid(sudoku, row, col, num)) {
                        // Place the number and recursively solve the rest of the grid
                        sudoku[row][col] = num;
                        if (completeSudoku(sudoku)) {
                            return true;
                        }
                        // If the number doesn't lead to a solution, backtrack
                        sudoku[row][col] = 0;
                    }
                }
                // If no number can be placed, the puzzle is unsolvable
                return false;
            }
        }
    }
    // If all cells are filled, the puzzle is solved
    return true;
}

export function printSudoku(sudoku: Sudoku) {
    for (let i = 0; i < 9; i++) {
        if (i % 3 === 0 && i !== 0) {
            console.log(`------+-------+------`);
        }
        let row = '';
        for (let j = 0; j < 9; j++) {
            if (j % 3 === 0 && j !== 0) {
                row += '| ';
            }
            row += sudoku[i][j] === 0 ? ' ' : sudoku[i][j];
            row += ' ';
        }
        console.log(row);
    }
}

export function copySudoku(sudoku: Sudoku): Sudoku {
    const copy: number[][] = [];

    for (let i = 0; i < 9; i++) {
        const row: number[] = [];
        for (let j = 0; j < 9; j++) {
            row.push(sudoku[i][j]);
        }
        copy.push(row);
    }

    return copy;
}

/**
 * no duplicates in each row
 * @param sudoku
 */
export function fillEmptyCellsRowWise(sudoku: Sudoku): void {
    for (let j = 0; j < 9; j++) {

        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        const missingInRow = numbers.filter((num) => !sudoku[j].includes(num));
        missingInRow.sort(() => crypto.randomInt(-1, 1)); // shuffle the array

        for (let k = 0; k < 9; k++) {
            // if the cell is empty, fill it with a random number
            if (sudoku[j][k] === 0) {
                const num = missingInRow.pop() as number;
                sudoku[j][k] = num;
            }
        }
    }
}

interface CreateSudokuPuzzleInput {
    /**
     * there is total 81 cells in a sudoku puzzle.
     * The number of empty cells to create in the puzzle.
     */
    emptyCellsCount: number;
}

export function createSudokuPuzzle(input: CreateSudokuPuzzleInput): Sudoku {

    const newSudoku: Sudoku = [];

    // Initialize an empty grid
    for (let i = 0; i < 9; i++) {
        newSudoku.push(Array(9).fill(0));
    }

    // Solve the empty grid
    completeSudoku(newSudoku);

    // remove some numbers from the solved grid to create a puzzle
    let emptyCellsCount = input.emptyCellsCount;
    while(emptyCellsCount > 0) {
        const row = crypto.randomInt(9);
        const col = crypto.randomInt(9);
        if (newSudoku[row][col] !== 0) {
            newSudoku[row][col] = 0;
            emptyCellsCount--;
        }
    }

    return newSudoku
}