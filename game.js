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
const BASE_STACK_CAPACITY = 8;
const FIRE_STRIKE_ATTACK = 10;
const FIRE_STRIKE_BASE_DURATION = 3;
const FIRE_STRIKE_BASE_TICK = 2;
const FIREBALL_ATTACK = 10;
const FIREBALL_DAMAGE = 8;
const FIREBALL_RANGE = 2;
const FLAMMABLE_DAMAGE_BONUS = 2;
const FLAMMABLE_DURATION = 3;
const FLAMMABLE_BURST_ATTACK = 10;
const FLAMMABLE_BURST_DAMAGE = 8;
const RACE_PREVIEW_WIDTH = 300;
const RACE_PREVIEW_HEIGHT = 170;
const MAP_ART_SIZE = 64;
const CENTAUR_COMBAT_SPRITE_NATIVE_WIDTH = 140;
const CENTAUR_COMBAT_SPRITE_NATIVE_HEIGHT = 110;
const CENTAUR_COMBAT_SPRITE_BOTTOM_TRIM = 10;
const DEMON_COMBAT_SPRITE_NATIVE_WIDTH = 140;
const DEMON_COMBAT_SPRITE_NATIVE_HEIGHT = 110;
const CENTAUR_BANNER_ASSET = "img/races/centaur-banner.png";
const DEMON_BANNER_ASSET = "img/races/demon-banner.png";

const MAP_TERRAIN_RULES = {
  plains: { label: "Plains", cost: 1, passable: true, color: "#d8e2c5" },
  forest: { label: "Forest", cost: 2, passable: true, color: "#9fbe8a" },
  hill: { label: "Hill", cost: 2, passable: true, color: "#c7b07a" },
  water: { label: "Water", cost: Infinity, passable: false, color: "#78a6d6" }
};

const COMBAT_TERRAIN_RULES = {
  open: { label: "Open", cost: 1, passable: true, color: "#e6dbbf" },
  rough: { label: "Rough", cost: 2, passable: true, color: "#c6b487" },
  forest: { label: "Forest", cost: 2, passable: true, color: "#8daa74" },
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
    abilities: ["archery", "forestry"]
  },
  {
    id: "brute",
    name: "Brute",
    loadout: "Plate Armor + Two-Handed Axe",
    coatColor: "#694f39",
    stats: { hp: 28, attack: 15, damage: 16, armor: 17, evasiveness: 5, combatMp: 2 },
    abilities: ["charge", "forestry"]
  },
  {
    id: "marksman",
    name: "Marksman",
    loadout: "Longbow + Short Sword + Leather Armor",
    coatColor: "#765b3f",
    stats: { hp: 21, attack: 14, damage: 11, armor: 7, evasiveness: 12, combatMp: 3 },
    abilities: ["archery", "marksmanship", "forestry"]
  },
  {
    id: "captain",
    name: "Captain",
    loadout: "Long Axe + Medium Armor",
    coatColor: "#d8d4cb",
    stats: { hp: 25, attack: 16, damage: 13, armor: 11, evasiveness: 9, combatMp: 3 },
    abilities: ["charge", "leadership", "call-of-bravery", "forestry"]
  }
];

