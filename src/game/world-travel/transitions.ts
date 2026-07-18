/**
 * Region transition polish — music/ambient crossfade, loading art, streaming stubs.
 */

import { REGION_BY_SLUG } from "@/game/world-maps/regions";
import { neighborsOf } from "@/game/world-travel/continent-graph";
import { planRegionStream } from "@/game/world-travel/region-streaming";
import type { TravelTransitionPlan } from "@/game/world-travel/types";

export const TRAVEL_LOADING_ART = "/assets/ui/travel/travel-loading.png";
export const GATEWAY_STONE_ART = "/assets/ui/map/gateway-stone.png";

export function buildTransitionPlan(
  fromRegionId: string,
  toRegionId: string,
): TravelTransitionPlan {
  const to = REGION_BY_SLUG[toRegionId];
  return {
    fromRegionId,
    toRegionId,
    musicKey: to?.musicKey ?? "music-commons",
    ambientRegionId: toRegionId,
    loadingArtSrc: TRAVEL_LOADING_ART,
    fadeMs: fromRegionId === toRegionId ? 200 : 900,
    streamStub: "load_target",
  };
}

/** Fire music + ambient crossfade hooks (no-op safe in SSR). */
export async function applyRegionAudioTransition(
  toRegionId: string,
  fadeMs = 900,
): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const [{ playRegionMusic }, { startRegionAmbient }] = await Promise.all([
      import("@/lib/audio/music"),
      import("@/lib/audio/ambient"),
    ]);
    await Promise.all([
      playRegionMusic(toRegionId, fadeMs),
      startRegionAmbient(toRegionId, fadeMs),
    ]);
  } catch {
    /* audio optional */
  }
}

export function playTravelSfx(
  kind: "portal" | "fast_travel" | "gateway_activate" | "blocked",
): void {
  if (typeof window === "undefined") return;
  void import("@/lib/audio/sfx").then(({ playSfx }) => {
    if (kind === "blocked") {
      playSfx("ui.error");
      return;
    }
    if (kind === "gateway_activate") {
      playSfx("world.gateway_activate");
      return;
    }
    if (kind === "fast_travel") {
      playSfx("world.fast_travel");
      return;
    }
    playSfx("world.portal");
  });
}

/** Full transition stub: audio + streaming plan (scene start owned by caller). */
export async function runTravelTransition(
  fromRegionId: string,
  toRegionId: string,
): Promise<TravelTransitionPlan> {
  const plan = buildTransitionPlan(fromRegionId, toRegionId);
  planRegionStream(toRegionId, neighborsOf(fromRegionId));
  await applyRegionAudioTransition(toRegionId, plan.fadeMs);
  return plan;
}
