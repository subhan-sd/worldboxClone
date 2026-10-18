import { Injectable, NgZone } from '@angular/core';
import { SimulationEngine } from '../simulation/engine/simulation-engine';
import { worldGridCells } from './gridCells.service';
import { NpcService } from './npc.service';
import { NPC, NPCState } from '../models/npc.model';
import { TerrainId, TileObjectType, DEFAULT_TERRAIN } from '../models/terrain.model';
import { applyTerrainToTile } from '../simulation/models/terrain-rules';
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

    // Find closest traversable fertile land tile to map center (32, 32)
    const grid = this.engine.getGrid();
    const centerX = Math.floor(grid.width / 2);
    const centerY = Math.floor(grid.height / 2);

    const candidates = grid
      .getAllTiles()
      .filter((t) => t.traversable && (t.terrain === 'soil' || t.terrain === 'grass'));

    candidates.sort((a, b) => {
      const distA = (a.x - centerX) ** 2 + (a.y - centerY) ** 2;
      const distB = (b.x - centerX) ** 2 + (b.y - centerY) ** 2;
      return distA - distB;
    });

    const startTile = candidates[0] || grid.get(centerX, centerY)!;
    const neighbors = grid.getNeighbors(startTile.x, startTile.y, false).filter((t) => t.traversable);
    const hawaTile = neighbors.length > 0
      ? neighbors[0]
      : { x: Math.min(grid.width - 1, startTile.x + 1), y: startTile.y };

    // Spawn Adam & Hawa at center
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

    this.engine.spawnIndividual({
      name: 'Hawa',
      gender: 'female',
      x: hawaTile.x,
      y: hawaTile.y,
      age: 20,
      hunger: 15,
      energy: 100,
      genome: { strength: 0.6, sociability: 0.8, exploration: 0.6, fertility: 0.85 },
    });

    this.syncTerrainToGridCells();
    this.syncIndividualsToNpcList();
  }

  /**
   * Synchronizes simulation terrain and resource/building objects into worldGridCells display dictionary.
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

      const objectType = this.deriveTileObjectType(t);
      this.gridCells.mapOfTiles[key] = { terrain: displayTerrain, objectType };
    }
  }

  /**
   * Checks for resource/building/terrain changes and redraws only dirty tiles.
   */
  syncDirtyTilesToGridCells(): void {
    const grid = this.engine.getGrid();
    const tiles = grid.getAllTiles();
    for (let i = 0; i < tiles.length; i++) {
      const t = tiles[i];
      const key = `x${t.x}y${t.y}`;
      const prev = this.gridCells.mapOfTiles[key];

      let displayTerrain: TerrainId = 'grass';
      if (t.terrain === 'water') displayTerrain = 'water';
      else if (t.terrain === 'soil') displayTerrain = 'soil';
      else if (t.terrain === 'sand') displayTerrain = 'sand';
      else if (t.terrain === 'rock') displayTerrain = 'soil';

      const newObj = this.deriveTileObjectType(t);
      if (!prev || prev.terrain !== displayTerrain || prev.objectType !== newObj) {
        this.gridCells.updateTile(t.x, t.y, displayTerrain, newObj);
      }
    }
  }

  /**
   * Derives visual object overlay for trees, berry bushes, rocks, or buildings.
   */
  deriveTileObjectType(t: any): TileObjectType | undefined {
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

  /**
   * Synchronizes simulated individuals into NpcService's listOfNpc with smooth interpolation.
   */
  syncIndividualsToNpcList(): void {
    const living = Array.from(this.engine.individuals.values()).filter((i) => i.isAlive);
    const existingNpcMap = new Map<string, NPC>();
    for (const npc of this.npcService.listOfNpc) {
      if (npc.playerID) {
        existingNpcMap.set(npc.playerID, npc);
      }
    }

    const updatedNpcs: NPC[] = [];
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

    const now = performance.now();

    for (let i = 0; i < living.length; i++) {
      const ind = living[i];
      const existing = existingNpcMap.get(ind.id);
      const isMale = ind.gender === 'male';
      const sprites = isMale ? maleSprites : femaleSprites;
      const spriteIdx = Math.abs(this.hashString(ind.id)) % sprites.length;
      const spriteUrl = sprites[spriteIdx];

      if (existing) {
        // Step transition: interpolate smoothly from current target to new coordinates
        if (ind.x !== existing.targetX || ind.y !== existing.targetY) {
          const dx = ind.x - existing.targetX;
          const dy = ind.y - existing.targetY;
          existing.startX = existing.targetX;
          existing.startY = existing.targetY;
          existing.targetX = ind.x;
          existing.targetY = ind.y;
          existing.stepStartTime = now;
          existing.stepDuration = this.tickIntervalMs;
          if (Math.abs(dx) >= Math.abs(dy)) {
            existing.currentDirection = dx > 0 ? 'right' : 'left';
          } else {
            existing.currentDirection = dy > 0 ? 'down' : 'up';
          }
        }
        existing.lifeStage = ind.lifeStage;
        existing.age = ind.age;
        existing.currentGoal = ind.currentGoal;
        if (ind.lifeStage === 'child') {
          existing.offsetX = 4;
          existing.offsetY = 3;
        } else {
          existing.offsetX = 0;
          existing.offsetY = 0;
        }
        updatedNpcs.push(existing);
      } else {
        // Brand new NPC (spawned or initial world setup)
        const isPlayable = i === 0 && ind.name === 'Adam';
        const npc = new NPC(
          ind.x,
          ind.y,
          isPlayable,
          NPCState.Idle,
          ind.gender,
          ind.name,
          spriteUrl
        );
        npc.playerID = ind.id;
        npc.simulated = true;
        npc.lifeStage = ind.lifeStage;
        npc.age = ind.age;
        npc.currentGoal = ind.currentGoal;
        npc.startX = ind.x;
        npc.startY = ind.y;
        npc.targetX = ind.x;
        npc.targetY = ind.y;
        npc.currentDisplayX = ind.x * 10;
        npc.currentDisplayY = ind.y * 10;
        npc.stepStartTime = now;
        npc.stepDuration = this.tickIntervalMs;
        if (ind.lifeStage === 'child') {
          npc.offsetX = 4;
          npc.offsetY = 3;
        }
        updatedNpcs.push(npc);
      }
    }

    // Depth sort so entities with higher Y coordinates are rendered in front
    updatedNpcs.sort((a, b) => (a.targetY + a.offsetY) - (b.targetY + b.offsetY));
    this.npcService.listOfNpc = updatedNpcs;
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
    this.syncDirtyTilesToGridCells();
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
    if (!tile) return;

    // Keep the simulation's terrain-dependent rules in one canonical place.
    // Resource stock is preserved only up to the new terrain's capacity.
    applyTerrainToTile(tile, terrain);
    grid.recalculateWaterAccess();

    const obj = this.deriveTileObjectType(tile);
    this.gridCells.updateTile(x, y, terrain, obj);
  }
}
