export const BASE_HIT_CHANCE = 70;
export const MIN_HIT_CHANCE = 10;
export const MAX_HIT_CHANCE = 95;
export const DAMAGE_EXP_LAMBDA = 2.25;

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function getHitChance(attacker, defender) {
  const modified = BASE_HIT_CHANCE + (attacker.attack - defender.evasiveness) * 2;
  return clamp(modified, MIN_HIT_CHANCE, MAX_HIT_CHANCE);
}

export function rollDamage(attacker, percentRollFn) {
  const fn = typeof percentRollFn === "function" ? percentRollFn : () => Math.random();
  const raw = fn();
  const normalized = clamp(Number.isFinite(raw) ? raw : 0, 0, 0.999999);
  const biased = (1 - Math.exp(-DAMAGE_EXP_LAMBDA * normalized)) / (1 - Math.exp(-DAMAGE_EXP_LAMBDA));
  return Math.floor(biased * Math.max(1, attacker.damage)) + 1;
}

export function resolveStrike(attacker, defender, { percentRollFn, damageRollFn } = {}) {
  const hitChance = getHitChance(attacker, defender);
  const rollFn = typeof percentRollFn === "function" ? percentRollFn : () => Math.random();
  const percent = Number.isFinite(rollFn()) ? rollFn() : 0;
  const hitRoll = Math.floor(clamp(percent, 0, 0.999999) * 100) + 1;
  const hit = hitRoll <= hitChance;

  if (!hit) {
    return {
      hitChance,
      hitRoll,
      hit: false,
      rawDamage: 0,
      armorAbsorbed: 0,
      hpDamage: 0,
      eliminated: false
    };
  }

  const rawDamage = rollDamage(attacker, damageRollFn);
  const intendedArmorDamage = Math.floor(rawDamage * 0.8);
  const guaranteedHpDamage = rawDamage - intendedArmorDamage;
  const armorAbsorbed = Math.min(defender.armor, intendedArmorDamage);
  defender.armor -= armorAbsorbed;
  const spillToHp = intendedArmorDamage - armorAbsorbed;
  const hpDamage = Math.max(0, guaranteedHpDamage + spillToHp);
  defender.hp = Math.max(0, defender.hp - hpDamage);

  const eliminated = defender.hp <= 0;
  return {
    hitChance,
    hitRoll,
    hit: true,
    rawDamage,
    armorAbsorbed,
    hpDamage,
    eliminated
  };
}
