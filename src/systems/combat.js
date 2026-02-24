import { COMBAT_GRID_SIZE } from "../core/constants.js";
import { inBounds, manhattanDistance } from "./grid.js";

export function startCombat(state, initiator) {
  state.mode = "combat";
  state.combatTurn = initiator;
  state.combat = {
    player: { x: 1, y: Math.floor(COMBAT_GRID_SIZE / 2) },
    enemy: { x: COMBAT_GRID_SIZE - 2, y: Math.floor(COMBAT_GRID_SIZE / 2) }
  };
}

export function areCombatantsAdjacent(state) {
  if (!state.combat) return false;
  return manhattanDistance(state.combat.player, state.combat.enemy) === 1;
}

export function moveCombatPlayer(state, direction) {
  if (state.mode !== "combat" || state.combatTurn !== "player" || state.gameOver) {
    return { ok: false, reason: "not-player-combat-turn" };
  }

  const next = nextCoord(state.combat.player, direction);
  if (!next) return { ok: false, reason: "invalid-direction" };
  if (!inBounds(next.x, next.y, COMBAT_GRID_SIZE)) {
    return { ok: false, reason: "out-of-bounds" };
  }

  const enemy = state.combat.enemy;
  if (next.x === enemy.x && next.y === enemy.y) {
    return { ok: false, reason: "occupied" };
  }

  state.combat.player = next;
  return { ok: true, pos: next };
}

export function moveEnemyInCombat(state) {
  if (state.mode !== "combat" || state.combatTurn !== "enemy" || state.gameOver) {
    return { action: "none" };
  }

  if (areCombatantsAdjacent(state)) {
    return { action: "attack" };
  }

  const enemy = state.combat.enemy;
  const player = state.combat.player;
  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;

  if (Math.abs(dx) > Math.abs(dy)) {
    enemy.x += Math.sign(dx);
  } else if (dy !== 0) {
    enemy.y += Math.sign(dy);
  }

  enemy.x = Math.max(0, Math.min(COMBAT_GRID_SIZE - 1, enemy.x));
  enemy.y = Math.max(0, Math.min(COMBAT_GRID_SIZE - 1, enemy.y));

  return { action: "move", pos: { ...enemy } };
}

export function resolveCombatAttack(state, attackerKey, rng) {
  if (state.mode !== "combat" || state.gameOver) {
    return { ok: false, reason: "not-in-combat" };
  }

  const attacker = state.units[attackerKey];
  const defenderKey = attackerKey === "player" ? "enemy" : "player";
  const defender = state.units[defenderKey];

  const attackerRoll = rng.d20();
  const defenderRoll = rng.d20();
  const attackerScore = attackerRoll + attacker.hp;
  const defenderScore = defenderRoll + defender.hp;
  const attackerWon = attackerScore >= defenderScore;

  if (attackerWon) {
    defender.hp = 0;
    state.gameOver = true;
  } else {
    attacker.hp = 0;
    state.gameOver = true;
  }

  return {
    ok: true,
    attackerKey,
    defenderKey,
    attackerRoll,
    defenderRoll,
    winner: attackerWon ? attackerKey : defenderKey
  };
}

function nextCoord(current, direction) {
  if (direction === "ArrowUp") return { x: current.x, y: current.y - 1 };
  if (direction === "ArrowDown") return { x: current.x, y: current.y + 1 };
  if (direction === "ArrowLeft") return { x: current.x - 1, y: current.y };
  if (direction === "ArrowRight") return { x: current.x + 1, y: current.y };
  return null;
}
