/**
 * Marketplace sellability for Riftlings under Spirit / Recovery rules.
 * Blocks dead, recovering, spirit, quest-locked — only HEALTHY may list.
 */

import type { RiftlingLifeState, SpiritRecord } from "@/game/spirit/types";
import { MARKETPLACE_BLOCKED_STATES } from "@/game/spirit/types";
import { activityGatesForState } from "@/game/spirit/states";

export type PetListingEligibility =
  | { ok: true }
  | {
      ok: false;
      reason:
        | "life_state_blocked"
        | "quest_locked"
        | "recovering"
        | "not_healthy"
        | "hardcore_memorial";
      message: string;
      lifeState: RiftlingLifeState;
    };

export function canListPetOnMarketplace(params: {
  lifeState: RiftlingLifeState;
  spirit?: SpiritRecord | null;
}): PetListingEligibility {
  const state = params.lifeState;
  const spirit = params.spirit;

  if (spirit?.questLocked || spirit?.activeQuestId) {
    return {
      ok: false,
      reason: "quest_locked",
      message: "Quest-locked Riftlings cannot be listed on the marketplace.",
      lifeState: state,
    };
  }

  if (state === "DOWNED" || state === "SPIRIT_FORM") {
    return {
      ok: false,
      reason: "recovering",
      message: "Recovering / spirit-form Riftlings cannot be sold.",
      lifeState: state,
    };
  }

  if (state === "PERMADEAD" || state === "MEMORIALIZED") {
    return {
      ok: false,
      reason: "hardcore_memorial",
      message: "Memorialized or permanently lost Riftlings cannot be sold.",
      lifeState: state,
    };
  }

  if (MARKETPLACE_BLOCKED_STATES.has(state) || state !== "HEALTHY") {
    return {
      ok: false,
      reason: state === "HEALTHY" ? "life_state_blocked" : "not_healthy",
      message: "Only healthy Riftlings can be listed. Care for them first.",
      lifeState: state,
    };
  }

  const gates = activityGatesForState(state);
  if (!gates.canListMarketplace) {
    return {
      ok: false,
      reason: "life_state_blocked",
      message: "This Riftling cannot be listed right now.",
      lifeState: state,
    };
  }

  return { ok: true };
}
