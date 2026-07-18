/**
 * Region streaming stubs — load target, unload distant neighbors.
 * Pure bookkeeping until Phaser asset streaming ships.
 */

export type StreamedRegionState = {
  loaded: string[];
  unloading: string[];
  active: string | null;
  updatedAt: number;
};

let streamState: StreamedRegionState = {
  loaded: ["riftwild-commons"],
  unloading: [],
  active: "riftwild-commons",
  updatedAt: Date.now(),
};

const MAX_RESIDENT = 3;

export function getStreamState(): StreamedRegionState {
  return { ...streamState, loaded: [...streamState.loaded], unloading: [...streamState.unloading] };
}

/**
 * Mark target as loaded; queue distant regions (not active, not neighbors) for unload.
 */
export function planRegionStream(
  targetRegionId: string,
  keepNeighbors: string[] = [],
): StreamedRegionState {
  const keep = new Set([targetRegionId, ...keepNeighbors]);
  const loaded = new Set(streamState.loaded);
  loaded.add(targetRegionId);

  const unloading: string[] = [];
  for (const id of loaded) {
    if (!keep.has(id) && loaded.size - unloading.length > MAX_RESIDENT) {
      unloading.push(id);
    }
  }
  for (const id of unloading) loaded.delete(id);

  streamState = {
    loaded: [...loaded],
    unloading,
    active: targetRegionId,
    updatedAt: Date.now(),
  };
  return getStreamState();
}

/** Stub: pretend unload finished. */
export function completeUnload(regionId: string): StreamedRegionState {
  streamState = {
    ...streamState,
    unloading: streamState.unloading.filter((id) => id !== regionId),
    loaded: streamState.loaded.filter((id) => id !== regionId),
    updatedAt: Date.now(),
  };
  return getStreamState();
}

export function resetStreamStateForTests(): void {
  streamState = {
    loaded: ["riftwild-commons"],
    unloading: [],
    active: "riftwild-commons",
    updatedAt: Date.now(),
  };
}
