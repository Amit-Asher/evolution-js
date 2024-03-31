import crypto from 'crypto';
import { randInt } from '../examples/sudoku/utils';

export interface Individual<T> {
    solution: T,
    uuid: string
};

export interface EvaluatedIndividual<T> extends Individual<T> {
    fitness: number;
}

export interface IndividualRecord<T> extends EvaluatedIndividual<T> {
    generation: number;
}

export interface EvaluatePopulationInput<T> {
    population: Individual<T>[];
    generation: number;
}

export interface EngineConfig {
    populationSize: number;
    maxGenerations: number;
    elitism: number;
    bestDirection?: 'min' | 'max';
}

export interface EvaluatedPopulation<S> {
    individuals: EvaluatedIndividual<S>[];
    bestIndividual: IndividualRecord<S>;
}

export interface EvolutionStopCriterias {
    generation: number;
    bestFitness: number;
}

/**
 * Abstract class for the evolution engine.
 * @param <S> The type of the solution.
 */
export abstract class AbstractEvolutionEngine<S> {
    /**
     * The size of the population each generation.
     */
    public populationSize: number;

    /**
     * The number of generations per evolution.
     */
    public maxGenerations: number;

    /**
     * The history of the evolution to track progress and identify convergence.
     */
    public evolutionHistory: IndividualRecord<S>[] = [];

    /**
     * The size of the elite solutions to keep in the next generation.
     */
    public elitism: number;

    /**
     * the evaluation logic might be expensive
     * therefore, we can cache the fitness of the solutions to avoid re-evaluation.
     */
    private elitismCache: { [uuid: string]: number } = {};

    /**
     * The direction of the best fitness (minimization if 0 or maximization if INF).
     */
    public optimizationDirection: 'min' | 'max';

    public constructor(config: EngineConfig) {
        this.populationSize = config.populationSize || 5000;
        this.maxGenerations = config.maxGenerations || 1000;
        this.elitism = config.elitism || 250;
        this.optimizationDirection = config.bestDirection || 'min';
    }

    /**
     * Generate initial population- random solutions from the sample space.
     * note: the result may contain duplicates (its ok).
     * @returns T[]
     */
    public generateInitialPopulation(): Individual<S>[] {
        const initialPopulation: Individual<S>[] = [];

        for (let i = 0; i < this.populationSize; i++) {
            initialPopulation.push({
                solution: this.generateSolution(),
                uuid: crypto.randomUUID().toString()
            });
        }

        return initialPopulation;
    }


    /**
     * generate a random solution from the sample space.
     */
    public abstract generateSolution(): S;

    /**
     * create 2 new children from 2 parents.
     * the children will be a combination of the parents (crossover).
     * it resamble the natural selection in the genetic algorithm.
     * @param parent1 T
     * @param parent2 T
     * @returns T
     */
    public abstract doCrossover(parent1: S, parent2: S): S[];

    /**
     * mutate a single solution.
     * NOTE: avoid from mutating the problem characteristics.
     * @param solution T
     * @returns T
     */
    public abstract mutate(solution: S): S;

    /**
     * evaluate the fitness of the solution.
     * @param solution T
     * @returns number
     */
    public abstract evaluate(solution: S): number;

    /**
     * select solutions from the population to the next generation.
     * the result is populationSize - elitism.
     * @param population T[]
     * @param selectionCount populationSize - elitism
     * @returns T[]
     */
    public abstract doSelection(population: EvaluatedIndividual<S>[], selectionCount: number): EvaluatedIndividual<S>[];

    /**
     * update the progress of the evolution.
     * @param generation 
     * @returns 
     */
    public abstract updateProgress(generation: number, evaulatedPopulation: EvaluatedPopulation<S>): void;

    /**
     * compare the fitness of 2 solutions.
     * @param moreFit
     * @param lessFit 
     * @returns 
     */
    public compareFitness(moreFit: number, lessFit: number): boolean {
        if (this.optimizationDirection === 'min') {
            return moreFit < lessFit;
        }

        if (this.optimizationDirection === 'max') {
            return moreFit > lessFit;
        }

        throw new Error('Invalid optimization direction');
    }

