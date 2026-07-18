/**
 * Live World overworld NPC textures + animation helpers.
 * Sheets: public/assets/npcs/<region>/<slug>/overworld-sheet.png (4×128 frames).
 */

export const NPC_OVERWORLD_FRAME = 128;
export const NPC_OVERWORLD_FRAMES = 4;

/** Commons NPCs present on the Riftwild Commons blueprint (named + ambient). */
export const COMMONS_OVERWORLD_NPC_SLUGS = [
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
  "plaza-vendor-cal",
  "plaza-musician-reo",
  "plaza-child-mim",
  "farm-hand-jot",
  "dock-sweeper-ana",
  "scribe-runner-kel",
  "cook-pot-uma",
  "gardener-sip",
  "guard-east-ryn",
  "guard-west-dao",
  "guard-portal-hex",
  "riftling-plaza-emberkit",
  "riftling-hatchery-glowpup",
  "riftling-market-pouchling",
] as const;

export type CommonsOverworldNpcSlug = (typeof COMMONS_OVERWORLD_NPC_SLUGS)[number];

export function npcSheetKey(slug: string): string {
  return `npc-sheet-${slug}`;
}

export function npcIdleAnimKey(slug: string): string {
  return `npc-${slug}-idle`;
}

export function npcWalkAnimKey(slug: string): string {
  return `npc-${slug}-walk`;
}

/** Behaviors that patrol / wander on the map (vs rooted idle bob). */
export function isMovingNpcBehavior(behavior: string): boolean {
  return npcWanderAmplitude(behavior) > 0;
}

/** True ambient activity — light shuffle even when amplitude is tiny. */
export function isAmbientActivityBehavior(behavior: string): boolean {
  return (
    behavior === "forge" ||
    behavior === "repair" ||
    behavior === "organize_goods" ||
    behavior === "tend_eggs" ||
    behavior === "mix_remedies" ||
    behavior === "read" ||
    behavior === "cook" ||
    behavior === "garden" ||
    behavior === "sweep" ||
    behavior === "play" ||
    behavior === "music" ||
    behavior === "work" ||
    behavior === "craft" ||
    behavior === "idle"
  );
}

/** Wander amplitude in px (named NPCs stay closer to home). */
export function npcWanderAmplitude(behavior: string): number {
  if (behavior === "patrol" || behavior === "scout") return 36;
  if (behavior === "pace" || behavior === "train") return 28;
  if (behavior === "look_around" || behavior === "fish") return 18;
  // Light workstation shuffle so forge/shop/read NPCs still feel alive
  if (
    behavior === "forge" ||
    behavior === "repair" ||
    behavior === "organize_goods" ||
    behavior === "tend_eggs" ||
    behavior === "mix_remedies" ||
    behavior === "cook" ||
    behavior === "garden" ||
    behavior === "sweep" ||
    behavior === "work" ||
    behavior === "craft"
  ) {
    return 14;
  }
  if (behavior === "play" || behavior === "music") return 20;
  if (behavior === "read") return 8;
  // Default: every Commons NPC gets a subtle ambient shuffle (never frozen)
  if (behavior === "idle" || !behavior) return 10;
  return 8;
}

export function npcDisplayHeight(slug: string): number {
  if (slug.startsWith("riftling-")) return 42;
  if (slug.startsWith("plaza-child-") || slug.includes("child")) return 44;
  if (slug.startsWith("guard-")) return 54;
  // Named Commons cast — slightly taller for readability next to cutout facades
  return 52;
}
