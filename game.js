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
const RACE_PREVIEW_WIDTH = 300;
const RACE_PREVIEW_HEIGHT = 170;
const MAP_ART_SIZE = 64;
const CENTAUR_COMBAT_SPRITE_NATIVE_WIDTH = 140;
const CENTAUR_COMBAT_SPRITE_NATIVE_HEIGHT = 110;
const DEMON_COMBAT_SPRITE_NATIVE_WIDTH = 140;
const DEMON_COMBAT_SPRITE_NATIVE_HEIGHT = 110;

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
  { id: "centaur-clans", name: "Centaur Clans", token: "C", color: "#7d633c", artKey: "centaur-archer" },
  { id: "demon-horde", name: "Demon Horde", token: "H", color: "#8b2f26", artKey: "demon-horde" },
  { id: "dawnforged", name: "Dawnforged", token: "D", color: "#3b7a57" },
  { id: "ironclad", name: "Ironclad", token: "I", color: "#7f2f2f" },
  { id: "sylvan", name: "Sylvan", token: "S", color: "#2f6e49" },
  { id: "emberkin", name: "Emberkin", token: "E", color: "#b35d2a" },
  { id: "tideborn", name: "Tideborn", token: "T", color: "#2f5f8c" },
  { id: "stoneguard", name: "Stoneguard", token: "G", color: "#5f655f" }
];

const CENTAUR_UNIT_ARCHETYPES = [
  {
    id: "recon",
    name: "Recon",
    loadout: "Short Bow + Light Sword",
    coatColor: "#8f6a49",
    stats: { hp: 18, attack: 11, damage: 7, armor: 3, evasiveness: 15, combatMp: 4 },
    abilities: ["archery"]
  },
  {
    id: "brute",
    name: "Brute",
    loadout: "Plate Armor + Two-Handed Axe",
    coatColor: "#694f39",
    stats: { hp: 28, attack: 15, damage: 16, armor: 17, evasiveness: 5, combatMp: 2 },
    abilities: []
  },
  {
    id: "marksman",
    name: "Marksman",
    loadout: "Longbow + Short Sword + Leather Armor",
    coatColor: "#765b3f",
    stats: { hp: 21, attack: 14, damage: 11, armor: 7, evasiveness: 12, combatMp: 3 },
    abilities: ["archery", "marksmanship"]
  },
  {
    id: "captain",
    name: "Captain",
    loadout: "Long Axe + Medium Armor",
    coatColor: "#d8d4cb",
    stats: { hp: 25, attack: 16, damage: 13, armor: 11, evasiveness: 9, combatMp: 3 },
    abilities: []
  }
];

const DEMON_UNIT_ARCHETYPES = [
  {
    id: "imp",
    name: "Imp",
    loadout: "Hooves + Wings + Horns",
    coatColor: "#7c5742",
    stats: { hp: 16, attack: 10, damage: 6, armor: 2, evasiveness: 12, combatMp: 3 },
    abilities: []
  },
  {
    id: "gog",
    name: "Gog",
    loadout: "Firebody + Fireball Throw",
    coatColor: "#b4472e",
    stats: { hp: 20, attack: 13, damage: 11, armor: 5, evasiveness: 11, combatMp: 3 },
    abilities: []
  },
  {
    id: "hell-hound",
    name: "Hell Hound",
    loadout: "Cerberus-like Demon Dog",
    coatColor: "#59352a",
    stats: { hp: 24, attack: 15, damage: 13, armor: 6, evasiveness: 10, combatMp: 4 },
    abilities: []
  },
  {
    id: "succubus",
    name: "Succubus",
    loadout: "Winged Demon",
    coatColor: "#8f4b59",
    stats: { hp: 19, attack: 14, damage: 10, armor: 4, evasiveness: 15, combatMp: 3 },
    abilities: []
  },
  {
    id: "incubus",
    name: "Incubus",
    loadout: "Fire Djinni Demon",
    coatColor: "#9a5137",
    stats: { hp: 23, attack: 16, damage: 14, armor: 8, evasiveness: 11, combatMp: 3 },
    abilities: []
  },
  {
    id: "arch-fiend",
    name: "Arch Fiend",
    loadout: "Battle Axe + Claws + Black Plate",
    coatColor: "#aa2f23",
    stats: { hp: 29, attack: 18, damage: 17, armor: 16, evasiveness: 7, combatMp: 2 },
    abilities: []
  }
];

const CENTAUR_COMBAT_SPRITE_LOOKUP = {
  recon: {
    horse: "#8f6746",
    horseShade: "#5b3d27",
    skin: "#c49a71",
    armor: "#8a8e84",
    mane: "#523825",
    weapon: "shortbow+sword"
  },
  brute: {
    horse: "#70533f",
    horseShade: "#452f22",
    skin: "#b08862",
    armor: "#bfc5cd",
    mane: "#2f251e",
    weapon: "greataxe"
  },
  marksman: {
    horse: "#7a5f44",
    horseShade: "#4c3426",
    skin: "#bb936b",
    armor: "#916d4b",
    mane: "#493121",
    weapon: "longbow+sword"
  },
  captain: {
    horse: "#e1dbd0",
    horseShade: "#a6a8a8",
    skin: "#d9c3a4",
    armor: "#88928b",
    mane: "#f1eee6",
    weapon: "poleaxe"
  }
};

const DEMON_COMBAT_SPRITE_LOOKUP = {
  imp: {
    body: "#7c5742",
    shade: "#4f3527",
    accent: "#d2b083",
    fire: "#f08a39",
    wing: "#74423a",
    weapon: "claws"
  },
  gog: {
    body: "#b4472e",
    shade: "#7d2b1c",
    accent: "#f0c184",
    fire: "#ff6f2a",
    wing: "#8b2f23",
    weapon: "fireball"
  },
  "hell-hound": {
    body: "#654034",
    shade: "#3f261f",
    accent: "#d19e74",
    fire: "#f09f33",
    wing: "#5f2f2f",
    weapon: "fangs"
  },
  succubus: {
    body: "#8f4b59",
    shade: "#5d2d39",
    accent: "#f2c7b1",
    fire: "#ff8b5c",
    wing: "#6f3546",
    weapon: "flight"
  },
  incubus: {
    body: "#9a5137",
    shade: "#5f3223",
    accent: "#ebbb96",
    fire: "#ff7b37",
    wing: "#7f3a2b",
    weapon: "djinni-fire"
  },
  "arch-fiend": {
    body: "#aa2f23",
    shade: "#661811",
    accent: "#f1c3a6",
    fire: "#ff5f22",
    wing: "#2c2f33",
    weapon: "battleaxe"
  }
};

function boardSize() {
  return 640;
}

const board = document.getElementById("board");
const ctx = board.getContext("2d");
const setupScreenEl = document.getElementById("setupScreen");
const playerRaceSelectEl = document.getElementById("playerRaceSelect");
const enemyRaceSelectEl = document.getElementById("enemyRaceSelect");
const playerRacePreviewEl = document.getElementById("playerRacePreview");
const enemyRacePreviewEl = document.getElementById("enemyRacePreview");
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
const raceArtCache = new Map();
const centaurCombatSpriteCache = new Map();
const demonCombatSpriteCache = new Map();

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

function pickRandomCentaurArchetype() {
  return CENTAUR_UNIT_ARCHETYPES[randomInt(0, CENTAUR_UNIT_ARCHETYPES.length - 1)];
}

function pickRandomDemonArchetype() {
  return DEMON_UNIT_ARCHETYPES[randomInt(0, DEMON_UNIT_ARCHETYPES.length - 1)];
}

function createCentaurUnit(side, race, index) {
  const archetype = pickRandomCentaurArchetype();
  const stats = archetype.stats;
  const maxHp = stats.hp;
  const armor = stats.armor;

  return {
    id: `${side[0].toUpperCase()}${index + 1}`,
    label: `${race.token}${index + 1}`,
    side,
    unitRaceId: race.id,
    alive: true,
    unitClass: archetype.name,
    loadout: archetype.loadout,
    archetypeId: archetype.id,
    coatColor: archetype.coatColor,
    abilities: [...(archetype.abilities || [])],
    hp: maxHp,
    maxHp,
    attack: stats.attack,
    damage: stats.damage,
    armor,
    maxArmor: armor,
    evasiveness: stats.evasiveness,
    maxCombatMp: stats.combatMp,
    currentCombatMp: 0,
    x: null,
    y: null
  };
}

function createDemonUnit(side, race, index) {
  const archetype = pickRandomDemonArchetype();
  const stats = archetype.stats;
  const maxHp = stats.hp;
  const armor = stats.armor;

  return {
    id: `${side[0].toUpperCase()}${index + 1}`,
    label: `${race.token}${index + 1}`,
    side,
    unitRaceId: race.id,
    alive: true,
    unitClass: archetype.name,
    loadout: archetype.loadout,
    archetypeId: archetype.id,
    coatColor: archetype.coatColor,
    abilities: [...(archetype.abilities || [])],
    hp: maxHp,
    maxHp,
    attack: stats.attack,
    damage: stats.damage,
    armor,
    maxArmor: armor,
    evasiveness: stats.evasiveness,
    maxCombatMp: stats.combatMp,
    currentCombatMp: 0,
    x: null,
    y: null
  };
}