const DEMON_UNIT_ARCHETYPES = [
  {
    id: "imp",
    name: "Imp",
    loadout: "Hooves + Wings + Horns",
    coatColor: "#7c5742",
    stats: { hp: 16, attack: 10, damage: 6, armor: 2, evasiveness: 12, combatMp: 3 },
    abilities: ["fire-protection", "flammable"]
  },
  {
    id: "gog",
    name: "Gog",
    loadout: "Firebody + Fireball Throw",
    coatColor: "#b4472e",
    stats: { hp: 20, attack: 13, damage: 11, armor: 5, evasiveness: 11, combatMp: 3 },
    abilities: ["fire-strike", "fire-protection", "fireball"]
  },
  {
    id: "hell-hound",
    name: "Hell Hound",
    loadout: "Cerberus-like Demon Dog",
    coatColor: "#59352a",
    stats: { hp: 24, attack: 15, damage: 13, armor: 6, evasiveness: 10, combatMp: 4 },
    abilities: ["charge", "fire-strike", "fire-protection", "fire-immunity", "basking"]
  },
  {
    id: "succubus",
    name: "Succubus",
    loadout: "Winged Demon",
    coatColor: "#8f4b59",
    stats: { hp: 19, attack: 14, damage: 10, armor: 4, evasiveness: 15, combatMp: 3 },
    abilities: ["fire-strike", "fire-protection", "flying"]
  },
  {
    id: "incubus",
    name: "Efreet",
    loadout: "Fire Djinni Demon",
    coatColor: "#9a5137",
    stats: { hp: 23, attack: 16, damage: 14, armor: 8, evasiveness: 11, combatMp: 3 },
    abilities: ["fire-strike", "fire-immunity", "basking"]
  },
  {
    id: "arch-fiend",
    name: "Arch Fiend",
    loadout: "Battle Axe + Claws + Black Plate",
    coatColor: "#aa2f23",
    stats: { hp: 29, attack: 18, damage: 17, armor: 16, evasiveness: 7, combatMp: 2 },
    abilities: ["fire-strike", "fire-protection", "fire-immunity", "basking"]
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

const CENTAUR_COMBAT_SPRITE_ASSETS = {
  recon: "img/units/centaurs/recon.png",
  brute: "img/units/centaurs/brute.png",
  marksman: "img/units/centaurs/marksman.png",
  captain: "img/units/centaurs/captain.png"
};

const CENTAUR_SOURCE_ART_ASSETS = {
  recon: "img/units/centaurs/recon-source.png",
  brute: "img/units/centaurs/brute-source.png",
  marksman: "img/units/centaurs/marksman-source.png",
  captain: "img/units/centaurs/captain-source.png"
};

const DEMON_COMBAT_SPRITE_ASSETS = {
  imp: "img/units/demons/imp.png",
  gog: "img/units/demons/gog.png",
  "hell-hound": "img/units/demons/hell-hound.png",
  succubus: "img/units/demons/succubus.png",
  incubus: "img/units/demons/incubus.png",
  "arch-fiend": "img/units/demons/arch-fiend.png"
};

const DEMON_SOURCE_ART_ASSETS = {
  imp: "img/units/demons/imp-source.png",
  gog: "img/units/demons/gog-source.png",
  "hell-hound": "img/units/demons/hell-hound-source.png",
  succubus: "img/units/demons/succubus-source.png",
  incubus: "img/units/demons/incubus-source.png",
  "arch-fiend": "img/units/demons/arch-fiend-source.png"
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

const appRootEl = document.getElementById("appRoot");
const board = document.getElementById("board");
const ctx = board.getContext("2d");
const setupScreenEl = document.getElementById("setupScreen");
const battleHeaderEl = document.getElementById("battleHeader");
const battleTitleEl = document.getElementById("battleTitle");
const battleTurnSummaryEl = document.getElementById("battleTurnSummary");
const playerRaceSelectEl = document.getElementById("playerRaceSelect");
const enemyRaceSelectEl = document.getElementById("enemyRaceSelect");
const playerRacePreviewEl = document.getElementById("playerRacePreview");
const enemyRacePreviewEl = document.getElementById("enemyRacePreview");
const startGameBtnEl = document.getElementById("startGameBtn");
const hudPanelEl = document.getElementById("hudPanel");
const mapHudEl = document.getElementById("mapHud");
const battleHudEl = document.getElementById("battleHud");
const boardWrapEl = document.getElementById("boardWrap");
const battleStatusBannerEl = document.getElementById("battleStatusBanner");
const unitTooltipEl = document.getElementById("unitTooltip");
const unitInspectorEl = document.getElementById("unitInspector");
const combatLogEl = document.getElementById("combatLog");
const combatLogPaneEl = document.getElementById("combatLogPane");
const battleArmyStripEl = document.getElementById("battleArmyStrip");
const battleFeedTabsEl = document.getElementById("battleFeedTabs");
const enemyTurnPaneEl = document.getElementById("enemyTurnPane");
const enemyTurnSummaryEl = document.getElementById("enemyTurnSummary");
const statusEl = document.getElementById("status");
const modeLabelEl = document.getElementById("modeLabel");
const mapMpLabelEl = document.getElementById("mapMpLabel");
const combatMpLabelEl = document.getElementById("combatMpLabel");
const raceALabelEl = document.getElementById("raceALabel");
const raceBLabelEl = document.getElementById("raceBLabel");
const mapEndTurnBtn = document.getElementById("mapEndTurnBtn");
const mapResetBtn = document.getElementById("mapResetBtn");
const attackBtn = document.getElementById("attackBtn");
const archeryBtn = document.getElementById("archeryBtn");
const braveryBtn = document.getElementById("braveryBtn");
const fireballBtn = document.getElementById("fireballBtn");
const endTurnBtn = document.getElementById("endTurnBtn");
const resetBtn = document.getElementById("resetBtn");
const battleFeedTabButtons = Array.from(document.querySelectorAll(".battle-feed-tab"));

let timelineToken = 0;
const pendingActions = [];
let gameStarted = false;
let selectedRaces = {
  player: RANDOM_RACE_ID,
  enemy: RANDOM_RACE_ID
};
let hoveredEntity = null;
let hoverClientX = null;
let hoverClientY = null;
let activeBattleFeedTab = "enemy";
const raceArtCache = new Map();
const centaurCombatSpriteCache = new Map();
const demonCombatSpriteCache = new Map();
const centaurCombatImageCache = new Map();
const demonCombatImageCache = new Map();
const raceBannerImageCache = new Map();
const missingCentaurCombatSpriteWarnings = new Set();
const missingDemonCombatSpriteWarnings = new Set();

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
  appRootEl?.classList.toggle("app--started", visible);
  setupScreenEl.classList.toggle("hidden", visible);
}

function updateRaceLabels() {
  raceALabelEl.textContent = state.stacks.player.race;
  raceBLabelEl.textContent = state.stacks.enemy.race;
}

function setBattleFeedTab(tab) {
  activeBattleFeedTab = tab === "log" ? "log" : "enemy";
  for (const button of battleFeedTabButtons) {
    const isActive = button.dataset.feedTab === activeBattleFeedTab;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  }
  if (enemyTurnPaneEl) {
    const active = activeBattleFeedTab === "enemy";
    enemyTurnPaneEl.classList.toggle("is-active", active);
    enemyTurnPaneEl.hidden = !active;
  }
  if (combatLogPaneEl) {
    const active = activeBattleFeedTab === "log";
    combatLogPaneEl.classList.toggle("is-active", active);
    combatLogPaneEl.hidden = !active;
  }
}

function getBattleStatusText() {
  return statusEl?.textContent || "";
}

function updateBattleShell() {
  const inCombat = state.mode === "combat";
  appRootEl?.classList.toggle("app--combat", inCombat);
  hudPanelEl?.classList.toggle("hud--combat", inCombat);

  if (mapHudEl) {
    mapHudEl.hidden = inCombat;
  }
  if (battleHudEl) {
    battleHudEl.hidden = !inCombat;
  }

  const active = getActivePlayerUnit();
  if (battleTitleEl) {
    battleTitleEl.textContent = `${state.stacks.player.race} vs ${state.stacks.enemy.race}`;
  }
  if (battleTurnSummaryEl) {
    if (!inCombat || !state.combat) {
      battleTurnSummaryEl.textContent = "Battle details will appear here when combat begins.";
    } else {
      const sideLabel = state.combatTurn === "player" ? "Player turn" : "Enemy turn";
      const activeLabel = active ? `${unitName(active)} ready` : "No active unit";
      const movementLabel = active ? `${active.currentCombatMp}/${active.maxCombatMp} MOV` : "0/0 MOV";
      battleTurnSummaryEl.textContent = `${sideLabel} · ${activeLabel} · ${movementLabel}`;
    }
  }
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
    statuses: [],
    usedAbilities: {},
    hp: maxHp,
    maxHp,
    attack: stats.attack,
    damage: stats.damage,
    armor,
    maxArmor: armor,
    evasiveness: stats.evasiveness,
    maxCombatMp: stats.combatMp,
    currentCombatMp: 0,
    combatMoveSpentThisTurn: 0,
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
    statuses: [],
    usedAbilities: {},
    hp: maxHp,
    maxHp,
    attack: stats.attack,
    damage: stats.damage,
    armor,
    maxArmor: armor,
    evasiveness: stats.evasiveness,
    maxCombatMp: stats.combatMp,
    currentCombatMp: 0,
    combatMoveSpentThisTurn: 0,
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
    statuses: [],
    usedAbilities: {},
    hp: maxHp,
    maxHp,
    attack: randomInt(1, 20),
    damage: randomInt(1, 20),
    armor,
    maxArmor: armor,
    evasiveness: randomInt(1, 20),
    maxCombatMp: randomInt(1, 3),
    currentCombatMp: 0,
    combatMoveSpentThisTurn: 0,
    x: null,
    y: null
  };
}

function createStack(side, race, x, y) {
  const units = [];
  let cap = BASE_STACK_CAPACITY;
  const minimumCount = randomInt(1, BASE_STACK_CAPACITY);

  const makeUnit = (index) => {
    if (race.id === "centaur-clans") {
      return createCentaurUnit(side, race, index);
    }
    if (race.id === "demon-horde") {
      return createDemonUnit(side, race, index);
    }
    return createDefaultUnit(side, race, index);
  };

  while (units.length < cap && (units.length < minimumCount || units.length < getStackCapacity(units))) {
    const unit = makeUnit(units.length);
    units.push(unit);
    cap = getStackCapacity(units);
  }

  return {
    race: race.name,
    raceId: race.id,
    token: race.token,
    color: race.color,
    x,
    y,
    baseCapacity: BASE_STACK_CAPACITY,
    capacity: getStackCapacity(units),
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
        tile = "forest";
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

function drawImageCover(ctx, image, dx, dy, dw, dh) {
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  if (!sourceWidth || !sourceHeight) return;

  const sourceAspect = sourceWidth / sourceHeight;
  const destAspect = dw / dh;
  let sx = 0;
  let sy = 0;
  let sw = sourceWidth;
  let sh = sourceHeight;

  if (sourceAspect > destAspect) {
    sw = sourceHeight * destAspect;
    sx = (sourceWidth - sw) / 2;
  } else {
    sh = sourceWidth / destAspect;
    sy = (sourceHeight - sh) / 2;
  }

  ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
}

function invalidateRaceArtCacheForRace(raceId) {
  for (const key of [...raceArtCache.keys()]) {
    if (key.startsWith(`${raceId}:`)) {
      raceArtCache.delete(key);
    }
  }
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

function loadRaceBannerImage(raceId) {
  const src = raceId === "centaur-clans"
    ? CENTAUR_BANNER_ASSET
    : raceId === "demon-horde"
      ? DEMON_BANNER_ASSET
      : null;
  if (!src) {
    return null;
  }

  const existing = raceBannerImageCache.get(raceId);
  if (existing) {
    return existing;
  }

  const img = new Image();
  img.decoding = "async";
  img.onload = () => {
    invalidateRaceArtCacheForRace(raceId);
    updateSetupRacePreviews();
    if (gameStarted) {
      draw();
    }
  };
  img.onerror = () => {
    raceBannerImageCache.set(raceId, null);
  };
  img.src = src;
  raceBannerImageCache.set(raceId, img);
  return img;
}

function drawCentaurBannerArt(ctx, width, height, raceId = "centaur-clans") {
  const banner = loadRaceBannerImage(raceId);
  if (banner?.complete && banner.naturalWidth > 0) {
    drawImageCover(ctx, banner, 0, 0, width, height);
    drawFrameBorder(ctx, width, height);
    return;
  }

  drawCentaurArcherArt(ctx, width, height);
}

function drawDemonBannerArt(ctx, width, height, raceId = "demon-horde") {
  const banner = loadRaceBannerImage(raceId);
  if (banner?.complete && banner.naturalWidth > 0) {
    drawImageCover(ctx, banner, 0, 0, width, height);
    drawFrameBorder(ctx, width, height);
    return;
  }

  drawDemonHordeArt(ctx, width, height);
}

function getStrongestStackUnit(side) {
  const units = getAliveUnits(side);
  if (!units.length) return null;
  const score = (unit) =>
    unit.hp + unit.armor + unit.attack * 2 + unit.damage * 2 + unit.evasiveness + unit.maxCombatMp;
  return units.reduce((best, unit) => (score(unit) > score(best) ? unit : best), units[0]);
}

function drawCentaurTokenArt(ctx, size, unit, side) {
  const sky = ctx.createLinearGradient(0, 0, 0, size);
  sky.addColorStop(0, "#8ba2ab");
  sky.addColorStop(1, "#4d5f45");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = "#6c7a52";
  ctx.fillRect(0, size * 0.62, size, size * 0.38);

  const sprite = unit ? getCentaurCombatSpriteCanvas(unit, side) : null;
  if (sprite) {
    const drawW = size * 0.92;
    const drawH = size * 0.84;
    const drawX = (size - drawW) / 2;
    const drawY = size * 0.08;
    ctx.drawImage(sprite, drawX, drawY, drawW, drawH);
    return;
  }

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

function drawDemonTokenArt(ctx, size, unit, side) {
  const sky = ctx.createLinearGradient(0, 0, 0, size);
  sky.addColorStop(0, "#6f1716");
  sky.addColorStop(1, "#2c0909");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = "#4b1712";
  ctx.fillRect(0, size * 0.62, size, size * 0.38);

  const sprite = unit ? getDemonCombatSpriteCanvas(unit, side) : null;
  if (sprite) {
    const drawW = size * 0.92;
    const drawH = size * 0.84;
    const drawX = (size - drawW) / 2;
    const drawY = size * 0.08;
    ctx.drawImage(sprite, drawX, drawY, drawW, drawH);
    return;
  }

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

function invalidateCentaurSpriteCaches() {
  centaurCombatSpriteCache.clear();
}

function warnMissingCentaurSprite(archetypeId, src) {
  const key = `${archetypeId}:${src}`;
  if (missingCentaurCombatSpriteWarnings.has(key)) {
    return;
  }
  missingCentaurCombatSpriteWarnings.add(key);
  console.warn(`Centaur sprite failed to load for ${archetypeId}; falling back to procedural art.`, src);
}

function loadCentaurCombatImage(archetypeId) {
  if (!archetypeId || !CENTAUR_COMBAT_SPRITE_ASSETS[archetypeId]) {
    return null;
  }

  const existing = centaurCombatImageCache.get(archetypeId);
  if (existing) {
    return existing;
  }

  const img = new Image();
  img.decoding = "async";
  img.onload = () => {
    invalidateCentaurSpriteCaches();
    if (gameStarted) {
      updateControls();
      draw();
    }
  };
  img.onerror = () => {
    warnMissingCentaurSprite(archetypeId, img.src);
    centaurCombatImageCache.set(archetypeId, null);
  };
  img.src = CENTAUR_COMBAT_SPRITE_ASSETS[archetypeId];
  centaurCombatImageCache.set(archetypeId, img);
  return img;
}

function warnMissingDemonSprite(archetypeId, src) {
  const key = `${archetypeId}:${src}`;
  if (missingDemonCombatSpriteWarnings.has(key)) {
    return;
  }
  missingDemonCombatSpriteWarnings.add(key);
  console.warn(`Demon sprite failed to load for ${archetypeId}; falling back to procedural art.`, src);
}

function loadDemonCombatImage(archetypeId) {
  if (!archetypeId || !DEMON_COMBAT_SPRITE_ASSETS[archetypeId]) {
    return null;
  }

  const existing = demonCombatImageCache.get(archetypeId);
  if (existing) {
    return existing;
  }

  const img = new Image();
  img.decoding = "async";
  img.onload = () => {
    demonCombatSpriteCache.clear();
    if (gameStarted) {
      updateControls();
      draw();
    }
  };
  img.onerror = () => {
    warnMissingDemonSprite(archetypeId, img.src);
    demonCombatImageCache.set(archetypeId, null);
  };
  img.src = DEMON_COMBAT_SPRITE_ASSETS[archetypeId];
  demonCombatImageCache.set(archetypeId, img);
  return img;
}

function buildCentaurImageSpriteCanvas(image, side) {
  const outputCanvas = createArtCanvas(CENTAUR_COMBAT_SPRITE_NATIVE_WIDTH, CENTAUR_COMBAT_SPRITE_NATIVE_HEIGHT);
  const outputCtx = outputCanvas.getContext("2d");
  const sourceHeight = Math.max(1, image.naturalHeight - CENTAUR_COMBAT_SPRITE_BOTTOM_TRIM);
  const drawWidth = outputCanvas.width;
  const drawHeight = outputCanvas.height;
  const drawX = 0;
  const drawY = 0;

  outputCtx.save();
  if (side === "enemy") {
    outputCtx.translate(outputCanvas.width, 0);
    outputCtx.scale(-1, 1);
  }
  outputCtx.drawImage(image, 0, 0, image.naturalWidth, sourceHeight, drawX, drawY, drawWidth, drawHeight);
  outputCtx.restore();

  return outputCanvas;
}

function buildDemonImageSpriteCanvas(image, side) {
  const outputCanvas = createArtCanvas(DEMON_COMBAT_SPRITE_NATIVE_WIDTH, DEMON_COMBAT_SPRITE_NATIVE_HEIGHT);
  const outputCtx = outputCanvas.getContext("2d");
  const drawWidth = outputCanvas.width;
  const drawHeight = outputCanvas.height;

  outputCtx.save();
  if (side === "enemy") {
    outputCtx.translate(outputCanvas.width, 0);
    outputCtx.scale(-1, 1);
  }
  outputCtx.drawImage(image, 0, 0, drawWidth, drawHeight);
  outputCtx.restore();

  return outputCanvas;
}

function getCentaurCombatSpriteCanvas(unit, side) {
  const look = getCentaurCombatLook(unit);
  const key = `${unit.archetypeId || "recon"}:${side}`;
  if (centaurCombatSpriteCache.has(key)) {
    return centaurCombatSpriteCache.get(key);
  }

  const spriteImage = loadCentaurCombatImage(unit.archetypeId || "recon");
  if (spriteImage?.complete && spriteImage.naturalWidth > 0) {
    const imageSpriteCanvas = buildCentaurImageSpriteCanvas(spriteImage, side);
    if (imageSpriteCanvas) {
      centaurCombatSpriteCache.set(key, imageSpriteCanvas);
      return imageSpriteCanvas;
    }
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

  const spriteImage = loadDemonCombatImage(unit.archetypeId || "imp");
  if (spriteImage?.complete && spriteImage.naturalWidth > 0) {
    const imageSpriteCanvas = buildDemonImageSpriteCanvas(spriteImage, side);
    if (imageSpriteCanvas) {
      demonCombatSpriteCache.set(key, imageSpriteCanvas);
      return imageSpriteCanvas;
    }
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
      drawCentaurTokenArt(artCtx, size.width, null, "player");
    } else {
      drawCentaurBannerArt(artCtx, size.width, size.height, race.id);
    }
  } else if (race.artKey === "demon-horde") {
    if (variant === "map") {
      drawDemonTokenArt(artCtx, size.width, null, "player");
    } else {
      drawDemonBannerArt(artCtx, size.width, size.height, race.id);
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

function getHitChance(attacker, defender, attackValue = getEffectiveAttack(attacker)) {
  const modified = BASE_HIT_CHANCE + (attackValue - getEffectiveEvasiveness(defender)) * 2;
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
  return `HP ${unit.hp}/${unit.maxHp} ARM ${unit.armor}/${unit.maxArmor} ATK ${getEffectiveAttack(unit)} DMG ${getEffectiveDamage(unit)} EVA ${getEffectiveEvasiveness(unit)} MOV ${moveText}`;
}

function hasAbility(unit, abilityId) {
  return Array.isArray(unit.abilities) && unit.abilities.includes(abilityId);
}

function getStackCapacity(units) {
  const leadershipBonus = units.reduce(
    (total, unit) => total + (hasAbility(unit, "leadership") ? 1 : 0),
    0
  );
  return BASE_STACK_CAPACITY + leadershipBonus;
}

function getStatus(unit, statusId) {
  return (unit.statuses || []).find((status) => status.id === statusId) || null;
}

function hasStatus(unit, statusId) {
  return Boolean(getStatus(unit, statusId));
}

function addOrRefreshStatus(unit, status) {
  if (!Array.isArray(unit.statuses)) {
    unit.statuses = [];
  }
  const existing = unit.statuses.find((entry) => entry.id === status.id);
  if (existing) {
    Object.assign(existing, status);
    return existing;
  }
  unit.statuses.push({ ...status });
  return unit.statuses.at(-1);
}

function removeExpiredStatuses(unit) {
  if (!Array.isArray(unit.statuses)) {
    unit.statuses = [];
  }
  unit.statuses = unit.statuses.filter((status) => status.turnsRemaining > 0);
}

function getStatusBonus(unit, stat) {
  let bonus = 0;
  for (const status of unit.statuses || []) {
    if (status.id === "call-of-bravery") {
      if (stat === "attack" || stat === "damage" || stat === "evasiveness") {
        bonus += 1;
      }
    }
    if (status.id === "flammable-buff" && stat === "damage") {
      bonus += FLAMMABLE_DAMAGE_BONUS;
    }
  }
  return bonus;
}

function getEffectiveAttack(unit) {
  return unit.attack + getStatusBonus(unit, "attack");
}

function getEffectiveDamage(unit) {
  return unit.damage + getStatusBonus(unit, "damage");
}

function getEffectiveEvasiveness(unit) {
  return unit.evasiveness + getStatusBonus(unit, "evasiveness");
}

function hasActiveFireStrike(unit) {
  return hasAbility(unit, "fire-strike") || hasStatus(unit, "flammable-buff");
}

function isGrounded(unit) {
  return hasStatus(unit, "grounded");
}

function isFlying(unit) {
  return hasAbility(unit, "flying") && !isGrounded(unit);
}

function isDirectStrikeBlocked(attacker, defender, profile) {
  return profile?.targeting === "adjacent" && isFlying(defender);
}

function getWorldMoveCost(stack, terrainType) {
  if (terrainType === "forest" && stack.raceId === "centaur-clans") {
    return 1;
  }
  return getMapTerrainRule(terrainType).cost;
}

function getCombatMoveCost(unit, terrainType) {
  if (terrainType === "forest" && hasAbility(unit, "forestry")) {
    return 1;
  }
  return getCombatTerrainRule(terrainType).cost;
}

function getFireStrikeChance(attacker, defender) {
  if (hasAbility(defender, "fire-immunity")) {
    return 0;
  }
  const base = clamp(50 + (FIRE_STRIKE_ATTACK - getEffectiveEvasiveness(defender)) * 2, 10, 95);
  return hasAbility(defender, "fire-protection") ? Math.floor(base / 2) : base;
}

function applyBurning(target) {
  if (hasAbility(target, "fire-immunity")) {
    return false;
  }
  if (hasAbility(target, "flammable")) {
    addOrRefreshStatus(target, {
      id: "flammable-buff",
      turnsRemaining: FLAMMABLE_DURATION
    });
    return true;
  }
  addOrRefreshStatus(target, {
    id: "burning",
    turnsRemaining: FIRE_STRIKE_BASE_DURATION,
    tickDamage: hasAbility(target, "fire-protection") ? 1 : FIRE_STRIKE_BASE_TICK
  });
  return true;
}

function attemptFireStrike(attacker, defender) {
  if (!hasActiveFireStrike(attacker) || !defender.alive) {
    return { applied: false, chance: 0, roll: null, effect: null };
  }

  const chance = getFireStrikeChance(attacker, defender);
  if (chance <= 0) {
    return { applied: false, chance, roll: null, effect: hasAbility(defender, "fire-immunity") ? "immune" : null };
  }

  const roll = randomInt(1, 100);
  if (roll > chance) {
    return { applied: false, chance, roll, effect: null };
  }

  return {
    applied: applyBurning(defender),
    chance,
    roll,
    effect: hasAbility(defender, "flammable") ? "flammable" : "burning"
  };
}

function applyBurningTick(side) {
  let anyDeaths = false;
  const logEntries = [];

  for (const unit of getAliveUnits(side)) {
    const flammable = getStatus(unit, "flammable-buff");
    if (flammable) {
      flammable.turnsRemaining -= 1;
    }

    const burning = getStatus(unit, "burning");
    if (burning) {
      unit.hp = Math.max(0, unit.hp - burning.tickDamage);
      burning.turnsRemaining -= 1;
      if (unit.hp <= 0) {
        const deathResult = handleUnitDeath(unit, { id: "burning", label: "burning" });
        anyDeaths = true;
        logEntries.push(...deathResult.logEntries);
      }
    }
    removeExpiredStatuses(unit);
  }

  return { anyDeaths, logEntries };
}

function decrementTurnSwapStatuses() {
  for (const side of ["player", "enemy"]) {
    for (const unit of getAliveUnits(side)) {
      for (const status of unit.statuses || []) {
        if (status.id === "call-of-bravery") {
          status.turnsRemaining -= 1;
        }
      }
      removeExpiredStatuses(unit);
    }
  }
}

function isCallOfBraveryActive(side) {
  return getAliveUnits(side).some((unit) => hasStatus(unit, "call-of-bravery"));
}

function canUseCallOfBravery(unit) {
  if (!hasAbility(unit, "call-of-bravery") || !unit.alive) {
    return false;
  }
  if (unit.usedAbilities?.callOfBravery) {
    return false;
  }
  return !isCallOfBraveryActive(unit.side);
}

function applyCallOfBravery(unit) {
  if (!canUseCallOfBravery(unit)) {
    return false;
  }

  for (const ally of getAliveUnits(unit.side)) {
    addOrRefreshStatus(ally, {
      id: "call-of-bravery",
      turnsRemaining: 3
    });
  }

  unit.usedAbilities.callOfBravery = true;
  unit.currentCombatMp = 0;
  return true;
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

  if (hasAbility(unit, "charge")) {
    entries.push("Passive: Charge (+2 ATK, +2 DMG after moving at least half MOV)");
  }

  if (hasAbility(unit, "leadership")) {
    entries.push("Passive: Leadership (+1 stack capacity)");
  }

  if (hasAbility(unit, "call-of-bravery")) {
    entries.push("Active: Call of Bravery (+1 ATK, +1 DMG, +1 EVA to all allies for 3 turn swaps)");
  }

  if (hasAbility(unit, "forestry")) {
    entries.push("Passive: Forestry (normal movement through forest)");
  }

  if (hasAbility(unit, "fire-strike")) {
    entries.push(`Passive: Fire Strike (${FIRE_STRIKE_BASE_DURATION} turns burning on ignite)`);
  }

  if (hasAbility(unit, "fire-protection")) {
    entries.push("Passive: Fire Protection (half ignite chance, burning deals 1)");
  }

  if (hasAbility(unit, "fire-immunity")) {
    entries.push("Passive: Fire Immunity (cannot be burned)");
  }

  if (hasAbility(unit, "basking")) {
    entries.push("Passive: Basking (Fireball heals for half raw damage instead of harming)");
  }

  if (hasAbility(unit, "flying")) {
    entries.push("Passive: Flying (melee units cannot strike this unit unless grounded)");
  }

  if (hasAbility(unit, "flammable")) {
    entries.push(`Passive: Flammable (Fire Strike kindles for ${FLAMMABLE_DURATION} turns: +${FLAMMABLE_DAMAGE_BONUS} DMG, temporary Fire Strike, death burst)`);
  }

  if (hasAbility(unit, "fireball")) {
    entries.push(`Active: Fireball (RNG ${FIREBALL_RANGE}, 3x3 splash, friendly fire, uses all MOV)`);
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

function getUnitCombatEffectEntries(unit) {
  const lines = [];

  if (isChargeActive(unit)) {
    lines.push("Charge primed: +2 ATK, +2 DMG on next attack");
  }
  if (hasStatus(unit, "call-of-bravery")) {
    lines.push(`Call of Bravery active: ${getStatus(unit, "call-of-bravery").turnsRemaining} swaps left`);
  }
  if (hasStatus(unit, "burning")) {
    const burning = getStatus(unit, "burning");
    lines.push(`Burning: ${burning.tickDamage} HP for ${burning.turnsRemaining} more turns`);
  }
  if (hasStatus(unit, "flammable-buff")) {
    const flammable = getStatus(unit, "flammable-buff");
    lines.push(`Kindled: +${FLAMMABLE_DAMAGE_BONUS} DMG, temporary Fire Strike (${flammable.turnsRemaining} turns left)`);
  }

  return lines;
}

function formatUnitCombatEffectsHtml(unit) {
  const lines = getUnitCombatEffectEntries(unit);
  return lines.length > 0 ? `<div>${lines.join(" | ")}</div>` : "";
}

function setInspectorHtml(html) {
  if (!unitInspectorEl) return;
  if (!html) {
    unitInspectorEl.className = "unit-inspector-empty";
    unitInspectorEl.innerHTML = "Hover a stack or unit to inspect it.";
    return;
  }
  unitInspectorEl.className = "unit-inspector-card";
  unitInspectorEl.innerHTML = html;
}

function getAbilityBadgeLabels(unit) {
  const labels = [];
  if (hasAbility(unit, "archery")) labels.push("Archery");
  if (hasAbility(unit, "marksmanship")) labels.push("Marksman");
  if (hasAbility(unit, "charge")) labels.push("Charge");
  if (hasAbility(unit, "leadership")) labels.push("Leader");
  if (hasAbility(unit, "call-of-bravery")) labels.push("Bravery");
  if (hasAbility(unit, "forestry")) labels.push("Forestry");
  if (hasAbility(unit, "fire-strike")) labels.push("Fire Strike");
  if (hasAbility(unit, "fire-protection")) labels.push("Fire Ward");
  if (hasAbility(unit, "fire-immunity")) labels.push("Fire Immune");
  if (hasAbility(unit, "basking")) labels.push("Basking");
  if (hasAbility(unit, "flying")) labels.push("Flying");
  if (hasAbility(unit, "flammable")) labels.push("Flammable");
  if (hasAbility(unit, "fireball")) labels.push("Fireball");
  return labels;
}

function getStatusBadgeLabels(unit) {
  const labels = [];
  if (isChargeActive(unit)) labels.push("Charge Primed");
  if (hasStatus(unit, "call-of-bravery")) labels.push("Inspired");
  if (hasStatus(unit, "burning")) labels.push("Burning");
  if (hasStatus(unit, "flammable-buff")) labels.push("Kindled");
  if (isGrounded(unit)) labels.push("Grounded");
  return labels;
}

function buildBadgeRowHtml(labels, max = labels.length, badgeClassName = "") {
  const unique = [...new Set(labels)].slice(0, max);
  if (unique.length === 0) {
    return "";
  }
  const classSuffix = badgeClassName ? ` ${badgeClassName}` : "";
  return `<div class="badge-row">${unique.map((label) => `<span class="chip-badge${classSuffix}">${label}</span>`).join("")}</div>`;
}

function formatCompactVitals(unit, includeCurrentMove = false) {
  const moveText = includeCurrentMove
    ? `${unit.currentCombatMp}/${unit.maxCombatMp}`
    : `${unit.maxCombatMp}`;
  return `HP ${unit.hp}/${unit.maxHp}  ARM ${unit.armor}/${unit.maxArmor}  MOV ${moveText}`;
}

function getCombatHitChanceEntries(side, unit) {
  const active = side === "enemy" ? getActivePlayerUnit() : null;
  if (!(state.mode === "combat" && active && side === "enemy")) {
    return [];
  }

  const profiles = getAttackCandidates(active, "enemy")
    .filter((candidate) => candidate.unit.id === unit.id)
    .map((candidate) => candidate.profile);

  const seen = new Set();
  const lines = [];
  for (const profile of profiles) {
    if (seen.has(profile.id)) continue;
    seen.add(profile.id);
    const attackName = profile.id === "melee" ? "Melee" : profile.label;
    lines.push(`${attackName}: ${getHitChance(active, unit, profile.attack)}% hit chance`);
  }
  return lines;
}

function getProjectedAttackBadge(unit) {
  if (state.mode !== "combat" || !unit || unit.side !== "enemy") {
    return "";
  }

  const active = getActivePlayerUnit();
  if (!active || state.combatTurn !== "player") {
    return "";
  }

  const candidate = getAttackCandidates(active, "enemy").find((entry) => entry.unit.id === unit.id);
  if (!candidate) {
    return "";
  }

  const attackName = candidate.profile.id === "melee" ? "Melee" : candidate.profile.label;
  return `${attackName} ${getHitChance(active, unit, candidate.profile.attack)}%`;
}

function buildInspectorStatGrid(unit, includeCurrentMove = false) {
  const moveValue = includeCurrentMove
    ? `${unit.currentCombatMp}/${unit.maxCombatMp}`
    : `${unit.maxCombatMp}`;
  const stats = [
    ["HP", `${unit.hp}/${unit.maxHp}`],
    ["ARM", `${unit.armor}/${unit.maxArmor}`],
    ["ATK", `${getEffectiveAttack(unit)}`],
    ["DMG", `${getEffectiveDamage(unit)}`],
    ["EVA", `${getEffectiveEvasiveness(unit)}`],
    ["MOV", moveValue]
  ];
  return `<div class="unit-inspector-stats">${stats
    .map(
      ([label, value]) =>
        `<div class="unit-inspector-stat"><span class="unit-inspector-stat-label">${label}</span><span class="unit-inspector-stat-value">${value}</span></div>`
    )
    .join("")}</div>`;
}

function buildInspectorListSection(title, entries) {
  if (!entries || entries.length === 0) {
    return "";
  }
  return `<div class="unit-inspector-section"><div class="unit-inspector-section-title">${title}</div><ul class="unit-inspector-list">${entries
    .map((entry) => `<li>${entry}</li>`)
    .join("")}</ul></div>`;
}

function getUnitSourceArtAsset(unit) {
  if (!unit?.archetypeId) {
    return "";
  }
  if (unit.unitRaceId === "centaur-clans") {
    return CENTAUR_SOURCE_ART_ASSETS[unit.archetypeId] || "";
  }
  if (unit.unitRaceId === "demon-horde") {
    return DEMON_SOURCE_ART_ASSETS[unit.archetypeId] || "";
  }
  return "";
}

function buildInspectorArtHtml(unit) {
  const source = getUnitSourceArtAsset(unit);
  if (!source) {
    return "";
  }
  const label = escapeHtml(formatUnitIdentity(unit));
  return `<figure class="unit-inspector-art-frame"><a class="unit-inspector-art-link" href="${source}" target="_blank" rel="noreferrer"><img class="unit-inspector-art" src="${source}" alt="${label} artwork" loading="eager" decoding="async" /></a><figcaption class="unit-inspector-art-caption">${label} full artwork</figcaption></figure>`;
}

function buildCompactMapStackTooltipHtml(side) {
  const stack = state.stacks[side];
  const units = getAliveUnits(side);
  const badges = [
    ...new Set(
      units.flatMap((unit) => [...getStatusBadgeLabels(unit), ...getAbilityBadgeLabels(unit)])
    )
  ];
  return `<strong>${stack.race} Stack</strong><div class="unit-tooltip-line">${units.length}/${getStackCapacity(units)} units</div>${buildBadgeRowHtml(badges, 3)}`;
}

function buildCompactCombatUnitTooltipHtml(side, unit) {
  const badges = [...getStatusBadgeLabels(unit), ...getAbilityBadgeLabels(unit)];
  const attackPreview = getProjectedAttackBadge(unit);
  const previewBadges = attackPreview ? [attackPreview] : [];
  return `<strong>${formatUnitIdentity(unit)}</strong><div class="unit-tooltip-line">${formatCompactVitals(unit, true)}</div>${buildBadgeRowHtml(badges, 1)}${buildBadgeRowHtml(
    previewBadges,
    1,
    side === "enemy" ? "chip-badge-enemy" : ""
  )}`;
}

function buildMapStackInspectorHtml(side, emphasizeHover = false) {
  const stack = state.stacks[side];
  const units = getAliveUnits(side);
  const uniqueBadges = [
    ...new Set(
      units.flatMap((unit) => [...getStatusBadgeLabels(unit), ...getAbilityBadgeLabels(unit)])
    )
  ];
  const capacity = getStackCapacity(units);
  const unitsHtml = units
    .map((unit) => {
      const unitBadges = [...getStatusBadgeLabels(unit), ...getAbilityBadgeLabels(unit)];
      const meta = [formatCompactVitals(unit, false), unit.loadout].filter(Boolean).join(" · ");
      return `<div class="unit-inspector-unit-row"><strong>${formatUnitIdentity(unit)}</strong><div class="unit-inspector-unit-meta">${meta}</div>${buildBadgeRowHtml(
        unitBadges,
        4
      )}</div>`;
    })
    .join("");

  return `<div class="unit-inspector-kicker">${emphasizeHover ? "Hovered Stack" : "Stack Overview"}</div><h4 class="unit-inspector-title">${stack.race} Stack</h4><div class="unit-inspector-subtitle">${side === "player" ? "Player" : "Enemy"} side · ${units.length}/${capacity} units ready</div>${buildBadgeRowHtml(
    uniqueBadges,
    5
  )}<div class="unit-inspector-note">This panel keeps the full stack breakdown off the board while you move and scout.</div><div class="unit-inspector-unit-list">${unitsHtml}</div>`;
}

function buildCombatUnitInspectorHtml(side, unit, emphasizeSelection = false) {
  const loadoutSection = unit.loadout
    ? `<div class="unit-inspector-section"><div class="unit-inspector-section-title">Loadout</div><div>${unit.loadout}</div></div>`
    : "";
  const abilityEntries = getUnitAbilities(unit);
  const effectEntries = getUnitCombatEffectEntries(unit);
  const hitChanceEntries = getCombatHitChanceEntries(side, unit);
  const badges = [...getStatusBadgeLabels(unit), ...getAbilityBadgeLabels(unit)];
  const kicker = emphasizeSelection
    ? "Selected Unit"
    : side === "player"
      ? "Hovered Ally"
      : "Hovered Target";
  return `<div class="unit-inspector-kicker">${kicker}</div><h4 class="unit-inspector-title">${formatUnitIdentity(unit)}</h4><div class="unit-inspector-subtitle">${state.stacks[side].race} · ${side === "player" ? "Player" : "Enemy"} unit</div>${buildInspectorArtHtml(unit)}${buildInspectorStatGrid(
    unit,
    true
  )}${buildBadgeRowHtml(badges, 6)}${loadoutSection}${buildInspectorListSection("Abilities", abilityEntries)}${buildInspectorListSection(
    "Status",
    effectEntries
  )}${buildInspectorListSection("Matchup", hitChanceEntries)}`;
}

function buildDefaultInspectorHtml() {
  if (!gameStarted) {
    return "";
  }

  if (state.mode === "combat") {
    const active = getActivePlayerUnit();
    if (active) {
      return buildCombatUnitInspectorHtml("player", active, true);
    }
  }

  return buildMapStackInspectorHtml("player");
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
  if (state?.combat?.log) {
    state.combat.log = [];
  }
  renderCombatLog();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

function clearEnemyTurnSummary() {
  if (state?.combat) {
    state.combat.lastEnemyTurnEntries = [];
  }
  if (enemyTurnSummaryEl) {
    enemyTurnSummaryEl.className = "enemy-turn-empty";
    enemyTurnSummaryEl.textContent = "The enemy recap will appear here after its combat turn.";
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
  renderCombatLog();
}

function appendEnemyTurnEntry(entry) {
  appendCombatLog(entry);
  if (state?.combat) {
    if (!Array.isArray(state.combat.lastEnemyTurnEntries)) {
      state.combat.lastEnemyTurnEntries = [];
    }
    state.combat.lastEnemyTurnEntries.push(entry);
  }
  setBattleFeedTab("enemy");
  renderEnemyTurnSummary();
}

function renderCombatLog() {
  if (!combatLogEl) return;
  const entries = [...(state.combat?.log || [])].reverse();
  if (entries.length === 0) {
    combatLogEl.innerHTML = `<li>No combat actions logged yet.</li>`;
    return;
  }
  combatLogEl.innerHTML = entries.map((entry) => `<li>${escapeHtml(entry)}</li>`).join("");
}

function renderEnemyTurnSummary() {
  if (!enemyTurnSummaryEl) return;

  if (state.mode !== "combat") {
    enemyTurnSummaryEl.className = "enemy-turn-empty";
    enemyTurnSummaryEl.textContent = "The enemy recap will appear here after its combat turn.";
    return;
  }

  const entries = state.combat?.lastEnemyTurnEntries || [];
  if (entries.length === 0) {
    enemyTurnSummaryEl.className = "enemy-turn-empty";
    enemyTurnSummaryEl.textContent = "No enemy turn has been recorded yet in this battle.";
    return;
  }

  enemyTurnSummaryEl.className = "";
  enemyTurnSummaryEl.innerHTML = `<p class="enemy-turn-caption">Review the enemy's last full combat turn before choosing your next move.</p><div class="enemy-turn-scroll"><ol class="enemy-turn-list">${[...entries]
    .reverse()
    .map((entry) => `<li>${escapeHtml(entry)}</li>`)
    .join("")}</ol></div>`;
}

function renderBattleOverview() {
  if (!battleArmyStripEl) return;

  if (state.mode !== "combat" || !state.combat) {
    battleArmyStripEl.className = "battle-overview-empty";
    battleArmyStripEl.textContent = "Enter combat to see each unit's health and armor.";
    return;
  }

  const activeId = state.combat.activePlayerUnitId;
  const sideCards = ["player", "enemy"].map((side) => {
    const units = getAliveUnits(side);
    const stack = state.stacks[side];
    return `<section class="battle-overview-side is-${side}">
      <div class="battle-overview-side-header">
        <span class="battle-overview-side-title">${escapeHtml(stack.race)}</span>
        <span class="battle-overview-side-count">${units.length} unit${units.length === 1 ? "" : "s"} alive</span>
      </div>
      <div class="battle-overview-unit-list">
        ${units.map((unit) => {
          const hpPercent = Math.max(0, Math.min(100, Math.round((unit.hp / Math.max(1, unit.maxHp)) * 100)));
          const activeTag = side === "player" && unit.id === activeId ? `<span class="battle-overview-unit-tag">Active</span>` : "";
          return `<article class="battle-overview-unit${side === "player" && unit.id === activeId ? " is-active" : ""}">
            <div class="battle-overview-unit-header">
              <span class="battle-overview-unit-name">${escapeHtml(unitName(unit))}</span>
              ${activeTag}
            </div>
            <div class="battle-overview-bar" role="img" aria-label="${escapeHtml(unitName(unit))} health ${unit.hp} out of ${unit.maxHp}">
              <div class="battle-overview-bar-fill" style="width: ${hpPercent}%"></div>
              <div class="battle-overview-bar-label">${unit.hp}/${unit.maxHp} HP</div>
            </div>
            <div class="battle-overview-unit-meta">
              <span class="battle-overview-unit-armor">Armor ${unit.armor}/${unit.maxArmor}</span>
              <span class="battle-overview-unit-mp">MP ${unit.currentCombatMp}/${unit.maxCombatMp}</span>
            </div>
          </article>`;
        }).join("")}
      </div>
    </section>`;
  }).join("");

  battleArmyStripEl.className = "battle-overview-grid";
  battleArmyStripEl.innerHTML = sideCards;
}

function refreshHoveredTooltip() {
  if (!gameStarted) {
    setTooltipHtml("");
    setInspectorHtml("");
    return;
  }

  if (!hoveredEntity) {
    setTooltipHtml("");
    setInspectorHtml(buildDefaultInspectorHtml());
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
      setInspectorHtml(buildDefaultInspectorHtml());
      return;
    }
    setTooltipHtml(buildCompactMapStackTooltipHtml(hoveredEntity.side), hoverClientX, hoverClientY);
    setInspectorHtml(buildMapStackInspectorHtml(hoveredEntity.side, true));
    return;
  }

  const unit = getUnitById(hoveredEntity.side, hoveredEntity.unitId);
  if (!unit || !unit.alive) {
    hoveredEntity = null;
    setTooltipHtml("");
    setInspectorHtml(buildDefaultInspectorHtml());
    return;
  }
  setTooltipHtml(buildCompactCombatUnitTooltipHtml(hoveredEntity.side, unit), hoverClientX, hoverClientY);
  setInspectorHtml(buildCombatUnitInspectorHtml(hoveredEntity.side, unit));
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
  selectActivePlayerUnit(next.id);
}

function selectActivePlayerUnit(unitId, options = {}) {
  if (state.mode !== "combat" || !state.combat) {
    return false;
  }

  const unit = getUnitById("player", unitId);
  if (!unit?.alive) {
    return false;
  }

  const changed = state.combat.activePlayerUnitId !== unit.id;
  state.combat.activePlayerUnitId = unit.id;

  if (changed || options.clearTargeting !== false) {
    clearTargetingMode();
  }

  if (options.announce !== false) {
    statusEl.textContent = `Combat View: Selected ${unitName(unit)} (${unit.currentCombatMp}/${unit.maxCombatMp} MP).`;
  }

  updateControls();
  draw();
  return true;
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

function getChargeThreshold(unit) {
  return Math.max(1, Math.floor(unit.maxCombatMp / 2));
}

function isChargeActive(unit) {
  return hasAbility(unit, "charge") && (unit.combatMoveSpentThisTurn || 0) >= getChargeThreshold(unit);
}

function applyAttackModifiers(attacker, profile) {
  const nextProfile = { ...profile };

  if (isChargeActive(attacker)) {
    nextProfile.attack += 2;
    nextProfile.damage += 2;
    nextProfile.modifiers = [...(nextProfile.modifiers || []), "charge"];
  }

  return nextProfile;
}

function getMeleeProfile(attacker) {
  return applyAttackModifiers(attacker, {
    id: "melee",
    label: "melee",
    attack: getEffectiveAttack(attacker),
    damage: getEffectiveDamage(attacker),
    range: 1,
    targeting: "adjacent",
    priority: 0
  });
}

function getArcheryProfile(attacker) {
  if (!hasAbility(attacker, "archery")) {
    return null;
  }

  const marksmanshipBonus = hasAbility(attacker, "marksmanship") ? 2 : 0;
  const rangeBonus = hasAbility(attacker, "marksmanship") ? 1 : 0;

  return applyAttackModifiers(attacker, {
    id: "archery",
    label: "shot",
    attack: Math.max(1, getEffectiveAttack(attacker) - 2 + marksmanshipBonus),
    damage: Math.max(1, getEffectiveDamage(attacker) - 2 + marksmanshipBonus),
    range: 2 + rangeBonus,
    targeting: "line-of-sight",
    priority: 1
  });
}

function isClearLineOfSight(attacker, defender) {
  const dx = defender.x - attacker.x;
  const dy = defender.y - attacker.y;
  const steps = Math.max(Math.abs(dx), Math.abs(dy));
  if (steps <= 1) {
    return true;
  }

  const stepX = dx / steps;
  const stepY = dy / steps;

  for (let step = 1; step < steps; step += 1) {
    const x = Math.round(attacker.x + stepX * step);
    const y = Math.round(attacker.y + stepY * step);
    if (!inBounds(x, y, COMBAT_GRID_SIZE)) {
      return false;
    }
    if (getCombatUnitAt(x, y)) {
      return false;
    }
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
    const distance = chebyshev(attacker.x, attacker.y, unit.x, unit.y);
    if (distance <= 1 || distance > archery.range) {
      return false;
    }
    if (isDirectStrikeBlocked(attacker, unit, archery)) {
      return false;
    }
    return true;
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
    return adjacentTargets(attacker, defenderSide).filter((unit) => !isDirectStrikeBlocked(attacker, unit, profile));
  }

  if (profile.targeting === "line-of-sight") {
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

function getActionableAttackProfiles(attacker, defenderSide) {
  const profiles = new Map();
  for (const candidate of getAttackCandidates(attacker, defenderSide)) {
    if (!profiles.has(candidate.profile.id)) {
      profiles.set(candidate.profile.id, {
        profile: candidate.profile,
        candidates: []
      });
    }
    profiles.get(candidate.profile.id).candidates.push(candidate);
  }
  return [...profiles.values()].sort((a, b) => a.profile.priority - b.profile.priority);
}

function isRangedProfile(profile) {
  return profile.targeting !== "adjacent" || profile.range > 1;
}

function getAttackButtonLabel(profileId) {
  if (profileId === "melee") return "Attack";
  if (profileId === "archery") return "Archery";
  return profileId.charAt(0).toUpperCase() + profileId.slice(1);
}

function getCombatTargeting() {
  if (state.mode !== "combat" || !state.combat?.targeting) {
    return null;
  }

  const active = getActivePlayerUnit();
  if (!active || state.combat.targeting.attackerId !== active.id) {
    clearTargetingMode();
    return null;
  }

  if (state.combat.targeting.kind === "attack") {
    const actionable = getActionableAttackProfiles(active, "enemy").find(
      (entry) => entry.profile.id === state.combat.targeting.profileId
    );
    if (!actionable) {
      clearTargetingMode();
      return null;
    }
    return {
      kind: "attack",
      attacker: active,
      profile: actionable.profile,
      candidates: actionable.candidates
    };
  }

  if (state.combat.targeting.kind === "fireball") {
    const options = getFireballTargets(active);
    if (options.length === 0) {
      clearTargetingMode();
      return null;
    }
    return {
      kind: "fireball",
      attacker: active,
      options
    };
  }

  clearTargetingMode();
  return null;
}

function getTilesForAttackProfile(attacker, profile) {
  const tiles = [];

  if (profile.targeting === "adjacent") {
    return getOrthogonalAdjacentTiles(attacker.x, attacker.y);
  }

  if (profile.targeting === "line-of-sight") {
    for (let y = 0; y < COMBAT_GRID_SIZE; y += 1) {
      for (let x = 0; x < COMBAT_GRID_SIZE; x += 1) {
        const distance = chebyshev(attacker.x, attacker.y, x, y);
        if (distance <= 1 || distance > profile.range) {
          continue;
        }
        tiles.push({ x, y });
      }
    }
  }

  return tiles;
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
    state.combat.targeting = null;
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

function getOrthogonalAdjacentTiles(x, y) {
  return [
    { x: x + 1, y },
    { x: x - 1, y },
    { x, y: y + 1 },
    { x, y: y - 1 }
  ].filter((tile) => inBounds(tile.x, tile.y, COMBAT_GRID_SIZE));
}

function formatAttackResolutionLog(attacker, defender, result, prefix = `${unitName(attacker)} ${result.attackLabel} -> ${unitName(defender)}`) {
  if (!result.hit) {
    return `${prefix}: miss (${result.hitRoll} vs ${result.hitChance}%).`;
  }
  if (result.convertedByBasking) {
    return `${prefix}: hit (${result.hitRoll}/${result.hitChance}%), but ${unitName(defender)} basked and healed ${result.healing} HP.`;
  }
  return `${prefix}: hit (${result.hitRoll}/${result.hitChance}%), raw ${result.rawDamage}, armor ${result.armorAbsorbed}, hp ${result.hpDamage}.${result.eliminated ? ` Eliminated ${result.eliminated}.` : ""}`;
}

function handleUnitDeath(unit) {
  const logEntries = [];
  const origin = { x: unit.x, y: unit.y };
  const deadLabel = unitName(unit);
  const triggersBurst = hasStatus(unit, "flammable-buff") && origin.x != null && origin.y != null;

  eliminateUnit(unit);

  if (!triggersBurst) {
    return { logEntries };
  }

  logEntries.push(`${deadLabel} erupts in a volatile fire burst.`);
  const burstProfile = {
    id: "flammable-burst",
    label: "volatile burst",
    attack: FLAMMABLE_BURST_ATTACK,
    damage: FLAMMABLE_BURST_DAMAGE,
    range: 1,
    targeting: "adjacent",
    priority: 0
  };

  for (const tile of getOrthogonalAdjacentTiles(origin.x, origin.y)) {
    const entry = getCombatUnitAt(tile.x, tile.y);
    if (!entry?.unit?.alive) {
      continue;
    }
    const result = resolveAttack(unit.side, { ...unit, x: origin.x, y: origin.y }, entry.side, entry.unit, burstProfile);
    logEntries.push(formatAttackResolutionLog(unit, entry.unit, result, `${deadLabel} burst -> ${unitName(entry.unit)}`));
    logEntries.push(...(result.deathLogEntries || []));
  }

  return { logEntries };
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
  if (profile.id === "fireball" && hasAbility(defender, "basking")) {
    const healing = Math.floor(rawDamage / 2);
    defender.hp = Math.min(defender.maxHp, defender.hp + healing);
    return {
      attackerSide,
      defenderSide,
      attackType: profile.id,
      attackLabel: profile.label,
      hitChance,
      hitRoll,
      hit: true,
      rawDamage,
      armorAbsorbed: 0,
      hpDamage: 0,
      healing,
      convertedByBasking: true,
      eliminated: null,
      deathLogEntries: []
    };
  }
  const intendedArmorDamage = Math.floor(rawDamage * 0.8);
  const guaranteedHpDamage = rawDamage - intendedArmorDamage;
  const armorAbsorbed = Math.min(defender.armor, intendedArmorDamage);
  defender.armor -= armorAbsorbed;
  const spillToHp = intendedArmorDamage - armorAbsorbed;
  const hpDamage = Math.max(0, guaranteedHpDamage + spillToHp);
  defender.hp = Math.max(0, defender.hp - hpDamage);

  let eliminated = null;
  let deathLogEntries = [];
  if (defender.hp <= 0) {
    eliminated = unitName(defender);
    deathLogEntries = handleUnitDeath(defender).logEntries;
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
    convertedByBasking: false,
    healing: 0,
    eliminated,
    deathLogEntries
  };
}

function formatFireStrikeLog(attacker, defender, fireResult) {
  if (fireResult.effect === "immune") {
    return `${unitName(attacker)} fire strike had no effect on ${unitName(defender)}.`;
  }
  if (fireResult.roll == null) {
    return `${unitName(attacker)} fire strike had no effect on ${unitName(defender)}.`;
  }
  if (!fireResult.applied) {
    return `${unitName(attacker)} fire strike failed on ${unitName(defender)} (${fireResult.roll}/${fireResult.chance}%).`;
  }
  if (fireResult.effect === "flammable") {
    return `${unitName(attacker)} kindled ${unitName(defender)} (${fireResult.roll}/${fireResult.chance}%).`;
  }
  return `${unitName(attacker)} ignited ${unitName(defender)} (${fireResult.roll}/${fireResult.chance}%).`;
}

function applyAttackSideEffects(attacker, defender, result) {
  if (!result.hit || !defender.alive) {
    return [];
  }

  const fireResult = attemptFireStrike(attacker, defender);
  if (fireResult.roll == null && !fireResult.applied) {
    return [];
  }
  return [formatFireStrikeLog(attacker, defender, fireResult)];
}

function getFireballArea(centerX, centerY) {
  const area = [];
  for (let y = centerY - 1; y <= centerY + 1; y += 1) {
    for (let x = centerX - 1; x <= centerX + 1; x += 1) {
      if (inBounds(x, y, COMBAT_GRID_SIZE)) {
        area.push({ x, y });
      }
    }
  }
  return area;
}

function getFireballTargets(attacker) {
  if (!hasAbility(attacker, "fireball")) {
    return [];
  }

  const targets = [];
  for (let y = Math.max(0, attacker.y - FIREBALL_RANGE); y <= Math.min(COMBAT_GRID_SIZE - 1, attacker.y + FIREBALL_RANGE); y += 1) {
    for (let x = Math.max(0, attacker.x - FIREBALL_RANGE); x <= Math.min(COMBAT_GRID_SIZE - 1, attacker.x + FIREBALL_RANGE); x += 1) {
      if (chebyshev(attacker.x, attacker.y, x, y) > FIREBALL_RANGE) continue;
      const units = getFireballArea(x, y)
        .map((tile) => getCombatUnitAt(tile.x, tile.y))
        .filter(Boolean);
      if (units.length === 0) continue;

      const enemyHits = units.filter((entry) => entry.side !== attacker.side).length;
      const allyHits = units.filter((entry) => entry.side === attacker.side).length;
      targets.push({
        x,
        y,
        units,
        score: enemyHits * 2 - allyHits
      });
    }
  }

  targets.sort((a, b) => b.score - a.score || a.units.length - b.units.length);
  return targets;
}

function useFireball(attacker, targetX = null, targetY = null) {
  const options = getFireballTargets(attacker);
  if (options.length === 0) {
    return { ok: false, reason: "no-target" };
  }

  const selected = Number.isFinite(targetX) && Number.isFinite(targetY)
    ? options.find((option) => option.x === targetX && option.y === targetY)
    : options[0];
  if (!selected) {
    return { ok: false, reason: "invalid-target" };
  }
  const profile = {
    id: "fireball",
    label: "fireball",
    attack: FIREBALL_ATTACK,
    damage: FIREBALL_DAMAGE,
    range: FIREBALL_RANGE
  };
  const logEntries = [`${unitName(attacker)} casts Fireball at (${selected.x}, ${selected.y}).`];

  for (const entry of selected.units) {
    if (!entry.unit.alive) continue;
    const result = resolveAttack(attacker.side, attacker, entry.side, entry.unit, profile);
    logEntries.push(formatAttackResolutionLog(attacker, entry.unit, result, `${unitName(attacker)} fireball -> ${unitName(entry.unit)}`));
    for (const sideEffect of applyAttackSideEffects(attacker, entry.unit, result)) {
      logEntries.push(sideEffect);
    }
    logEntries.push(...(result.deathLogEntries || []));
  }

  attacker.currentCombatMp = 0;
  return { ok: true, logEntries, target: { x: selected.x, y: selected.y } };
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
    unit.combatMoveSpentThisTurn = 0;
  }
}

function beginCombatTurn(side) {
  state.combatTurn = side;
  decrementTurnSwapStatuses();
  const statusTick = applyBurningTick(side);
  if (statusTick.anyDeaths) {
    if (side === "enemy") {
      appendEnemyTurnEntry(`${state.stacks[side].race} suffers burning damage at turn start.`);
    } else {
      appendCombatLog(`${state.stacks[side].race} suffers burning damage at turn start.`);
    }
  }
  for (const entry of statusTick.logEntries) {
    if (side === "enemy") {
      appendEnemyTurnEntry(entry);
    } else {
      appendCombatLog(entry);
    }
  }
  if (checkCombatEnd()) {
    updateControls();
    draw();
    return false;
  }
  resetCombatMp(side);
  return true;
}

function placeCombatUnits() {
  const placeSide = (side) => {
    const alive = getAliveUnits(side);
    const slots = [];
    const preferredColumns = side === "player"
      ? [1, 2, 0, 3]
      : [COMBAT_GRID_SIZE - 2, COMBAT_GRID_SIZE - 3, COMBAT_GRID_SIZE - 1, COMBAT_GRID_SIZE - 4];

    for (const x of preferredColumns) {
      for (let y = 0; y < COMBAT_GRID_SIZE; y += 1) {
        const terrainType = getCombatTerrainAt(x, y);
        const terrainRule = getCombatTerrainRule(terrainType);
        if (!terrainRule.passable) {
          continue;
        }
        slots.push({ x, y });
      }
    }

    for (let i = 0; i < alive.length; i += 1) {
      const slot = slots[i];
      if (!slot) {
        alive[i].x = null;
        alive[i].y = null;
        continue;
      }
      alive[i].x = slot.x;
      alive[i].y = slot.y;
    }
  };

  placeSide("player");
  placeSide("enemy");
}

function resetBattleState() {
  for (const side of ["player", "enemy"]) {
    for (const unit of state.stacks[side].units) {
      unit.statuses = [];
      unit.usedAbilities = {};
      unit.combatMoveSpentThisTurn = 0;
    }
  }
}

function updateControls() {
  modeLabelEl.textContent = state.mode === "map" ? "Map" : "Combat";
  mapMpLabelEl.textContent = `${state.stacks.player.currentMapMp}/${state.stacks.player.maxMapMp}`;
  renderBattleOverview();
  renderCombatLog();
  renderEnemyTurnSummary();
  updateBattleShell();

  const active = getActivePlayerUnit();
  if (combatMpLabelEl) {
    combatMpLabelEl.textContent = active
      ? `${unitName(active)} MP ${active.currentCombatMp}/${active.maxCombatMp} HP ${active.hp}/${active.maxHp}`
      : `0/0`;
  }

  const actionableProfiles =
    state.mode === "combat" &&
    state.combatTurn === "player" &&
    !state.gameOver &&
    active &&
    active.currentCombatMp > 0
      ? getActionableAttackProfiles(active, "enemy")
      : [];

  const meleeAction = Array.isArray(actionableProfiles)
    ? actionableProfiles.find((entry) => entry.profile.id === "melee")
    : null;
  const archeryAction = Array.isArray(actionableProfiles)
    ? actionableProfiles.find((entry) => entry.profile.id === "archery")
    : null;

  const canBravery =
    state.mode === "combat" &&
    state.combatTurn === "player" &&
    !state.gameOver &&
    active &&
    active.currentCombatMp > 0 &&
    canUseCallOfBravery(active);

  const canFireball =
    state.mode === "combat" &&
    state.combatTurn === "player" &&
    !state.gameOver &&
    active &&
    active.currentCombatMp > 0 &&
    hasAbility(active, "fireball") &&
    getFireballTargets(active).length > 0;

  const targeting = getCombatTargeting();

  attackBtn.hidden = !meleeAction;
  attackBtn.disabled = !meleeAction;
  attackBtn.classList.toggle("is-active", targeting?.kind === "attack" && targeting.profile.id === "melee");

  if (archeryBtn) {
    archeryBtn.hidden = !archeryAction;
    archeryBtn.disabled = !archeryAction;
    archeryBtn.classList.toggle("is-active", targeting?.kind === "attack" && targeting.profile.id === "archery");
  }

  if (braveryBtn) {
    braveryBtn.hidden = !canBravery;
    braveryBtn.disabled = !canBravery;
    braveryBtn.classList.toggle("is-active", false);
  }

  if (fireballBtn) {
    fireballBtn.hidden = !canFireball;
    fireballBtn.disabled = !canFireball;
    fireballBtn.classList.toggle("is-active", targeting?.kind === "fireball");
  }
  endTurnBtn.disabled = state.gameOver || state.mode !== "combat" || state.combatTurn !== "player";
  if (mapEndTurnBtn) {
    mapEndTurnBtn.disabled = state.gameOver || state.mode !== "map";
  }
}

function getDefendingSide(attacker) {
  return attacker === "player" ? "enemy" : "player";
}

function startCombat(attacker) {
  hoveredEntity = null;
  setTooltipHtml("");
  setBattleFeedTab("enemy");
  state.mode = "combat";
  state.combatTurn = getDefendingSide(attacker);
  state.combatTerrain = createCombatTerrain(COMBAT_GRID_SIZE);
  state.combat = {
    activePlayerUnitId: null,
    targeting: null,
    log: [],
    lastEnemyTurnEntries: []
  };
  clearCombatLog();
  clearEnemyTurnSummary();
  resetBattleState();

  placeCombatUnits();
  resetCombatMp("player");
  resetCombatMp("enemy");

  const first = getAliveUnits("player")[0];
  state.combat.activePlayerUnitId = first ? first.id : null;

  statusEl.textContent = `Combat View: ${state.stacks.player.race} (${getStackCount("player")}) engages ${state.stacks.enemy.race} (${getStackCount("enemy")}). ${state.combatTurn === "player" ? "Your" : "Enemy"} combat turn.`;
  appendCombatLog(`${state.stacks.player.race} engages ${state.stacks.enemy.race}. ${state.combatTurn === "player" ? "Player" : "Enemy"} defends and acts first.`);
  updateControls();
  draw();

  if (state.combatTurn === "enemy") {
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

  const moveCost = getWorldMoveCost(stack, terrainType);
  if (stack.currentMapMp < moveCost) {
    statusEl.textContent = `Map View: Need ${moveCost} MP for ${terrainRule.label}. Remaining MP: ${stack.currentMapMp}.`;
    return;
  }

  stack.x = nx;
  stack.y = ny;
  stack.currentMapMp -= moveCost;
  revealFogArea(state.fog.player.explored, stack.x, stack.y, state.fog.player.radius);
  statusEl.textContent = `Map View: ${stack.race} stack moved to (${nx}, ${ny}) on ${terrainRule.label} (${moveCost} MP). Remaining MP: ${stack.currentMapMp}.`;

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
      const moveCost = getWorldMoveCost(enemy, getMapTerrainAt(option.x, option.y));
      if (!terrainRule.passable || moveCost > enemy.currentMapMp) {
        continue;
      }

      selected = { ...option, cost: moveCost };
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

  const moveCost = getCombatMoveCost(active, terrainType);
  if (active.currentCombatMp < moveCost) {
    statusEl.textContent = `Combat View: ${unitName(active)} needs ${moveCost} MP for ${terrainRule.label}. Remaining MP: ${active.currentCombatMp}.`;
    return;
  }

  active.x = nx;
  active.y = ny;
  active.currentCombatMp -= moveCost;
  active.combatMoveSpentThisTurn = (active.combatMoveSpentThisTurn || 0) + moveCost;

  statusEl.textContent = `Combat View: ${unitName(active)} moved to (${nx}, ${ny}) on ${terrainRule.label} (${moveCost} MP). Remaining MP: ${active.currentCombatMp}.`;
  updateControls();
  draw();
}

function performPlayerAttack(attacker, defender, profile) {
  const result = resolveAttack("player", attacker, "enemy", defender, profile);
  attacker.currentCombatMp = 0;
  clearTargetingMode();

  const logPrefix = `${unitName(attacker)} ${result.attackLabel} -> ${unitName(defender)}`;
  appendCombatLog(formatAttackResolutionLog(attacker, defender, result, logPrefix));
  for (const sideEffect of applyAttackSideEffects(attacker, defender, result)) {
    appendCombatLog(sideEffect);
  }
  for (const entry of result.deathLogEntries || []) {
    appendCombatLog(entry);
  }
  const eliminatedText = result.eliminated ? ` ${result.eliminated} was eliminated.` : "";
  statusEl.textContent = `Combat View: Attack logged.${eliminatedText}`;

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

function playerCallOfBravery() {
  if (state.mode !== "combat" || state.combatTurn !== "player" || state.gameOver) {
    return;
  }
  const active = getActivePlayerUnit();
  if (!active || !canUseCallOfBravery(active)) {
    return;
  }

  applyCallOfBravery(active);
  clearTargetingMode();
  appendCombatLog(`${unitName(active)} uses Call of Bravery.`);
  statusEl.textContent = "Combat View: Call of Bravery inspired the stack.";
  updateControls();
  draw();
}

function playerFireball() {
  if (state.mode !== "combat" || state.combatTurn !== "player" || state.gameOver) {
    return;
  }
  const active = getActivePlayerUnit();
  if (!active || !hasAbility(active, "fireball")) {
    return;
  }

  const options = getFireballTargets(active);
  if (options.length === 0) {
    statusEl.textContent = "Combat View: No valid Fireball target in range.";
    updateControls();
    return;
  }

  if (
    state.combat?.targeting?.kind === "fireball" &&
    state.combat.targeting.attackerId === active.id
  ) {
    clearTargetingMode();
    statusEl.textContent = `Combat View: Fireball targeting canceled for ${unitName(active)}.`;
    updateControls();
    draw();
    return;
  }

  state.combat.targeting = {
    kind: "fireball",
    attackerId: active.id
  };
  statusEl.textContent = `Combat View: ${unitName(active)} is targeting Fireball. Click a highlighted tile to cast.`;
  updateControls();
  draw();
}

function beginAttackTargeting(profileId) {
  if (state.mode !== "combat" || state.combatTurn !== "player" || state.gameOver) {
    return;
  }

  const active = getActivePlayerUnit();
  if (!active) {
    return;
  }

  const attackEntry = getActionableAttackProfiles(active, "enemy").find((entry) => entry.profile.id === profileId);
  if (!attackEntry) {
    statusEl.textContent = `Combat View: ${getAttackButtonLabel(profileId)} is not available for ${unitName(active)}.`;
    updateControls();
    draw();
    return;
  }

  if (
    state.combat?.targeting?.kind === "attack" &&
    state.combat.targeting.attackerId === active.id &&
    state.combat.targeting.profileId === profileId
  ) {
    clearTargetingMode();
    statusEl.textContent = `Combat View: ${getAttackButtonLabel(profileId)} targeting canceled for ${unitName(active)}.`;
    updateControls();
    draw();
    return;
  }

  state.combat.targeting = {
    kind: "attack",
    attackerId: active.id,
    profileId
  };
  statusEl.textContent = `Combat View: ${unitName(active)} is targeting ${getAttackButtonLabel(profileId)}. Click a highlighted enemy.`;
  updateControls();
  draw();
}

function playerCombatAttack() {
  beginAttackTargeting("melee");
}

function playerArcheryAttack() {
  beginAttackTargeting("archery");
}

function enemyCombatTurn() {
  if (state.mode !== "combat" || state.combatTurn !== "enemy" || state.gameOver) {
    return;
  }

  clearTargetingMode();
  clearEnemyTurnSummary();
  if (!beginCombatTurn("enemy")) {
    return;
  }
  const enemyUnits = [...getAliveUnits("enemy")];

  for (const unit of enemyUnits) {
    if (!unit.alive || state.gameOver) continue;

    if (canUseCallOfBravery(unit)) {
      applyCallOfBravery(unit);
      appendEnemyTurnEntry(`${unitName(unit)} uses Call of Bravery.`);
      statusEl.textContent = "Combat View: Enemy battle cry echoes across the field.";
      continue;
    }

    if (hasAbility(unit, "fireball")) {
      const fireballResult = useFireball(unit);
      if (fireballResult.ok) {
        for (const entry of fireballResult.logEntries) {
          appendEnemyTurnEntry(entry);
        }
        statusEl.textContent = "Combat View: Enemy fireball resolved.";
        if (checkCombatEnd()) {
          updateControls();
          draw();
          return;
        }
        continue;
      }
    }

    while (unit.currentCombatMp > 0) {
      const targets = getAttackCandidates(unit, "player");
      if (targets.length > 0) {
        const { unit: defender, profile } = targets[0];
        const result = resolveAttack("enemy", unit, "player", defender, profile);
        unit.currentCombatMp = 0;
        const logPrefix = `${unitName(unit)} ${result.attackLabel} -> ${unitName(defender)}`;
        appendEnemyTurnEntry(formatAttackResolutionLog(unit, defender, result, logPrefix));
        for (const sideEffect of applyAttackSideEffects(unit, defender, result)) {
          appendEnemyTurnEntry(sideEffect);
        }
        for (const entry of result.deathLogEntries || []) {
          appendEnemyTurnEntry(entry);
        }
        statusEl.textContent = "Combat View: Enemy attack logged.";

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
        const moveCost = getCombatMoveCost(unit, getCombatTerrainAt(option.x, option.y));
        if (!terrainRule.passable || moveCost > unit.currentCombatMp) {
          continue;
        }

        unit.x = option.x;
        unit.y = option.y;
        unit.currentCombatMp -= moveCost;
        unit.combatMoveSpentThisTurn = (unit.combatMoveSpentThisTurn || 0) + moveCost;
        appendEnemyTurnEntry(`${unitName(unit)} moved to (${option.x}, ${option.y}) on ${terrainRule.label} (${moveCost} MP).`);
        moved = true;
        break;
      }

      if (!moved) {
        appendEnemyTurnEntry(`${unitName(unit)} held position after failing to find a useful move.`);
        unit.currentCombatMp = 0;
      }
    }
  }

  if (state.gameOver) {
    updateControls();
    draw();
    return;
  }

  if (!beginCombatTurn("player")) {
    return;
  }
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

function drawCombatTargetingOverlay() {
  const targeting = getCombatTargeting();
  if (!targeting) {
    return;
  }

  ctx.save();

  if (targeting.kind === "attack") {
    const indicator = getAttackIndicatorStyle(targeting.profile);
    const tiles = getTilesForAttackProfile(targeting.attacker, targeting.profile);
    ctx.fillStyle = isRangedProfile(targeting.profile)
      ? "rgba(111, 211, 255, 0.16)"
      : "rgba(255, 211, 77, 0.18)";

    for (const tile of tiles) {
      ctx.fillRect(
        tile.x * COMBAT_TILE_SIZE + 3,
        tile.y * COMBAT_TILE_SIZE + 3,
        COMBAT_TILE_SIZE - 6,
        COMBAT_TILE_SIZE - 6
      );
    }

    for (const candidate of targeting.candidates) {
      const cx = candidate.unit.x * COMBAT_TILE_SIZE + COMBAT_TILE_SIZE / 2;
      const cy = candidate.unit.y * COMBAT_TILE_SIZE + COMBAT_TILE_SIZE / 2;
      drawCombatRingStyled(cx, cy, {
        stroke: indicator.color,
        width: 3,
        radius: COMBAT_TILE_SIZE * indicator.radiusScale,
        dash: indicator.dash
      });
    }
  }

  if (targeting.kind === "fireball") {
    ctx.fillStyle = "rgba(255, 136, 84, 0.18)";
    for (const option of targeting.options) {
      ctx.fillRect(
        option.x * COMBAT_TILE_SIZE + 7,
        option.y * COMBAT_TILE_SIZE + 7,
        COMBAT_TILE_SIZE - 14,
        COMBAT_TILE_SIZE - 14
      );
    }

    const hoverTile = hoveredEntity?.type === "combatUnit"
      ? { x: getUnitById(hoveredEntity.side, hoveredEntity.unitId)?.x, y: getUnitById(hoveredEntity.side, hoveredEntity.unitId)?.y }
      : getCombatTileFromCanvasPoint({ x: hoverClientX == null ? NaN : ((hoverClientX - board.getBoundingClientRect().left) / board.getBoundingClientRect().width) * board.width, y: hoverClientY == null ? NaN : ((hoverClientY - board.getBoundingClientRect().top) / board.getBoundingClientRect().height) * board.height });
    const selectedOption = targeting.options.find((option) => option.x === hoverTile?.x && option.y === hoverTile?.y);
    const previewArea = selectedOption ? getFireballArea(selectedOption.x, selectedOption.y) : [];
    ctx.fillStyle = "rgba(255, 102, 51, 0.22)";
    for (const tile of previewArea) {
      ctx.fillRect(
        tile.x * COMBAT_TILE_SIZE + 3,
        tile.y * COMBAT_TILE_SIZE + 3,
        COMBAT_TILE_SIZE - 6,
        COMBAT_TILE_SIZE - 6
      );
    }
  }

  ctx.restore();
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

  if (race?.artKey === "centaur-archer") {
    const strongestUnit = getStrongestStackUnit(side);
    const art = createArtCanvas(MAP_ART_SIZE, MAP_ART_SIZE);
    const artCtx = art.getContext("2d");
    drawCentaurTokenArt(artCtx, art.width, strongestUnit, side);
    ctx.drawImage(art, cx - radius, cy - radius, radius * 2, radius * 2);
  } else if (race?.artKey === "demon-horde") {
    const strongestUnit = getStrongestStackUnit(side);
    const art = createArtCanvas(MAP_ART_SIZE, MAP_ART_SIZE);
    const artCtx = art.getContext("2d");
    drawDemonTokenArt(artCtx, art.width, strongestUnit, side);
    ctx.drawImage(art, cx - radius, cy - radius, radius * 2, radius * 2);
  } else if (race?.artKey) {
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
  const targeting = getCombatTargeting();
  if (targeting?.kind === "attack" && active) {
    for (const candidate of targeting.candidates) {
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
  drawCombatTargetingOverlay();
  drawCombatUnits();
}

function getCanvasPointFromEvent(event) {
  const rect = board.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;
  const x = ((event.clientX - rect.left) / rect.width) * board.width;
  const y = ((event.clientY - rect.top) / rect.height) * board.height;
  return { x, y, clientX: event.clientX, clientY: event.clientY };
}

function getCombatTileFromCanvasPoint(point) {
  if (!point) return null;
  const x = Math.floor(point.x / COMBAT_TILE_SIZE);
  const y = Math.floor(point.y / COMBAT_TILE_SIZE);
  if (!inBounds(x, y, COMBAT_GRID_SIZE)) {
    return null;
  }
  return { x, y };
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
      hoverClientX = null;
      hoverClientY = null;
      draw();
    }
    return;
  }

  hoveredEntity = nextHovered;
  hoverClientX = point.clientX;
  hoverClientY = point.clientY;
  draw();
}

function clearHoveredEntity() {
  if (!hoveredEntity) return;
  hoveredEntity = null;
  hoverClientX = null;
  hoverClientY = null;
  draw();
}

function handleCombatBoardClick(event) {
  if (!gameStarted || state.mode !== "combat") {
    return;
  }

  const point = getCanvasPointFromEvent(event);
  if (!point) return;

  const tile = getCombatTileFromCanvasPoint(point);
  const clickedUnit = tile ? getCombatUnitAt(tile.x, tile.y) : null;
  if (clickedUnit?.side === "player") {
    selectActivePlayerUnit(clickedUnit.unit.id);
    return;
  }

  if (state.combatTurn !== "player" || state.gameOver) {
    return;
  }

  const targeting = getCombatTargeting();
  if (!targeting) {
    return;
  }

  if (targeting.kind === "attack") {
    const target = targeting.candidates.find((entry) => entry.unit.id === clickedUnit?.unit?.id);
    if (!target) {
      statusEl.textContent = `Combat View: ${unitName(targeting.attacker)} is targeting ${getAttackButtonLabel(targeting.profile.id)}. Click a highlighted enemy.`;
      updateControls();
      draw();
      return;
    }
    performPlayerAttack(targeting.attacker, target.unit, target.profile);
    return;
  }

  if (targeting.kind === "fireball") {
    const target = targeting.options.find((option) => option.x === tile?.x && option.y === tile?.y);
    if (!target) {
      statusEl.textContent = `Combat View: ${unitName(targeting.attacker)} is targeting Fireball. Click a highlighted tile to cast.`;
      updateControls();
      draw();
      return;
    }
    const result = useFireball(targeting.attacker, target.x, target.y);
    if (!result.ok) {
      statusEl.textContent = "Combat View: No valid Fireball target in range.";
      updateControls();
      draw();
      return;
    }
    clearTargetingMode();
    for (const entry of result.logEntries) {
      appendCombatLog(entry);
    }
    statusEl.textContent = `Combat View: Fireball detonated at (${result.target.x}, ${result.target.y}).`;
    checkCombatEnd();
    updateControls();
    draw();
  }
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
  const targeting = getCombatTargeting();
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
        capacity: getStackCapacity(getAliveUnits("player")),
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
          statuses: [...(unit.statuses || [])],
          hp: unit.hp,
          maxHp: unit.maxHp,
          armor: unit.armor,
          maxArmor: unit.maxArmor,
          moveCurrent: unit.currentCombatMp,
          moveMax: unit.maxCombatMp,
          moveSpentThisTurn: unit.combatMoveSpentThisTurn || 0,
          attack: unit.attack,
          damage: unit.damage,
          evasiveness: unit.evasiveness,
          mapPos: { x: state.stacks.player.x, y: state.stacks.player.y }
        }))
      },
      enemy: {
        race: state.stacks.enemy.race,
        count: getStackCount("enemy"),
        capacity: getStackCapacity(getAliveUnits("enemy")),
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
          statuses: [...(unit.statuses || [])],
          hp: unit.hp,
          maxHp: unit.maxHp,
          armor: unit.armor,
          maxArmor: unit.maxArmor,
          moveCurrent: unit.currentCombatMp,
          moveMax: unit.maxCombatMp,
          moveSpentThisTurn: unit.combatMoveSpentThisTurn || 0,
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
    targetingMode: Boolean(targeting),
    targeting: targeting
      ? targeting.kind === "attack"
        ? {
            kind: targeting.kind,
            attackerId: targeting.attacker.id,
            profileId: targeting.profile.id,
            candidateUnitIds: targeting.candidates.map((entry) => entry.unit.id)
          }
        : {
            kind: targeting.kind,
            attackerId: targeting.attacker.id,
            targetTiles: targeting.options.map((option) => ({ x: option.x, y: option.y }))
          }
      : null,
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
            statuses: [...(unit.statuses || [])],
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
            moveSpentThisTurn: unit.combatMoveSpentThisTurn || 0,
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
  setBattleFeedTab("enemy");
  clearCombatLog();
  state = initialState();
  updateRaceLabels();
  statusEl.textContent = `Map View: Random start positions + fog of war (vision radius ${state.fog.player.radius}). Base stack sizes are random (1-${BASE_STACK_CAPACITY}): ${state.stacks.player.token}${toSubscript(getStackCount("player"))} vs ${state.stacks.enemy.token}${toSubscript(getStackCount("enemy"))}.`;
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
    if (state.mode === "combat" && state.combat?.targeting) {
      clearTargetingMode();
      statusEl.textContent = "Combat View: Targeting canceled.";
      updateControls();
      draw();
    } else {
      playerCombatAttack();
    }
    return;
  }

  if (event.code === "KeyC") {
    playerCallOfBravery();
    return;
  }

  if (event.code === "KeyG") {
    playerFireball();
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

  if (event.code === "Escape" && state.mode === "combat" && state.combat?.targeting) {
    clearTargetingMode();
    statusEl.textContent = "Combat View: Targeting canceled.";
    updateControls();
    draw();
    return;
  }

  if (state.mode === "map") {
    moveMapStack(event.key);
  } else {
    moveCombatActiveUnit(event.key);
  }
});

attackBtn.addEventListener("click", playerCombatAttack);
if (archeryBtn) archeryBtn.addEventListener("click", playerArcheryAttack);
if (braveryBtn) braveryBtn.addEventListener("click", playerCallOfBravery);
if (fireballBtn) fireballBtn.addEventListener("click", playerFireball);
endTurnBtn.addEventListener("click", endTurn);
if (mapEndTurnBtn) mapEndTurnBtn.addEventListener("click", endTurn);
resetBtn.addEventListener("click", resetGame);
if (mapResetBtn) mapResetBtn.addEventListener("click", resetGame);
for (const button of battleFeedTabButtons) {
  button.addEventListener("click", () => {
    setBattleFeedTab(button.dataset.feedTab);
  });
}
playerRaceSelectEl.addEventListener("change", updateSetupRacePreviews);
enemyRaceSelectEl.addEventListener("change", updateSetupRacePreviews);
startGameBtnEl.addEventListener("click", startGameFromSetup);
board.addEventListener("mousemove", updateHoveredEntity);
board.addEventListener("click", handleCombatBoardClick);
board.addEventListener("mouseleave", clearHoveredEntity);

initializeSetupScreen();
setBattleFeedTab("enemy");
setGamePanelsVisible(false);
draw();
