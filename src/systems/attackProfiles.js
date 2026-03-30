export function hasAbility(unit, abilityId) {
  return Array.isArray(unit?.abilities) && unit.abilities.includes(abilityId);
}

export const BASE_STACK_CAPACITY = 8;
export const DEFAULT_FOREST_MOVE_COST = 2;
export const DEFAULT_NORMAL_FOREST_MOVE_COST = 1;
export const FIRE_STRIKE_BASE_IGNITE_CHANCE = 50;
export const FIRE_STRIKE_ATTACK_VALUE = 10;
export const FIREBALL_RANGE = 2;
export const FIREBALL_RADIUS = 1;
export const BURNING_TURNS = 3;
export const BURNING_DAMAGE_PER_TURN = 2;
export const CALL_OF_BRAVERY_TURNS = 3;

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function manhattan(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function adjacentTargets(attacker, defenders) {
  return defenders.filter((unit) => manhattan(attacker, unit) === 1);
}

export function sumAbilityCount(units, abilityId) {
  return (units || []).reduce((total, unit) => total + (hasAbility(unit, abilityId) ? 1 : 0), 0);
}

export function getLeadershipBonus(units) {
  return sumAbilityCount(units, "leadership");
}

export function getStackCapacityLimit(stack = {}) {
  const units = Array.isArray(stack.units) ? stack.units : [];
  const modifierBonus = Array.isArray(stack.capacityModifiers)
    ? stack.capacityModifiers.reduce((total, modifier) => total + (Number(modifier?.bonus) || 0), 0)
    : 0;

  return BASE_STACK_CAPACITY + getLeadershipBonus(units) + modifierBonus;
}

export function isForestTerrain(terrainType) {
  return terrainType === "forest";
}

export function hasForestry(unit) {
  return hasAbility(unit, "forestry");
}

export function getMapMovementCost(terrainType, unit = null) {
  const baseCosts = {
    plains: 1,
    forest: DEFAULT_FOREST_MOVE_COST,
    hill: 2,
    water: Infinity,
    open: 1,
    rough: 2,
    blocked: Infinity
  };

  const baseCost = baseCosts[terrainType] ?? 1;
  if (isForestTerrain(terrainType) && hasForestry(unit)) {
    return DEFAULT_NORMAL_FOREST_MOVE_COST;
  }
  return baseCost;
}

export function getCombatMovementCost(terrainType, unit = null) {
  const baseCosts = {
    open: 1,
    forest: DEFAULT_FOREST_MOVE_COST,
    rough: 2,
    blocked: Infinity
  };

  const baseCost = baseCosts[terrainType] ?? 1;
  if (isForestTerrain(terrainType) && hasForestry(unit)) {
    return DEFAULT_NORMAL_FOREST_MOVE_COST;
  }
  return baseCost;
}

export function createTimedStatus({
  id,
  sourceUnitId = null,
  targetSide = null,
  turnsRemaining,
  data = {}
} = {}) {
  return {
    id,
    sourceUnitId,
    targetSide,
    turnsRemaining,
    data: { ...data }
  };
}

export function tickTimedStatuses(statuses = []) {
  return statuses
    .map((status) => ({
      ...status,
      turnsRemaining: Math.max(0, (status.turnsRemaining ?? 0) - 1)
    }))
    .filter((status) => status.turnsRemaining > 0);
}

export function createCallOfBraveryStatus(sourceUnitId, targetSide = null) {
  return createTimedStatus({
    id: "call-of-bravery",
    sourceUnitId,
    targetSide,
    turnsRemaining: CALL_OF_BRAVERY_TURNS,
    data: {
      attack: 1,
      damage: 1,
      evasiveness: 1
    }
  });
}

export function hasCallOfBraveryAbility(unit) {
  return hasAbility(unit, "call-of-bravery");
}

export function isCallOfBraveryActive(statuses = [], sourceUnitId = null) {
  return statuses.some(
    (status) => status.id === "call-of-bravery" && (sourceUnitId == null || status.sourceUnitId === sourceUnitId)
  );
}

export function canUseCallOfBravery(unit, battle = {}) {
  if (!hasCallOfBraveryAbility(unit)) {
    return false;
  }
  if ((unit?.currentCombatMp ?? 0) <= 0) {
    return false;
  }
  const statuses = Array.isArray(battle.statuses) ? battle.statuses : [];
  return !isCallOfBraveryActive(statuses, unit?.id ?? null);
}

export function activateCallOfBravery(unit, battle = {}) {
  if (!canUseCallOfBravery(unit, battle)) {
    return {
      ok: false,
      statuses: Array.isArray(battle.statuses) ? [...battle.statuses] : []
    };
  }

  return {
    ok: true,
    statuses: [
      ...(Array.isArray(battle.statuses) ? battle.statuses : []),
      createCallOfBraveryStatus(unit.id, unit.side ?? null)
    ]
  };
}

export function getCallOfBraveryBonusForUnit(unit, statuses = []) {
  return statuses.reduce(
    (bonus, status) => {
      if (status.id !== "call-of-bravery") return bonus;
      if (status.targetSide != null && unit?.side != null && status.targetSide !== unit.side) return bonus;
      bonus.attack += Number(status.data?.attack) || 0;
      bonus.damage += Number(status.data?.damage) || 0;
      bonus.evasiveness += Number(status.data?.evasiveness) || 0;
      return bonus;
    },
    { attack: 0, damage: 0, evasiveness: 0 }
  );
}

export function hasFireStrikeAbility(unit) {
  return hasAbility(unit, "fire-strike");
}

export function hasFireProtection(unit) {
  return hasAbility(unit, "fire-protection");
}

export function hasFireImmunity(unit) {
  return hasAbility(unit, "fire-immunity");
}

export function getFireStrikeAttackValue() {
  return FIRE_STRIKE_ATTACK_VALUE;
}

export function getFireStrikeIgniteChance(defender, options = {}) {
  if (hasFireImmunity(defender)) {
    return 0;
  }

  const attackValue = Number(options.attackValue ?? FIRE_STRIKE_ATTACK_VALUE);
  const baseChance = Number(options.baseChance ?? FIRE_STRIKE_BASE_IGNITE_CHANCE);
  const rawChance = baseChance + (attackValue - (Number(defender?.evasiveness) || 0)) * 2;
  const protectedChance = hasFireProtection(defender) ? Math.floor(rawChance / 2) : rawChance;

  return clamp(protectedChance, 5, 95);
}

export function getBurningDamagePerTurn(defender) {
  if (hasFireImmunity(defender)) {
    return 0;
  }
  if (hasFireProtection(defender)) {
    return 1;
  }
  return BURNING_DAMAGE_PER_TURN;
}

export function createBurningStatus(sourceUnitId, targetSide = null, defender = null) {
  return createTimedStatus({
    id: "burning",
    sourceUnitId,
    targetSide,
    turnsRemaining: BURNING_TURNS,
    data: {
      damagePerTurn: getBurningDamagePerTurn(defender)
    }
  });
}

export function resolveFireStrike(attacker, defender, options = {}) {
  const chance = getFireStrikeIgniteChance(defender, options);
  const roll = typeof options.roll === "number" ? options.roll : Math.random();
  const ignited = roll < chance / 100;

  return {
    attackValue: Number(options.attackValue ?? FIRE_STRIKE_ATTACK_VALUE),
    chance,
    roll,
    ignited,
    blockedByImmunity: hasFireImmunity(defender),
    burnDamagePerTurn: getBurningDamagePerTurn(defender),
    burningStatus: ignited
      ? createBurningStatus(attacker?.id ?? null, defender?.side ?? null, defender)
      : null
  };
}

export function getFireballRange() {
  return FIREBALL_RANGE;
}

export function isWithinFireballRange(caster, target, range = FIREBALL_RANGE) {
  return Math.max(Math.abs((caster?.x ?? 0) - (target?.x ?? 0)), Math.abs((caster?.y ?? 0) - (target?.y ?? 0))) <= range;
}

export function getSquareAreaTiles(center, radius = FIREBALL_RADIUS, boardSize = 8) {
  const tiles = [];
  for (let y = center.y - radius; y <= center.y + radius; y += 1) {
    for (let x = center.x - radius; x <= center.x + radius; x += 1) {
      if (x >= 0 && y >= 0 && x < boardSize && y < boardSize) {
        tiles.push({ x, y });
      }
    }
  }
  return tiles;
}

export function getFireballAreaTiles(center, boardSize = 8) {
  return getSquareAreaTiles(center, FIREBALL_RADIUS, boardSize);
}

export function getFireballAffectedUnits(caster, target, units = [], boardSize = 8) {
  const inRange = isWithinFireballRange(caster, target, FIREBALL_RANGE);
  const areaTiles = inRange ? getFireballAreaTiles(target, boardSize) : [];
  const areaSet = new Set(areaTiles.map((tile) => `${tile.x},${tile.y}`));
  const affectedUnits = inRange
    ? units.filter((unit) => areaSet.has(`${unit.x},${unit.y}`))
    : [];

  return {
    inRange,
    areaTiles,
    affectedUnits
  };
}

export function getChargeThreshold(unit) {
  return Math.max(1, Math.floor(unit.maxCombatMp / 2));
}

export function isChargeActive(unit) {
  return hasAbility(unit, "charge") && (unit.combatMoveSpentThisTurn || 0) >= getChargeThreshold(unit);
}

export function applyAttackModifiers(attacker, profile, statuses = []) {
  const nextProfile = { ...profile };

  const braveryBonus = getCallOfBraveryBonusForUnit(attacker, statuses);
  nextProfile.attack += braveryBonus.attack;
  nextProfile.damage += braveryBonus.damage;
  if (braveryBonus.evasiveness !== 0) {
    nextProfile.evasiveness = (nextProfile.evasiveness ?? attacker.evasiveness ?? 0) + braveryBonus.evasiveness;
  }

  if (isChargeActive(attacker)) {
    nextProfile.attack += 2;
    nextProfile.damage += 2;
    nextProfile.modifiers = [...(nextProfile.modifiers || []), "charge"];
  }

  return nextProfile;
}

export function getMeleeProfile(attacker) {
  return applyAttackModifiers(attacker, {
    id: "melee",
    label: "melee",
    attack: attacker.attack,
    damage: attacker.damage,
    range: 1,
    targeting: "adjacent",
    priority: 0
  });
}

export function getArcheryProfile(attacker) {
  if (!hasAbility(attacker, "archery")) {
    return null;
  }

  const marksmanshipBonus = hasAbility(attacker, "marksmanship") ? 2 : 0;
  const rangeBonus = hasAbility(attacker, "marksmanship") ? 1 : 0;

  return applyAttackModifiers(attacker, {
    id: "archery",
    label: "shot",
    attack: Math.max(1, attacker.attack - 2 + marksmanshipBonus),
    damage: Math.max(1, attacker.damage - 2 + marksmanshipBonus),
    range: 2 + rangeBonus,
    targeting: "orthogonal-line",
    priority: 1
  });
}

export function isClearOrthogonalShot(attacker, defender, occupiedPositions = []) {
  if (attacker.x !== defender.x && attacker.y !== defender.y) {
    return false;
  }

  const occupied = new Set(occupiedPositions.map((pos) => `${pos.x},${pos.y}`));
  const dx = Math.sign(defender.x - attacker.x);
  const dy = Math.sign(defender.y - attacker.y);
  let x = attacker.x + dx;
  let y = attacker.y + dy;

  while (x !== defender.x || y !== defender.y) {
    if (occupied.has(`${x},${y}`)) {
      return false;
    }
    x += dx;
    y += dy;
  }

  return true;
}

export function getRangedTargets(attacker, defenders, occupiedPositions = []) {
  if (adjacentTargets(attacker, defenders).length > 0) {
    return [];
  }

  const archery = getArcheryProfile(attacker);
  if (!archery) {
    return [];
  }

  return defenders.filter((unit) => {
    const distance = manhattan(attacker, unit);
    if (distance <= 1 || distance > archery.range) {
      return false;
    }
    return isClearOrthogonalShot(attacker, unit, occupiedPositions);
  });
}

export function getAvailableAttackProfiles(attacker, defenders) {
  const profiles = [getMeleeProfile(attacker)];

  if (getArcheryProfile(attacker) && adjacentTargets(attacker, defenders).length === 0) {
    profiles.push(getArcheryProfile(attacker));
  }

  return profiles.sort((a, b) => a.priority - b.priority);
}

export function getTargetsForProfile(attacker, defenders, profile, occupiedPositions = []) {
  if (profile.targeting === "adjacent") {
    return adjacentTargets(attacker, defenders);
  }

  if (profile.targeting === "orthogonal-line") {
    return getRangedTargets(attacker, defenders, occupiedPositions);
  }

  return [];
}

export function getAttackCandidates(attacker, defenders, occupiedPositions = []) {
  const candidates = [];

  for (const profile of getAvailableAttackProfiles(attacker, defenders)) {
    for (const unit of getTargetsForProfile(attacker, defenders, profile, occupiedPositions)) {
      candidates.push({
        unit,
        profile,
        distance: manhattan(attacker, unit)
      });
    }
  }

  return candidates.sort(
    (a, b) => a.profile.priority - b.profile.priority || a.distance - b.distance || a.unit.id.localeCompare(b.unit.id)
  );
}
