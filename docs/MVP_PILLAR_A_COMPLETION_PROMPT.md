# Living World — MVP Pillar A Completion Mission

> **Objective:** Complete MVP Pillar A (World & Environment) in the existing repository with a coherent, testable simulation—not merely a UI that looks finished.

## Role

Act as the Senior Gameplay Simulation Engineer and Technical Lead for **Living World**, a fantasy sandbox simulation inspired by WorldBox and emergent-world simulation games.

Work directly in the current repository. Inspect the code, implement the changes, run the available checks, fix regressions, and report actual results. Do not stop after producing a plan or code snippets. **Never claim completion for work that has not been implemented and verified.**

## 1. Non-negotiable engineering principles

1. The simulation core is the source of truth. UI and renderer reflect simulation state; they must not invent gameplay outcomes.
2. Preserve the existing architecture and conventions. Do not rewrite the project or replace its simulation engine.
3. Prefer small, coherent changes over broad refactors.
4. Keep simulation logic independent of Angular components and rendering code wherever the existing architecture permits.
5. Preserve deterministic world generation for identical seeds and configuration.
6. Keep state consistent across terrain changes, resource updates, pause/resume, time progression, and save/load.
7. Avoid unnecessary dependencies and asset downloads. Reuse existing systems and assets where appropriate.
8. Do not add placeholder implementations, fake weather effects, decorative calendar values, or UI-only simulation logic.
9. Preserve existing functionality unless a change is required to correct a verified defect.
10. Do not merge PRs, push destructive changes, rewrite Git history, or overwrite unrelated user changes without explicit authorization.

## 2. Repository reconnaissance — do this first

Before modifying files:

- Inspect the current branch, working tree, recent commits, and project structure.
- Read `package.json`, README, simulation models, world generation, resource systems, simulation engine, simulation bridge, rendering/UI components, persistence implementation, and existing tests.
- Inspect the existing terrain-integrity PR and its full diff if accessible. Determine whether its changes are already present in the current working tree or only on a separate branch.
- Identify the real scripts for testing, type-checking, and building. Do not assume a command exists before checking.
- Run baseline checks when practical. Record pre-existing failures separately from regressions.
- Never discard uncommitted changes or blindly overwrite work from another branch.

Relevant starting points may include:

- `src/simulation/models/`
- `src/simulation/systems/`
- `src/simulation/engine/`
- `src/services/simulation-bridge.service.ts`
- Existing Angular UI, toolbar, renderer, persistence, and simulation tests

Adapt to the actual repository; these paths are not a guarantee that every file exists.

After reconnaissance, write a short prioritized task list and immediately start implementing. Do not stop at analysis.

## 3. Definition of Done — MVP Pillar A

### A1. World foundation and generation

- [ ] Grid dimensions, tile coordinates, and tile lookup remain consistent.
- [ ] Terrain IDs and rules use one authoritative definition.
- [ ] Every terrain type has explicit traversability, fertility, and resource-capacity rules appropriate to the existing design.
- [ ] Terrain generation initializes valid tile state.
- [ ] Identical seeds and identical generation settings produce equivalent worlds.
- [ ] Different seeds can produce meaningfully different worlds.
- [ ] Invalid coordinates and unsupported terrain values are handled safely.
- [ ] Existing generation and rendering behavior remain functional.

Do not invent a new terrain taxonomy if the project already has one. Reconcile existing types and names first.

### A2. Biomes, resources, and world interaction

#### Terrain and resources

- [ ] Resource stocks never become negative or exceed their defined capacities.
- [ ] Harvesting and consumption update authoritative simulation state.
- [ ] Regeneration follows terrain suitability, resource type, and configured limits.
- [ ] Unsuitable terrain cannot regenerate resources that should not exist there.
- [ ] Terrain changes apply the correct rules and update dependent state.
- [ ] Terrain changes do not silently create or destroy resources outside documented rules.
- [ ] Terrain edits update water access, traversability, fertility, and other derived properties.
- [ ] Resource display and interactions remain synchronized with simulation state.

Review existing terrain-integrity changes carefully. Correct incomplete or unsafe implementations rather than duplicating them.

#### Biomes

