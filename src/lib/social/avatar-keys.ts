/**
 * Shared avatar key helpers + free starter slug list (no unlock logic).
 */

/**
 * Always-unlocked starter Riftling cosmetics.
 * Does not grant pets — visible even with empty hatchery.
 */
export const STARTER_RIFTLING_AVATAR_SLUGS = [
  "cindercub",
  "mossprig",
  "bubbloon",
  "voltkit",
  "pebblit",
  "wisplet",
  "frostnip",
  "commonspark",
  "emberfox",
  "tideotter",
  "snowpuff",
  "dreamhare",
] as const;

export function petAvatarKey(petPublicId: string): string {
  return `pet:${petPublicId}`;
}

export function speciesAvatarKey(speciesSlug: string): string {
  return `species:${speciesSlug}`;
}

export function npcAvatarKey(slug: string): string {
  return `npc:${slug}`;
}

export function loreAvatarKey(id: string): string {
  return `lore:${id}`;
}

export function brandAvatarKey(id: string): string {
  return `brand:${id}`;
}

export function isStarterRiftlingAvatarSlug(slug: string): boolean {
  return (STARTER_RIFTLING_AVATAR_SLUGS as readonly string[]).includes(slug);
}
