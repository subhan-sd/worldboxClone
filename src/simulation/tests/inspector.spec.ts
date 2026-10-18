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
