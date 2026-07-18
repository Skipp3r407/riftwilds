/**
 * Gateway Stone network — one major stone per region.
 * First physical visit activates permanently; fast travel uses activated stones only.
 * Fees are Credits (or free early) — never SOL.
 */

import { REGION_BY_SLUG, REGION_IDENTITIES } from "@/game/world-maps/regions";
import {
  loadTravelProgress,
  saveTravelProgress,
} from "@/game/world-travel/progress";
import type { GatewayStoneDef } from "@/game/world-travel/types";

const FREE_EARLY_REGIONS = new Set([
  "riftwild-commons",
  "ember-crater",
  "moonwater-coast",
  "elderwood-forest",
]);

function feeForTier(tier: string): number {
  switch (tier) {
    case "start":
      return 0;
    case "early":
      return 15;
    case "mid":
      return 35;
    case "late":
      return 60;
    case "endgame":
      return 100;
    default:
      return 25;
  }
}

export const GATEWAY_STONES: GatewayStoneDef[] = REGION_IDENTITIES.map((r) => {
  const freeEarly = FREE_EARLY_REGIONS.has(r.id);
  return {
    id: `gateway-${r.id}`,
    regionId: r.id,
    label: `${r.name} Gateway Stone`,
    teaser: r.blurb,
    outboundFeeCredits: freeEarly ? 0 : feeForTier(r.unlockTier),
    freeEarly,
  };
});

export const GATEWAY_BY_ID = Object.fromEntries(
  GATEWAY_STONES.map((g) => [g.id, g]),
) as Record<string, GatewayStoneDef>;

export const GATEWAY_BY_REGION = Object.fromEntries(
  GATEWAY_STONES.map((g) => [g.regionId, g]),
) as Record<string, GatewayStoneDef>;

export function gatewayIdForRegion(regionId: string): string {
  return `gateway-${regionId}`;
}

export function isGatewayActivated(gatewayId: string): boolean {
  return loadTravelProgress().activatedGateways.includes(gatewayId);
}

export function isRegionGatewayActivated(regionId: string): boolean {
  return isGatewayActivated(gatewayIdForRegion(regionId));
}

/**
 * First visit to a region permanently activates its Gateway Stone.
 * Returns true if this call performed a new activation.
 */
export function activateGatewayOnVisit(regionId: string): {
  activated: boolean;
  gatewayId: string;
  cinematicStub: "gateway_activation" | null;
} {
  const gatewayId = gatewayIdForRegion(regionId);
  const state = loadTravelProgress();
  let activated = false;
  if (!state.regionsDiscovered.includes(regionId)) {
    state.regionsDiscovered.push(regionId);
    activated = true;
  }
  if (!state.activatedGateways.includes(gatewayId)) {
    state.activatedGateways.push(gatewayId);
    activated = true;
  }
  if (activated) saveTravelProgress(state);
  return {
    activated,
    gatewayId,
    cinematicStub: activated ? "gateway_activation" : null,
  };
}

/** Commons Gateway is considered discovered at character start once player enters Live World. */
export function ensureCommonsGateway(): void {
  activateGatewayOnVisit("riftwild-commons");
}

export function listActivatedGateways(): GatewayStoneDef[] {
  const active = new Set(loadTravelProgress().activatedGateways);
  return GATEWAY_STONES.filter((g) => active.has(g.id));
}

export function listVisibleGateways(): Array<
  GatewayStoneDef & { activated: boolean; regionName: string }
> {
  const active = new Set(loadTravelProgress().activatedGateways);
  return GATEWAY_STONES.map((g) => ({
    ...g,
    activated: active.has(g.id),
    regionName: REGION_BY_SLUG[g.regionId]?.name ?? g.regionId,
  }));
}

export function fastTravelFeeCredits(
  fromRegionId: string,
  toRegionId: string,
): { fee: number; free: boolean } {
  if (fromRegionId === toRegionId) return { fee: 0, free: true };
  const from = GATEWAY_BY_REGION[fromRegionId];
  const to = GATEWAY_BY_REGION[toRegionId];
  // Free early corridor between starter hubs
  if (from?.freeEarly && to?.freeEarly) return { fee: 0, free: true };
  // Destination fee dominates (arrive cost); never SOL
  const fee = Math.max(
    from?.outboundFeeCredits ?? 0,
    to?.outboundFeeCredits ?? 0,
  );
  return { fee, free: fee <= 0 };
}
