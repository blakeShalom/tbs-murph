import { COLORS, DEFAULT_COMBAT_MP, DEFAULT_MAP_MP, MAP_GRID_SIZE, RACES } from "./constants.js";
import { createMapTerrain } from "../systems/terrain.js";

export function createInitialState() {
  return {
    mode: "map",
    turn: "player",
    combatTurn: "player",
    gameOver: false,
    combat: null,
    mapTerrain: createMapTerrain(MAP_GRID_SIZE),
    units: {
      player: {
        race: RACES.PLAYER,
        x: 1,
        y: 1,
        hp: 10,
        color: COLORS.PLAYER,
        maxMapMp: DEFAULT_MAP_MP,
        currentMapMp: DEFAULT_MAP_MP,
        maxCombatMp: DEFAULT_COMBAT_MP,
        currentCombatMp: DEFAULT_COMBAT_MP
      },
      enemy: {
        race: RACES.ENEMY,
        x: MAP_GRID_SIZE - 2,
        y: MAP_GRID_SIZE - 2,
        hp: 10,
        color: COLORS.ENEMY,
        maxMapMp: DEFAULT_MAP_MP,
        currentMapMp: DEFAULT_MAP_MP,
        maxCombatMp: DEFAULT_COMBAT_MP,
        currentCombatMp: DEFAULT_COMBAT_MP
      }
    }
  };
}

export function cloneState(state) {
  return structuredClone(state);
}
