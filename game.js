const TILE_SIZE = 64;
const GRID_SIZE = 10;
const COMBAT_GRID_SIZE = 8;
const COMBAT_TILE_SIZE = boardSize() / COMBAT_GRID_SIZE;
const FOG_RADIUS = 2;
const BASE_HIT_CHANCE = 70;
const MIN_HIT_CHANCE = 10;
const MAX_HIT_CHANCE = 95;
const DAMAGE_EXP_LAMBDA = 2.25;
const MAX_COMBAT_LOG_ENTRIES = 40;

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
const unitTooltipEl = document.getElementById("unitTooltip");
const combatLogEl = document.getElementById("combatLog");
const combatLogPanelEl = document.querySelector(".combat-log-panel");
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
let hoveredEntity = null;

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
    const maxHp = randomInt(14, 30);
    const armor = randomInt(1, 20);
    units.push({
      id: `${side[0].toUpperCase()}${i + 1}`,
      label: `${race.token}${i + 1}`,
      side,
      alive: true,
      hp: maxHp,
      maxHp,
      attack: randomInt(1, 20),
      damage: randomInt(1, 20),
      armor,
      maxArmor: armor,
      evasiveness: randomInt(1, 20),
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

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function toSubscript(n) {
  return String(n)
    .split("")
    .map((digit) => SUBSCRIPT_DIGITS[digit] || digit)
    .join("");
}

function getHitChance(attacker, defender) {
  const modified = BASE_HIT_CHANCE + (attacker.attack - defender.evasiveness) * 2;
  return clamp(modified, MIN_HIT_CHANCE, MAX_HIT_CHANCE);
}

function rollBiasedDamage(maxDamage) {
  const normalized = (1 - Math.exp(-DAMAGE_EXP_LAMBDA * Math.random())) / (1 - Math.exp(-DAMAGE_EXP_LAMBDA));
  return Math.floor(normalized * Math.max(1, maxDamage)) + 1;
}

function formatUnitStatLine(unit, includeCurrentMove = false) {
  const moveText = includeCurrentMove
    ? `${unit.currentCombatMp}/${unit.maxCombatMp}`
    : `${unit.maxCombatMp}`;
  return `${unitName(unit)} HP ${unit.hp}/${unit.maxHp} ARM ${unit.armor}/${unit.maxArmor} ATK ${unit.attack} DMG ${unit.damage} EVA ${unit.evasiveness} MOV ${moveText}`;
}

function setTooltipHtml(html, x, y) {
  if (!html) {
    unitTooltipEl.classList.add("hidden");
    unitTooltipEl.innerHTML = "";
    return;
  }

  unitTooltipEl.innerHTML = html;
  unitTooltipEl.classList.remove("hidden");

  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return;
  }

  const wrapRect = boardWrapEl.getBoundingClientRect();
  const tipRect = unitTooltipEl.getBoundingClientRect();

  const margin = 10;
  const maxLeft = Math.max(margin, wrapRect.width - tipRect.width - margin);
  const maxTop = Math.max(margin, wrapRect.height - tipRect.height - margin);

  const localX = x - wrapRect.left + 14;
  const localY = y - wrapRect.top + 14;
  const clampedLeft = clamp(localX, margin, maxLeft);
  const clampedTop = clamp(localY, margin, maxTop);

  unitTooltipEl.style.left = `${clampedLeft}px`;
  unitTooltipEl.style.top = `${clampedTop}px`;
}

function clearCombatLog() {
  if (combatLogEl) {
    combatLogEl.innerHTML = "";
  }
  if (state?.combat?.log) {
    state.combat.log = [];
  }
}

function appendCombatLog(entry) {
  if (state?.combat) {
    if (!Array.isArray(state.combat.log)) {
      state.combat.log = [];
    }
    state.combat.log.push(entry);
    if (state.combat.log.length > MAX_COMBAT_LOG_ENTRIES) {
      state.combat.log.splice(0, state.combat.log.length - MAX_COMBAT_LOG_ENTRIES);
    }
  }

  if (!combatLogEl) return;
  const item = document.createElement("li");
  item.textContent = entry;
  combatLogEl.appendChild(item);

  while (combatLogEl.children.length > MAX_COMBAT_LOG_ENTRIES) {
    combatLogEl.removeChild(combatLogEl.firstElementChild);
  }
  combatLogEl.scrollTop = combatLogEl.scrollHeight;
}

function refreshHoveredTooltip() {
  if (!hoveredEntity || !gameStarted) {
    return;
  }

  if (hoveredEntity.type === "mapStack") {
    if (
      hoveredEntity.side === "enemy" &&
      state.mode === "map" &&
      !isTileVisibleToPlayer(state.stacks.enemy.x, state.stacks.enemy.y)
    ) {
      hoveredEntity = null;
      setTooltipHtml("");
      return;
    }
    setTooltipHtml(buildMapStackTooltipHtml(hoveredEntity.side));
    return;
  }

  const unit = getUnitById(hoveredEntity.side, hoveredEntity.unitId);
  if (!unit || !unit.alive) {
    hoveredEntity = null;
    setTooltipHtml("");
    return;
  }
  setTooltipHtml(buildCombatUnitTooltipHtml(hoveredEntity.side, unit));
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
  const prefix = unit.side === "player" ? "P" : "C";
  return `${prefix}-${unit.label || unit.id}`;
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

function eliminateUnit(unit) {
  unit.alive = false;
  unit.hp = 0;
  unit.armor = 0;
  unit.currentCombatMp = 0;
  unit.x = null;
  unit.y = null;
}

function resolveAttack(attackerSide, attacker, defenderSide, defender) {
  const hitChance = getHitChance(attacker, defender);
  const hitRoll = randomInt(1, 100);
  const hit = hitRoll <= hitChance;

  if (!hit) {
    return {
      attackerSide,
      defenderSide,
      hitChance,
      hitRoll,
      hit: false,
      rawDamage: 0,
      armorAbsorbed: 0,
      hpDamage: 0,
      eliminated: null
    };
  }

  const rawDamage = rollBiasedDamage(attacker.damage);
  const intendedArmorDamage = Math.floor(rawDamage * 0.8);
  const guaranteedHpDamage = rawDamage - intendedArmorDamage;
  const armorAbsorbed = Math.min(defender.armor, intendedArmorDamage);
  defender.armor -= armorAbsorbed;
  const spillToHp = intendedArmorDamage - armorAbsorbed;
  const hpDamage = Math.max(0, guaranteedHpDamage + spillToHp);
  defender.hp = Math.max(0, defender.hp - hpDamage);

  let eliminated = null;
  if (defender.hp <= 0) {
    eliminated = unitName(defender);
    eliminateUnit(defender);
  }

  return {
    attackerSide,
    defenderSide,
    hitChance,
    hitRoll,
    hit: true,
    rawDamage,
    armorAbsorbed,
    hpDamage,
    eliminated
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
  if (combatLogPanelEl) {
    combatLogPanelEl.style.display = state.mode === "combat" ? "block" : "none";
  }

  const active = getActivePlayerUnit();
  if (combatMpLabelEl) {
    combatMpLabelEl.textContent = active
      ? `${unitName(active)} MP ${active.currentCombatMp}/${active.maxCombatMp} HP ${active.hp}/${active.maxHp}`
      : `0/0`;
  }

  const canAttack =
    state.mode === "combat" &&
    state.combatTurn === "player" &&
    !state.gameOver &&
    active &&
    active.currentCombatMp > 0 &&
    adjacentTargets(active, "enemy").length > 0;

  attackBtn.disabled = !canAttack;
  endTurnBtn.disabled = state.gameOver;
}

function startCombat(initiator) {
  hoveredEntity = null;
  setTooltipHtml("");
  state.mode = "combat";
  state.combatTurn = initiator;
  state.combatTerrain = createCombatTerrain(COMBAT_GRID_SIZE);
  state.combat = {
    activePlayerUnitId: null,
    targeting: false,
    log: []
  };
  clearCombatLog();

  placeCombatUnits();
  resetCombatMp("player");
  resetCombatMp("enemy");

  const first = getAliveUnits("player")[0];
  state.combat.activePlayerUnitId = first ? first.id : null;

  statusEl.textContent = `Combat View: ${state.stacks.player.race} (${getStackCount("player")}) engages ${state.stacks.enemy.race} (${getStackCount("enemy")}). ${initiator === "player" ? "Your" : "Enemy"} combat turn.`;
  appendCombatLog(`${state.stacks.player.race} engages ${state.stacks.enemy.race}. ${initiator === "player" ? "Player" : "Enemy"} acts first.`);
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

  const logPrefix = `${unitName(attacker)} -> ${unitName(defender)}`;
  if (!result.hit) {
    appendCombatLog(`${logPrefix}: miss (${result.hitRoll} vs ${result.hitChance}%).`);
    statusEl.textContent = "Combat View: Attack logged.";
  } else {
    const eliminatedText = result.eliminated ? ` ${result.eliminated} was eliminated.` : "";
    appendCombatLog(`${logPrefix}: hit (${result.hitRoll}/${result.hitChance}%), raw ${result.rawDamage}, armor ${result.armorAbsorbed}, hp ${result.hpDamage}.${result.eliminated ? ` Eliminated ${result.eliminated}.` : ""}`);
    statusEl.textContent = `Combat View: Attack logged.${eliminatedText}`;
  }

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

  if (active.currentCombatMp <= 0) {
    statusEl.textContent = `Combat View: ${unitName(active)} has no MP left to attack.`;
    updateControls();
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
        const logPrefix = `${unitName(unit)} -> ${unitName(defender)}`;
        if (!result.hit) {
          appendCombatLog(`${logPrefix}: miss (${result.hitRoll} vs ${result.hitChance}%).`);
          statusEl.textContent = "Combat View: Enemy attack logged.";
        } else {
          appendCombatLog(`${logPrefix}: hit (${result.hitRoll}/${result.hitChance}%), raw ${result.rawDamage}, armor ${result.armorAbsorbed}, hp ${result.hpDamage}.${result.eliminated ? ` Eliminated ${result.eliminated}.` : ""}`);
          statusEl.textContent = "Combat View: Enemy attack logged.";
        }

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

  if (hoveredEntity?.type === "mapStack" && hoveredEntity.side === side) {
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.lineWidth = 1;
  }

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

      if (hoveredEntity?.type === "combatUnit" && hoveredEntity.unitId === unit.id) {
        ctx.strokeStyle = "#6fd3ff";
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

function getCanvasPointFromEvent(event) {
  const rect = board.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;
  const x = ((event.clientX - rect.left) / rect.width) * board.width;
  const y = ((event.clientY - rect.top) / rect.height) * board.height;
  return { x, y, clientX: event.clientX, clientY: event.clientY };
}

function getMapHoverEntity(px, py) {
  const entries = [];
  entries.push({ side: "player", stack: state.stacks.player });
  if (isTileVisibleToPlayer(state.stacks.enemy.x, state.stacks.enemy.y)) {
    entries.push({ side: "enemy", stack: state.stacks.enemy });
  }

  for (const entry of entries) {
    if (getStackCount(entry.side) <= 0) continue;
    const cx = entry.stack.x * TILE_SIZE + TILE_SIZE / 2;
    const cy = entry.stack.y * TILE_SIZE + TILE_SIZE / 2;
    if (Math.hypot(px - cx, py - cy) <= TILE_SIZE * 0.35) {
      return {
        type: "mapStack",
        side: entry.side
      };
    }
  }

  return null;
}

function getCombatHoverEntity(px, py) {
  const allUnits = ["player", "enemy"].flatMap((side) =>
    getAliveUnits(side).map((unit) => ({ side, unit }))
  );

  for (const entry of allUnits) {
    const cx = entry.unit.x * COMBAT_TILE_SIZE + COMBAT_TILE_SIZE / 2;
    const cy = entry.unit.y * COMBAT_TILE_SIZE + COMBAT_TILE_SIZE / 2;
    if (Math.hypot(px - cx, py - cy) <= COMBAT_TILE_SIZE * 0.28) {
      return {
        type: "combatUnit",
        side: entry.side,
        unitId: entry.unit.id
      };
    }
  }

  return null;
}

function getUnitById(side, unitId) {
  return state.stacks[side].units.find((unit) => unit.id === unitId) || null;
}

function buildMapStackTooltipHtml(side) {
  const stack = state.stacks[side];
  const units = getAliveUnits(side);
  const lines = units
    .map((unit) => `<div>${formatUnitStatLine(unit, false)}</div>`)
    .join("");
  return `<strong>${stack.race} Stack (${units.length} units)</strong>${lines}`;
}

function buildCombatUnitTooltipHtml(side, unit) {
  const active = side === "enemy" ? getActivePlayerUnit() : null;
  const hitChanceText =
    state.mode === "combat" && active && side === "enemy"
      ? `<div>Chance for ${unitName(active)} to hit: ${getHitChance(active, unit)}%</div>`
      : "";
  return `<strong>${state.stacks[side].race} ${unitName(unit)}</strong><div>${formatUnitStatLine(unit, true)}</div>${hitChanceText}`;
}

function updateHoveredEntity(event) {
  if (!gameStarted) return;

  const point = getCanvasPointFromEvent(event);
  if (!point) return;

  const nextHovered =
    state.mode === "map"
      ? getMapHoverEntity(point.x, point.y)
      : getCombatHoverEntity(point.x, point.y);

  if (!nextHovered) {
    if (hoveredEntity) {
      hoveredEntity = null;
      setTooltipHtml("", point.clientX, point.clientY);
      draw();
    }
    return;
  }

  hoveredEntity = nextHovered;
  if (nextHovered.type === "mapStack") {
    setTooltipHtml(buildMapStackTooltipHtml(nextHovered.side), point.clientX, point.clientY);
  } else {
    const unit = getUnitById(nextHovered.side, nextHovered.unitId);
    if (unit) {
      setTooltipHtml(buildCombatUnitTooltipHtml(nextHovered.side, unit), point.clientX, point.clientY);
    }
  }

  draw();
}

function clearHoveredEntity() {
  if (!hoveredEntity) return;
  hoveredEntity = null;
  setTooltipHtml("");
  draw();
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
  refreshHoveredTooltip();
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
        mapMp: state.stacks.player.currentMapMp,
        token: state.stacks.player.token,
        units: getAliveUnits("player").map((unit) => ({
          id: unit.id,
          label: unitName(unit),
          hp: unit.hp,
          maxHp: unit.maxHp,
          armor: unit.armor,
          maxArmor: unit.maxArmor,
          moveCurrent: unit.currentCombatMp,
          moveMax: unit.maxCombatMp,
          attack: unit.attack,
          damage: unit.damage,
          evasiveness: unit.evasiveness,
          mapPos: { x: state.stacks.player.x, y: state.stacks.player.y }
        }))
      },
      enemy: {
        race: state.stacks.enemy.race,
        count: getStackCount("enemy"),
        mapPos: enemyVisible || state.mode !== "map"
          ? { x: state.stacks.enemy.x, y: state.stacks.enemy.y }
          : null,
        mapMp: state.stacks.enemy.currentMapMp,
        token: state.stacks.enemy.token,
        units: getAliveUnits("enemy").map((unit) => ({
          id: unit.id,
          label: unitName(unit),
          hp: unit.hp,
          maxHp: unit.maxHp,
          armor: unit.armor,
          maxArmor: unit.maxArmor,
          moveCurrent: unit.currentCombatMp,
          moveMax: unit.maxCombatMp,
          attack: unit.attack,
          damage: unit.damage,
          evasiveness: unit.evasiveness,
          mapPos: enemyVisible || state.mode !== "map"
            ? { x: state.stacks.enemy.x, y: state.stacks.enemy.y }
            : null
        }))
      }
    },
    activePlayerUnitId: active ? active.id : null,
    activePlayerUnitLabel: active ? unitName(active) : null,
    targetingMode: Boolean(state.combat?.targeting),
    combatLog: state.combat?.log || [],
    combatRules: {
      baseHitChance: BASE_HIT_CHANCE,
      minHitChance: MIN_HIT_CHANCE,
      maxHitChance: MAX_HIT_CHANCE
    },
    hoveredEntity,
    targetableEnemies,
    combatUnits: state.mode === "combat"
      ? ["player", "enemy"].flatMap((side) =>
          getAliveUnits(side).map((unit) => ({
            id: unit.id,
            label: unitName(unit),
            side,
            x: unit.x,
            y: unit.y,
            mp: unit.currentCombatMp,
            maxMp: unit.maxCombatMp,
            hp: unit.hp,
            maxHp: unit.maxHp,
            armor: unit.armor,
            maxArmor: unit.maxArmor,
            moveCurrent: unit.currentCombatMp,
            moveMax: unit.maxCombatMp,
            attack: unit.attack,
            damage: unit.damage,
            evasiveness: unit.evasiveness
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
  hoveredEntity = null;
  setTooltipHtml("");
  setGamePanelsVisible(true);
  resetGame();
}

function resetGame() {
  if (!gameStarted) {
    return;
  }

  timelineToken += 1;
  pendingActions.length = 0;
  hoveredEntity = null;
  setTooltipHtml("");
  clearCombatLog();
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
board.addEventListener("mousemove", updateHoveredEntity);
board.addEventListener("mouseleave", clearHoveredEntity);

initializeSetupScreen();
setGamePanelsVisible(false);
draw();
