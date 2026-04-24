# AGENTS.md

Instructions for AI agents working in this repository.

## Build & Run

No build step required. Open `index.html` directly in a browser, or serve locally:

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

## Test

```bash
npm test
```

Uses Node.js built-in test runner (`node --test`). Watch mode: `npm run test:watch`.

Tests are in `tests/` and cover the modular `src/` systems. They do not yet fully cover the standalone `game.js` runtime.

## Lint

```bash
npm run lint
```

Uses ESLint with flat config (`eslint.config.js`).

## Directory Layout

```
tbs-murph/
├── index.html              # Browser entry point (loads game.js directly)
├── game.js                 # Standalone runtime (source of truth for gameplay)
├── styles.css              # Styling
├── src/                    # Modular source (earlier/smaller implementation)
│   ├── core/               # State, constants, RNG
│   │   ├── constants.js
│   │   ├── rng.js
│   │   └── state.js
│   ├── systems/            # Game systems
│   │   ├── attackProfiles.js
│   │   ├── combat.js
│   │   ├── combatStats.js
│   │   ├── grid.js
│   │   ├── map.js
│   │   └── terrain.js
│   ├── render/
│   │   └── canvasRenderer.js
│   └── gameController.js
├── tests/                  # Node.js test suite (10 files, 70+ tests)
├── art/                    # Race artwork
└── img/                    # Game assets
```

## Code Conventions

- ES modules (`"type": "module"` in package.json)
- No build/bundle step; browser loads `game.js` directly
- Tests use Node.js built-in `node:test` and `node:assert`
- Automation hooks exposed on `window`: `render_game_to_text()`, `advanceTime(ms)`

## Key Context

- The standalone `game.js` is the active runtime; `src/` is an older modular extract
- 8 playable races with procedural art
- Combat: 8x8 tactical grid, hit chance/damage/armor system
- Map: 10x10 overworld with fog of war and terrain costs
