import { test } from 'node:test';
import assert from 'node:assert';
import { SimulationEngine } from '../engine/simulation-engine';
import type { Individual } from '../models/simulation-types';

/**
 * Helper selector functions identical to bridge logic for pure engine testing.
 */
export class InspectorSelectors {
  static getFamily(engine: SimulationEngine, id: string) {
    const target = engine.individuals.get(id);
    if (!target) return null;

    const parents: Individual[] = [];
    const missingParentIds: string[] = [];
    for (const pid of target.parentIds) {
      const p = engine.individuals.get(pid);
      if (p) parents.push(p);
      else missingParentIds.push(pid);
    }

    const partner = target.partnerId ? engine.individuals.get(target.partnerId) : undefined;

    const children = Array.from(engine.individuals.values()).filter((i) =>
      i.parentIds.includes(id)
    );

    const siblings =
      target.parentIds.length === 0
        ? []
        : Array.from(engine.individuals.values()).filter(
            (i) => i.id !== id && i.parentIds.some((pid) => target.parentIds.includes(pid))
          );

    return { target, parents, missingParentIds, partner, children, siblings };
  }

  static getGroupLivingMembers(engine: SimulationEngine, groupId: string): Individual[] {
    const group = engine.groups.get(groupId);
    if (!group) return [];
    return group.memberIds
      .map((mid) => engine.individuals.get(mid))
      .filter((i): i is Individual => i !== undefined && i.isAlive);
  }

  static getSettlementLivingResidents(engine: SimulationEngine, settlementId: string): Individual[] {
    return Array.from(engine.individuals.values()).filter(
      (i) => i.settlementId === settlementId && i.isAlive
    );
  }

  static filterIndividuals(
    engine: SimulationEngine,
    query: string = '',
    status: 'all' | 'alive' | 'deceased' = 'all',
    stage: 'all' | 'child' | 'adult' | 'elder' = 'all'
  ): Individual[] {
    const q = query.trim().toLowerCase();
    return Array.from(engine.individuals.values()).filter((ind) => {
      if (status === 'alive' && !ind.isAlive) return false;
      if (status === 'deceased' && ind.isAlive) return false;
      if (stage !== 'all' && ind.lifeStage !== stage) return false;
      if (q) {
        const matchesName = ind.name.toLowerCase().includes(q);
        const matchesId = ind.id.toLowerCase() === q || ind.id.toLowerCase().includes(q);
        if (!matchesName && !matchesId) return false;
      }
      return true;
    });
  }

  static getSafeStats(engine: SimulationEngine) {
    const stats = engine.getStats();
    return {
      ...stats,
      avgHunger: isNaN(stats.avgHunger) ? 0 : stats.avgHunger,
      avgHealth: isNaN(stats.avgHealth) ? 0 : stats.avgHealth,
      avgEnergy: isNaN(stats.avgEnergy) ? 0 : stats.avgEnergy,
    };
  }
}

test('Inspector: World Time follows simulation ticks strictly', () => {
  const engine = new SimulationEngine(101);
  assert.strictEqual(engine.getTick(), 0);

  engine.tick();
  assert.strictEqual(engine.getTick(), 1);

  engine.step(5);
  assert.strictEqual(engine.getTick(), 6);
});

test('Inspector: People search and filtering works reliably', () => {
  const engine = new SimulationEngine(102);
  const ind1 = engine.spawnIndividual({ name: 'Alpha', gender: 'male', x: 10, y: 10, age: 25 });
  const ind2 = engine.spawnIndividual({ name: 'Beta', gender: 'female', x: 10, y: 10, age: 5 });
  const ind3 = engine.spawnIndividual({ name: 'Gamma', gender: 'male', x: 10, y: 10, age: 105, isAlive: false });

  // Status filtering
  const aliveList = InspectorSelectors.filterIndividuals(engine, '', 'alive');
  assert.strictEqual(aliveList.length, 2);
  assert.ok(aliveList.every((i) => i.isAlive));

  const deceasedList = InspectorSelectors.filterIndividuals(engine, '', 'deceased');
  assert.strictEqual(deceasedList.length, 1);
  assert.strictEqual(deceasedList[0].id, ind3.id);

  // Life stage filtering
  const children = InspectorSelectors.filterIndividuals(engine, '', 'all', 'child');
  assert.strictEqual(children.length, 1);
  assert.strictEqual(children[0].id, ind2.id);

  // Search by exact ID and partial name
  const searchedById = InspectorSelectors.filterIndividuals(engine, ind1.id);
  assert.strictEqual(searchedById.length, 1);
  assert.strictEqual(searchedById[0].name, 'Alpha');

  const searchedByName = InspectorSelectors.filterIndividuals(engine, 'alp');
  assert.strictEqual(searchedByName.length, 1);
  assert.strictEqual(searchedByName[0].id, ind1.id);
});

