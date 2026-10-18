import type { Individual, SimTile } from '../models/simulation-types';
import type { SimulationConfig } from '../config/simulation.config';
import type { TileGrid } from '../models/tile-grid';
import type { IRandom } from '../random/seeded-rng';
import { NavigationSystem } from './navigation.system';

export class DecisionSystem {
  /**
   * Evaluates and updates currentGoal, currentAction, and targetTile for an individual.
   * Runs in Phase 5.
   */
  static evaluateIntent(
    ind: Individual,
    grid: TileGrid,
    config: SimulationConfig,
    rng: IRandom,
    allIndividuals?: ReadonlyMap<string, Individual>
  ): void {
    if (!ind.isAlive) {
      ind.currentGoal = 'idle';
      ind.currentAction = 'idle';
      ind.targetTile = undefined;
      return;
    }

    const currentTile = grid.get(ind.x, ind.y);

    // 1. Critical Hunger / Starvation (< critical threshold or search threshold)
    if (ind.hunger >= config.hungerSearchThreshold) {
      // Check if current tile already has food
      if (currentTile && currentTile.resources.food >= 1) {
        ind.currentGoal = 'eat';
        ind.currentAction = 'consume';
        ind.targetTile = { x: ind.x, y: ind.y };
        return;
      }

      // Check if current target tile is still valid and has food
      if (ind.targetTile) {
        const targetT = grid.get(ind.targetTile.x, ind.targetTile.y);
        if (targetT && targetT.traversable && targetT.resources.food >= 1) {
          ind.currentGoal = 'find_food';
          ind.currentAction = 'move';
          return;
        }
      }

      // Search nearest food tile
      const foodTile = NavigationSystem.findNearestTile(
        grid,
        ind.x,
        ind.y,
        (t) => t.traversable && t.resources.food >= 1,
        25
      );

      if (foodTile) {
        ind.targetTile = { x: foodTile.x, y: foodTile.y };
        if (foodTile.x === ind.x && foodTile.y === ind.y) {
          ind.currentGoal = 'eat';
          ind.currentAction = 'consume';
        } else {
          ind.currentGoal = 'find_food';
          ind.currentAction = 'move';
        }
        return;
      }

      // If no food found within search radius, search wider or wander hoping to find resources
      ind.currentGoal = 'survive_critical';
      ind.currentAction = 'move';
      DecisionSystem.pickRandomWanderTarget(ind, grid, rng);
      return;
    }

    // 2. Exhaustion / Rest
    if (ind.energy < config.energyRestThreshold) {
      ind.currentGoal = 'rest';
      ind.currentAction = 'rest';
      ind.targetTile = undefined;
      return;
    }

    // 3. Reproduction drive: if adult, healthy, well-fed, well-rested, and cooldown == 0
    if (
      ind.lifeStage !== 'child' &&
      ind.reproductionCooldown === 0 &&
      ind.hunger <= config.reproductionHungerMax &&
      ind.energy >= config.reproductionEnergyMin &&
      allIndividuals
    ) {
      const partner = DecisionSystem.findPotentialPartner(ind, allIndividuals, config);
      if (partner) {
        const distSq = (ind.x - partner.x) ** 2 + (ind.y - partner.y) ** 2;
        if (distSq <= 2.25) {
          ind.currentGoal = 'seek_partner';
          ind.currentAction = 'reproduce';
          ind.targetTile = { x: partner.x, y: partner.y };
          return;
        } else {
          ind.currentGoal = 'seek_partner';
          ind.currentAction = 'move';
          ind.targetTile = { x: partner.x, y: partner.y };
          return;
        }
      }
    }

    // 4. Child behavior (stay close or wander gently)
    if (ind.lifeStage === 'child') {
      ind.currentGoal = 'follow_parent';
      // If idle, wander near
      if (rng.nextBool(0.4)) {
        ind.currentAction = 'move';
        DecisionSystem.pickRandomWanderTarget(ind, grid, rng);
      } else {
        ind.currentAction = 'idle';
      }
      return;
    }

    // 5. Group Work: Gather wood or stone for shared group inventory
    if (ind.groupId && ind.hunger < 45 && ind.energy >= 35) {
      if (currentTile && (currentTile.resources.wood >= 1 || currentTile.resources.stone >= 1)) {
        ind.currentGoal = 'work_group';
        ind.currentAction = 'gather';
        ind.targetTile = { x: ind.x, y: ind.y };
        return;
      }
      const resTile = NavigationSystem.findNearestTile(
        grid,
        ind.x,
        ind.y,
        (t) => t.traversable && (t.resources.wood >= 1 || t.resources.stone >= 1),
        10
      );
      if (resTile) {
        ind.currentGoal = 'work_group';
        ind.currentAction = 'move';
        ind.targetTile = { x: resTile.x, y: resTile.y };
        return;
      }
    }

    // 6. Default: Exploration / Wander
    // If individual is already actively exploring towards a target, keep moving until destination reached
    if (ind.currentGoal === 'explore' && ind.targetTile) {
      if (ind.x !== ind.targetTile.x || ind.y !== ind.targetTile.y) {
        const targetTileObj = grid.get(ind.targetTile.x, ind.targetTile.y);
        if (targetTileObj && targetTileObj.traversable) {
          ind.currentAction = 'move';
          return;
        }
      }
    }

    // Pick multi-step exploration destination (3 to 6 tiles away) or idle briefly
    if (rng.nextBool(0.75)) {
      ind.currentGoal = 'explore';
      ind.currentAction = 'move';
      DecisionSystem.pickExploreTarget(ind, grid, rng);
    } else {
      ind.currentGoal = 'idle';
      ind.currentAction = 'idle';
      ind.targetTile = undefined;
    }
  }

