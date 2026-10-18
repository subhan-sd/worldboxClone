import test from 'node:test';
import assert from 'node:assert';
import { SimulationEngine } from '../engine/simulation-engine';
import { SocialGroupSystem } from '../systems/social-group.system';
import { SettlementSystem } from '../systems/settlement.system';
import { DEFAULT_SIMULATION_CONFIG } from '../config/simulation.config';

test('Milestone E: Social group 2-way membership invariant holds', () => {
  const engine = new SimulationEngine(101);

  const founder = engine.spawnIndividual({ name: 'Alpha', x: 10, y: 10 });
  const recruit = engine.spawnIndividual({ name: 'Beta', x: 11, y: 10 });

  const group = engine.createGroup('Tribe_One', founder);

  assert.strictEqual(founder.groupId, group.id);
  assert.ok(group.memberIds.includes(founder.id));

  // Add recruit
  const added = SocialGroupSystem.addMember(group, recruit);
  assert.strictEqual(added, true);
  assert.strictEqual(recruit.groupId, group.id);
  assert.ok(group.memberIds.includes(recruit.id));
  assert.strictEqual(group.memberIds.length, 2);

  // Remove recruit
  SocialGroupSystem.removeMember(group, recruit);
  assert.strictEqual(recruit.groupId, undefined);
  assert.strictEqual(group.memberIds.includes(recruit.id), false);
  assert.strictEqual(group.memberIds.length, 1);
});

test('Milestone E: Dead members are pruned from social groups and empty group disbands', () => {
  const engine = new SimulationEngine(202);

  const leader = engine.spawnIndividual({ name: 'Leader', x: 15, y: 15 });
  const companion = engine.spawnIndividual({ name: 'Companion', x: 15, y: 15 });

  const group = engine.createGroup('Test_Clan', leader);
  SocialGroupSystem.addMember(group, companion);
  assert.strictEqual(group.memberIds.length, 2);

  // Companion dies
  companion.isAlive = false;
  companion.causeOfDeath = 'starvation';

  engine.tick();

  assert.strictEqual(group.memberIds.length, 1);
  assert.strictEqual(group.memberIds.includes(companion.id), false);
  assert.notStrictEqual(group.status, 'disbanded', 'Group should not be disbanded while 1 member is still alive');

  // Leader also dies
  leader.isAlive = false;
  leader.causeOfDeath = 'old_age';

  engine.tick();

  assert.strictEqual(group.memberIds.length, 0);
  assert.strictEqual(group.status, 'disbanded');

  const disbandedEvents = engine.getEvents().filter((e) => e.type === 'group_disbanded');
  assert.ok(disbandedEvents.length > 0, 'Group disbanded event must be logged');
});

test('Milestone E: Site scoring is deterministic and distinguishes fertile water sites from barren sites', () => {
  const engine = new SimulationEngine(303);
  const grid = engine.getGrid();

  // Test determinism
  const scoreA1 = SettlementSystem.calculateSiteScore(grid, 25, 25, 3);
  const scoreA2 = SettlementSystem.calculateSiteScore(grid, 25, 25, 3);
  assert.strictEqual(scoreA1, scoreA2, 'Score at same coordinate must be identical');

  // Non-traversable site (e.g. water or rock) returns -Infinity
  const waterTile = grid.getAllTiles().find((t) => t.terrain === 'water');
  if (waterTile) {
    const waterScore = SettlementSystem.calculateSiteScore(grid, waterTile.x, waterTile.y, 3);
    assert.strictEqual(waterScore, -Infinity);
  }

  // Fertile site with water access vs isolated dry site
  const fertileTile = grid.getAllTiles().find((t) => t.terrain === 'soil' && t.waterAccess);
  const sandTile = grid.getAllTiles().find((t) => t.terrain === 'sand' && !t.waterAccess);

  if (fertileTile && sandTile) {
    const fertileScore = SettlementSystem.calculateSiteScore(grid, fertileTile.x, fertileTile.y, 3);
    const sandScore = SettlementSystem.calculateSiteScore(grid, sandTile.x, sandTile.y, 3);
    assert.ok(
      fertileScore > sandScore,
      `Fertile water site (${fertileScore}) must score higher than dry sand site (${sandScore})`
    );
  }
});

