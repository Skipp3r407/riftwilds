/**
 * Blocks fast travel / portal use during combat, dialogue, cutscenes, etc.
 */

import type { LiveWorldBridge } from "@/game/live-world/bridge";
import { getInputManager } from "@/game/live-world/input/input-manager";
import type { TravelBlockReason } from "@/game/world-travel/types";

export type TravelGuardContext = {
  inCombat?: boolean;
  cutsceneActive?: boolean;
  partyInvitePending?: boolean;
  loading?: boolean;
  bridge?: LiveWorldBridge | null;
};

const BLOCK_MESSAGES: Record<TravelBlockReason, string> = {
  combat: "Cannot travel during combat.",
  dialogue: "Finish the conversation before traveling.",
  cutscene: "Wait for the scene to finish.",
  interaction_menu: "Close the interaction menu first.",
  map_panel: "Close other panels before traveling.",
  loading: "Still loading the world…",
  party_pending: "Respond to the party travel invite first.",
  insufficient_credits: "Not enough Credits for this journey.",
  gateway_locked: "That Gateway Stone is not activated yet — walk there first.",
  region_locked: "This region is still sealed by your story.",
  same_region: "You are already there.",
  feature_disabled: "Live World travel is disabled.",
};

export function travelBlockMessage(reason: TravelBlockReason): string {
  return BLOCK_MESSAGES[reason];
}

export function getTravelBlockReason(
  ctx: TravelGuardContext = {},
): TravelBlockReason | null {
  if (ctx.loading) return "loading";
  if (ctx.inCombat) return "combat";
  if (ctx.cutsceneActive) return "cutscene";
  if (ctx.partyInvitePending) return "party_pending";

  const bridge = ctx.bridge;
  if (bridge) {
    if (bridge.dialogue.get()) return "dialogue";
    if (bridge.interactionMenu.get()) return "interaction_menu";
    if (!bridge.ready.get()) return "loading";
  }

  const panel = getInputManager().getActivePanel();
  // Map panel is OK for initiating fast travel from the map UI itself.
  if (panel && panel !== "map") {
    if (panel === "interaction") return "interaction_menu";
  }

  return null;
}

export function canTravelNow(ctx: TravelGuardContext = {}): {
  ok: boolean;
  reason: TravelBlockReason | null;
  message: string | null;
} {
  const reason = getTravelBlockReason(ctx);
  return {
    ok: reason === null,
    reason,
    message: reason ? travelBlockMessage(reason) : null,
  };
}
