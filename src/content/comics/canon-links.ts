/**
 * Comic → Codex / TCG deep-link helpers.
 * Official Riftwilds names + routes only — no third-party IP.
 */

import type { ComicCanonLink, ComicCharacterRef } from "@/content/comics/types";

/** Known companion / creature species that appear in comics + TCG. */
export const COMIC_CREATURE_CANON: Record<
  string,
  { speciesSlug: string; familyId: string; cardId: string; abilityId?: string }
> = {
  ashwing: {
    speciesSlug: "ashwing",
    familyId: "family-ashwing",
    cardId: "rotr-c-ashwing",
  },
  bramblefox: {
    speciesSlug: "bramblefox",
    familyId: "family-bramblefox",
    cardId: "rotr-c-bramblefox",
    abilityId: "forest-bond",
  },
  mossprig: {
    speciesSlug: "mossprig",
    familyId: "family-mossprig",
    cardId: "rotr-c-mossprig",
  },
  thornling: {
    speciesSlug: "thornling",
    familyId: "family-thornling",
    cardId: "rotr-c-thornling",
  },
  wisplet: {
    speciesSlug: "wisplet",
    familyId: "family-wisplet",
    cardId: "rotr-c-wisplet",
  },
  echoquill: {
    speciesSlug: "echoquill",
    familyId: "family-echoquill",
    cardId: "rotr-c-echoquill",
    abilityId: "memory-trace",
  },
};

export function canonLinkForSpecies(speciesKey: string): ComicCanonLink | undefined {
  const key = speciesKey.toLowerCase().replace(/\s+/g, "");
  const row = COMIC_CREATURE_CANON[key];
  if (!row) return undefined;
  return {
    riftlingSlug: row.speciesSlug,
    tcgFamilyId: row.familyId,
    tcgCardId: row.cardId,
    abilityId: row.abilityId,
    label: speciesKey,
  };
}

export function characterWithCanon(
  name: string,
  role: string,
  blurb: string,
  speciesKey?: string,
): ComicCharacterRef {
  const link = speciesKey ? canonLinkForSpecies(speciesKey) : undefined;
  return {
    name,
    role,
    blurb,
    speciesSlug: link?.riftlingSlug,
    canonLink: link,
  };
}

/** Resolve the best public href for a canon link. */
export function resolveCanonHref(link: ComicCanonLink): string | null {
  if (link.href) return link.href;
  if (link.worldCodexEntryId) return `/codex/world/${link.worldCodexEntryId}`;
  if (link.riftlingSlug) return `/codex/riftlings/${link.riftlingSlug}`;
  if (link.tcgFamilyId) return `/tcg/codex/${link.tcgFamilyId}`;
  if (link.tcgCardId) return `/tcg/collection?card=${encodeURIComponent(link.tcgCardId)}`;
  return null;
}

export function deckBuilderHref(cardId?: string): string {
  if (!cardId) return "/tcg/deck-builder";
  return `/tcg/deck-builder?highlight=${encodeURIComponent(cardId)}`;
}

/** Infer species from a speaker / hotspot label for auto-linking. */
export function inferSpeciesFromText(text: string): string | undefined {
  const lower = text.toLowerCase();
  for (const key of Object.keys(COMIC_CREATURE_CANON)) {
    if (lower.includes(key)) return key;
  }
  return undefined;
}