test('Milestone E: Building construction deducts actual resources and increases housing capacity', () => {
  const engine = new SimulationEngine(404);

  const founder = engine.spawnIndividual({ name: 'Mason', x: 20, y: 20 });
  const partner = engine.spawnIndividual({ name: 'Builder', x: 20, y: 20 });

  const group = engine.createGroup('Settlers', founder);
  SocialGroupSystem.addMember(group, partner);

  const settlement = SettlementSystem.foundSettlement(
    'setl_404_1',
    'Haven',
    group,
    { x: 20, y: 20 },
    0,
    4,
    50
  );

  assert.strictEqual(settlement.housingCapacity, 4);
  assert.strictEqual(group.status, 'settled');

  // Attempt building with 0 resources -> must fail
  const failedBuilding = SettlementSystem.constructBuilding(
    settlement,
    group,
    'house',
    'bld_1',
    1,
    DEFAULT_SIMULATION_CONFIG
  );
  assert.strictEqual(failedBuilding, null, 'Cannot build house without resources');
  assert.strictEqual(settlement.housingCapacity, 4);

  // Give group partial resources (only 5 wood, 2 stone: requires 10 wood, 5 stone)
  SocialGroupSystem.depositResource(group, 'wood', 5);
  SocialGroupSystem.depositResource(group, 'stone', 2);
  const partialBuild = SettlementSystem.constructBuilding(
    settlement,
    group,
    'house',
    'bld_2',
    1,
    DEFAULT_SIMULATION_CONFIG
  );
  assert.strictEqual(partialBuild, null);

  // Give full resources (15 wood, 8 stone total)
  SocialGroupSystem.depositResource(group, 'wood', 10);
  SocialGroupSystem.depositResource(group, 'stone', 6);
  assert.strictEqual(group.sharedInventory.wood, 15);
  assert.strictEqual(group.sharedInventory.stone, 8);

  const successBuilding = SettlementSystem.constructBuilding(
    settlement,
    group,
    'house',
    'bld_3',
    1,
    DEFAULT_SIMULATION_CONFIG
  );
  assert.ok(successBuilding !== null, 'House should be built successfully');

  // Verify resources were strictly deducted: 15 - 10 = 5 wood, 8 - 5 = 3 stone
  assert.strictEqual(group.sharedInventory.wood, 5);
  assert.strictEqual(group.sharedInventory.stone, 3);

  // Verify capacity increased by +4 (from 4 to 8)
  assert.strictEqual(settlement.housingCapacity, 8);
  assert.strictEqual(settlement.buildings.length, 1);
});

test('Milestone E: Automatic settlement founding occurs when nomad group occupies viable site', () => {
  const engine = new SimulationEngine(505);
  const grid = engine.getGrid();

  // Find a fertile site with score >= settlementMinScore (12)
  let bestX = 20, bestY = 20;
  for (let y = 10; y < 50; y += 5) {
    for (let x = 10; x < 50; x += 5) {
      if (SettlementSystem.calculateSiteScore(grid, x, y, 3) >= DEFAULT_SIMULATION_CONFIG.settlementMinScore) {
        bestX = x;
        bestY = y;
        break;
      }
    }
  }

  // Ensure tile is fertile and has food/water access
  const tile = grid.get(bestX, bestY)!;
  tile.terrain = 'soil';
  tile.traversable = true;
  tile.waterAccess = true;
  tile.fertility = 0.9;
  tile.resources.food = 20;
  tile.resources.wood = 20;
  tile.resources.stone = 20;

  const m1 = engine.spawnIndividual({ x: bestX, y: bestY });
  const m2 = engine.spawnIndividual({ x: bestX, y: bestY });

  const group = engine.createGroup('Nomads', m1);
  SocialGroupSystem.addMember(group, m2);
  group.homeTile = { x: bestX, y: bestY };

  assert.strictEqual(group.settlementId, undefined);

  // Run 1 tick -> Phase 10 evaluates site and founds settlement
  engine.tick();

  assert.ok(group.settlementId !== undefined, 'Group should have founded a settlement');
  assert.strictEqual(group.status, 'settled');
  assert.ok(engine.settlements.has(group.settlementId));

  const foundedEvents = engine.getEvents().filter((e) => e.type === 'settlement_founded');
  assert.ok(foundedEvents.length > 0, 'Settlement founded event must be logged');
});
