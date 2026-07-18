/**
 * Recovery fee math — Credits (bond-aware) + optional SOL (level-tiered / flat, capped).
 * SOL NEVER uses rarity, emotion, market value, or pet count.
 */

import { SPIRIT_RECOVERY_CONFIG } from "@/game/spirit/config";
import { applyBondToCreditsCost } from "@/game/spirit/bond-modifiers";
import type { InsurancePolicy, SolRecallQuote } from "@/game/spirit/types";
import { lamportsToSolString } from "@/lib/items/lamports";

export function quoteCreditsHealer(params: {
  bond: number;
  insurance?: InsurancePolicy | null;
}): { credits: number; free: boolean; insuranceApplied: boolean } {
  if (params.insurance && params.insurance.freeRecoveriesRemaining > 0) {
    return { credits: 0, free: true, insuranceApplied: true };
  }
  let credits = applyBondToCreditsCost(SPIRIT_RECOVERY_CONFIG.creditsHealerBase, params.bond);
  let insuranceApplied = false;
  if (params.insurance && params.insurance.costReductionBps > 0) {
    credits = Math.max(
      SPIRIT_RECOVERY_CONFIG.creditsHealerMin,
      Math.floor(credits * (1 - params.insurance.costReductionBps / 10_000)),
    );
    insuranceApplied = true;
  }
  return { credits, free: false, insuranceApplied };
}

/**
 * Quote Instant Spirit Recall SOL.
 * Explicitly ignores rarity / emotion / market value / owned pet count.
 */
export function quoteSolInstantRecall(params: {
  level: number;
  /** Intentionally unused — documented to prevent accidental pricing. */
  rarity?: string;
  marketValueLamports?: bigint;
  emotionScore?: number;
  ownedPetCount?: number;
}): SolRecallQuote {
  void params.rarity;
  void params.marketValueLamports;
  void params.emotionScore;
  void params.ownedPetCount;

  const cfg = SPIRIT_RECOVERY_CONFIG.solRecall;
  let lamports = cfg.flatLamports;
  let tier: SolRecallQuote["tier"] = "FLAT";

  if (cfg.mode === "LEVEL_TIERED") {
    const level = Math.max(1, Math.floor(params.level));
    if (level <= 20) {
      lamports = cfg.tiers[0].lamports;
      tier = "L1_20";
    } else if (level <= 50) {
      lamports = cfg.tiers[1].lamports;
      tier = "L21_50";
    } else {
      lamports = cfg.tiers[2].lamports;
      tier = "L51_PLUS";
    }
  }

  const capped = lamports > cfg.maxLamports;
  if (capped) lamports = cfg.maxLamports;

  return {
    lamports,
    solDisplay: lamportsToSolString(lamports),
    tier,
    capped,
    rarityIgnored: true,
    marketValueIgnored: true,
    emotionIgnored: true,
  };
}

/** Prove rarity does not change SOL quote (test helper surface). */
export function solQuoteIgnoresRarity(level: number): boolean {
  const a = quoteSolInstantRecall({ level, rarity: "COMMON" });
  const b = quoteSolInstantRecall({ level, rarity: "MYTHIC", marketValueLamports: 10_000_000_000n });
  return a.lamports === b.lamports && a.tier === b.tier;
}
