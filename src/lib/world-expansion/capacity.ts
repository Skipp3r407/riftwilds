import {
  HARD_CAPACITY_RATIO,
  OVERFLOW_ABSOLUTE_RATIO,
  PERMANENT_FORECAST_THRESHOLD,
  PLOT_HARD_RATIO,
  PLOT_SOFT_RATIO,
  ROLLING_SAMPLE_MAX,
  ROLLING_WINDOW_MS,
  SOFT_CAPACITY_RATIO,
  SPIKE_FACTOR,
} from "@/lib/world-expansion/config";
import type { CapacitySnapshot, CrowdLabel, WorldMapRecord } from "@/lib/world-expansion/types";

type Sample = { at: number; load: number };

type CapacityStore = {
  samples: Map<string, Sample[]>;
};

function capacityStore(): CapacityStore {
  const g = globalThis as unknown as { __rwWorldExpansionCapacity?: CapacityStore };
  if (!g.__rwWorldExpansionCapacity) {
    g.__rwWorldExpansionCapacity = { samples: new Map() };
  }
  return g.__rwWorldExpansionCapacity;
}

export function resetCapacityForTests(): void {
  const g = globalThis as unknown as { __rwWorldExpansionCapacity?: CapacityStore };
  g.__rwWorldExpansionCapacity = { samples: new Map() };
}

export function crowdLabelFor(map: Pick<WorldMapRecord, "playersOnline" | "softPlayerLimit" | "hardPlayerLimit">): CrowdLabel {
  const soft = Math.max(1, map.softPlayerLimit);
  const ratio = map.playersOnline / soft;
  if (map.playersOnline >= map.hardPlayerLimit) return "Full";
  if (ratio >= 0.85) return "Busy";
  if (ratio >= 0.55) return "Lively";
  if (ratio >= 0.25) return "Settling";
  return "Quiet";
}

function pushSample(mapId: string, load: number, now = Date.now()): void {
  const s = capacityStore();
  const prev = s.samples.get(mapId) ?? [];
  const next = [...prev, { at: now, load }].filter((x) => now - x.at <= ROLLING_WINDOW_MS);
  while (next.length > ROLLING_SAMPLE_MAX) next.shift();
  s.samples.set(mapId, next);
}

export function rollingLoadAvg(mapId: string): number {
  const samples = capacityStore().samples.get(mapId) ?? [];
  if (samples.length === 0) return 0;
  return samples.reduce((a, b) => a + b.load, 0) / samples.length;
}

export function measureCapacity(map: WorldMapRecord, now = Date.now()): CapacitySnapshot {
  const soft = Math.max(1, map.softPlayerLimit);
  const load = map.playersOnline / soft;
  pushSample(map.mapId, load, now);
  const avg = rollingLoadAvg(map.mapId);
  const spikeDetected = load > avg * SPIKE_FACTOR && load >= OVERFLOW_ABSOLUTE_RATIO * 0.9;
  const plotRatio = map.plotsTotal > 0 ? map.plotsOccupied / map.plotsTotal : 0;

  const forecastNeedsOverflow =
    load >= OVERFLOW_ABSOLUTE_RATIO || (spikeDetected && load >= HARD_CAPACITY_RATIO);
  /** Permanent cities require sustained rolling pressure — not one festival spike. */
  const forecastNeedsExpansion =
    !spikeDetected &&
    (avg >= PERMANENT_FORECAST_THRESHOLD ||
      plotRatio >= PLOT_SOFT_RATIO ||
      load >= SOFT_CAPACITY_RATIO);

  return {
    mapId: map.mapId,
    at: new Date(now).toISOString(),
    playersOnline: map.playersOnline,
    plotsOccupied: map.plotsOccupied,
    plotsTotal: map.plotsTotal,
    visitors: map.visitors,
    entityCount: map.entityCount,
    tickLatencyMs: map.tickLatencyMs,
    softPlayerLimit: map.softPlayerLimit,
    hardPlayerLimit: map.hardPlayerLimit,
    softPlotRatio: PLOT_SOFT_RATIO,
    hardPlotRatio: PLOT_HARD_RATIO,
    rollingLoadAvg: avg,
    spikeDetected,
    forecastNeedsExpansion,
    forecastNeedsOverflow,
  };
}

export function isSoftCapacityBreached(snap: CapacitySnapshot): boolean {
  const load = snap.playersOnline / Math.max(1, snap.softPlayerLimit);
  const plotRatio = snap.plotsTotal > 0 ? snap.plotsOccupied / snap.plotsTotal : 0;
  return load >= SOFT_CAPACITY_RATIO || plotRatio >= PLOT_SOFT_RATIO;
}

export function isHardCapacityBreached(snap: CapacitySnapshot): boolean {
  const load = snap.playersOnline / Math.max(1, snap.softPlayerLimit);
  const plotRatio = snap.plotsTotal > 0 ? snap.plotsOccupied / snap.plotsTotal : 0;
  return (
    snap.playersOnline >= snap.hardPlayerLimit ||
    load >= HARD_CAPACITY_RATIO ||
    plotRatio >= PLOT_HARD_RATIO
  );
}
