/**
 * Map hatchery / care species slugs → cozy Live World companion actor sheets.
 * Ambient village props use separate `pw-prop-ambient-*` keys and never share
 * the follower's texture or anim keys.
 */

import { getSpeciesBySlug } from "@/game/creatures/species-catalog";
import { actorSheetTex, actorTex } from "@/game/live-world/systems/premium/asset-keys";

/** Cozy pixel companion actors (walk sheets under public/assets/game/actors/). */
export const COZY_COMPANION_ACTORS = [
  "riftling-sparklet",
  "riftling-mossbun",
  "riftling-emberpup",
  "riftling-frostnip",
  "riftling-tideling",
  "riftling-stoneling",
  "riftling-stormkit",
  "riftling-spiritwisp",
  "riftling-voidling",
  "riftling-alloybit",
  "riftling-radiantpup",
] as const;

export type CozyCompanionActor = (typeof COZY_COMPANION_ACTORS)[number];

/** Default when species unknown — Commons spark pup, not Alloybit. */
export const DEFAULT_COZY_COMPANION: CozyCompanionActor = "riftling-sparklet";

/** Affinity → distinct cozy palette (covers every launch hatch affinity). */
const AFFINITY_TO_COZY: Record<string, CozyCompanionActor> = {
  EMBER: "riftling-emberpup",
  GROVE: "riftling-mossbun",
  TIDE: "riftling-tideling",
  STORM: "riftling-stormkit",
  STONE: "riftling-stoneling",
  FROST: "riftling-frostnip",
  RADIANT: "riftling-radiantpup",
  VOID: "riftling-voidling",
  ALLOY: "riftling-alloybit",
  SPIRIT: "riftling-spiritwisp",
};

/**
 * Exact hatch-species overrides for common starter / hatch-flow pets.
 * Ensures Glowpup-adjacent Commons pets stay sparklet, Alloy pets stay alloybit, etc.
 */
const SLUG_TO_COZY: Partial<Record<string, CozyCompanionActor>> = {
  // Exact cozy / library name collisions
  frostnip: "riftling-frostnip",
  voidling: "riftling-voidling",
  // Ember
  cindercub: "riftling-emberpup",
  ashwing: "riftling-emberpup",
  embernewt: "riftling-emberpup",
  craterhorn: "riftling-emberpup",
  emberfox: "riftling-emberpup",
  slagpup: "riftling-emberpup",
  // Grove
  mossprig: "riftling-mossbun",
  bramblefox: "riftling-mossbun",
  groveowl: "riftling-mossbun",
  rootling: "riftling-mossbun",
  elderfern: "riftling-mossbun",
  fernfox: "riftling-mossbun",
  // Tide
  bubbloon: "riftling-tideling",
  coralurge: "riftling-tideling",
  tidewisp: "riftling-tideling",
  moonray: "riftling-tideling",
  tideotter: "riftling-tideling",
  brinepaw: "riftling-tideling",
  // Storm / spark Commons
  voltkit: "riftling-stormkit",
  staticat: "riftling-stormkit",
  stormmoth: "riftling-stormkit",
  spirekite: "riftling-stormkit",
  commonspark: "riftling-sparklet",
  peakibex: "riftling-stormkit",
  // Stone
  pebblit: "riftling-stoneling",
  quartzhorn: "riftling-stoneling",
  stonegrub: "riftling-stoneling",
  canyonbeetle: "riftling-stoneling",
  hearthstone: "riftling-stoneling",
  fossilhound: "riftling-stoneling",
  // Frost
  frostfin: "riftling-frostnip",
  snowpuff: "riftling-frostnip",
  veilhare: "riftling-frostnip",
  // Radiant
  luminara: "riftling-radiantpup",
  glimmerp: "riftling-radiantpup",
  radiantkit: "riftling-radiantpup",
  citadelmoth: "riftling-radiantpup",
  auralynx: "riftling-radiantpup",
  celestora: "riftling-radiantpup",
  // Void
  hollowshade: "riftling-voidling",
  mistwraith: "riftling-voidling",
  riftslug: "riftling-voidling",
  hollowmoth: "riftling-voidling",
  // Alloy
  gearling: "riftling-alloybit",
  ironbloom: "riftling-alloybit",
  cogpup: "riftling-alloybit",
  scrapfinch: "riftling-alloybit",
  // Spirit / Commons pup
  wisplet: "riftling-spiritwisp",
  riftpup: "riftling-sparklet",
  lanternjay: "riftling-spiritwisp",
  marshloom: "riftling-spiritwisp",
};

