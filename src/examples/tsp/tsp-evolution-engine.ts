import { poissonDistribution, randInt } from "../../framework/common";
import { AbstractEvolutionEngine, EngineConfig, EvaluatedIndividual, EvaluatedPopulation } from "../../framework/abstract-evolution-engine";
import { Crossovers } from "../../framework/crossovers";
import { Selections } from "../../framework/selections";

export interface TspEngineConfig extends EngineConfig {
    problem: TSP;
    mutationMargin: number;
}

export interface TSP {
    cities: string[];
    source: string;
    destination: string;
    /**
     * Distances between cities in hours
     * each direction has different distance
     * e.g "Tokyo:Tbilisi": 10
     */
    distancesInHours: {
        [fromTo: string]: number;
    };
}

type Path = string[]; // list of cities

export class TSPEvolutionEngine extends AbstractEvolutionEngine<Path> {
    private problem: TSP;
    private mutationMargin = 10; // margin for mutation

    public constructor(config: TspEngineConfig) {
        super({
            populationSize: config.populationSize || 5000,
            maxGenerations: config.maxGenerations || 1000,
            elitism: config.elitism || 250,
            bestDirection: 'min'
        });
        this.problem = config.problem;
        this.mutationMargin = config.mutationMargin || 10;
    }

    private removeSourceAndDestination(path: Path): Path {
        return path.filter(city => ![this.problem.source, this.problem.destination].includes(city));
    }

    private addSourceAndDestination(path: Path): Path {
        const copy = [...path];
        copy.unshift(this.problem.source);
        copy.push(this.problem.destination);
        return copy;
    }

    public generateSolution(): Path {
        // initialize the solution (copy the cities)
        let path: Path = [...this.problem.cities];
        // remove the source and destination
        path = this.removeSourceAndDestination(path);
        // randomly shuffle the cities
        path.sort(() => randInt(0, 2) === 0 ? -1 : 1);
        // add the source and destination back
        path = this.addSourceAndDestination(path);
        return path;
    }

    public doCrossover(parent1: Path, parent2: Path): Path[] {
        const child1 = [...parent1];
        const child2 = [...parent2];

        let crossoverCount = poissonDistribution(2);

        while(crossoverCount > 0) {
            // select random city to swap
            const tmp = this.removeSourceAndDestination([...parent1]);
            const city = tmp[randInt(0, tmp.length)];

            const parent1CityIdx = child1.indexOf(city);
            const parent2CityIdx = child2.indexOf(city);

            const parent1CityToSwapWith = child1[parent2CityIdx];
            const parent2CityToSwapWith = child2[parent1CityIdx];

            // swap for child1
            child1[parent1CityIdx] = parent1CityToSwapWith;
            child1[parent2CityIdx] = city;

            // swap for child2
            child2[parent2CityIdx] = parent2CityToSwapWith;
            child2[parent1CityIdx] = city;

            crossoverCount--;
        }

        return [child1, child2];
    }

    public doSelection(
        population: EvaluatedIndividual<Path>[],
        selectionCount: number
    ): EvaluatedIndividual<Path>[] {
        return Selections.tournamentSelection(population, selectionCount);
    }

    public mutate(solution: Path): Path {
        let mutationCount = poissonDistribution(2);
        
        while (mutationCount > 0) {
            // select 2 random cities to swap (excluding source and destination)
            const tmp = this.removeSourceAndDestination([...solution]);
            tmp.sort(() => randInt(0, 2) === 0 ? -1 : 1);
            const city1 = tmp[0];
            const city2 = tmp[1];

            // create alternative solution
            let alt = [...solution];
            const city1Idx = alt.indexOf(city1);
            const city2Idx = alt.indexOf(city2);

            // swap the cities
            alt[city1Idx] = city2;
            alt[city2Idx] = city1;
            
            // evaluate the solutions
            const oldScore = this.evaluate(solution);
            const newScore = this.evaluate(alt);

            // if the new score is better or equal, accept the mutation
            if (newScore <= oldScore + this.mutationMargin) {
                // Swap the values
                solution[city1Idx] = city2;
                solution[city2Idx] = city1;
                mutationCount--;
            }
        }

        return solution;
    }

    /**
     * the lower the score the better the solution
     */
    public evaluate(solution: Path): number {
        let score = 0;

        for (let i = 0; i < solution.length - 1; i++) {
            const from = solution[i];
            const to = solution[i + 1];
            const key = `${from}:${to}`;
            score += this.problem.distancesInHours[key];
        }

        return score;
    }

    public updateProgress(generation: number, evaulatedPopulation: EvaluatedPopulation<Path>): void {
        const bestIndividual = evaulatedPopulation.bestIndividual;
        if (generation % 1 === 0) {
            console.log(`Generation: ${generation}, Best Score: ${bestIndividual.fitness}`);
        }
    }

    public isEvolutionFinished(generation: number, bestFitness: number): boolean {
        return generation === this.maxGenerations || bestFitness === 0;
    }
}