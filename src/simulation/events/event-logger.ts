import type { SimulationEvent, SimulationEventType } from '../models/simulation-types';

export class EventLogger {
  private readonly maxSize: number;
  private readonly events: SimulationEvent[] = [];
  private eventCounter: number = 0;

  constructor(maxSize: number = 200) {
    this.maxSize = maxSize;
  }

  log(params: {
    tick: number;
    type: SimulationEventType;
    message: string;
    entityId?: string;
    secondaryId?: string;
    location?: { x: number; y: number };
  }): SimulationEvent {
    this.eventCounter++;
    const event: SimulationEvent = {
      id: `evt_${params.tick}_${this.eventCounter}`,
      tick: params.tick,
      type: params.type,
      message: params.message,
      entityId: params.entityId,
      secondaryId: params.secondaryId,
      location: params.location,
    };

    this.events.push(event);
    if (this.events.length > this.maxSize) {
      this.events.shift(); // keep within bounded buffer
    }

    return event;
  }

  getEvents(limit?: number): ReadonlyArray<SimulationEvent> {
    if (limit === undefined || limit >= this.events.length) {
      return [...this.events];
    }
    return this.events.slice(this.events.length - limit);
  }

  getEventsByType(type: SimulationEventType, limit?: number): ReadonlyArray<SimulationEvent> {
    const filtered = this.events.filter((e) => e.type === type);
    if (limit === undefined || limit >= filtered.length) {
      return filtered;
    }
    return filtered.slice(filtered.length - limit);
  }

  clear(): void {
    this.events.length = 0;
    this.eventCounter = 0;
  }
}
