import { SeededRNG, type IRandom } from '../random/seeded-rng';
import { TileGrid } from '../models/tile-grid';
import { WorldGenerator } from '../systems/world-generator';
import { ResourceSystem } from '../systems/resource.system';
import { NeedsSystem } from '../systems/needs.system';
import { NavigationSystem } from '../systems/navigation.system';
import { DecisionSystem } from '../systems/decision.system';
import { FamilySystem } from '../systems/family.system';
import { SocialGroupSystem } from '../systems/social-group.system';
import { SettlementSystem } from '../systems/settlement.system';
import { EventLogger } from '../events/event-logger';
import { StateSerializer } from '../serialization/state-serializer';
import type {
  Individual,
  SocialGroup,
  Settlement,
  SimulationEvent,
  SimulationStatistics,
  Genome,
  ExpressedTraits,
  GenderType,
} from '../models/simulation-types';
import {
  type SimulationConfig,
  DEFAULT_SIMULATION_CONFIG,
} from '../config/simulation.config';

export class SimulationEngine {
  private rng: IRandom;
  private grid: TileGrid;
  private config: SimulationConfig;
  private currentTick: number = 0;
  private seed: number;
  private eventLogger: EventLogger;
  private entityCounter: number = 0;
  private groupCounter: number = 0;
  private settlementCounter: number = 0;
  private buildingCounter: number = 0;

  readonly individuals: Map<string, Individual> = new Map();
  readonly groups: Map<string, SocialGroup> = new Map();
  readonly settlements: Map<string, Settlement> = new Map();

  private totalBirths: number = 0;
  private totalDeaths: number = 0;

  constructor(seed: number = 42, customConfig?: Partial<SimulationConfig>) {
    this.seed = seed;
    this.config = { ...DEFAULT_SIMULATION_CONFIG, ...customConfig };
    this.rng = new SeededRNG(seed);
    this.eventLogger = new EventLogger(this.config.maxEventLogSize);
    this.grid = WorldGenerator.generate(
      this.config.worldWidth,
      this.config.worldHeight,
      this.rng
    );
  }

  init(seed?: number, customConfig?: Partial<SimulationConfig>): void {
    if (seed !== undefined) this.seed = seed;
    if (customConfig) this.config = { ...this.config, ...customConfig };
    this.rng = new SeededRNG(this.seed);
    this.currentTick = 0;
    this.entityCounter = 0;
    this.groupCounter = 0;
    this.settlementCounter = 0;
    this.buildingCounter = 0;
    this.eventLogger.clear();
    this.individuals.clear();
    this.groups.clear();
    this.settlements.clear();
    this.totalBirths = 0;
    this.totalDeaths = 0;

    this.grid = WorldGenerator.generate(
      this.config.worldWidth,
      this.config.worldHeight,
      this.rng
    );
  }

  getSeed(): number {
    return this.seed;
  }

  getTick(): number {
    return this.currentTick;
  }

  getGrid(): TileGrid {
    return this.grid;
  }

  getConfig(): Readonly<SimulationConfig> {
    return this.config;
  }

  getRNG(): IRandom {
    return this.rng;
  }

  getEvents(limit?: number): ReadonlyArray<SimulationEvent> {
    return this.eventLogger.getEvents(limit);
  }

  getLogger(): EventLogger {
    return this.eventLogger;
  }

