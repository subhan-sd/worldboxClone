import type { Genome, ExpressedTraits } from '../models/simulation-types';
import type { SimulationConfig } from '../config/simulation.config';
import type { IRandom } from '../random/seeded-rng';

export class GeneticsSystem {
  /**
   * Combines alleles from two parent genomes with bounded random crossover and mutation.
   * Guarantees all trait values remain strictly in [0.0, 1.0].
   */
  static combineGenomes(
    parentA: Genome,
    parentB: Genome,
    rng: IRandom,
    config: SimulationConfig
  ): Genome {
    return {
      strength: GeneticsSystem.crossoverAndMutate(
        parentA.strength,
        parentB.strength,
        rng,
        config
      ),
      sociability: GeneticsSystem.crossoverAndMutate(
        parentA.sociability,
        parentB.sociability,
        rng,
        config
      ),
      exploration: GeneticsSystem.crossoverAndMutate(
        parentA.exploration,
        parentB.exploration,
        rng,
        config
      ),
      fertility: GeneticsSystem.crossoverAndMutate(
        parentA.fertility,
        parentB.fertility,
        rng,
        config
      ),
    };
  }

  /**
   * Crossover of a single scalar gene between two parents, with potential mutation.
   */
  static crossoverAndMutate(
    geneA: number,
    geneB: number,
    rng: IRandom,
    config: SimulationConfig
  ): number {
    // Random weighted blend between parents
    const weight = rng.next();
    let value = weight * geneA + (1 - weight) * geneB;

    // Mutation test
    if (rng.next() < config.mutationChance) {
      const delta = (rng.next() * 2 - 1) * config.mutationMagnitude;
      value += delta;
    }

    // Clamp strictly within [0.0, 1.0]
    return Math.max(0.0, Math.min(1.0, Number(value.toFixed(4))));
  }

  /**
   * Computes expressed behavioral traits from the underlying genome.
   */
  static expressTraits(genome: Genome): ExpressedTraits {
    return {
      strength: genome.strength,
      sociability: genome.sociability,
      exploration: genome.exploration,
      fertility: genome.fertility,
    };
  }
}
