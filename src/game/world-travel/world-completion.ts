/**
 * World completion tracking — discovery %, Gateways, fog average.
 */

import { REGION_IDENTITIES } from "@/game/world-maps/regions";
import { getBlueprint } from "@/game/world-maps/blueprints";
import { fogCoverageRatio } from "@/game/live-world/systems/exploration-fog";
import { GATEWAY_STONES } from "@/game/world-travel/gateways";
import { loadTravelProgress } from "@/game/world-travel/progress";
import type { WorldCompletionSnapshot } from "@/game/world-travel/types";

export function getWorldCompletionSnapshot(): WorldCompletionSnapshot {
  const progress = loadTravelProgress();
  const regionsTotal = REGION_IDENTITIES.length;
  const regionsDiscovered = progress.regionsDiscovered.filter((id) =>
    REGION_IDENTITIES.some((r) => r.id === id),
  ).length;
  const gatewaysTotal = GATEWAY_STONES.length;
  const gatewaysActivated = progress.activatedGateways.length;

  let fogSum = 0;
  for (const r of REGION_IDENTITIES) {
    try {
      const bp = getBlueprint(r.slug);
      fogSum += fogCoverageRatio(r.slug, bp.camera.width, bp.camera.height);
    } catch {
      /* skip */
    }
  }
  const fogAverage = fogSum / Math.max(1, regionsTotal);

  const discoveryShare = regionsDiscovered / regionsTotal;
  const gatewayShare = gatewaysActivated / gatewaysTotal;
  const percentComplete = Math.round(
    (discoveryShare * 0.5 + gatewayShare * 0.35 + fogAverage * 0.15) * 100,
  );

  const milestones: string[] = [];
  if (regionsDiscovered >= 1) milestones.push("first_steps");
  if (regionsDiscovered >= 3) milestones.push("pathfinder");
  if (gatewaysActivated >= 5) milestones.push("stonewalker");
  if (regionsDiscovered >= regionsTotal) milestones.push("cartographer");
  if (gatewaysActivated >= gatewaysTotal) milestones.push("full_network");
  if (percentComplete >= 100) milestones.push("world_complete");

  return {
    regionsDiscovered,
    regionsTotal,
    gatewaysActivated,
    gatewaysTotal,
    fogAverage,
    explorationPoints: progress.explorationPoints,
    explorationXp: progress.explorationXp,
    percentComplete: Math.min(100, percentComplete),
    milestones,
  };
}
