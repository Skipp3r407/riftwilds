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

/**
 * Free Commons town-keeper portrait unlocks (onboarding cast).
 * Regional named heroes remain purchasable cosmetics.
 */
export const STARTER_CHARACTER_NPC_SLUGS = [
  "elara-venn",
  "rowan-vale",
  "mira-shellbright",
  "bram-ironroot",
  "tessa-windmere",
  "archivist-solen",
  "captain-orren",
  "nyla-brook",
  "pip-gearwhistle",
  "rook-emberfall",
] as const;

/** Free lore portrait ids (origin / story companions). */
export const STARTER_LORE_AVATAR_IDS = ["first-riftling"] as const;

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

export function isStarterCharacterNpcSlug(slug: string): boolean {
  return (STARTER_CHARACTER_NPC_SLUGS as readonly string[]).includes(slug);
}

export function isStarterLoreAvatarId(id: string): boolean {
  return (STARTER_LORE_AVATAR_IDS as readonly string[]).includes(id);
}
