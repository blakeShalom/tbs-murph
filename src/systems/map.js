import { MAP_GRID_SIZE } from "../core/constants.js";
import { inBounds } from "./grid.js";

export function moveMapPlayer(state, direction) {
  if (state.mode !== "map" || state.turn !== "player" || state.gameOver) {
    return { ok: false, reason: "not-player-map-turn" };
  }

  const next = nextCoord(state.units.player, direction);
  if (!next) return { ok: false, reason: "invalid-direction" };
  if (!inBounds(next.x, next.y, MAP_GRID_SIZE)) {
    return { ok: false, reason: "out-of-bounds" };
  }

  state.units.player.x = next.x;
  state.units.player.y = next.y;

  const overlap =
    state.units.player.x === state.units.enemy.x &&
    state.units.player.y === state.units.enemy.y;

  return { ok: true, pos: next, overlap };
}

export function moveEnemyOnMap(state) {
  if (state.mode !== "map" || state.turn !== "enemy" || state.gameOver) {
    return { ok: false, reason: "not-enemy-map-turn" };
  }

  const enemy = state.units.enemy;
  const player = state.units.player;
  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;

  if (Math.abs(dx) > Math.abs(dy)) {
    enemy.x += Math.sign(dx);
  } else if (dy !== 0) {
    enemy.y += Math.sign(dy);
  }

  enemy.x = Math.max(0, Math.min(MAP_GRID_SIZE - 1, enemy.x));
  enemy.y = Math.max(0, Math.min(MAP_GRID_SIZE - 1, enemy.y));

  const overlap = enemy.x === player.x && enemy.y === player.y;
  return { ok: true, pos: { x: enemy.x, y: enemy.y }, overlap };
}

function nextCoord(current, direction) {
  if (direction === "ArrowUp") return { x: current.x, y: current.y - 1 };
  if (direction === "ArrowDown") return { x: current.x, y: current.y + 1 };
  if (direction === "ArrowLeft") return { x: current.x - 1, y: current.y };
  if (direction === "ArrowRight") return { x: current.x + 1, y: current.y };
  return null;
}