function createDefaultUnit(side, race, index) {
  const maxHp = randomInt(14, 30);
  const armor = randomInt(1, 20);
  return {
    id: `${side[0].toUpperCase()}${index + 1}`,
    label: `${race.token}${index + 1}`,
    side,
    unitRaceId: race.id,
    alive: true,
    abilities: [],
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
  };
}

function createStack(side, race, x, y) {
  const count = randomInt(1, 8);
  const units = [];

  for (let i = 0; i < count; i += 1) {
    if (race.id === "centaur-clans") {
      units.push(createCentaurUnit(side, race, i));
    } else if (race.id === "demon-horde") {
      units.push(createDemonUnit(side, race, i));
    } else {
      units.push(createDefaultUnit(side, race, i));
    }
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

function createArtCanvas(width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function drawFrameBorder(ctx, width, height) {
  const border = Math.max(2, Math.floor(width * 0.03));
  ctx.fillStyle = "rgba(232, 212, 166, 0.78)";
  ctx.fillRect(0, 0, width, border);
  ctx.fillRect(0, height - border, width, border);
  ctx.fillRect(0, border, border, height - border * 2);
  ctx.fillRect(width - border, border, border, height - border * 2);
  ctx.strokeStyle = "#6f5730";
  ctx.lineWidth = Math.max(1, width * 0.012);
  ctx.strokeRect(width * 0.02, height * 0.02, width * 0.96, height * 0.96);
}

function drawCentaurArcherArt(ctx, width, height) {
  const frame = Math.max(2, Math.floor(width * 0.05));
  const innerX = frame;
  const innerY = frame;
  const innerW = width - frame * 2;
  const innerH = height - frame * 2;
  const horizonY = innerY + innerH * 0.56;

  const skyGradient = ctx.createLinearGradient(0, innerY, 0, innerY + innerH);
  skyGradient.addColorStop(0, "#4f6f8d");
  skyGradient.addColorStop(0.36, "#7f92a1");
  skyGradient.addColorStop(0.68, "#657764");
  skyGradient.addColorStop(1, "#4a5e45");
  ctx.fillStyle = skyGradient;
  ctx.fillRect(innerX, innerY, innerW, innerH);

  const sunX = innerX + innerW * 0.19;
  const sunY = innerY + innerH * 0.22;
  const sunGlow = ctx.createRadialGradient(sunX, sunY, 3, sunX, sunY, innerW * 0.27);
  sunGlow.addColorStop(0, "rgba(255, 229, 171, 0.9)");
  sunGlow.addColorStop(1, "rgba(255, 229, 171, 0)");
  ctx.fillStyle = sunGlow;
  ctx.fillRect(innerX, innerY, innerW, innerH);

  ctx.fillStyle = "rgba(83, 88, 106, 0.58)";
  ctx.beginPath();
  ctx.moveTo(innerX, horizonY);
  ctx.lineTo(innerX + innerW * 0.13, innerY + innerH * 0.45);
  ctx.lineTo(innerX + innerW * 0.24, innerY + innerH * 0.52);
  ctx.lineTo(innerX + innerW * 0.37, innerY + innerH * 0.41);
  ctx.lineTo(innerX + innerW * 0.53, innerY + innerH * 0.55);
  ctx.lineTo(innerX + innerW * 0.7, innerY + innerH * 0.43);
  ctx.lineTo(innerX + innerW * 0.87, innerY + innerH * 0.56);
  ctx.lineTo(innerX + innerW, horizonY);
  ctx.closePath();
  ctx.fill();

  const foothill = ctx.createLinearGradient(0, horizonY - innerH * 0.04, 0, innerY + innerH);
  foothill.addColorStop(0, "#5e704f");
  foothill.addColorStop(1, "#2f3f2f");
  ctx.fillStyle = foothill;
  ctx.fillRect(innerX, horizonY - innerH * 0.04, innerW, innerH - (horizonY - innerY));

  for (let i = 0; i < 24; i += 1) {
    const gx = innerX + (innerW * (i + 0.2)) / 24;
    const gy = horizonY + innerH * (0.1 + (i % 4) * 0.03);
    ctx.strokeStyle = i % 2 === 0 ? "rgba(170, 197, 132, 0.24)" : "rgba(109, 145, 89, 0.22)";
    ctx.lineWidth = Math.max(1, innerW * 0.003);
    ctx.beginPath();
    ctx.moveTo(gx, gy + innerH * 0.17);
    ctx.lineTo(gx + innerW * 0.009, gy + innerH * 0.12);
    ctx.stroke();
  }

  const spriteLook = {
    horse: "#7a5f44",
    horseShade: "#4c3426",
    skin: "#bb936b",
    armor: "#916d4b",
    mane: "#493121",
    weapon: "longbow+sword"
  };
  const spriteCanvas = createArtCanvas(220, 170);
  const spriteCtx = spriteCanvas.getContext("2d");
  drawCentaurCombatSprite(spriteCtx, spriteLook, "player", spriteCanvas.width, spriteCanvas.height);

  const spriteW = innerW * 0.58;
  const spriteH = innerH * 0.86;
  const spriteX = innerX + innerW * 0.48 - spriteW * 0.5;
  const spriteY = innerY + innerH * 0.64 - spriteH * 0.54;
  ctx.drawImage(spriteCanvas, spriteX, spriteY, spriteW, spriteH);

  const badgeW = innerW * 0.24;
  const badgeH = innerH * 0.2;
  const badgeX = innerX + innerW * 0.04;
  const badgeY = innerY + innerH * 0.72;
  const badge = ctx.createLinearGradient(badgeX, badgeY, badgeX, badgeY + badgeH);
  badge.addColorStop(0, "rgba(22, 30, 28, 0.72)");
  badge.addColorStop(1, "rgba(12, 18, 17, 0.88)");
  ctx.fillStyle = badge;
  ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
  ctx.strokeStyle = "rgba(217, 188, 126, 0.55)";
  ctx.lineWidth = 1.2;
  ctx.strokeRect(badgeX, badgeY, badgeW, badgeH);
  ctx.fillStyle = "#ead8af";
  ctx.font = `bold ${Math.max(11, Math.floor(innerH * 0.09))}px Georgia, serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Centaur", badgeX + badgeW * 0.5, badgeY + badgeH * 0.5);
  ctx.textBaseline = "alphabetic";

  const vignette = ctx.createRadialGradient(width * 0.5, height * 0.5, width * 0.25, width * 0.5, height * 0.5, width * 0.9);
  vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
  vignette.addColorStop(1, "rgba(0, 0, 0, 0.4)");
  ctx.fillStyle = vignette;
  ctx.fillRect(innerX, innerY, innerW, innerH);

  drawFrameBorder(ctx, width, height);
}

function drawCentaurTokenArt(ctx, size) {
  const sky = ctx.createLinearGradient(0, 0, 0, size);
  sky.addColorStop(0, "#8ba2ab");
  sky.addColorStop(1, "#4d5f45");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = "#6c7a52";
  ctx.fillRect(0, size * 0.62, size, size * 0.38);

  const centerX = size * 0.52;
  const centerY = size * 0.6;
  const scale = size / 64;

  ctx.fillStyle = "#3f2819";
  ctx.beginPath();
  ctx.ellipse(centerX - 10 * scale, centerY + 1 * scale, 16 * scale, 9 * scale, -0.08, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillRect(centerX - 20 * scale, centerY + 7 * scale, 3 * scale, 13 * scale);
  ctx.fillRect(centerX - 9 * scale, centerY + 8 * scale, 3 * scale, 13 * scale);
  ctx.fillRect(centerX + 2 * scale, centerY + 7 * scale, 3 * scale, 13 * scale);
  ctx.fillRect(centerX + 12 * scale, centerY + 6 * scale, 3 * scale, 13 * scale);

  ctx.fillStyle = "#6f4932";
  ctx.fillRect(centerX - 8 * scale, centerY - 11 * scale, 9 * scale, 13 * scale);
  ctx.beginPath();
  ctx.arc(centerX - 3 * scale, centerY - 15 * scale, 4.6 * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#d9b070";
  ctx.lineWidth = 2.2 * scale;
  ctx.beginPath();
  ctx.arc(centerX + 11 * scale, centerY - 10 * scale, 7 * scale, Math.PI * 0.5, Math.PI * 1.6, true);
  ctx.stroke();

  ctx.strokeStyle = "#ede7d2";
  ctx.lineWidth = 1.15 * scale;
  ctx.beginPath();
  ctx.moveTo(centerX + 6 * scale, centerY - 16 * scale);
  ctx.lineTo(centerX + 7 * scale, centerY - 4 * scale);
  ctx.stroke();

  ctx.strokeStyle = "#f2e0bd";
  ctx.lineWidth = 1.7 * scale;
  ctx.beginPath();
  ctx.moveTo(centerX + 2 * scale, centerY - 10 * scale);
  ctx.lineTo(centerX + 20 * scale, centerY - 10 * scale);
  ctx.stroke();

  ctx.fillStyle = "#f0e8d0";
  ctx.beginPath();
  ctx.moveTo(centerX + 20 * scale, centerY - 10 * scale);
  ctx.lineTo(centerX + 16 * scale, centerY - 12 * scale);
  ctx.lineTo(centerX + 16 * scale, centerY - 8 * scale);
  ctx.closePath();
  ctx.fill();
}

function drawDemonHordeArt(ctx, width, height) {
  const frame = Math.max(2, Math.floor(width * 0.05));
  const innerX = frame;
  const innerY = frame;
  const innerW = width - frame * 2;
  const innerH = height - frame * 2;
  const horizonY = innerY + innerH * 0.6;

  const sky = ctx.createLinearGradient(0, innerY, 0, innerY + innerH);
  sky.addColorStop(0, "#2e0507");
  sky.addColorStop(0.34, "#5b1212");
  sky.addColorStop(0.68, "#8f2418");
  sky.addColorStop(1, "#3f120e");
  ctx.fillStyle = sky;
  ctx.fillRect(innerX, innerY, innerW, innerH);

  const infernoGlow = ctx.createRadialGradient(
    innerX + innerW * 0.42,
    innerY + innerH * 0.32,
    3,
    innerX + innerW * 0.42,
    innerY + innerH * 0.32,
    innerW * 0.45
  );
  infernoGlow.addColorStop(0, "rgba(255, 151, 86, 0.6)");
  infernoGlow.addColorStop(1, "rgba(255, 151, 86, 0)");
  ctx.fillStyle = infernoGlow;
  ctx.fillRect(innerX, innerY, innerW, innerH);

  for (let i = 0; i < 26; i += 1) {
    const px = innerX + ((i + 0.4) * innerW) / 26;
    const baseY = horizonY + innerH * (0.02 + (i % 4) * 0.01);
    const flameHeight = innerH * (0.11 + (i % 5) * 0.018);
    ctx.fillStyle = i % 2 === 0 ? "rgba(255, 110, 34, 0.48)" : "rgba(255, 169, 92, 0.35)";
    ctx.beginPath();
    ctx.moveTo(px, baseY);
    ctx.lineTo(px - innerW * 0.012, baseY + flameHeight * 0.85);
    ctx.lineTo(px + innerW * 0.012, baseY + flameHeight * 0.85);
    ctx.closePath();
    ctx.fill();
  }

  const ridgeGradient = ctx.createLinearGradient(0, horizonY - innerH * 0.03, 0, innerY + innerH);
  ridgeGradient.addColorStop(0, "#4c1711");
  ridgeGradient.addColorStop(1, "#1f090a");
  ctx.fillStyle = ridgeGradient;
  ctx.beginPath();
  ctx.moveTo(innerX, horizonY + innerH * 0.02);
  ctx.lineTo(innerX + innerW * 0.14, horizonY - innerH * 0.05);
  ctx.lineTo(innerX + innerW * 0.29, horizonY + innerH * 0.03);
  ctx.lineTo(innerX + innerW * 0.44, horizonY - innerH * 0.07);
  ctx.lineTo(innerX + innerW * 0.61, horizonY + innerH * 0.02);
  ctx.lineTo(innerX + innerW * 0.79, horizonY - innerH * 0.06);
  ctx.lineTo(innerX + innerW, horizonY + innerH * 0.03);
  ctx.lineTo(innerX + innerW, innerY + innerH);
  ctx.lineTo(innerX, innerY + innerH);
  ctx.closePath();
  ctx.fill();

  const spriteLook = DEMON_COMBAT_SPRITE_LOOKUP["arch-fiend"];
  const spriteCanvas = createArtCanvas(220, 170);
  const spriteCtx = spriteCanvas.getContext("2d");
  drawDemonCombatSprite(spriteCtx, spriteLook, "player", spriteCanvas.width, spriteCanvas.height);

  const spriteW = innerW * 0.62;
  const spriteH = innerH * 0.88;
  const spriteX = innerX + innerW * 0.56 - spriteW * 0.5;
  const spriteY = innerY + innerH * 0.65 - spriteH * 0.54;
  ctx.drawImage(spriteCanvas, spriteX, spriteY, spriteW, spriteH);

  const badgeW = innerW * 0.28;
  const badgeH = innerH * 0.2;
  const badgeX = innerX + innerW * 0.04;
  const badgeY = innerY + innerH * 0.72;
  const badge = ctx.createLinearGradient(badgeX, badgeY, badgeX, badgeY + badgeH);
  badge.addColorStop(0, "rgba(37, 8, 10, 0.76)");
  badge.addColorStop(1, "rgba(16, 2, 4, 0.9)");
  ctx.fillStyle = badge;
  ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
  ctx.strokeStyle = "rgba(246, 184, 111, 0.55)";
  ctx.lineWidth = 1.2;
  ctx.strokeRect(badgeX, badgeY, badgeW, badgeH);
  ctx.fillStyle = "#f2d2a0";
  ctx.font = `bold ${Math.max(11, Math.floor(innerH * 0.09))}px Georgia, serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Demon", badgeX + badgeW * 0.5, badgeY + badgeH * 0.5);
  ctx.textBaseline = "alphabetic";

  const vignette = ctx.createRadialGradient(width * 0.5, height * 0.5, width * 0.25, width * 0.5, height * 0.5, width * 0.9);
  vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
  vignette.addColorStop(1, "rgba(0, 0, 0, 0.45)");
  ctx.fillStyle = vignette;
  ctx.fillRect(innerX, innerY, innerW, innerH);

  drawFrameBorder(ctx, width, height);
}

function drawDemonTokenArt(ctx, size) {
  const sky = ctx.createLinearGradient(0, 0, 0, size);
  sky.addColorStop(0, "#6f1716");
  sky.addColorStop(1, "#2c0909");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = "#4b1712";
  ctx.fillRect(0, size * 0.62, size, size * 0.38);

  const centerX = size * 0.5;
  const centerY = size * 0.55;
  const scale = size / 64;

  ctx.fillStyle = "#1a090b";
  ctx.beginPath();
  ctx.ellipse(centerX, centerY + 7 * scale, 18 * scale, 8 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ab2e22";
  ctx.beginPath();
  ctx.moveTo(centerX - 9 * scale, centerY + 12 * scale);
  ctx.lineTo(centerX - 15 * scale, centerY - 3 * scale);
  ctx.lineTo(centerX - 10 * scale, centerY - 13 * scale);
  ctx.lineTo(centerX - 2 * scale, centerY - 3 * scale);
  ctx.lineTo(centerX + 4 * scale, centerY + 11 * scale);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(centerX + 8 * scale, centerY + 11 * scale);
  ctx.lineTo(centerX + 2 * scale, centerY - 3 * scale);
  ctx.lineTo(centerX + 8 * scale, centerY - 13 * scale);
  ctx.lineTo(centerX + 16 * scale, centerY - 2 * scale);
  ctx.lineTo(centerX + 14 * scale, centerY + 11 * scale);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#601814";
  ctx.beginPath();
  ctx.moveTo(centerX - 1 * scale, centerY - 16 * scale);
  ctx.lineTo(centerX - 6 * scale, centerY - 27 * scale);
  ctx.lineTo(centerX - 2 * scale, centerY - 26 * scale);
  ctx.lineTo(centerX + 1 * scale, centerY - 20 * scale);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(centerX + 3 * scale, centerY - 15 * scale);
  ctx.lineTo(centerX + 9 * scale, centerY - 26 * scale);
  ctx.lineTo(centerX + 12 * scale, centerY - 24 * scale);
  ctx.lineTo(centerX + 7 * scale, centerY - 17 * scale);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#f2d8b2";
  ctx.beginPath();
  ctx.arc(centerX + 1 * scale, centerY - 7 * scale, 4.8 * scale, 0, Math.PI * 2);
  ctx.fill();

  const flame = ctx.createRadialGradient(centerX + 17 * scale, centerY - 4 * scale, 1, centerX + 17 * scale, centerY - 4 * scale, 11 * scale);
  flame.addColorStop(0, "rgba(255, 208, 118, 0.95)");
  flame.addColorStop(0.6, "rgba(255, 118, 48, 0.72)");
  flame.addColorStop(1, "rgba(255, 82, 33, 0)");
  ctx.fillStyle = flame;
  ctx.beginPath();
  ctx.ellipse(centerX + 17 * scale, centerY - 4 * scale, 8 * scale, 10 * scale, 0.2, 0, Math.PI * 2);
  ctx.fill();
}

function drawGenericRaceArt(ctx, width, height, race) {
  const frame = Math.max(2, Math.floor(width * 0.05));
  const innerX = frame;
  const innerY = frame;
  const innerW = width - frame * 2;
  const innerH = height - frame * 2;
  const dark = "#1a2322";
  const accent = race.color || "#5e6d5f";
  const token = race.token || "?";

  const bgGradient = ctx.createLinearGradient(0, innerY, 0, innerY + innerH);
  bgGradient.addColorStop(0, "#6b7e83");
  bgGradient.addColorStop(0.55, "#4f635f");
  bgGradient.addColorStop(1, dark);
  ctx.fillStyle = bgGradient;
  ctx.fillRect(innerX, innerY, innerW, innerH);

  ctx.strokeStyle = "rgba(235, 225, 194, 0.27)";
  ctx.lineWidth = Math.max(1, innerW * 0.01);
  ctx.strokeRect(innerX + innerW * 0.07, innerY + innerH * 0.1, innerW * 0.86, innerH * 0.8);

  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.moveTo(innerX + innerW * 0.5, innerY + innerH * 0.14);
  ctx.lineTo(innerX + innerW * 0.74, innerY + innerH * 0.32);
  ctx.lineTo(innerX + innerW * 0.64, innerY + innerH * 0.79);
  ctx.lineTo(innerX + innerW * 0.36, innerY + innerH * 0.79);
  ctx.lineTo(innerX + innerW * 0.26, innerY + innerH * 0.32);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#f7efd2";
  ctx.font = `bold ${Math.floor(innerH * 0.42)}px Georgia, serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(token, innerX + innerW * 0.5, innerY + innerH * 0.52);

  drawFrameBorder(ctx, width, height);
}

function drawRandomRaceArt(ctx, width, height) {
  const frame = Math.max(2, Math.floor(width * 0.05));
  const innerX = frame;
  const innerY = frame;
  const innerW = width - frame * 2;
  const innerH = height - frame * 2;
  const bgGradient = ctx.createLinearGradient(innerX, innerY, innerX + innerW, innerY + innerH);
  bgGradient.addColorStop(0, "#495a5f");
  bgGradient.addColorStop(1, "#233337");
  ctx.fillStyle = bgGradient;
  ctx.fillRect(innerX, innerY, innerW, innerH);

  ctx.fillStyle = "#e8d3a5";
  ctx.font = `bold ${Math.floor(innerH * 0.27)}px Georgia, serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Random", innerX + innerW * 0.5, innerY + innerH * 0.4);

  ctx.fillStyle = "#f3e6c9";
  ctx.font = `bold ${Math.floor(innerH * 0.35)}px Georgia, serif`;
  ctx.fillText("?", innerX + innerW * 0.5, innerY + innerH * 0.67);

  drawFrameBorder(ctx, width, height);
}

function getCentaurCombatLook(unit) {
  const fallback = CENTAUR_COMBAT_SPRITE_LOOKUP.recon;
  if (!unit?.archetypeId) {
    return fallback;
  }
  return CENTAUR_COMBAT_SPRITE_LOOKUP[unit.archetypeId] || fallback;
}

function getDemonCombatLook(unit) {
  const fallback = DEMON_COMBAT_SPRITE_LOOKUP.imp;
  if (!unit?.archetypeId) {
    return fallback;
  }
  return DEMON_COMBAT_SPRITE_LOOKUP[unit.archetypeId] || fallback;
}

function drawCentaurCombatSprite(drawCtx, look, side, width, height) {
  const shadeTint = side === "enemy" ? "rgba(88, 34, 30, 0.15)" : "rgba(40, 70, 44, 0.08)";

  drawCtx.clearRect(0, 0, width, height);

  drawCtx.fillStyle = "rgba(8, 11, 15, 0.35)";
  drawCtx.beginPath();
  drawCtx.ellipse(width * 0.46, height * 0.84, width * 0.3, height * 0.1, -0.05, 0, Math.PI * 2);
  drawCtx.fill();

  const horseBody = drawCtx.createLinearGradient(width * 0.2, height * 0.42, width * 0.72, height * 0.74);
  horseBody.addColorStop(0, look.horse);
  horseBody.addColorStop(1, look.horseShade);
  drawCtx.fillStyle = horseBody;
  drawCtx.beginPath();
  drawCtx.ellipse(width * 0.49, height * 0.56, width * 0.24, height * 0.19, -0.04, 0, Math.PI * 2);
  drawCtx.fill();

  drawCtx.fillStyle = "rgba(245, 223, 184, 0.1)";
  drawCtx.beginPath();
  drawCtx.ellipse(width * 0.36, height * 0.53, width * 0.09, height * 0.07, -0.14, 0, Math.PI * 2);
  drawCtx.fill();
  drawCtx.beginPath();
  drawCtx.ellipse(width * 0.6, height * 0.6, width * 0.1, height * 0.08, 0.2, 0, Math.PI * 2);
  drawCtx.fill();

  drawCtx.fillStyle = "rgba(28, 20, 14, 0.35)";
  drawCtx.beginPath();
  drawCtx.ellipse(width * 0.49, height * 0.62, width * 0.2, height * 0.08, 0, 0, Math.PI * 2);
  drawCtx.fill();

  drawCtx.strokeStyle = look.horseShade;
  drawCtx.lineWidth = Math.max(2, width * 0.03);
  drawCtx.beginPath();
  drawCtx.moveTo(width * 0.24, height * 0.52);
  drawCtx.quadraticCurveTo(width * 0.16, height * 0.57, width * 0.1, height * 0.7);
  drawCtx.stroke();

  function drawLeg(x, y, legWidth, legHeight, kneeShift) {
    const grad = drawCtx.createLinearGradient(x, y, x, y + legHeight);
    grad.addColorStop(0, look.horse);
    grad.addColorStop(1, look.horseShade);
    drawCtx.fillStyle = grad;
    drawCtx.beginPath();
    drawCtx.moveTo(x, y);
    drawCtx.lineTo(x + legWidth, y + kneeShift);
    drawCtx.lineTo(x + legWidth - 2, y + legHeight);
    drawCtx.lineTo(x - 2, y + legHeight);
    drawCtx.closePath();
    drawCtx.fill();
    drawCtx.fillStyle = "#1a2027";
    drawCtx.fillRect(x - 1, y + legHeight - 3, legWidth + 2, 4);
  }

  drawLeg(width * 0.29, height * 0.66, width * 0.06, height * 0.22, height * 0.03);
  drawLeg(width * 0.39, height * 0.67, width * 0.06, height * 0.21, height * 0.02);
  drawLeg(width * 0.51, height * 0.66, width * 0.06, height * 0.22, height * 0.03);
  drawLeg(width * 0.61, height * 0.65, width * 0.065, height * 0.24, height * 0.03);

  if (look.weapon === "greataxe") {
    drawCtx.fillStyle = "rgba(195, 200, 208, 0.92)";
    drawCtx.fillRect(width * 0.34, height * 0.48, width * 0.28, height * 0.17);
    drawCtx.fillRect(width * 0.31, height * 0.56, width * 0.34, height * 0.08);
  } else if (look.weapon === "poleaxe") {
    drawCtx.fillStyle = "rgba(142, 151, 143, 0.92)";
    drawCtx.fillRect(width * 0.35, height * 0.5, width * 0.26, height * 0.15);
    drawCtx.fillRect(width * 0.33, height * 0.57, width * 0.31, height * 0.06);
  } else if (look.weapon.includes("longbow")) {
    drawCtx.fillStyle = "rgba(146, 108, 72, 0.85)";
    drawCtx.fillRect(width * 0.35, height * 0.52, width * 0.23, height * 0.12);
  }

  const torso = drawCtx.createLinearGradient(width * 0.4, height * 0.28, width * 0.53, height * 0.55);
  torso.addColorStop(0, look.skin);
  torso.addColorStop(1, "#8d694d");
  drawCtx.fillStyle = torso;
  drawCtx.fillRect(width * 0.41, height * 0.3, width * 0.14, height * 0.25);

  const head = drawCtx.createLinearGradient(width * 0.42, height * 0.18, width * 0.51, height * 0.3);
  head.addColorStop(0, look.skin);
  head.addColorStop(1, "#947053");
  drawCtx.fillStyle = head;
  drawCtx.beginPath();
  drawCtx.ellipse(width * 0.48, height * 0.23, width * 0.06, height * 0.075, 0.12, 0, Math.PI * 2);
  drawCtx.fill();

  drawCtx.fillStyle = look.mane;
  drawCtx.beginPath();
  drawCtx.arc(width * 0.46, height * 0.2, width * 0.035, Math.PI * 0.9, Math.PI * 2.1);
  drawCtx.fill();

  if (look.weapon === "greataxe") {
    drawCtx.fillStyle = "rgba(190, 198, 208, 0.95)";
    drawCtx.fillRect(width * 0.39, height * 0.28, width * 0.18, height * 0.18);
    drawCtx.fillRect(width * 0.37, height * 0.36, width * 0.21, height * 0.09);
    drawCtx.fillRect(width * 0.42, height * 0.17, width * 0.11, height * 0.03);
  } else if (look.weapon.includes("longbow")) {
    drawCtx.fillStyle = "rgba(144, 108, 73, 0.88)";
    drawCtx.fillRect(width * 0.39, height * 0.32, width * 0.16, height * 0.15);
  } else if (look.weapon === "poleaxe") {
    drawCtx.fillStyle = "rgba(139, 150, 141, 0.92)";
    drawCtx.fillRect(width * 0.39, height * 0.31, width * 0.17, height * 0.16);
    drawCtx.fillRect(width * 0.37, height * 0.38, width * 0.2, height * 0.07);
  } else {
    drawCtx.fillStyle = "rgba(146, 144, 129, 0.82)";
    drawCtx.fillRect(width * 0.41, height * 0.36, width * 0.12, height * 0.08);
  }

  drawCtx.strokeStyle = look.skin;
  drawCtx.lineWidth = Math.max(2, width * 0.024);
  drawCtx.beginPath();
  drawCtx.moveTo(width * 0.54, height * 0.38);
  drawCtx.lineTo(width * 0.61, height * 0.44);
  drawCtx.moveTo(width * 0.43, height * 0.37);
  drawCtx.lineTo(width * 0.5, height * 0.45);
  drawCtx.stroke();

  if (look.weapon.includes("bow")) {
    const long = look.weapon.startsWith("long");
    drawCtx.strokeStyle = "#d6b07a";
    drawCtx.lineWidth = Math.max(2, width * 0.016);
    drawCtx.beginPath();
    drawCtx.arc(width * 0.67, height * 0.44, long ? width * 0.088 : width * 0.065, Math.PI * 0.45, Math.PI * 1.58, true);
    drawCtx.stroke();

    drawCtx.strokeStyle = "#efe6cd";
    drawCtx.lineWidth = 1.3;
    drawCtx.beginPath();
    drawCtx.moveTo(width * 0.64, long ? height * 0.36 : height * 0.39);
    drawCtx.lineTo(width * 0.646, long ? height * 0.54 : height * 0.52);
    drawCtx.stroke();

    drawCtx.strokeStyle = "#f0dfbb";
    drawCtx.lineWidth = Math.max(1.8, width * 0.012);
    drawCtx.beginPath();
    drawCtx.moveTo(width * 0.59, height * 0.43);
    drawCtx.lineTo(long ? width * 0.79 : width * 0.73, height * 0.41);
    drawCtx.stroke();

    drawCtx.fillStyle = "#bec4ca";
    drawCtx.beginPath();
    drawCtx.moveTo(long ? width * 0.79 : width * 0.73, height * 0.41);
    drawCtx.lineTo(long ? width * 0.76 : width * 0.7, height * 0.395);
    drawCtx.lineTo(long ? width * 0.76 : width * 0.7, height * 0.425);
    drawCtx.closePath();
    drawCtx.fill();
  }

  if (look.weapon.includes("sword")) {
    drawCtx.strokeStyle = "#d6dce3";
    drawCtx.lineWidth = Math.max(2, width * 0.012);
    drawCtx.beginPath();
    drawCtx.moveTo(width * 0.52, height * 0.44);
    drawCtx.lineTo(width * 0.6, height * 0.54);
    drawCtx.stroke();
    drawCtx.fillStyle = "#9d8252";
    drawCtx.fillRect(width * 0.5, height * 0.42, width * 0.03, height * 0.028);
  }

  if (look.weapon === "greataxe" || look.weapon === "poleaxe") {
    const long = look.weapon === "poleaxe";
    drawCtx.strokeStyle = "#7b5d3e";
    drawCtx.lineWidth = long ? Math.max(2.5, width * 0.018) : Math.max(2.8, width * 0.021);
    drawCtx.beginPath();
    drawCtx.moveTo(width * 0.57, height * 0.41);
    drawCtx.lineTo(width * 0.74, long ? height * 0.8 : height * 0.73);
    drawCtx.stroke();

    drawCtx.fillStyle = "#c2c8cf";
    drawCtx.beginPath();
    drawCtx.moveTo(width * 0.545, height * 0.38);
    drawCtx.lineTo(width * 0.635, height * 0.32);
    drawCtx.lineTo(width * 0.68, height * 0.41);
    drawCtx.lineTo(width * 0.59, height * 0.45);
    drawCtx.closePath();
    drawCtx.fill();
  }

  drawCtx.fillStyle = shadeTint;
  drawCtx.fillRect(0, 0, width, height);
}

function drawDemonCombatSprite(drawCtx, look, side, width, height) {
  const shadeTint = side === "enemy" ? "rgba(87, 21, 14, 0.18)" : "rgba(29, 14, 24, 0.1)";
  const isHound = look.weapon === "fangs";
  const isSmallDemon = look.weapon === "claws" || look.weapon === "fireball";
  const isDjinni = look.weapon === "djinni-fire";

  drawCtx.clearRect(0, 0, width, height);

  drawCtx.fillStyle = "rgba(10, 8, 10, 0.36)";
  drawCtx.beginPath();
  drawCtx.ellipse(width * 0.5, height * 0.85, width * (isHound ? 0.33 : 0.3), height * 0.09, 0, 0, Math.PI * 2);
  drawCtx.fill();

  if (isHound) {
    const body = drawCtx.createLinearGradient(width * 0.24, height * 0.54, width * 0.78, height * 0.7);
    body.addColorStop(0, look.body);
    body.addColorStop(1, look.shade);
    drawCtx.fillStyle = body;
    drawCtx.beginPath();
    drawCtx.ellipse(width * 0.5, height * 0.63, width * 0.24, height * 0.14, -0.06, 0, Math.PI * 2);
    drawCtx.fill();

    drawCtx.fillStyle = look.body;
    drawCtx.beginPath();
    drawCtx.ellipse(width * 0.68, height * 0.6, width * 0.11, height * 0.09, 0.04, 0, Math.PI * 2);
    drawCtx.fill();

    drawCtx.fillStyle = look.shade;
    drawCtx.fillRect(width * 0.62, height * 0.55, width * 0.08, height * 0.08);

    drawCtx.fillStyle = look.body;
    drawCtx.beginPath();
    drawCtx.ellipse(width * 0.77, height * 0.55, width * 0.08, height * 0.065, -0.04, 0, Math.PI * 2);
    drawCtx.fill();

    drawCtx.fillStyle = look.accent;
    drawCtx.beginPath();
    drawCtx.ellipse(width * 0.83, height * 0.58, width * 0.04, height * 0.028, 0, 0, Math.PI * 2);
    drawCtx.fill();

    drawCtx.fillStyle = look.shade;
    drawCtx.beginPath();
    drawCtx.moveTo(width * 0.73, height * 0.5);
    drawCtx.lineTo(width * 0.7, height * 0.42);
    drawCtx.lineTo(width * 0.74, height * 0.44);
    drawCtx.closePath();
    drawCtx.fill();
    drawCtx.beginPath();
    drawCtx.moveTo(width * 0.79, height * 0.5);
    drawCtx.lineTo(width * 0.82, height * 0.42);
    drawCtx.lineTo(width * 0.84, height * 0.46);
    drawCtx.closePath();
    drawCtx.fill();

    drawCtx.fillStyle = look.shade;
    drawCtx.fillRect(width * 0.36, height * 0.68, width * 0.045, height * 0.2);
    drawCtx.fillRect(width * 0.47, height * 0.68, width * 0.045, height * 0.2);
    drawCtx.fillRect(width * 0.58, height * 0.69, width * 0.045, height * 0.19);
    drawCtx.fillRect(width * 0.67, height * 0.69, width * 0.045, height * 0.19);
    drawCtx.fillStyle = "#1a1113";
    drawCtx.fillRect(width * 0.35, height * 0.86, width * 0.06, height * 0.03);
    drawCtx.fillRect(width * 0.46, height * 0.86, width * 0.06, height * 0.03);
    drawCtx.fillRect(width * 0.57, height * 0.86, width * 0.06, height * 0.03);
    drawCtx.fillRect(width * 0.66, height * 0.86, width * 0.06, height * 0.03);

    drawCtx.strokeStyle = look.shade;
    drawCtx.lineWidth = Math.max(2, width * 0.016);
    drawCtx.beginPath();
    drawCtx.moveTo(width * 0.28, height * 0.62);
    drawCtx.quadraticCurveTo(width * 0.18, height * 0.52, width * 0.16, height * 0.44);
    drawCtx.stroke();

    const tailFire = drawCtx.createRadialGradient(width * 0.16, height * 0.42, 2, width * 0.16, height * 0.42, width * 0.08);
    tailFire.addColorStop(0, "rgba(255, 229, 156, 0.92)");
    tailFire.addColorStop(0.45, look.fire);
    tailFire.addColorStop(1, "rgba(255, 86, 31, 0)");
    drawCtx.fillStyle = tailFire;
    drawCtx.beginPath();
    drawCtx.ellipse(width * 0.16, height * 0.42, width * 0.07, height * 0.09, -0.2, 0, Math.PI * 2);
    drawCtx.fill();

    drawCtx.strokeStyle = "#d8c6a2";
    drawCtx.lineWidth = Math.max(1.8, width * 0.012);
    drawCtx.beginPath();
    drawCtx.moveTo(width * 0.81, height * 0.58);
    drawCtx.lineTo(width * 0.86, height * 0.61);
    drawCtx.moveTo(width * 0.8, height * 0.6);
    drawCtx.lineTo(width * 0.85, height * 0.63);
    drawCtx.stroke();
  } else {
    const lowerTorso = drawCtx.createLinearGradient(width * 0.34, height * 0.36, width * 0.62, height * 0.74);
    lowerTorso.addColorStop(0, look.body);
    lowerTorso.addColorStop(1, look.shade);
    drawCtx.fillStyle = lowerTorso;
    drawCtx.beginPath();
    drawCtx.ellipse(
      width * 0.5,
      height * (isSmallDemon ? 0.61 : 0.56),
      width * (isSmallDemon ? 0.13 : 0.17),
      height * (isSmallDemon ? 0.145 : 0.19),
      0,
      0,
      Math.PI * 2
    );
    drawCtx.fill();

    const chest = drawCtx.createLinearGradient(width * 0.43, height * 0.24, width * 0.54, height * 0.56);
    chest.addColorStop(0, look.body);
    chest.addColorStop(1, look.shade);
    drawCtx.fillStyle = chest;
    drawCtx.fillRect(
      width * (isSmallDemon ? 0.452 : 0.44),
      height * (isSmallDemon ? 0.37 : 0.29),
      width * (isSmallDemon ? 0.096 : 0.12),
      height * (isSmallDemon ? 0.21 : 0.27)
    );

    const headX = width * 0.5;
    const headY = height * (isSmallDemon ? 0.3 : 0.23);
    drawCtx.fillStyle = look.body;
    drawCtx.beginPath();
    drawCtx.ellipse(
      headX,
      headY,
      width * (isSmallDemon ? 0.048 : 0.06),
      height * (isSmallDemon ? 0.064 : 0.075),
      0,
      0,
      Math.PI * 2
    );
    drawCtx.fill();

    drawCtx.fillStyle = look.shade;
    drawCtx.beginPath();
    drawCtx.moveTo(headX - width * (isSmallDemon ? 0.026 : 0.03), headY - height * 0.04);
    drawCtx.lineTo(headX - width * (isSmallDemon ? 0.052 : 0.06), headY - height * 0.12);
    drawCtx.lineTo(headX - width * (isSmallDemon ? 0.018 : 0.02), headY - height * 0.11);
    drawCtx.closePath();
    drawCtx.fill();
    drawCtx.beginPath();
    drawCtx.moveTo(headX + width * (isSmallDemon ? 0.026 : 0.03), headY - height * 0.04);
    drawCtx.lineTo(headX + width * (isSmallDemon ? 0.052 : 0.06), headY - height * 0.12);
    drawCtx.lineTo(headX + width * (isSmallDemon ? 0.018 : 0.02), headY - height * 0.11);
    drawCtx.closePath();
    drawCtx.fill();

    drawCtx.fillStyle = look.accent;
    drawCtx.beginPath();
    drawCtx.arc(headX + width * 0.012, headY - height * 0.006, width * 0.008, 0, Math.PI * 2);
    drawCtx.fill();

    if (!isDjinni) {
      const wingColor = look.wing || look.shade;
      drawCtx.fillStyle = wingColor;

      if (isSmallDemon) {
        drawCtx.beginPath();
        drawCtx.moveTo(width * 0.45, height * 0.46);
        drawCtx.lineTo(width * 0.37, height * 0.52);
        drawCtx.lineTo(width * 0.41, height * 0.62);
        drawCtx.lineTo(width * 0.47, height * 0.56);
        drawCtx.closePath();
        drawCtx.fill();

        drawCtx.beginPath();
        drawCtx.moveTo(width * 0.55, height * 0.46);
        drawCtx.lineTo(width * 0.63, height * 0.52);
        drawCtx.lineTo(width * 0.59, height * 0.62);
        drawCtx.lineTo(width * 0.53, height * 0.56);
        drawCtx.closePath();
        drawCtx.fill();
      } else {
        const leftWing = drawCtx.createLinearGradient(width * 0.35, height * 0.34, width * 0.26, height * 0.67);
        leftWing.addColorStop(0, wingColor);
        leftWing.addColorStop(1, "rgba(24, 14, 20, 0.9)");
        drawCtx.fillStyle = leftWing;
        drawCtx.beginPath();
        drawCtx.moveTo(width * 0.44, height * 0.38);
        drawCtx.lineTo(width * 0.25, height * 0.5);
        drawCtx.lineTo(width * 0.3, height * 0.7);
        drawCtx.lineTo(width * 0.44, height * 0.58);
        drawCtx.closePath();
        drawCtx.fill();

        const rightWing = drawCtx.createLinearGradient(width * 0.65, height * 0.34, width * 0.74, height * 0.67);
        rightWing.addColorStop(0, wingColor);
        rightWing.addColorStop(1, "rgba(24, 14, 20, 0.9)");
        drawCtx.fillStyle = rightWing;
        drawCtx.beginPath();
        drawCtx.moveTo(width * 0.56, height * 0.38);
        drawCtx.lineTo(width * 0.75, height * 0.5);
        drawCtx.lineTo(width * 0.7, height * 0.7);
        drawCtx.lineTo(width * 0.56, height * 0.58);
        drawCtx.closePath();
        drawCtx.fill();
      }

      drawCtx.fillStyle = look.shade;
      drawCtx.fillRect(width * (isSmallDemon ? 0.445 : 0.41), height * 0.69, width * (isSmallDemon ? 0.042 : 0.05), height * 0.2);
      drawCtx.fillRect(width * (isSmallDemon ? 0.513 : 0.5), height * 0.69, width * (isSmallDemon ? 0.042 : 0.05), height * 0.2);
      drawCtx.fillStyle = "#1a1113";
      drawCtx.fillRect(width * (isSmallDemon ? 0.438 : 0.4), height * 0.86, width * 0.07, height * 0.03);
      drawCtx.fillRect(width * (isSmallDemon ? 0.505 : 0.49), height * 0.86, width * 0.07, height * 0.03);
    } else {
      const tail = drawCtx.createLinearGradient(width * 0.5, height * 0.56, width * 0.5, height * 0.92);
      tail.addColorStop(0, look.body);
      tail.addColorStop(1, "rgba(255, 106, 37, 0.22)");
      drawCtx.fillStyle = tail;
      drawCtx.beginPath();
      drawCtx.moveTo(width * 0.43, height * 0.56);
      drawCtx.quadraticCurveTo(width * 0.52, height * 0.73, width * 0.41, height * 0.9);
      drawCtx.quadraticCurveTo(width * 0.53, height * 0.86, width * 0.57, height * 0.93);
      drawCtx.quadraticCurveTo(width * 0.64, height * 0.74, width * 0.57, height * 0.56);
      drawCtx.closePath();
      drawCtx.fill();

      drawCtx.strokeStyle = look.fire;
      drawCtx.lineWidth = Math.max(2.2, width * 0.016);
      drawCtx.beginPath();
      drawCtx.arc(width * 0.49, height * 0.72, width * 0.125, Math.PI * 0.05, Math.PI * 1.43, false);
      drawCtx.stroke();
      drawCtx.beginPath();
      drawCtx.arc(width * 0.53, height * 0.79, width * 0.095, Math.PI * 0.2, Math.PI * 1.53, false);
      drawCtx.stroke();
      drawCtx.beginPath();
      drawCtx.arc(width * 0.48, height * 0.85, width * 0.067, Math.PI * 0.24, Math.PI * 1.58, false);
      drawCtx.stroke();

      const vortexGlow = drawCtx.createRadialGradient(width * 0.5, height * 0.76, 2, width * 0.5, height * 0.76, width * 0.16);
      vortexGlow.addColorStop(0, "rgba(255, 211, 130, 0.48)");
      vortexGlow.addColorStop(1, "rgba(255, 97, 35, 0)");
      drawCtx.fillStyle = vortexGlow;
      drawCtx.beginPath();
      drawCtx.ellipse(width * 0.5, height * 0.76, width * 0.15, height * 0.16, 0, 0, Math.PI * 2);
      drawCtx.fill();
    }

    if (look.weapon === "battleaxe") {
      drawCtx.strokeStyle = "#3d2a24";
      drawCtx.lineWidth = Math.max(2, width * 0.02);
      drawCtx.beginPath();
      drawCtx.moveTo(width * 0.57, height * 0.38);
      drawCtx.lineTo(width * 0.76, height * 0.77);
      drawCtx.stroke();

      drawCtx.fillStyle = "#2b2f33";
      drawCtx.beginPath();
      drawCtx.moveTo(width * 0.55, height * 0.34);
      drawCtx.lineTo(width * 0.67, height * 0.29);
      drawCtx.lineTo(width * 0.7, height * 0.39);
      drawCtx.lineTo(width * 0.59, height * 0.44);
      drawCtx.closePath();
      drawCtx.fill();

      drawCtx.fillStyle = "rgba(26, 30, 36, 0.8)";
      drawCtx.fillRect(width * 0.42, height * 0.34, width * 0.16, height * 0.18);
    } else if (look.weapon === "fireball") {
      const fireball = drawCtx.createRadialGradient(
        width * 0.67,
        height * 0.52,
        2,
        width * 0.67,
        height * 0.52,
        width * 0.065
      );
      fireball.addColorStop(0, "rgba(255, 226, 150, 0.98)");
      fireball.addColorStop(0.5, look.fire);
      fireball.addColorStop(1, "rgba(255, 95, 36, 0)");
      drawCtx.fillStyle = fireball;
      drawCtx.beginPath();
      drawCtx.arc(width * 0.67, height * 0.52, width * 0.065, 0, Math.PI * 2);
      drawCtx.fill();
    } else if (look.weapon === "djinni-fire") {
      drawCtx.strokeStyle = look.fire;
      drawCtx.lineWidth = Math.max(2, width * 0.016);
      drawCtx.beginPath();
      drawCtx.moveTo(width * 0.62, height * 0.39);
      drawCtx.bezierCurveTo(width * 0.75, height * 0.31, width * 0.8, height * 0.63, width * 0.6, height * 0.69);
      drawCtx.stroke();
      drawCtx.beginPath();
      drawCtx.moveTo(width * 0.36, height * 0.58);
      drawCtx.bezierCurveTo(width * 0.27, height * 0.7, width * 0.52, height * 0.89, width * 0.63, height * 0.74);
      drawCtx.stroke();
    } else if (look.weapon === "claws" || look.weapon === "flight") {
      drawCtx.strokeStyle = "#d8c6a2";
      drawCtx.lineWidth = Math.max(1.8, width * 0.012);
      drawCtx.beginPath();
      drawCtx.moveTo(width * (isSmallDemon ? 0.55 : 0.59), height * 0.43);
      drawCtx.lineTo(width * (isSmallDemon ? 0.61 : 0.67), height * 0.48);
      drawCtx.moveTo(width * (isSmallDemon ? 0.54 : 0.58), height * 0.46);
      drawCtx.lineTo(width * (isSmallDemon ? 0.6 : 0.66), height * 0.52);
      drawCtx.stroke();
    }
  }

  const ember = drawCtx.createRadialGradient(width * 0.32, height * 0.47, 1, width * 0.32, height * 0.47, width * 0.11);
  ember.addColorStop(0, "rgba(255, 214, 141, 0.76)");
  ember.addColorStop(1, "rgba(255, 110, 46, 0)");
  drawCtx.fillStyle = ember;
  drawCtx.beginPath();
  drawCtx.ellipse(width * 0.32, height * 0.47, width * 0.1, height * 0.12, 0, 0, Math.PI * 2);
  drawCtx.fill();

  drawCtx.fillStyle = shadeTint;
  drawCtx.fillRect(0, 0, width, height);
}

function getCentaurCombatSpriteCanvas(unit, side) {
  const look = getCentaurCombatLook(unit);
  const key = `${unit.archetypeId || "recon"}:${side}`;
  if (centaurCombatSpriteCache.has(key)) {
    return centaurCombatSpriteCache.get(key);
  }

  const spriteCanvas = createArtCanvas(CENTAUR_COMBAT_SPRITE_NATIVE_WIDTH, CENTAUR_COMBAT_SPRITE_NATIVE_HEIGHT);
  const drawCtx = spriteCanvas.getContext("2d");
  drawCentaurCombatSprite(drawCtx, look, side, spriteCanvas.width, spriteCanvas.height);
  centaurCombatSpriteCache.set(key, spriteCanvas);
  return spriteCanvas;
}

function getDemonCombatSpriteCanvas(unit, side) {
  const look = getDemonCombatLook(unit);
  const key = `${unit.archetypeId || "imp"}:${side}`;
  if (demonCombatSpriteCache.has(key)) {
    return demonCombatSpriteCache.get(key);
  }

  const spriteCanvas = createArtCanvas(DEMON_COMBAT_SPRITE_NATIVE_WIDTH, DEMON_COMBAT_SPRITE_NATIVE_HEIGHT);
  const drawCtx = spriteCanvas.getContext("2d");
  drawDemonCombatSprite(drawCtx, look, side, spriteCanvas.width, spriteCanvas.height);
  demonCombatSpriteCache.set(key, spriteCanvas);
  return spriteCanvas;
}

function getCombatSpriteCanvas(side, unit) {
  const raceId = unit?.unitRaceId || state.stacks[side]?.raceId;
  if (raceId === "centaur-clans") {
    return getCentaurCombatSpriteCanvas(unit, side);
  }
  if (raceId === "demon-horde") {
    return getDemonCombatSpriteCanvas(unit, side);
  }
  return null;
}

function drawCombatRing(cx, cy, stroke, width = 2, radius = COMBAT_TILE_SIZE * 0.28) {
  drawCombatRingStyled(cx, cy, { stroke, width, radius, dash: [] });
}

function drawCombatRingStyled(cx, cy, { stroke, width = 2, radius = COMBAT_TILE_SIZE * 0.28, dash = [] }) {
  ctx.save();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = width;
  ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function getRaceArtCanvas(race, variant) {
  const size = variant === "map"
    ? { width: MAP_ART_SIZE, height: MAP_ART_SIZE }
    : { width: RACE_PREVIEW_WIDTH, height: RACE_PREVIEW_HEIGHT };
  const cacheKey = `${race.id}:${variant}:${size.width}x${size.height}`;
  if (raceArtCache.has(cacheKey)) {
    return raceArtCache.get(cacheKey);
  }

  const artCanvas = createArtCanvas(size.width, size.height);
  const artCtx = artCanvas.getContext("2d");
  if (race.artKey === "centaur-archer") {
    if (variant === "map") {
      drawCentaurTokenArt(artCtx, size.width);
    } else {
      drawCentaurArcherArt(artCtx, size.width, size.height);
    }
  } else if (race.artKey === "demon-horde") {
    if (variant === "map") {
      drawDemonTokenArt(artCtx, size.width);
    } else {
      drawDemonHordeArt(artCtx, size.width, size.height);
    }
  } else {
    drawGenericRaceArt(artCtx, size.width, size.height, race);
  }
  raceArtCache.set(cacheKey, artCanvas);
  return artCanvas;
}

function drawRacePreview(previewCanvas, raceChoiceId) {
  if (!previewCanvas) return;
  const previewCtx = previewCanvas.getContext("2d");
  previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

  if (raceChoiceId === RANDOM_RACE_ID) {
    drawRandomRaceArt(previewCtx, previewCanvas.width, previewCanvas.height);
    return;
  }

  const race = getRaceById(raceChoiceId);
  const art = getRaceArtCanvas(race, "setup");
  previewCtx.drawImage(art, 0, 0, previewCanvas.width, previewCanvas.height);
}

function updateSetupRacePreviews() {
  drawRacePreview(playerRacePreviewEl, playerRaceSelectEl.value || RANDOM_RACE_ID);
  drawRacePreview(enemyRacePreviewEl, enemyRaceSelectEl.value || RANDOM_RACE_ID);
}

function toSubscript(n) {
  return String(n)
    .split("")
    .map((digit) => SUBSCRIPT_DIGITS[digit] || digit)
    .join("");
}

function getHitChance(attacker, defender, attackValue = attacker.attack) {
  const modified = BASE_HIT_CHANCE + (attackValue - defender.evasiveness) * 2;
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
  return `HP ${unit.hp}/${unit.maxHp} ARM ${unit.armor}/${unit.maxArmor} ATK ${unit.attack} DMG ${unit.damage} EVA ${unit.evasiveness} MOV ${moveText}`;
}

function hasAbility(unit, abilityId) {
  return Array.isArray(unit.abilities) && unit.abilities.includes(abilityId);
}

function getUnitAbilities(unit) {
  const entries = [];

  if (hasAbility(unit, "archery")) {
    const profile = getArcheryProfile(unit);
    entries.push(`Active: Archery (RNG ${profile.range}, ATK ${profile.attack}, DMG ${profile.damage})`);
  }

  if (hasAbility(unit, "marksmanship")) {
    entries.push("Passive: Marksmanship (+1 Archery RNG, +2 Archery ATK, +2 Archery DMG)");
  }

  return entries;
}

function formatUnitAbilitiesHtml(unit) {
  const entries = getUnitAbilities(unit);
  if (entries.length === 0) {
    return "";
  }
  return `<div>Abilities: ${entries.join(" | ")}</div>`;
}

function formatUnitIdentity(unit) {
  if (!unit.unitClass) {
    return unitName(unit);
  }
  return `${unitName(unit)} ${unit.unitClass}`;
}

function formatUnitLoadout(unit) {
  return unit.loadout ? `<div>${unit.loadout}</div>` : "";
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

function getMeleeProfile(attacker) {
  return {
    id: "melee",
    label: "melee",
    attack: attacker.attack,
    damage: attacker.damage,
    range: 1,
    targeting: "adjacent",
    priority: 0
  };
}

function getArcheryProfile(attacker) {
  if (!hasAbility(attacker, "archery")) {
    return null;
  }

  const marksmanshipBonus = hasAbility(attacker, "marksmanship") ? 2 : 0;
  const rangeBonus = hasAbility(attacker, "marksmanship") ? 1 : 0;

  return {
    id: "archery",
    label: "shot",
    attack: Math.max(1, attacker.attack - 2 + marksmanshipBonus),
    damage: Math.max(1, attacker.damage - 2 + marksmanshipBonus),
    range: 2 + rangeBonus,
    targeting: "orthogonal-line",
    priority: 1
  };
}

function isClearOrthogonalShot(attacker, defender) {
  if (attacker.x !== defender.x && attacker.y !== defender.y) {
    return false;
  }

  const dx = Math.sign(defender.x - attacker.x);
  const dy = Math.sign(defender.y - attacker.y);
  let x = attacker.x + dx;
  let y = attacker.y + dy;

  while (x !== defender.x || y !== defender.y) {
    if (getCombatUnitAt(x, y)) {
      return false;
    }
    x += dx;
    y += dy;
  }

  return true;
}

function getRangedTargets(attacker, defenderSide) {
  if (adjacentTargets(attacker, defenderSide).length > 0) {
    return [];
  }

  const archery = getArcheryProfile(attacker);
  if (!archery) {
    return [];
  }

  return getAliveUnits(defenderSide).filter((unit) => {
    const distance = manhattan(attacker, unit);
    if (distance <= 1 || distance > archery.range) {
      return false;
    }
    return isClearOrthogonalShot(attacker, unit);
  });
}

function getAvailableAttackProfiles(attacker, defenderSide) {
  const profiles = [getMeleeProfile(attacker)];

  if (getArcheryProfile(attacker) && adjacentTargets(attacker, defenderSide).length === 0) {
    profiles.push(getArcheryProfile(attacker));
  }

  return profiles.sort((a, b) => a.priority - b.priority);
}

function getTargetsForProfile(attacker, defenderSide, profile) {
  if (profile.targeting === "adjacent") {
    return adjacentTargets(attacker, defenderSide);
  }

  if (profile.targeting === "orthogonal-line") {
    return getRangedTargets(attacker, defenderSide);
  }

  return [];
}

function getAttackCandidates(attacker, defenderSide) {
  const candidates = [];

  for (const profile of getAvailableAttackProfiles(attacker, defenderSide)) {
    for (const unit of getTargetsForProfile(attacker, defenderSide, profile)) {
      candidates.push({
        unit,
        profile,
        distance: manhattan(attacker, unit)
      });
    }
  }

  candidates.sort((a, b) => a.profile.priority - b.profile.priority || a.distance - b.distance || a.unit.id.localeCompare(b.unit.id));
  return candidates;
}

function getAttackIndicatorStyle(profile) {
  if (profile.id === "archery") {
    return {
      color: "#6fd3ff",
      radiusScale: 0.34,
      dash: [5, 3]
    };
  }

  return {
    color: "#ffd34d",
    radiusScale: 0.32,
    dash: []
  };
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

function resolveAttack(attackerSide, attacker, defenderSide, defender, profile = getMeleeProfile(attacker)) {
  const hitChance = getHitChance(attacker, defender, profile.attack);
  const hitRoll = randomInt(1, 100);
  const hit = hitRoll <= hitChance;

  if (!hit) {
    return {
      attackerSide,
      defenderSide,
      attackType: profile.id,
      attackLabel: profile.label,
      hitChance,
      hitRoll,
      hit: false,
      rawDamage: 0,
      armorAbsorbed: 0,
      hpDamage: 0,
      eliminated: null
    };
  }

  const rawDamage = rollBiasedDamage(profile.damage);
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
    attackType: profile.id,
    attackLabel: profile.label,
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
    getAttackCandidates(active, "enemy").length > 0;

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

function performPlayerAttack(attacker, defender, profile) {
  const result = resolveAttack("player", attacker, "enemy", defender, profile);
  attacker.currentCombatMp = 0;
  clearTargetingMode();

  const logPrefix = `${unitName(attacker)} ${result.attackLabel} -> ${unitName(defender)}`;
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

  const candidates = getAttackCandidates(attacker, "enemy").filter((candidate) => {
    const dxToTarget = Math.sign(candidate.unit.x - attacker.x);
    const dyToTarget = Math.sign(candidate.unit.y - attacker.y);
    return dxToTarget === delta.dx && dyToTarget === delta.dy;
  });
  const target = candidates[0];

  if (!target) {
    statusEl.textContent = `Combat View: No enemy in that direction from ${unitName(attacker)}. Choose another direction or press Space to cancel targeting.`;
    updateControls();
    draw();
    return true;
  }

  performPlayerAttack(attacker, target.unit, target.profile);
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

  const targets = getAttackCandidates(active, "enemy");
  if (targets.length === 0) {
    statusEl.textContent = "Combat View: No valid melee or archery target in range.";
    updateControls();
    return;
  }

  if (targets.length === 1) {
    performPlayerAttack(active, targets[0].unit, targets[0].profile);
    return;
  }

  state.combat.targeting = true;
  statusEl.textContent = `Combat View: ${unitName(active)} has multiple attack targets. Press arrow key toward target to attack.`;
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
      const targets = getAttackCandidates(unit, "player");
      if (targets.length > 0) {
        const { unit: defender, profile } = targets[0];
        const result = resolveAttack("enemy", unit, "player", defender, profile);
        unit.currentCombatMp = 0;
        const logPrefix = `${unitName(unit)} ${result.attackLabel} -> ${unitName(defender)}`;
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
  const race = getRaceById(stack.raceId);
  const radius = TILE_SIZE * 0.33;

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.save();
  ctx.clip();

  if (race?.artKey) {
    const art = getRaceArtCanvas(race, "map");
    ctx.drawImage(art, cx - radius, cy - radius, radius * 2, radius * 2);
  } else {
    const fillGradient = ctx.createLinearGradient(cx, cy - radius, cx, cy + radius);
    fillGradient.addColorStop(0, stack.color);
    fillGradient.addColorStop(1, "#1d2620");
    ctx.fillStyle = fillGradient;
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
  }
  ctx.restore();

  ctx.strokeStyle = "rgba(15, 16, 12, 0.85)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  if (hoveredEntity?.type === "mapStack" && hoveredEntity.side === side) {
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 1;
  }

  const badgeText = race?.artKey ? toSubscript(count) : `${stack.token}${toSubscript(count)}`;
  ctx.fillStyle = "rgba(15, 16, 12, 0.82)";
  ctx.fillRect(cx - radius + 5, cy + radius - 22, 34, 18);
  ctx.fillStyle = "#f6f2e0";
  ctx.font = `bold ${race?.artKey ? 15 : 13}px Georgia, serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(badgeText, cx - radius + 22, cy + radius - 13);
  ctx.textBaseline = "alphabetic";
}

function drawCombatUnits() {
  const active = getActivePlayerUnit();
  const targetableIndicators = new Map();
  if (state.combat?.targeting && active) {
    for (const candidate of getAttackCandidates(active, "enemy")) {
      if (!targetableIndicators.has(candidate.unit.id)) {
        targetableIndicators.set(candidate.unit.id, getAttackIndicatorStyle(candidate.profile));
      }
    }
  }

  const drawSide = (side, color) => {
    for (const unit of getAliveUnits(side)) {
      const cx = unit.x * COMBAT_TILE_SIZE + COMBAT_TILE_SIZE / 2;
      const cy = unit.y * COMBAT_TILE_SIZE + COMBAT_TILE_SIZE / 2;
      const sprite = getCombatSpriteCanvas(side, unit);
      const hasSprite = Boolean(sprite);

      if (hasSprite) {
        const drawW = COMBAT_TILE_SIZE * 0.86;
        const drawH = COMBAT_TILE_SIZE * 0.72;
        const drawX = cx - drawW * 0.5;
        const drawY = cy - drawH * 0.67;
        ctx.drawImage(sprite, drawX, drawY, drawW, drawH);

        const plateY = cy + COMBAT_TILE_SIZE * 0.18;
        ctx.fillStyle = "rgba(11, 14, 18, 0.76)";
        ctx.fillRect(cx - 23, plateY, 46, 14);
        ctx.fillStyle = "#efe5c7";
        ctx.font = "bold 10px Georgia, serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(unit.label || unit.id, cx, plateY + 7);
        ctx.textBaseline = "alphabetic";
      } else {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(cx, cy, COMBAT_TILE_SIZE * 0.24, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(unit.label || unit.id, cx, cy + 4);
      }

      if (active && side === "player" && unit.id === active.id) {
        drawCombatRing(cx, cy, "#ffffff", 3, COMBAT_TILE_SIZE * (hasSprite ? 0.3 : 0.24));
      }

      if (hoveredEntity?.type === "combatUnit" && hoveredEntity.unitId === unit.id) {
        drawCombatRing(cx, cy, "#6fd3ff", 3, COMBAT_TILE_SIZE * (hasSprite ? 0.31 : 0.25));
      }

      if (side === "enemy" && targetableIndicators.has(unit.id)) {
        const indicator = targetableIndicators.get(unit.id);
        drawCombatRingStyled(cx, cy, {
          stroke: indicator.color,
          width: 3,
          radius: COMBAT_TILE_SIZE * (hasSprite ? indicator.radiusScale : 0.25),
          dash: indicator.dash
        });
      }
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
    .map((unit) => `<div>${formatUnitIdentity(unit)} | ${formatUnitStatLine(unit, false)}</div>${formatUnitLoadout(unit)}${formatUnitAbilitiesHtml(unit)}`)
    .join("");
  return `<strong>${stack.race} Stack (${units.length} units)</strong>${lines}`;
}

function buildCombatUnitTooltipHtml(side, unit) {
  const active = side === "enemy" ? getActivePlayerUnit() : null;
  let hitChanceText = "";
  if (state.mode === "combat" && active && side === "enemy") {
    const profiles = getAttackCandidates(active, "enemy")
      .filter((candidate) => candidate.unit.id === unit.id)
      .map((candidate) => candidate.profile);
    const seen = new Set();
    const lines = [];
    for (const profile of profiles) {
      if (seen.has(profile.id)) continue;
      seen.add(profile.id);
      const attackName = profile.id === "melee" ? "melee" : profile.label;
      lines.push(`<div>Chance for ${unitName(active)} to hit with ${attackName}: ${getHitChance(active, unit, profile.attack)}%</div>`);
    }
    hitChanceText = lines.join("");
  }
  return `<strong>${state.stacks[side].race} ${formatUnitIdentity(unit)}</strong><div>${formatUnitStatLine(unit, true)}</div>${formatUnitLoadout(unit)}${formatUnitAbilitiesHtml(unit)}${hitChanceText}`;
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
    ? getAttackCandidates(active, "enemy").map((candidate) => ({
        id: candidate.unit.id,
        x: candidate.unit.x,
        y: candidate.unit.y,
        attackType: candidate.profile.id,
        range: candidate.profile.range
      }))
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
          unitRaceId: unit.unitRaceId || state.stacks.player.raceId,
          archetypeId: unit.archetypeId || null,
          unitClass: unit.unitClass || null,
          loadout: unit.loadout || null,
          abilities: [...(unit.abilities || [])],
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
          unitRaceId: unit.unitRaceId || state.stacks.enemy.raceId,
          archetypeId: unit.archetypeId || null,
          unitClass: unit.unitClass || null,
          loadout: unit.loadout || null,
          abilities: [...(unit.abilities || [])],
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
            unitRaceId: unit.unitRaceId || state.stacks[side].raceId,
            archetypeId: unit.archetypeId || null,
            unitClass: unit.unitClass || null,
            loadout: unit.loadout || null,
            abilities: [...(unit.abilities || [])],
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
  updateSetupRacePreviews();
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
playerRaceSelectEl.addEventListener("change", updateSetupRacePreviews);
enemyRaceSelectEl.addEventListener("change", updateSetupRacePreviews);
startGameBtnEl.addEventListener("click", startGameFromSetup);
board.addEventListener("mousemove", updateHoveredEntity);
board.addEventListener("mouseleave", clearHoveredEntity);

initializeSetupScreen();
setGamePanelsVisible(false);
draw();
