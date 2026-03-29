export function hasAbility(unit, abilityId) {
  return Array.isArray(unit?.abilities) && unit.abilities.includes(abilityId);
}

export function manhattan(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function adjacentTargets(attacker, defenders) {
  return defenders.filter((unit) => manhattan(attacker, unit) === 1);
}

export function getChargeThreshold(unit) {
  return Math.max(1, Math.floor(unit.maxCombatMp / 2));
}

export function isChargeActive(unit) {
  return hasAbility(unit, "charge") && (unit.combatMoveSpentThisTurn || 0) >= getChargeThreshold(unit);
}

export function applyAttackModifiers(attacker, profile) {
  const nextProfile = { ...profile };

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
