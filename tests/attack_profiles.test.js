import test from "node:test";
import assert from "node:assert/strict";

import {
  activateCallOfBravery,
  applyAttackModifiers,
  BURNING_TURNS,
  CALL_OF_BRAVERY_TURNS,
  createBurningStatus,
  createCallOfBraveryStatus,
  getChargeThreshold,
  getArcheryProfile,
  getAttackCandidates,
  getAvailableAttackProfiles,
  getBurningDamagePerTurn,
  getCombatMovementCost,
  getFireballAffectedUnits,
  getFireballAreaTiles,
  getFireStrikeIgniteChance,
  getCallOfBraveryBonusForUnit,
  getLeadershipBonus,
  getMeleeProfile,
  getMapMovementCost,
  getRangedTargets,
  getStackCapacityLimit,
  isChargeActive,
  isClearOrthogonalShot,
  resolveFireStrike,
  tickTimedStatuses
} from "../src/systems/attackProfiles.js";

function makeUnit(overrides = {}) {
  return {
    id: "U1",
    x: 1,
    y: 1,
    attack: 10,
    damage: 8,
    maxCombatMp: 3,
    combatMoveSpentThisTurn: 0,
    currentCombatMp: 1,
    side: "player",
    abilities: [],
    ...overrides
  };
}

test("recon-style archery uses reduced attack and damage at range 2", () => {
  const attacker = makeUnit({ attack: 11, damage: 7, abilities: ["archery"] });

  const profile = getArcheryProfile(attacker);

  assert.deepEqual(
    profile,
    {
      id: "archery",
      label: "shot",
      attack: 9,
      damage: 5,
      range: 2,
      targeting: "orthogonal-line",
      priority: 1
    }
  );
});

test("marksmanship increases archery range and restores attack and damage by 2", () => {
  const attacker = makeUnit({ attack: 14, damage: 11, abilities: ["archery", "marksmanship"] });

  const profile = getArcheryProfile(attacker);

  assert.equal(profile.range, 3);
  assert.equal(profile.attack, 14);
  assert.equal(profile.damage, 11);
});

test("ranged attacks are unavailable while an enemy is adjacent", () => {
  const attacker = makeUnit({ abilities: ["archery"] });
  const adjacentEnemy = makeUnit({ id: "E1", x: 1, y: 2 });
  const distantEnemy = makeUnit({ id: "E2", x: 1, y: 3 });

  const rangedTargets = getRangedTargets(attacker, [adjacentEnemy, distantEnemy]);
  const profiles = getAvailableAttackProfiles(attacker, [adjacentEnemy, distantEnemy]);
  const candidates = getAttackCandidates(attacker, [adjacentEnemy, distantEnemy]);

  assert.equal(rangedTargets.length, 0);
  assert.deepEqual(profiles.map((profile) => profile.id), ["melee"]);
  assert.deepEqual(candidates.map((candidate) => `${candidate.unit.id}:${candidate.profile.id}`), ["E1:melee"]);
});

test("archery can target an enemy in a clear orthogonal lane", () => {
  const attacker = makeUnit({ abilities: ["archery"] });
  const enemy = makeUnit({ id: "E1", x: 1, y: 3 });

  const candidates = getAttackCandidates(attacker, [enemy]);

  assert.equal(candidates.length, 1);
  assert.equal(candidates[0].unit.id, "E1");
  assert.equal(candidates[0].profile.id, "archery");
});

test("occupied tiles block orthogonal ranged shots", () => {
  const attacker = makeUnit({ abilities: ["archery"] });
  const enemy = makeUnit({ id: "E1", x: 1, y: 4 });

  assert.equal(isClearOrthogonalShot(attacker, enemy, [{ x: 1, y: 2 }]), false);
  assert.equal(getAttackCandidates(attacker, [enemy], [{ x: 1, y: 2 }]).length, 0);
});

test("charge activates after moving at least half of movement rounded down", () => {
  const brute = makeUnit({ abilities: ["charge"], maxCombatMp: 2, combatMoveSpentThisTurn: 1 });
  const captain = makeUnit({ abilities: ["charge"], maxCombatMp: 3, combatMoveSpentThisTurn: 1 });

  assert.equal(getChargeThreshold(brute), 1);
  assert.equal(getChargeThreshold(captain), 1);
  assert.equal(isChargeActive(brute), true);
  assert.equal(isChargeActive(captain), true);
});

test("charge increases attack and damage by 2 on attack profiles", () => {
  const attacker = makeUnit({
    attack: 15,
    damage: 16,
    abilities: ["charge"],
    maxCombatMp: 2,
    combatMoveSpentThisTurn: 1
  });

  const profile = getMeleeProfile(attacker);

  assert.equal(profile.attack, 17);
  assert.equal(profile.damage, 18);
  assert.deepEqual(profile.modifiers, ["charge"]);
});

