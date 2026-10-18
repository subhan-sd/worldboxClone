import type { SimTile, ResourceStock } from '../models/simulation-types';
import { TileGrid } from '../models/tile-grid';
import type { SimulationConfig } from '../config/simulation.config';

export class ResourceSystem {
  /**
   * Regenerates resources across the grid according to soil fertility and max limits.
   * Runs once per tick.
   */
  static regenerate(grid: TileGrid, config: SimulationConfig): void {
    const tiles = grid.getAllTiles();
    for (let i = 0; i < tiles.length; i++) {
      const tile = tiles[i];

      // Food regeneration (boosted by fertility and water access)
      if (tile.resources.food < tile.maxResources.food) {
        const waterBonus = tile.waterAccess ? 1.5 : 1.0;
        const gain = config.foodRegenRate * tile.fertility * waterBonus;
        tile.resources.food = Math.min(tile.maxResources.food, tile.resources.food + gain);
      }

      // Wood regeneration (on grass & soil)
      if (tile.resources.wood < tile.maxResources.wood) {
        if (tile.terrain === 'grass' || tile.terrain === 'soil') {
          tile.resources.wood = Math.min(
            tile.maxResources.wood,
            tile.resources.wood + config.woodRegenRate * tile.fertility
          );
        }
      }

      // Stone regeneration (very slow, only on rock or sand)
      if (tile.resources.stone < tile.maxResources.stone) {
        if (tile.terrain === 'rock' || tile.terrain === 'sand') {
          tile.resources.stone = Math.min(
            tile.maxResources.stone,
            tile.resources.stone + config.stoneRegenRate
          );
        }
      }
    }
  }

  /**
   * Harvests an amount of a specific resource from a tile.
   * Guarantees resource never drops below 0 and returns exact amount extracted.
   */
  static harvest(tile: SimTile, type: keyof ResourceStock, amount: number): number {
    if (amount <= 0) return 0;
    const current = tile.resources[type];
    if (current <= 0) return 0;

    const extracted = Math.min(current, amount);
    tile.resources[type] = Math.max(0, current - extracted);
    return extracted;
  }

  /**
   * Calculates total available resources across all tiles in the grid.
   */
  static aggregateWorldResources(grid: TileGrid): ResourceStock {
    let food = 0;
    let wood = 0;
    let stone = 0;

    const tiles = grid.getAllTiles();
    for (let i = 0; i < tiles.length; i++) {
      const t = tiles[i];
      food += t.resources.food;
      wood += t.resources.wood;
      stone += t.resources.stone;
    }

    return { food, wood, stone };
  }
}