  /**
   * Spawns an individual onto a valid traversable tile in the simulation.
   */
  spawnIndividual(params?: Partial<Individual>): Individual {
    this.entityCounter++;
    const id = params?.id || `ind_${this.seed}_${this.entityCounter}`;

    const defaultGenome: Genome = {
      strength: 0.5,
      sociability: 0.5,
      exploration: 0.5,
      fertility: 0.5,
    };

    const defaultTraits: ExpressedTraits = {
      strength: defaultGenome.strength,
      sociability: defaultGenome.sociability,
      exploration: defaultGenome.exploration,
      fertility: defaultGenome.fertility,
    };

    // Find valid traversable coordinate
    let x = params?.x !== undefined ? params.x : Math.floor(this.config.worldWidth / 2);
    let y = params?.y !== undefined ? params.y : Math.floor(this.config.worldHeight / 2);

    const initialTile = this.grid.get(x, y);
    if (!initialTile || !initialTile.traversable) {
      const nearestValid = NavigationSystem.findNearestTile(
        this.grid,
        x,
        y,
        (t) => t.traversable,
        20
      );
      if (nearestValid) {
        x = nearestValid.x;
        y = nearestValid.y;
      }
    }

    const gender: GenderType =
      params?.gender || (this.rng.nextBool(0.5) ? 'male' : 'female');

    const age = params?.age !== undefined ? params.age : 20;
    const birthTick =
      params?.birthTick !== undefined
        ? params.birthTick
        : this.currentTick - age;

    const ind: Individual = {
      id,
      name: params?.name || (gender === 'male' ? `Adam_${this.entityCounter}` : `Hawa_${this.entityCounter}`),
      gender,
      birthTick,
      age,
      lifeStage: params?.lifeStage || (age <= this.config.childAgeMax ? 'child' : age <= this.config.adultAgeMax ? 'adult' : 'elder'),
      health: params?.health !== undefined ? params.health : 100,
      hunger: params?.hunger !== undefined ? params.hunger : 10,
      energy: params?.energy !== undefined ? params.energy : 100,
      x,
      y,
      isAlive: params?.isAlive !== undefined ? params.isAlive : true,
      causeOfDeath: params?.causeOfDeath,
      deathTick: params?.deathTick,
      parentIds: params?.parentIds || [],
      partnerId: params?.partnerId,
      reproductionCooldown: params?.reproductionCooldown || 0,
      groupId: params?.groupId,
      settlementId: params?.settlementId,
      genome: params?.genome || defaultGenome,
      traits: params?.traits || defaultTraits,
      currentGoal: params?.currentGoal || 'idle',
      currentAction: params?.currentAction || 'idle',
      targetTile: params?.targetTile,
    };

    this.individuals.set(id, ind);

    this.eventLogger.log({
      tick: this.currentTick,
      type: 'individual_spawned',
      message: `${ind.name} spawned at (${ind.x}, ${ind.y})`,
      entityId: ind.id,
      location: { x: ind.x, y: ind.y },
    });

    return ind;
  }

  /**
   * Manually creates or founds a group with a founder.
   */
  createGroup(name: string, founder: Individual): SocialGroup {
    this.groupCounter++;
    const id = `grp_${this.seed}_${this.groupCounter}`;
    const group = SocialGroupSystem.createGroup(id, name, founder);
    this.groups.set(id, group);
    this.eventLogger.log({
      tick: this.currentTick,
      type: 'group_formed',
      message: `Group ${name} formed by ${founder.name}`,
      entityId: id,
      secondaryId: founder.id,
      location: { x: founder.x, y: founder.y },
    });
    return group;
  }