test("stack capacity starts at 8 and leadership adds one per captain", () => {
  const stack = {
    units: [
      makeUnit({ abilities: ["leadership"] }),
      makeUnit({ abilities: ["leadership"] }),
      makeUnit({})
    ],
    capacityModifiers: [{ bonus: 2 }]
  };

  assert.equal(getLeadershipBonus(stack.units), 2);
  assert.equal(getStackCapacityLimit(stack), 12);
});

test("forestry lowers forest movement cost on both map and combat terrain", () => {
  const centaur = makeUnit({ abilities: ["forestry"] });

  assert.equal(getMapMovementCost("forest", centaur), 1);
  assert.equal(getCombatMovementCost("forest", centaur), 1);
  assert.equal(getMapMovementCost("forest", makeUnit()), 2);
  assert.equal(getCombatMovementCost("forest", makeUnit()), 2);
});

test("call of bravery creates a three turn battle buff and blocks duplicate activation", () => {
  const captain = makeUnit({ id: "C1", abilities: ["call-of-bravery"], currentCombatMp: 2 });
  const battle = { statuses: [createCallOfBraveryStatus("C1", "player")] };

  assert.equal(activateCallOfBravery(captain, battle).ok, false);
  assert.equal(createCallOfBraveryStatus("C1").turnsRemaining, CALL_OF_BRAVERY_TURNS);
});

test("call of bravery adds the expected allied stat bonuses and expires on tick", () => {
  const captain = makeUnit({ id: "C1", abilities: ["call-of-bravery"], currentCombatMp: 2 });
  const battle = activateCallOfBravery(captain, { statuses: [] });
  const bonus = applyAttackModifiers(captain, { id: "melee", label: "melee", attack: 10, damage: 8, range: 1, targeting: "adjacent", priority: 0 }, battle.statuses);
  const unitBonus = getCallOfBraveryBonusForUnit(captain, battle.statuses);

  assert.equal(battle.ok, true);
  assert.equal(battle.statuses[0].turnsRemaining, CALL_OF_BRAVERY_TURNS);
  assert.equal(bonus.attack, 11);
  assert.equal(bonus.damage, 9);
  assert.equal(unitBonus.attack, 1);
  assert.equal(unitBonus.damage, 1);
  assert.equal(unitBonus.evasiveness, 1);
  assert.equal(tickTimedStatuses(tickTimedStatuses(tickTimedStatuses(battle.statuses))).length, 0);
});

test("fire strike ignition is 50 percent on evenly matched units and respects protection and immunity", () => {
  const attacker = makeUnit({ abilities: ["fire-strike"] });
  const defender = makeUnit({ evasiveness: 10, abilities: [] });
  const protectedDefender = makeUnit({ evasiveness: 10, abilities: ["fire-protection"] });
  const immuneDefender = makeUnit({ evasiveness: 10, abilities: ["fire-immunity"] });

  assert.equal(getFireStrikeIgniteChance(defender, { attackValue: 10 }), 50);
  assert.equal(getFireStrikeIgniteChance(protectedDefender, { attackValue: 10 }), 25);
  assert.equal(getFireStrikeIgniteChance(immuneDefender, { attackValue: 10 }), 0);
  assert.equal(getBurningDamagePerTurn(defender), 2);
  assert.equal(getBurningDamagePerTurn(protectedDefender), 1);
  assert.equal(getBurningDamagePerTurn(immuneDefender), 0);
  assert.equal(attacker.abilities.includes("fire-strike"), true);
  assert.equal(resolveFireStrike(attacker, immuneDefender, { roll: 0.0 }).blockedByImmunity, true);
});

test("burning status lasts three turns and carries the resolved damage per turn", () => {
  const defender = makeUnit({ abilities: ["fire-protection"] });
  const status = createBurningStatus("A1", "enemy", defender);

  assert.equal(status.turnsRemaining, BURNING_TURNS);
  assert.equal(status.data.damagePerTurn, 1);
});

test("fireball targets a 3x3 square at quarter-field range and includes friendly fire", () => {
  const caster = makeUnit({ x: 3, y: 3 });
  const target = { x: 5, y: 3 };
  const units = [
    { id: "A", x: 4, y: 2 },
    { id: "B", x: 5, y: 3 },
    { id: "C", x: 6, y: 4 },
    { id: "D", x: 0, y: 0 }
  ];

  const tiles = getFireballAreaTiles(target, 8);
  const affected = getFireballAffectedUnits(caster, target, units, 8);

  assert.equal(tiles.length, 9);
  assert.equal(affected.inRange, true);
  assert.deepEqual(
    affected.affectedUnits.map((unit) => unit.id).sort(),
    ["A", "B", "C"]
  );
});

test("fireball respects range and clips at the battlefield edge", () => {
  const caster = makeUnit({ x: 1, y: 1 });
  const target = { x: 7, y: 7 };
  const affected = getFireballAffectedUnits(caster, target, [{ id: "A", x: 7, y: 7 }], 8);

  assert.equal(affected.inRange, false);
  assert.equal(affected.areaTiles.length, 0);
  assert.equal(affected.affectedUnits.length, 0);
});
