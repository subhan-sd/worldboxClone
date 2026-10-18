import type { SimTerrainType, SimTile, ResourceStock } from './simulation-types';

export class TileGrid {
  readonly width: number;
  readonly height: number;
  private readonly tiles: SimTile[];

  constructor(width: number, height: number, defaultTerrain: SimTerrainType = 'grass') {
    this.width = width;
    this.height = height;
    this.tiles = new Array(width * height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        this.tiles[idx] = this.createDefaultTile(x, y, defaultTerrain);
      }
    }
  }

  private createDefaultTile(x: number, y: number, terrain: SimTerrainType): SimTile {
    const traversable = terrain !== 'water' && terrain !== 'rock';
    const fertility = terrain === 'soil' ? 0.9 : terrain === 'grass' ? 0.7 : terrain === 'sand' ? 0.2 : 0.05;
    const maxResources: ResourceStock = {
      food: terrain === 'soil' ? 25 : terrain === 'grass' ? 15 : 0,
      wood: terrain === 'grass' ? 20 : terrain === 'soil' ? 10 : 0,
      stone: terrain === 'rock' ? 50 : terrain === 'grass' ? 5 : 2,
    };
    const resources: ResourceStock = {
      food: Math.floor(maxResources.food * 0.5),
      wood: Math.floor(maxResources.wood * 0.5),
      stone: Math.floor(maxResources.stone * 0.5),
    };

    return {
      x,
      y,
      terrain,
      traversable,
      fertility,
      waterAccess: false,
      resources,
      maxResources,
    };
  }

  inBounds(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  get(x: number, y: number): SimTile | undefined {
    if (!this.inBounds(x, y)) return undefined;
    return this.tiles[y * this.width + x];
  }

  getByIndex(index: number): SimTile | undefined {
    return this.tiles[index];
  }

  get totalTiles(): number {
    return this.tiles.length;
  }

  getAllTiles(): ReadonlyArray<SimTile> {
    return this.tiles;
  }

  setTile(x: number, y: number, tile: SimTile): void {
    if (this.inBounds(x, y)) {
      this.tiles[y * this.width + x] = tile;
    }
  }

  getNeighbors(x: number, y: number, includeDiagonal: boolean = false): SimTile[] {
    const neighbors: SimTile[] = [];
    const dirs = includeDiagonal
      ? [
          [0, -1], [1, 0], [0, 1], [-1, 0],
          [1, -1], [1, 1], [-1, 1], [-1, -1],
        ]
      : [
          [0, -1], [1, 0], [0, 1], [-1, 0],
        ];

    for (const [dx, dy] of dirs) {
      const nx = x + dx;
      const ny = y + dy;
      const t = this.get(nx, ny);
      if (t) neighbors.push(t);
    }
    return neighbors;
  }

  recalculateWaterAccess(): void {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const tile = this.get(x, y);
        if (!tile) continue;
        if (tile.terrain === 'water') {
          tile.waterAccess = true;
          continue;
        }
        const neighbors = this.getNeighbors(x, y, false);
        tile.waterAccess = neighbors.some((n) => n.terrain === 'water');
      }
    }
  }
}
