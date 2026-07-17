import type { AssetManifestEntry, AssetStatus } from "@/lib/assets/types";

/** Canonical 18 starter species for art pipeline (Frostuft replaces seed-era Frostnip naming in art). */
export const STARTER_SPECIES = [
  "cindercub",
  "mossprig",
  "bubbloon",
  "voltkit",
  "pebblit",
  "wisplet",
  "frostuft",
  "alloyfin",
  "sunmote",
  "noxling",
  "brambleback",
  "zephyroo",
  "glimmermoth",
  "magmole",
  "tiderune",
  "gearling",
  "bloomble",
  "astralynx",
] as const;

export type StarterSpecies = (typeof STARTER_SPECIES)[number];

export const EGG_CLASSES = [
  "wild",
  "ember",
  "tide",
  "grove",
  "storm",
  "stone",
  "frost",
  "radiant",
  "void",
  "alloy",
  "spirit",
  "ancient",
  "celestial",
  "event",
] as const;

export const AFFINITIES = [
  "ember",
  "tide",
  "grove",
  "storm",
  "stone",
  "frost",
  "radiant",
  "void",
  "alloy",
  "spirit",
] as const;

const now = "2026-07-17T00:00:00.000Z";

function creaturePlaceholders(slug: string): AssetManifestEntry[] {
  const base = `/assets/placeholders/creature-${slug}`;
  return [
    entry(`creature-${slug}-profile`, `${base}-profile.svg`, "creature_profile", slug, 2048, 2048),
    entry(`creature-${slug}-card`, `${base}-card.svg`, "creature_card", slug, 1024, 1024),
    entry(`creature-${slug}-icon`, `${base}-icon.svg`, "creature_icon", slug, 256, 256),
    entry(`creature-${slug}-silhouette`, `${base}-silhouette.svg`, "creature_silhouette", slug, 512, 512),
    entry(`creature-${slug}-battle-idle`, `${base}-battle.svg`, "creature_battle", slug, 512, 512, {
      frameCount: 8,
      animationSpeedMs: 110,
      loop: true,
      anchor: { x: 0.5, y: 0.88 },
      scale: 0.72,
    }),
  ];
}

function entry(
  id: string,
  path: string,
  type: AssetManifestEntry["type"],
  association: string,
  width: number,
  height: number,
  extras?: Partial<AssetManifestEntry>,
): AssetManifestEntry {
  return {
    id,
    path,
    type,
    association,
    width,
    height,
    status: "planned" as AssetStatus,
    version: "0.1.0",
    source: "placeholder-generator",
    licenseNotes: "Dev placeholder — not production art",
    createdAt: now,
    ...extras,
  };
}

export function buildAssetManifest(): AssetManifestEntry[] {
  const creatures = STARTER_SPECIES.flatMap((slug) => creaturePlaceholders(slug));
  const eggs = EGG_CLASSES.map((egg) =>
    entry(`egg-${egg}-full`, `/assets/placeholders/egg-${egg}.svg`, "egg", egg, 1536, 1536),
  );
  const affinities = AFFINITIES.map((a) =>
    entry(`affinity-${a}-icon`, `/assets/placeholders/affinity-${a}.svg`, "affinity_icon", a, 512, 512),
  );
  return [...creatures, ...eggs, ...affinities];
}

export const assetManifest = buildAssetManifest();

export function getAssetsForAssociation(association: string): AssetManifestEntry[] {
  return assetManifest.filter((a) => a.association === association);
}

export function resolveAssetPath(entry: AssetManifestEntry, preferApproved = true): string {
  if (!preferApproved) return entry.path;
  // Until production_ready, serve placeholder path; approved paths swap in later.
  if (entry.status === "production_ready" || entry.status === "integrated") {
    return entry.path.replace("/placeholders/", "/creatures/");
  }
  return entry.path;
}
