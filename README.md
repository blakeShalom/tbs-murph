# tbs-murph

2D turn-based 4X prototype, structured as a modular JavaScript game runtime.

## Platform Choice

Current choice is modern browser JavaScript with ES modules and a Canvas renderer.

Why this is a good platform now:
- Fast iteration for gameplay systems (map/combat/AI/turn flow).
- Easy local run and sharing without native build tooling.
- Core logic can be unit tested in Node independently from rendering.

## Architecture

- `src/core`: constants, state creation, RNG.
- `src/systems`: pure gameplay systems (`map`, `combat`, `grid`).
- `src/gameController.js`: orchestrates turns, state transitions, and UI messages.
- `src/render/canvasRenderer.js`: rendering only.
- `src/main.js`: browser entrypoint + input wiring.

This structure is ready for Vite/Phaser migration later while preserving tested game logic.

## Run

Open `/Users/belling/src/tbs-murph/index.html` in a browser.

## Tests

- Run all tests: `npm test`
- Watch mode: `npm run test:watch`

Unit tests currently cover:
- Map movement bounds and overlap combat trigger.
- Combat setup, adjacency, occupancy rules, and RNG combat resolution.
- Controller-level transition into combat and combat attack flow.
