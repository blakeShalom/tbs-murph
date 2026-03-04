Original prompt: [$develop-web-game](/Users/belling/.codex/skills/develop-web-game/SKILL.md) - use this skill to evaluate the current structure and setup of the game and suggest structural improvements and use Playwright to test.

- Initialized progress tracking for skill-driven web game evaluation.
- Next: verify Playwright client/action payloads, add state hooks if needed, run automated interaction checks.

- Added web-game testing hooks to `game.js`: `window.render_game_to_text` and `window.advanceTime(ms)`.
- Replaced enemy delayed actions with schedulable tasks so `advanceTime` can trigger pending actions deterministically.
- Next: install Playwright dependency and execute skill Playwright client against local server.

- Verified Playwright prerequisites: `npx` available.
- Installed local `playwright` dependency and Chromium browser binary.
- Next: launch local web server, run skill Playwright client with action bursts, inspect screenshots and text-state outputs.

- Added deterministic-friendly keyboard controls in runtime: `Enter` end turn, `Space` attack, `B` debug combat start.
- Guarded movement handlers to ignore non-arrow keys, preventing accidental MP consumption from non-move inputs.

- Installed and used required skill Playwright client: `/Users/belling/.codex/skills/develop-web-game/scripts/web_game_playwright_client.js`.
- Playwright artifacts captured:
  - `output/web-game/map/shot-0.png`, `output/web-game/map/state-0.json`
  - `output/web-game/combat/shot-0.png`, `output/web-game/combat/state-0.json`
  - retries under `output/web-game/combat-retry-*`
- No runtime console-error artifact files were produced by the client (no new console/page errors captured).
- Visual inspection complete: map terrain renders correctly with both avatars visible; combat terrain renders correctly and reflects winner by removing defeated unit.

Findings:
- Combat currently resolves to elimination on the first attack roll; because starting distance > player combat MP, enemy gets the first attack after player end-turn. This can make player attack input effectively unreachable in many runs.
- Runtime architecture is split between legacy `game.js` (actual entrypoint) and modular `src/` runtime (not currently loaded by `index.html`), creating drift risk.

TODO / suggestions for next agent:
- Unify runtime to one source of truth (prefer `src/` + bundler/dev server), and keep `index.html` loading that path.
- Replace one-shot combat resolution with damage-per-hit + multiple rounds so movement, terrain, and attack sequencing all matter.
- Extend Playwright scenarios to include deterministic seeded RNG and explicit player-attack assertions.
- Add `.gitignore` entries for `node_modules/` and `output/` to keep test artifacts out of commits.

- Added `.gitignore` exclusions for `node_modules/` and `output/` artifact directories.

- Implemented stack-based runtime in `game.js`.
  - Each side now starts with random stack size (1-8).
  - Map token renders stack count as subscript (`Dₙ` / `Iₙ`).
  - Combat deploys all alive stack units on tactical map.
  - Each combat unit has its own movement points and moves independently.
  - Added player unit cycling key (`A`) during combat.
- Preserved and updated automation hooks: `render_game_to_text` and deterministic `advanceTime(ms)`.

- Ran Playwright stack scenarios:
  - `output/web-game/stack-map/*` confirmed map stack subscripts render and stack counts appear in text state.
  - `output/web-game/stack-combat/*` confirmed multiple units per side deploy on combat map and track per-unit MP/state.
- No `errors-0.json` produced in these runs (no new console/page errors captured).
- Updated HUD hint text to include stack/combat controls (`A`, arrows, `Space`, `Enter`).

TODO/suggestions:
- Mirror stack runtime changes into `src/` modules to remove divergence from `game.js`.
- Add deterministic seed support for stack-size and per-unit MP generation to make Playwright scenarios reproducible.

- Added stat-based combat model in `game.js`.
  - Unit stats now include: HP (up to 30), ATK, DMG, ARM, EVA (1-20 where applicable).
  - Replaced elimination-vs-elimination roll with strike resolution:
    - Base hit chance 70%, modified by attacker ATK vs defender EVA.
    - Hit chance clamped to 10%-95%.
    - Raw damage rolls from 1..DMG.
    - Armor absorbs up to 80% of raw damage until depleted; remainder hits HP.
    - Defender does not counterattack immediately; attacks only happen on side turn.
- Added tooltip UI shell in `index.html` + `styles.css` and hover wiring in `game.js` for map stacks and combat units.
- Added side-prefixed unit naming (`P-...` / `C-...`) in combat/status text to avoid ambiguity when both sides pick the same race.

Validation runs for this feature:
- Unit tests: `npm test` (33/33 passing).
- Skill Playwright client runs:
  - `output/web-game/stats-map-idle/`
  - `output/web-game/stats-map-tooltip/`
  - `output/web-game/stats-combat-tooltip/`
  - `output/web-game/stats-combat-tooltip-2/`
  - No `errors-0.json` generated in these runs.
- Additional full-page Playwright verification (DOM tooltip visibility and content):
  - `output/web-game/stats-tooltip-dom/map-tooltip.png`
  - `output/web-game/stats-tooltip-dom/combat-tooltip.png`
  - `output/web-game/stats-tooltip-dom/tooltip-check.json` (both `hidden: false`).
- Focused combat behavior check:
  - `output/web-game/stats-combat-check/combat-check.json`
  - Confirmed no immediate retaliation on player attack in same action (attacker HP unchanged immediately after strike).

TODO / follow-ups:
- Current `tests/` cover modular `src/` runtime, not the active `game.js` entrypoint; add tests around stat formulas and tooltip payloads if `game.js` remains the source of truth.
- Consider truncating map stack tooltip lines for very large stacks on smaller screens.
- Post-tweak verification: reran `output/web-game/stats-combat-tooltip-2/` via skill client and reran `npm test` (33 passing) after unit-name clarity update.
- Added combat-stat unit test coverage with new pure helper module:
  - New module: `src/systems/combatStats.js`
  - New tests: `tests/combat_stats.test.js`
  - Covered: base hit chance, clamp bounds (10%/95%), miss behavior, 80% armor absorption cap, low-armor spillover, elimination, no immediate retaliation, damage range.
- Verification:
  - `npm test` now passes with 42 total tests.
  - Ran skill Playwright smoke loop after test additions: `output/web-game/tests-smoke/` with no `errors-0.json`.
- Adjusted combat damage model per feedback:
  - Damage roll is now high-biased (exponential curve) up to max damage.
  - Damage routing uses 80/20 split: 80% targets armor, 20% always targets HP; if armor cannot absorb its share, overflow spills into HP.
- Added visible movement stat in tooltips (`MOV`).
  - Map tooltip shows `MOV <max>`.
  - Combat tooltip shows `MOV <current>/<max>`.
- Added combat action log panel in HUD (`#combatLog`) and consolidated attack detail output there for both player and enemy turns.
- Added combat log to text-state output as `combatLog`.

Validation:
- Unit tests: `npm test` passing (44 tests).
- Skill Playwright client run: `output/web-game/combat-log-smoke/` with no `errors-0.json`.
- Focused full-page Playwright check for combat log + both-turn entries:
  - `output/web-game/combat-log-dom/full.png`
  - `output/web-game/combat-log-dom/state.json`
  - `output/web-game/combat-log-dom/log.txt`
