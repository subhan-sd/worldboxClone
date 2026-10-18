export type SimTerrainType = 'soil' | 'grass' | 'sand' | 'water' | 'rock';

export interface ResourceStock {
  food: number;
  wood: number;
  stone: number;
}

export interface SimTile {
  readonly x: number;
  readonly y: number;
  terrain: SimTerrainType;
  traversable: boolean;
  fertility: number; // 0.0 to 1.0
  waterAccess: boolean;
  resources: ResourceStock;
  maxResources: ResourceStock;
  settlementId?: string;
}

export type GenderType = 'male' | 'female';
export type LifeStage = 'child' | 'adult' | 'elder';

export interface Genome {
  strength: number;     // 0.0 to 1.0: harvesting efficiency, carry capacity
  sociability: number;  // 0.0 to 1.0: group bonding, interaction drive
  exploration: number;  // 0.0 to 1.0: wandering range, curiosity
  fertility: number;    // 0.0 to 1.0: reproductive drive & success
}

export interface ExpressedTraits {
  strength: number;
  sociability: number;
  exploration: number;
  fertility: number;
}

export type GoalType = 
  | 'idle'
  | 'survive_critical'
  | 'find_food'
  | 'eat'
  | 'rest'
  | 'follow_parent'
  | 'seek_partner'
  | 'work_group'
  | 'explore';

export type ActionType =
  | 'idle'
  | 'move'
  | 'gather'
  | 'consume'
  | 'rest'
  | 'reproduce'
  | 'build';

export interface Individual {
  id: string;
  name: string;
  gender: GenderType;
  birthTick: number;
  age: number;
  lifeStage: LifeStage;
  health: number;  // 0..100 (0 = dead)
  hunger: number;  // 0..100 (100 = starving)
  energy: number;  // 0..100 (0 = exhausted)
  x: number;
  y: number;
  isAlive: boolean;
  causeOfDeath?: string;
  deathTick?: number;
  parentIds: string[];
  partnerId?: string;
  reproductionCooldown: number; // ticks until can reproduce again
  groupId?: string;
  settlementId?: string;
  genome: Genome;
  traits: ExpressedTraits;
  currentGoal: GoalType;
  currentAction: ActionType;
  targetTile?: { x: number; y: number };
}

export interface SocialGroup {
  id: string;
  name: string;
  memberIds: string[];
  leaderId?: string;
  sharedInventory: ResourceStock;
  homeTile?: { x: number; y: number };
  settlementId?: string;
  status: 'nomad' | 'settled' | 'disbanded';
}

export type BuildingType = 'house' | 'storage';

export interface Building {
  id: string;
  type: BuildingType;
  x: number;
  y: number;
  builtTick: number;
}

export interface Settlement {
  id: string;
  name: string;
  tilePosition: { x: number; y: number };
  groupId: string;
  housingCapacity: number;
  storageCapacity: number;
  buildings: Building[];
  foundedTick: number;
}

export type SimulationEventType =
  | 'individual_spawned'
  | 'birth'
  | 'death'
  | 'resource_gathered'
  | 'resource_consumed'
  | 'group_formed'
  | 'group_joined'
  | 'group_left'
  | 'group_disbanded'
  | 'settlement_founded'
  | 'building_constructed'
  | 'settlement_migrated';

export interface SimulationEvent {
  id: string;
  tick: number;
  type: SimulationEventType;
  message: string;
  entityId?: string;
  secondaryId?: string;
  location?: { x: number; y: number };
}

export interface SimulationStatistics {
  tick: number;
  totalLiving: number;
  totalDead: number;
  births: number;
  deaths: number;
  childCount: number;
  adultCount: number;
  elderCount: number;
  avgHunger: number;
  avgHealth: number;
  avgEnergy: number;
  totalWorldFood: number;
  totalWorldWood: number;
  totalWorldStone: number;
  groupCount: number;
  settlementCount: number;
}