Implement a small but functional biome system using the existing architecture.

- [ ] Biome is stored in simulation state, not inferred only by the renderer.
- [ ] Biome assignment is deterministic for identical world inputs.
- [ ] Start with a small number of meaningful biomes supported by existing terrain and climate capabilities.
- [ ] Biomes affect at least one real mechanic, such as terrain compatibility, fertility, vegetation suitability, or resource availability.
- [ ] Generation or a dedicated generation pass assigns biomes consistently.
- [ ] UI/inspector can identify a tile's biome.

Prefer three working biomes over dozens of labels without gameplay consequences.

### A3. Climate, weather, and seasons

Implement a minimal but real climate/weather foundation.

- [ ] Climate/weather state exists in the simulation model.
- [ ] State advances through a deterministic time-based update mechanism.
- [ ] Support a practical initial set of states, such as clear, rain, and drought, if compatible with the current design.
- [ ] Weather affects at least one actual simulation mechanic, such as soil moisture, fertility, water availability, or resource regeneration.
- [ ] Weather transitions follow defined rules and do not change randomly on every render frame.
- [ ] Current weather and relevant climate state can be inspected in the UI.
- [ ] Pause and simulation-speed controls affect weather progression consistently with simulation ticks.

Connect seasons to the calendar and actual rules where feasible. Do not build a full meteorological model for this MVP.

### A4. Ecology and natural events

Implement a minimal ecosystem loop with measurable simulation effects.

- [ ] Vegetation or another existing renewable natural resource can grow, spread, or regenerate according to environmental suitability.
- [ ] Growth is bounded by terrain suitability and resource capacity.
- [ ] At least one natural event has a real trigger, state transition, and measurable world effect.
- [ ] Choose an event compatible with the current architecture, such as drought, a storm, or a vegetation-related event.
- [ ] Events have a start and a duration or resolution condition.
- [ ] Cooldowns or equivalent safeguards prevent events from triggering every tick.
- [ ] Event outcomes are stored in simulation state and reflected in the renderer or inspector.
- [ ] Tests cover event triggering, effects, and resolution.

Keep event frequency configurable and deterministic. Avoid unnecessary complexity when systems overlap.

### A5. God tools, simulation control, calendar, observability, and persistence

#### Simulation controls and terrain tools

- [ ] Pause/resume behaves correctly.
- [ ] Speed controls affect simulation progression, not merely animation.
- [ ] Simulation state does not advance while paused.
- [ ] Terrain tools update authoritative simulation state.
- [ ] Relevant derived values are recalculated after edits.

#### In-world calendar

Implement a real simulation calendar connected to the actual tick lifecycle and toolbar.

Initial configurable defaults:

- 20 simulation ticks = 1 in-world day.
- 30 in-world days = 1 in-world month.
- 12 in-world months = 1 in-world year.
- Under these defaults, 7,200 simulation ticks = 1 in-world year.

Requirements:

- [ ] Use a dedicated calendar/time model or equivalent clean abstraction.
- [ ] Advance time only when simulation ticks actually execute.
- [ ] Derive day, month, and year from one authoritative time value.
- [ ] Display the current in-world date in the toolbar.
- [ ] Keep wall-clock time separate from in-world calendar time.
- [ ] Pause freezes the calendar.
- [ ] Speed changes how quickly the calendar advances in real time, not the conversion rules.
- [ ] Calendar configuration is centralized rather than scattered as magic numbers.
- [ ] Tests cover day, month, and year rollover, pause, and speed behavior.
- [ ] Calendar state is persisted and restored.

Use a clearly documented initial date and consistent indexing. Prevent off-by-one errors at day/month/year boundaries.

#### Observability

- [ ] Provide a practical way to inspect terrain, biome, resources, fertility, weather, and relevant environmental state using existing UI/inspector patterns.
- [ ] Show the in-world date and weather where practical.
- [ ] Displayed values originate from simulation state.
- [ ] Prefer existing UI patterns over building a large new dashboard.

#### Save/load

Inspect the actual persistence implementation before changing it.

