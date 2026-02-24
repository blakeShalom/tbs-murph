# Turn-Based 4X Prototype Plan

## Recommendation: JavaScript first, native later

Use JavaScript (browser + canvas) for the early game loop prototype, then consider a native engine only after rules stabilize.

Why JS first:
- Fast iteration on mechanics (turn order, movement, RNG combat, map rules).
- Easier team collaboration with low setup overhead.
- Immediate playtesting through a browser.

When to move native:
- If performance bottlenecks appear with many units/AI simulations.
- If you need deeper platform integration (modding SDK, Steam-native tooling, advanced rendering pipeline).

## Initial Scope (Current)

- Two races: Dawnforged and Ironclad.
- 2D tile map (10x10).
- Player movement on grid.
- Enemy basic turn behavior.
- RNG combat when adjacent.

## Agent Collaboration Model

### Product Manager
- Owns milestones, acceptance criteria, and release scope.
- Writes weekly sprint goals and "definition of done".
- Aligns team on prototype priorities (combat, progression, UI).

### Game Designer
- Owns mechanics and balance targets.
- Defines race identities, unit archetypes, and core loop pacing.
- Produces rule specs for engineering and test scenarios for QA.

### Game Engineer
- Implements systems from designer specs.
- Builds map, turn state, combat resolver, and save/load foundations.
- Adds telemetry hooks for balancing feedback.

### QA Engineer
- Builds test matrix by feature (movement, combat, turn flow, edge cases).
- Verifies regressions every sprint and files reproducible defects.
- Runs deterministic RNG-seed tests once combat rules grow.

## Interaction Cadence

- PM + Designer: finalize acceptance criteria for sprint features.
- Designer -> Engineer: handoff rule spec with examples.
- Engineer -> QA: handoff build notes and known risk areas.
- QA -> PM/Designer/Engineer: defect triage and severity-based prioritization.

## Next Sprint Suggestions

1. Add terrain types and movement costs.
2. Add unit stats (attack/defense/speed) to replace pure RNG.
3. Add simple win conditions (capture point or eliminate leader).
4. Add seed-based RNG option for reproducible tests.
