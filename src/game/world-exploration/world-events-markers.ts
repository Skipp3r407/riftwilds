/**
 * Dynamic world-event markers from Living World disasters / clock
 * plus server-authoritative Dynamic World Events catalog instances.
 */

import { resolveLivingWorldClock } from "@/game/living-world/clock";
import { resolveActiveDisaster } from "@/game/living-world/disasters";
import { iconKeyForMarker } from "@/game/world-exploration/map-icons";
import type { MapMarker } from "@/game/world-exploration/types";
import { REGION_BY_SLUG } from "@/game/world-maps/regions";
import { getBlueprint } from "@/game/world-maps/blueprints";
import { isFeatureEnabled } from "@/lib/config/feature-flags";
import { getWorldEventPlayerView } from "@/lib/world-events";

function disasterMarkers(opts?: {
  regionSlug?: string | null;
  at?: number;
}): MapMarker[] {
  const clock = resolveLivingWorldClock(opts?.at ?? Date.now());
  const active = resolveActiveDisaster(clock);
  if (!active) return [];

  const affinity = active.disaster.regionAffinity ?? [];
  const regions =
    affinity.length > 0
      ? affinity.filter((slug) => REGION_BY_SLUG[slug])
      : opts?.regionSlug
        ? [opts.regionSlug]
        : ["riftwild-commons"];

  const markers: MapMarker[] = [];
  for (const slug of regions) {
    if (opts?.regionSlug && slug !== opts.regionSlug) continue;
    let x = REGION_BY_SLUG[slug]?.spawn.x ?? 512;
    let y = REGION_BY_SLUG[slug]?.spawn.y ?? 512;
    try {
      const bp = getBlueprint(slug);
      x = bp.spawn.x;
      y = bp.spawn.y - 80;
    } catch {
      /* keep spawn */
    }

    markers.push({
      id: `event-${active.disaster.key}-${slug}-${active.worldDay}`,
      kind: "world_event",
      category: "events",
      regionSlug: slug,
      x,
      y,
      label: active.disaster.name,
      subtitle: `Intensity ${Math.round(active.intensity * 100)}% · Day ${active.worldDay}`,
      state: "live",
      visibility: "visible",
      iconKey: iconKeyForMarker("world_event"),
      searchText: `${active.disaster.name} ${slug} event disaster`.toLowerCase(),
      codexHref: `/world#region-${slug}`,
      clusterKey: `${slug}:events`,
      priority: 95,
      metadata: {
        disasterKey: active.disaster.key,
        effects: active.disaster.worldEffects,
        intensity: active.intensity,
      },
    });
  }
  return markers;
}

function dynamicWorldEventMarkers(opts?: {
  regionSlug?: string | null;
}): MapMarker[] {
  if (!isFeatureEnabled("LIVE_WORLD_EVENTS_ENABLED")) return [];
  const view = getWorldEventPlayerView({ userId: "map-markers", ensureDemo: true });
  return view.mapMarkers
    .filter((m) => !opts?.regionSlug || m.regionSlug === opts.regionSlug)
    .map((m) => ({
      id: m.id,
      kind: "world_event" as const,
      category: "events" as const,
      regionSlug: m.regionSlug,
      x: m.x,
      y: m.y,
      label: m.label,
      subtitle: m.subtitle,
      state: "live" as const,
      visibility: "visible" as const,
      iconKey: iconKeyForMarker("world_event"),
      searchText: `${m.label} ${m.regionSlug} ${m.eventKey} world event`.toLowerCase(),
      codexHref: `/world#region-${m.regionSlug}`,
      clusterKey: `${m.regionSlug}:events`,
      priority: 98,
      metadata: {
        eventKey: m.eventKey,
        phase: m.phase,
        source: "dynamic_world_events",
      },
    }));
}

export function buildWorldEventMarkers(opts?: {
  regionSlug?: string | null;
  at?: number;
}): MapMarker[] {
  return [...dynamicWorldEventMarkers(opts), ...disasterMarkers(opts)];
}
