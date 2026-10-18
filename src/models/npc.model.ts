export type MovementPattern = { [key: string]: number[][] };

export type Gender = 'male' | 'female';
export type LifeStage = 'child' | 'adult' | 'elder';

export class NPC {
  currentX: number;
  currentY: number;
  isMovingX: boolean;
  isMovingY: boolean;
  currentDirection: string;
  isMoving: boolean;
  frameWidth: number;
  frameIndex: number;
  movementQueue: string[];
  previousX: { value: number };
  previousY: { value: number };
  playable: boolean;
  playerID?: string;
  state: NPCState;
  gender: Gender;
  name: string;
  spriteUrl: string;

  // Living World simulation properties
  simulated: boolean = false;
  lifeStage: LifeStage = 'adult';
  age: number = 20;
  currentGoal: string = 'idle';

  // Smooth interpolation fields
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  stepStartTime: number = 0;
  stepDuration: number = 600;
  offsetX: number = 0;
  offsetY: number = 0;
  currentDisplayX: number;
  currentDisplayY: number;

  constructor(
    currentX: number = 10,
    currentY: number = 10,
    playable: boolean = false,
    state: NPCState = NPCState.Idle,
    gender: Gender = 'male',
    name: string = 'NPC',
    spriteUrl: string = '../../assets/characters/npcs/adam.png'
  ) {
    this.currentX = currentX;
    this.currentY = currentY;
    this.startX = currentX;
    this.startY = currentY;
    this.targetX = currentX;
    this.targetY = currentY;
    this.currentDisplayX = currentX * 10;
    this.currentDisplayY = currentY * 10;
    this.isMovingX = false;
    this.isMovingY = false;
    this.currentDirection = 'down';
    this.isMoving = false;
    this.frameWidth = 64;
    this.frameIndex = 0;
    this.movementQueue = [];
    this.previousX = { value: currentX * 10 };
    this.previousY = { value: currentY * 10 };
    this.playable = playable;
    this.state = state;
    this.gender = gender;
    this.name = name;
    this.spriteUrl = spriteUrl;
  }
}

export enum NPCState {
  Idle,
  Wandering,
  Seeking
}