import { TSPEvolutionEngine } from "./tsp-evolution-engine";
import { createTSProblem } from "./tsp-utils";
import fse from 'fs-extra';

const problem = createTSProblem({
    numOfCities: 25,
    maxDistance: 12
});

fse.writeFileSync('src/examples/tsp/tsp-example-problem.json', JSON.stringify(problem, null, 2));
console.log('Solving...');

const engine = new TSPEvolutionEngine({
    populationSize: 500,
    maxGenerations: 100,
    elitism: 300,
    bestDirection: 'min',
    problem: problem,
    mutationMargin: 5
});

const result = engine.doEvolution();

let detailedPath = [];
for (let i = 0; i < result.solution.length - 1; i++) {
    const from = result.solution[i];
    const to = result.solution[i + 1];
    detailedPath.push({
        from: from,
        to: to,
        distancesInHours: problem.distancesInHours[`${from}:${to}`]
    });
}

fse.writeFileSync('src/examples/tsp/tsp-example-solution.json', JSON.stringify({
    ...result,
    details: detailedPath
}, null, 2));

console.log(`Solution found in generation ${result.generation} with score ${result.fitness}`);
console.log('Done!');