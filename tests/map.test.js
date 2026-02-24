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

test("map movement consumes MP based on terrain cost", () => {
  const state = createInitialState();
  state.units.player.x = 1;
  state.units.player.y = 1;
  state.mapTerrain[1][2] = "forest";

  const result = moveMapPlayer(state, "ArrowRight");
  assert.equal(result.ok, true);
  assert.equal(result.terrain, "forest");
  assert.equal(result.cost, 2);
  assert.equal(state.units.player.currentMapMp, 1);
});

test("map movement blocks impassable water", () => {
  const state = createInitialState();
  state.units.player.x = 1;
  state.units.player.y = 1;
  state.mapTerrain[1][2] = "water";

  const result = moveMapPlayer(state, "ArrowRight");
  assert.equal(result.ok, false);
  assert.equal(result.reason, "impassable");
});

test("map movement blocks when MP is insufficient", () => {
  const state = createInitialState();
  state.units.player.x = 1;
  state.units.player.y = 1;
  state.units.player.currentMapMp = 1;
  state.mapTerrain[1][2] = "hill";

  const result = moveMapPlayer(state, "ArrowRight");
  assert.equal(result.ok, false);
  assert.equal(result.reason, "insufficient-mp");
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

test("enemy map movement spends MP over multiple steps", () => {
  const state = createInitialState();
  state.turn = "enemy";
  state.units.enemy.currentMapMp = 3;
  state.units.player.x = 1;
  state.units.player.y = 8;
  state.units.enemy.x = 8;
  state.units.enemy.y = 8;
  state.mapTerrain[8][7] = "plains";
  state.mapTerrain[8][6] = "plains";
  state.mapTerrain[8][5] = "plains";

  const result = moveEnemyOnMap(state);
  assert.equal(result.ok, true);
  assert.equal(result.moved, true);
  assert.equal(state.units.enemy.x, 5);
  assert.equal(state.units.enemy.currentMapMp, 0);
});
