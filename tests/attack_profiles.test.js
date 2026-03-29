import test from "node:test";
import assert from "node:assert/strict";

import {
  getChargeThreshold,
  getArcheryProfile,
  getAttackCandidates,
  getAvailableAttackProfiles,
  getMeleeProfile,
  getRangedTargets,
  isChargeActive,
  isClearOrthogonalShot
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
