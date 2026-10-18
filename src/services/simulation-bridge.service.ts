import { Injectable, NgZone } from '@angular/core';
import { SimulationEngine } from '../simulation/engine/simulation-engine';
import { worldGridCells } from './gridCells.service';
import { NpcService } from './npc.service';
import { NPC, NPCState } from '../models/npc.model';
import { TerrainId, DEFAULT_TERRAIN } from '../models/terrain.model';
import type {
  SimulationStatistics,
  SimulationEvent,
  Individual,
  SocialGroup,
  Settlement,
} from '../simulation/models/simulation-types';

export interface FamilyResult {
  target: Individual;
  parents: Individual[];
  missingParentIds: string[];
  partner?: Individual;
  children: Individual[];
  siblings: Individual[];
}

export interface WorldTimeInfo {
  tick: number;
  isRunning: boolean;
  calendarAvailable: boolean;
  displayString: string;
  calendarNote: string;
}

@Injectable({
  providedIn: 'root',
})
export class SimulationBridgeService {
  private engine: SimulationEngine;
  private intervalId?: ReturnType<typeof setInterval>;
  private isRunning: boolean = false;
  private tickIntervalMs: number = 600;

  constructor(
    private gridCells: worldGridCells,
    private npcService: NpcService,
    private ngZone: NgZone
  ) {
    this.engine = new SimulationEngine(42);
    this.gridCells.onTileChange = (tx, ty, terrain) => this.onTileDrawn(tx, ty, terrain);
    this.initWorld();
  }

  /**
   * Initializes starter world with Adam & Hawa and initial map layout.
   */
  initWorld(seed: number = 42): void {
    this.engine.init(seed);

    // Find good starting fertile locations for Adam and Hawa
    const grid = this.engine.getGrid();
    const fertileTiles = grid
      .getAllTiles()
      .filter((t) => t.traversable && t.terrain === 'soil');
    const startTile = fertileTiles.length > 0 ? fertileTiles[0] : grid.get(32, 32)!;

    // Spawn Adam & Hawa
    this.engine.spawnIndividual({
      name: 'Adam',
      gender: 'male',
      x: startTile.x,
      y: startTile.y,
      age: 22,
      hunger: 15,
      energy: 100,
      genome: { strength: 0.8, sociability: 0.7, exploration: 0.7, fertility: 0.8 },
    });

    const hawaX = Math.min(63, startTile.x + 1);
    const hawaY = startTile.y;
    this.engine.spawnIndividual({
      name: 'Hawa',
      gender: 'female',
      x: hawaX,
      y: hawaY,
      age: 20,
      hunger: 15,
      energy: 100,
      genome: { strength: 0.6, sociability: 0.8, exploration: 0.6, fertility: 0.85 },
    });

    this.syncTerrainToGridCells();
    this.syncIndividualsToNpcList();
  }

  /**
   * Synchronizes simulation terrain into Angular's worldGridCells display dictionary.
   */
  syncTerrainToGridCells(): void {
    const grid = this.engine.getGrid();
    const tiles = grid.getAllTiles();
    for (let i = 0; i < tiles.length; i++) {
      const t = tiles[i];
      const key = `x${t.x}y${t.y}`;
      // Map SimTerrainType ('rock' -> 'soil' or 'sand' for canvas renderer compatibility)
      let displayTerrain: TerrainId = 'grass';
      if (t.terrain === 'water') displayTerrain = 'water';
      else if (t.terrain === 'soil') displayTerrain = 'soil';
      else if (t.terrain === 'sand') displayTerrain = 'sand';
      else if (t.terrain === 'rock') displayTerrain = 'soil';

      this.gridCells.mapOfTiles[key] = { terrain: displayTerrain };
    }
  }

