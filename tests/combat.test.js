import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/core/state.js";
import {
  areCombatantsAdjacent,
  moveCombatPlayer,
  moveEnemyInCombat,
  resolveCombatAttack,
  startCombat
} from "../src/systems/combat.js";

test("startCombat initializes tactical positions, terrain, combat MP, and defender-first turn order", () => {
  const state = createInitialState();
  state.units.player.currentCombatMp = 0;
  state.units.enemy.currentCombatMp = 0;
  startCombat(state, "player");

  assert.equal(state.mode, "combat");
  assert.equal(state.combatTurn, "enemy");
  assert.deepEqual(state.combat.player, { x: 1, y: 4 });
  assert.deepEqual(state.combat.enemy, { x: 6, y: 4 });
  assert.equal(state.combatTerrain[4][1], "open");
  assert.equal(state.combatTerrain[4][6], "open");
  assert.equal(state.units.player.currentCombatMp, state.units.player.maxCombatMp);
  assert.equal(state.units.enemy.currentCombatMp, state.units.enemy.maxCombatMp);
});

test("combat player movement consumes combat MP", () => {
  const state = createInitialState();
  startCombat(state, "enemy");
  state.combatTerrain[4][2] = "rough";

  const result = moveCombatPlayer(state, "ArrowRight");
  assert.equal(result.ok, true);
  assert.equal(result.terrain, "rough");
  assert.equal(result.cost, 2);
  assert.equal(state.units.player.currentCombatMp, 0);
});

test("combat player cannot move into occupied enemy tile", () => {
  const state = createInitialState();
  startCombat(state, "enemy");
  state.combat.player = { x: 5, y: 4 };

  const result = moveCombatPlayer(state, "ArrowRight");
  assert.equal(result.ok, false);
  assert.equal(result.reason, "occupied");
});

test("combat player movement blocks impassable blocked tile", () => {
  const state = createInitialState();
  startCombat(state, "enemy");
  state.combatTerrain[4][2] = "blocked";

  const result = moveCombatPlayer(state, "ArrowRight");
  assert.equal(result.ok, false);
  assert.equal(result.reason, "impassable");
});

test("combat player movement blocks when combat MP is insufficient", () => {
  const state = createInitialState();
  startCombat(state, "enemy");
  state.combatTerrain[4][2] = "rough";
  state.units.player.currentCombatMp = 1;

  const result = moveCombatPlayer(state, "ArrowRight");
  assert.equal(result.ok, false);
  assert.equal(result.reason, "insufficient-combat-mp");
});

test("adjacency check returns true for side-by-side units", () => {
  const state = createInitialState();
  startCombat(state, "player");
  state.combat.player = { x: 3, y: 3 };
  state.combat.enemy = { x: 4, y: 3 };

  assert.equal(areCombatantsAdjacent(state), true);
});

test("enemy combat movement can move then attack", () => {
  const state = createInitialState();
  startCombat(state, "player");
  state.combat.player = { x: 3, y: 4 };
  state.combat.enemy = { x: 6, y: 4 };
  state.units.enemy.currentCombatMp = 3;
  state.combatTerrain[4][5] = "open";
  state.combatTerrain[4][4] = "open";

  const action = moveEnemyInCombat(state);
  assert.equal(action.action, "move-then-attack");
  assert.deepEqual(state.combat.enemy, { x: 4, y: 4 });
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
