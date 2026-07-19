/**
 * Authoritative combat formulas for Riftwilds TCG.
 * Collection cosmetics / companion level never enter these calculations.
 */

import type { TcgElement } from "@/content/tcg/types";

/** Stat clamps from the AAA card-stat brief. */
export const STAT_RANGES = {
  cost: { min: 1, max: 10 },
  attack: { min: 0, max: 15 },
  health: { min: 1, max: 30 },
  defense: { min: 0, max: 10 },
  speed: { min: 1, max: 10 },
} as const;

/** Element triangle — ±15% when strong / weak. Neutral when unlisted. */
export const ELEMENT_STRENGTH: Partial<Record<TcgElement, TcgElement[]>> = {
  fire: ["metal", "nature"],
  water: ["fire", "earth"],
  nature: ["water", "earth"],
  earth: ["storm", "fire"],
  storm: ["water", "metal"],
  crystal: ["shadow", "poison"],
  shadow: ["spirit", "light"],
  light: ["shadow", "void"],
  spirit: ["arcane", "poison"],
  arcane: ["spirit", "metal"],
  poison: ["nature", "water"],
  metal: ["crystal", "earth"],
  celestial: ["void", "shadow"],
  void: ["celestial", "light"],
};

export const ELEMENT_MOD = {
  strong: 1.15,
  weak: 0.85,
  neutral: 1,
} as const;

/** Minimum damage after armor when attacker has ATK > 0. */
export const MIN_DAMAGE_WHEN_ATTACKING = 1;

export function clampStat(
  value: number,
  range: { min: number; max: number },
): number {
  return Math.max(range.min, Math.min(range.max, Math.round(value)));
}

export function elementMultiplier(
  attacker: string | null | undefined,
  defender: string | null | undefined,
): number {
  if (!attacker || !defender) return ELEMENT_MOD.neutral;
  const a = attacker.toLowerCase() as TcgElement;
  const d = defender.toLowerCase() as TcgElement;
  if ((ELEMENT_STRENGTH[a] ?? []).includes(d)) return ELEMENT_MOD.strong;
  // Reverse lookup: if defender is strong vs attacker, attacker is weak.
  if ((ELEMENT_STRENGTH[d] ?? []).includes(a)) return ELEMENT_MOD.weak;
  return ELEMENT_MOD.neutral;
}

/**
 * Core strike formula:
 * raw = max(0, atk - def)
 * scaled by element
 * if atk > 0 → at least MIN_DAMAGE_WHEN_ATTACKING
 */
export function computeStrikeDamage(input: {
  attack: number;
  defense: number;
  attackerElement?: string | null;
  defenderElement?: string | null;
}): number {
  const atk = Math.max(0, input.attack);
  if (atk <= 0) return 0;
  const def = Math.max(0, input.defense);
  const raw = Math.max(0, atk - def);
  const mod = elementMultiplier(input.attackerElement, input.defenderElement);
  const scaled = Math.round(raw * mod);
  return Math.max(MIN_DAMAGE_WHEN_ATTACKING, scaled);
}

/** Speed DESC, then instanceId ASC — deterministic ties. */
export function compareCombatSpeed(
  a: { speed: number; instanceId: string },
  b: { speed: number; instanceId: string },
): number {
  if (b.speed !== a.speed) return b.speed - a.speed;
  return a.instanceId.localeCompare(b.instanceId);
}

/** Soft power budget used by balance warnings (not a hard ban). */
export function estimatePowerBudget(input: {
  cost: number;
  attack: number;
  health: number;
  defense: number;
  speed: number;
  keywordCount: number;
}): number {
  const cost = Math.max(1, input.cost);
  const body =
    input.attack * 1.1 +
    input.health * 0.9 +
    input.defense * 0.7 +
    input.speed * 0.35;
  return Math.round(body / cost + input.keywordCount * 1.5);
}