  /**
   * Executes a single simulation step following the strictly ordered tick phases.
   */
  tick(): void {
    // Phase 1: Command Processing (external inputs)

    // Phase 2: Environment & Resource Regeneration
    ResourceSystem.regenerate(this.grid, this.config);

    // Phase 3: Aging & Needs Decay
    for (const ind of this.individuals.values()) {
      if (ind.isAlive) {
        NeedsSystem.updateNeedsAndAging(ind, this.config, this.currentTick);
      }
    }

    // Phase 4: Health & Starvation Evaluation
    for (const ind of this.individuals.values()) {
      if (ind.isAlive) {
        const died = NeedsSystem.evaluateHealthAndMortality(
          ind,
          this.config,
          this.rng,
          this.currentTick
        );
        if (died) {
          this.totalDeaths++;
          this.eventLogger.log({
            tick: this.currentTick,
            type: 'death',
            message: `${ind.name} died of ${ind.causeOfDeath || 'unknown'}`,
            entityId: ind.id,
            location: { x: ind.x, y: ind.y },
          });
        }
      }
    }

    // Phase 5: Decision & Goal Selection
    for (const ind of this.individuals.values()) {
      if (ind.isAlive) {
        DecisionSystem.evaluateIntent(
          ind,
          this.grid,
          this.config,
          this.rng,
          this.individuals
        );
      }
    }

    // Phase 6: Movement & Path Execution
    for (const ind of this.individuals.values()) {
      if (ind.isAlive && ind.currentAction === 'move' && ind.targetTile) {
        const nextStep = NavigationSystem.getNextStepTowards(
          this.grid,
          ind.x,
          ind.y,
          ind.targetTile.x,
          ind.targetTile.y
        );
        if (nextStep) {
          const stepTile = this.grid.get(nextStep.x, nextStep.y);
          if (stepTile && stepTile.traversable) {
            ind.x = nextStep.x;
            ind.y = nextStep.y;
          }
        }
      }
    }

    // Phase 7: Resource Gathering & Consumption
    for (const ind of this.individuals.values()) {
      if (!ind.isAlive) continue;

      if (ind.currentAction === 'consume') {
        const tile = this.grid.get(ind.x, ind.y);
        if (tile && tile.resources.food > 0) {
          const harvested = ResourceSystem.harvest(tile, 'food', 1);
          if (harvested > 0) {
            NeedsSystem.consumeFood(ind, harvested, this.config);
            this.eventLogger.log({
              tick: this.currentTick,
              type: 'resource_consumed',
              message: `${ind.name} consumed ${harvested} food`,
              entityId: ind.id,
              location: { x: ind.x, y: ind.y },
            });
          }
        } else {
          // Food on tile ran out
          ind.currentAction = 'idle';
          ind.targetTile = undefined;
        }
      } else if (ind.currentAction === 'gather') {
        const tile = this.grid.get(ind.x, ind.y);
        if (tile && ind.groupId) {
          const group = this.groups.get(ind.groupId);
          if (group) {
            let harvested = 0;
            if (tile.resources.wood > 0) {
              harvested = ResourceSystem.harvest(tile, 'wood', 1);
              if (harvested > 0) {
                SocialGroupSystem.depositResource(group, 'wood', harvested);
                this.eventLogger.log({
                  tick: this.currentTick,
                  type: 'resource_gathered',
                  message: `${ind.name} gathered ${harvested} wood for group ${group.name}`,
                  entityId: ind.id,
                  secondaryId: group.id,
                  location: { x: ind.x, y: ind.y },
                });
              }
            } else if (tile.resources.stone > 0) {
              harvested = ResourceSystem.harvest(tile, 'stone', 1);
              if (harvested > 0) {
                SocialGroupSystem.depositResource(group, 'stone', harvested);
                this.eventLogger.log({
                  tick: this.currentTick,
                  type: 'resource_gathered',
                  message: `${ind.name} gathered ${harvested} stone for group ${group.name}`,
                  entityId: ind.id,
                  secondaryId: group.id,
                  location: { x: ind.x, y: ind.y },
                });
              }
            }
          }
        }
        ind.currentAction = 'idle';
        ind.targetTile = undefined;
      }
    }

    // Phase 8: Social Group Management
    const unassignedAdults = Array.from(this.individuals.values()).filter(
      (i) => i.isAlive && i.lifeStage !== 'child' && i.groupId === undefined
    );
    if (unassignedAdults.length >= 2) {
      this.groupCounter++;
      const newGroupId = `grp_${this.seed}_${this.groupCounter}`;
      const groupName = `Tribe_${this.groupCounter}`;
      const newGroup = SocialGroupSystem.evaluateGroupFormation(
        unassignedAdults,
        newGroupId,
        groupName
      );
      if (newGroup) {
        this.groups.set(newGroup.id, newGroup);
        this.eventLogger.log({
          tick: this.currentTick,
          type: 'group_formed',
          message: `Social group ${newGroup.name} formed with ${newGroup.memberIds.length} members`,
          entityId: newGroup.id,
          location: newGroup.homeTile,
        });
      }
    }

    // Phase 9: Reproduction & Births
    const newChildren: Individual[] = [];
    const adults = Array.from(this.individuals.values()).filter(
      (i) => i.isAlive && i.lifeStage !== 'child' && i.reproductionCooldown === 0
    );

    for (let i = 0; i < adults.length; i++) {
      const a = adults[i];
      if (a.reproductionCooldown > 0) continue;

      for (let j = i + 1; j < adults.length; j++) {
        const b = adults[j];
        if (b.reproductionCooldown > 0) continue;

        if (FamilySystem.canReproduce(a, b, this.config)) {
          this.entityCounter++;
          const childId = `ind_${this.seed}_${this.entityCounter}`;
          const child = FamilySystem.reproduce(
            a,
            b,
            childId,
            this.currentTick,
            this.rng,
            this.config
          );
          newChildren.push(child);
          this.totalBirths++;
          this.eventLogger.log({
            tick: this.currentTick,
            type: 'birth',
            message: `${child.name} was born to ${a.name} and ${b.name}`,
            entityId: child.id,
            secondaryId: a.id,
            location: { x: child.x, y: child.y },
          });
          break; // a has reproduced
        }
      }
    }

    // Register newborn children (they will begin acting on next tick)
    for (let k = 0; k < newChildren.length; k++) {
      this.individuals.set(newChildren[k].id, newChildren[k]);
    }

    // Phase 10: Settlement & Construction
    for (const group of this.groups.values()) {
      if (group.status === 'disbanded') continue;

      // 1. Evaluate founding settlement for nomad groups
      if (!group.settlementId && group.memberIds.length >= this.config.settlementFoundMinMembers && group.homeTile) {
        const score = SettlementSystem.calculateSiteScore(
          this.grid,
          group.homeTile.x,
          group.homeTile.y
        );
        if (score >= this.config.settlementMinScore) {
          this.settlementCounter++;
          const setlId = `setl_${this.seed}_${this.settlementCounter}`;
          const setName = `${group.name}_Village`;
          const settlement = SettlementSystem.foundSettlement(
            setlId,
            setName,
            group,
            group.homeTile,
            this.currentTick
          );
          this.settlements.set(setlId, settlement);
          this.eventLogger.log({
            tick: this.currentTick,
            type: 'settlement_founded',
            message: `Settlement ${setName} founded at (${group.homeTile.x}, ${group.homeTile.y}) with score ${score}`,
            entityId: setlId,
            secondaryId: group.id,
            location: group.homeTile,
          });
        }
      }

      // 2. Construction within existing settlement
      if (group.settlementId) {
        const settlement = this.settlements.get(group.settlementId);
        if (settlement) {
          // Construct house if population exceeds or equals housing capacity
          if (
            group.memberIds.length >= settlement.housingCapacity &&
            SettlementSystem.canConstruct(group, 'house', this.config)
          ) {
            this.buildingCounter++;
            const bId = `bld_${this.seed}_${this.buildingCounter}`;
            const building = SettlementSystem.constructBuilding(
              settlement,
              group,
              'house',
              bId,
              this.currentTick,
              this.config
            );
            if (building) {
              this.eventLogger.log({
                tick: this.currentTick,
                type: 'building_constructed',
                message: `House constructed in ${settlement.name}. New capacity: ${settlement.housingCapacity}`,
                entityId: building.id,
                secondaryId: settlement.id,
                location: { x: building.x, y: building.y },
              });
            }
          }
        }
      }
    }

    // Phase 11: Death Processing & Entity Cleanup
    for (const ind of this.individuals.values()) {
      if (!ind.isAlive) {
        ind.currentAction = 'idle';
        ind.targetTile = undefined;
      }
    }
    for (const group of this.groups.values()) {
      if (group.status !== 'disbanded') {
        const wasActive = group.memberIds.length > 0;
        SocialGroupSystem.cleanupDeadMembers(group, this.individuals);
        if (wasActive && group.memberIds.length === 0) {
          this.eventLogger.log({
            tick: this.currentTick,
            type: 'group_disbanded',
            message: `Group ${group.name} was disbanded as all members perished`,
            entityId: group.id,
          });
        }
      }
    }

    // Phase 12: Advance tick counter
    this.currentTick++;
  }