  /**
   * Synchronizes simulated individuals into NpcService's listOfNpc for rendering.
   */
  syncIndividualsToNpcList(): void {
    const living = Array.from(this.engine.individuals.values()).filter((i) => i.isAlive);
    const viewNpcs: NPC[] = [];

    const maleSprites = [
      '../../assets/characters/npcs/adam.png',
      '../../assets/characters/npcs/male_1.png',
      '../../assets/characters/npcs/male_2.png',
      '../../assets/characters/npcs/male_3.png',
      '../../assets/characters/npcs/male_4.png',
    ];
    const femaleSprites = [
      '../../assets/characters/npcs/hawa.png',
      '../../assets/characters/npcs/female_1.png',
      '../../assets/characters/npcs/female_2.png',
      '../../assets/characters/npcs/female_3.png',
      '../../assets/characters/npcs/female_4.png',
    ];

    for (let i = 0; i < living.length; i++) {
      const ind = living[i];
      const isMale = ind.gender === 'male';
      const sprites = isMale ? maleSprites : femaleSprites;
      const spriteIdx = Math.abs(this.hashString(ind.id)) % sprites.length;
      const spriteUrl = sprites[spriteIdx];

      const npc = new NPC(
        ind.x,
        ind.y,
        i === 0, // Adam is playable if keyboard controls used
        ind.currentGoal === 'idle' ? NPCState.Idle : NPCState.Wandering,
        ind.gender,
        ind.name,
        spriteUrl
      );
      npc.playerID = ind.id;
      viewNpcs.push(npc);
    }

    this.npcService.listOfNpc = viewNpcs;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

  /**
   * Steps the simulation by 1 tick and synchronizes state to UI.
   */
  step(): void {
    this.engine.tick();
    this.syncIndividualsToNpcList();
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.ngZone.runOutsideAngular(() => {
      this.intervalId = setInterval(() => {
        this.step();
      }, this.tickIntervalMs);
    });
  }

  pause(): void {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.intervalId !== undefined) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  toggle(): boolean {
    if (this.isRunning) this.pause();
    else this.start();
    return this.isRunning;
  }

  getIsRunning(): boolean {
    return this.isRunning;
  }

  getEngine(): SimulationEngine {
    return this.engine;
  }

  getStats(): SimulationStatistics {
    return this.engine.getStats();
  }

  getSafeStats(): SimulationStatistics {
    const stats = this.engine.getStats();
    return {
      ...stats,
      avgHunger: isNaN(stats.avgHunger) ? 0 : stats.avgHunger,
      avgHealth: isNaN(stats.avgHealth) ? 0 : stats.avgHealth,
      avgEnergy: isNaN(stats.avgEnergy) ? 0 : stats.avgEnergy,
    };
  }

  getWorldTime(): WorldTimeInfo {
    const tick = this.engine.getTick();
    return {
      tick,
      isRunning: this.isRunning,
      calendarAvailable: false,
      displayString: `Tick ${tick}`,
      calendarNote: 'Sistem waktu berbasis tick deterministik. Kalender kalender/musim belum didukung di MVP1.',
    };
  }

  getAllIndividuals(): Individual[] {
    return Array.from(this.engine.individuals.values());
  }

  getIndividualById(id: string): Individual | undefined {
    return this.engine.individuals.get(id);
  }

  getFamilyForIndividual(id: string): FamilyResult | null {
    const target = this.engine.individuals.get(id);
    if (!target) return null;

    const parents: Individual[] = [];
    const missingParentIds: string[] = [];
    for (const pid of target.parentIds) {
      const p = this.engine.individuals.get(pid);
      if (p) parents.push(p);
      else missingParentIds.push(pid);
    }

    const partner = target.partnerId ? this.engine.individuals.get(target.partnerId) : undefined;

    const children = Array.from(this.engine.individuals.values()).filter((i) =>
      i.parentIds.includes(id)
    );

    const siblings =
      target.parentIds.length === 0
        ? []
        : Array.from(this.engine.individuals.values()).filter(
            (i) => i.id !== id && i.parentIds.some((pid) => target.parentIds.includes(pid))
          );

    return { target, parents, missingParentIds, partner, children, siblings };
  }

  getAllGroups(): SocialGroup[] {
    return Array.from(this.engine.groups.values());
  }

  getGroupById(id: string): SocialGroup | undefined {
    return this.engine.groups.get(id);
  }

  getGroupLivingMembers(groupId: string): Individual[] {
    const group = this.engine.groups.get(groupId);
    if (!group) return [];
    return group.memberIds
      .map((mid) => this.engine.individuals.get(mid))
      .filter((i): i is Individual => i !== undefined && i.isAlive);
  }

  getAllSettlements(): Settlement[] {
    return Array.from(this.engine.settlements.values());
  }

  getSettlementById(id: string): Settlement | undefined {
    return this.engine.settlements.get(id);
  }

  getSettlementResidents(settlementId: string): Individual[] {
    return Array.from(this.engine.individuals.values()).filter(
      (i) => i.settlementId === settlementId && i.isAlive
    );
  }

  getEvents(limit?: number): ReadonlyArray<SimulationEvent> {
    return this.engine.getEvents(limit);
  }

  save(): string {
    return this.engine.saveToJson();
  }

  load(jsonString: string): boolean {
    const success = this.engine.loadFromJson(jsonString);
    if (success) {
      this.syncTerrainToGridCells();
      this.syncIndividualsToNpcList();
    }
    return success;
  }

  /**
   * Called when the user edits a tile on canvas to update the simulation grid.
   */
  onTileDrawn(x: number, y: number, terrain: TerrainId): void {
    const grid = this.engine.getGrid();
    const tile = grid.get(x, y);
    if (tile) {
      tile.terrain = terrain;
      tile.traversable = terrain !== 'water';
      if (terrain === 'water') {
        tile.resources.food = 5;
        tile.resources.wood = 0;
        tile.resources.stone = 0;
      }
      grid.recalculateWaterAccess();
    }
  }
}
