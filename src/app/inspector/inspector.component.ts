import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  SimulationBridgeService,
  type FamilyResult,
  type WorldTimeInfo,
} from '../../services/simulation-bridge.service';
import type {
  Individual,
  SocialGroup,
  Settlement,
  SimulationEvent,
  SimulationStatistics,
} from '../../simulation/models/simulation-types';

export type InspectorTab =
  | 'people'
  | 'families'
  | 'clans'
  | 'settlements'
  | 'history'
  | 'stats';

interface NavState {
  tab: InspectorTab;
  id?: string;
}

@Component({
  selector: 'app-inspector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inspector.component.html',
  styleUrl: './inspector.component.css',
})
export class InspectorComponent implements OnInit, OnChanges {
  @Input() activeTab: InspectorTab = 'people';
  @Input() selectedId?: string;

  @Output() tabChange = new EventEmitter<InspectorTab>();
  @Output() locate = new EventEmitter<{ x: number; y: number }>();
  @Output() close = new EventEmitter<void>();

  // Navigation history for Back button
  private navHistory: NavState[] = [];

  // People Filters
  peopleSearch: string = '';
  peopleStatusFilter: 'all' | 'alive' | 'deceased' = 'all';
  peopleStageFilter: 'all' | 'child' | 'adult' | 'elder' = 'all';
  peopleSortBy: 'name' | 'age' | 'health' | 'hunger' = 'age';

  // History Filter
  historyTypeFilter: string = 'all';

  // Details expand toggles
  showGenome: boolean = false;

  constructor(public simBridge: SimulationBridgeService) {}

  ngOnInit(): void {
    if (!this.selectedId) {
      const all = this.simBridge.getAllIndividuals();
      if (all.length > 0) {
        this.selectedId = all[0].id;
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activeTab'] && !changes['activeTab'].firstChange) {
      this.pushHistory(this.activeTab, this.selectedId);
    }
  }

  // --- Navigation & Breadcrumb ---
  switchTab(tab: InspectorTab, entityId?: string): void {
    this.pushHistory(this.activeTab, this.selectedId);
    this.activeTab = tab;
    if (entityId) {
      this.selectedId = entityId;
    }
    this.tabChange.emit(this.activeTab);
  }

  selectEntity(tab: InspectorTab, id: string): void {
    this.pushHistory(this.activeTab, this.selectedId);
    this.activeTab = tab;
    this.selectedId = id;
    this.tabChange.emit(this.activeTab);
  }

  pushHistory(tab: InspectorTab, id?: string): void {
    this.navHistory.push({ tab, id });
    if (this.navHistory.length > 20) {
      this.navHistory.shift();
    }
  }

  canGoBack(): boolean {
    return this.navHistory.length > 0;
  }

  goBack(): void {
    const prev = this.navHistory.pop();
    if (prev) {
      this.activeTab = prev.tab;
      this.selectedId = prev.id;
      this.tabChange.emit(this.activeTab);
    }
  }

  onClose(): void {
    this.close.emit();
  }

  // --- World Time ---
  getWorldTime(): WorldTimeInfo {
    return this.simBridge.getWorldTime();
  }

  // --- People Queries ---
  get filteredIndividuals(): Individual[] {
    const q = this.peopleSearch.trim().toLowerCase();
    const list = this.simBridge.getAllIndividuals().filter((ind) => {
      if (this.peopleStatusFilter === 'alive' && !ind.isAlive) return false;
      if (this.peopleStatusFilter === 'deceased' && ind.isAlive) return false;
      if (this.peopleStageFilter !== 'all' && ind.lifeStage !== this.peopleStageFilter) return false;
      if (q) {
        const matchesName = ind.name.toLowerCase().includes(q);
        const matchesId = ind.id.toLowerCase() === q || ind.id.toLowerCase().includes(q);
        if (!matchesName && !matchesId) return false;
      }
      return true;
    });

    return list.sort((a, b) => {
      if (this.peopleSortBy === 'name') return a.name.localeCompare(b.name);
      if (this.peopleSortBy === 'age') return b.age - a.age;
      if (this.peopleSortBy === 'health') return b.health - a.health;
      if (this.peopleSortBy === 'hunger') return b.hunger - a.hunger;
      return 0;
    });
  }

  get selectedIndividual(): Individual | undefined {
    if (!this.selectedId) {
      const all = this.simBridge.getAllIndividuals();
      return all.length > 0 ? all[0] : undefined;
    }
    return this.simBridge.getIndividualById(this.selectedId);
  }

  get selectedFamily(): FamilyResult | null {
    const ind = this.selectedIndividual;
    if (!ind) return null;
    return this.simBridge.getFamilyForIndividual(ind.id);
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.peopleSearch = input.value;
  }

  onStatusFilterChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.peopleStatusFilter = select.value as 'all' | 'alive' | 'deceased';
  }

  onStageFilterChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.peopleStageFilter = select.value as 'all' | 'child' | 'adult' | 'elder';
  }

  onSortChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.peopleSortBy = select.value as 'name' | 'age' | 'health' | 'hunger';
  }

  // --- Locate Handler ---
  onLocate(x?: number, y?: number): void {
    if (x !== undefined && y !== undefined) {
      this.locate.emit({ x, y });
    }
  }

  // --- Groups / Clans ---
  get allGroups(): SocialGroup[] {
    return this.simBridge.getAllGroups();
  }

  get selectedGroup(): SocialGroup | undefined {
    if (this.selectedId) {
      const g = this.simBridge.getGroupById(this.selectedId);
      if (g) return g;
    }
    const groups = this.allGroups;
    return groups.length > 0 ? groups[0] : undefined;
  }

  getGroupLivingMembers(groupId: string): Individual[] {
    return this.simBridge.getGroupLivingMembers(groupId);
  }

  getGroupLeader(leaderId?: string): Individual | undefined {
    return leaderId ? this.simBridge.getIndividualById(leaderId) : undefined;
  }

  // --- Settlements ---
  get allSettlements(): Settlement[] {
    return this.simBridge.getAllSettlements();
  }

  get selectedSettlement(): Settlement | undefined {
    if (this.selectedId) {
      const s = this.simBridge.getSettlementById(this.selectedId);
      if (s) return s;
    }
    const settlements = this.allSettlements;
    return settlements.length > 0 ? settlements[0] : undefined;
  }

  getSettlementResidents(settlementId: string): Individual[] {
    return this.simBridge.getSettlementResidents(settlementId);
  }

  // --- History & Events ---
  get filteredEvents(): ReadonlyArray<SimulationEvent> {
    const events = this.simBridge.getEvents();
    const sorted = [...events].reverse();
    if (this.historyTypeFilter === 'all') return sorted;
    return sorted.filter((e) => e.type.startsWith(this.historyTypeFilter));
  }

  onHistoryFilterChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.historyTypeFilter = select.value;
  }

  // --- World Stats ---
  get stats(): SimulationStatistics {
    return this.simBridge.getSafeStats();
  }
}
