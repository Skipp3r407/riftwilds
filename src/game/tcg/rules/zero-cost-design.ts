/**
 * Zero-cost card design gates — anti-abuse for free utilities.
 * Collectible 0-cost cards must stay tiny utility / starter tools.
 */

import type { TcgCard } from "@/content/tcg/types";
import { resolveCardCategory } from "@/content/tcg/framework/card-categories";
import { isCombatEligibleCard } from "@/content/tcg/framework/combat-eligibility";

/** Forbidden keywords on collectible 0-cost cards. */
export const ZERO_COST_FORBIDDEN_KEYWORDS = [
  "charge",
  "rush",
  "swift",
  "siege",
  "flying",
  "pierce",
  "echo",
] as const;

export type ZeroCostAudit = {
  ok: boolean;
  reasons: string[];
};

/**
 * Validate a collectible combat card claiming energyCost 0.
 * Tokens / commanders are exempt (engine / hero-slot specials).
 */
export function auditZeroCostCard(card: TcgCard): ZeroCostAudit {
  const reasons: string[] = [];
  if (card.energyCost !== 0) {
    return { ok: true, reasons: [] };
  }
  if (card.isToken) return { ok: true, reasons: [] };

  const cat = resolveCardCategory(card.type, card.id);
  if (cat === "commander") return { ok: true, reasons: [] };
  if (!isCombatEligibleCard(card.id, card.type)) {
    return { ok: true, reasons: [] };
  }

  const rarity = card.rarity.toLowerCase();
  if (["legendary", "mythic", "ancient", "founder"].includes(rarity)) {
    reasons.push("0-cost must not be Legendary/Mythic/Ancient/Founder");
  }

  if (cat === "evolution") {
    reasons.push("0-cost must not be an Evolution");
  }

  const atk = card.attack ?? 0;
  const hp = card.health ?? 0;
  if (cat === "companion") {
    if (atk > 1) reasons.push("0-cost companion attack must be ≤ 1");
    if (hp > 2) reasons.push("0-cost companion health must be ≤ 2");
  }

  const kw = card.keywords.map((k) => k.toLowerCase());
  for (const bad of ZERO_COST_FORBIDDEN_KEYWORDS) {
    if (kw.includes(bad)) {
      reasons.push(`0-cost must not have keyword ${bad}`);
    }
  }

  for (const ab of card.abilities) {
    for (const fx of ab.effects) {
      const v = fx.value ?? 0;
      if (fx.op === "deal_damage" && v > 1) {
        reasons.push("0-cost damage must be ≤ 1");
      }
      if (fx.op === "heal" && v > 1) {
        reasons.push("0-cost heal must be ≤ 1");
      }
      if (fx.op === "draw" && v > 0) {
        reasons.push("0-cost must not draw cards");
      }
      if (fx.op === "gain_energy" && v > 0) {
        reasons.push("0-cost must not grant Energy (Rift Spark is the exception token)");
      }
    }
  }

  return { ok: reasons.length === 0, reasons };
}

/** Target share of the launch/combat pool for 0-cost utilities. */
export const ZERO_COST_POOL_TARGET = {
  minPct: 0.05,
  maxPct: 0.1,
  /** Soft constructed cap — also in battle-rules-config.deck.maxZeroCostPerDeck */
  defaultDeckCap: 4,
} as const;
