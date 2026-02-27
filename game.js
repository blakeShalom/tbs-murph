const TILE_SIZE = 64;
const GRID_SIZE = 10;
const COMBAT_GRID_SIZE = 8;
const COMBAT_TILE_SIZE = boardSize() / COMBAT_GRID_SIZE;
const FOG_RADIUS = 2;

const MAP_TERRAIN_RULES = {
  plains: { label: "Plains", cost: 1, passable: true, color: "#d8e2c5" },
  forest: { label: "Forest", cost: 2, passable: true, color: "#9fbe8a" },
  hill: { label: "Hill", cost: 2, passable: true, color: "#c7b07a" },
  water: { label: "Water", cost: Infinity, passable: false, color: "#78a6d6" }
};

const COMBAT_TERRAIN_RULES = {
  open: { label: "Open", cost: 1, passable: true, color: "#e6dbbf" },
  rough: { label: "Rough", cost: 2, passable: true, color: "#c6b487" },
  cover: { label: "Cover", cost: 1, passable: true, color: "#9ab287" },
  blocked: { label: "Blocked", cost: Infinity, passable: false, color: "#6f6759" }
};

const SUBSCRIPT_DIGITS = {
  "0": "₀",
  "1": "₁",
  "2": "₂",
  "3": "₃",
  "4": "₄",
  "5": "₅",
  "6": "₆",
  "7": "₇",
  "8": "₈",
  "9": "₉"
};

const RANDOM_RACE_ID = "random";
const RACE_OPTIONS = [
  { id: "dawnforged", name: "Dawnforged", token: "D", color: "#3b7a57" },
  { id: "ironclad", name: "Ironclad", token: "I", color: "#7f2f2f" },
  { id: "sylvan", name: "Sylvan", token: "S", color: "#2f6e49" },
  { id: "emberkin", name: "Emberkin", token: "E", color: "#b35d2a" },
  { id: "tideborn", name: "Tideborn", token: "T", color: "#2f5f8c" },
  { id: "stoneguard", name: "Stoneguard", token: "G", color: "#5f655f" }
];

function boardSize() {
  return 640;
}

const board = document.getElementById("board");
const ctx = board.getContext("2d");
const setupScreenEl = document.getElementById("setupScreen");
const playerRaceSelectEl = document.getElementById("playerRaceSelect");
const enemyRaceSelectEl = document.getElementById("enemyRaceSelect");
const startGameBtnEl = document.getElementById("startGameBtn");
const hudPanelEl = document.getElementById("hudPanel");
const boardWrapEl = document.getElementById("boardWrap");
const statusEl = document.getElementById("status");
const modeLabelEl = document.getElementById("modeLabel");
const mapMpLabelEl = document.getElementById("mapMpLabel");
const combatMpLabelEl = document.getElementById("combatMpLabel");
const raceALabelEl = document.getElementById("raceALabel");
const raceBLabelEl = document.getElementById("raceBLabel");
const attackBtn = document.getElementById("attackBtn");
const endTurnBtn = document.getElementById("endTurnBtn");
const resetBtn = document.getElementById("resetBtn");

let timelineToken = 0;
const pendingActions = [];
let gameStarted = false;
let selectedRaces = {
  player: RANDOM_RACE_ID,
  enemy: RANDOM_RACE_ID
};

function getRaceById(raceId) {
  return RACE_OPTIONS.find((race) => race.id === raceId) || RACE_OPTIONS[0];
}

function resolveRaceChoice(choiceId) {
  if (choiceId === RANDOM_RACE_ID) {
    return RACE_OPTIONS[randomInt(0, RACE_OPTIONS.length - 1)];
  }
  return getRaceById(choiceId);
}

function setGamePanelsVisible(visible) {
  hudPanelEl.classList.toggle("hidden-until-start", !visible);
  boardWrapEl.classList.toggle("hidden-until-start", !visible);
  setupScreenEl.classList.toggle("hidden", visible);
}

function updateRaceLabels() {
  raceALabelEl.textContent = state.stacks.player.race;
  raceBLabelEl.textContent = state.stacks.enemy.race;
}

