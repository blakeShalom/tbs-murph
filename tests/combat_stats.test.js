import test from "node:test";
import assert from "node:assert/strict";
import {
  BASE_HIT_CHANCE,
  MAX_HIT_CHANCE,
  MIN_HIT_CHANCE,
  getHitChance,
  resolveStrike,
  rollDamage
} from "../src/systems/combatStats.js";

function makeUnit(overrides = {}) {
  return {
    hp: 20,
    armor: 10,
    attack: 10,
    damage: 10,
    evasiveness: 10,
    ...overrides
  };
}

test("hit chance uses 70% base when attack equals evasiveness", () => {
  const attacker = makeUnit({ attack: 12 });
  const defender = makeUnit({ evasiveness: 12 });
  assert.equal(getHitChance(attacker, defender), BASE_HIT_CHANCE);
});

test("hit chance clamps to maximum 95%", () => {
  const attacker = makeUnit({ attack: 20 });
  const defender = makeUnit({ evasiveness: 1 });
  assert.equal(getHitChance(attacker, defender), MAX_HIT_CHANCE);
});

test("hit chance clamps to minimum 10%", () => {
  const attacker = makeUnit({ attack: 1 });
  const defender = makeUnit({ evasiveness: 40 });
  assert.equal(getHitChance(attacker, defender), MIN_HIT_CHANCE);
});

test("miss keeps defender armor and hp unchanged", () => {
  const attacker = makeUnit({ attack: 1, damage: 20 });
  const defender = makeUnit({ hp: 24, armor: 11, evasiveness: 20 });
  const result = resolveStrike(attacker, defender, {
    percentRollFn: () => 0.99,
    damageRollFn: () => 0.99
  });

  assert.equal(result.hit, false);
  assert.equal(defender.hp, 24);
  assert.equal(defender.armor, 11);
});

test("armor absorbs up to 80% of raw damage before hp damage", () => {
  const attacker = makeUnit({ attack: 20, damage: 20 });
  const defender = makeUnit({ hp: 30, armor: 20, evasiveness: 1 });
  const result = resolveStrike(attacker, defender, {
    percentRollFn: () => 0.0,
    damageRollFn: () => 0.99
  });

  assert.equal(result.hit, true);
  assert.equal(result.rawDamage, 20);
  assert.equal(result.armorAbsorbed, 16);
  assert.equal(result.hpDamage, 4);
  assert.equal(defender.armor, 4);
  assert.equal(defender.hp, 26);
});

test("low armor only absorbs what remains and spillover hits hp", () => {
  const attacker = makeUnit({ attack: 20, damage: 20 });
  const defender = makeUnit({ hp: 18, armor: 3, evasiveness: 1 });
  const result = resolveStrike(attacker, defender, {
    percentRollFn: () => 0.0,
    damageRollFn: () => 0.99
  });

  assert.equal(result.armorAbsorbed, 3);
  assert.equal(result.hpDamage, 17);
  assert.equal(defender.armor, 0);
  assert.equal(defender.hp, 1);
});

test("strike can eliminate defender and clamps hp at zero", () => {
  const attacker = makeUnit({ attack: 20, damage: 20 });
  const defender = makeUnit({ hp: 5, armor: 0, evasiveness: 1 });
  const result = resolveStrike(attacker, defender, {
    percentRollFn: () => 0.0,
    damageRollFn: () => 0.99
  });

  assert.equal(result.eliminated, true);
  assert.equal(defender.hp, 0);
});

test("strike does not apply immediate retaliation damage to attacker", () => {
  const attacker = makeUnit({ hp: 22, armor: 7, attack: 20, damage: 8 });
  const defender = makeUnit({ hp: 22, armor: 7, evasiveness: 1 });
  resolveStrike(attacker, defender, {
    percentRollFn: () => 0.0,
    damageRollFn: () => 0.5
  });

  assert.equal(attacker.hp, 22);
  assert.equal(attacker.armor, 7);
});

test("damage roll spans 1..max damage inclusive", () => {
  const attacker = makeUnit({ damage: 12 });
  assert.equal(rollDamage(attacker, () => 0.0), 1);
  assert.equal(rollDamage(attacker, () => 0.9999), 12);
});
