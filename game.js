const TILE_SIZE = 64;
const GRID_SIZE = 10;
const COMBAT_GRID_SIZE = 8;
const COMBAT_TILE_SIZE = boardSize() / COMBAT_GRID_SIZE;

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

function boardSize() {
  return 640;
}

const board = document.getElementById("board");
const ctx = board.getContext("2d");
const statusEl = document.getElementById("status");
const modeLabelEl = document.getElementById("modeLabel");
const mapMpLabelEl = document.getElementById("mapMpLabel");
const combatMpLabelEl = document.getElementById("combatMpLabel");
const attackBtn = document.getElementById("attackBtn");
const endTurnBtn = document.getElementById("endTurnBtn");
const resetBtn = document.getElementById("resetBtn");

const initialState = () => ({
  mode: "map",
  turn: "player",
  combatTurn: "player",
  gameOver: false,
  combat: null,
  mapTerrain: createMapTerrain(GRID_SIZE),
  combatTerrain: null,
  units: {
    player: {
      race: "Dawnforged",
      x: 1,
      y: 1,
      hp: 10,
      color: "#3b7a57",
      maxMapMp: 3,
      currentMapMp: 3,
      maxCombatMp: 2,
      currentCombatMp: 2
    },
    enemy: {
      race: "Ironclad",
      x: GRID_SIZE - 2,
      y: GRID_SIZE - 2,
      hp: 10,
      color: "#7f2f2f",
      maxMapMp: 3,
      currentMapMp: 3,
      maxCombatMp: 2,
      currentCombatMp: 2
    }
  }
});

let state = initialState();
const pendingActions = [];

function scheduleAction(delayMs, fn) {
  const task = {
    remaining: delayMs,
    fn,
    done: false
  };
  pendingActions.push(task);

  setTimeout(() => {
    if (task.done) return;
    task.done = true;
    flushDoneTasks();
    fn();
  }, delayMs);
}

function advanceScheduledActions(ms) {
  const due = [];
  for (const task of pendingActions) {
    if (task.done) continue;
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
    if (pendingActions[i].done) {
      pendingActions.splice(i, 1);
    }
    i -= 1;
  }
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
  grid[mid][1] = "open";
  grid[mid][size - 2] = "open";

  return grid;
}

