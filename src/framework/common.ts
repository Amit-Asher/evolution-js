import MersenneTwister from "mersenne-twister";

/**
 * inclusive of low
 * exclusive of high
 */
const seed = 1234 // Math.floor(Math.random() * 10000);
console.log('seed:', seed);
const rng = new MersenneTwister(seed);
export function randInt(low: number, high: number): number {
    return Math.floor(rng.random() * (high - low) + low);
}

export function poissonDistribution(): number {
    let x = 0;
    let t = 0.0;
    const MEAN = 2;
    while (true) {
        t -= Math.log(rng.random()) / MEAN;
        if (t > 1.0) {
            break;
        }
        ++x;
    }
    return x;
}
