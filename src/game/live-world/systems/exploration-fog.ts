/**
 * Exploration fog-of-war persistence per region (localStorage).
 * Grid cells mark visited tiles; waypoints and map UI read this.
 */

const STORAGE_KEY = "riftwilds-exploration-fog-v1";
const CELL = 64; // world pixels per fog cell

export type FogState = {
  version: 1;
  regions: Record<
    string,
    {
      visited: string[]; // "cx,cy"
      discoveredLandmarks: string[];
      discoveredWaypoints: string[];
    }
  >;
};

function emptyRegion() {
  return {
    visited: [] as string[],
    discoveredLandmarks: [] as string[],
    discoveredWaypoints: [] as string[],
  };
}

export function loadFogState(): FogState {
  if (typeof window === "undefined") {
    return { version: 1, regions: {} };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { version: 1, regions: {} };
    const parsed = JSON.parse(raw) as FogState;
    if (parsed?.version !== 1) return { version: 1, regions: {} };
    return parsed;
  } catch {
    return { version: 1, regions: {} };
  }
}

export function saveFogState(state: FogState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function cellKey(x: number, y: number): string {
  return `${Math.floor(x / CELL)},${Math.floor(y / CELL)}`;
}

export function markVisited(regionSlug: string, x: number, y: number): FogState {
  const state = loadFogState();
  const region = state.regions[regionSlug] ?? emptyRegion();
  const key = cellKey(x, y);
  if (!region.visited.includes(key)) {
    region.visited.push(key);
    // Cap growth
    if (region.visited.length > 4000) {
      region.visited = region.visited.slice(-3000);
    }
    state.regions[regionSlug] = region;
    saveFogState(state);
  }
  return state;
}

export function discoverLandmark(regionSlug: string, landmarkId: string): FogState {
  const state = loadFogState();
  const region = state.regions[regionSlug] ?? emptyRegion();
  if (!region.discoveredLandmarks.includes(landmarkId)) {
    region.discoveredLandmarks.push(landmarkId);
    state.regions[regionSlug] = region;
    saveFogState(state);
  }
  return state;
}

export function discoverWaypoint(regionSlug: string, waypointId: string): FogState {
  const state = loadFogState();
  const region = state.regions[regionSlug] ?? emptyRegion();
  if (!region.discoveredWaypoints.includes(waypointId)) {
    region.discoveredWaypoints.push(waypointId);
    state.regions[regionSlug] = region;
    saveFogState(state);
  }
  return state;
}

export function isCellVisited(regionSlug: string, x: number, y: number): boolean {
  const region = loadFogState().regions[regionSlug];
  if (!region) return false;
  return region.visited.includes(cellKey(x, y));
}

export function getVisitedCells(regionSlug: string): Set<string> {
  const region = loadFogState().regions[regionSlug];
  return new Set(region?.visited ?? []);
}

export function fogCoverageRatio(regionSlug: string, mapWidth: number, mapHeight: number): number {
  const total = Math.max(1, Math.ceil(mapWidth / CELL) * Math.ceil(mapHeight / CELL));
  const visited = loadFogState().regions[regionSlug]?.visited.length ?? 0;
  return Math.min(1, visited / total);
}

export { CELL as FOG_CELL_SIZE };
