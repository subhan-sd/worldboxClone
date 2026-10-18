import type { SimTile } from '../models/simulation-types';
import { TileGrid } from '../models/tile-grid';

export interface GridCoord {
  x: number;
  y: number;
}

export class NavigationSystem {
  /**
   * Finds the nearest traversable tile satisfying `predicate` using breadth-first expansion.
   */
  static findNearestTile(
    grid: TileGrid,
    startX: number,
    startY: number,
    predicate: (tile: SimTile) => boolean,
    maxRadius: number = 25
  ): SimTile | null {
    const startTile = grid.get(startX, startY);
    if (startTile && predicate(startTile)) {
      return startTile;
    }

    const queue: GridCoord[] = [{ x: startX, y: startY }];
    const visited = new Uint8Array(grid.width * grid.height);
    const startIdx = startY * grid.width + startX;
    if (grid.inBounds(startX, startY)) {
      visited[startIdx] = 1;
    }

    const maxDistSq = maxRadius * maxRadius;

    while (queue.length > 0) {
      const current = queue.shift()!;
      const dx = current.x - startX;
      const dy = current.y - startY;
      if (dx * dx + dy * dy > maxDistSq) continue;

      const neighbors = grid.getNeighbors(current.x, current.y, false);
      for (let i = 0; i < neighbors.length; i++) {
        const n = neighbors[i];
        const nIdx = n.y * grid.width + n.x;
        if (visited[nIdx]) continue;
        visited[nIdx] = 1;

        if (n.traversable) {
          if (predicate(n)) {
            return n;
          }
          queue.push({ x: n.x, y: n.y });
        }
      }
    }

    return null;
  }

  /**
   * Finds the next step towards a target coordinate using BFS.
   * Returns null if already at target or unreachable.
   */
  static getNextStepTowards(
    grid: TileGrid,
    startX: number,
    startY: number,
    targetX: number,
    targetY: number,
    maxDepth: number = 30
  ): GridCoord | null {
    if (startX === targetX && startY === targetY) {
      return null;
    }

    const targetTile = grid.get(targetX, targetY);
    if (!targetTile || !targetTile.traversable) {
      // If target itself is not traversable, find nearest traversable neighbor
      const adj = grid.getNeighbors(targetX, targetY, false).filter((t) => t.traversable);
      if (adj.length === 0) return null;
      // pick closest adjacent tile
      adj.sort((a, b) => {
        const da = (a.x - startX) ** 2 + (a.y - startY) ** 2;
        const db = (b.x - startX) ** 2 + (b.y - startY) ** 2;
        return da - db;
      });
      targetX = adj[0].x;
      targetY = adj[0].y;
    }

    const queue: { x: number; y: number; firstStep: GridCoord; depth: number }[] = [];
    const visited = new Uint8Array(grid.width * grid.height);
    const startIdx = startY * grid.width + startX;
    visited[startIdx] = 1;

    // Initialize queue with immediate neighbors
    const neighbors = grid.getNeighbors(startX, startY, false);
    for (let i = 0; i < neighbors.length; i++) {
      const n = neighbors[i];
      if (n.traversable) {
        if (n.x === targetX && n.y === targetY) {
          return { x: n.x, y: n.y };
        }
        const nIdx = n.y * grid.width + n.x;
        visited[nIdx] = 1;
        queue.push({
          x: n.x,
          y: n.y,
          firstStep: { x: n.x, y: n.y },
          depth: 1,
        });
      }
    }

    // BFS search
    while (queue.length > 0) {
      const curr = queue.shift()!;
      if (curr.depth >= maxDepth) continue;

      const nextNeighbors = grid.getNeighbors(curr.x, curr.y, false);
      for (let i = 0; i < nextNeighbors.length; i++) {
        const n = nextNeighbors[i];
        if (!n.traversable) continue;

        if (n.x === targetX && n.y === targetY) {
          return curr.firstStep;
        }

        const nIdx = n.y * grid.width + n.x;
        if (!visited[nIdx]) {
          visited[nIdx] = 1;
          queue.push({
            x: n.x,
            y: n.y,
            firstStep: curr.firstStep,
            depth: curr.depth + 1,
          });
        }
      }
    }

    return null;
  }
}
