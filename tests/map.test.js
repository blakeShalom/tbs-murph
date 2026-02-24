import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/core/state.js";
import { moveEnemyOnMap, moveMapPlayer } from "../src/systems/map.js";

test("map movement blocks out-of-bounds", () => {
  const state = createInitialState();
  state.units.player.x = 0;
  state.units.player.y = 0;

  const result = moveMapPlayer(state, "ArrowLeft");
  assert.equal(result.ok, false);
  assert.equal(result.reason, "out-of-bounds");
});

test("map movement reports overlap when player enters enemy tile", () => {
  const state = createInitialState();
  state.units.player.x = 7;
  state.units.player.y = 8;
  state.units.enemy.x = 8;
  state.units.enemy.y = 8;

  const result = moveMapPlayer(state, "ArrowRight");
  assert.equal(result.ok, true);
  assert.equal(result.overlap, true);
});

test("enemy map movement chases player", () => {
  const state = createInitialState();
  state.turn = "enemy";
  state.units.player.x = 1;
  state.units.player.y = 8;
  state.units.enemy.x = 8;
  state.units.enemy.y = 8;

  const result = moveEnemyOnMap(state);
  assert.equal(result.ok, true);
  assert.equal(state.units.enemy.x, 7);
  assert.equal(state.units.enemy.y, 8);
});
