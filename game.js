const TILE_SIZE = 64;
const GRID_SIZE = 10;
const COMBAT_GRID_SIZE = 8;
const COMBAT_TILE_SIZE = boardSize() / COMBAT_GRID_SIZE;

function boardSize() {
  return 640;
}

const board = document.getElementById("board");
const ctx = board.getContext("2d");
const statusEl = document.getElementById("status");
const modeLabelEl = document.getElementById("modeLabel");
const attackBtn = document.getElementById("attackBtn");
const endTurnBtn = document.getElementById("endTurnBtn");
const resetBtn = document.getElementById("resetBtn");

const initialState = () => ({
  mode: "map",
  turn: "player",
  combatTurn: "player",
  gameOver: false,
  combat: null,
  units: {
    player: {
      race: "Dawnforged",
      x: 1,
      y: 1,
      hp: 10,
      color: "#3b7a57"
    },
    enemy: {
      race: "Ironclad",
      x: GRID_SIZE - 2,
      y: GRID_SIZE - 2,
      hp: 10,
      color: "#7f2f2f"
    }
  }
});

let state = initialState();

function inBounds(x, y, size = GRID_SIZE) {
  return x >= 0 && y >= 0 && x < size && y < size;
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

  if (areCombatantsAdjacent()) {
    statusEl.textContent = "Combat View: Ironclad attacks...";
    draw();

    setTimeout(() => {
      resolveCombatAttack("enemy", "player");
      if (!state.gameOver) {
        state.combatTurn = "player";
        statusEl.textContent = "Combat View: Your combat turn.";
        updateControls();
        draw();
      }
    }, 400);
    return;
  }

  const dx = playerPos.x - enemyPos.x;
  const dy = playerPos.y - enemyPos.y;
  if (Math.abs(dx) > Math.abs(dy)) {
    enemyPos.x += Math.sign(dx);
  } else if (dy !== 0) {
    enemyPos.y += Math.sign(dy);
  }

  enemyPos.x = Math.max(0, Math.min(COMBAT_GRID_SIZE - 1, enemyPos.x));
  enemyPos.y = Math.max(0, Math.min(COMBAT_GRID_SIZE - 1, enemyPos.y));

  statusEl.textContent = `Combat View: Ironclad repositions to (${enemyPos.x}, ${enemyPos.y}). Your combat turn.`;
  state.combatTurn = "player";
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
    updateControls();
    enemyCombatTurn();
  }
}

function moveMapUnit(key) {
  if (state.mode !== "map" || state.turn !== "player" || state.gameOver) {
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

  player.x = nx;
  player.y = ny;
  statusEl.textContent = `Map View: Dawnforged moved to (${nx}, ${ny}).`;

  if (player.x === state.units.enemy.x && player.y === state.units.enemy.y) {
    startCombat("player");
    return;
  }

  updateControls();
  draw();
}

function moveCombatUnit(key) {
  if (state.mode !== "combat" || state.combatTurn !== "player" || state.gameOver) {
    return;
  }

  const playerPos = state.combat.player;
  const enemyPos = state.combat.enemy;

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

  playerPos.x = nx;
  playerPos.y = ny;
  statusEl.textContent = `Combat View: Dawnforged repositions to (${nx}, ${ny}).`;
  updateControls();
  draw();
}

function enemyMapTurn() {
  if (state.mode !== "map" || state.turn !== "enemy" || state.gameOver) {
    return;
  }

  const enemy = state.units.enemy;
  const player = state.units.player;
  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;

  if (Math.abs(dx) > Math.abs(dy)) {
    enemy.x += Math.sign(dx);
  } else if (dy !== 0) {
    enemy.y += Math.sign(dy);
  }

  enemy.x = Math.max(0, Math.min(GRID_SIZE - 1, enemy.x));
  enemy.y = Math.max(0, Math.min(GRID_SIZE - 1, enemy.y));

  statusEl.textContent = `Map View: Ironclad moved to (${enemy.x}, ${enemy.y}).`;

  if (enemy.x === player.x && enemy.y === player.y) {
    startCombat("enemy");
    return;
  }

  state.turn = "player";
  statusEl.textContent += " Your map turn.";
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
    state.combatTurn = "enemy";
    statusEl.textContent = "Combat View: You ended your combat turn.";
    updateControls();
    enemyCombatTurn();
    return;
  }

  if (state.turn !== "player") {
    return;
  }

  state.turn = "enemy";
  statusEl.textContent = "Map View: Ironclad is taking a map turn...";
  updateControls();
  draw();
  setTimeout(enemyMapTurn, 350);
}

function resetGame() {
  state = initialState();
  statusEl.textContent = "Map View: Use arrow keys to move Dawnforged. Overlap the enemy to trigger combat.";
  updateControls();
  draw();
}

function drawGrid(tileSize, size, colorA, colorB) {
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      ctx.fillStyle = (x + y) % 2 === 0 ? colorA : colorB;
      ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      ctx.strokeStyle = "rgba(0, 0, 0, 0.14)";
      ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
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
  drawGrid(TILE_SIZE, GRID_SIZE, "#d8e2c5", "#c8d7b1");
  drawUnitAtGrid(state.units.player, state.units.player.x, state.units.player.y, TILE_SIZE, "D");
  drawUnitAtGrid(state.units.enemy, state.units.enemy.x, state.units.enemy.y, TILE_SIZE, "I");
}

function drawCombatView() {
  drawGrid(COMBAT_TILE_SIZE, COMBAT_GRID_SIZE, "#e6dbbf", "#dbcba8");
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

document.addEventListener("keydown", (event) => {
  if (state.mode === "map") {
    moveMapUnit(event.key);
  } else {
    moveCombatUnit(event.key);
  }
});

attackBtn.addEventListener("click", playerCombatAttack);
endTurnBtn.addEventListener("click", endTurn);
resetBtn.addEventListener("click", resetGame);

updateControls();
draw();
