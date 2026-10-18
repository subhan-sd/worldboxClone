import test from 'node:test';
import assert from 'node:assert';
import { SimulationEngine } from '../engine/simulation-engine';
import { GeneticsSystem } from '../systems/genetics.system';
import { FamilySystem } from '../systems/family.system';
import { SeededRNG } from '../random/seeded-rng';
import { DEFAULT_SIMULATION_CONFIG } from '../config/simulation.config';

test('Milestone D: GeneticsSystem crossover and mutation strictly bounded in [0.0, 1.0]', () => {
  const rng = new SeededRNG(999);
  const parentA = { strength: 0.95, sociability: 0.85, exploration: 0.9, fertility: 0.99 };
  const parentB = { strength: 0.05, sociability: 0.15, exploration: 0.1, fertility: 0.01 };

  for (let i = 0; i < 200; i++) {
    const childGenome = GeneticsSystem.combineGenomes(parentA, parentB, rng, DEFAULT_SIMULATION_CONFIG);

    for (const key of ['strength', 'sociability', 'exploration', 'fertility'] as const) {
      const val = childGenome[key];
      assert.ok(
        val >= 0.0 && val <= 1.0,
        `Gene ${key} value ${val} out of bounds [0.0, 1.0]`
      );
      assert.ok(!Number.isNaN(val), `Gene ${key} is NaN`);
    }
  }
});

test('Milestone D: Reproduction produces child with exactly two valid parent IDs', () => {
  const engine = new SimulationEngine(777);

  const adam = engine.spawnIndividual({
    name: 'Adam',
    gender: 'male',
    x: 20,
    y: 20,
    hunger: 10,
    energy: 100,
    age: 25,
    lifeStage: 'adult',
    reproductionCooldown: 0,
    genome: { strength: 0.8, sociability: 0.7, exploration: 0.6, fertility: 0.9 },
  });

  const hawa = engine.spawnIndividual({
    name: 'Hawa',
    gender: 'female',
    x: 20,
    y: 20,
    hunger: 10,
    energy: 100,
    age: 23,
    lifeStage: 'adult',
    reproductionCooldown: 0,
    genome: { strength: 0.4, sociability: 0.5, exploration: 0.4, fertility: 0.7 },
  });

  // Step 1 tick -> Phase 9 triggers reproduction
  engine.tick();

  const birthEvents = engine.getEvents().filter((e) => e.type === 'birth');
  assert.strictEqual(birthEvents.length, 1, 'Exactly one birth event should occur');

  const childId = birthEvents[0].entityId!;
  const child = engine.individuals.get(childId);
  assert.ok(child !== undefined, 'Child must exist in individuals map');

  // Verify two valid parent IDs
  assert.strictEqual(child.parentIds.length, 2);
  assert.ok(child.parentIds.includes(adam.id), 'Child must have Adam as parent');
  assert.ok(child.parentIds.includes(hawa.id), 'Child must have Hawa as parent');

  // Verify initial child state
  assert.strictEqual(child.age, 0);
  assert.strictEqual(child.lifeStage, 'child');
  assert.strictEqual(child.health, 100);
  assert.strictEqual(child.isAlive, true);

  // Verify stats
  assert.strictEqual(engine.getStats().births, 1);
});

test('Milestone D: Reproduction cooldown prevents immediate consecutive births', () => {
  const engine = new SimulationEngine(888);

  const male = engine.spawnIndividual({
    gender: 'male',
    x: 22,
    y: 22,
    hunger: 10,
    energy: 100,
    age: 30,
    reproductionCooldown: 0,
  });

  const female = engine.spawnIndividual({
    gender: 'female',
    x: 22,
    y: 22,
    hunger: 10,
    energy: 100,
    age: 28,
    reproductionCooldown: 0,
  });

  // Tick 1: Reproduction happens
  engine.tick();
  assert.strictEqual(engine.getStats().births, 1);
  assert.ok(male.reproductionCooldown > 0, 'Male should have reproduction cooldown');
  assert.ok(female.reproductionCooldown > 0, 'Female should have reproduction cooldown');

  // Tick 2: Must NOT reproduce again while in cooldown
  engine.tick();
  assert.strictEqual(engine.getStats().births, 1, 'No second birth while on cooldown');

  // Tick 3: Still in cooldown
  engine.tick();
  assert.strictEqual(engine.getStats().births, 1);
});

test('Milestone D: Children under adult age cannot reproduce', () => {
  const engine = new SimulationEngine(333);

  const childMale = engine.spawnIndividual({
    gender: 'male',
    x: 15,
    y: 15,
    age: 10,
    lifeStage: 'child',
    hunger: 10,
    energy: 100,
    reproductionCooldown: 0,
  });

  const adultFemale = engine.spawnIndividual({
    gender: 'female',
    x: 15,
    y: 15,
    age: 25,
    lifeStage: 'adult',
    hunger: 10,
    energy: 100,
    reproductionCooldown: 0,
  });

  assert.strictEqual(
    FamilySystem.canReproduce(childMale, adultFemale, DEFAULT_SIMULATION_CONFIG),
    false,
    'Child cannot reproduce'
  );

  engine.tick();
  assert.strictEqual(engine.getStats().births, 0);
});

test('Milestone D: Starving or exhausted adults cannot reproduce', () => {
  const engine = new SimulationEngine(444);

  const starvingMale = engine.spawnIndividual({
    gender: 'male',
    x: 18,
    y: 18,
    age: 25,
    hunger: 70, // > reproductionHungerMax (40)
    energy: 100,
    reproductionCooldown: 0,
  });

  const female = engine.spawnIndividual({
    gender: 'female',
    x: 18,
    y: 18,
    age: 25,
    hunger: 10,
    energy: 100,
    reproductionCooldown: 0,
  });

  assert.strictEqual(
    FamilySystem.canReproduce(starvingMale, female, DEFAULT_SIMULATION_CONFIG),
    false,
    'Starving male cannot reproduce'
  );

  starvingMale.hunger = 10;
  starvingMale.energy = 20; // < reproductionEnergyMin (50)

  assert.strictEqual(
    FamilySystem.canReproduce(starvingMale, female, DEFAULT_SIMULATION_CONFIG),
    false,
    'Exhausted male cannot reproduce'
  );
});
