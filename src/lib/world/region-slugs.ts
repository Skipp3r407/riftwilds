/** Display name → asset slug (matches world-map region identities). */
export const REGION_SLUG_BY_NAME: Record<string, string> = {
  "riftwild commons": "riftwild-commons",
  "ember crater": "ember-crater",
  "moonwater coast": "moonwater-coast",
  "elderwood forest": "elderwood-forest",
  "stormspire peaks": "stormspire-peaks",
  "stoneheart canyon": "stoneheart-canyon",
  "frostveil basin": "frostveil-basin",
  "radiant citadel": "radiant-citadel",
  "void hollow": "void-hollow",
  "alloy ruins": "alloy-ruins",
  "spirit marsh": "spirit-marsh",
  "celestial rift": "celestial-rift",
  "spirit realm": "spirit-marsh",
};

/** Launch region slugs that ship habitat card plates. */
export const LAUNCH_HABITAT_REGION_SLUGS = [
  "riftwild-commons",
  "ember-crater",
  "moonwater-coast",
  "elderwood-forest",
  "stormspire-peaks",
  "stoneheart-canyon",
  "frostveil-basin",
  "radiant-citadel",
  "void-hollow",
  "alloy-ruins",
  "spirit-marsh",
  "celestial-rift",
] as const;

export type LaunchHabitatRegionSlug = (typeof LAUNCH_HABITAT_REGION_SLUGS)[number];

/** Affinity → primary launch habitat when a region name is unavailable. */
export const AFFINITY_DEFAULT_REGION_SLUG: Record<string, string> = {
  ember: "ember-crater",
  tide: "moonwater-coast",
  grove: "elderwood-forest",
  storm: "stormspire-peaks",
  stone: "stoneheart-canyon",
  frost: "frostveil-basin",
  radiant: "radiant-citadel",
  void: "void-hollow",
  alloy: "alloy-ruins",
  spirit: "spirit-marsh",
  celestial: "celestial-rift",
};

export function regionSlugFromName(nativeRegion: string): string {
  const key = nativeRegion.trim().toLowerCase();
  const direct = REGION_SLUG_BY_NAME[key];
  if (direct) return direct;
  const byAffinity = AFFINITY_DEFAULT_REGION_SLUG[key];
  if (byAffinity) return byAffinity;
  return key.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function habitatRegionSlug(nativeRegion?: string, affinity?: string): string {
  if (nativeRegion?.trim()) return regionSlugFromName(nativeRegion);
  if (affinity?.trim()) return regionSlugFromName(affinity);
  return "riftwild-commons";
}
