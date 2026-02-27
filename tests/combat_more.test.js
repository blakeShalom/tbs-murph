import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/core/state.js";
import {
  moveCombatPlayer,
  moveEnemyInCombat,
  resolveCombatAttack,
  startCombat
} from "../src/systems/combat.js";

test("combat movement rejects invalid direction", () => {
  const state = createInitialState();
  startCombat(state, "player");

  const result = moveCombatPlayer(state, "KeyQ");
  assert.equal(result.ok, false);
  assert.equal(result.reason, "invalid-direction");
});

test("enemy combat action is none when not enemy turn", () => {
  const state = createInitialState();
  startCombat(state, "player");

  const action = moveEnemyInCombat(state);
  assert.equal(action.action, "none");
});

test("enemy combat can hold when blocked by impassable terrain", () => {
  const state = createInitialState();
  startCombat(state, "enemy");
  state.combat.enemy = { x: 1, y: 1 };
  state.combat.player = { x: 1, y: 3 };
  state.units.enemy.currentCombatMp = 1;
  state.combatTerrain[2][1] = "blocked";

  const action = moveEnemyInCombat(state);
  assert.equal(action.action, "hold");
  assert.deepEqual(state.combat.enemy, { x: 1, y: 1 });
});

test("enemy combat can move without attacking when still distant", () => {
  const state = createInitialState();
  startCombat(state, "enemy");
  state.combat.enemy = { x: 1, y: 1 };
  state.combat.player = { x: 1, y: 4 };
  state.units.enemy.currentCombatMp = 1;
  state.combatTerrain[2][1] = "open";

  const action = moveEnemyInCombat(state);
  assert.equal(action.action, "move");
  assert.deepEqual(action.pos, { x: 1, y: 2 });
  assert.equal(state.units.enemy.currentCombatMp, 0);
});

test("combat attack resolver rejects when not in combat mode", () => {
  const state = createInitialState();
  state.mode = "map";

  const result = resolveCombatAttack(state, "player", { d20: () => 10 });
  assert.equal(result.ok, false);
  assert.equal(result.reason, "not-in-combat");
});
