/**
 * Live World entry stubs — door / portal / gate into private home instances.
 * Coordinates with Commons neighborhood exteriors (Living Towns).
 */

export type HomeEntryStub = {
  id: string;
  kind: "door" | "portal" | "gate";
  label: string;
  mapId: string;
  x: number;
  y: number;
  /** When set, enters that player's private instance; null = owner demo. */
  homeId: string | null;
  neighborhoodId: string | null;
  plotId: string | null;
};

/** Keeper Row cottage doors — align with riftwild-commons homestead facades. */
export const COMMONS_HOME_ENTRY_STUBS: HomeEntryStub[] = [
  {
    id: "entry-keeper-row-a",
    kind: "door",
    label: "Keeper Cottage Door",
    mapId: "riftwild-commons",
    x: 3 * 64 + 32,
    y: 13 * 64 + 48,
    homeId: null,
    neighborhoodId: "nbhd_commons_alpha",
    plotId: null,
  },
  {
    id: "entry-neighborhood-gate",
    kind: "gate",
    label: "Neighborhood Gate",
    mapId: "riftwild-commons",
    x: 8 * 64,
    y: 10 * 64,
    homeId: null,
    neighborhoodId: "nbhd_commons_alpha",
    plotId: null,
  },
  {
    id: "entry-home-portal",
    kind: "portal",
    label: "Home Portal",
    mapId: "riftwild-commons",
    x: 14 * 64,
    y: 14 * 64,
    homeId: null,
    neighborhoodId: null,
    plotId: null,
  },
];

export function listHomeEntryStubs(mapId?: string): HomeEntryStub[] {
  if (!mapId) return COMMONS_HOME_ENTRY_STUBS;
  return COMMONS_HOME_ENTRY_STUBS.filter((e) => e.mapId === mapId);
}