  private static findPotentialPartner(
    ind: Individual,
    allIndividuals: ReadonlyMap<string, Individual>,
    config: SimulationConfig
  ): Individual | null {
    let nearest: Individual | null = null;
    let nearestDistSq = Infinity;

    for (const other of allIndividuals.values()) {
      if (
        other.isAlive &&
        other.id !== ind.id &&
        other.lifeStage !== 'child' &&
        other.gender !== ind.gender &&
        other.reproductionCooldown === 0 &&
        other.hunger <= config.reproductionHungerMax &&
        other.energy >= config.reproductionEnergyMin &&
        !ind.parentIds.includes(other.id) &&
        !other.parentIds.includes(ind.id)
      ) {
        const distSq = (ind.x - other.x) ** 2 + (ind.y - other.y) ** 2;
        if (distSq < nearestDistSq && distSq <= 400) {
          // within 20 tiles
          nearestDistSq = distSq;
          nearest = other;
        }
      }
    }

    return nearest;
  }

  private static pickExploreTarget(ind: Individual, grid: TileGrid, rng: IRandom): void {
    const distance = rng.nextInt(3, 6);
    const angle = rng.next() * Math.PI * 2;
    const targetX = Math.round(ind.x + Math.cos(angle) * distance);
    const targetY = Math.round(ind.y + Math.sin(angle) * distance);

    const clampedX = Math.max(0, Math.min(grid.width - 1, targetX));
    const clampedY = Math.max(0, Math.min(grid.height - 1, targetY));
    const tile = grid.get(clampedX, clampedY);

    if (tile && tile.traversable && (clampedX !== ind.x || clampedY !== ind.y)) {
      ind.targetTile = { x: clampedX, y: clampedY };
    } else {
      const fallback = NavigationSystem.findNearestTile(
        grid,
        clampedX,
        clampedY,
        (t) => t.traversable && (t.x !== ind.x || t.y !== ind.y),
        4
      );
      if (fallback) {
        ind.targetTile = { x: fallback.x, y: fallback.y };
      } else {
        DecisionSystem.pickRandomWanderTarget(ind, grid, rng);
      }
    }
  }

  private static pickRandomWanderTarget(ind: Individual, grid: TileGrid, rng: IRandom): void {
    const neighbors = grid.getNeighbors(ind.x, ind.y, false).filter((t) => t.traversable);
    if (neighbors.length > 0) {
      const chosen = rng.pick(neighbors);
      ind.targetTile = { x: chosen.x, y: chosen.y };
    } else {
      ind.targetTile = undefined;
    }
  }
}