- [ ] Persist terrain, resources, biome/environment state, calendar, weather, and active natural-event state when those systems are part of the save format.
- [ ] Loading restores a valid simulation state and does not reset the calendar or silently regenerate saved world state.
- [ ] Validate or migrate old saves when practical.
- [ ] Add round-trip tests: save state, load state, compare relevant simulation data.
- [ ] Do not mark persistence complete unless the relevant tests actually pass.

## 4. Implementation order

### Phase 1 — Stabilize the foundation

1. Verify and repair terrain invariants.
2. Verify resource stock, harvesting, and regeneration consistency.
3. Verify terrain tools update all required simulation properties.
4. Inspect and test save/load behavior.
5. Repair existing tests and add regression tests.

### Phase 2 — Complete the world-time loop

1. Implement the calendar model.
2. Integrate it into the actual simulation tick lifecycle.
3. Display the date in the toolbar.
4. Verify pause, speed, save/load, and rollover behavior.

### Phase 3 — Make the environment alive

1. Implement a minimal real biome model.
2. Connect weather/climate to time and environmental effects.
3. Implement bounded ecological growth or regeneration.
4. Implement at least one functional natural event.
5. Expose relevant state through the existing UI/inspector.

### Phase 4 — Verify and clean up

1. Run all relevant simulation tests.
2. Run the available type-check.
3. Run the production build.
4. Fix regressions introduced by the changes.
5. Inspect the final diff for accidental scope expansion.
6. Report remaining defects and incomplete work honestly.

Do not skip verification to make the task appear finished.

## 5. Testing requirements

Use the commands actually defined in `package.json` and the existing test configuration.

At minimum, cover:

- Deterministic world generation from the same seed.
- Terrain-rule consistency across generation and terrain editing.
- Resource capacity, harvesting, and regeneration invariants.
- Calendar rollover and pause behavior.
- Weather/environment progression and its actual effects.
- Natural-event trigger, effect, and resolution.
- Save/load round-trip for implemented environmental state.
- Existing functionality affected by the changes.

For every failed check:

1. Capture the actual failure.
2. Determine whether it existed before the changes.
3. Fix failures caused by the changes.
4. Retry the relevant check.
5. Report pre-existing or unresolved failures clearly.

Do not weaken or delete tests just to get a green result. Never report a test as passing unless its command completed successfully.

## 6. Scope and trade-offs

The objective is a **complete, coherent MVP**, not a finished commercial game.

Prioritize:

1. Simulation correctness and state invariants.
2. Functional calendar and simulation controls.
3. Real biome/environment interactions.
4. Minimal working ecology and natural events.
5. UI visibility and renderer synchronization.
6. Additional polish only after verification.

Do not spend this session on unrelated features, new asset packs, large rendering rewrites, advanced genetics, civilization simulation, magic systems, or extensive visual polish.

If time is constrained, reduce feature breadth while preserving correctness. Prefer three functional biomes and one working natural event over ten inert biomes and several decorative events.

Do not leave half-integrated systems that break the build. If a feature cannot be completed safely, keep the codebase buildable, document the limitation, and identify the smallest remaining task.

## 7. Git and delivery

- Work on an appropriate feature branch and respect the current branch and uncommitted changes.
- Inspect the existing terrain-integrity PR before creating overlapping implementation work.
- Make coherent commits when appropriate.
- Do not merge PRs or push to protected branches without explicit authorization.
- Do not claim remote CI passed unless its result was actually inspected.
- Do not claim code was run locally unless it was actually run.

At the end, provide a concise report containing:

1. **Implemented:** systems and behavior actually completed.
2. **Files changed:** important files and their purpose.
3. **Tests:** exact commands and actual pass/fail results.
4. **Build/type-check:** exact commands and outcomes.
5. **Pillar A checklist:** DONE, PARTIAL, or NOT DONE for A1 through A5.
6. **Known limitations:** defects, shortcuts, or missing behavior.
7. **Next action:** the single highest-priority remaining task, if any.

## Final instruction

Begin by inspecting the repository and current working state. Then implement the highest-priority missing requirements in the order above.

**Do not stop at analysis, do not merely generate code snippets, do not fake results, and do not declare Pillar A complete until implementation and verification evidence support that conclusion.**
