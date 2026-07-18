/**
 * Capacity-driven expansion orchestrator — soft/hard thresholds + forecasting.
 * Festival spikes → overflow; sustained pressure → permanent maps.
 */

import { isFeatureEnabled } from "@/lib/config/feature-flags";
import {
  isHardCapacityBreached,
  isSoftCapacityBreached,
  measureCapacity,
  crowdLabelFor,
} from "@/lib/world-expansion/capacity";
import { connectMaps } from "@/lib/world-expansion/connections";
import { planAndGenerate } from "@/lib/world-expansion/generation-service";
import { expandHousingNeighborhood } from "@/lib/world-expansion/housing-expansion";
import { spawnOverflowInstance } from "@/lib/world-expansion/overflow";
import { getExpansionStore } from "@/lib/world-expansion/store";
import type { CapacitySnapshot, ExpansionRequest, WorldMapRecord } from "@/lib/world-expansion/types";

export type TickResult = {
  snapshots: CapacitySnapshot[];
  actions: {
    kind: "overflow" | "permanent" | "housing" | "none";
    sourceMapId: string;
    resultMapId?: string;
    requestId?: string;
    detail: string;
  }[];
};

export function tickCapacityOrchestrator(): TickResult {
  if (!isFeatureEnabled("WORLD_EXPANSION_ENABLED")) {
    return { snapshots: [], actions: [] };
  }

  const s = getExpansionStore();
  const snapshots: CapacitySnapshot[] = [];
  const actions: TickResult["actions"] = [];

  for (const map of s.maps.values()) {
    if (map.lifecycle !== "OPEN") continue;
    map.crowdLabel = crowdLabelFor(map);
    const snap = measureCapacity(map);
    snapshots.push(snap);

    // Hard / spike → temporary overflow (never permanent city)
    if (snap.forecastNeedsOverflow || isHardCapacityBreached(snap)) {
      if (map.mapKind === "overflow") {
        actions.push({
          kind: "none",
          sourceMapId: map.mapId,
          detail: "overflow_map_already_at_pressure",
        });
        continue;
      }
      const overflow = spawnOverflowInstance({
        sourceMapId: map.mapId,
        eventKey: `auto_overflow_${map.mapId}`,
        autoOpen: true,
      });
      if (overflow.ok) {
        connectMaps({
          fromMapId: map.mapId,
          toMapId: overflow.map.mapId,
          kind: "gate",
          label: "Festival gate",
        });
        actions.push({
          kind: "overflow",
          sourceMapId: map.mapId,
          resultMapId: overflow.map.mapId,
          detail: "spawned_overflow_for_spike_or_hard_cap",
        });
      }
      continue;
    }

    // Soft sustained → permanent expansion (not from spike)
    if (snap.forecastNeedsExpansion || isSoftCapacityBreached(snap)) {
      if (map.mapKind === "overflow") continue;
      const plotRatio = snap.plotsTotal > 0 ? snap.plotsOccupied / snap.plotsTotal : 0;
      if (plotRatio >= snap.softPlotRatio && map.neighborhoodId) {
        const housing = expandHousingNeighborhood({
          sourceMapId: map.mapId,
          autoOpen: true,
        });
        if (housing.ok) {
          connectMaps({
            fromMapId: map.mapId,
            toMapId: housing.map.mapId,
            kind: "road",
            label: "Homestead road",
          });
          actions.push({
            kind: "housing",
            sourceMapId: map.mapId,
            resultMapId: housing.map.mapId,
            detail: "housing_scarce_new_neighborhood",
          });
        }
      } else {
        const gen = planAndGenerate({
          reason: "forecast",
          sourceMapId: map.mapId,
          templateKey: "forest_hamlet",
          mapKind: "permanent",
          autoOpen: false, // pending review by default
          adminActorId: "orchestrator",
        });
        if (gen.ok) {
          actions.push({
            kind: "permanent",
            sourceMapId: map.mapId,
            resultMapId: gen.map.mapId,
            requestId: gen.request.requestId,
            detail: "planned_permanent_pending_review",
          });
        }
      }
    } else {
      actions.push({ kind: "none", sourceMapId: map.mapId, detail: "within_capacity" });
    }
  }

  return { snapshots, actions };
}

export function simulateLoad(mapId: string, playersOnline: number): WorldMapRecord | null {
  const s = getExpansionStore();
  const map = s.maps.get(mapId);
  if (!map) return null;
  map.playersOnline = playersOnline;
  map.crowdLabel = crowdLabelFor(map);
  map.updatedAt = new Date().toISOString();
  s.maps.set(mapId, map);
  return map;
}

export function listExpansionRequests(): ExpansionRequest[] {
  return [...getExpansionStore().requests.values()];
}
