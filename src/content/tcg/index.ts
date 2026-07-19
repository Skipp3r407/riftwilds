/**
 * Riftwilds TCG content loader — data-first import surface for the battle engine.
 * Does not overwrite pets/regions/lore; cards reference existing slugs/regions.
 * AAA framework: `@/content/tcg/framework` (registry, deck rules, craft, formats).
 */

import type {
  TcgBoardTheme,
  TcgCard,
  TcgCardFamily,
  TcgCardFamilyBundle,
  TcgCardFrame,
  TcgContentBundle,
  TcgDeck,
  TcgExpansion,
  TcgFaction,
  TcgHero,
  TcgKeyword,
  TcgStarterSet,
} from "@/content/tcg/types";
import {
  buildCardRegistry,
  type CardRegistry,
} from "@/content/tcg/framework/registry";
import type { LiveOpsConfig } from "@/content/tcg/framework/live-ops";
import type { TcgFormatDef } from "@/content/tcg/framework/formats";
import { DEFAULT_FORMATS } from "@/content/tcg/framework/formats";
import { DEFAULT_LIVE_OPS } from "@/content/tcg/framework/live-ops";
import { CONSTRUCTED_RULES } from "@/content/tcg/framework/deck-rules";
import { normalizeCard } from "@/content/tcg/framework/normalize-card";

import animationManifest from "@/content/tcg/data/animationManifest.json";
import artPrompts from "@/content/tcg/data/artPrompts.json";
import boardThemes from "@/content/tcg/data/boardThemes.json";
import bundle from "@/content/tcg/data/bundle.json";
import cardFamilies from "@/content/tcg/data/card-families.json";
import cardFrames from "@/content/tcg/data/cardFrames.json";
import cardImages from "@/content/tcg/data/cardImages.json";
import cards from "@/content/tcg/data/cards.json";
import decks from "@/content/tcg/data/decks.json";
import expansions from "@/content/tcg/data/expansions.json";
import factions from "@/content/tcg/data/factions.json";
import formatsJson from "@/content/tcg/data/formats.json";
import heroes from "@/content/tcg/data/heroes.json";
import keywords from "@/content/tcg/data/keywords.json";
import launchPool from "@/content/tcg/data/launch-pool.json";
import liveOpsJson from "@/content/tcg/data/live-ops.json";
import soundManifest from "@/content/tcg/data/soundManifest.json";
import starterSet20 from "@/content/tcg/data/starter-set-20.json";
import cardStatsV2 from "@/content/tcg/data/migrations/card-stats-v2.json";
import {
  setStatMigrationBundle,
  type CardStatMigrationBundle,
} from "@/content/tcg/framework/apply-stat-migration";

export type * from "@/content/tcg/types";
export { CONSTRUCTED_RULES, normalizeCard };

/** Versioned combat-stat overlays (merged in normalizeCard). */
setStatMigrationBundle(cardStatsV2 as unknown as CardStatMigrationBundle);
export const TCG_CARD_STATS_V2 = cardStatsV2 as unknown as CardStatMigrationBundle;

/** JSON imports are wider than schema (optional keys); cast via unknown. */
export const TCG_BUNDLE = bundle as unknown as TcgContentBundle;
export const TCG_CARDS = cards as unknown as TcgCard[];
export const TCG_HEROES = heroes as unknown as TcgHero[];
export const TCG_DECKS = decks as unknown as TcgDeck[];
export const TCG_KEYWORDS = keywords as unknown as TcgKeyword[];
export const TCG_EXPANSIONS = expansions as unknown as TcgExpansion[];
export const TCG_FACTIONS = factions as unknown as TcgFaction[];
export const TCG_STARTER_SET_20 = starterSet20 as unknown as TcgStarterSet;
export const TCG_CARD_FAMILY_BUNDLE =
  cardFamilies as unknown as TcgCardFamilyBundle;
