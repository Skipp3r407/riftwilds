import { getCardById, resolveCardImagePath, type TcgCard } from "@/content/tcg";
import { getSpeciesLore } from "@/content/pets/lore";
import type { SpeciesLore } from "@/lib/pets/lore-types";

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
  } | null;
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
    };
  }
  return null;
}

export function getTcgCardDetail(defId: string): TcgCardDetailView | null {
  const card = getCardById(defId);
  if (!card) return null;

  const resolved = resolveCardImagePath(card);
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
    creatureBio: pickCreatureBio(card),
  };
}
