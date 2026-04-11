import { createInitialState } from "./core/state.js";
import { createRng } from "./core/rng.js";
import {
  areCombatantsAdjacent,
  moveCombatPlayer,
  moveEnemyInCombat,
  resolveCombatAttack,
  startCombat
} from "./systems/combat.js";
import { moveEnemyOnMap, moveMapPlayer } from "./systems/map.js";
import { getCombatTerrainRule, getMapTerrainRule } from "./systems/terrain.js";

export function createGameController({ ui, renderer, randomFn } = {}) {
  const rng = createRng(randomFn);
  let state = createInitialState();

  function status(message) {
    ui.setStatus(message);
  }

  function syncUi() {
    ui.setMode(state.mode === "map" ? "Map" : "Combat");
    ui.setMapMp?.(`${state.units.player.currentMapMp}/${state.units.player.maxMapMp}`);
    ui.setCombatMp?.(`${state.units.player.currentCombatMp}/${state.units.player.maxCombatMp}`);

    const attackDisabled =
      state.mode !== "combat" ||
      state.combatTurn !== "player" ||
      state.gameOver ||
      !areCombatantsAdjacent(state);
    ui.setAttackDisabled(attackDisabled);
    ui.setEndTurnDisabled(state.gameOver);
    renderer.draw(state);
  }

  function reset() {
    state = createInitialState();
    status("Map View: Use arrow keys to move Dawnforged. Terrain costs MP and water is impassable.");
    syncUi();
  }

  function startCombatFor(attacker) {
    startCombat(state, attacker);
    status(`Combat View: ${state.units.player.race} engages ${state.units.enemy.race} on tactical grid. ${state.combatTurn === "player" ? "Your" : "Enemy"} combat turn.`);
    syncUi();
    if (state.combatTurn === "enemy") {
      enemyCombatTurn();
    }
  }

  function handleCombatResolution(result) {
    if (!result.ok) return;
    if (state.gameOver) {
      const winner = state.units[result.winner];
      status(`${winner.race} wins combat (roll ${result.attackerRoll} vs ${result.defenderRoll}). Game over.`);
      syncUi();
    }
  }

  function playerAttack() {
    if (state.mode !== "combat" || state.combatTurn !== "player" || state.gameOver) {
      return;
    }
    if (!areCombatantsAdjacent(state)) {
      status("Combat View: Move adjacent to attack.");
      syncUi();
      return;
    }

    const result = resolveCombatAttack(state, "player", rng);
    handleCombatResolution(result);

    if (!state.gameOver) {
      state.combatTurn = "enemy";
      state.units.enemy.currentCombatMp = state.units.enemy.maxCombatMp;
      syncUi();
      enemyCombatTurn();
    }
  }

  function enemyCombatTurn() {
    if (state.mode !== "combat" || state.combatTurn !== "enemy" || state.gameOver) {
      return;
    }

    const action = moveEnemyInCombat(state);

    if (action.action === "move") {
      state.combatTurn = "player";
      state.units.player.currentCombatMp = state.units.player.maxCombatMp;
      status(`Combat View: Ironclad repositions to (${action.pos.x}, ${action.pos.y}). Your combat turn.`);
      syncUi();
      return;
    }

    if (action.action === "move-then-attack") {
      status(`Combat View: Ironclad repositions to (${action.pos.x}, ${action.pos.y}) and attacks...`);
      syncUi();
      const result = resolveCombatAttack(state, "enemy", rng);
      handleCombatResolution(result);
      if (!state.gameOver) {
        state.combatTurn = "player";
        state.units.player.currentCombatMp = state.units.player.maxCombatMp;
        status("Combat View: Your combat turn.");
        syncUi();
      }
      return;
    }

    if (action.action === "attack") {
      status("Combat View: Ironclad attacks...");
      syncUi();
      const result = resolveCombatAttack(state, "enemy", rng);
      handleCombatResolution(result);
      if (!state.gameOver) {
        state.combatTurn = "player";
        state.units.player.currentCombatMp = state.units.player.maxCombatMp;
        status("Combat View: Your combat turn.");
        syncUi();
      }
      return;
    }

    state.combatTurn = "player";
    state.units.player.currentCombatMp = state.units.player.maxCombatMp;
    status("Combat View: Ironclad holds due to terrain/MP limits. Your combat turn.");
    syncUi();
  }

  function move(direction) {
    if (state.mode === "map") {
      const result = moveMapPlayer(state, direction);
      if (!result.ok) {
        if (result.reason === "out-of-bounds") {
          status("Invalid move. Stay inside the map.");
        }
        if (result.reason === "impassable") {
          const terrain = getMapTerrainRule(result.terrain);
          status(`Map View: ${terrain.label} is impassable.`);
        }
        if (result.reason === "insufficient-mp") {
          const terrain = getMapTerrainRule(result.terrain);
          status(`Map View: Need ${result.cost} MP for ${terrain.label}. Remaining MP: ${result.remainingMp}.`);
        }
        syncUi();
        return;
      }

      const terrain = getMapTerrainRule(result.terrain);
      status(`Map View: Dawnforged moved to (${result.pos.x}, ${result.pos.y}) on ${terrain.label} (${result.cost} MP). Remaining MP: ${result.remainingMp}.`);

      if (result.overlap) {
        startCombatFor("player");
        return;
      }
      if (result.remainingMp <= 0) {
        status(`Map View: Dawnforged moved to (${result.pos.x}, ${result.pos.y}) on ${terrain.label} (${result.cost} MP). Remaining MP: 0. No MP left, end your turn.`);
      }
      syncUi();
      return;
    }

    const result = moveCombatPlayer(state, direction);
    if (!result.ok) {
      if (result.reason === "out-of-bounds") status("Combat View: Invalid move.");
      if (result.reason === "occupied") status("Combat View: Occupied tile. Move adjacent, then attack.");
      if (result.reason === "impassable") {
        const terrain = getCombatTerrainRule(result.terrain);
        status(`Combat View: ${terrain.label} is impassable.`);
      }
      if (result.reason === "insufficient-combat-mp") {
        const terrain = getCombatTerrainRule(result.terrain);
        status(`Combat View: Need ${result.cost} MP for ${terrain.label}. Remaining MP: ${result.remainingMp}.`);
      }
      syncUi();
      return;
    }

    const terrain = getCombatTerrainRule(result.terrain);
    status(`Combat View: Dawnforged repositions to (${result.pos.x}, ${result.pos.y}) on ${terrain.label} (${result.cost} MP). Remaining MP: ${result.remainingMp}.`);
    syncUi();
  }

  function endTurn() {
    if (state.gameOver) return;

    if (state.mode === "combat") {
      if (state.combatTurn !== "player") return;
      state.combatTurn = "enemy";
      state.units.enemy.currentCombatMp = state.units.enemy.maxCombatMp;
      status("Combat View: You ended your combat turn.");
      syncUi();
      enemyCombatTurn();
      return;
    }

    if (state.turn !== "player") return;
    state.turn = "enemy";
    state.units.enemy.currentMapMp = state.units.enemy.maxMapMp;
    status("Map View: Ironclad is taking a map turn...");
    syncUi();

    const result = moveEnemyOnMap(state);
    if (result.ok && result.overlap) {
      startCombatFor("enemy");
      return;
    }

    state.turn = "player";
    state.units.player.currentMapMp = state.units.player.maxMapMp;

    if (result.ok && result.moved) {
      status(`Map View: Ironclad moved to (${state.units.enemy.x}, ${state.units.enemy.y}). Your map turn.`);
    } else {
      status("Map View: Ironclad holds position due to terrain/MP limits. Your map turn.");
    }
    syncUi();
  }

  function getState() {
    return state;
  }

  return {
    reset,
    move,
    endTurn,
    playerAttack,
    syncUi,
    getState
  };
}
