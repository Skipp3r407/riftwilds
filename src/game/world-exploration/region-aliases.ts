/**
 * Quest catalogs sometimes use lore region keys (Sproutfall Grove, Cindercrag Basin)
 * that map onto Live World playable slugs.
 */

import { REGION_BY_SLUG, REGION_IDENTITIES } from "@/game/world-maps/regions";

const ALIASES: Record<string, string> = {
  "sproutfall-grove": "elderwood-forest",
  "cindercrag-basin": "ember-crater",
  grove: "elderwood-forest",
  basin: "ember-crater",
  commons: "riftwild-commons",
};

/** Resolve any quest/lore region key to a Live World region slug, or null. */
export function resolveLiveRegionSlug(regionKey: string | undefined | null): string | null {
  if (!regionKey) return null;
  const key = regionKey.trim().toLowerCase();
  if (REGION_BY_SLUG[key]) return key;
  if (ALIASES[key]) return ALIASES[key]!;
  const byId = REGION_IDENTITIES.find((r) => r.id === key);
  if (byId) return byId.slug;
  return null;
}

export function isLiveWorldRegion(slug: string): boolean {
  return Boolean(REGION_BY_SLUG[slug]);
}