export const TCG_CARD_FAMILIES = TCG_CARD_FAMILY_BUNDLE.families;
export const TCG_BOARD_THEMES = boardThemes as unknown as TcgBoardTheme[];
export const TCG_CARD_FRAMES = cardFrames as unknown as TcgCardFrame[];
export const TCG_ART_PROMPTS = artPrompts;
export const TCG_SOUND_MANIFEST = soundManifest;
export const TCG_ANIMATION_MANIFEST = animationManifest;
export const TCG_CARD_IMAGES = cardImages as {
  version: number;
  generatedAt: string | null;
  count: number;
  outputDir: string;
  cards: Record<string, string>;
};
export const TCG_FORMATS = (
  Array.isArray(formatsJson) && formatsJson.length > 0
    ? formatsJson
    : DEFAULT_FORMATS
) as TcgFormatDef[];
export const TCG_LIVE_OPS = {
  ...DEFAULT_LIVE_OPS,
  ...(liveOpsJson as Partial<LiveOpsConfig>),
} as LiveOpsConfig;
export const TCG_LAUNCH_POOL = launchPool as {
  version: number;
  targetCount: number;
  description: string;
  cardIds: string[];
};

const cardById = new Map(TCG_CARDS.map((c) => [c.id, c]));
const heroById = new Map(TCG_HEROES.map((h) => [h.id, h]));

let _registry: CardRegistry | null = null;

export function getTcgRegistry(): CardRegistry {
  if (!_registry) {
    _registry = buildCardRegistry(TCG_CARDS, TCG_EXPANSIONS, "aaa-1");
  }
  return _registry;
}

export function getCardById(id: string): TcgCard | undefined {
  return cardById.get(id);
}

/** Prefer composited card face, then source art thumb/icon. */
export function resolveCardImagePath(card: TcgCard): string | undefined {
  return (
    card.art.cardImagePath ||
    TCG_CARD_IMAGES.cards[card.id] ||
    card.art.assetPath
  );
}

export function getHeroById(id: string): TcgHero | undefined {
  return heroById.get(id);
}

/** Normalized AAA view of a card (defense/speed/role/craftCosts derived). */
export function getNormalizedCardById(id: string) {
  const raw = getCardById(id);
  return raw ? normalizeCard(raw) : undefined;
}

export function getFactionById(id: string): TcgFaction | undefined {
  return TCG_FACTIONS.find((f) => f.id === id);
}

export function getDeckById(id: string): TcgDeck | undefined {
  return TCG_DECKS.find((d) => d.id === id);
}

/** Commander = content hero used as match identity (passives Phase 2). */
export function getCommanderById(id: string): TcgHero | undefined {
  return getHeroById(id);
}

export function getCardFamilyById(id: string): TcgCardFamily | undefined {
  return TCG_CARD_FAMILIES.find((f) => f.id === id);
}

export function getCardFamilyBySpecies(
  speciesSlug: string,
): TcgCardFamily | undefined {
  return TCG_CARD_FAMILIES.find((f) => f.speciesSlug === speciesSlug);
}

export function getCardFamilyForCardId(
  cardId: string,
): TcgCardFamily | undefined {
  return TCG_CARD_FAMILIES.find((f) =>
    f.stages.some((s) => s.cardId === cardId),
  );
}

export function cardsForRiftling(slug: string): TcgCard[] {
  return TCG_CARDS.filter((c) => c.riftlingSlug === slug || c.relatedRiftlings.includes(slug));
}

export function cardsForExpansion(expansionId: string): TcgCard[] {
  return TCG_CARDS.filter((c) => c.expansionId === expansionId);
}

export function deckCardCount(deck: TcgDeck): number {
  return Object.values(deck.cards).reduce((a, b) => a + b, 0);
}

/** Rift Energy rules (shared by UI + engine). */
export const RIFT_ENERGY = TCG_BUNDLE.riftEnergy;
