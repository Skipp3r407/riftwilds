/**
 * Versioned card-stat overlays — merge onto raw JSON without mutating source files.
 * Source of truth for authored overrides: data/migrations/card-stats-v2.json
 */

import type { TcgCard, TcgRole } from "@/content/tcg/types";
import { canonicalizeRole } from "@/content/tcg/framework/roles";
import {
  clampStat,
  STAT_RANGES,
} from "@/game/tcg/combat/formulas";
import { normalizeKeywordList } from "@/game/tcg/combat/keywords";

export type CardStatOverlay = {
  attack?: number;
  health?: number;
  defense?: number;
  speed?: number;
  role?: string;
  keywords?: string[];
  energyCost?: number;
  passive?: string | null;
  notes?: string;
};

export type CardStatMigrationBundle = {
  version: number;
  schema: string;
  generatedAt: string;
  description: string;
  /** Never mutate competitive power from cosmetics. */
  competitiveMode: "base_stats_only";
  overlays: Record<string, CardStatOverlay>;
};

export const EMPTY_STAT_MIGRATION: CardStatMigrationBundle = {
  version: 2,
  schema: "riftwilds.tcg.card-stats.v2",
  generatedAt: new Date(0).toISOString(),
  description: "Empty migration",
  competitiveMode: "base_stats_only",
  overlays: {},
};

let _bundle: CardStatMigrationBundle | null = null;

export function setStatMigrationBundle(bundle: CardStatMigrationBundle): void {
  _bundle = bundle;
}

export function getStatMigrationBundle(): CardStatMigrationBundle {
  return _bundle ?? EMPTY_STAT_MIGRATION;
}

export function applyStatOverlay(
  card: TcgCard,
  overlay?: CardStatOverlay | null,
): TcgCard {
  if (!overlay) return card;
  const next: TcgCard = { ...card };

  if (typeof overlay.energyCost === "number") {
    next.energyCost = clampStat(overlay.energyCost, STAT_RANGES.cost);
  }
  if (typeof overlay.attack === "number") {
    next.attack = clampStat(overlay.attack, {
      min: STAT_RANGES.attack.min,
      max: STAT_RANGES.attack.max,
    });
  }
  if (typeof overlay.health === "number") {
    next.health = clampStat(overlay.health, STAT_RANGES.health);
  }
  if (typeof overlay.defense === "number") {
    next.defense = clampStat(overlay.defense, {
      min: STAT_RANGES.defense.min,
      max: STAT_RANGES.defense.max,
    });
  }
  if (typeof overlay.speed === "number") {
    next.speed = clampStat(overlay.speed, STAT_RANGES.speed);
  }
  if (overlay.role) {
    next.role = canonicalizeRole(overlay.role) as TcgRole;
  }
  if (overlay.keywords) {
    next.keywords = normalizeKeywordList([
      ...card.keywords,
      ...overlay.keywords,
    ]);
  }
  if (overlay.passive !== undefined) {
    next.passive = overlay.passive;
  }
  if (overlay.notes) {
    next.balanceNotes = [card.balanceNotes, overlay.notes]
      .filter(Boolean)
      .join(" | ");
  }
  return next;
}

/** Apply v2 overlays for a single card id. */
export function migrateCardStats(card: TcgCard): TcgCard {
  const bundle = getStatMigrationBundle();
  return applyStatOverlay(card, bundle.overlays[card.id]);
}

export function migrateAllCardStats(cards: TcgCard[]): TcgCard[] {
  return cards.map(migrateCardStats);
}
