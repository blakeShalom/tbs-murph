import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");
const indexHtml = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8");
const stylesCss = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");
const gameJs = fs.readFileSync(path.join(repoRoot, "game.js"), "utf8");

test("map HUD keeps a dedicated End Turn control", () => {
  assert.match(
    indexHtml,
    /<section id="mapHud"[\s\S]*?<button id="mapEndTurnBtn">End Turn<\/button>/,
    "Map HUD should include a clickable End Turn button"
  );
});

test("map End Turn control stays wired to the shared turn handler", () => {
  assert.match(
    gameJs,
    /const mapEndTurnBtn = document\.getElementById\("mapEndTurnBtn"\);/,
    "game.js should look up the map End Turn button"
  );
  assert.match(
    gameJs,
    /if \(mapEndTurnBtn\) mapEndTurnBtn\.addEventListener\("click", endTurn\);/,
    "map End Turn button should trigger the same endTurn flow"
  );
  assert.match(
    gameJs,
    /if \(mapEndTurnBtn\) \{\s*mapEndTurnBtn\.disabled = state\.gameOver \|\| state\.mode !== "map";\s*\}/,
    "map End Turn button should only be enabled during map mode"
  );
});

test("setup layout keeps the pre-game shell narrower than the in-game shell", () => {
  assert.match(
    stylesCss,
    /\.app:not\(\.app--started\)\s*\{\s*width:\s*min\(860px,\s*calc\(100vw - 28px\)\);/m,
    "pre-start layout should use a narrower app width"
  );
  assert.match(
    stylesCss,
    /\.setup-screen\s*\{[\s\S]*max-width:\s*760px;/m,
    "setup screen should keep a bounded max width"
  );
  assert.match(
    gameJs,
    /appRootEl\?\.classList\.toggle\("app--started", visible\);/,
    "game.js should toggle app--started so setup sizing only applies before the game starts"
  );
});

test("combat header keeps a dedicated Archery action pill", () => {
  assert.match(
    indexHtml,
    /<button id="archeryBtn" class="action-btn">Archery<\/button>/,
    "Combat header should expose Archery as its own action pill"
  );
});

test("combat board supports click selection and click targeting", () => {
  assert.match(
    gameJs,
    /function handleCombatBoardClick\(event\)/,
    "game.js should define a combat board click handler"
  );
  assert.match(
    gameJs,
    /board\.addEventListener\("click", handleCombatBoardClick\);/,
    "board clicks should be wired into combat selection and targeting"
  );
  assert.match(
    gameJs,
    /function selectActivePlayerUnit\(unitId, options = \{\}\)/,
    "game.js should support selecting player units directly by id"
  );
});

test("archery can target any enemy in range instead of requiring straight lanes", () => {
  assert.match(
    gameJs,
    /targeting:\s*"line-of-sight"/,
    "Archery should still use the ranged targeting profile"
  );
  assert.doesNotMatch(
    gameJs,
    /return isClearLineOfSight\(attacker, unit\);/,
    "Archery target selection should not require a line-of-sight blocker check"
  );
});

test("battle map no longer renders a command phase banner overlay", () => {
  assert.doesNotMatch(
    indexHtml,
    /id="battleStatusBanner"/,
    "board overlay banner should be removed from the battle map"
  );
  assert.doesNotMatch(
    stylesCss,
    /\.battle-status-banner\s*\{/m,
    "styles should no longer reserve UI for the removed command phase banner"
  );
});
