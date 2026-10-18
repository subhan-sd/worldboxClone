import test from 'node:test';
import assert from 'node:assert';
import { SimulationEngine } from '../engine/simulation-engine';
import { StateSerializer } from '../serialization/state-serializer';

test('Milestone F: Save/Load preserves complete state and resumes deterministically', () => {
  const engine1 = new SimulationEngine(1337);

  // Spawn initial pair
  const adam = engine1.spawnIndividual({
    name: 'Adam',
    gender: 'male',
    x: 24,
    y: 24,
    hunger: 10,
    energy: 100,
    age: 22,
  });

  const hawa = engine1.spawnIndividual({
    name: 'Hawa',
    gender: 'female',
    x: 24,
    y: 25,
    hunger: 10,
    energy: 100,
    age: 20,
  });

  // Run 25 ticks
  engine1.step(25);

  // Save state
  const savedJson = engine1.saveToJson();
  assert.ok(typeof savedJson === 'string' && savedJson.length > 500);

  // Advance engine1 by 40 more ticks
  engine1.step(40);
  const engine1FinalStats = engine1.getStats();

  // Load into engine2 and advance by 40 ticks
  const engine2 = new SimulationEngine(999); // different seed initially
  const loadSuccess = engine2.loadFromJson(savedJson);
  assert.strictEqual(loadSuccess, true);

  engine2.step(40);
  const engine2FinalStats = engine2.getStats();

  // Compare ticks and statistics
  assert.strictEqual(engine2.getTick(), engine1.getTick());
  assert.strictEqual(engine2FinalStats.tick, engine1FinalStats.tick);
  assert.strictEqual(engine2FinalStats.totalLiving, engine1FinalStats.totalLiving);
  assert.strictEqual(engine2FinalStats.totalDead, engine1FinalStats.totalDead);
  assert.strictEqual(engine2FinalStats.births, engine1FinalStats.births);
  assert.strictEqual(engine2FinalStats.deaths, engine1FinalStats.deaths);
  assert.strictEqual(engine2FinalStats.totalWorldFood, engine1FinalStats.totalWorldFood);
  assert.strictEqual(engine2FinalStats.totalWorldWood, engine1FinalStats.totalWorldWood);
  assert.strictEqual(engine2FinalStats.totalWorldStone, engine1FinalStats.totalWorldStone);

  // Compare every individual's state between engine1 and engine2
  assert.strictEqual(engine2.individuals.size, engine1.individuals.size);
  for (const [id, ind1] of engine1.individuals.entries()) {
    const ind2 = engine2.individuals.get(id);
    assert.ok(ind2 !== undefined, `Individual ${id} missing in loaded engine`);
    assert.strictEqual(ind2.x, ind1.x);
    assert.strictEqual(ind2.y, ind1.y);
    assert.strictEqual(ind2.hunger, ind1.hunger);
    assert.strictEqual(ind2.health, ind1.health);
    assert.strictEqual(ind2.energy, ind1.energy);
    assert.strictEqual(ind2.age, ind1.age);
    assert.strictEqual(ind2.isAlive, ind1.isAlive);
  }
});

test('Milestone F: StateSerializer rejects corrupt or unsupported JSON', () => {
  assert.throws(() => StateSerializer.deserialize('{"invalid": json'), /Invalid JSON format/);
  assert.throws(() => StateSerializer.deserialize('{"version": 999}'), /Unsupported save version/);
  assert.throws(
    () => StateSerializer.deserialize(JSON.stringify({ version: 1, seed: 10, rngState: 10, currentTick: -5 })),
    /Invalid currentTick/
  );
});

test('Milestone F: 1,000-tick long-run simulation maintains stability, no NaN, bounded events', () => {
  const engine = new SimulationEngine(88888);

  // Seed a starter colony
  for (let i = 0; i < 4; i++) {
    engine.spawnIndividual({
      name: `Founder_M${i}`,
      gender: 'male',
      x: 20 + i,
      y: 20,
      hunger: 10,
      energy: 100,
      age: 22,
    });
    engine.spawnIndividual({
      name: `Founder_F${i}`,
      gender: 'female',
      x: 20 + i,
      y: 21,
      hunger: 10,
      energy: 100,
      age: 20,
    });
  }

  // Step 1000 ticks
  engine.step(1000);

  assert.strictEqual(engine.getTick(), 1000);
  const stats = engine.getStats();

  // Verify non-NaN invariant
  assert.ok(!Number.isNaN(stats.avgHunger), 'avgHunger must not be NaN');
  assert.ok(!Number.isNaN(stats.avgHealth), 'avgHealth must not be NaN');
  assert.ok(!Number.isNaN(stats.avgEnergy), 'avgEnergy must not be NaN');
  assert.ok(!Number.isNaN(stats.totalWorldFood), 'totalWorldFood must not be NaN');
  assert.ok(!Number.isNaN(stats.totalWorldWood), 'totalWorldWood must not be NaN');
  assert.ok(!Number.isNaN(stats.totalWorldStone), 'totalWorldStone must not be NaN');

  // Verify bounded event buffer
  const events = engine.getEvents();
  assert.ok(
    events.length <= engine.getConfig().maxEventLogSize,
    `Events length (${events.length}) must be <= maxEventLogSize (200)`
  );

  // Verify individuals integrity
  for (const ind of engine.individuals.values()) {
    assert.ok(ind.hunger >= 0 && ind.hunger <= 100, `Hunger ${ind.hunger} out of bounds`);
    assert.ok(ind.health >= 0 && ind.health <= 100, `Health ${ind.health} out of bounds`);
    assert.ok(ind.energy >= 0 && ind.energy <= 100, `Energy ${ind.energy} out of bounds`);
    assert.ok(ind.x >= 0 && ind.x < 64, `Coord x ${ind.x} out of bounds`);
    assert.ok(ind.y >= 0 && ind.y < 64, `Coord y ${ind.y} out of bounds`);

    // Invariant: if dead, health is 0 and has cause of death
    if (!ind.isAlive) {
      assert.strictEqual(ind.health, 0);
      assert.ok(ind.causeOfDeath !== undefined);
    }
  }

  // Verify group integrity (no orphaned members)
  for (const group of engine.groups.values()) {
    for (const mId of group.memberIds) {
      const member = engine.individuals.get(mId);
      assert.ok(member !== undefined, `Member ${mId} does not exist in individuals`);
      assert.strictEqual(member.isAlive, true, `Dead member ${mId} must not be in active group`);
      assert.strictEqual(member.groupId, group.id);
    }
  }
});
