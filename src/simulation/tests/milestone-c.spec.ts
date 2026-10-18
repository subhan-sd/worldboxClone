import test from 'node:test';
import assert from 'node:assert';
import { SimulationEngine } from '../engine/simulation-engine';
import { NavigationSystem } from '../systems/navigation.system';

test('Milestone C: NavigationSystem respects non-traversable boundaries', () => {
  const engine = new SimulationEngine(42);
  const grid = engine.getGrid();

  // Create an obstacle wall of water between (10, 10) and (10, 14)
  for (let y = 10; y <= 14; y++) {
    const t = grid.get(12, y)!;
    t.terrain = 'water';
    t.traversable = false;
  }

  // Find step from (10, 12) to (14, 12)
  const nextStep = NavigationSystem.getNextStepTowards(grid, 10, 12, 14, 12, 30);
  assert.ok(nextStep !== null, 'Should find path around water obstacle');
  const stepTile = grid.get(nextStep.x, nextStep.y)!;
  assert.ok(stepTile.traversable, 'Step must be on a traversable tile');
  assert.notStrictEqual(stepTile.terrain, 'water');
});

test('Milestone C: Hungry individual seeks and consumes food', () => {
  const engine = new SimulationEngine(101, { foodRegenRate: 0 });
  const grid = engine.getGrid();

  // Clear food around start area to have full control
  for (let dy = -5; dy <= 5; dy++) {
    for (let dx = -5; dx <= 5; dx++) {
      const t = grid.get(20 + dx, 20 + dy);
      if (t) {
        t.resources.food = 0;
        t.maxResources.food = 0;
      }
    }
  }

  // Place food at (22, 20)
  const foodTile = grid.get(22, 20)!;
  foodTile.terrain = 'soil';
  foodTile.traversable = true;
  foodTile.resources.food = 5;
  foodTile.maxResources.food = 5;

  // Spawn hungry individual at (20, 20)
  const ind = engine.spawnIndividual({
    x: 20,
    y: 20,
    hunger: 60, // >= hungerSearchThreshold (45)
    health: 100,
    energy: 100,
  });

  assert.strictEqual(ind.hunger, 60);

  // Step simulation: individual should find food, move to (21, 20) then (22, 20) and eat
  let ate = false;
  for (let tick = 0; tick < 10; tick++) {
    engine.tick();
    if (ind.hunger < 60) {
      ate = true;
      break;
    }
  }

  assert.ok(ate, 'Individual should navigate to food tile and consume it');
  assert.ok(ind.hunger < 60, 'Hunger must decrease after eating');
  assert.ok(foodTile.resources.food < 5, 'Food on tile must be reduced');

  // Verify event was logged
  const consumeEvents = engine.getEvents().filter((e) => e.type === 'resource_consumed');
  assert.ok(consumeEvents.length > 0, 'Resource consumed event must be logged');
  assert.strictEqual(consumeEvents[0].entityId, ind.id);
});

test('Milestone C: Individual does not eat if food stock is 0', () => {
  const engine = new SimulationEngine(202);
  const grid = engine.getGrid();

  // Clear all food across the whole grid
  const allTiles = grid.getAllTiles();
  for (let i = 0; i < allTiles.length; i++) {
    allTiles[i].resources.food = 0;
    allTiles[i].maxResources.food = 0; // prevent regen for this test
  }

  const ind = engine.spawnIndividual({
    x: 30,
    y: 30,
    hunger: 50,
  });

  // Run 5 ticks
  for (let i = 0; i < 5; i++) {
    engine.tick();
  }

  // Hunger should only increase, never decrease
  assert.ok(ind.hunger >= 55, `Hunger should have increased from 50, got ${ind.hunger}`);
  const consumeEvents = engine.getEvents().filter((e) => e.type === 'resource_consumed');
  assert.strictEqual(consumeEvents.length, 0, 'No food should be consumed');
});

test('Milestone C: Starvation damages health and leads to death when unfed', () => {
  const engine = new SimulationEngine(303);
  const grid = engine.getGrid();

  // Strip food
  const allTiles = grid.getAllTiles();
  for (let i = 0; i < allTiles.length; i++) {
    allTiles[i].resources.food = 0;
    allTiles[i].maxResources.food = 0;
  }

  const ind = engine.spawnIndividual({
    x: 25,
    y: 25,
    hunger: 99,
    health: 8, // small health to observe starvation death quickly
  });

  // Tick 1: hunger reaches 100, starvation damage (4) reduces health from 8 to 4
  engine.tick();
  assert.strictEqual(ind.hunger, 100);
  assert.strictEqual(ind.health, 4);
  assert.strictEqual(ind.isAlive, true);

  // Tick 2: starvation damage (4) reduces health from 4 to 0 -> entity dies
  engine.tick();
  assert.strictEqual(ind.health, 0);
  assert.strictEqual(ind.isAlive, false);
  assert.strictEqual(ind.causeOfDeath, 'starvation');

  // Verify death event
  const deathEvents = engine.getEvents().filter((e) => e.type === 'death');
  assert.ok(deathEvents.length >= 1, 'Death event must be logged');
  assert.strictEqual(deathEvents[0].entityId, ind.id);
});

test('Milestone C: Dead individual performs no actions and position stays frozen', () => {
  const engine = new SimulationEngine(404);
  const ind = engine.spawnIndividual({
    x: 15,
    y: 15,
    isAlive: false,
    health: 0,
    causeOfDeath: 'old_age',
  });

  const posX = ind.x;
  const posY = ind.y;

  engine.step(20);

  assert.strictEqual(ind.isAlive, false);
  assert.strictEqual(ind.x, posX, 'Position X must not change after death');
  assert.strictEqual(ind.y, posY, 'Position Y must not change after death');
  assert.strictEqual(ind.currentAction, 'idle');
  assert.strictEqual(ind.currentGoal, 'idle');
});

test('Milestone C: Aging transitions life stages correctly', () => {
  const engine = new SimulationEngine(505);

  const child = engine.spawnIndividual({
    age: 19,
    lifeStage: 'child',
  });

  // 2 ticks: reaches tick 1 where age is 20 (still child by default childAgeMax=20)
  engine.step(2);
  assert.strictEqual(child.age, 20);
  assert.strictEqual(child.lifeStage, 'child');

  // 1 more tick: reaches tick 2 where age is 21 -> transitions to adult
  engine.tick();
  assert.strictEqual(child.age, 21);
  assert.strictEqual(child.lifeStage, 'adult');
});
