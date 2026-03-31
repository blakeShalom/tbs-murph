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

- Added first race artwork pass for a new race: `Centaur Clans`.
  - Setup screen now includes dedicated race preview canvases for player/computer selections.
  - Implemented HOMM3-inspired centaur archer painted art renderer for setup preview and a dedicated compact token renderer for map scale.
  - Integrated map token drawing to use race mini-art for centaur stacks while preserving stack-count overlays.
- UI updates:
  - Added setup preview layout in `index.html` and styling in `styles.css`.
  - Kept previews single-column in setup panel so artwork remains legible.
- Validation runs:
  - Skill Playwright client (required):
    - `output/web-game/centaur-art-setup/shot-0.png`, `state-0.json`
    - `output/web-game/centaur-art-map/shot-0.png`, `shot-1.png`, `state-0.json`, `state-1.json`
    - No `errors-*.json` produced in these runs.
  - Additional full-page Playwright verification with explicit race selection:
    - `output/web-game/centaur-art-check/setup-centaur.png`
    - `output/web-game/centaur-art-check/map-centaur.png`
    - `output/web-game/centaur-art-check/state.json` (player race confirmed as `Centaur Clans`).
  - Regression tests: `npm test` passing (44/44).

TODO / follow-ups:
- Add race-specific art for remaining races to avoid mixed quality between centaur and generic heraldic placeholders.
- Add a setup control to preview random race art roll (currently random uses a dedicated "Random" card).

- Built standalone centaur unit sprite preview sheet (not wired into runtime yet, pending user approval).
  - Source art page: `art/centaur_unit_sprite_preview.html`
  - Rendered preview image: `output/web-game/centaur-unit-sprites-preview.png`
  - Units represented:
    - Recon (thin build, short bow, light sword)
    - Brute (plate armor, two-handed axe)
    - Marksman (longbow, short sword, leather armor)
    - Captain (white coat, medium armor, long axe)
- Added centaur archetype data model in runtime and random assignment at stack creation.
  - `Centaur Clans` units now randomly roll one of: Recon, Brute, Marksman, Captain.
  - Each archetype uses its own random stat ranges (HP/ATK/DMG/ARM/EVA/MOV).
  - Archetype metadata (`unitClass`, `loadout`) is now included in tooltips and `render_game_to_text` payload.
- Validation:
  - Unit tests: `npm test` passing (44/44).
  - Skill Playwright run:
    - `output/web-game/centaur-archetypes/shot-0.png`
    - `output/web-game/centaur-archetypes/shot-1.png`
    - `output/web-game/centaur-archetypes/state-0.json`
    - `output/web-game/centaur-archetypes/state-1.json`
  - In this run, `state-0.json` shows Centaur Clans roster containing mixed random archetypes (Recon/Brute/Marksman/Captain).
  - No `errors-*.json` emitted for centaur archetype run.
  - Post-tooltip text cleanup: reran `npm test` (44/44) and reran skill client (`iterations=1`) to ensure no regressions.

TODO / follow-ups:
- Wait for user approval on `output/web-game/centaur-unit-sprites-preview.png` before integrating those specific sprites into combat/unit rendering.

- Created retro pixel-art second-pass preview sheet for centaur units (higher-resolution presentation, pixel style).
  - Source page: `art/centaur_unit_sprite_preview_pixel.html`
  - Rendered preview: `output/web-game/centaur-unit-sprites-preview-pixel.png`
  - Includes Recon, Brute, Marksman, Captain with distinct weapon/armor silhouettes.
- This pass is still approval-only; not yet integrated into runtime rendering.

- Created refined retro pass: less blocky than the prior pixel pass while retaining retro readability.
  - Source page: `art/centaur_unit_sprite_preview_retro_refined.html`
  - Rendered preview: `output/web-game/centaur-unit-sprites-preview-retro-refined.png`
  - This version is pending user approval before any runtime integration.

