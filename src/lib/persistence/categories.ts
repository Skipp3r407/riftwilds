/**
 * Save categories — coordinate with economy core Credits ledger.
 *
 * A — Immediate: purchases, credits, ownership, marketplace settlement.
 * B — Layered autosave: quests, position, exploration, combat stats.
 * C — Soft: cosmetics, prefs, emote unlocks, HUD settings.
 */

import type { SaveCategory } from "@/lib/persistence/enums";
import {
  CATEGORY_B_AUTOSAVE_MS,
  CATEGORY_C_AUTOSAVE_MS,
} from "@/lib/persistence/config";

export type CategoryPolicy = {
  category: SaveCategory;
  persistence: "immediate_ledger" | "autosave" | "best_effort";
  intervalMs: number | null;
  neverLocalOnly: boolean;
  notes: string;
};

export const SAVE_CATEGORY_POLICIES: Record<SaveCategory, CategoryPolicy> = {
  A_CRITICAL: {
    category: "A_CRITICAL",
    persistence: "immediate_ledger",
    intervalMs: null,
    neverLocalOnly: true,
    notes:
      "Credits (CurrencyLedger), ownership transfers, marketplace sales, hatchery purchases. Use existing ledger + requestId idempotency. Never delay for autosave.",
  },
  B_PROGRESSION: {
    category: "B_PROGRESSION",
    persistence: "autosave",
    intervalMs: CATEGORY_B_AUTOSAVE_MS,
    neverLocalOnly: true,
    notes:
      "Quests, region progress, position, combat counters, tools. Server WorldSaveState + local cache. Crash must not lose permanent progression.",
  },
  C_COSMETIC: {
    category: "C_COSMETIC",
    persistence: "best_effort",
    intervalMs: CATEGORY_C_AUTOSAVE_MS,
    neverLocalOnly: false,
    notes:
      "HUD prefs, emote cosmetics, audio. localStorage OK as cache; server sync when available.",
  },
};

/** Domains that must never rely solely on localStorage. */
export const CRITICAL_LOCALSTORAGE_BAN = [
  "credits_balance",
  "owned_riftlings",
  "inventory_ownership",
  "marketplace_settlement",
  "permanent_quest_completion_rewards",
] as const;

export function shouldAutosaveNow(params: {
  category: SaveCategory;
  lastSavedAt: number | null;
  now?: number;
  dirty: boolean;
  force?: boolean;
}): boolean {
  const { category, lastSavedAt, dirty, force } = params;
  if (force) return true;
  if (!dirty && category !== "A_CRITICAL") return false;
  const policy = SAVE_CATEGORY_POLICIES[category];
  if (policy.persistence === "immediate_ledger") return dirty;
  if (policy.intervalMs == null) return dirty;
  const now = params.now ?? Date.now();
  if (lastSavedAt == null) return dirty;
  return now - lastSavedAt >= policy.intervalMs;
}
