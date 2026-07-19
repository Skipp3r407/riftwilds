/**
 * Scenic plate backgrounds for Riftling avatar picker cards.
 * Affinity-themed; same-affinity species get distinct variants via slug hash.
 */

const BG_DIR = "/assets/social/avatar-bgs";
/** Bump when plates change. */
export const AVATAR_BG_V = "avatarbg1";

/** Affinity → ordered scenic plate variants (SVG under public/assets/social/avatar-bgs/). */
const AFFINITY_PLATES: Record<string, readonly string[]> = {
  EMBER: ["ember-crater", "ember-forge", "ember-ashfall"],
  GROVE: ["grove-glade", "grove-thicket", "grove-canopy"],
  TIDE: ["tide-cove", "tide-reef", "tide-moonfoam"],
  STORM: ["storm-spire", "storm-ridge", "storm-spark"],
  STONE: ["stone-canyon", "stone-geode", "stone-mesa"],
  SPIRIT: ["spirit-marsh", "spirit-lantern", "spirit-veil"],
  FROST: ["frost-basin", "frost-glaze", "frost-aurora"],
  RADIANT: ["radiant-citadel", "radiant-dawn", "radiant-prism"],
  VOID: ["void-hollow", "void-rift", "void-mire"],
  ALLOY: ["alloy-ruins", "alloy-forge", "alloy-scrap"],
  RIFT: ["rift-commons", "rift-sky", "rift-meadow"],
};

function hashSlug(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h;
}

function plateSrc(id: string): string {
  return `${BG_DIR}/${id}.svg?v=${AVATAR_BG_V}`;
}

/** Resolve a unique scenic BG for a species avatar. */
export function avatarBackgroundForSpecies(
  speciesSlug: string,
  affinity: string,
): string {
  const key = affinity.trim().toUpperCase();
  const plates = AFFINITY_PLATES[key] ?? AFFINITY_PLATES.RIFT!;
  const idx = hashSlug(speciesSlug.toLowerCase()) % plates.length;
  return plateSrc(plates[idx]!);
}

/** Optional fallback scenic for non-species avatars (characters / brand). */
export function avatarBackgroundFallback(): string {
  return plateSrc("rift-commons");
}