- Created higher-detail HOMM3-inspired sprite sheet pass to increase detail density beyond retro pixel pass.
  - Source page: `art/centaur_unit_sprite_preview_homm3_detailed.html`
  - Rendered preview: `output/web-game/centaur-unit-sprites-preview-homm3-detailed.png`
  - Pending user approval before runtime integration.

- User approved HOMM3-style centaur unit art for current runtime.
- Integrated centaur combat unit sprite rendering into `game.js`.
  - Added cached sprite painter path keyed by centaur archetype (`recon`, `brute`, `marksman`, `captain`) and side.
  - Updated combat rendering to draw sprite art for centaur units and keep legacy circular tokens for non-centaur units.
  - Added selection/hover/target rings compatible with sprite rendering.
  - Added archetype metadata (`archetypeId`) into `render_game_to_text` payload for easier verification.
- Validation:
  - Unit tests: `npm test` passing (44/44).
  - Required skill Playwright client run:
    - `output/web-game/centaur-sprites-integrated-skill/shot-0.png`
    - `output/web-game/centaur-sprites-integrated-skill/state-0.json` (captured combat mode with centaur archetypes rendered)
    - No `errors-*.json` emitted in this run.
  - Additional full-page verification with forced centaur selection + debug combat start:
    - `output/web-game/centaur-homm3-integrated/combat-centaur-homm3.png`
    - `output/web-game/centaur-homm3-integrated/state.json`

TODO / follow-ups:
- When swapping to external PNG sheets later, replace `getCentaurCombatSpriteCanvas(...)` internals with image loading while keeping the same draw call site in `drawCombatUnits`.

- Updated Centaur main race portrait quality to match the approved HOMM3-style unit-art direction.
  - Replaced `drawCentaurArcherArt(...)` with a higher-detail painted scene and centered centaur archer render using the same visual language as combat sprites.
  - Preserved existing frame treatment and map token behavior.
- Validation for portrait-quality update:
  - Unit tests: `npm test` passing (44/44).
  - Required skill Playwright client runs:
    - `output/web-game/centaur-race-photo-setup-skill/shot-0.png`, `state-0.json`
    - `output/web-game/centaur-race-photo-map-skill/shot-0.png`, `state-0.json`
    - No `errors-*.json` emitted.
  - Additional full-page verification with forced centaur selection:
    - `output/web-game/centaur-race-photo-check/setup-centaur-main-race-photo.png`
    - `output/web-game/centaur-race-photo-check/map-after-race-photo-update.png`
    - `output/web-game/centaur-race-photo-check/state.json`

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

- Added Demon Horde race integration in `game.js`.
  - Race selectable in setup and map runtime (`RACE_OPTIONS` already includes `demon-horde`).
  - Added demon unit archetype generation path with random per-unit assignment + random stats at stack creation:
    - Imp, Gog, Hell Hound, Succubus, Incubus, Arch Fiend.
  - Added demon unit metadata to runtime units (`unitRaceId`, `unitClass`, `loadout`, `archetypeId`) and propagated `unitRaceId` into `render_game_to_text` payload.
  - Added Demon Horde art rendering paths:
    - Setup portrait (`drawDemonHordeArt`) with fiery red-field demon scene.
    - Map token mini-art (`drawDemonTokenArt`).
  - Added demon combat sprite renderer/caching and hooked combat draw path to route race-specific sprites for both Centaur and Demon units.

- Added art preview assets for approval flow:
  - `art/demon_unit_sprite_preview_homm3.html` (includes all 6 demon unit sprites + race background + map token).
  - `art/capture_demon_screenshots.mjs` (deterministic Playwright capture script for demon screenshots).

- Validation:
  - Unit tests: `npm test` passing (44/44).
  - Required skill Playwright client run (after changes):
    - `output/web-game/demon-horde-skill-smoke/shot-0.png`
    - `output/web-game/demon-horde-skill-smoke/state-0.json`
    - No `errors-*.json` found.
  - Additional deterministic screenshot capture:
    - `output/web-game/demon-horde-art/demon-horde-units-and-backgrounds.png`
    - `output/web-game/demon-horde-art/demon-horde-setup-screen.png`
    - `output/web-game/demon-horde-art/demon-horde-map-screen.png`
    - `output/web-game/demon-horde-art/demon-horde-combat-screen.png`
    - `output/web-game/demon-horde-art/state.json`

