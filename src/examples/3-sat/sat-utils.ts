import { randInt } from "../../framework/common";
import { SatFormula } from "./sat-evolution-engine";


interface CreateSatFormulaInput {
    /**
     * Number of variables in the formula
     */
    numOfVariables: number;
    /**
     * Number of clauses in the formula
     */
    numOfClauses: number;
}

export function createSatFormula(input: CreateSatFormulaInput): SatFormula {

    const { numOfVariables, numOfClauses } = input;
    
    const formula: SatFormula = {
        variables: [],
        clauses: []
    };

    for (let i = 1; i <= numOfVariables; i++) {
        formula.variables.push(`x${i}`);
        formula.variables.push(`!x${i}`);
    }

    // initialize empty variables
    for (let i = 0; i < numOfClauses; i++) {
        const clause = [];
        for (let j = 0; j < 3; j++) {
            clause.push('');
        }
        formula.clauses.push(clause);
    }

    // ensure that each variable is used in at least one clause in some form
    for (let i = 0; i < formula.clauses.length; i++) {
        formula.clauses[i][0] = `${randInt(0, 2) === 0 ? '!' : ''}x${i}`;
    }

    // ensure that each clause is full
    for (let i = 0; i < formula.clauses.length; i++) {
        formula.clauses[i][1] = `${randInt(0, 2) === 0 ? '!' : ''}x${randInt(0, formula.variables.length / 2)}`;
        formula.clauses[i][2] = `${randInt(0, 2) === 0 ? '!' : ''}x${randInt(0, formula.variables.length / 2)}`;
    }

    return formula;
}