const initialState = () => {
  const playerRace = resolveRaceChoice(selectedRaces.player);
  const enemyRace = resolveRaceChoice(selectedRaces.enemy);
  const mapTerrain = createMapTerrain(GRID_SIZE);
  const starts = pickRandomStartPositions(mapTerrain);
  const playerStack = createStack("player", playerRace, starts.player.x, starts.player.y);
  const enemyStack = createStack("enemy", enemyRace, starts.enemy.x, starts.enemy.y);
  const fog = {
    player: { radius: FOG_RADIUS, explored: createFogGrid(GRID_SIZE) },
    enemy: { radius: FOG_RADIUS, explored: createFogGrid(GRID_SIZE) }
  };

  revealFogArea(fog.player.explored, playerStack.x, playerStack.y, fog.player.radius);
  revealFogArea(fog.enemy.explored, enemyStack.x, enemyStack.y, fog.enemy.radius);

  return {
    mode: "map",
    turn: "player",
    combatTurn: "player",
    gameOver: false,
    combat: null,
    mapTerrain,
    combatTerrain: null,
    fog,
    stacks: {
      player: playerStack,
      enemy: enemyStack
    }
  };
};

let state = initialState();

function createStack(side, race, x, y) {
  const count = randomInt(1, 8);
  const units = [];

  for (let i = 0; i < count; i += 1) {
    units.push({
      id: `${side[0].toUpperCase()}${i + 1}`,
      label: `${race.token}${i + 1}`,
      alive: true,
      hp: 1,
      maxCombatMp: randomInt(1, 3),
      currentCombatMp: 0,
      x: null,
      y: null
    });
  }

  return {
    race: race.name,
    raceId: race.id,
    token: race.token,
    color: race.color,
    x,
    y,
    maxMapMp: 3,
    currentMapMp: 3,
    units
  };
}

function createFogGrid(size) {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => false));
}

function pickRandomStartPositions(mapTerrain) {
  const passableTiles = [];

  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const terrainRule = getMapTerrainRule(mapTerrain[y][x]);
      if (terrainRule.passable) {
        passableTiles.push({ x, y });
      }
    }
  }

  if (passableTiles.length < 2) {
    return {
      player: { x: 1, y: 1 },
      enemy: { x: GRID_SIZE - 2, y: GRID_SIZE - 2 }
    };
  }

  const player = passableTiles[randomInt(0, passableTiles.length - 1)];
  const farTiles = passableTiles.filter(
    (tile) => !(tile.x === player.x && tile.y === player.y) && manhattan(tile, player) >= 4
  );
  const enemyPool = farTiles.length > 0
    ? farTiles
    : passableTiles.filter((tile) => !(tile.x === player.x && tile.y === player.y));
  const enemy = enemyPool[randomInt(0, enemyPool.length - 1)];

  return { player, enemy };
}

