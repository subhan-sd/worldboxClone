import type { Individual } from '../models/simulation-types';
import type { SimulationConfig } from '../config/simulation.config';
import type { IRandom } from '../random/seeded-rng';

export class NeedsSystem {
  /**
   * Updates metabolic needs, aging, and life stage transitions for a living individual.
   * Runs in Phase 3.
   */
  static updateNeedsAndAging(
    ind: Individual,
    config: SimulationConfig,
    currentTick: number
  ): void {
    if (!ind.isAlive) return;

    // Age increment
    ind.age = currentTick - ind.birthTick;

    // Life stage progression
    if (ind.age <= config.childAgeMax) {
      ind.lifeStage = 'child';
    } else if (ind.age <= config.adultAgeMax) {
      ind.lifeStage = 'adult';
    } else {
      ind.lifeStage = 'elder';
    }

    // Hunger increase
    ind.hunger = Math.min(100, ind.hunger + config.hungerIncreasePerTick);

    // Energy drain or recovery based on current action
    if (ind.currentAction === 'rest' || ind.currentAction === 'idle') {
      ind.energy = Math.min(100, ind.energy + config.energyRestRecoveryPerTick);
    } else {
      ind.energy = Math.max(0, ind.energy - config.energyDrainPerTick);
    }

    // Reproduction cooldown decrement
    if (ind.reproductionCooldown > 0) {
      ind.reproductionCooldown--;
    }
  }

  /**
   * Evaluates starvation damage, health recovery, and natural aging mortality.
   * Runs in Phase 4.
   * Returns true if entity died this tick.
   */
  static evaluateHealthAndMortality(
    ind: Individual,
    config: SimulationConfig,
    rng: IRandom,
    currentTick: number
  ): boolean {
    if (!ind.isAlive) return false;

    // Starvation damage when hunger is at maximum (100)
    if (ind.hunger >= 100) {
      ind.health = Math.max(0, ind.health - config.starvationDamagePerTick);
      if (ind.health <= 0) {
        ind.isAlive = false;
        ind.causeOfDeath = 'starvation';
        ind.deathTick = currentTick;
        return true;
      }
    } else if (ind.hunger < 30 && ind.health < 100) {
      // Natural health recovery when well-fed
      ind.health = Math.min(100, ind.health + config.healthRegenPerTick);
    }

    // Natural elder mortality check
    if (ind.lifeStage === 'elder') {
      const deathChance =
        config.elderDeathChanceBase + (ind.age - config.adultAgeMax) * 0.001;
      if (rng.next() < deathChance) {
        ind.isAlive = false;
        ind.health = 0;
        ind.causeOfDeath = 'old_age';
        ind.deathTick = currentTick;
        return true;
      }
    }

    return false;
  }

  /**
   * Consumes food to reduce hunger and restore a small amount of energy.
   */
  static consumeFood(ind: Individual, foodUnits: number, config: SimulationConfig): void {
    if (foodUnits <= 0 || !ind.isAlive) return;

    const hungerReduction = foodUnits * config.foodNutritionValue;
    ind.hunger = Math.max(0, ind.hunger - hungerReduction);
    ind.energy = Math.min(100, ind.energy + 5);
  }
}
