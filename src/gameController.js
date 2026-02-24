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

export function createGameController({ ui, renderer, randomFn } = {}) {
  const rng = createRng(randomFn);
  let state = createInitialState();

  function status(message) {
    ui.setStatus(message);
  }

  function syncUi() {
    ui.setMode(state.mode === "map" ? "Map" : "Combat");
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
    status("Map View: Use arrow keys to move Dawnforged. Overlap the enemy to trigger combat.");
    syncUi();
  }

  function startCombatFor(initiator) {
    startCombat(state, initiator);
    status(`Combat View: ${state.units.player.race} engages ${state.units.enemy.race} on tactical grid. ${initiator === "player" ? "Your" : "Enemy"} combat turn.`);
    syncUi();
    if (initiator === "enemy") {
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
      syncUi();
      enemyCombatTurn();
    }
  }

  function enemyCombatTurn() {
    if (state.mode !== "combat" || state.combatTurn !== "enemy" || state.gameOver) {
      return;
    }

    const action = moveEnemyInCombat(state);
    if (action.action === "attack") {
      status("Combat View: Ironclad attacks...");
      syncUi();
      const result = resolveCombatAttack(state, "enemy", rng);
      handleCombatResolution(result);
      if (!state.gameOver) {
        state.combatTurn = "player";
        status("Combat View: Your combat turn.");
        syncUi();
      }
      return;
    }

    if (action.action === "move") {
      state.combatTurn = "player";
      status(`Combat View: Ironclad repositions to (${action.pos.x}, ${action.pos.y}). Your combat turn.`);
      syncUi();
    }
  }

  function move(direction) {
    if (state.mode === "map") {
      const result = moveMapPlayer(state, direction);
      if (!result.ok) {
        if (result.reason === "out-of-bounds") {
          status("Invalid move. Stay inside the map.");
          syncUi();
        }
        return;
      }

      status(`Map View: Dawnforged moved to (${result.pos.x}, ${result.pos.y}).`);
      if (result.overlap) {
        startCombatFor("player");
        return;
      }
      syncUi();
      return;
    }

    const result = moveCombatPlayer(state, direction);
    if (!result.ok) {
      if (result.reason === "out-of-bounds") status("Combat View: Invalid move.");
      if (result.reason === "occupied") status("Combat View: Occupied tile. Move adjacent, then attack.");
      syncUi();
      return;
    }

    status(`Combat View: Dawnforged repositions to (${result.pos.x}, ${result.pos.y}).`);
    syncUi();
  }

  function endTurn() {
    if (state.gameOver) return;

    if (state.mode === "combat") {
      if (state.combatTurn !== "player") return;
      state.combatTurn = "enemy";
      status("Combat View: You ended your combat turn.");
      syncUi();
      enemyCombatTurn();
      return;
    }

    if (state.turn !== "player") return;
    state.turn = "enemy";
    status("Map View: Ironclad is taking a map turn...");
    syncUi();

    const result = moveEnemyOnMap(state);
    if (result.ok && result.overlap) {
      startCombatFor("enemy");
      return;
    }

    state.turn = "player";
    status(`Map View: Ironclad moved to (${state.units.enemy.x}, ${state.units.enemy.y}). Your map turn.`);
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
