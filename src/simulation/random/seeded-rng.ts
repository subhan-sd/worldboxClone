export interface IRandom {
  next(): number;
  nextInt(min: number, max: number): number;
  nextFloat(min: number, max: number): number;
  nextBool(probability?: number): boolean;
  pick<T>(array: ReadonlyArray<T>): T;
  getState(): number;
  setState(state: number): void;
  fork(): IRandom;
}

/**
 * 32-bit Mulberry32 PRNG.
 * Fully deterministic, fast, seedable, and serializable.
 */
export class SeededRNG implements IRandom {
  private state: number;

  constructor(seed: number = 1337) {
    this.state = (seed >>> 0) || 1;
  }

  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  nextInt(min: number, max: number): number {
    const l = Math.ceil(min);
    const h = Math.floor(max);
    return l + Math.floor(this.next() * (h - l + 1));
  }

  nextFloat(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  nextBool(probability: number = 0.5): boolean {
    return this.next() < probability;
  }

  pick<T>(array: ReadonlyArray<T>): T {
    if (array.length === 0) {
      throw new Error('Cannot pick from empty array');
    }
    return array[this.nextInt(0, array.length - 1)];
  }

  getState(): number {
    return this.state;
  }

  setState(state: number): void {
    this.state = state >>> 0;
  }

  fork(): SeededRNG {
    return new SeededRNG(Math.floor(this.next() * 0xffffffff));
  }
}
