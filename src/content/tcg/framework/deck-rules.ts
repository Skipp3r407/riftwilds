/**
 * Constructed deck rules — AAA launch format.
 * 30 cards + 1 Commander. Copy limits by rarity. Cosmetics never count as power.
 */

import type { TcgCard, TcgHero, TcgRarity } from "@/content/tcg/types";
import { normalizeCard } from "@/content/tcg/framework/normalize-card";

export const CONSTRUCTED_RULES = {
  /** Exact main-deck size (commander is separate). */
  deckSize: 30,
  minDeckSize: 30,
  maxDeckSize: 30,
  requireCommander: true,
  /** Cosmetic variants resolve to baseCardId for copy limits. */
  cosmeticsArePowerNeutral: true,
  f2pCompetitive:
    "Every legal competitive deck is buildable via starter grants + soft-currency craft. No crypto / SOL required.",
  copyLimits: {
    common: 3,
    uncommon: 3,
    rare: 2,
    epic: 1,
    legendary: 1,
    mythic: 1,
    founder: 1,
    seasonal: 2,
    holiday: 2,
    animated: 3,
    foil: 3,
    signed: 1,
    collector: 1,
  } as Record<TcgRarity | string, number>,
} as const;

export type DeckValidationResult =
  | {
      ok: true;
      size: number;
      commanderHeroId: string;
      formatId: string;
    }
  | { ok: false; reason: string; code: string };

function maxCopiesFor(card: TcgCard): number {
  return CONSTRUCTED_RULES.copyLimits[card.rarity] ?? 3;
}

/** Resolve cosmetic shell → gameplay id for legality. */
export function gameplayCardId(card: TcgCard): string {
  if (card.baseCardId) return card.baseCardId;
  return card.id;
}

export type DeckLookup = {
  getCard: (id: string) => TcgCard | undefined;
  getHero: (id: string) => TcgHero | undefined;
};

export function validateConstructedDeck(
  cardIds: string[],
  commanderHeroId: string | null | undefined,
  lookup: DeckLookup,
  opts?: { formatId?: string; allowNonCompetitive?: boolean },
): DeckValidationResult {
  const formatId = opts?.formatId ?? "standard";

  if (!commanderHeroId) {
    return {
      ok: false,
      reason: "Choose a Commander (1 hero — separate from the 30-card deck).",
      code: "COMMANDER_REQUIRED",
    };
  }
  if (!lookup.getHero(commanderHeroId)) {
    return { ok: false, reason: "Unknown commander", code: "COMMANDER_UNKNOWN" };
  }

  if (cardIds.length !== CONSTRUCTED_RULES.deckSize) {
    return {
      ok: false,
      reason: `Constructed decks must be exactly ${CONSTRUCTED_RULES.deckSize} cards (have ${cardIds.length}).`,
      code: "DECK_SIZE",
    };
  }

  const counts = new Map<string, number>();
  for (const id of cardIds) {
    const raw = lookup.getCard(id);
    if (!raw) {
      return { ok: false, reason: `Unknown card ${id}`, code: "UNKNOWN_CARD" };
    }
    const card = normalizeCard(raw);
    if (!opts?.allowNonCompetitive && !card.competitiveEligible) {
      return {
        ok: false,
        reason: `${card.localization.name} is not competitive-eligible (lore/prop/cosmetic).`,
        code: "NON_COMPETITIVE",
      };
    }
    const key = gameplayCardId(card);
    const n = (counts.get(key) ?? 0) + 1;
    const max = maxCopiesFor(card);
    if (n > max) {
      return {
        ok: false,
        reason: `Too many copies of ${card.localization.name} (max ${max} for ${card.rarity}).`,
        code: "COPY_LIMIT",
      };
    }
    counts.set(key, n);
  }

  return {
    ok: true,
    size: cardIds.length,
    commanderHeroId,
    formatId,
  };
}

/** Slice oversized teaching pools to a legal constructed list. */
export function toConstructedSlice(cardIds: string[]): string[] {
  if (cardIds.length <= CONSTRUCTED_RULES.deckSize) return [...cardIds];
  return cardIds.slice(0, CONSTRUCTED_RULES.deckSize);
}