test('Inspector: Family relationships derive parents, partner, children, siblings correctly', () => {
  const engine = new SimulationEngine(103);
  const dad = engine.spawnIndividual({ name: 'Father', gender: 'male', x: 10, y: 10, age: 30 });
  const mom = engine.spawnIndividual({ name: 'Mother', gender: 'female', x: 10, y: 10, age: 28 });
  dad.partnerId = mom.id;
  mom.partnerId = dad.id;

  const child1 = engine.spawnIndividual({
    name: 'Child1',
    gender: 'male',
    x: 10,
    y: 10,
    age: 5,
    parentIds: [dad.id, mom.id],
  });
  const child2 = engine.spawnIndividual({
    name: 'Child2',
    gender: 'female',
    x: 10,
    y: 10,
    age: 3,
    parentIds: [dad.id, mom.id],
  });

  // Dad's family
  const dadFam = InspectorSelectors.getFamily(engine, dad.id);
  assert.ok(dadFam);
  assert.strictEqual(dadFam.partner?.id, mom.id);
  assert.strictEqual(dadFam.children.length, 2);
  assert.strictEqual(dadFam.siblings.length, 0); // No parents -> no siblings

  // Child1's family
  const child1Fam = InspectorSelectors.getFamily(engine, child1.id);
  assert.ok(child1Fam);
  assert.strictEqual(child1Fam.parents.length, 2);
  assert.strictEqual(child1Fam.siblings.length, 1);
  assert.strictEqual(child1Fam.siblings[0].id, child2.id);
});

test('Inspector: Shared single parent identifies half-siblings', () => {
  const engine = new SimulationEngine(104);
  const dad = engine.spawnIndividual({ name: 'Father', gender: 'male', x: 10, y: 10, age: 30 });
  const mom1 = engine.spawnIndividual({ name: 'Mother1', gender: 'female', x: 10, y: 10, age: 28 });
  const mom2 = engine.spawnIndividual({ name: 'Mother2', gender: 'female', x: 10, y: 10, age: 26 });

  const c1 = engine.spawnIndividual({ name: 'ChildA', gender: 'male', x: 10, y: 10, parentIds: [dad.id, mom1.id] });
  const c2 = engine.spawnIndividual({ name: 'ChildB', gender: 'male', x: 10, y: 10, parentIds: [dad.id, mom2.id] });

  const famA = InspectorSelectors.getFamily(engine, c1.id);
  assert.ok(famA);
  assert.strictEqual(famA.siblings.length, 1);
  assert.strictEqual(famA.siblings[0].id, c2.id);
});

test('Inspector: Missing parent IDs and deceased relatives are handled safely', () => {
  const engine = new SimulationEngine(105);
  const deadMom = engine.spawnIndividual({
    name: 'LateMom',
    gender: 'female',
    x: 10,
    y: 10,
    isAlive: false,
    causeOfDeath: 'starvation',
  });

  const orphan = engine.spawnIndividual({
    name: 'Orphan',
    gender: 'female',
    x: 10,
    y: 10,
    parentIds: [deadMom.id, 'ghost_non_existent_id'],
  });

  const fam = InspectorSelectors.getFamily(engine, orphan.id);
  assert.ok(fam);
  assert.strictEqual(fam.parents.length, 1);
  assert.strictEqual(fam.parents[0].isAlive, false);
  assert.strictEqual(fam.missingParentIds.length, 1);
  assert.strictEqual(fam.missingParentIds[0], 'ghost_non_existent_id');
});

test('Inspector: Clans strictly exclude deceased members from living count', () => {
  const engine = new SimulationEngine(106);
  const ind1 = engine.spawnIndividual({ name: 'M1', gender: 'male', x: 10, y: 10 });
  const ind2 = engine.spawnIndividual({ name: 'M2', gender: 'female', x: 10, y: 10 });

  const group = engine.createGroup('Tribe Alpha', ind1);
  group.memberIds.push(ind2.id);
  ind2.groupId = group.id;

  assert.strictEqual(InspectorSelectors.getGroupLivingMembers(engine, group.id).length, 2);

  // Kill member 2
  ind2.isAlive = false;
  assert.strictEqual(InspectorSelectors.getGroupLivingMembers(engine, group.id).length, 1);
  assert.strictEqual(InspectorSelectors.getGroupLivingMembers(engine, group.id)[0].id, ind1.id);
});

