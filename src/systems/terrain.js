export const MAP_TERRAIN_RULES = {
  plains: { label: "Plains", cost: 1, passable: true, color: "#d8e2c5" },
  forest: { label: "Forest", cost: 2, passable: true, color: "#9fbe8a" },
  hill: { label: "Hill", cost: 2, passable: true, color: "#c7b07a" },
  water: { label: "Water", cost: Infinity, passable: false, color: "#78a6d6" }
};

export const COMBAT_TERRAIN_RULES = {
  open: { label: "Open", cost: 1, passable: true, color: "#e6dbbf" },
  rough: { label: "Rough", cost: 2, passable: true, color: "#c6b487" },
  cover: { label: "Cover", cost: 1, passable: true, color: "#9ab287" },
  blocked: { label: "Blocked", cost: Infinity, passable: false, color: "#6f6759" }
};

export function getMapTerrainRule(type) {
  return MAP_TERRAIN_RULES[type] || MAP_TERRAIN_RULES.plains;
}

export function getCombatTerrainRule(type) {
  return COMBAT_TERRAIN_RULES[type] || COMBAT_TERRAIN_RULES.open;
}

export function getTerrainRule(type) {
  return getMapTerrainRule(type);
}

export function createMapTerrain(size) {
  const grid = [];

  for (let y = 0; y < size; y += 1) {
    const row = [];
    for (let x = 0; x < size; x += 1) {
      let tile = "plains";
      const noise = (x * 17 + y * 31) % 19;

      if (x === 0 || y === 0 || x === size - 1 || y === size - 1) {
        tile = "plains";
      } else if (noise === 0 || noise === 7) {
        tile = "water";
      } else if (noise % 5 === 0) {
        tile = "hill";
      } else if (noise % 3 === 0) {
        tile = "forest";
      }

      row.push(tile);
    }
    grid.push(row);
  }

  const mid = Math.floor(size / 2);
  for (let x = 0; x < size; x += 1) {
    grid[mid][x] = "plains";
  }
  for (let y = 0; y < size; y += 1) {
    grid[y][1] = "plains";
    grid[y][size - 2] = "plains";
  }

  grid[1][1] = "plains";
  grid[size - 2][size - 2] = "plains";

  return grid;
}

export function createCombatTerrain(size) {
  const grid = [];

  for (let y = 0; y < size; y += 1) {
    const row = [];
    for (let x = 0; x < size; x += 1) {
      let tile = "open";
      const noise = (x * 13 + y * 29) % 23;

      if (noise === 0 || noise === 9) {
        tile = "blocked";
      } else if (noise % 5 === 0) {
        tile = "rough";
      } else if (noise % 3 === 0) {
        tile = "cover";
      }

      row.push(tile);
    }
    grid.push(row);
  }

  const mid = Math.floor(size / 2);
  for (let x = 0; x < size; x += 1) {
    grid[mid][x] = "open";
  }

  const pStart = { x: 1, y: mid };
  const eStart = { x: size - 2, y: mid };
  grid[pStart.y][pStart.x] = "open";
  grid[eStart.y][eStart.x] = "open";

  return grid;
}
