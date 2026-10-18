import type { IRandom } from '../random/seeded-rng';
import { TileGrid } from '../models/tile-grid';
import type { SimTerrainType } from '../models/simulation-types';
import { createTerrainTile } from '../models/terrain-rules';

export class WorldGenerator {
  static generate(width: number, height: number, rng: IRandom): TileGrid {
    const grid = new TileGrid(width, height, 'grass');

    // 1. Generate 1-2 water bodies (lakes/rivers)
    const numLakes = rng.nextInt(2, 3);
    for (let l = 0; l < numLakes; l++) {
      const centerX = rng.nextInt(5, width - 6);
      const centerY = rng.nextInt(5, height - 6);
      const radius = rng.nextInt(3, 6);

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          if (dx * dx + dy * dy <= radius * radius + rng.nextInt(-1, 2)) {
            const tx = centerX + dx;
            const ty = centerY + dy;
            if (grid.inBounds(tx, ty)) {
              WorldGenerator.setTileTerrain(grid, tx, ty, 'water');
            }
          }
        }
      }
    }

    // 2. Sand beaches around water
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tile = grid.get(x, y);
        if (tile && tile.terrain === 'grass') {
          const adjWater = grid.getNeighbors(x, y, false).some((n) => n.terrain === 'water');
          if (adjWater && rng.nextBool(0.8)) {
            WorldGenerator.setTileTerrain(grid, x, y, 'sand');
          }
        }
      }
    }

    // 3. Fertile soil patches (agricultural zones)
    const numSoilPatches = rng.nextInt(4, 7);
    for (let s = 0; s < numSoilPatches; s++) {
      const cx = rng.nextInt(4, width - 5);
      const cy = rng.nextInt(4, height - 5);
      const radius = rng.nextInt(2, 4);

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          if (dx * dx + dy * dy <= radius * radius) {
            const tx = cx + dx;
            const ty = cy + dy;
            const tile = grid.get(tx, ty);
            if (tile && tile.terrain === 'grass') {
              WorldGenerator.setTileTerrain(grid, tx, ty, 'soil');
            }
          }
        }
      }
    }

    // 4. Rock formations
    const numRockPatches = rng.nextInt(3, 5);
    for (let r = 0; r < numRockPatches; r++) {
      const cx = rng.nextInt(3, width - 4);
      const cy = rng.nextInt(3, height - 4);
      const radius = rng.nextInt(2, 3);

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          if (dx * dx + dy * dy <= radius * radius && rng.nextBool(0.75)) {
            const tx = cx + dx;
            const ty = cy + dy;
            const tile = grid.get(tx, ty);
            if (tile && tile.terrain !== 'water') {
              WorldGenerator.setTileTerrain(grid, tx, ty, 'rock');
            }
          }
        }
      }
    }

    // 5. Finalize water access
    grid.recalculateWaterAccess();

    return grid;
  }

  private static setTileTerrain(grid: TileGrid, x: number, y: number, terrain: SimTerrainType): void {
    grid.setTile(x, y, createTerrainTile(x, y, terrain));
  }
}
