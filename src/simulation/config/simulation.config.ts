import type { ResourceStock } from '../models/simulation-types';

export interface SimulationConfig {
  // World dimensions
  worldWidth: number;
  worldHeight: number;

  // Needs & survival
  hungerIncreasePerTick: number;
  hungerSearchThreshold: number;
  hungerCriticalThreshold: number;
  starvationDamagePerTick: number;
  foodNutritionValue: number;
  energyDrainPerTick: number;
  energyRestRecoveryPerTick: number;
  energyRestThreshold: number;
  healthRegenPerTick: number;

  // Life stages & aging
  childAgeMax: number;
  adultAgeMax: number;
  elderDeathChanceBase: number;

  // Genetics & reproduction
  mutationChance: number;
  mutationMagnitude: number;
  reproductionCooldownTicks: number;
  reproductionHungerMax: number;
  reproductionEnergyMin: number;

  // Resources
  foodRegenRate: number;
  woodRegenRate: number;
  stoneRegenRate: number;

  // Buildings & settlements
  houseCost: ResourceStock;
  houseCapacity: number;
  storageCost: ResourceStock;
  storageCapacity: number;
  settlementMinScore: number;
  settlementFoundMinMembers: number;

  // Observability
  maxEventLogSize: number;
}

export const DEFAULT_SIMULATION_CONFIG: Readonly<SimulationConfig> = {
  worldWidth: 64,
  worldHeight: 64,

  hungerIncreasePerTick: 1.0,
  hungerSearchThreshold: 45,
  hungerCriticalThreshold: 75,
  starvationDamagePerTick: 4.0,
  foodNutritionValue: 35,
  energyDrainPerTick: 0.5,
  energyRestRecoveryPerTick: 5.0,
  energyRestThreshold: 20,
  healthRegenPerTick: 0.5,

  childAgeMax: 20,
  adultAgeMax: 100,
  elderDeathChanceBase: 0.03,

  mutationChance: 0.15,
  mutationMagnitude: 0.05,
  reproductionCooldownTicks: 30,
  reproductionHungerMax: 40,
  reproductionEnergyMin: 50,

  foodRegenRate: 1.0,
  woodRegenRate: 0.2,
  stoneRegenRate: 0.05,

  houseCost: { food: 0, wood: 10, stone: 5 },
  houseCapacity: 4,
  storageCost: { food: 0, wood: 15, stone: 10 },
  storageCapacity: 100,
  settlementMinScore: 12.0,
  settlementFoundMinMembers: 2,

  maxEventLogSize: 200,
};