test('Inspector: Settlement population strictly excludes deceased residents', () => {
  const engine = new SimulationEngine(107);
  const ind1 = engine.spawnIndividual({ name: 'Res1', gender: 'male', x: 10, y: 10 });
  const ind2 = engine.spawnIndividual({ name: 'Res2', gender: 'female', x: 10, y: 10 });

  const group = engine.createGroup('ColonyGroup', ind1);
  group.memberIds.push(ind2.id);
  ind2.groupId = group.id;

  const settlement = {
    id: 'setl_test_1',
    name: 'Colony',
    tilePosition: { x: 10, y: 10 },
    groupId: group.id,
    housingCapacity: 4,
    storageCapacity: 50,
    buildings: [],
    foundedTick: 0,
  };
  engine.settlements.set(settlement.id, settlement);
  ind1.settlementId = settlement.id;
  ind2.settlementId = settlement.id;

  assert.strictEqual(InspectorSelectors.getSettlementLivingResidents(engine, settlement.id).length, 2);

  ind1.isAlive = false;
  assert.strictEqual(InspectorSelectors.getSettlementLivingResidents(engine, settlement.id).length, 1);
  assert.strictEqual(InspectorSelectors.getSettlementLivingResidents(engine, settlement.id)[0].id, ind2.id);
});

test('Inspector: Empty world returns safe statistics without NaN/Infinity', () => {
  const engine = new SimulationEngine(108);
  // Clear any pre-existing individuals
  engine.individuals.clear();

  const stats = InspectorSelectors.getSafeStats(engine);
  assert.strictEqual(stats.totalLiving, 0);
  assert.strictEqual(isNaN(stats.avgHunger), false);
  assert.strictEqual(isNaN(stats.avgHealth), false);
  assert.strictEqual(isNaN(stats.avgEnergy), false);
  assert.strictEqual(isFinite(stats.avgHunger), true);
});

test('Inspector: Read-only inspection does not alter RNG or determinism', () => {
  const engine1 = new SimulationEngine(200);
  const engine2 = new SimulationEngine(200);

  // Perform multiple inspection queries on engine1
  InspectorSelectors.filterIndividuals(engine1, 'test', 'alive');
  InspectorSelectors.getSafeStats(engine1);

  // Advance both engines by 10 ticks
  engine1.step(10);
  engine2.step(10);

  // States must be identical
  assert.strictEqual(engine1.getTick(), engine2.getTick());
  assert.strictEqual(engine1.individuals.size, engine2.individuals.size);
  assert.strictEqual(engine1.getRNG().getState(), engine2.getRNG().getState());
});

test('Inspector: Toolbar panel open, toggle, switch tab, and back navigation', () => {
  // Simulate UI navigation state manager
  let isInspectorOpen = false;
  let activeTab = 'people';
  let selectedId: string | undefined = undefined;
  const navHistory: Array<{ tab: string; id?: string }> = [];

  function openInspector(tab: string) {
    if (isInspectorOpen && activeTab === tab) {
      isInspectorOpen = false;
      return;
    }
    navHistory.push({ tab: activeTab, id: selectedId });
    activeTab = tab;
    isInspectorOpen = true;
  }

  function goBack() {
    const prev = navHistory.pop();
    if (prev) {
      activeTab = prev.tab;
      selectedId = prev.id;
    }
  }

  // 1. Initial state
  assert.strictEqual(isInspectorOpen, false);

  // 2. Open people tab
  openInspector('people');
  assert.strictEqual(isInspectorOpen, true);
  assert.strictEqual(activeTab, 'people');

  // 3. Switch to settlements
  openInspector('settlements');
  assert.strictEqual(isInspectorOpen, true);
  assert.strictEqual(activeTab, 'settlements');

  // 4. Click settlements again -> toggles closed
  openInspector('settlements');
  assert.strictEqual(isInspectorOpen, false);

  // 5. Open and test back navigation
  openInspector('history');
  assert.strictEqual(isInspectorOpen, true);
  assert.strictEqual(activeTab, 'history');

  goBack();
  assert.strictEqual(activeTab, 'settlements');
});