  /**
   * Executes multiple ticks sequentially.
   */
  step(ticks: number = 1): void {
    for (let i = 0; i < ticks; i++) {
      this.tick();
    }
  }

  /**
   * Computes an aggregate snapshot of current simulation statistics.
   */
  getStats(): SimulationStatistics {
    const worldRes = ResourceSystem.aggregateWorldResources(this.grid);

    let livingCount = 0;
    let deadCount = 0;
    let childCount = 0;
    let adultCount = 0;
    let elderCount = 0;
    let sumHunger = 0;
    let sumHealth = 0;
    let sumEnergy = 0;

    for (const ind of this.individuals.values()) {
      if (ind.isAlive) {
        livingCount++;
        sumHunger += ind.hunger;
        sumHealth += ind.health;
        sumEnergy += ind.energy;
        if (ind.lifeStage === 'child') childCount++;
        else if (ind.lifeStage === 'adult') adultCount++;
        else elderCount++;
      } else {
        deadCount++;
      }
    }

    return {
      tick: this.currentTick,
      totalLiving: livingCount,
      totalDead: deadCount,
      births: this.totalBirths,
      deaths: this.totalDeaths,
      childCount,
      adultCount,
      elderCount,
      avgHunger: livingCount > 0 ? sumHunger / livingCount : 0,
      avgHealth: livingCount > 0 ? sumHealth / livingCount : 0,
      avgEnergy: livingCount > 0 ? sumEnergy / livingCount : 0,
      totalWorldFood: worldRes.food,
      totalWorldWood: worldRes.wood,
      totalWorldStone: worldRes.stone,
      groupCount: this.groups.size,
      settlementCount: this.settlements.size,
    };
  }

