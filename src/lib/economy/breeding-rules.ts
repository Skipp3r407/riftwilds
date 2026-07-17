/**
 * Controlled breeding rules — caps, cooldowns, rising fees, fee split.
 * Breeding never guarantees rarity.
 */

import { solToLamports } from "@/lib/items/lamports";
import { EGG_SUPPLY_GLOBAL } from "@/lib/economy/egg-supply";

export const BREEDING_RULES = {
  usesPerPet: { min: 3, max: 5, active: 5 },
  cooldownDays: { min: 7, max: 14, active: 10 },
  /** Minimum pet age (hours) before first breeding use. */
  minAgeHours: 72,
  /** Minimum bond score (0–100). */
  minBond: 40,
  /** Visible generation number on offspring eggs/pets. */
  showGenerationNumbers: true,
  /** Hard rule: rarity rolls stay probabilistic — never guaranteed. */
  rarityGuaranteed: false,
  maxEggsPerWeekGlobal: EGG_SUPPLY_GLOBAL.maxBreedingEggsPerWeekGlobal,
  /** Rising fee table per use index (0-based). Configurable SOL strings. */
  feeSolByUseIndex: ["0.05", "0.08", "0.12", "0.20", "0.35"] as const,
  /**
   * Fee split of breeding fee (not marketplace sale).
   * Project reserve / holder vault / development / community events.
   */
  feeSplitBps: {
    projectReserve: 5000,
    holderVault: 2500,
    development: 1500,
    communityEvents: 1000,
  },
  disclosures: {
    rarity:
      "Breeding cannot guarantee rarity, species, or traits. Outcomes use published odds ranges only.",
    fee: "Breeding fees rise with each use and are non-refundable once the attempt is committed.",
  },
} as const;

export type BreedingEligibilityInput = {
  ageHours: number;
  bond: number;
  breedingUsesRemaining: number;
  lastBredAt: string | null;
  lifecycle?: string;
  nowMs?: number;
};

export type BreedingEligibilityResult =
  | { ok: true; nextFeeLamports: bigint; usesRemainingAfter: number; cooldownEndsAt: string | null }
  | { ok: false; reason: string };

export function breedingFeeLamportsForUseIndex(useIndex: number): bigint {
  const table = BREEDING_RULES.feeSolByUseIndex;
  const idx = Math.min(Math.max(0, useIndex), table.length - 1);
  return solToLamports(table[idx]!);
}

export function cooldownEndsAt(lastBredAt: string | null, nowMs = Date.now()): string | null {
  if (!lastBredAt) return null;
  const ms = BREEDING_RULES.cooldownDays.active * 24 * 60 * 60 * 1000;
  const ends = new Date(lastBredAt).getTime() + ms;
  return ends > nowMs ? new Date(ends).toISOString() : null;
}

export function evaluateBreedingEligibility(
  pet: BreedingEligibilityInput,
  /** Uses already consumed (0 = first breeding). */
  usesConsumed: number,
): BreedingEligibilityResult {
  const nowMs = pet.nowMs ?? Date.now();
  if (pet.lifecycle && ["CRITICAL", "MEMORIALIZED", "RETIRED", "DORMANT"].includes(pet.lifecycle)) {
    return { ok: false, reason: "pet_not_eligible_lifecycle" };
  }
  if (pet.ageHours < BREEDING_RULES.minAgeHours) {
    return { ok: false, reason: "min_age_not_met" };
  }
  if (pet.bond < BREEDING_RULES.minBond) {
    return { ok: false, reason: "min_bond_not_met" };
  }
  if (pet.breedingUsesRemaining <= 0) {
    return { ok: false, reason: "no_uses_remaining" };
  }
  if (usesConsumed >= BREEDING_RULES.usesPerPet.active) {
    return { ok: false, reason: "use_cap_reached" };
  }
  const cd = cooldownEndsAt(pet.lastBredAt, nowMs);
  if (cd) {
    return { ok: false, reason: "cooldown_active" };
  }
  return {
    ok: true,
    nextFeeLamports: breedingFeeLamportsForUseIndex(usesConsumed),
    usesRemainingAfter: pet.breedingUsesRemaining - 1,
    cooldownEndsAt: null,
  };
}

export function splitBreedingFee(feeLamports: bigint): {
  projectReserve: bigint;
  holderVault: bigint;
  development: bigint;
  communityEvents: bigint;
} {
  const s = BREEDING_RULES.feeSplitBps;
  const projectReserve = (feeLamports * BigInt(s.projectReserve)) / 10_000n;
  const holderVault = (feeLamports * BigInt(s.holderVault)) / 10_000n;
  const development = (feeLamports * BigInt(s.development)) / 10_000n;
  const communityEvents = feeLamports - projectReserve - holderVault - development;
  return { projectReserve, holderVault, development, communityEvents };
}

export function serializeBreedingRules() {
  return {
    usesPerPet: BREEDING_RULES.usesPerPet,
    cooldownDays: BREEDING_RULES.cooldownDays,
    minAgeHours: BREEDING_RULES.minAgeHours,
    minBond: BREEDING_RULES.minBond,
    showGenerationNumbers: BREEDING_RULES.showGenerationNumbers,
    rarityGuaranteed: BREEDING_RULES.rarityGuaranteed,
    maxEggsPerWeekGlobal: BREEDING_RULES.maxEggsPerWeekGlobal,
    feeSolByUseIndex: [...BREEDING_RULES.feeSolByUseIndex],
    feeSplitBps: { ...BREEDING_RULES.feeSplitBps },
    disclosures: { ...BREEDING_RULES.disclosures },
  };
}