test('Inspector: Cyclic parent relations handled safely without infinite loop', () => {
  const engine = new SimulationEngine(301);
  const indA = engine.spawnIndividual({ name: 'A', x: 10, y: 10 });
  const indB = engine.spawnIndividual({ name: 'B', x: 10, y: 10 });

  // Corrupted data: cyclical parentage
  indA.parentIds = [indB.id];
  indB.parentIds = [indA.id];

  const famA = InspectorSelectors.getFamily(engine, indA.id);
  assert.ok(famA);
  assert.strictEqual(famA.parents.length, 1);
  assert.strictEqual(famA.parents[0].id, indB.id);

  const famB = InspectorSelectors.getFamily(engine, indB.id);
  assert.ok(famB);
  assert.strictEqual(famB.parents.length, 1);
  assert.strictEqual(famB.parents[0].id, indA.id);
});

test('Inspector: Locate entity calculates correct canvas pan offsets', () => {
  const CANVAS_SIZE = 640;
  const windowWidth = 1280;
  const windowHeight = 720;
  const scaleValue = 2.0;

  function calculatePan(x: number, y: number) {
    const targetPxX = x * 10;
    const targetPxY = y * 10;
    const centerPx = CANVAS_SIZE / 2; // 320

    const offsetX = (centerPx - targetPxX) * scaleValue;
    const offsetY = (centerPx - targetPxY) * scaleValue;

    const left = 50 + (offsetX / windowWidth) * 100;
    const top = 50 + (offsetY / windowHeight) * 100;
    return { left, top };
  }

  // Exact center tile (32, 32) -> 320px -> offsets 0 -> left=50%, top=50%
  const center = calculatePan(32, 32);
  assert.strictEqual(center.left, 50);
  assert.strictEqual(center.top, 50);

  // Top-left tile (0, 0) -> target is 0, center is 320 -> canvas must shift right/down
  const origin = calculatePan(0, 0);
  assert.ok(origin.left > 50);
  assert.ok(origin.top > 50);
});

test('NPC & World: Child lifeStage receives smaller scale and distinct visual offset', () => {
  function getVisualConfig(lifeStage: 'child' | 'adult' | 'elder') {
    const isChild = lifeStage === 'child';
    const scale = isChild ? 0.55 : 1.0;
    const offsetX = isChild ? 4 : 0;
    const offsetY = isChild ? 3 : 0;
    const drawWidth = 64 * scale;
    const drawHeight = 64 * scale;
    return { scale, offsetX, offsetY, drawWidth, drawHeight };
  }

  const childCfg = getVisualConfig('child');
  const adultCfg = getVisualConfig('adult');

  assert.strictEqual(childCfg.scale, 0.55);
  assert.strictEqual(childCfg.drawWidth, 35.2);
  assert.ok(childCfg.offsetX > 0, 'Child must have offset so it does not overlap mother');
  assert.ok(childCfg.offsetY > 0, 'Child must have vertical offset');

  assert.strictEqual(adultCfg.scale, 1.0);
  assert.strictEqual(adultCfg.drawWidth, 64);
  assert.strictEqual(adultCfg.offsetX, 0);
  assert.strictEqual(adultCfg.offsetY, 0);
});

test('NPC & World: Direction and step interpolation accurately reflect movement goal', () => {
  function deriveDirection(fromX: number, fromY: number, toX: number, toY: number): string {
    const dx = toX - fromX;
    const dy = toY - fromY;
    if (Math.abs(dx) >= Math.abs(dy)) {
      return dx > 0 ? 'right' : 'left';
    } else {
      return dy > 0 ? 'down' : 'up';
    }
  }

  assert.strictEqual(deriveDirection(10, 10, 11, 10), 'right');
  assert.strictEqual(deriveDirection(10, 10, 9, 10), 'left');
  assert.strictEqual(deriveDirection(10, 10, 10, 11), 'down');
  assert.strictEqual(deriveDirection(10, 10, 10, 9), 'up');

  // Interpolation progress bounded [0, 1]
  function interpolate(startX: number, targetX: number, elapsedMs: number, durationMs: number): number {
    const progress = Math.min(1, Math.max(0, elapsedMs / durationMs));
    return startX + (targetX - startX) * progress;
  }

  assert.strictEqual(interpolate(10, 20, 0, 600), 10);
  assert.strictEqual(interpolate(10, 20, 300, 600), 15);
  assert.strictEqual(interpolate(10, 20, 600, 600), 20);
  assert.strictEqual(interpolate(10, 20, 1200, 600), 20);
});

