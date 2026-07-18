/**
 * Riftwilds TCG content loader — data-first import surface for the battle engine.
 * Does not overwrite pets/regions/lore; cards reference existing slugs/regions.
 */

import type {
  TcgBoardTheme,
  TcgCard,
  TcgCardFrame,
  TcgContentBundle,
  TcgDeck,
  TcgExpansion,
  TcgHero,
  TcgKeyword,
} from "@/content/tcg/types";

import animationManifest from "@/content/tcg/data/animationManifest.json";
import artPrompts from "@/content/tcg/data/artPrompts.json";
import boardThemes from "@/content/tcg/data/boardThemes.json";
import bundle from "@/content/tcg/data/bundle.json";
import cardFrames from "@/content/tcg/data/cardFrames.json";
import cardImages from "@/content/tcg/data/cardImages.json";
import cards from "@/content/tcg/data/cards.json";
import decks from "@/content/tcg/data/decks.json";
import expansions from "@/content/tcg/data/expansions.json";
import heroes from "@/content/tcg/data/heroes.json";
import keywords from "@/content/tcg/data/keywords.json";
import soundManifest from "@/content/tcg/data/soundManifest.json";

export type * from "@/content/tcg/types";

/** JSON imports are wider than schema (optional keys); cast via unknown. */
export const TCG_BUNDLE = bundle as unknown as TcgContentBundle;
export const TCG_CARDS = cards as unknown as TcgCard[];
export const TCG_HEROES = heroes as unknown as TcgHero[];
export const TCG_DECKS = decks as unknown as TcgDeck[];
export const TCG_KEYWORDS = keywords as unknown as TcgKeyword[];
export const TCG_EXPANSIONS = expansions as unknown as TcgExpansion[];
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

export function getCardById(id: string): TcgCard | undefined {
  return TCG_CARDS.find((c) => c.id === id);
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
  return TCG_HEROES.find((h) => h.id === id);
}

export function getDeckById(id: string): TcgDeck | undefined {
  return TCG_DECKS.find((d) => d.id === id);
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