function inBounds(x, y, size = GRID_SIZE) {
  return x >= 0 && y >= 0 && x < size && y < size;
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

function rollCombat(attacker, defender) {
  const attackerRoll = Math.floor(Math.random() * 20) + 1;
  const defenderRoll = Math.floor(Math.random() * 20) + 1;
  const attackerScore = attackerRoll + attacker.hp;
  const defenderScore = defenderRoll + defender.hp;

  return {
    attackerRoll,
    defenderRoll,
    winner: attackerScore >= defenderScore ? "attacker" : "defender"
  };
}

function areCombatantsAdjacent() {
  if (!state.combat) return false;
  const p = state.combat.player;
  const e = state.combat.enemy;
  return Math.abs(p.x - e.x) + Math.abs(p.y - e.y) === 1;
}

function updateControls() {
  modeLabelEl.textContent = state.mode === "map" ? "Map" : "Combat";
  mapMpLabelEl.textContent = `${state.units.player.currentMapMp}/${state.units.player.maxMapMp}`;
  if (combatMpLabelEl) {
    combatMpLabelEl.textContent = `${state.units.player.currentCombatMp}/${state.units.player.maxCombatMp}`;
  }
  attackBtn.disabled =
    state.mode !== "combat" ||
    state.combatTurn !== "player" ||
    state.gameOver ||
    !areCombatantsAdjacent();
  endTurnBtn.disabled = state.gameOver;
}

function startCombat(initiator) {
  state.mode = "combat";
  state.combatTurn = initiator;
  state.combat = {
    player: { x: 1, y: Math.floor(COMBAT_GRID_SIZE / 2) },
    enemy: { x: COMBAT_GRID_SIZE - 2, y: Math.floor(COMBAT_GRID_SIZE / 2) }
  };
  state.combatTerrain = createCombatTerrain(COMBAT_GRID_SIZE);
  state.units.player.currentCombatMp = state.units.player.maxCombatMp;
  state.units.enemy.currentCombatMp = state.units.enemy.maxCombatMp;

  statusEl.textContent = `Combat View: ${state.units.player.race} engages ${state.units.enemy.race} on tactical grid. ${initiator === "player" ? "Your" : "Enemy"} combat turn.`;
  updateControls();
  draw();

  if (initiator === "enemy") {
    enemyCombatTurn();
  }
}

function resolveCombatAttack(attackerKey, defenderKey) {
  if (state.mode !== "combat" || state.gameOver) {
    return;
  }

  const attacker = state.units[attackerKey];
  const defender = state.units[defenderKey];
  const result = rollCombat(attacker, defender);

  if (result.winner === "attacker") {
    defender.hp = 0;
    state.gameOver = true;
    statusEl.textContent = `${attacker.race} wins combat (roll ${result.attackerRoll} vs ${result.defenderRoll}). Game over.`;
  } else {
    attacker.hp = 0;
    state.gameOver = true;
    statusEl.textContent = `${defender.race} holds (roll ${result.defenderRoll} vs ${result.attackerRoll}). Game over.`;
  }

  updateControls();
  draw();
}

function enemyCombatTurn() {
  if (state.mode !== "combat" || state.gameOver || state.combatTurn !== "enemy") {
    return;
  }

  const enemyPos = state.combat.enemy;
  const playerPos = state.combat.player;
  const enemyUnit = state.units.enemy;
  let movedAny = false;
  let lastPos = { ...enemyPos };

  while (enemyUnit.currentCombatMp > 0 && !areCombatantsAdjacent()) {
    const options = getEnemyMoveOptions(enemyPos, playerPos);
    let selected = null;

    for (const option of options) {
      if (!inBounds(option.x, option.y, COMBAT_GRID_SIZE)) {
        continue;
      }
      if (option.x === playerPos.x && option.y === playerPos.y) {
        continue;
      }

      const terrainRule = getCombatTerrainRule(getCombatTerrainAt(option.x, option.y));
      if (!terrainRule.passable || terrainRule.cost > enemyUnit.currentCombatMp) {
        continue;
      }

      selected = { ...option, terrainRule };
      break;
    }

    if (!selected) {
      break;
    }

    enemyPos.x = selected.x;
    enemyPos.y = selected.y;
    enemyUnit.currentCombatMp -= selected.terrainRule.cost;
    movedAny = true;
    lastPos = { ...enemyPos };
  }

  if (areCombatantsAdjacent()) {
    if (movedAny) {
      statusEl.textContent = `Combat View: Ironclad repositions to (${lastPos.x}, ${lastPos.y}) and attacks...`;
    } else {
      statusEl.textContent = "Combat View: Ironclad attacks...";
    }
    updateControls();
    draw();

    scheduleAction(400, () => {
      resolveCombatAttack("enemy", "player");
      if (!state.gameOver) {
        state.combatTurn = "player";
        state.units.player.currentCombatMp = state.units.player.maxCombatMp;
        statusEl.textContent = "Combat View: Your combat turn.";
        updateControls();
        draw();
      }
    });
    return;
  }

  state.combatTurn = "player";
  state.units.player.currentCombatMp = state.units.player.maxCombatMp;

  if (movedAny) {
    statusEl.textContent = `Combat View: Ironclad repositions to (${lastPos.x}, ${lastPos.y}). Your combat turn.`;
  } else {
    statusEl.textContent = "Combat View: Ironclad holds due to terrain/MP limits. Your combat turn.";
  }
  updateControls();
  draw();
}

function playerCombatAttack() {
  if (state.mode !== "combat" || state.combatTurn !== "player" || state.gameOver) {
    return;
  }

  if (!areCombatantsAdjacent()) {
    statusEl.textContent = "Combat View: Move adjacent to attack.";
    updateControls();
    return;
  }

  resolveCombatAttack("player", "enemy");
  if (!state.gameOver) {
    state.combatTurn = "enemy";
    state.units.enemy.currentCombatMp = state.units.enemy.maxCombatMp;
    updateControls();
    enemyCombatTurn();
  }
}

function moveMapUnit(key) {
  if (state.mode !== "map" || state.turn !== "player" || state.gameOver) {
    return;
  }
  if (!key.startsWith("Arrow")) {
    return;
  }

  const player = state.units.player;
  let nx = player.x;
  let ny = player.y;

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

  if (player.currentMapMp < terrainRule.cost) {
    statusEl.textContent = `Map View: Need ${terrainRule.cost} MP for ${terrainRule.label}. Remaining MP: ${player.currentMapMp}.`;
    return;
  }

  player.x = nx;
  player.y = ny;
  player.currentMapMp -= terrainRule.cost;
  statusEl.textContent = `Map View: Dawnforged moved to (${nx}, ${ny}) on ${terrainRule.label} (${terrainRule.cost} MP). Remaining MP: ${player.currentMapMp}.`;

  if (player.x === state.units.enemy.x && player.y === state.units.enemy.y) {
    startCombat("player");
    return;
  }

  if (player.currentMapMp <= 0) {
    statusEl.textContent += " No MP left, end your turn.";
  }

  updateControls();
  draw();
}

function moveCombatUnit(key) {
  if (state.mode !== "combat" || state.combatTurn !== "player" || state.gameOver) {
    return;
  }
  if (!key.startsWith("Arrow")) {
    return;
  }

  const playerPos = state.combat.player;
  const enemyPos = state.combat.enemy;
  const playerUnit = state.units.player;

  let nx = playerPos.x;
  let ny = playerPos.y;

  if (key === "ArrowUp") ny -= 1;
  if (key === "ArrowDown") ny += 1;
  if (key === "ArrowLeft") nx -= 1;
  if (key === "ArrowRight") nx += 1;

  if (!inBounds(nx, ny, COMBAT_GRID_SIZE)) {
    statusEl.textContent = "Combat View: Invalid move.";
    return;
  }

  if (nx === enemyPos.x && ny === enemyPos.y) {
    statusEl.textContent = "Combat View: Occupied tile. Move adjacent, then attack.";
    return;
  }

  const terrainType = getCombatTerrainAt(nx, ny);
  const terrainRule = getCombatTerrainRule(terrainType);

  if (!terrainRule.passable) {
    statusEl.textContent = `Combat View: ${terrainRule.label} is impassable.`;
    return;
  }

  if (playerUnit.currentCombatMp < terrainRule.cost) {
    statusEl.textContent = `Combat View: Need ${terrainRule.cost} MP for ${terrainRule.label}. Remaining MP: ${playerUnit.currentCombatMp}.`;
    return;
  }

  playerPos.x = nx;
  playerPos.y = ny;
  playerUnit.currentCombatMp -= terrainRule.cost;

  statusEl.textContent = `Combat View: Dawnforged repositions to (${nx}, ${ny}) on ${terrainRule.label} (${terrainRule.cost} MP). Remaining MP: ${playerUnit.currentCombatMp}.`;
  updateControls();
  draw();
}

function enemyMapTurn() {
  if (state.mode !== "map" || state.turn !== "enemy" || state.gameOver) {
    return;
  }

  const enemy = state.units.enemy;
  const player = state.units.player;
  let movedAny = false;

  while (enemy.currentMapMp > 0) {
    const options = getEnemyMoveOptions(enemy, player);
    let selected = null;

    for (const option of options) {
      if (!inBounds(option.x, option.y, GRID_SIZE)) {
        continue;
      }

      const terrainRule = getMapTerrainRule(getMapTerrainAt(option.x, option.y));
      if (!terrainRule.passable || terrainRule.cost > enemy.currentMapMp) {
        continue;
      }

      selected = { ...option, terrainRule };
      break;
    }

    if (!selected) {
      break;
    }

    enemy.x = selected.x;
    enemy.y = selected.y;
    enemy.currentMapMp -= selected.terrainRule.cost;
    movedAny = true;

    if (enemy.x === player.x && enemy.y === player.y) {
      startCombat("enemy");
      return;
    }
  }

  state.turn = "player";
  state.units.player.currentMapMp = state.units.player.maxMapMp;

  if (movedAny) {
    statusEl.textContent = `Map View: Ironclad moved to (${enemy.x}, ${enemy.y}). Your map turn.`;
  } else {
    statusEl.textContent = "Map View: Ironclad holds position due to terrain/MP limits. Your map turn.";
  }

  updateControls();
  draw();
}

function getEnemyMoveOptions(enemy, player) {
  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  const options = [];

  if (Math.abs(dx) >= Math.abs(dy)) {
    if (dx !== 0) options.push({ x: enemy.x + Math.sign(dx), y: enemy.y });
    if (dy !== 0) options.push({ x: enemy.x, y: enemy.y + Math.sign(dy) });
  } else {
    if (dy !== 0) options.push({ x: enemy.x, y: enemy.y + Math.sign(dy) });
    if (dx !== 0) options.push({ x: enemy.x + Math.sign(dx), y: enemy.y });
  }

  return options;
}

function endTurn() {
  if (state.gameOver) {
    return;
  }

  if (state.mode === "combat") {
    if (state.combatTurn !== "player") {
      return;
    }
    state.combatTurn = "enemy";
    state.units.enemy.currentCombatMp = state.units.enemy.maxCombatMp;
    statusEl.textContent = "Combat View: You ended your combat turn.";
    updateControls();
    enemyCombatTurn();
    return;
  }

  if (state.turn !== "player") {
    return;
  }

  state.turn = "enemy";
  state.units.enemy.currentMapMp = state.units.enemy.maxMapMp;
  statusEl.textContent = "Map View: Ironclad is taking a map turn...";
  updateControls();
  draw();
  scheduleAction(350, enemyMapTurn);
}

function resetGame() {
  state = initialState();
  statusEl.textContent = "Map View: Use arrow keys to move Dawnforged. Terrain costs MP and water is impassable.";
  updateControls();
  draw();
}

function drawMapGrid() {
  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const terrainType = state.mapTerrain[y][x];
      const terrainRule = getMapTerrainRule(terrainType);
      ctx.fillStyle = terrainRule.color;
      ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      ctx.strokeStyle = "rgba(0, 0, 0, 0.14)";
      ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
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

function drawUnitAtGrid(unit, x, y, tileSize, label) {
  if (unit.hp <= 0) return;
  const cx = x * tileSize + tileSize / 2;
  const cy = y * tileSize + tileSize / 2;

  ctx.fillStyle = unit.color;
  ctx.beginPath();
  ctx.arc(cx, cy, tileSize * 0.28, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 14px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(label, cx, cy + 5);
}

function drawMapView() {
  drawMapGrid();
  drawUnitAtGrid(state.units.player, state.units.player.x, state.units.player.y, TILE_SIZE, "D");
  drawUnitAtGrid(state.units.enemy, state.units.enemy.x, state.units.enemy.y, TILE_SIZE, "I");
}

function drawCombatView() {
  drawCombatGrid();
  drawUnitAtGrid(state.units.player, state.combat.player.x, state.combat.player.y, COMBAT_TILE_SIZE, "D");
  drawUnitAtGrid(state.units.enemy, state.combat.enemy.x, state.combat.enemy.y, COMBAT_TILE_SIZE, "I");

  ctx.fillStyle = "#1f2a1f";
  ctx.font = "bold 18px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`Dawnforged HP: ${state.units.player.hp} | Ironclad HP: ${state.units.enemy.hp}`, board.width / 2, 26);
}

function draw() {
  ctx.clearRect(0, 0, board.width, board.height);
  if (state.mode === "map") {
    drawMapView();
  } else {
    drawCombatView();
  }
}

function renderGameToText() {
  const payload = {
    coordinateSystem: "origin=(0,0) at top-left; +x right, +y down; integer tile coordinates",
    mode: state.mode,
    turn: state.turn,
    combatTurn: state.combatTurn,
    gameOver: state.gameOver,
    player: {
      race: state.units.player.race,
      x: state.mode === "map" ? state.units.player.x : state.combat?.player?.x,
      y: state.mode === "map" ? state.units.player.y : state.combat?.player?.y,
      hp: state.units.player.hp,
      mapMp: state.units.player.currentMapMp,
      combatMp: state.units.player.currentCombatMp
    },
    enemy: {
      race: state.units.enemy.race,
      x: state.mode === "map" ? state.units.enemy.x : state.combat?.enemy?.x,
      y: state.mode === "map" ? state.units.enemy.y : state.combat?.enemy?.y,
      hp: state.units.enemy.hp,
      mapMp: state.units.enemy.currentMapMp,
      combatMp: state.units.enemy.currentCombatMp
    },
    adjacentInCombat: areCombatantsAdjacent()
  };

  return JSON.stringify(payload);
}

window.render_game_to_text = renderGameToText;
window.advanceTime = (ms) => {
  advanceScheduledActions(Math.max(0, Number(ms) || 0));
  updateControls();
  draw();
  return renderGameToText();
};

document.addEventListener("keydown", (event) => {
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

  if (state.mode === "map") {
    moveMapUnit(event.key);
  } else {
    moveCombatUnit(event.key);
  }
});

attackBtn.addEventListener("click", playerCombatAttack);
endTurnBtn.addEventListener("click", endTurn);
resetBtn.addEventListener("click", resetGame);

resetGame();