export function isCozyCompanionActor(key: string): key is CozyCompanionActor {
  return (COZY_COMPANION_ACTORS as readonly string[]).includes(key);
}

/** Resolve hatch species slug → cozy actor id (affinity fallback). */
export function cozyActorForSpecies(speciesSlug: string | null | undefined): CozyCompanionActor {
  if (!speciesSlug) return DEFAULT_COZY_COMPANION;
  const exact = SLUG_TO_COZY[speciesSlug];
  if (exact) return exact;
  const species = getSpeciesBySlug(speciesSlug);
  if (species?.affinity && AFFINITY_TO_COZY[species.affinity]) {
    return AFFINITY_TO_COZY[species.affinity]!;
  }
  return DEFAULT_COZY_COMPANION;
}

export type CompanionTextureChoice = {
  speciesSlug: string;
  actor: CozyCompanionActor;
  /** Spritesheet texture key (preferred). */
  sheetTex: string;
  /** Static frame texture key. */
  staticTex: string;
  /** Legacy generic fallback key. */
  legacySheetTex: string;
  walkAnim: string;
  idleAnim: string;
};

export function companionWalkAnimKey(actor: CozyCompanionActor): string {
  return `pw-pet-walk-${actor}`;
}

export function companionIdleAnimKey(actor: CozyCompanionActor): string {
  return `pw-pet-idle-${actor}`;
}

export function resolveCompanionTexture(
  speciesSlug: string | null | undefined,
): CompanionTextureChoice {
  const slug = speciesSlug?.trim() || "riftpup";
  const actor = cozyActorForSpecies(slug);
  return {
    speciesSlug: slug,
    actor,
    sheetTex: actorSheetTex(`${actor}-sheet`),
    staticTex: actorTex(actor),
    legacySheetTex: actorSheetTex("pet-riftling-sheet"),
    walkAnim: companionWalkAnimKey(actor),
    idleAnim: companionIdleAnimKey(actor),
  };
}

/**
 * Pick the best loaded Phaser texture for a companion choice.
 * Never returns an ambient prop key.
 */
export function pickLoadedCompanionTex(
  texturesExist: (key: string) => boolean,
  choice: CompanionTextureChoice,
): string {
  if (texturesExist(choice.sheetTex)) return choice.sheetTex;
  if (texturesExist(choice.staticTex)) return choice.staticTex;
  if (texturesExist(choice.legacySheetTex)) return choice.legacySheetTex;
  if (texturesExist(actorTex("pet-riftling"))) return actorTex("pet-riftling");
  return "pet-companion";
}

/** Display label for HUD / interact — species name, not generic Spark. */
export function companionPetLabel(speciesSlug: string | null | undefined): string {
  if (!speciesSlug) return "Companion";
  const sp = getSpeciesBySlug(speciesSlug);
  if (sp) return `${sp.name} Companion`;
  const pretty = speciesSlug.replace(/-/g, " ");
  return `${pretty.charAt(0).toUpperCase()}${pretty.slice(1)} Companion`;
}

/** All sheet asset basenames that BootScene should preload. */
export function cozyCompanionSheetBasenames(): string[] {
  return COZY_COMPANION_ACTORS.map((a) => `${a}-sheet`);
}

export function cozyCompanionStaticBasenames(): string[] {
  return [...COZY_COMPANION_ACTORS];
}
