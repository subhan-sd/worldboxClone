import type { ResourceStock, SimTerrainType, SimTile } from './simulation-types';

export interface TerrainRules {
  readonly traversable: boolean;
  readonly fertility: number;
  readonly maxResources: Readonly<ResourceStock>;
}

/**
 * Canonical simulation rules for each terrain.
 *
 * Keep terrain properties here so world generation, default tiles, and
 * player terrain edits cannot silently drift apart.
 */
const TERRAIN_RULES: Readonly<Record<SimTerrainType, TerrainRules>> = {
  grass: {
    traversable: true,
    fertility: 0.7,
    maxResources: { food: 15, wood: 25, stone: 5 },
  },
  soil: {
    traversable: true,
    fertility: 0.9,
    maxResources: { food: 30, wood: 10, stone: 2 },
  },
  sand: {
    traversable: true,
    fertility: 0.2,
    maxResources: { food: 0, wood: 0, stone: 2 },
  },
  water: {
    traversable: false,
    fertility: 0,
    maxResources: { food: 0, wood: 0, stone: 0 },
  },
  rock: {
    traversable: false,
    fertility: 0.05,
    maxResources: { food: 0, wood: 0, stone: 60 },
  },
};

export function getTerrainRules(terrain: SimTerrainType): TerrainRules {
  return TERRAIN_RULES[terrain];
}

/** Creates a tile with consistent properties and a half-capacity starting stock. */
export function createTerrainTile(x: number, y: number, terrain: SimTerrainType): SimTile {
  const rules = getTerrainRules(terrain);
  const maxResources: ResourceStock = { ...rules.maxResources };

  return {
    x,
    y,
    terrain,
    traversable: rules.traversable,
    fertility: rules.fertility,
    waterAccess: false,
    maxResources,
    resources: {
      food: Math.floor(maxResources.food * 0.5),
      wood: Math.floor(maxResources.wood * 0.5),
      stone: Math.floor(maxResources.stone * 0.5),
    },
  };
}

/**
 * Changes a tile's terrain without creating resources.
 * Existing stock is retained only when supported by the new terrain and
 * is clamped to the new capacity. A capacity of zero removes that resource.
 */
export function applyTerrainToTile(tile: SimTile, terrain: SimTerrainType): void {
  const rules = getTerrainRules(terrain);
  const maxResources: ResourceStock = { ...rules.maxResources };
  const clampStock = (value: number, capacity: number): number =>
    Number.isFinite(value) ? Math.max(0, Math.min(capacity, value)) : 0;

  tile.terrain = terrain;
  tile.traversable = rules.traversable;
  tile.fertility = rules.fertility;
  tile.maxResources = maxResources;
  tile.resources = {
    food: clampStock(tile.resources.food, maxResources.food),
    wood: clampStock(tile.resources.wood, maxResources.wood),
    stone: clampStock(tile.resources.stone, maxResources.stone),
  };
}
