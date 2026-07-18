/**
 * Continent connection graph — spine + hub/peer edges for progression & UI.
 * Walking remains primary; edges describe logical routes / Gateway network.
 */

import type { ContinentEdge } from "@/game/world-travel/types";

/** Primary story spine: Commons → Elderwood → Stoneheart → Stormspire → Radiant. */
export const CONTINENT_SPINE: string[] = [
  "riftwild-commons",
  "elderwood-forest",
  "stoneheart-canyon",
  "stormspire-peaks",
  "radiant-citadel",
];

export const CONTINENT_EDGES: ContinentEdge[] = [
  // Hub spokes from Commons (starter open)
  { from: "riftwild-commons", to: "ember-crater", kind: "hub" },
  { from: "riftwild-commons", to: "moonwater-coast", kind: "hub" },
  { from: "riftwild-commons", to: "elderwood-forest", kind: "spine" },
  { from: "riftwild-commons", to: "stormspire-peaks", kind: "hub" },
  { from: "riftwild-commons", to: "stoneheart-canyon", kind: "hub" },
  { from: "riftwild-commons", to: "frostveil-basin", kind: "hub" },
  { from: "riftwild-commons", to: "radiant-citadel", kind: "hub" },
  { from: "riftwild-commons", to: "alloy-ruins", kind: "hub" },
  { from: "riftwild-commons", to: "spirit-marsh", kind: "hub" },
  { from: "riftwild-commons", to: "void-hollow", kind: "hub" },
  { from: "riftwild-commons", to: "celestial-rift", kind: "hub" },

  // Spine peer links
  {
    from: "elderwood-forest",
    to: "stoneheart-canyon",
    kind: "spine",
    label: "Rootroad Pass",
  },
  {
    from: "stoneheart-canyon",
    to: "stormspire-peaks",
    kind: "spine",
    label: "Windscar Ascent",
  },
  {
    from: "stormspire-peaks",
    to: "radiant-citadel",
    kind: "spine",
    label: "Sunlit Causeway",
  },

  // Logical peer links
  {
    from: "ember-crater",
    to: "stoneheart-canyon",
    kind: "peer",
    label: "Ash Ridge Trail",
  },
  {
    from: "moonwater-coast",
    to: "frostveil-basin",
    kind: "peer",
    label: "Tideglass Road",
  },
  {
    from: "elderwood-forest",
    to: "spirit-marsh",
    kind: "peer",
    label: "Lantern Glade",
  },
  {
    from: "radiant-citadel",
    to: "alloy-ruins",
    kind: "peer",
    label: "Gilded Scaffold",
  },
  {
    from: "alloy-ruins",
    to: "void-hollow",
    kind: "peer",
    label: "Null Conduit",
  },
  {
    from: "void-hollow",
    to: "celestial-rift",
    kind: "peer",
    label: "Rift Span",
  },
  {
    from: "spirit-marsh",
    to: "void-hollow",
    kind: "peer",
    label: "Memory Fen",
  },

  // Returns to hub
  { from: "ember-crater", to: "riftwild-commons", kind: "return" },
  { from: "moonwater-coast", to: "riftwild-commons", kind: "return" },
  { from: "elderwood-forest", to: "riftwild-commons", kind: "return" },
  { from: "stormspire-peaks", to: "riftwild-commons", kind: "return" },
  { from: "stoneheart-canyon", to: "riftwild-commons", kind: "return" },
  { from: "frostveil-basin", to: "riftwild-commons", kind: "return" },
  { from: "radiant-citadel", to: "riftwild-commons", kind: "return" },
  { from: "alloy-ruins", to: "riftwild-commons", kind: "return" },
  { from: "spirit-marsh", to: "riftwild-commons", kind: "return" },
  { from: "void-hollow", to: "riftwild-commons", kind: "return" },
  { from: "celestial-rift", to: "riftwild-commons", kind: "return" },
];

export function edgesFrom(regionId: string): ContinentEdge[] {
  return CONTINENT_EDGES.filter((e) => e.from === regionId);
}

export function edgesTo(regionId: string): ContinentEdge[] {
  return CONTINENT_EDGES.filter((e) => e.to === regionId);
}

export function areConnected(a: string, b: string): boolean {
  return CONTINENT_EDGES.some(
    (e) => (e.from === a && e.to === b) || (e.from === b && e.to === a),
  );
}

export function spineIndex(regionId: string): number {
  return CONTINENT_SPINE.indexOf(regionId);
}

/** Next spine region after the given one, or null at Radiant / non-spine. */
export function nextSpineRegion(regionId: string): string | null {
  const i = spineIndex(regionId);
  if (i < 0 || i >= CONTINENT_SPINE.length - 1) return null;
  return CONTINENT_SPINE[i + 1] ?? null;
}

export function neighborsOf(regionId: string): string[] {
  const set = new Set<string>();
  for (const e of CONTINENT_EDGES) {
    if (e.from === regionId) set.add(e.to);
    if (e.to === regionId) set.add(e.from);
  }
  return [...set];
}
