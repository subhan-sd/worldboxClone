import test from 'node:test';
import assert from 'node:assert';
import { SimulationEngine } from '../engine/simulation-engine';
import { ResourceSystem } from '../systems/resource.system';

test('Milestone B: World grid generated deterministically from seed', () => {
  const engine1 = new SimulationEngine(12345);
  const engine2 = new SimulationEngine(12345);
  const engineDiff = new SimulationEngine(99999);

  const grid1 = engine1.getGrid();
  const grid2 = engine2.getGrid();
  const gridDiff = engineDiff.getGrid();

  assert.strictEqual(grid1.totalTiles, 64 * 64);
  assert.strictEqual(grid2.totalTiles, 64 * 64);

  // Every single tile terrain and resource must match exactly for same seed
  for (let i = 0; i < grid1.totalTiles; i++) {
    const t1 = grid1.getByIndex(i)!;
    const t2 = grid2.getByIndex(i)!;
    assert.strictEqual(t1.terrain, t2.terrain, `Terrain mismatch at index ${i}`);
    assert.strictEqual(t1.traversable, t2.traversable);
    assert.strictEqual(t1.waterAccess, t2.waterAccess);
    assert.strictEqual(t1.resources.food, t2.resources.food);
    assert.strictEqual(t1.resources.wood, t2.resources.wood);
    assert.strictEqual(t1.resources.stone, t2.resources.stone);
  }

  // Different seed should have variations
  let diffCount = 0;
  for (let i = 0; i < grid1.totalTiles; i++) {
    if (grid1.getByIndex(i)!.terrain !== gridDiff.getByIndex(i)!.terrain) {
      diffCount++;
    }
  }
  assert.ok(diffCount > 0, 'Different seeds should produce different worlds');
});

test('Milestone B: Resource harvesting never drops below 0', () => {
  const engine = new SimulationEngine(42);
  const grid = engine.getGrid();
  const tile = grid.get(10, 10)!;

  tile.resources.food = 10;
  const harvested1 = ResourceSystem.harvest(tile, 'food', 6);
  assert.strictEqual(harvested1, 6);
  assert.strictEqual(tile.resources.food, 4);

  const harvested2 = ResourceSystem.harvest(tile, 'food', 10);
  assert.strictEqual(harvested2, 4, 'Should only harvest remaining amount');
  assert.strictEqual(tile.resources.food, 0);

  const harvested3 = ResourceSystem.harvest(tile, 'food', 5);
  assert.strictEqual(harvested3, 0, 'Cannot harvest from empty tile');
  assert.strictEqual(tile.resources.food, 0);
  assert.ok(tile.resources.food >= 0);
});

test('Milestone B: Resource regeneration respects maximum capacity', () => {
  const engine = new SimulationEngine(42);
  const grid = engine.getGrid();
  const tile = grid.get(15, 15)!;

  tile.terrain = 'soil';
  tile.fertility = 0.9;
  tile.waterAccess = true;
  tile.maxResources.food = 20;
  tile.resources.food = 18;

  // Run 10 ticks of regeneration
  for (let i = 0; i < 10; i++) {
    ResourceSystem.regenerate(grid, engine.getConfig());
  }

  assert.strictEqual(
    tile.resources.food,
    20,
    'Food should cap exactly at maxResources without overflowing'
  );
  assert.ok(tile.resources.food <= tile.maxResources.food);
});

test('Milestone B: Non-traversable tiles are correctly identified', () => {
  const engine = new SimulationEngine(42);
  const grid = engine.getGrid();

  const allTiles = grid.getAllTiles();
  const waterTiles = allTiles.filter((t) => t.terrain === 'water');
  const rockTiles = allTiles.filter((t) => t.terrain === 'rock');
  const landTiles = allTiles.filter((t) => t.terrain === 'grass' || t.terrain === 'soil');

  assert.ok(waterTiles.length > 0, 'Should have water tiles');
  assert.ok(waterTiles.every((t) => !t.traversable), 'All water tiles must be non-traversable');
  assert.ok(rockTiles.every((t) => !t.traversable), 'All rock tiles must be non-traversable');
  assert.ok(landTiles.every((t) => t.traversable), 'Grass/soil tiles must be traversable');
});

test('Milestone B: Multiple simulation ticks advance tick counter and maintain stability', () => {
  const engine = new SimulationEngine(777);
  assert.strictEqual(engine.getTick(), 0);

  engine.step(100);
  assert.strictEqual(engine.getTick(), 100);

  const stats = engine.getStats();
  assert.strictEqual(stats.tick, 100);
  assert.ok(!Number.isNaN(stats.totalWorldFood), 'World food should not be NaN');
  assert.ok(!Number.isNaN(stats.totalWorldWood), 'World wood should not be NaN');
  assert.ok(!Number.isNaN(stats.totalWorldStone), 'World stone should not be NaN');
  assert.ok(stats.totalWorldFood > 0, 'Food should exist in the world');
});
