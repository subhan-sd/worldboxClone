import type {
  Individual,
  SocialGroup,
  Settlement,
  SimTile,
  SimTerrainType,
  ResourceStock,
} from '../models/simulation-types';
import type { SimulationConfig } from '../config/simulation.config';

export interface SerializedSimulationData {
  version: number;
  seed: number;
  rngState: number;
  currentTick: number;
  counters: {
    entityCounter: number;
    groupCounter: number;
    settlementCounter: number;
    buildingCounter: number;
    totalBirths: number;
    totalDeaths: number;
  };
  config: SimulationConfig;
  tiles: SimTile[];
  individuals: Individual[];
  groups: SocialGroup[];
  settlements: Settlement[];
}

export class StateSerializer {
  static readonly CURRENT_VERSION = 1;

  /**
   * Serializes complete simulation state into a JSON string.
   */
  static serialize(data: {
    seed: number;
    rngState: number;
    currentTick: number;
    counters: {
      entityCounter: number;
      groupCounter: number;
      settlementCounter: number;
      buildingCounter: number;
      totalBirths: number;
      totalDeaths: number;
    };
    config: SimulationConfig;
    tiles: ReadonlyArray<SimTile>;
    individuals: ReadonlyMap<string, Individual>;
    groups: ReadonlyMap<string, SocialGroup>;
    settlements: ReadonlyMap<string, Settlement>;
  }): string {
    const payload: SerializedSimulationData = {
      version: StateSerializer.CURRENT_VERSION,
      seed: data.seed,
      rngState: data.rngState,
      currentTick: data.currentTick,
      counters: { ...data.counters },
      config: { ...data.config },
      tiles: data.tiles.map((t) => ({ ...t, resources: { ...t.resources }, maxResources: { ...t.maxResources } })),
      individuals: Array.from(data.individuals.values()).map((ind) => ({
        ...ind,
        parentIds: [...ind.parentIds],
        genome: { ...ind.genome },
        traits: { ...ind.traits },
        targetTile: ind.targetTile ? { ...ind.targetTile } : undefined,
      })),
      groups: Array.from(data.groups.values()).map((grp) => ({
        ...grp,
        memberIds: [...grp.memberIds],
        sharedInventory: { ...grp.sharedInventory },
        homeTile: grp.homeTile ? { ...grp.homeTile } : undefined,
      })),
      settlements: Array.from(data.settlements.values()).map((setl) => ({
        ...setl,
        tilePosition: { ...setl.tilePosition },
        buildings: setl.buildings.map((b) => ({ ...b })),
      })),
    };

    return JSON.stringify(payload);
  }

  /**
   * Deserializes and validates a JSON string into a structured simulation data payload.
   * Throws an error if data is invalid or corrupt.
   */
  static deserialize(jsonString: string): SerializedSimulationData {
    let parsed: any;
    try {
      parsed = JSON.parse(jsonString);
    } catch (err: any) {
      throw new Error(`Invalid JSON format: ${err.message}`);
    }

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Serialized data must be an object');
    }

    if (parsed.version !== StateSerializer.CURRENT_VERSION) {
      throw new Error(
        `Unsupported save version: ${parsed.version}. Expected ${StateSerializer.CURRENT_VERSION}`
      );
    }

    if (typeof parsed.seed !== 'number' || typeof parsed.rngState !== 'number') {
      throw new Error('Invalid seed or RNG state in serialized data');
    }

    if (typeof parsed.currentTick !== 'number' || parsed.currentTick < 0) {
      throw new Error('Invalid currentTick in serialized data');
    }

    if (!parsed.counters || typeof parsed.counters !== 'object') {
      throw new Error('Missing counters object in serialized data');
    }

    if (!parsed.config || typeof parsed.config !== 'object') {
      throw new Error('Missing config object in serialized data');
    }

    if (!Array.isArray(parsed.tiles) || parsed.tiles.length === 0) {
      throw new Error('Missing or empty tiles array in serialized data');
    }

    if (!Array.isArray(parsed.individuals)) {
      throw new Error('Invalid individuals array in serialized data');
    }

    // Validate individuals sanity
    for (let i = 0; i < parsed.individuals.length; i++) {
      const ind = parsed.individuals[i];
      if (!ind.id || typeof ind.id !== 'string') {
        throw new Error(`Individual at index ${i} has invalid ID`);
      }
      if (typeof ind.health !== 'number' || ind.health < 0 || ind.health > 100) {
        throw new Error(`Individual ${ind.id} has invalid health: ${ind.health}`);
      }
      if (typeof ind.hunger !== 'number' || ind.hunger < 0 || ind.hunger > 100) {
        throw new Error(`Individual ${ind.id} has invalid hunger: ${ind.hunger}`);
      }
      if (typeof ind.energy !== 'number' || ind.energy < 0 || ind.energy > 100) {
        throw new Error(`Individual ${ind.id} has invalid energy: ${ind.energy}`);
      }
    }

    if (!Array.isArray(parsed.groups)) {
      throw new Error('Invalid groups array in serialized data');
    }

    if (!Array.isArray(parsed.settlements)) {
      throw new Error('Invalid settlements array in serialized data');
    }

    return parsed as SerializedSimulationData;
  }
}
