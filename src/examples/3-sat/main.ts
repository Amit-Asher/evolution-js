import { SATEvolutionEngine } from "./sat-evolution-engine";
import { createSatFormula } from "./sat-utils";
import fse from 'fs-extra';

const formula = createSatFormula({
    numOfVariables: 1000,
    numOfClauses: 1000
});

// console.log(JSON.stringify(formula.clauses, null, 2));
fse.writeFileSync('src/examples/3-sat/sat-example-problem.json', JSON.stringify(formula, null, 2));
console.log('Solving...');


const engine = new SATEvolutionEngine({
    populationSize: 100,
    maxGenerations: 400,
    elitism: 5,
    bestDirection: 'min',
    formula
});

const result = engine.doEvolution();
const noNegations = Object.entries(result.solution).filter(([variable]) => !variable.startsWith('!')).reduce((acc, [variable, value]) => ({ ...acc, [variable]: value }), {});
fse.writeFileSync('src/examples/3-sat/sat-example-solution.json', JSON.stringify(noNegations, null, 2));

console.log(`Solution found in generation ${result.generation} with score ${result.fitness}`);
console.log('Done!');