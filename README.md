# tbs-murph

2D turn-based 4X prototype with map exploration and tactical combat.

## Current Gameplay

- Two races: `Dawnforged` (player) and `Ironclad` (enemy).
- **Map View**:
  - 10x10 terrain grid with movement costs.
  - Terrain: `plains (1)`, `forest (2)`, `hill (2)`, `water (impassable)`.
  - Units have map movement points (MP) each turn.
- **Combat View**:
  - Separate 8x8 tactical terrain grid.
  - Terrain: `open (1)`, `rough (2)`, `cover (1)`, `blocked (impassable)`.
  - Units have combat movement points (MP) each combat turn.
- Combat begins when armies overlap in map view.

## Controls

- `Arrow Keys`: move unit in current view (map/combat).
- `Enter`: end turn.
- `Space`: attack in combat view (when adjacent).
- `B`: debug shortcut to start combat from map view.
- `Reset` button: restart match.

## Runtime Structure

- Browser runtime currently loaded by `index.html` uses `game.js` for direct file-open compatibility.
- Modular architecture is also present under `src/`:
  - `src/core`: constants, state, RNG.
  - `src/systems`: map/combat/grid/terrain rules.
  - `src/gameController.js`: orchestration and turn flow.
  - `src/render/canvasRenderer.js`: canvas rendering.
  - `src/main.js`: modular entry wiring.

## Automation Hooks

`game.js` exposes:
- `window.render_game_to_text()` for concise state snapshots.
- `window.advanceTime(ms)` for deterministic stepping in automation.

These hooks are used by the Playwright game-testing client.

## Run

Open [index.html](/Users/belling/src/tbs-murph/index.html) in a browser, or serve locally:

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

Then visit `http://127.0.0.1:4173/index.html`.

## Tests

- Unit tests: `npm test`
- Watch mode: `npm run test:watch`

Coverage includes:
- Map terrain passability/cost and map MP spending.
- Combat terrain passability/cost and combat MP spending.
- Combat setup, adjacency, movement constraints, and RNG resolution.
- Controller transitions between map and combat states.

## Playwright (Skill Client)

Example run with the required client:

```bash
export CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
export WEB_GAME_CLIENT="$CODEX_HOME/skills/develop-web-game/scripts/web_game_playwright_client.js"
node "$WEB_GAME_CLIENT" \
  --url http://127.0.0.1:4173/index.html \
  --actions-file /tmp/map_actions.json \
  --iterations 1 \
  --pause-ms 250 \
  --screenshot-dir output/web-game/map
```
