import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/core/state.js";
import {
  areCombatantsAdjacent,
  moveCombatPlayer,
  resolveCombatAttack,
  startCombat
} from "../src/systems/combat.js";

test("startCombat initializes tactical positions", () => {
  const state = createInitialState();
  startCombat(state, "player");

  assert.equal(state.mode, "combat");
  assert.equal(state.combatTurn, "player");
  assert.deepEqual(state.combat.player, { x: 1, y: 4 });
  assert.deepEqual(state.combat.enemy, { x: 6, y: 4 });
});

test("combat player cannot move into occupied enemy tile", () => {
  const state = createInitialState();
  startCombat(state, "player");
  state.combat.player = { x: 5, y: 4 };

  const result = moveCombatPlayer(state, "ArrowRight");
  assert.equal(result.ok, false);
  assert.equal(result.reason, "occupied");
});

test("adjacency check returns true for side-by-side units", () => {
  const state = createInitialState();
  startCombat(state, "player");
  state.combat.player = { x: 3, y: 3 };
  state.combat.enemy = { x: 4, y: 3 };

  assert.equal(areCombatantsAdjacent(state), true);
});

test("resolveCombatAttack marks game over and winner", () => {
  const state = createInitialState();
  startCombat(state, "player");

  const rng = {
    d20: (() => {
      const rolls = [20, 1];
      return () => rolls.shift();
    })()
  };

  const result = resolveCombatAttack(state, "player", rng);
  assert.equal(result.ok, true);
  assert.equal(result.winner, "player");
  assert.equal(state.gameOver, true);
  assert.equal(state.units.enemy.hp, 0);
});
