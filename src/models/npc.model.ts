export type MovementPattern = { [key: string]: number[][] };

export type Gender = 'male' | 'female';

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
    this.isMovingX = false;
    this.isMovingY = false;
    this.currentDirection = 'down';
    this.isMoving = false;
    this.frameWidth = 64;
    this.frameIndex = 0;
    this.movementQueue = [];
    this.previousX = { value: 0 };
    this.previousY = { value: 0 };
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