    /**
     * returns the best solution of the generation and the evaluated population sorted by fitness.
     * @param population 
     * @returns 
     */
    public evaluateGeneration(input: EvaluatePopulationInput<S>): EvaluatedPopulation<S> {
        const { population, generation } = input;

        // initialize variables.
        let evaluatedPopulation: EvaluatedIndividual<S>[] = [];
        let bestSolutionOfTheGeneration: EvaluatedIndividual<S> = null as any;

        for (const individual of population) {
            // evaluate the individual
            const individualfitness = this.elitismCache[individual.uuid] || this.evaluate(individual.solution); // (injection point)

            // create a evaluation for the individual.
            evaluatedPopulation.push({
                solution: individual.solution,
                fitness: individualfitness,
                uuid: individual.uuid
            });

            // compare the individual to the best solution of the generation.
            if (!bestSolutionOfTheGeneration || this.compareFitness(individualfitness, bestSolutionOfTheGeneration.fitness)) {
                bestSolutionOfTheGeneration = evaluatedPopulation[evaluatedPopulation.length - 1];
            }
        }

        // save the best solution of the generation in the history.
        this.evolutionHistory.push({ ...bestSolutionOfTheGeneration, generation });

        // sort the evaluated population by fitness.
        evaluatedPopulation.sort((a, b) => this.compareFitness(a.fitness, b.fitness) ? -1 : 1);

        // clear and populate the elitism cache for the next generation.
        this.elitismCache = {};
        for (let i = 0; i < this.elitism; i++) {
            const eliteIndividual = evaluatedPopulation[i];
            this.elitismCache[eliteIndividual.uuid] = eliteIndividual.fitness;
        }

        // create the evaluation result.
        const evaluation: EvaluatedPopulation<S> = {
            individuals: evaluatedPopulation,
            bestIndividual: { ...bestSolutionOfTheGeneration, generation }
        };

        // update the progress of the evolution.
        this.updateProgress(generation, evaluation);

        // return the evaluation.
        return evaluation;
    }

    private evolve(currentPopulation: EvaluatedPopulation<S>) {
        // initialize the new population.
        const newPopulation: Individual<S>[] = [];

        // keep the elite solutions in the next generation.
        const elite = currentPopulation.individuals.slice(0, this.elitism);
        newPopulation.push(...elite);

        // select individuals from the population to the next generation (injection point)
        const selectedPopulation: EvaluatedIndividual<S>[] = this.doSelection(
            currentPopulation.individuals,
            this.populationSize - this.elitism
        );

        // shuffle the selected population.
        selectedPopulation.sort(() => randInt(0, 2) - 1);

        for (let j = 0; j < selectedPopulation.length; j += 2) {
            // take 2 parents (random parents because of shuffling)
            const parent1 = selectedPopulation[j].solution;
            const parent2 = selectedPopulation[j + 1]?.solution;

            // in case of odd number of selected population, add the last solution to the new population.
            if (!parent2) {
                newPopulation.push({
                    solution: parent1,
                    uuid: crypto.randomUUID().toString()
                });
                continue;
            }

            // create 2 new children from the parents
            const children = this.doCrossover(parent1, parent2); // (injection point)

            // mutate the children
            const mutated1 = this.mutate(children[0]); // (injection point)
            const mutated2 = this.mutate(children[1]); // (injection point)

            // push to new population
            newPopulation.push({ solution: mutated1, uuid: crypto.randomUUID().toString() });
            newPopulation.push({ solution: mutated2, uuid: crypto.randomUUID().toString() });
        }

        return newPopulation;
    }

    /**
     * check if the evolution is finished.
     * @param generation 
     * @param topfitness 
     */
    public abstract isEvolutionFinished(generation: number, topfitness: number): boolean;

    /**
     * evolve the population to find the best solution.
     * @returns 
     */
    public doEvolution(): IndividualRecord<S> {
        let currentGeneration = 0;

        // generate initial population
        let population: Individual<S>[] = this.generateInitialPopulation(); // (injection point)

        // evaluate the generation
        let evaluatedPopulation: EvaluatedPopulation<S> = this.evaluateGeneration({ // (injection point)
            population,
            generation: currentGeneration
        });

        // initialize the best solution of all generations.
        let bestSolutionOfAllGenerations: IndividualRecord<S> = evaluatedPopulation.bestIndividual;

        while (!this.isEvolutionFinished(currentGeneration, bestSolutionOfAllGenerations.fitness)) { // (injection point)
            currentGeneration++;

            // initialize the new population.
            const newPopulation: Individual<S>[] = this.evolve(evaluatedPopulation); // (injection point)

            // evaluate new population
            evaluatedPopulation = this.evaluateGeneration({ // (injection point)
                population: newPopulation,
                generation: currentGeneration
            });

            // compare the best solution of the generation to the best solution of all generations.
            if (evaluatedPopulation.bestIndividual.fitness < bestSolutionOfAllGenerations.fitness) {
                bestSolutionOfAllGenerations = evaluatedPopulation.bestIndividual;
            }

            // update the population.
            population = newPopulation;
        }


        return bestSolutionOfAllGenerations;
    }
}