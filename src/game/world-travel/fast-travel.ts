/**
 * Fast travel between unlocked (activated) Gateway Stones.
 * Walking remains primary; Gateways unlock after physical discovery.
 * Fees: Credits or free early — never SOL.
 */

import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { REGION_BY_SLUG } from "@/game/world-maps/regions";
import {
  fastTravelFeeCredits,
  GATEWAY_BY_REGION,
  isRegionGatewayActivated,
  listActivatedGateways,
} from "@/game/world-travel/gateways";
import { isRegionUnlocked, travelProgressToUnlockInput } from "@/game/world-travel/unlocks";
import {
  canTravelNow,
  travelBlockMessage,
  type TravelGuardContext,
} from "@/game/world-travel/travel-guards";
import type { FastTravelPreview, TravelBlockReason } from "@/game/world-travel/types";
import { loadLivePlayState, saveLivePlayState } from "@/game/npcs/play-state";

export function previewFastTravel(
  fromRegionId: string,
  toRegionId: string,
  guard: TravelGuardContext = {},
  demoCredits?: number,
): FastTravelPreview {
  const to = REGION_BY_SLUG[toRegionId];
  const fromGw = GATEWAY_BY_REGION[fromRegionId];
  const toGw = GATEWAY_BY_REGION[toRegionId];
  const { fee, free } = fastTravelFeeCredits(fromRegionId, toRegionId);

  let blocked: TravelBlockReason | null = null;
  if (!featureFlagDefaults.PLAYABLE_LIVE_WORLD_ENABLED) {
    blocked = "feature_disabled";
  } else if (fromRegionId === toRegionId) {
    blocked = "same_region";
  } else if (!isRegionGatewayActivated(fromRegionId) || !isRegionGatewayActivated(toRegionId)) {
    blocked = "gateway_locked";
  } else if (!isRegionUnlocked(toRegionId, travelProgressToUnlockInput())) {
    blocked = "region_locked";
  } else {
    const guardResult = canTravelNow(guard);
    if (!guardResult.ok) blocked = guardResult.reason;
  }

  if (!blocked && !free && typeof demoCredits === "number" && demoCredits < fee) {
    blocked = "insufficient_credits";
  }

  return {
    fromRegionId,
    toRegionId,
    fromGatewayId: fromGw?.id ?? `gateway-${fromRegionId}`,
    toGatewayId: toGw?.id ?? `gateway-${toRegionId}`,
    feeCredits: fee,
    free,
    blocked,
    blockMessage: blocked ? travelBlockMessage(blocked) : null,
    toName: to?.name ?? toRegionId,
    teaser: to?.blurb ?? "",
  };
}

export type FastTravelAttempt = {
  ok: boolean;
  preview: FastTravelPreview;
  sceneKey?: string;
  message: string;
};

/**
 * Validates + optionally debits demo Credits for fast travel.
 * Scene start is left to the Live World scene / bridge.
 */
export function attemptFastTravel(
  fromRegionId: string,
  toRegionId: string,
  guard: TravelGuardContext = {},
): FastTravelAttempt {
  let credits: number | undefined;
  try {
    credits = loadLivePlayState().demoCredits;
  } catch {
    credits = undefined;
  }

  const preview = previewFastTravel(fromRegionId, toRegionId, guard, credits);
  if (preview.blocked) {
    return {
      ok: false,
      preview,
      message: preview.blockMessage ?? "Travel blocked.",
    };
  }

  const target = REGION_BY_SLUG[toRegionId];
  if (!target || target.playability === "blueprint_only") {
    return {
      ok: false,
      preview: { ...preview, blocked: "region_locked" },
      message: "Destination is not enterable yet.",
    };
  }

  if (!preview.free && preview.feeCredits > 0) {
    try {
      const play = loadLivePlayState();
      if (play.demoCredits < preview.feeCredits) {
        return {
          ok: false,
          preview: {
            ...preview,
            blocked: "insufficient_credits",
            blockMessage: travelBlockMessage("insufficient_credits"),
          },
          message: travelBlockMessage("insufficient_credits"),
        };
      }
      play.demoCredits -= preview.feeCredits;
      saveLivePlayState(play);
    } catch {
      /* offline / SSR — allow free path only */
      if (!preview.free) {
        return {
          ok: false,
          preview,
          message: "Credits ledger unavailable.",
        };
      }
    }
  }

  return {
    ok: true,
    preview,
    sceneKey: target.sceneKey,
    message: preview.free
      ? `Fast travel to ${preview.toName} (free).`
      : `Fast travel to ${preview.toName} (−${preview.feeCredits} Credits).`,
  };
}

export function destinationsFrom(fromRegionId: string): FastTravelPreview[] {
  return listActivatedGateways()
    .filter((g) => g.regionId !== fromRegionId)
    .map((g) => previewFastTravel(fromRegionId, g.regionId));
}
