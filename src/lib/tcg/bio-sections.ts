import { creaturePortraitPath, regionImagePath } from "@/lib/assets/paths";
import type { SpeciesLore } from "@/lib/pets/lore-types";

/** Prefer scenic map plates; fall back to legacy region banners. */
function habitatImageSrc(regionSlug: string): {
  imageSrc: string;
  imageFallback: string;
} {
  return {
    imageSrc: `/assets/maps/regions/${regionSlug}.png`,
    imageFallback: regionImagePath(regionSlug),
  };
}

/** Display name → asset slug (matches world-map region identities). */
const REGION_SLUG_BY_NAME: Record<string, string> = {
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
};

export type TcgBioSectionId =
  | "portrait"
  | "habitat"
  | "behavior"
  | "diet"
  | "affinity";

export type TcgBioSection = {
  id: TcgBioSectionId;
  label: string;
  body: string;
  /** Primary image for the section (portrait, region plate, vignette, etc.). */
  imageSrc: string;
  /** Optional fallback if primary fails to load. */
  imageFallback?: string;
  imageAlt: string;
  /** Wider scenic crop vs square icon plate. */
  imageLayout: "hero" | "scenic" | "plate";
};

const AFFINITY_KEY = [
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
  "celestial",
] as const;

function affinityKey(affinity: string): string {
  const key = affinity.trim().toLowerCase();
  if ((AFFINITY_KEY as readonly string[]).includes(key)) return key;
  return "spirit";
}

export function regionSlugFromName(nativeRegion: string): string {
  const key = nativeRegion.trim().toLowerCase();
  const direct = REGION_SLUG_BY_NAME[key];
  if (direct) return direct;
  return key.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function bioVignette(section: "behavior" | "diet", affinity: string): string {
  return `/assets/tcg/bio/${section}-${affinityKey(affinity)}.svg`;
}

function elementPlate(affinity: string): string {
  const key = affinityKey(affinity);
  if (key === "celestial") return "/assets/battle/elements/radiant.svg";
  return `/assets/battle/elements/${key}.svg`;
}

/** Build illustrated Creature Bio sections from species lore. */
export function buildCreatureBioSections(lore: SpeciesLore): TcgBioSection[] {
  const regionSlug = regionSlugFromName(lore.nativeRegion);
  const affinity = lore.affinity;
  const foods =
    lore.favoriteFoods.length > 0
      ? lore.favoriteFoods.join(", ")
      : lore.diet;

  const sections: TcgBioSection[] = [
    {
      id: "portrait",
      label: "Species",
      body: lore.shortBio,
      imageSrc: creaturePortraitPath(lore.slug),
      imageFallback: `/assets/pets/thumbs/${lore.slug}.webp`,
      imageAlt: `${lore.name} portrait`,
      imageLayout: "hero",
    },
    {
      id: "habitat",
      label: "Habitat",
      body: [
        `Native to ${lore.nativeRegion}.`,
        lore.origin,
        lore.secondaryHabitats.length > 0
          ? `Also found near ${lore.secondaryHabitats.join(", ")}.`
          : "",
      ]
        .filter(Boolean)
        .join(" "),
      ...habitatImageSrc(regionSlug),
      imageAlt: `${lore.nativeRegion} landscape`,
      imageLayout: "scenic",
    },
    {
      id: "behavior",
      label: "Behavior",
      body: [lore.naturalBehavior, lore.socialBehavior]
        .filter(Boolean)
        .join(" "),
      imageSrc: bioVignette("behavior", affinity),
      imageAlt: `${lore.name} social behavior`,
      imageLayout: "plate",
    },
    {
      id: "diet",
      label: "Diet",
      body: [lore.diet, foods ? `Favorite foods: ${foods}.` : ""]
        .filter(Boolean)
        .join(" "),
      imageSrc: bioVignette("diet", affinity),
      imageAlt: `${lore.name} diet`,
      imageLayout: "plate",
    },
    {
      id: "affinity",
      label: "Affinity",
      body: `${lore.name} channels ${affinity}${
        lore.secondaryAffinities.length > 0
          ? `, with secondary ties to ${lore.secondaryAffinities.join(", ")}`
          : ""
      }. ${lore.weatherPreference ? `Prefers ${lore.weatherPreference}.` : ""}`.trim(),
      imageSrc: elementPlate(affinity),
      imageAlt: `${affinity} affinity`,
      imageLayout: "plate",
    },
  ];

  return sections.filter((s) => s.body.trim().length > 0);
}
