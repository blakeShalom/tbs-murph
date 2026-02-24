import { MAP_GRID_SIZE } from "../core/constants.js";
import { inBounds } from "./grid.js";
import { getMapTerrainRule } from "./terrain.js";

export function moveMapPlayer(state, direction) {
  if (state.mode !== "map" || state.turn !== "player" || state.gameOver) {
    return { ok: false, reason: "not-player-map-turn" };
  }

  const next = nextCoord(state.units.player, direction);
  if (!next) return { ok: false, reason: "invalid-direction" };
  if (!inBounds(next.x, next.y, MAP_GRID_SIZE)) {
    return { ok: false, reason: "out-of-bounds" };
  }

  const terrain = state.mapTerrain[next.y][next.x];
  const rule = getMapTerrainRule(terrain);

  if (!rule.passable) {
    return { ok: false, reason: "impassable", terrain };
  }

  const player = state.units.player;
  if (player.currentMapMp < rule.cost) {
    return {
      ok: false,
      reason: "insufficient-mp",
      cost: rule.cost,
      terrain,
      remainingMp: player.currentMapMp
    };
  }

  state.units.player.x = next.x;
  state.units.player.y = next.y;
  player.currentMapMp -= rule.cost;

  const overlap =
    state.units.player.x === state.units.enemy.x &&
    state.units.player.y === state.units.enemy.y;

  return {
    ok: true,
    pos: next,
    overlap,
    terrain,
    cost: rule.cost,
    remainingMp: player.currentMapMp
  };
}

export function moveEnemyOnMap(state) {
  if (state.mode !== "map" || state.turn !== "enemy" || state.gameOver) {
    return { ok: false, reason: "not-enemy-map-turn" };
  }

  const enemy = state.units.enemy;
  const player = state.units.player;
  let moved = false;

  while (enemy.currentMapMp > 0) {
    const candidates = enemyMoveCandidates(enemy, player);
    let selected = null;

    for (const candidate of candidates) {
      if (!inBounds(candidate.x, candidate.y, MAP_GRID_SIZE)) {
        continue;
      }

      const terrain = state.mapTerrain[candidate.y][candidate.x];
      const rule = getMapTerrainRule(terrain);
      if (!rule.passable || rule.cost > enemy.currentMapMp) {
        continue;
      }

      selected = { ...candidate, cost: rule.cost };
      break;
    }

    if (!selected) {
      break;
    }

    enemy.x = selected.x;
    enemy.y = selected.y;
    enemy.currentMapMp -= selected.cost;
    moved = true;

    if (enemy.x === player.x && enemy.y === player.y) {
      return { ok: true, pos: { x: enemy.x, y: enemy.y }, overlap: true, moved };
    }
  }

  return { ok: true, pos: { x: enemy.x, y: enemy.y }, overlap: false, moved };
}

function enemyMoveCandidates(enemy, player) {
  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  const candidates = [];

  if (Math.abs(dx) >= Math.abs(dy)) {
    if (dx !== 0) candidates.push({ x: enemy.x + Math.sign(dx), y: enemy.y });
    if (dy !== 0) candidates.push({ x: enemy.x, y: enemy.y + Math.sign(dy) });
  } else {
    if (dy !== 0) candidates.push({ x: enemy.x, y: enemy.y + Math.sign(dy) });
    if (dx !== 0) candidates.push({ x: enemy.x + Math.sign(dx), y: enemy.y });
  }

  return candidates;
}

function nextCoord(current, direction) {
  if (direction === "ArrowUp") return { x: current.x, y: current.y - 1 };
  if (direction === "ArrowDown") return { x: current.x, y: current.y + 1 };
  if (direction === "ArrowLeft") return { x: current.x - 1, y: current.y };
  if (direction === "ArrowRight") return { x: current.x + 1, y: current.y };
  return null;
}