TODO / follow-ups:
- If user wants more detail density, replace procedural demon sprite painters with external PNG sheets while preserving current race/archetype draw routing.
- If user wants guaranteed in-combat display of all six demon archetypes at once, add a debug roster mode that seeds one of each archetype for preview battles.

- Demon sprite readability tuning pass per feedback:
  - Hell Hound silhouette updated to a clear quadruped dog profile (elongated body, muzzle/snout, four legs, tail).
  - Imp + Gog scaled down noticeably relative to other demon units and given smaller wing shapes.
  - Incubus reworked as wingless djinni-style demon with a swirling fire-vortex lower body.
  - Mirrored the same draw updates in both runtime (`game.js`) and approval preview page (`art/demon_unit_sprite_preview_homm3.html`).

Validation for this tuning pass:
- Unit tests: `npm test` passing (44/44).
- Required skill Playwright client run:
  - `output/web-game/demon-horde-size-tuning-skill/shot-0.png`
  - `output/web-game/demon-horde-size-tuning-skill/state-0.json`
  - No `errors-*.json` found.
- Updated approval screenshots regenerated:
  - `output/web-game/demon-horde-art/demon-horde-units-and-backgrounds.png`
  - `output/web-game/demon-horde-art/demon-horde-setup-screen.png`
  - `output/web-game/demon-horde-art/demon-horde-map-screen.png`
  - `output/web-game/demon-horde-art/demon-horde-combat-screen.png`

- Added `Charge` ability for Centaur `Brute` and `Captain`.
  - `Charge` is visible in tooltips as a passive ability.
  - It becomes primed after the unit spends at least half of its movement for the turn (`floor(MOV / 2)`, minimum 1).
  - Primed `Charge` adds `+2 ATK` and `+2 DMG` through the attack-profile builder so future attack types can inherit it cleanly.
  - Combat state now tracks `combatMoveSpentThisTurn`, resets it on turn refresh, and exposes `moveSpentThisTurn` in `render_game_to_text`.
- Added pure helper coverage in `src/systems/attackProfiles.js` and expanded `tests/attack_profiles.test.js` for `Charge` thresholds and bonuses.

TODO / follow-ups:
- Add a deterministic browser smoke path that can reliably force a `Brute` or `Captain` spawn so `Charge` can be exercised end-to-end in Playwright, not just through exported state and unit tests.

Validation for `Charge` pass:
- Unit tests: `npm test` passing (51/51).
- Required skill Playwright client run:
  - `output/web-game/charge-smoke/shot-0.png`
  - `output/web-game/charge-smoke/state-0.json`
  - Visual inspection complete: combat board rendered correctly after the `Start Game` + debug-combat burst; no missing units or broken HUD visible in the captured screenshot.
  - Text-state inspection confirmed `moveSpentThisTurn` is present in `render_game_to_text`.
  - No `errors-*.json` artifact was produced in this run.

TODO / suggestions:
- The smoke run landed on `Emberkin` rather than `Centaur Clans`, so browser validation covered the new movement-state export but did not naturally roll a `Brute`/`Captain` tooltip in the skill-client scenario.
- If `Charge` becomes a heavily-used mechanic, add a deterministic roster/debug seed so Playwright can force a charge-capable centaur and assert its primed state after movement.

