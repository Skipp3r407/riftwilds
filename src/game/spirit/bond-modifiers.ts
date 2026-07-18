/**
 * Bond affects recovery timer length, Credits cost, and dialogue unlocks.
 * Never affects SOL pricing (SOL is flat / level-tiered only).
 */

import { SPIRIT_RECOVERY_CONFIG } from "@/game/spirit/config";

export type BondRecoveryModifiers = {
  bond: number;
  timerMul: number;
  creditsCostMul: number;
  specialDialogue: boolean;
  uniqueQuestEligible: boolean;
  summary: string;
};

export function bondRecoveryModifiers(bond: number): BondRecoveryModifiers {
  const b = Math.max(0, Math.min(100, bond));
  const t = b / 100;
  const timerMul = 1 + (SPIRIT_RECOVERY_CONFIG.bond.timerBonusMaxBps / 10_000) * t;
  const creditsCostMul = 1 - (SPIRIT_RECOVERY_CONFIG.bond.costReductionMaxBps / 10_000) * t;
  const specialDialogue = b >= SPIRIT_RECOVERY_CONFIG.bond.specialDialogueMinBond;
  const uniqueQuestEligible = b >= SPIRIT_RECOVERY_CONFIG.bond.uniqueQuestMinBond;
  let summary = "Standard bond recovery.";
  if (uniqueQuestEligible) summary = "Deep bond — unique Spirit Quest paths unlocked.";
  else if (specialDialogue) summary = "Strong bond — longer timer, gentler healer rates.";
  return {
    bond: b,
    timerMul,
    creditsCostMul,
    specialDialogue,
    uniqueQuestEligible,
    summary,
  };
}

export function applyBondToCountdownMs(baseMs: number, bond: number): number {
  if (!Number.isFinite(baseMs)) return baseMs;
  const { timerMul } = bondRecoveryModifiers(bond);
  return Math.round(baseMs * timerMul);
}

export function applyBondToCreditsCost(baseCredits: number, bond: number): number {
  const { creditsCostMul } = bondRecoveryModifiers(bond);
  const cfg = SPIRIT_RECOVERY_CONFIG;
  const raw = Math.round(baseCredits * creditsCostMul);
  return Math.max(cfg.creditsHealerMin, Math.min(cfg.creditsHealerMax, raw));
}

export function bondRecoveryDialogue(bond: number, petName: string): string {
  const mods = bondRecoveryModifiers(bond);
  if (mods.uniqueQuestEligible) {
    return `${petName}'s spirit answers you by name — the Realm opens a private path.`;
  }
  if (mods.specialDialogue) {
    return `${petName}'s bond steadies the lantern. The Spirit Keeper lowers the healer fee.`;
  }
  return `${petName} waits in soft light. Multiple recoveries remain available — SOL is never required.`;
}
