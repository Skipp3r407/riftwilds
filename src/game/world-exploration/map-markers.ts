/**
 * Unified map marker query — quests + discoveries + blueprints + events + custom pins.
 * Supports filters, search, nearby radius, and simple clustering for performance.
 */

import { buildQuestMapMarkers } from "@/game/world-exploration/quest-map-bridge";
import { buildDiscoveryMarkers } from "@/game/world-exploration/discovery-markers";
import { buildBlueprintMarkers } from "@/game/world-exploration/blueprint-markers";
import { buildWorldEventMarkers } from "@/game/world-exploration/world-events-markers";
import { loadExplorationProgress } from "@/game/world-exploration/progress";
import { iconKeyForMarker } from "@/game/world-exploration/map-icons";
import {
  DEFAULT_LEGEND_TOGGLES,
  type LegendToggleState,
  type MapMarker,
  type MapMarkerResult,
  type MarkerCluster,
  type MarkerQuery,
} from "@/game/world-exploration/types";
import { REGION_IDENTITIES } from "@/game/world-maps/regions";

function buildCustomMarkers(regionSlug?: string | null): MapMarker[] {
  const { customWaypoints } = loadExplorationProgress();
  return customWaypoints
    .filter((w) => !regionSlug || w.regionSlug === regionSlug)
    .map((w) => ({
      id: `custom-${w.id}`,
      kind: "custom" as const,
      category: "custom" as const,
      regionSlug: w.regionSlug,
      x: w.x,
      y: w.y,
      label: w.label,
      subtitle: w.note,
      state: "idle" as const,
      visibility: "visible" as const,
      iconKey: iconKeyForMarker("custom"),
      searchText: `${w.label} ${w.note ?? ""} custom`.toLowerCase(),
      codexHref: null,
      clusterKey: `${w.regionSlug}:custom`,
      priority: 50,
      metadata: { customId: w.id },
    }));
}

function mergeLegend(
  stored: LegendToggleState,
  override?: Partial<LegendToggleState>,
): LegendToggleState {
  return { ...DEFAULT_LEGEND_TOGGLES, ...stored, ...override };
}

function clusterMarkers(markers: MapMarker[], cellSize: number): MarkerCluster[] {
  const buckets = new Map<string, MapMarker[]>();
  for (const m of markers) {
    if (m.x == null || m.y == null) continue;
    const cx = Math.floor(m.x / cellSize);
    const cy = Math.floor(m.y / cellSize);
    const key = `${m.regionSlug}:${cx},${cy}`;
    const list = buckets.get(key) ?? [];
    list.push(m);
    buckets.set(key, list);
  }
  const clusters: MarkerCluster[] = [];
  for (const [key, list] of buckets) {
    if (list.length < 2) continue;
    const x = list.reduce((s, m) => s + (m.x ?? 0), 0) / list.length;
    const y = list.reduce((s, m) => s + (m.y ?? 0), 0) / list.length;
    clusters.push({
      id: `cluster-${key}`,
      regionSlug: list[0]!.regionSlug,
      x,
      y,
      count: list.length,
      kinds: [...new Set(list.map((m) => m.kind))],
      label: `${list.length} nearby`,
      markers: list,
    });
  }
  return clusters;
}

/**
 * Aggregate all visible map markers for UI / minimap.
 * Hidden secrets never appear with coordinates.
 */
export function queryMapMarkers(query: MarkerQuery = {}): MapMarkerResult {
  const progress = loadExplorationProgress();
  const legend = mergeLegend(progress.legendToggles, query.legend);
  const regionSlug = query.regionSlug ?? null;
  const includeHints = query.includeHints ?? true;
  const nearbyRadius = query.nearbyRadius ?? 420;
  const limit = query.limit ?? 220;
  const clusterThreshold = query.clusterThreshold ?? 48;

  const regions = regionSlug
    ? [regionSlug]
    : REGION_IDENTITIES.map((r) => r.slug);

  let markers: MapMarker[] = [
    ...buildQuestMapMarkers({ regionSlug }),
    ...buildDiscoveryMarkers({ regionSlug, includeHints }),
    ...buildWorldEventMarkers({ regionSlug }),
    ...buildCustomMarkers(regionSlug),
  ];

  for (const slug of regions) {
    markers.push(...buildBlueprintMarkers(slug));
  }

  // Legend filter
  markers = markers.filter((m) => legend[m.category] !== false);

  // Search
  const q = query.search?.trim().toLowerCase();
  if (q) {
    markers = markers.filter(
      (m) =>
        m.searchText.includes(q) ||
        m.label.toLowerCase().includes(q) ||
        (m.subtitle?.toLowerCase().includes(q) ?? false),
    );
  }

  // Nearby filter for minimap
  if (query.player) {
    const p = query.player;
    markers = markers.filter((m) => {
      if (m.regionSlug !== p.regionSlug) return false;
      if (m.x == null || m.y == null) {
        // region hints still useful on full map, skip on tight nearby
        return false;
      }
      const dx = m.x - p.x;
      const dy = m.y - p.y;
      return dx * dx + dy * dy <= nearbyRadius * nearbyRadius;
    });
  }

  // Priority sort
  markers.sort((a, b) => b.priority - a.priority);

  const truncated = markers.length > limit;
  if (truncated) markers = markers.slice(0, limit);

  const hints = markers.filter((m) => m.visibility === "region_hint");
  const pinMarkers = markers.filter((m) => m.visibility !== "region_hint");

  let clusters: MarkerCluster[] = [];
  let outMarkers = pinMarkers;
  if (pinMarkers.length >= clusterThreshold) {
    clusters = clusterMarkers(pinMarkers, 160);
    const clusteredIds = new Set(clusters.flatMap((c) => c.markers.map((m) => m.id)));
    // Keep high-priority singles + cluster representatives
    outMarkers = pinMarkers.filter(
      (m) => !clusteredIds.has(m.id) || m.priority >= 80,
    );
  }

  return {
    markers: outMarkers,
    clusters,
    hints,
    truncated,
  };
}

/** Convenience: nearby pins for minimap sync. */
export function queryNearbyMinimapMarkers(player: {
  regionSlug: string;
  x: number;
  y: number;
}): MapMarker[] {
  const result = queryMapMarkers({
    regionSlug: player.regionSlug,
    player,
    nearbyRadius: 480,
    includeHints: false,
    limit: 24,
    clusterThreshold: 999,
  });
  return result.markers;
}
