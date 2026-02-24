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
