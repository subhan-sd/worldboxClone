import test from 'node:test';
import assert from 'node:assert';
import { DEFAULT_SIMULATION_CONFIG } from '../config/simulation.config';
import { TileGrid } from '../models/tile-grid';
import type { SimTerrainType } from '../models/simulation-types';
import { applyTerrainToTile, createTerrainTile, getTerrainRules } from '../models/terrain-rules';
import { ResourceSystem } from '../systems/resource.system';
import { SimulationEngine } from '../engine/simulation-engine';

const terrainTypes: SimTerrainType[] = ['grass', 'soil', 'sand', 'water', 'rock'];

test('Terrain rules: default tiles and generated world use canonical terrain properties', () => {
  const defaultGrid = new TileGrid(2, 2, 'grass');
  for (const terrain of terrainTypes) {
    const tile = createTerrainTile(0, 0, terrain);
    const rules = getTerrainRules(terrain);
    assert.strictEqual(tile.traversable, rules.traversable);
    assert.strictEqual(tile.fertility, rules.fertility);
    assert.deepStrictEqual(tile.maxResources, rules.maxResources);
    assert.ok(tile.resources.food >= 0 && tile.resources.food <= tile.maxResources.food);
    assert.ok(tile.resources.wood >= 0 && tile.resources.wood <= tile.maxResources.wood);
    assert.ok(tile.resources.stone >= 0 && tile.resources.stone <= tile.maxResources.stone);
  }

  const defaultTile = defaultGrid.get(0, 0)!;
  const grassTile = createTerrainTile(0, 0, 'grass');
  assert.deepStrictEqual(defaultTile.maxResources, grassTile.maxResources);
  assert.deepStrictEqual(defaultTile.resources, grassTile.resources);

  const generatedGrid = new SimulationEngine(1234).getGrid();
  for (const tile of generatedGrid.getAllTiles()) {
    const rules = getTerrainRules(tile.terrain);
    assert.strictEqual(tile.traversable, rules.traversable, `traversability mismatch at (${tile.x}, ${tile.y})`);
    assert.strictEqual(tile.fertility, rules.fertility, `fertility mismatch at (${tile.x}, ${tile.y})`);
    assert.deepStrictEqual(tile.maxResources, rules.maxResources, `capacity mismatch at (${tile.x}, ${tile.y})`);
    assert.ok(tile.resources.food >= 0 && tile.resources.food <= tile.maxResources.food);
    assert.ok(tile.resources.wood >= 0 && tile.resources.wood <= tile.maxResources.wood);
    assert.ok(tile.resources.stone >= 0 && tile.resources.stone <= tile.maxResources.stone);
  }
});

test('Terrain changes: grass to water clears incompatible stock and updates rules', () => {
  const tile = createTerrainTile(0, 0, 'grass');
  tile.resources = { food: 12, wood: 18, stone: 4 };

  applyTerrainToTile(tile, 'water');

  assert.strictEqual(tile.terrain, 'water');
  assert.strictEqual(tile.traversable, false);
  assert.strictEqual(tile.fertility, 0);
  assert.deepStrictEqual(tile.maxResources, { food: 0, wood: 0, stone: 0 });
  assert.deepStrictEqual(tile.resources, { food: 0, wood: 0, stone: 0 });
});

test('Terrain changes: soil capacity clamps existing stock without creating resources', () => {
  const tile = createTerrainTile(0, 0, 'water');
  tile.resources = { food: 40, wood: 12, stone: 4 };

  applyTerrainToTile(tile, 'soil');

  assert.strictEqual(tile.terrain, 'soil');
  assert.strictEqual(tile.traversable, true);
  assert.strictEqual(tile.fertility, 0.9);
  assert.deepStrictEqual(tile.maxResources, { food: 30, wood: 10, stone: 2 });
  assert.deepStrictEqual(tile.resources, { food: 30, wood: 10, stone: 2 });
});

test('Resource regeneration: water cannot regenerate food even with stale legacy capacity', () => {
  const grid = new TileGrid(1, 1, 'water');
  const tile = grid.get(0, 0)!;

  // Defensive regression: older/inconsistent saves may contain stale capacities.
  tile.maxResources.food = 10;
  tile.resources.food = 0;
  tile.fertility = 1;

  for (let i = 0; i < 10; i++) {
    ResourceSystem.regenerate(grid, DEFAULT_SIMULATION_CONFIG);
  }

  assert.strictEqual(tile.resources.food, 0);
});
