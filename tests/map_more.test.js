import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/core/state.js";
import { moveEnemyOnMap, moveMapPlayer } from "../src/systems/map.js";

test("map movement rejects invalid direction", () => {
  const state = createInitialState();
  const result = moveMapPlayer(state, "KeyQ");

  assert.equal(result.ok, false);
  assert.equal(result.reason, "invalid-direction");
});

test("enemy map movement rejects action when not enemy turn", () => {
  const state = createInitialState();
  state.turn = "player";

  const result = moveEnemyOnMap(state);
  assert.equal(result.ok, false);
  assert.equal(result.reason, "not-enemy-map-turn");
});

test("enemy map movement reports overlap when stepping onto player tile", () => {
  const state = createInitialState();
  state.turn = "enemy";
  state.units.enemy.x = 5;
  state.units.enemy.y = 5;
  state.units.player.x = 5;
  state.units.player.y = 6;
  state.mapTerrain[6][5] = "plains";

  const result = moveEnemyOnMap(state);
  assert.equal(result.ok, true);
  assert.equal(result.overlap, true);
  assert.deepEqual(result.pos, { x: 5, y: 6 });
});

test("enemy map movement can hold when preferred path is impassable", () => {
  const state = createInitialState();
  state.turn = "enemy";
  state.units.enemy.x = 5;
  state.units.enemy.y = 5;
  state.units.player.x = 5;
  state.units.player.y = 7;
  state.mapTerrain[6][5] = "water";

  const result = moveEnemyOnMap(state);
  assert.equal(result.ok, true);
  assert.equal(result.moved, false);
  assert.deepEqual(result.pos, { x: 5, y: 5 });
});
