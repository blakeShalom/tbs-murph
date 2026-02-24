import test from "node:test";
import assert from "node:assert/strict";
import { createGameController } from "../src/gameController.js";

function createTestHarness(randomValues = [0.9, 0.1]) {
  const logs = [];
  const ui = {
    setStatus(text) {
      logs.push(text);
    },
    setMode() {},
    setAttackDisabled() {},
    setEndTurnDisabled() {}
  };

  const renderer = {
    draw() {}
  };

  const randomFn = (() => {
    const queue = [...randomValues];
    return () => (queue.length ? queue.shift() : 0.5);
  })();

  const game = createGameController({ ui, renderer, randomFn });
  game.reset();

  return { game, logs };
}

test("controller transitions to combat on map overlap", () => {
  const { game } = createTestHarness();
  const state = game.getState();
  state.units.player.x = 7;
  state.units.player.y = 8;
  state.units.enemy.x = 8;
  state.units.enemy.y = 8;

  game.move("ArrowRight");

  assert.equal(game.getState().mode, "combat");
  assert.equal(game.getState().combatTurn, "player");
});

test("controller allows player attack in combat and ends game", () => {
  const { game } = createTestHarness([0.95, 0.05]);
  const state = game.getState();
  state.mode = "combat";
  state.combatTurn = "player";
  state.combat = {
    player: { x: 3, y: 3 },
    enemy: { x: 4, y: 3 }
  };

  game.playerAttack();

  assert.equal(game.getState().gameOver, true);
});
