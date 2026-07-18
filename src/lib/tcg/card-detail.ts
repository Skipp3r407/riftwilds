import { getCardById, resolveCardImagePath, type TcgCard } from "@/content/tcg";
import { contentPackForRegion } from "@/content/regions";
import { getSpeciesLore } from "@/content/pets/lore";
import type { SpeciesLore } from "@/lib/pets/lore-types";
import {
  buildCreatureBioSections,
  buildPlaceBioSections,
  buildRegionBioSections,
  type TcgBioSection,
} from "@/lib/tcg/bio-sections";

export type TcgIllustratedBio = {
  kind: "creature" | "region" | "place";
  title: string;
  subtitle?: string;
  sections: TcgBioSection[];
  /** Creature-only keeper notes. */
  standardBio?: string;
};

export type TcgCardDetailView = {
  id: string;
  name: string;
  type: string;
  element: string;
  rarity: string;
  energyCost: number;
  attack: number | null;
  health: number | null;
  keywords: string[];
  rulesText: string;
  flavorText: string;
  loreBlurb: string;
  cardImagePath: string;
  riftlingSlug: string | null;
  relatedRiftlings: string[];
  /** Present only when a real species lore entry exists. */
  creatureBio: {
    slug: string;
    name: string;
    title: string;
    shortBio: string;
    standardBio: string;
    favoriteFoods: string[];
    nativeRegion: string;
    affinity: string;
    /** Illustrated bio sections (portrait, habitat, behavior, diet, affinity). */
    sections: TcgBioSection[];
  } | null;
  /** Region / place illustrated bio (locations, stalls, props). */
  illustratedBio: TcgIllustratedBio | null;
};

function pickCreatureBio(card: TcgCard): TcgCardDetailView["creatureBio"] {
  const candidates = [
    card.riftlingSlug,
    ...card.relatedRiftlings,
  ].filter((s): s is string => Boolean(s));

  for (const slug of candidates) {
    const lore: SpeciesLore | undefined = getSpeciesLore(slug);
    if (!lore) continue;
    return {
      slug: lore.slug,
      name: lore.name,
      title: lore.title,
      shortBio: lore.shortBio,
      standardBio: lore.standardBio,
      favoriteFoods: lore.favoriteFoods ?? [],
      nativeRegion: lore.nativeRegion,
      affinity: lore.affinity,
      sections: buildCreatureBioSections(lore),
    };
  }
  return null;
}

function pickIllustratedBio(
  card: TcgCard,
  creatureBio: TcgCardDetailView["creatureBio"],
): TcgIllustratedBio | null {
  if (creatureBio) {
    return {
      kind: "creature",
      title: creatureBio.name,
      subtitle: [creatureBio.title, creatureBio.nativeRegion, creatureBio.affinity]
        .filter(Boolean)
        .join(" · "),
      sections: creatureBio.sections,
      standardBio: creatureBio.standardBio,
    };
  }

  const isLocationLike =
    card.type === "location" ||
    card.type === "weather" ||
    String(card.id).includes("-prop-") ||
    String(card.id).includes("-l-");

  if (!isLocationLike) return null;

  const regionId = card.regionId || null;
  const isRegionCard =
    String(card.id).includes("-region-") ||
    (card.type === "location" &&
      regionId &&
      !String(card.id).includes("-prop-") &&
      Boolean(contentPackForRegion(regionId)));

  if (isRegionCard && regionId) {
    const pack = contentPackForRegion(regionId);
    if (pack) {
      return {
        kind: "region",
        title: pack.regionName,
        subtitle: "Region lore",
        sections: buildRegionBioSections(pack),
      };
    }
  }

  // Named landmark locations (plaza, pier, etc.) still use region packs when available
  if (card.type === "location" && regionId && !String(card.id).includes("-prop-")) {
    const pack = contentPackForRegion(regionId);
    if (pack) {
      return {
        kind: "region",
        title: card.localization.name,
        subtitle: `${pack.regionName} · Place lore`,
        sections: buildRegionBioSections(pack),
      };
    }
  }

  const sections = buildPlaceBioSections({
    id: card.id,
    name: card.localization.name,
    regionId,
    flavorText: card.localization.flavorText,
    loreBlurb: card.localization.loreBlurb,
  });
  if (sections.length === 0) return null;

  return {
    kind: "place",
    title: card.localization.name,
    subtitle: "Place lore",
    sections,
  };
}

export function getTcgCardDetail(defId: string): TcgCardDetailView | null {
  const card = getCardById(defId);
  if (!card) return null;

  const resolved = resolveCardImagePath(card);
  const creatureBio = pickCreatureBio(card);
  return {
    id: card.id,
    name: card.localization.name,
    type: card.type,
    element: card.element,
    rarity: card.rarity,
    energyCost: card.energyCost,
    attack: card.attack ?? null,
    health: card.health ?? null,
    keywords: card.keywords ?? [],
    rulesText: card.localization.rulesText || "",
    flavorText: card.localization.flavorText || "",
    loreBlurb: card.localization.loreBlurb || "",
    cardImagePath: resolved || `/assets/tcg/cards/${card.id}.webp`,
    riftlingSlug: card.riftlingSlug ?? null,
    relatedRiftlings: card.relatedRiftlings ?? [],
    creatureBio,
    illustratedBio: pickIllustratedBio(card, creatureBio),
  };
}
