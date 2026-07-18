/**
 * Safety hooks for inventory / quest / riftling / travel / marketplace.
 * Category A → immediate ledger paths; B/C → mark dirty for autosave.
 */

import { markProgressionDirty } from "@/lib/persistence/save-state";
import type { SaveCategory } from "@/lib/persistence/enums";

export type PersistenceHookEvent =
  | "credits_mutated"
  | "inventory_granted"
  | "inventory_consumed"
  | "equipment_changed"
  | "quest_progress"
  | "quest_completed"
  | "riftling_owned"
  | "riftling_care"
  | "travel_region"
  | "marketplace_listed"
  | "marketplace_sold"
  | "marketplace_purchased"
  | "position_moved"
  | "combat_started"
  | "combat_ended";

const EVENT_CATEGORY: Record<PersistenceHookEvent, SaveCategory> = {
  credits_mutated: "A_CRITICAL",
  inventory_granted: "A_CRITICAL",
  inventory_consumed: "A_CRITICAL",
  equipment_changed: "B_PROGRESSION",
  quest_progress: "B_PROGRESSION",
  quest_completed: "B_PROGRESSION",
  riftling_owned: "A_CRITICAL",
  riftling_care: "B_PROGRESSION",
  travel_region: "B_PROGRESSION",
  marketplace_listed: "A_CRITICAL",
  marketplace_sold: "A_CRITICAL",
  marketplace_purchased: "A_CRITICAL",
  position_moved: "B_PROGRESSION",
  combat_started: "B_PROGRESSION",
  combat_ended: "B_PROGRESSION",
};

/**
 * Call after domain mutations. Category A events are informational —
 * the actual durable write must already have gone through ledger APIs.
 */
export function notifyPersistenceHook(
  ownerKey: string,
  event: PersistenceHookEvent,
): { category: SaveCategory; immediate: boolean } {
  const category = EVENT_CATEGORY[event];
  const immediate = category === "A_CRITICAL";
  if (!immediate) {
    markProgressionDirty(ownerKey, category);
  } else {
    // Still mark dirty so autosave snapshots capture related play-state mirrors.
    markProgressionDirty(ownerKey, "A_CRITICAL");
  }
  return { category, immediate };
}

/** Marketplace / travel safety: block world leave mid-settlement (stub check). */
export function assertCanLeaveWorld(params: {
  marketplaceSettlementPending?: boolean;
  travelInProgress?: boolean;
}): { ok: true } | { ok: false; code: string; message: string } {
  if (params.marketplaceSettlementPending) {
    return {
      ok: false,
      code: "marketplace_settlement_pending",
      message: "Wait for marketplace settlement before leaving the world.",
    };
  }
  if (params.travelInProgress) {
    return {
      ok: false,
      code: "travel_in_progress",
      message: "Finish travel before logging out.",
    };
  }
  return { ok: true };
}
