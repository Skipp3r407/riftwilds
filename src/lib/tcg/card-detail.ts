import {
  getCardById,
  getNormalizedCardById,
  resolveCardImagePath,
  type TcgCard,
} from "@/content/tcg";
import { ROLE_DISPLAY } from "@/content/tcg/framework/roles";
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
  defense: number | null;
  health: number | null;
  speed: number | null;
  role: string | null;
  roleLabel: string | null;
  keywords: string[];
  passive: string | null;
  activeSummary: string | null;
  ultimateSummary: string | null;
  rulesText: string;
  flavorText: string;
  loreBlurb: string;
  cardImagePath: string;
  cleanArtPath: string | null;
  riftlingSlug: string | null;
  relatedRiftlings: string[];
  competitiveEligible: boolean;
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

  const normalized = getNormalizedCardById(defId);
  const resolved = resolveCardImagePath(card);
  const creatureBio = pickCreatureBio(card);
  const active = normalized?.abilities.find(
    (a) => a.timing === "activated" || a.timing === "battlecry",
  );
  const ultimate = normalized?.abilities.find((a) => a.timing === "ultimate");

  return {
    id: card.id,
    name: card.localization.name,
    type: card.type,
    element: card.element,
    rarity: card.rarity,
    energyCost: normalized?.energyCost ?? card.energyCost,
    attack: normalized?.attack ?? card.attack ?? null,
    defense: normalized?.defense ?? null,
    health: normalized?.health ?? card.health ?? null,
    speed: normalized?.speed ?? null,
    role: normalized?.role ?? null,
    roleLabel: normalized?.role
      ? ROLE_DISPLAY[normalized.role] ?? normalized.role
      : null,
    keywords: normalized?.keywords ?? card.keywords ?? [],
    passive: normalized?.passive ?? null,
    activeSummary: active?.text ?? null,
    ultimateSummary: ultimate?.text ?? null,
    rulesText: card.localization.rulesText || "",
    flavorText: card.localization.flavorText || "",
    loreBlurb: card.localization.loreBlurb || "",
    cardImagePath: resolved || `/assets/tcg/cards/${card.id}.webp`,
    cleanArtPath: normalized?.cleanArtPath ?? card.art.assetPath ?? null,
    riftlingSlug: card.riftlingSlug ?? null,
    relatedRiftlings: card.relatedRiftlings ?? [],
    competitiveEligible: normalized?.competitiveEligible ?? true,
    creatureBio,
    illustratedBio: pickIllustratedBio(card, creatureBio),
  };
}
