import { COLORS, MAP_GRID_SIZE, RACES } from "./constants.js";

export function createInitialState() {
  return {
    mode: "map",
    turn: "player",
    combatTurn: "player",
    gameOver: false,
    combat: null,
    units: {
      player: {
        race: RACES.PLAYER,
        x: 1,
        y: 1,
        hp: 10,
        color: COLORS.PLAYER
      },
      enemy: {
        race: RACES.ENEMY,
        x: MAP_GRID_SIZE - 2,
        y: MAP_GRID_SIZE - 2,
        hp: 10,
        color: COLORS.ENEMY
      }
    }
  };
}

export function cloneState(state) {
  return structuredClone(state);
}
