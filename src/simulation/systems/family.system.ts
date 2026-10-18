import type { Individual, GenderType } from '../models/simulation-types';
import type { SimulationConfig } from '../config/simulation.config';
import type { IRandom } from '../random/seeded-rng';
import { GeneticsSystem } from './genetics.system';

export class FamilySystem {
  /**
   * Evaluates whether two individuals meet all prerequisites to reproduce.
   */
  static canReproduce(
    a: Individual,
    b: Individual,
    config: SimulationConfig
  ): boolean {
    if (!a.isAlive || !b.isAlive) return false;
    if (a.id === b.id) return false;

    // Both must be mature adults or non-infirm elders
    if (a.lifeStage === 'child' || b.lifeStage === 'child') return false;

    // Must be opposite genders for biological reproduction
    if (a.gender === b.gender) return false;

    // Direct parent-child restriction
    if (a.parentIds.includes(b.id) || b.parentIds.includes(a.id)) return false;

    // Must not be in reproduction cooldown
    if (a.reproductionCooldown > 0 || b.reproductionCooldown > 0) return false;

    // Needs must be satisfied (not starving, not exhausted)
    if (
      a.hunger > config.reproductionHungerMax ||
      b.hunger > config.reproductionHungerMax
    ) {
      return false;
    }
    if (
      a.energy < config.reproductionEnergyMin ||
      b.energy < config.reproductionEnergyMin
    ) {
      return false;
    }

    // Must be in close physical proximity (same tile or adjacent, distance <= 1.5)
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy <= 2.25;
  }

  /**
   * Generates a new child from two parents, applies inheritance and sets cooldowns.
   */
  static reproduce(
    parentA: Individual,
    parentB: Individual,
    childId: string,
    birthTick: number,
    rng: IRandom,
    config: SimulationConfig
  ): Individual {
    const genome = GeneticsSystem.combineGenomes(
      parentA.genome,
      parentB.genome,
      rng,
      config
    );
    const traits = GeneticsSystem.expressTraits(genome);

    const gender: GenderType = rng.nextBool(0.5) ? 'male' : 'female';
    const name =
      gender === 'male'
        ? `Son_of_${parentA.name.split('_')[0]}`
        : `Daughter_of_${parentB.name.split('_')[0]}`;

    // Place child at parent location
    const child: Individual = {
      id: childId,
      name,
      gender,
      birthTick,
      age: 0,
      lifeStage: 'child',
      health: 100,
      hunger: 20,
      energy: 100,
      x: parentA.x,
      y: parentA.y,
      isAlive: true,
      parentIds: [parentA.id, parentB.id],
      reproductionCooldown: 0,
      groupId: parentA.groupId || parentB.groupId,
      settlementId: parentA.settlementId || parentB.settlementId,
      genome,
      traits,
      currentGoal: 'idle',
      currentAction: 'idle',
    };

    // Apply reproduction cooldown and energy cost to both parents
    parentA.reproductionCooldown = config.reproductionCooldownTicks;
    parentB.reproductionCooldown = config.reproductionCooldownTicks;
    parentA.energy = Math.max(0, parentA.energy - 20);
    parentB.energy = Math.max(0, parentB.energy - 20);

    // Form bond / partner reference if not already partnered
    if (!parentA.partnerId) parentA.partnerId = parentB.id;
    if (!parentB.partnerId) parentB.partnerId = parentA.id;

    return child;
  }
}
