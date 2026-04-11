import { COMBAT_GRID_SIZE } from "../core/constants.js";
import { inBounds, manhattanDistance } from "./grid.js";
import { createCombatTerrain, getCombatTerrainRule } from "./terrain.js";

function getDefendingSide(attacker) {
  return attacker === "player" ? "enemy" : "player";
}

export function startCombat(state, attacker) {
  state.mode = "combat";
  state.combatTurn = getDefendingSide(attacker);
  state.combat = {
    player: { x: 1, y: Math.floor(COMBAT_GRID_SIZE / 2) },
    enemy: { x: COMBAT_GRID_SIZE - 2, y: Math.floor(COMBAT_GRID_SIZE / 2) }
  };
  state.combatTerrain = createCombatTerrain(COMBAT_GRID_SIZE);
  state.units.player.currentCombatMp = state.units.player.maxCombatMp;
  state.units.enemy.currentCombatMp = state.units.enemy.maxCombatMp;
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

  const terrainType = state.combatTerrain[next.y][next.x];
  const terrainRule = getCombatTerrainRule(terrainType);

  if (!terrainRule.passable) {
    return { ok: false, reason: "impassable", terrain: terrainType };
  }

  const playerUnit = state.units.player;
  if (playerUnit.currentCombatMp < terrainRule.cost) {
    return {
      ok: false,
      reason: "insufficient-combat-mp",
      terrain: terrainType,
      cost: terrainRule.cost,
      remainingMp: playerUnit.currentCombatMp
    };
  }

  state.combat.player = next;
  playerUnit.currentCombatMp -= terrainRule.cost;
  return {
    ok: true,
    pos: next,
    terrain: terrainType,
    cost: terrainRule.cost,
    remainingMp: playerUnit.currentCombatMp
  };
}

export function moveEnemyInCombat(state) {
  if (state.mode !== "combat" || state.combatTurn !== "enemy" || state.gameOver) {
    return { action: "none" };
  }

  const enemyUnit = state.units.enemy;
  const enemyPos = state.combat.enemy;
  const playerPos = state.combat.player;

  if (areCombatantsAdjacent(state)) {
    return { action: "attack" };
  }

  let moved = false;
  let lastPos = { ...enemyPos };

  while (enemyUnit.currentCombatMp > 0 && !areCombatantsAdjacent(state)) {
    const options = getMoveOptions(enemyPos, playerPos);
    let selected = null;

    for (const option of options) {
      if (!inBounds(option.x, option.y, COMBAT_GRID_SIZE)) {
        continue;
      }

      if (option.x === playerPos.x && option.y === playerPos.y) {
        continue;
      }

      const terrainType = state.combatTerrain[option.y][option.x];
      const terrainRule = getCombatTerrainRule(terrainType);
      if (!terrainRule.passable || terrainRule.cost > enemyUnit.currentCombatMp) {
        continue;
      }

      selected = { ...option, terrainType, cost: terrainRule.cost };
      break;
    }

    if (!selected) {
      break;
    }

    enemyPos.x = selected.x;
    enemyPos.y = selected.y;
    enemyUnit.currentCombatMp -= selected.cost;
    moved = true;
    lastPos = { ...enemyPos };
  }

  if (areCombatantsAdjacent(state)) {
    if (moved) {
      return { action: "move-then-attack", pos: lastPos, remainingMp: enemyUnit.currentCombatMp };
    }
    return { action: "attack" };
  }

  if (moved) {
    return { action: "move", pos: lastPos, remainingMp: enemyUnit.currentCombatMp };
  }

  return { action: "hold" };
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

function getMoveOptions(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const options = [];

  if (Math.abs(dx) >= Math.abs(dy)) {
    if (dx !== 0) options.push({ x: from.x + Math.sign(dx), y: from.y });
    if (dy !== 0) options.push({ x: from.x, y: from.y + Math.sign(dy) });
  } else {
    if (dy !== 0) options.push({ x: from.x, y: from.y + Math.sign(dy) });
    if (dx !== 0) options.push({ x: from.x + Math.sign(dx), y: from.y });
  }

  return options;
}

function nextCoord(current, direction) {
  if (direction === "ArrowUp") return { x: current.x, y: current.y - 1 };
  if (direction === "ArrowDown") return { x: current.x, y: current.y + 1 };
  if (direction === "ArrowLeft") return { x: current.x - 1, y: current.y };
  if (direction === "ArrowRight") return { x: current.x + 1, y: current.y };
  return null;
}
