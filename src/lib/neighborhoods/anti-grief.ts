/**
 * Anti-grief + abandoned property — road blocking, offensive décor, soft multi-account.
 */

import type { PlayerNeighborhood, PlayerPlot, PlotStatus } from "@/lib/neighborhoods/types";

const ABANDON_MS = 21 * 24 * 60 * 60_000;
const WARN_MS = 14 * 24 * 60 * 60_000;

/** Fences / décor may not occupy shared road cells (col%4===0 or row%4===0). */
export function isRoadCell(col: number, row: number): boolean {
  return col % 4 === 0 || row % 4 === 0;
}

export function assertExteriorPlacementAllowed(params: {
  col: number;
  row: number;
  blocksRoad?: boolean;
}): { ok: true } | { ok: false; error: string; message: string } {
  if (params.blocksRoad && isRoadCell(params.col, params.row)) {
    return {
      ok: false,
      error: "road_block",
      message: "Cannot block shared neighborhood roads.",
    };
  }
  return { ok: true };
}

const OFFENSIVE_KEYWORDS = ["slur_stub", "hate_stub", "exploit_deco"];

export function flagOffensiveDecor(label: string): boolean {
  const lower = label.toLowerCase();
  return OFFENSIVE_KEYWORDS.some((k) => lower.includes(k));
}

/** Soft multi-account check — same device fingerprint claiming many vacant plots. */
export function softMultiAccountPlotRisk(params: {
  ownerKey: string;
  fingerprint?: string | null;
  recentClaimOwnerKeys: string[];
}): { risk: "low" | "elevated"; note: string } {
  if (!params.fingerprint) {
    return { risk: "low", note: "No fingerprint — standard claim." };
  }
  const clustered = params.recentClaimOwnerKeys.filter((k) => k !== params.ownerKey).length;
  if (clustered >= 3) {
    return {
      risk: "elevated",
      note: "Multiple recent claims from similar clients — soft throttle eligibility.",
    };
  }
  return { risk: "low", note: "ok" };
}

export function evaluateAbandonedPlots(
  neighborhood: PlayerNeighborhood,
  now = Date.now(),
): { updated: PlayerPlot[]; transitions: { plotId: string; status: PlotStatus }[] } {
  const transitions: { plotId: string; status: PlotStatus }[] = [];
  const updated = neighborhood.plots.map((plot) => {
    if (!plot.ownerUserId || plot.status === "vacant") return plot;
    const last = Date.parse(plot.lastActivityAt);
    const age = now - last;
    if (age >= ABANDON_MS && plot.status !== "npc_maintained" && plot.status !== "auctioned") {
      transitions.push({ plotId: plot.plotId, status: "npc_maintained" });
      return {
        ...plot,
        status: "npc_maintained" as const,
        abandonedWarnedAt: plot.abandonedWarnedAt ?? new Date(now - (ABANDON_MS - WARN_MS)).toISOString(),
      };
    }
    if (age >= WARN_MS && !plot.abandonedWarnedAt && plot.status === "owned") {
      transitions.push({ plotId: plot.plotId, status: "abandoned_warned" });
      return {
        ...plot,
        status: "abandoned_warned" as const,
        abandonedWarnedAt: new Date(now).toISOString(),
      };
    }
    return plot;
  });
  return { updated, transitions };
}

export function listForSaleOrAuction(neighborhood: PlayerNeighborhood): PlayerPlot[] {
  return neighborhood.plots.filter(
    (p) => p.status === "for_sale" || p.status === "auctioned" || p.status === "npc_maintained",
  );
}
