import test from "node:test";
import assert from "node:assert/strict";
import { createGameController } from "../src/gameController.js";

function createHarness(randomValues = [0.9, 0.1]) {
  const logs = [];
  const ui = {
    setStatus(text) {
      logs.push(text);
    },
    setMode() {},
    setMapMp() {},
    setCombatMp() {},
    setAttackDisabled() {},
    setEndTurnDisabled() {}
  };

  const renderer = { draw() {} };
  const randomFn = (() => {
    const queue = [...randomValues];
    return () => (queue.length ? queue.shift() : 0.5);
  })();

  const game = createGameController({ ui, renderer, randomFn });
  game.reset();

  return { game, logs };
}

test("controller endTurn on map replenishes player map MP", () => {
  const { game } = createHarness();
  const state = game.getState();
  state.units.player.currentMapMp = 0;

  game.endTurn();

  assert.equal(state.turn, "player");
  assert.equal(state.units.player.currentMapMp, state.units.player.maxMapMp);
});

test("controller reports impassable message for blocked combat movement", () => {
  const { game, logs } = createHarness();
  const state = game.getState();

  state.mode = "combat";
  state.combatTurn = "player";
  state.gameOver = false;
  state.combat = { player: { x: 1, y: 1 }, enemy: { x: 6, y: 6 } };
  state.units.player.currentCombatMp = 2;
  state.combatTerrain = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => "open"));
  state.combatTerrain[1][2] = "blocked";

  game.move("ArrowRight");

  assert.match(logs.at(-1), /impassable/i);
});

test("controller prompts player to move adjacent before attacking", () => {
  const { game, logs } = createHarness();
  const state = game.getState();

  state.mode = "combat";
  state.combatTurn = "player";
  state.gameOver = false;
  state.combat = { player: { x: 1, y: 1 }, enemy: { x: 6, y: 6 } };

  game.playerAttack();

  assert.match(logs.at(-1), /Move adjacent to attack/i);
});

test("controller endTurn in combat can return control to player when enemy holds", () => {
  const { game } = createHarness();
  const state = game.getState();

  state.mode = "combat";
  state.combatTurn = "player";
  state.gameOver = false;
  state.combat = { player: { x: 1, y: 4 }, enemy: { x: 1, y: 1 } };
  state.combatTerrain = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => "open"));
  state.combatTerrain[2][1] = "blocked";
  state.units.player.currentCombatMp = 0;
  state.units.enemy.currentCombatMp = 0;

  game.endTurn();

  assert.equal(state.combatTurn, "player");
  assert.equal(state.units.player.currentCombatMp, state.units.player.maxCombatMp);
});