- Implemented stack-capacity and elemental ability systems in the live runtime.
  - Base stack capacity is now `8`, with computed modifiers layered on top.
  - `Leadership` is active on Centaur `Captain` units and increases stack capacity by `+1` per captain in the stack.
  - Added `Forestry` to all Centaurs and introduced real combat `forest` terrain, replacing `cover`.
  - Added `Call of Bravery` for Centaur captains:
    - visible in tooltips/UI
    - once per captain per battle
    - blocked while the buff is already active on that side
    - consumes all combat movement
    - grants `+1 ATK`, `+1 DMG`, `+1 EVA` for `3` turn swaps
  - Added Demon fire kit:
    - `Fire Strike` on `Hell Hound`, `Succubus`, `Incubus`, `Gog`, `Arch Fiend`
    - `Fire Protection` on all demons except `Incubus`
    - `Fire Immunity` on `Incubus`
    - `Fireball` on `Gog` as a `3x3` friendly-fire AoE with range `2` that uses all combat movement
  - Added status tracking for `burning` and `call-of-bravery`, exposed in tooltips and `render_game_to_text`.
  - Generalized combat attack-side effects so future ranged/special attacks can reuse the same pipeline.

- Added/expanded pure-rule test coverage in `src/systems/attackProfiles.js` and `tests/attack_profiles.test.js`.
  - Covered: leadership stack cap, forestry movement costs, call-of-bravery activation/bonuses/expiry, fire strike chance/protection/immunity, burning duration/damage, and fireball area/range/friendly fire.

- Fixed a browser-discovered runtime bug during validation:
  - Enlarged stacks could exceed the old combat deployment footprint and leave units with `x/y = null`.
  - `placeCombatUnits()` now uses a broader passable-column deployment layout so legal expanded stacks fully enter combat.

Validation for ability-system pass:
- Unit tests: `npm test` passing (`59/59`).
- Required skill Playwright client runs:
  - `output/web-game/ability-system-validation/`
  - `output/web-game/ability-system-validation-2/`
  - Second validation run confirmed no `null` combat positions in exported state after the deployment fix.
- Focused Playwright validation:
  - Explicit `Centaur Clans` vs `Demon Horde` setup confirmed Centaur capacity growth (`10/10` in sampled run) and live archetype/ability payloads in `render_game_to_text`.
- Browser console note:
  - observed setup-page console error is the existing `favicon.ico` `404`; no new gameplay/runtime error artifacts were produced by the validation runs.

- Added demon advanced trait pass in the live runtime and pure rule layer.
  - `Basking` added to `Hell Hound`, `Incubus`, and `Arch Fiend`.
    - These units now also carry `Fire Immunity`.
    - In the live runtime, direct `Fireball` hits heal them for half of raw damage instead of harming them.
  - `Flying` added to `Succubus`.
    - Adjacent/direct melee attacks can no longer target flying units unless they are grounded by a future debuff.
    - Ranged attacks remain valid.
  - `Flammable` added to `Imp`.
    - A successful `Fire Strike` proc now kindles the Imp for `3` turns instead of applying normal burning.
    - While kindled, the Imp gains `+2 DMG` and temporary `Fire Strike`.
    - If the kindled Imp dies, it explodes into an adjacent-tile fire burst using medium fire values (`ATK 10`, `DMG 8`).

- Expanded pure-rule coverage in `src/systems/attackProfiles.js` and `tests/attack_profiles.test.js`.
  - Added tests for:
    - `Basking` fire-to-heal conversion and fire-immunity interaction
    - `Flying` blocking melee while preserving ranged targeting
    - `Flammable` temporary buff behavior and death-explosion profile

Validation for advanced demon trait pass:
- Unit tests: `npm test` passing (`63/63`).
- Required skill Playwright client run:
  - `output/web-game/basking-flying-flammable-validation/shot-0.png`
  - `output/web-game/basking-flying-flammable-validation/state-0.json`
  - Combat loaded successfully and exported no `null` combat coordinates.
- Focused Playwright setup validation:
  - Explicit `Centaur Clans` vs `Demon Horde` setup confirmed live browser state now surfaces:
    - `Succubus`: `flying`
    - `Hell Hound` / `Incubus`: `basking`, `fire-immunity`
    - `Imp`: `flammable`
- Browser console note remains unchanged:
  - the only observed page error is the existing `favicon.ico` `404`.
