/**
 * Player performances stubs — music/dance shows at stages (cosmetic rewards only).
 */

export type PerformanceStub = {
  id: string;
  hostId: string;
  hostLabel: string;
  hubId: string;
  kind: "music" | "dance" | "story" | "instrument";
  title: string;
  startedAt: string;
  endsAt: string;
  audienceCount: number;
  status: "live" | "ended";
};

type PerfStore = {
  active: Map<string, PerformanceStub>;
};

const globalForPerf = globalThis as unknown as { __riftwildsPerformances?: PerfStore };

function store(): PerfStore {
  if (!globalForPerf.__riftwildsPerformances) {
    globalForPerf.__riftwildsPerformances = { active: new Map() };
  }
  return globalForPerf.__riftwildsPerformances;
}

export function resetPerformancesForTests(): void {
  globalForPerf.__riftwildsPerformances = { active: new Map() };
}

export function startPerformance(params: {
  hostId: string;
  hostLabel?: string;
  hubId?: string;
  kind?: PerformanceStub["kind"];
  title?: string;
  now?: number;
}): PerformanceStub {
  const now = params.now ?? Date.now();
  const id = `perf_${params.hostId}_${now}`;
  const stub: PerformanceStub = {
    id,
    hostId: params.hostId,
    hostLabel: params.hostLabel ?? "Keeper",
    hubId: params.hubId ?? "commons-stage",
    kind: params.kind ?? "music",
    title: params.title ?? "Plaza Performance",
    startedAt: new Date(now).toISOString(),
    endsAt: new Date(now + 10 * 60_000).toISOString(),
    audienceCount: 1,
    status: "live",
  };
  store().active.set(id, stub);
  return stub;
}

export function joinPerformance(params: {
  performanceId: string;
  userId: string;
}): PerformanceStub | null {
  const perf = store().active.get(params.performanceId);
  if (!perf || perf.status !== "live") return null;
  if (perf.hostId === params.userId) return perf;
  const next = { ...perf, audienceCount: perf.audienceCount + 1 };
  store().active.set(params.performanceId, next);
  return next;
}

export function endPerformance(performanceId: string): PerformanceStub | null {
  const perf = store().active.get(performanceId);
  if (!perf) return null;
  const next = { ...perf, status: "ended" as const };
  store().active.set(performanceId, next);
  return next;
}

export function listLivePerformances(): PerformanceStub[] {
  return [...store().active.values()].filter((p) => p.status === "live");
}