  /**
   * Serializes current simulation state to JSON string.
   */
  saveToJson(): string {
    return StateSerializer.serialize({
      seed: this.seed,
      rngState: this.rng.getState(),
      currentTick: this.currentTick,
      counters: {
        entityCounter: this.entityCounter,
        groupCounter: this.groupCounter,
        settlementCounter: this.settlementCounter,
        buildingCounter: this.buildingCounter,
        totalBirths: this.totalBirths,
        totalDeaths: this.totalDeaths,
      },
      config: this.config,
      tiles: this.grid.getAllTiles(),
      individuals: this.individuals,
      groups: this.groups,
      settlements: this.settlements,
    });
  }

  /**
   * Loads and restores a complete simulation state from JSON.
   */
  loadFromJson(jsonString: string): boolean {
    const data = StateSerializer.deserialize(jsonString);
    this.seed = data.seed;
    this.rng.setState(data.rngState);
    this.currentTick = data.currentTick;
    this.config = { ...data.config };
    this.entityCounter = data.counters.entityCounter;
    this.groupCounter = data.counters.groupCounter;
    this.settlementCounter = data.counters.settlementCounter;
    this.buildingCounter = data.counters.buildingCounter;
    this.totalBirths = data.counters.totalBirths;
    this.totalDeaths = data.counters.totalDeaths;

    this.grid = new TileGrid(this.config.worldWidth, this.config.worldHeight);
    for (let i = 0; i < data.tiles.length; i++) {
      const t = data.tiles[i];
      this.grid.setTile(t.x, t.y, {
        ...t,
        resources: { ...t.resources },
        maxResources: { ...t.maxResources },
      });
    }

    this.individuals.clear();
    for (let j = 0; j < data.individuals.length; j++) {
      const ind = data.individuals[j];
      this.individuals.set(ind.id, {
        ...ind,
        parentIds: [...ind.parentIds],
        genome: { ...ind.genome },
        traits: { ...ind.traits },
        targetTile: ind.targetTile ? { ...ind.targetTile } : undefined,
      });
    }

    this.groups.clear();
    for (let k = 0; k < data.groups.length; k++) {
      const grp = data.groups[k];
      this.groups.set(grp.id, {
        ...grp,
        memberIds: [...grp.memberIds],
        sharedInventory: { ...grp.sharedInventory },
        homeTile: grp.homeTile ? { ...grp.homeTile } : undefined,
      });
    }

    this.settlements.clear();
    for (let m = 0; m < data.settlements.length; m++) {
      const setl = data.settlements[m];
      this.settlements.set(setl.id, {
        ...setl,
        tilePosition: { ...setl.tilePosition },
        buildings: setl.buildings.map((b) => ({ ...b })),
      });
    }

    this.eventLogger.clear();
    return true;
  }
}