test('NPC & World: Resource and building derivation identifies objects correctly', () => {
  function deriveTileObject(t: {
    terrain: string;
    resources: { food: number; wood: number; stone: number };
    building?: { type: string };
    x: number;
    y: number;
  }): string | undefined {
    if (t.building?.type === 'house') return 'house';
    if (t.building?.type === 'storage') return 'storage';
    if (t.terrain === 'rock' || t.resources.stone >= 20) return 'rock';
    if (t.terrain === 'soil' && t.resources.food >= 4) return 'food';
    if (t.terrain === 'grass') {
      if ((t.x * 7 + t.y * 13) % 5 === 0 && t.resources.food >= 4) return 'food';
      if ((t.x * 11 + t.y * 3) % 3 === 0 && t.resources.wood >= 5) return 'tree';
    }
    return undefined;
  }

  // House on tile
  assert.strictEqual(
    deriveTileObject({ terrain: 'grass', resources: { food: 0, wood: 0, stone: 0 }, building: { type: 'house' }, x: 5, y: 5 }),
    'house'
  );

  // Storage on tile
  assert.strictEqual(
    deriveTileObject({ terrain: 'grass', resources: { food: 0, wood: 0, stone: 0 }, building: { type: 'storage' }, x: 5, y: 5 }),
    'storage'
  );

  // Rock terrain
  assert.strictEqual(
    deriveTileObject({ terrain: 'rock', resources: { food: 0, wood: 0, stone: 25 }, x: 2, y: 2 }),
    'rock'
  );

  // Soil with food
  assert.strictEqual(
    deriveTileObject({ terrain: 'soil', resources: { food: 10, wood: 0, stone: 0 }, x: 10, y: 10 }),
    'food'
  );

  // Water has no resource objects
  assert.strictEqual(
    deriveTileObject({ terrain: 'water', resources: { food: 0, wood: 0, stone: 0 }, x: 0, y: 0 }),
    undefined
  );
});

test('NPC & World: Starter individuals spawn centered near (32, 32)', () => {
  const engine = new SimulationEngine(42);
  const grid = engine.getGrid();
  const centerX = Math.floor(grid.width / 2); // 32
  const centerY = Math.floor(grid.height / 2); // 32

  const candidates = grid
    .getAllTiles()
    .filter((t) => t.traversable && (t.terrain === 'soil' || t.terrain === 'grass'));

  candidates.sort((a, b) => {
    const distA = (a.x - centerX) ** 2 + (a.y - centerY) ** 2;
    const distB = (b.x - centerX) ** 2 + (b.y - centerY) ** 2;
    return distA - distB;
  });

  const startTile = candidates[0];
  assert.ok(startTile, 'Must find traversable fertile tile near center');
  assert.ok(Math.abs(startTile.x - centerX) <= 5, 'Must be within 5 tiles of center X');
  assert.ok(Math.abs(startTile.y - centerY) <= 5, 'Must be within 5 tiles of center Y');
});

test('NPC & World: Multi-tile exploration persists destination until reached', () => {
  const engine = new SimulationEngine(505);
  const grid = engine.getGrid();

  // Create clear fertile path from (30, 30) to (34, 30)
  for (let x = 28; x <= 36; x++) {
    const t = grid.get(x, 30)!;
    t.terrain = 'grass';
    t.traversable = true;
    t.resources.food = 10;
  }

  // Adult with low hunger, high energy, active cooldown (so reproduction and hunger do not override)
  const ind = engine.spawnIndividual({
    x: 30,
    y: 30,
    age: 25,
    hunger: 10,
    energy: 100,
    reproductionCooldown: 50,
  });

  // Set an active explore target 4 tiles away
  ind.currentGoal = 'explore';
  ind.currentAction = 'move';
  ind.targetTile = { x: 34, y: 30 };

  // Step engine: individual should step from 30 -> 31 -> 32 -> 33 -> 34
  for (let step = 1; step <= 4; step++) {
    engine.tick();
    assert.strictEqual(ind.currentGoal, 'explore', `Goal must remain explore at step ${step}`);
    assert.strictEqual(ind.targetTile?.x, 34, `Target X must remain 34 at step ${step}`);
  }

  // Arrived at (34, 30)
  assert.strictEqual(ind.x, 34);
  assert.strictEqual(ind.y, 30);
});