function createMapTerrain(size) {
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

function createCombatTerrain(size) {
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

  return grid;
}

function scheduleAction(delayMs, fn) {
  const task = {
    remaining: delayMs,
    fn,
    done: false,
    token: timelineToken
  };
  pendingActions.push(task);

  setTimeout(() => {
    if (task.done || task.token !== timelineToken) return;
    task.done = true;
    flushDoneTasks();
    fn();
  }, delayMs);
}

function advanceScheduledActions(ms) {
  const due = [];
  for (const task of pendingActions) {
    if (task.done || task.token !== timelineToken) continue;
    task.remaining -= ms;
    if (task.remaining <= 0) {
      task.done = true;
      due.push(task.fn);
    }
  }
  flushDoneTasks();
  for (const fn of due) {
    fn();
  }
}

function flushDoneTasks() {
  let i = pendingActions.length - 1;
  while (i >= 0) {
    if (pendingActions[i].done || pendingActions[i].token !== timelineToken) {
      pendingActions.splice(i, 1);
    }
    i -= 1;
  }
}

function inBounds(x, y, size = GRID_SIZE) {
  return x >= 0 && y >= 0 && x < size && y < size;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function toSubscript(n) {
  return String(n)
    .split("")
    .map((digit) => SUBSCRIPT_DIGITS[digit] || digit)
    .join("");
}

function getMapTerrainRule(type) {
  return MAP_TERRAIN_RULES[type] || MAP_TERRAIN_RULES.plains;
}

function getCombatTerrainRule(type) {
  return COMBAT_TERRAIN_RULES[type] || COMBAT_TERRAIN_RULES.open;
}

function getMapTerrainAt(x, y) {
  return state.mapTerrain[y][x];
}

function getCombatTerrainAt(x, y) {
  return state.combatTerrain[y][x];
}

function getAliveUnits(side) {
  return state.stacks[side].units.filter((unit) => unit.alive);
}

function getStackCount(side) {
  return getAliveUnits(side).length;
}

function unitName(unit) {
  return unit.label || unit.id;
}

function getActivePlayerUnit() {
  if (!state.combat) return null;
  const alive = getAliveUnits("player");
  if (alive.length === 0) return null;

  let current = alive.find((unit) => unit.id === state.combat.activePlayerUnitId);
  if (!current) {
    current = alive[0];
    state.combat.activePlayerUnitId = current.id;
  }
  return current;
}

function cycleActivePlayerUnit() {
  if (state.mode !== "combat" || state.combatTurn !== "player" || state.gameOver) {
    return;
  }

  const alive = getAliveUnits("player");
  if (alive.length === 0) return;

  const currentId = state.combat.activePlayerUnitId;
  const index = alive.findIndex((unit) => unit.id === currentId);
  const next = alive[(index + 1 + alive.length) % alive.length];
  state.combat.activePlayerUnitId = next.id;
  clearTargetingMode();
  statusEl.textContent = `Combat View: Selected ${unitName(next)} (${next.currentCombatMp}/${next.maxCombatMp} MP).`;
  updateControls();
  draw();
}

function getCombatUnitAt(x, y) {
  for (const side of ["player", "enemy"]) {
    for (const unit of getAliveUnits(side)) {
      if (unit.x === x && unit.y === y) {
        return { side, unit };
      }
    }
  }
  return null;
}

function isOccupied(x, y, ignoreId = null) {
  const hit = getCombatUnitAt(x, y);
  return Boolean(hit && hit.unit.id !== ignoreId);
}

function manhattan(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function chebyshev(x1, y1, x2, y2) {
  return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
}

function revealFogArea(exploredGrid, cx, cy, radius) {
  for (let y = cy - radius; y <= cy + radius; y += 1) {
    for (let x = cx - radius; x <= cx + radius; x += 1) {
      if (inBounds(x, y, GRID_SIZE)) {
        exploredGrid[y][x] = true;
      }
    }
  }
}

function isTileVisibleToPlayer(x, y) {
  if (state.mode !== "map") return true;
  const player = state.stacks.player;
  return chebyshev(player.x, player.y, x, y) <= state.fog.player.radius;
}

function adjacentTargets(attacker, defenderSide) {
  return getAliveUnits(defenderSide).filter((unit) => manhattan(attacker, unit) === 1);
}

function getDirectionDelta(key) {
  if (key === "ArrowUp") return { dx: 0, dy: -1 };
  if (key === "ArrowDown") return { dx: 0, dy: 1 };
  if (key === "ArrowLeft") return { dx: -1, dy: 0 };
  if (key === "ArrowRight") return { dx: 1, dy: 0 };
  return null;
}

function clearTargetingMode() {
  if (state.combat) {
    state.combat.targeting = false;
  }
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

function nearestTarget(from, candidates) {
  let best = null;
  let bestDistance = Infinity;

  for (const candidate of candidates) {
    const d = manhattan(from, candidate);
    if (d < bestDistance) {
      bestDistance = d;
      best = candidate;
    }
  }
  return best;
}

function rollCombat(attacker, defender) {
  const attackerRoll = randomInt(1, 20);
  const defenderRoll = randomInt(1, 20);
  const attackerScore = attackerRoll + attacker.maxCombatMp;
  const defenderScore = defenderRoll + defender.maxCombatMp;

  return {
    attackerRoll,
    defenderRoll,
    winner: attackerScore >= defenderScore ? "attacker" : "defender"
  };
}

function resolveAttack(attackerSide, attacker, defenderSide, defender) {
  const result = rollCombat(attacker, defender);

  if (result.winner === "attacker") {
    defender.alive = false;
    defender.hp = 0;
    defender.x = null;
    defender.y = null;
    return {
      ...result,
      eliminated: unitName(defender),
      winnerSide: attackerSide,
      loserSide: defenderSide
    };
  }

  attacker.alive = false;
  attacker.hp = 0;
  attacker.x = null;
  attacker.y = null;
  return {
    ...result,
    eliminated: unitName(attacker),
    winnerSide: defenderSide,
    loserSide: attackerSide
  };
}

function checkCombatEnd() {
  const playerCount = getStackCount("player");
  const enemyCount = getStackCount("enemy");

  if (playerCount <= 0 || enemyCount <= 0) {
    state.gameOver = true;
    const winnerSide = playerCount > 0 ? "player" : "enemy";
    statusEl.textContent = `${state.stacks[winnerSide].race} stack wins (${getStackCount("player")} vs ${getStackCount("enemy")}). Game over.`;
    return true;
  }
  return false;
}

function resetCombatMp(side) {
  for (const unit of getAliveUnits(side)) {
    unit.currentCombatMp = unit.maxCombatMp;
  }
}

function placeCombatUnits() {
  const placeSide = (side) => {
    const alive = getAliveUnits(side);
    const slots = [];
    const primaryX = side === "player" ? 1 : COMBAT_GRID_SIZE - 2;
    const secondaryX = side === "player" ? 2 : COMBAT_GRID_SIZE - 3;

    for (let y = 1; y < COMBAT_GRID_SIZE - 1; y += 1) {
      slots.push({ x: primaryX, y });
      slots.push({ x: secondaryX, y });
    }

    for (let i = 0; i < alive.length; i += 1) {
      const slot = slots[i];
      alive[i].x = slot.x;
      alive[i].y = slot.y;
    }
  };

  placeSide("player");
  placeSide("enemy");
}

function updateControls() {
  modeLabelEl.textContent = state.mode === "map" ? "Map" : "Combat";
  mapMpLabelEl.textContent = `${state.stacks.player.currentMapMp}/${state.stacks.player.maxMapMp}`;

  const active = getActivePlayerUnit();
  if (combatMpLabelEl) {
    combatMpLabelEl.textContent = active
      ? `${unitName(active)} ${active.currentCombatMp}/${active.maxCombatMp}`
      : `0/0`;
  }

  const canAttack =
    state.mode === "combat" &&
    state.combatTurn === "player" &&
    !state.gameOver &&
    active &&
    adjacentTargets(active, "enemy").length > 0;

  attackBtn.disabled = !canAttack;
  endTurnBtn.disabled = state.gameOver;
}

function startCombat(initiator) {
  state.mode = "combat";
  state.combatTurn = initiator;
  state.combatTerrain = createCombatTerrain(COMBAT_GRID_SIZE);
  state.combat = {
    activePlayerUnitId: null,
    targeting: false
  };

  placeCombatUnits();
  resetCombatMp("player");
  resetCombatMp("enemy");

  const first = getAliveUnits("player")[0];
  state.combat.activePlayerUnitId = first ? first.id : null;

  statusEl.textContent = `Combat View: ${state.stacks.player.race} (${getStackCount("player")}) engages ${state.stacks.enemy.race} (${getStackCount("enemy")}). ${initiator === "player" ? "Your" : "Enemy"} combat turn.`;
  updateControls();
  draw();

  if (initiator === "enemy") {
    scheduleAction(120, enemyCombatTurn);
  }
}

function moveMapStack(key) {
  if (state.mode !== "map" || state.turn !== "player" || state.gameOver) {
    return;
  }
  if (!key.startsWith("Arrow")) {
    return;
  }

  const stack = state.stacks.player;
  let nx = stack.x;
  let ny = stack.y;

  if (key === "ArrowUp") ny -= 1;
  if (key === "ArrowDown") ny += 1;
  if (key === "ArrowLeft") nx -= 1;
  if (key === "ArrowRight") nx += 1;

  if (!inBounds(nx, ny, GRID_SIZE)) {
    statusEl.textContent = "Invalid move. Stay inside the map.";
    return;
  }

  const terrainType = getMapTerrainAt(nx, ny);
  const terrainRule = getMapTerrainRule(terrainType);

  if (!terrainRule.passable) {
    statusEl.textContent = `Map View: ${terrainRule.label} is impassable.`;
    return;
  }

  if (stack.currentMapMp < terrainRule.cost) {
    statusEl.textContent = `Map View: Need ${terrainRule.cost} MP for ${terrainRule.label}. Remaining MP: ${stack.currentMapMp}.`;
    return;
  }

  stack.x = nx;
  stack.y = ny;
  stack.currentMapMp -= terrainRule.cost;
  revealFogArea(state.fog.player.explored, stack.x, stack.y, state.fog.player.radius);
  statusEl.textContent = `Map View: ${stack.race} stack moved to (${nx}, ${ny}) on ${terrainRule.label} (${terrainRule.cost} MP). Remaining MP: ${stack.currentMapMp}.`;

  if (stack.x === state.stacks.enemy.x && stack.y === state.stacks.enemy.y) {
    startCombat("player");
    return;
  }

  if (stack.currentMapMp <= 0) {
    statusEl.textContent += " No MP left, end your turn.";
  }

  updateControls();
  draw();
}

function enemyMapTurn() {
  if (state.mode !== "map" || state.turn !== "enemy" || state.gameOver) {
    return;
  }

  const enemy = state.stacks.enemy;
  const player = state.stacks.player;
  let movedAny = false;

  while (enemy.currentMapMp > 0) {
    const options = getMoveOptions(enemy, player);
    let selected = null;

    for (const option of options) {
      if (!inBounds(option.x, option.y, GRID_SIZE)) continue;

      const terrainRule = getMapTerrainRule(getMapTerrainAt(option.x, option.y));
      if (!terrainRule.passable || terrainRule.cost > enemy.currentMapMp) {
        continue;
      }

      selected = { ...option, cost: terrainRule.cost };
      break;
    }

    if (!selected) break;

    enemy.x = selected.x;
    enemy.y = selected.y;
    enemy.currentMapMp -= selected.cost;
    revealFogArea(state.fog.enemy.explored, enemy.x, enemy.y, state.fog.enemy.radius);
    movedAny = true;

    if (enemy.x === player.x && enemy.y === player.y) {
      startCombat("enemy");
      return;
    }
  }

  state.turn = "player";
  state.stacks.player.currentMapMp = state.stacks.player.maxMapMp;

  if (movedAny) {
    statusEl.textContent = `Map View: ${enemy.race} stack moved to (${enemy.x}, ${enemy.y}). Your map turn.`;
  } else {
    statusEl.textContent = `Map View: ${enemy.race} holds position due to terrain/MP limits. Your map turn.`;
  }

  updateControls();
  draw();
}

function moveCombatActiveUnit(key) {
  if (state.mode !== "combat" || state.combatTurn !== "player" || state.gameOver) {
    return;
  }
  if (!key.startsWith("Arrow")) {
    return;
  }

  const active = getActivePlayerUnit();
  if (!active) {
    statusEl.textContent = "Combat View: No active unit available.";
    return;
  }

  if (active.currentCombatMp <= 0) {
    statusEl.textContent = `Combat View: ${unitName(active)} has no MP. Press A to cycle units or End Turn.`;
    updateControls();
    return;
  }

  let nx = active.x;
  let ny = active.y;

  if (key === "ArrowUp") ny -= 1;
  if (key === "ArrowDown") ny += 1;
  if (key === "ArrowLeft") nx -= 1;
  if (key === "ArrowRight") nx += 1;

  if (!inBounds(nx, ny, COMBAT_GRID_SIZE)) {
    statusEl.textContent = "Combat View: Invalid move.";
    return;
  }

  if (isOccupied(nx, ny, active.id)) {
    statusEl.textContent = "Combat View: Tile occupied by another unit.";
    return;
  }

  const terrainType = getCombatTerrainAt(nx, ny);
  const terrainRule = getCombatTerrainRule(terrainType);

  if (!terrainRule.passable) {
    statusEl.textContent = `Combat View: ${terrainRule.label} is impassable.`;
    return;
  }

  if (active.currentCombatMp < terrainRule.cost) {
    statusEl.textContent = `Combat View: ${unitName(active)} needs ${terrainRule.cost} MP for ${terrainRule.label}. Remaining MP: ${active.currentCombatMp}.`;
    return;
  }

  active.x = nx;
  active.y = ny;
  active.currentCombatMp -= terrainRule.cost;

  statusEl.textContent = `Combat View: ${unitName(active)} moved to (${nx}, ${ny}) on ${terrainRule.label}. Remaining MP: ${active.currentCombatMp}.`;
  updateControls();
  draw();
}

function performPlayerAttack(attacker, defender) {
  const result = resolveAttack("player", attacker, "enemy", defender);
  attacker.currentCombatMp = 0;
  clearTargetingMode();

  statusEl.textContent = `Combat View: ${unitName(attacker)} attacked ${unitName(defender)} (${result.attackerRoll} vs ${result.defenderRoll}). ${result.eliminated} was eliminated.`;

  if (!checkCombatEnd()) {
    const next = getActivePlayerUnit();
    if (!next) {
      state.combatTurn = "enemy";
      resetCombatMp("enemy");
      scheduleAction(120, enemyCombatTurn);
    }
  }

  updateControls();
  draw();
}

function handleDirectionalAttack(key) {
  if (state.mode !== "combat" || !state.combat || !state.combat.targeting) {
    return false;
  }

  const attacker = getActivePlayerUnit();
  if (!attacker) {
    clearTargetingMode();
    return true;
  }

  const delta = getDirectionDelta(key);
  if (!delta) return false;

  const tx = attacker.x + delta.dx;
  const ty = attacker.y + delta.dy;
  const target = getAliveUnits("enemy").find((unit) => unit.x === tx && unit.y === ty);

  if (!target) {
    statusEl.textContent = `Combat View: No enemy in that direction from ${unitName(attacker)}. Choose another direction or press Space to cancel targeting.`;
    updateControls();
    draw();
    return true;
  }

  performPlayerAttack(attacker, target);
  return true;
}

function playerCombatAttack() {
  if (state.mode !== "combat" || state.combatTurn !== "player" || state.gameOver) {
    return;
  }

  const active = getActivePlayerUnit();
  if (!active) {
    return;
  }

  if (state.combat && state.combat.targeting) {
    clearTargetingMode();
    statusEl.textContent = `Combat View: Targeting canceled for ${unitName(active)}.`;
    updateControls();
    draw();
    return;
  }

  const targets = adjacentTargets(active, "enemy");
  if (targets.length === 0) {
    statusEl.textContent = "Combat View: Move adjacent to an enemy unit to attack.";
    updateControls();
    return;
  }

  if (targets.length === 1) {
    performPlayerAttack(active, targets[0]);
    return;
  }

  state.combat.targeting = true;
  statusEl.textContent = `Combat View: ${unitName(active)} has multiple adjacent enemies. Press arrow key toward target to attack.`;
  updateControls();
  draw();
}

function enemyCombatTurn() {
  if (state.mode !== "combat" || state.combatTurn !== "enemy" || state.gameOver) {
    return;
  }

  clearTargetingMode();
  resetCombatMp("enemy");
  const enemyUnits = [...getAliveUnits("enemy")];

  for (const unit of enemyUnits) {
    if (!unit.alive || state.gameOver) continue;

    while (unit.currentCombatMp > 0) {
      const targets = adjacentTargets(unit, "player");
      if (targets.length > 0) {
        const defender = targets[0];
        const result = resolveAttack("enemy", unit, "player", defender);
        unit.currentCombatMp = 0;
        statusEl.textContent = `Combat View: ${unitName(unit)} attacked ${unitName(defender)} (${result.attackerRoll} vs ${result.defenderRoll}). ${result.eliminated} was eliminated.`;

        if (checkCombatEnd()) {
          updateControls();
          draw();
          return;
        }
        break;
      }

      const target = nearestTarget(unit, getAliveUnits("player"));
      if (!target) break;

      const options = getMoveOptions(unit, target);
      let moved = false;

      for (const option of options) {
        if (!inBounds(option.x, option.y, COMBAT_GRID_SIZE)) continue;
        if (isOccupied(option.x, option.y, unit.id)) continue;

        const terrainRule = getCombatTerrainRule(getCombatTerrainAt(option.x, option.y));
        if (!terrainRule.passable || terrainRule.cost > unit.currentCombatMp) {
          continue;
        }

        unit.x = option.x;
        unit.y = option.y;
        unit.currentCombatMp -= terrainRule.cost;
        moved = true;
        break;
      }

      if (!moved) {
        unit.currentCombatMp = 0;
      }
    }
  }

  if (state.gameOver) {
    updateControls();
    draw();
    return;
  }

  state.combatTurn = "player";
  resetCombatMp("player");
  const first = getAliveUnits("player")[0];
  state.combat.activePlayerUnitId = first ? first.id : null;
  statusEl.textContent = "Combat View: Your combat turn. Use A to cycle units.";
  updateControls();
  draw();
}

function endTurn() {
  if (state.gameOver) {
    return;
  }

  if (state.mode === "combat") {
    if (state.combatTurn !== "player") {
      return;
    }

    clearTargetingMode();
    state.combatTurn = "enemy";
    statusEl.textContent = "Combat View: You ended your turn.";
    updateControls();
    draw();
    scheduleAction(120, enemyCombatTurn);
    return;
  }

  if (state.turn !== "player") {
    return;
  }

  state.turn = "enemy";
  state.stacks.enemy.currentMapMp = state.stacks.enemy.maxMapMp;
  statusEl.textContent = `Map View: ${state.stacks.enemy.race} is taking a map turn...`;
  updateControls();
  draw();
  scheduleAction(350, enemyMapTurn);
}

function drawMapGrid() {
  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const visible = isTileVisibleToPlayer(x, y);
      const explored = state.fog.player.explored[y][x];

      if (!visible && !explored) {
        ctx.fillStyle = "#1a1f24";
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = "rgba(35, 42, 49, 0.8)";
        ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        continue;
      }

      const terrainType = state.mapTerrain[y][x];
      const terrainRule = getMapTerrainRule(terrainType);
      ctx.fillStyle = terrainRule.color;
      ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      ctx.strokeStyle = "rgba(0, 0, 0, 0.14)";
      ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

      if (!visible && explored) {
        ctx.fillStyle = "rgba(16, 20, 26, 0.45)";
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }
  }
}

function drawCombatGrid() {
  for (let y = 0; y < COMBAT_GRID_SIZE; y += 1) {
    for (let x = 0; x < COMBAT_GRID_SIZE; x += 1) {
      const terrainType = state.combatTerrain[y][x];
      const terrainRule = getCombatTerrainRule(terrainType);
      ctx.fillStyle = terrainRule.color;
      ctx.fillRect(x * COMBAT_TILE_SIZE, y * COMBAT_TILE_SIZE, COMBAT_TILE_SIZE, COMBAT_TILE_SIZE);
      ctx.strokeStyle = "rgba(0, 0, 0, 0.14)";
      ctx.strokeRect(x * COMBAT_TILE_SIZE, y * COMBAT_TILE_SIZE, COMBAT_TILE_SIZE, COMBAT_TILE_SIZE);
    }
  }
}

function drawStackToken(side, stack) {
  const count = getStackCount(side);
  if (count <= 0) return;

  const cx = stack.x * TILE_SIZE + TILE_SIZE / 2;
  const cy = stack.y * TILE_SIZE + TILE_SIZE / 2;

  ctx.fillStyle = stack.color;
  ctx.beginPath();
  ctx.arc(cx, cy, TILE_SIZE * 0.31, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 18px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${stack.token}${toSubscript(count)}`, cx, cy + 6);
}

function drawCombatUnits() {
  const active = getActivePlayerUnit();
  const targetableIds = new Set(
    state.combat?.targeting && active
      ? adjacentTargets(active, "enemy").map((unit) => unit.id)
      : []
  );

  const drawSide = (side, color) => {
    for (const unit of getAliveUnits(side)) {
      const cx = unit.x * COMBAT_TILE_SIZE + COMBAT_TILE_SIZE / 2;
      const cy = unit.y * COMBAT_TILE_SIZE + COMBAT_TILE_SIZE / 2;

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(cx, cy, COMBAT_TILE_SIZE * 0.24, 0, Math.PI * 2);
      ctx.fill();

      if (active && side === "player" && unit.id === active.id) {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.lineWidth = 1;
      }

      if (side === "enemy" && targetableIds.has(unit.id)) {
        ctx.strokeStyle = "#ffd34d";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.lineWidth = 1;
      }

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(unit.label || unit.id, cx, cy + 4);
    }
  };

  drawSide("player", state.stacks.player.color);
  drawSide("enemy", state.stacks.enemy.color);
}

function drawMapView() {
  drawMapGrid();
  drawStackToken("player", state.stacks.player);
  if (isTileVisibleToPlayer(state.stacks.enemy.x, state.stacks.enemy.y)) {
    drawStackToken("enemy", state.stacks.enemy);
  }
}

function drawCombatView() {
  drawCombatGrid();
  drawCombatUnits();

  ctx.fillStyle = "#1f2a1f";
  ctx.font = "bold 18px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${state.stacks.player.race}: ${getStackCount("player")} | ${state.stacks.enemy.race}: ${getStackCount("enemy")}`, board.width / 2, 26);
}

function draw() {
  ctx.clearRect(0, 0, board.width, board.height);
  if (!gameStarted) {
    return;
  }
  if (state.mode === "map") {
    drawMapView();
  } else {
    drawCombatView();
  }
}

function renderGameToText() {
  if (!gameStarted) {
    return JSON.stringify({
      mode: "setup",
      availableRaces: RACE_OPTIONS.map((race) => race.name),
      selections: { ...selectedRaces }
    });
  }

  const active = getActivePlayerUnit();
  const targetableEnemies = state.mode === "combat" && active
    ? adjacentTargets(active, "enemy").map((unit) => ({ id: unit.id, x: unit.x, y: unit.y }))
    : [];
  const enemyVisible = isTileVisibleToPlayer(state.stacks.enemy.x, state.stacks.enemy.y);
  const exploredTiles = state.fog.player.explored.flat().filter(Boolean).length;
  const payload = {
    coordinateSystem: "origin=(0,0) at top-left; +x right, +y down; integer tile coordinates",
    mode: state.mode,
    turn: state.turn,
    combatTurn: state.combatTurn,
    gameOver: state.gameOver,
    fog: {
      playerRadius: state.fog.player.radius,
      exploredTiles,
      totalTiles: GRID_SIZE * GRID_SIZE,
      enemyVisible
    },
    stacks: {
      player: {
        race: state.stacks.player.race,
        count: getStackCount("player"),
        mapPos: { x: state.stacks.player.x, y: state.stacks.player.y },
        mapMp: state.stacks.player.currentMapMp
      },
      enemy: {
        race: state.stacks.enemy.race,
        count: getStackCount("enemy"),
        mapPos: enemyVisible || state.mode !== "map"
          ? { x: state.stacks.enemy.x, y: state.stacks.enemy.y }
          : null,
        mapMp: state.stacks.enemy.currentMapMp
      }
    },
    activePlayerUnitId: active ? active.id : null,
    targetingMode: Boolean(state.combat?.targeting),
    targetableEnemies,
    combatUnits: state.mode === "combat"
      ? ["player", "enemy"].flatMap((side) =>
          getAliveUnits(side).map((unit) => ({
            id: unit.id,
            side,
            x: unit.x,
            y: unit.y,
            mp: unit.currentCombatMp,
            maxMp: unit.maxCombatMp
          }))
        )
      : []
  };

  return JSON.stringify(payload);
}

window.render_game_to_text = renderGameToText;
window.advanceTime = (ms) => {
  if (!gameStarted) {
    return renderGameToText();
  }
  advanceScheduledActions(Math.max(0, Number(ms) || 0));
  updateControls();
  draw();
  return renderGameToText();
};

function populateRaceSelect(selectEl) {
  selectEl.innerHTML = "";

  const randomOption = document.createElement("option");
  randomOption.value = RANDOM_RACE_ID;
  randomOption.textContent = "Random";
  selectEl.appendChild(randomOption);

  for (const race of RACE_OPTIONS) {
    const option = document.createElement("option");
    option.value = race.id;
    option.textContent = race.name;
    selectEl.appendChild(option);
  }
}

function initializeSetupScreen() {
  populateRaceSelect(playerRaceSelectEl);
  populateRaceSelect(enemyRaceSelectEl);
  playerRaceSelectEl.value = selectedRaces.player;
  enemyRaceSelectEl.value = selectedRaces.enemy;
}

function startGameFromSetup() {
  selectedRaces.player = playerRaceSelectEl.value || RANDOM_RACE_ID;
  selectedRaces.enemy = enemyRaceSelectEl.value || RANDOM_RACE_ID;
  gameStarted = true;
  setGamePanelsVisible(true);
  resetGame();
}

function resetGame() {
  if (!gameStarted) {
    return;
  }

  timelineToken += 1;
  pendingActions.length = 0;
  state = initialState();
  updateRaceLabels();
  statusEl.textContent = `Map View: Random start positions + fog of war (vision radius ${state.fog.player.radius}). Stack sizes are random (1-8): ${state.stacks.player.token}${toSubscript(getStackCount("player"))} vs ${state.stacks.enemy.token}${toSubscript(getStackCount("enemy"))}.`;
  updateControls();
  draw();
}

document.addEventListener("keydown", (event) => {
  if (!gameStarted) {
    return;
  }

  if (event.code === "Enter") {
    endTurn();
    return;
  }

  if (event.code === "Space") {
    event.preventDefault();
    playerCombatAttack();
    return;
  }

  if (event.code === "KeyB" && state.mode === "map" && !state.gameOver) {
    startCombat("player");
    return;
  }

  if (event.code === "KeyA" && state.mode === "combat" && state.combatTurn === "player") {
    cycleActivePlayerUnit();
    return;
  }

  if (state.mode === "combat" && state.combatTurn === "player" && state.combat?.targeting) {
    if (handleDirectionalAttack(event.key)) {
      return;
    }
  }

  if (state.mode === "map") {
    moveMapStack(event.key);
  } else {
    moveCombatActiveUnit(event.key);
  }
});

attackBtn.addEventListener("click", playerCombatAttack);
endTurnBtn.addEventListener("click", endTurn);
resetBtn.addEventListener("click", resetGame);
startGameBtnEl.addEventListener("click", startGameFromSetup);

initializeSetupScreen();
setGamePanelsVisible(false);
draw();
