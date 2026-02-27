import test from "node:test";
import assert from "node:assert/strict";
import {
  createCombatTerrain,
  createMapTerrain,
  getCombatTerrainRule,
  getMapTerrainRule
} from "../src/systems/terrain.js";

test("unknown map terrain falls back to plains", () => {
  const rule = getMapTerrainRule("unknown");
  assert.equal(rule.label, "Plains");
  assert.equal(rule.cost, 1);
  assert.equal(rule.passable, true);
});

test("unknown combat terrain falls back to open", () => {
  const rule = getCombatTerrainRule("unknown");
  assert.equal(rule.label, "Open");
  assert.equal(rule.cost, 1);
  assert.equal(rule.passable, true);
});

test("map terrain generation keeps center lane and edge-safe paths open", () => {
  const size = 10;
  const grid = createMapTerrain(size);
  const mid = Math.floor(size / 2);

  assert.equal(grid.length, size);
  for (const row of grid) assert.equal(row.length, size);

  for (let x = 0; x < size; x += 1) {
    assert.equal(grid[mid][x], "plains");
  }
  for (let y = 0; y < size; y += 1) {
    assert.equal(grid[y][1], "plains");
    assert.equal(grid[y][size - 2], "plains");
  }

  assert.equal(grid[1][1], "plains");
  assert.equal(grid[size - 2][size - 2], "plains");
});

test("combat terrain generation keeps middle lane and spawn slots open", () => {
  const size = 8;
  const grid = createCombatTerrain(size);
  const mid = Math.floor(size / 2);

  assert.equal(grid.length, size);
  for (const row of grid) assert.equal(row.length, size);

  for (let x = 0; x < size; x += 1) {
    assert.equal(grid[mid][x], "open");
  }

  assert.equal(grid[mid][1], "open");
  assert.equal(grid[mid][size - 2], "open");
});
