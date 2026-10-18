import type {
  Settlement,
  SocialGroup,
  Building,
  BuildingType,
} from '../models/simulation-types';
import type { SimulationConfig } from '../config/simulation.config';
import { TileGrid } from '../models/tile-grid';
import { SocialGroupSystem } from './social-group.system';

export class SettlementSystem {
  /**
   * Deterministically calculates site desirability for a settlement.
   */
  static calculateSiteScore(
    grid: TileGrid,
    centerX: number,
    centerY: number,
    radius: number = 3
  ): number {
    const center = grid.get(centerX, centerY);
    if (!center || !center.traversable) {
      return -Infinity;
    }

    let totalFood = 0;
    let totalWood = 0;
    let totalStone = 0;
    let hasWater = false;
    let fertilitySum = 0;
    let validTileCount = 0;

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const tx = centerX + dx;
        const ty = centerY + dy;
        const t = grid.get(tx, ty);
        if (!t) continue;

        validTileCount++;
        totalFood += t.resources.food;
        totalWood += t.resources.wood;
        totalStone += t.resources.stone;
        fertilitySum += t.fertility;

        if (t.waterAccess || t.terrain === 'water') {
          hasWater = true;
        }
      }
    }

    if (validTileCount === 0) return 0;

    const avgFertility = fertilitySum / validTileCount;
    const waterScore = hasWater ? 6.0 : 0.0;
    const foodScore = Math.min(10.0, totalFood * 0.1);
    const woodScore = Math.min(5.0, totalWood * 0.05);
    const stoneScore = Math.min(5.0, totalStone * 0.05);
    const fertilityScore = avgFertility * 8.0;

    return Number(
      (waterScore + foodScore + woodScore + stoneScore + fertilityScore).toFixed(2)
    );
  }

  /**
   * Founds a new settlement for a group at a specified location.
   */
  static foundSettlement(
    settlementId: string,
    name: string,
    group: SocialGroup,
    position: { x: number; y: number },
    foundedTick: number,
    initialHousing: number = 4,
    initialStorage: number = 50
  ): Settlement {
    const settlement: Settlement = {
      id: settlementId,
      name,
      tilePosition: { x: position.x, y: position.y },
      groupId: group.id,
      housingCapacity: initialHousing,
      storageCapacity: initialStorage,
      buildings: [],
      foundedTick,
    };

    group.settlementId = settlementId;
    group.status = 'settled';
    group.homeTile = { x: position.x, y: position.y };

    return settlement;
  }

  /**
   * Checks if group has sufficient resources to construct a building.
   */
  static canConstruct(
    group: SocialGroup,
    type: BuildingType,
    config: SimulationConfig
  ): boolean {
    const cost = type === 'house' ? config.houseCost : config.storageCost;
    return (
      group.sharedInventory.wood >= cost.wood &&
      group.sharedInventory.stone >= cost.stone &&
      group.sharedInventory.food >= cost.food
    );
  }

  /**
   * Deducts resources and constructs a building in the settlement.
   * Returns created building, or null if resources are insufficient.
   */
  static constructBuilding(
    settlement: Settlement,
    group: SocialGroup,
    type: BuildingType,
    buildingId: string,
    currentTick: number,
    config: SimulationConfig
  ): Building | null {
    if (!SettlementSystem.canConstruct(group, type, config)) {
      return null;
    }

    const cost = type === 'house' ? config.houseCost : config.storageCost;

    // Deduct actual resources
    SocialGroupSystem.withdrawResource(group, 'wood', cost.wood);
    SocialGroupSystem.withdrawResource(group, 'stone', cost.stone);
    SocialGroupSystem.withdrawResource(group, 'food', cost.food);

    const building: Building = {
      id: buildingId,
      type,
      x: settlement.tilePosition.x,
      y: settlement.tilePosition.y,
      builtTick: currentTick,
    };

    settlement.buildings.push(building);

    if (type === 'house') {
      settlement.housingCapacity += config.houseCapacity;
    } else if (type === 'storage') {
      settlement.storageCapacity += config.storageCapacity;
    }

    return building;
  }
}
