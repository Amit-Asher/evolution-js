import { poissonDistribution, randInt } from "../../framework/common";
import { AbstractEvolutionEngine, EngineConfig, EvaluatedIndividual, EvaluatedPopulation } from "../../framework/abstract-evolution-engine";
import { Crossovers } from "../../framework/crossovers";
import { Selections } from "../../framework/selections";

export interface SatEngineConfig extends EngineConfig {
    formula: SatFormula;
}

export interface SatFormula {
    variables: string[];
    clauses: string[][];
}

export interface SatAssignment {
    [variable: string]: boolean;
}

export class SATEvolutionEngine extends AbstractEvolutionEngine<SatAssignment> {
    private formula: SatFormula;

    public constructor(config: SatEngineConfig) {
        super({
            populationSize: config.populationSize || 5000,
            maxGenerations: config.maxGenerations || 1000,
            elitism: config.elitism || 250,
            bestDirection: 'min'
        });
        this.formula = config.formula;
    }

    public generateSolution(): SatAssignment {
        let solution: SatAssignment = {};
        for (const variable of this.formula.variables) {
            if (variable.startsWith('!')) {
                continue;
            }
            // randomly assign true or false to the variable
            solution[variable] = randInt(0, 2) === 0;
            solution[`!${variable}`] = !solution[variable];
        }

        return solution;
    }

    public doCrossover(parent1: SatAssignment, parent2: SatAssignment): SatAssignment[] {
        const cleanP1: SatAssignment = Object.assign({}, parent1);
        const cleanP2: SatAssignment = Object.assign({}, parent2);

        for (const variable of this.formula.variables) {
            if (variable.startsWith('!')) {
                delete cleanP1[variable];
                delete cleanP2[variable];
            }
        }

        const [offspring1, offspring2] = Crossovers.propertyCrossover(cleanP1, cleanP2);
        
        for (const variable of this.formula.variables) {
            if (variable.startsWith('!')) {
                continue;
            }
            offspring1[`!${variable}`] = !offspring1[variable];
            offspring2[`!${variable}`] = !offspring2[variable];
        }

        return [offspring1, offspring2];    
    }

    public doSelection(
        population: EvaluatedIndividual<SatAssignment>[],
        selectionCount: number
    ): EvaluatedIndividual<SatAssignment>[] {
        return Selections.tournamentSelection(population, selectionCount);
    }

    private isClauseSatisfied(solution: SatAssignment, clause: number): boolean {
        const [v1, v2, v3] = this.formula.clauses[clause];
        return solution[v1] || solution[v2] || solution[v3];
    }

    private countSatisfiedClauses(solution: SatAssignment): number {
        let count = 0;
        for (let i = 0; i < this.formula.clauses.length; i++) {
            if (this.isClauseSatisfied(solution, i)) {
                count++;
            }
        }
        return count;
    }

    public mutate(solution: SatAssignment): SatAssignment {
        let mutationCount = poissonDistribution(2);

        while (mutationCount > 0) {
            // randomly choose 2 variables to mutate
            let var1ToMutate = this.formula.variables[randInt(0, this.formula.variables.length)];
            let var2ToMutate = this.formula.variables[randInt(0, this.formula.variables.length)];

            // remove the negation
            if (var1ToMutate.startsWith('!')) {
                var1ToMutate = var1ToMutate.substring(1);
            }

            // remove the negation
            if (var2ToMutate.startsWith('!')) {
                var2ToMutate = var2ToMutate.substring(1);
            }

            // if the variables are the same, skip
            if (var1ToMutate === var2ToMutate) {
                continue;
            }

            // get the values of the variables
            const var1Value = solution[var1ToMutate];
            const var2Value = solution[var2ToMutate];

            // if the values are the same, skip
            if (var1Value === var2Value) {
                continue;
            }

            // build a new optional solution
            const tempSolution = Object.assign({}, solution);
            tempSolution[var1ToMutate] = var2Value;
            tempSolution[`!${var1ToMutate}`] = !var2Value;
            tempSolution[var2ToMutate] = var1Value;
            tempSolution[`!${var2ToMutate}`] = !var1Value;

            const oldScore = this.countSatisfiedClauses(solution);
            const newScore = this.countSatisfiedClauses(tempSolution);

            // if the new score is better or equal, accept the mutation
            if (newScore >= oldScore) {
                // Swap the values
                const temp = solution[var1ToMutate];
                solution[var1ToMutate] = solution[var2ToMutate];
                solution[var2ToMutate] = temp;
                mutationCount--;
            }
        }

        return solution;
    }

    /**
     * the lower the score the better the solution
     */
    public evaluate(solution: SatAssignment): number {
        let score = 0;

        // check the clauses
        for (let i = 0; i < this.formula.clauses.length; i++) {
            if (!this.isClauseSatisfied(solution, i)) {
                score++;
            }
        }

        return score;
    }

    public updateProgress(generation: number, evaulatedPopulation: EvaluatedPopulation<SatAssignment>): void {
        const bestIndividual = evaulatedPopulation.bestIndividual;
        if (generation % 1 === 0) {
            console.log(`Generation: ${generation}, Best Score: ${bestIndividual.fitness}`);
        }
    }

    public isEvolutionFinished(generation: number, bestFitness: number): boolean {
        return generation === this.maxGenerations || bestFitness === 0;
    }
}