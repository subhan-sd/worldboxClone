import type { Individual, SocialGroup, ResourceStock } from '../models/simulation-types';
import type { IRandom } from '../random/seeded-rng';

export class SocialGroupSystem {
  /**
   * Creates a new social group with the founder as the initial member and leader.
   */
  static createGroup(
    id: string,
    name: string,
    founder: Individual,
    homeTile?: { x: number; y: number }
  ): SocialGroup {
    const group: SocialGroup = {
      id,
      name,
      memberIds: [founder.id],
      leaderId: founder.id,
      sharedInventory: { food: 0, wood: 0, stone: 0 },
      homeTile: homeTile || { x: founder.x, y: founder.y },
      status: 'nomad',
    };

    founder.groupId = id;
    return group;
  }

  /**
   * Adds an individual to an existing social group, enforcing 2-way membership sync.
   */
  static addMember(group: SocialGroup, member: Individual): boolean {
    if (!member.isAlive || member.groupId !== undefined) {
      return false;
    }

    if (!group.memberIds.includes(member.id)) {
      group.memberIds.push(member.id);
    }
    member.groupId = group.id;
    return true;
  }

  /**
   * Removes an individual from a social group and updates group status if empty.
   */
  static removeMember(group: SocialGroup, member: Individual): void {
    const idx = group.memberIds.indexOf(member.id);
    if (idx !== -1) {
      group.memberIds.splice(idx, 1);
    }

    if (member.groupId === group.id) {
      member.groupId = undefined;
    }

    if (group.leaderId === member.id) {
      group.leaderId = group.memberIds.length > 0 ? group.memberIds[0] : undefined;
    }

    if (group.memberIds.length === 0) {
      group.status = 'disbanded';
    }
  }

  /**
   * Checks unassigned individuals in close proximity and forms a new group if >= 2 individuals bond.
   */
  static evaluateGroupFormation(
    unassigned: Individual[],
    groupId: string,
    name: string,
    maxDistance: number = 3.0
  ): SocialGroup | null {
    if (unassigned.length < 2) return null;

    const founder = unassigned[0];
    const candidates: Individual[] = [founder];

    for (let i = 1; i < unassigned.length; i++) {
      const other = unassigned[i];
      const dx = founder.x - other.x;
      const dy = founder.y - other.y;
      if (dx * dx + dy * dy <= maxDistance * maxDistance) {
        candidates.push(other);
      }
    }

    if (candidates.length >= 2) {
      const group = SocialGroupSystem.createGroup(
        groupId,
        name,
        founder,
        { x: founder.x, y: founder.y }
      );
      for (let j = 1; j < candidates.length; j++) {
        SocialGroupSystem.addMember(group, candidates[j]);
      }
      return group;
    }

    return null;
  }

  /**
   * Deposits resources into shared group storage.
   */
  static depositResource(
    group: SocialGroup,
    type: keyof ResourceStock,
    amount: number
  ): void {
    if (amount <= 0) return;
    group.sharedInventory[type] += amount;
  }

  /**
   * Withdraws resources from shared group storage, ensuring no negative values.
   */
  static withdrawResource(
    group: SocialGroup,
    type: keyof ResourceStock,
    amount: number
  ): number {
    if (amount <= 0) return 0;
    const current = group.sharedInventory[type];
    const withdrawn = Math.min(current, amount);
    group.sharedInventory[type] = Math.max(0, current - withdrawn);
    return withdrawn;
  }

  /**
   * Cleans dead members from group and updates group status.
   */
  static cleanupDeadMembers(
    group: SocialGroup,
    individualsMap: Map<string, Individual>
  ): void {
    const aliveMembers: string[] = [];
    for (let i = 0; i < group.memberIds.length; i++) {
      const mId = group.memberIds[i];
      const ind = individualsMap.get(mId);
      if (ind && ind.isAlive) {
        aliveMembers.push(mId);
      } else if (ind) {
        ind.groupId = undefined;
      }
    }

    group.memberIds = aliveMembers;
    if (group.leaderId && !aliveMembers.includes(group.leaderId)) {
      group.leaderId = aliveMembers.length > 0 ? aliveMembers[0] : undefined;
    }

    if (group.memberIds.length === 0) {
      group.status = 'disbanded';
    }
  }
}
