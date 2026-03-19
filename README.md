# tbs-murph

Browser-based turn-based strategy prototype with overworld movement, fog of war, stack-based tactical combat, and race-driven unit rosters.

## Current Game State

- Setup screen with player and computer race selection plus art previews.
- Playable races currently include `Centaur Clans`, `Demon Horde`, `Dawnforged`, `Ironclad`, `Sylvan`, `Emberkin`, `Tideborn`, and `Stoneguard`.
- Randomized starting stacks on a `10x10` world map with fog of war.
- Tactical combat on an `8x8` battle grid when stacks collide.
- Per-unit combat stats: HP, armor, attack, damage, evasiveness, and movement.
- Race-specific procedural art for setup portraits, map tokens, and combat units for Centaurs and Demons.
- Combat log and hover tooltips for stack and unit inspection.

## Gameplay

### Map View

- Each side controls a stack with a random size from `1-8`.
- The player explores a `10x10` grid with fog of war and vision radius `2`.
- Map terrain:
  - `plains`: cost `1`
  - `forest`: cost `2`
  - `hill`: cost `2`
  - `water`: impassable
- Stacks that move onto the same tile trigger tactical combat.

### Combat View

- Combat takes place on an `8x8` grid using all living units in each stack.
- The player controls one active combat unit at a time and can cycle units.
- Combat terrain:
  - `open`: cost `1`
  - `rough`: cost `2`
  - `cover`: cost `1`
  - `blocked`: impassable
- Hit chance starts at `70%`, is modified by attacker ATK vs defender EVA, and is clamped to `10%-95%`.
- Damage is rolled from `1..DMG` with a high bias toward larger values.
- Armor absorbs up to `80%` of incoming raw damage; the remaining `20%` always routes to HP, with overflow to HP when armor is depleted.

## Controls

- `Arrow Keys`: move the map stack or the active combat unit
- `Enter`: end turn
- `Space`: attack in combat
- `A`: cycle the active player unit during combat
- `B`: debug shortcut to force combat from the map view
- `Start Game`: begin from the race setup screen
- `Reset`: restart the current game after setup
- Mouse hover: inspect stacks and combat units

## Runtime Structure

The current browser-playable source of truth is the standalone runtime:

- [`index.html`](/Users/michelleellingham/src/tbs-murph/index.html)
- [`styles.css`](/Users/michelleellingham/src/tbs-murph/styles.css)
- [`game.js`](/Users/michelleellingham/src/tbs-murph/game.js)

`index.html` loads `game.js` directly so the prototype can be opened without a build step.

The modular code under [`src/`](/Users/michelleellingham/src/tbs-murph/src) is still present, but it currently represents an earlier/smaller implementation and does not include all of the gameplay and UI features in `game.js`.

## Automation Hooks

The browser runtime exposes:

- `window.render_game_to_text()`: returns a JSON snapshot of setup/game state, stacks, combat units, visibility, and combat log
- `window.advanceTime(ms)`: advances scheduled actions deterministically and returns the same JSON snapshot

These hooks are intended for Playwright-style automation and skill-driven testing.

## Run Locally

You can either open [`index.html`](/Users/michelleellingham/src/tbs-murph/index.html) directly in a browser, or serve the repo locally:

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

Then visit [http://127.0.0.1:4173/index.html](http://127.0.0.1:4173/index.html).

## Tests

Run the Node test suite with:

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```

Current automated coverage is focused on the modular `src/` systems, including:

- map terrain passability and movement costs
- combat terrain, movement, and adjacency rules
- combat hit chance, damage, armor routing, and elimination rules
- controller turn-flow behavior

Note: these tests do not fully cover the active standalone `game.js` runtime yet.

## Playwright Example

If you have a compatible Playwright client available, an example run looks like:

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
