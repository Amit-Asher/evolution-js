import { randInt } from "../../framework/common";
import { TSP } from "./tsp-evolution-engine";
import fse from 'fs-extra';

interface CreateTSProblemInput {
    /**
     * Number of cities in the problem
     */
    numOfCities: number;

    /**
     * Maximum distance between cities
     */
    maxDistance: number;
}

export function createTSProblem(input: CreateTSProblemInput): TSP {

    const { numOfCities, maxDistance } = input;

    const problem: TSP = {
        cities: [],
        source: '',
        destination: '',
        distancesInHours: {}
    };

    const cities = fse.readFileSync('src/examples/tsp/cities.csv', 'utf8').split('\n');

    // add cities to the problem
    while (problem.cities.length < numOfCities) {
        const newCity = cities[randInt(0, cities.length)];
        if (!problem.cities.includes(newCity)) {
            problem.cities.push(newCity);
        }
    }

    // genrate distances between cities
    for (let i = 0; i < numOfCities; i++) {
        for (let j = 0; j < numOfCities; j++) {
            if (i === j) {
                continue;
            }
            const from = problem.cities[i];
            const to = problem.cities[j];
            const distance = randInt(1, maxDistance + 1);
            const key = `${from}:${to}`;
            problem.distancesInHours[key] = distance;
        }
    }

    // randomly assign source and destination
    problem.source = problem.cities[randInt(0, problem.cities.length)];
    problem.destination = problem.cities[randInt(0, problem.cities.length)];
    while (problem.destination === problem.source) {
        problem.destination = problem.cities[randInt(0, problem.cities.length)];
    }

    return problem;
}