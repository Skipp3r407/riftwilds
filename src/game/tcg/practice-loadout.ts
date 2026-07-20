/**
 * Practice Board loadouts — variety for free practice only.
 * Ranked / invite / private paths must keep player-built deck lists intact.
 *
 * Teaching practice prefers solo-playable engine cards: units + damage/heal/Echo
 * spells. Equipment / relics stay out — they brick empty opening fields
 * (EQUIP_NO_TARGET) and several starters are catalog-item heavy after regen.
 * Terrain/traps stay out of random pools. Items (consumables) allowed if heal.
 */

import { getCardById, TCG_DECKS, TCG_FACTIONS, getDeckById, getHeroById } from "@/content/tcg";
import { resolveCardCategory } from "@/content/tcg/framework/card-categories";
import { CONSTRUCTED_RULES } from "@/content/tcg/framework/deck-rules";
import { getTcgCardDef } from "@/game/tcg/card-catalog";
import {
  expandContentDeck,
  materializeDeck,
  secureRandom,
  shuffleDeck,
} from "@/game/tcg/deck";
import { TCG_DEFAULTS, type TcgCardInstance } from "@/game/tcg/types";

export type PracticeLoadout = {
  deckId: string;
  cardIds: string[];
  commanderHeroId: string;
};

/** Minimum useful expanded copies before a starter may rotate into Practice Board. */
const MIN_PRACTICE_POOL_SIZE = CONSTRUCTED_RULES.deckSize;

/** Keep early plays available after a random 30-card slice. */
const MIN_EARLY_CURVE_CARDS = 10;
const EARLY_CURVE_MAX_COST = 2;

/**
 * True when Practice Board should deal this card.
 * Solo-playable only: companions / evolutions and combat spells / heal items.
 * Equipment needs a friendly unit — excluded from teaching pools entirely.
 */
export function isPracticeUsefulCard(cardId: string): boolean {
  const card = getCardById(cardId);
  if (!card) return false;

  const category = resolveCardCategory(card.type, card.id);

  if (
    category === "companion" ||
    category === "evolution" ||
    category === "commander"
  ) {
    return true;
  }

  // Attach / hold / set cards brick empty boards or need reaction windows.
  if (
    category === "equipment" ||
    category === "relic" ||
    category === "terrain" ||
    category === "trap"
  ) {
    return false;
  }

  if (category === "item") {
    // Consumable heals are fine for teaching; care-only toys without effects skip.
    for (const ab of card.abilities) {
      for (const fx of ab.effects) {
        if (fx.op === "heal" && typeof fx.value === "number" && fx.value > 0) {
          return true;
        }
        if (fx.op === "deal_damage" && typeof fx.value === "number" && fx.value > 0) {
          return true;
        }
      }
    }
    if (typeof card.attack === "number" && card.attack > 0) return true;
    return false;
  }

  if (category !== "spell") return false;

  if (typeof card.attack === "number" && card.attack > 0) return true;

  for (const ab of card.abilities) {
    for (const fx of ab.effects) {
      if (fx.op === "deal_damage" && typeof fx.value === "number" && fx.value > 0) {
        return true;
      }
      if (fx.op === "heal" && typeof fx.value === "number" && fx.value > 0) {
        return true;
      }
      if (fx.op === "echo_replay") return true;
    }
  }
  if (card.keywords.some((k) => String(k).toLowerCase() === "echo")) return true;
  if (card.keywords.some((k) => String(k).toLowerCase() === "heal")) return true;
  return false;
}

export function filterPracticeUsefulCards(cardIds: string[]): string[] {
  return cardIds.filter(isPracticeUsefulCard);
}

function cardEnergyCost(cardId: string): number {
  const def = getTcgCardDef(cardId);
  if (def) return def.riftCost;
  const card = getCardById(cardId);
  return card ? Math.max(0, card.energyCost) : 99;
}

function isEarlyCurveCard(cardId: string): boolean {
  return isPracticeUsefulCard(cardId) && cardEnergyCost(cardId) <= EARLY_CURVE_MAX_COST;
}

/**
 * Random legal 30-card slice from a useful-only pool, biased to keep a low curve.
 */
export function toPracticeConstructedSlice(
  cardIds: string[],
  rng: () => number = secureRandom,
): string[] {
  const useful = filterPracticeUsefulCards(cardIds);
  if (useful.length <= CONSTRUCTED_RULES.deckSize) return [...useful];

  const early = shuffleDeck(
    useful.filter((id) => cardEnergyCost(id) <= EARLY_CURVE_MAX_COST),
    rng,
  );
  const late = shuffleDeck(
    useful.filter((id) => cardEnergyCost(id) > EARLY_CURVE_MAX_COST),
    rng,
  );

  const earlyTarget = Math.min(
    MIN_EARLY_CURVE_CARDS,
    early.length,
    CONSTRUCTED_RULES.deckSize,
  );
  const pickedEarly = early.slice(0, earlyTarget);
  const earlyRest = early.slice(earlyTarget);
  const filler = shuffleDeck([...earlyRest, ...late], rng);
  const need = CONSTRUCTED_RULES.deckSize - pickedEarly.length;
  return shuffleDeck([...pickedEarly, ...filler.slice(0, need)], rng);
}

/** Curated starter ids legal for Practice Board rotation (playable pools only). */
export function listPracticeStarterDeckIds(): string[] {
  return TCG_DECKS.filter((d) => {
    if (d.kind !== "starter") return false;
    const useful = filterPracticeUsefulCards(expandContentDeck(d));
    return useful.length >= MIN_PRACTICE_POOL_SIZE;
  }).map((d) => d.id);
}

function commanderForStarterDeck(deckId: string, fallback: string): string {
  const faction = TCG_FACTIONS.find((f) => f.defaultStarterDeckId === deckId);
  const heroId = faction?.commanderHeroIds[0] ?? fallback;
  return getHeroById(heroId) ? heroId : fallback;
}

function pickRandomId(ids: string[], rng: () => number, avoid?: string): string {
  if (ids.length === 0) return avoid ?? "starter-fire";
  if (ids.length === 1) return ids[0]!;
  const pool = avoid && ids.length > 1 ? ids.filter((id) => id !== avoid) : ids;
  const idx = Math.floor(rng() * pool.length);
  return pool[Math.min(idx, pool.length - 1)]!;
}

/** Build a legal 30-card practice list from a content starter (useful cards only). */
export function buildPracticeStarterLoadout(
  deckId: string,
  opts?: { commanderFallback?: string; rng?: () => number },
): PracticeLoadout | null {
  const rng = opts?.rng ?? secureRandom;
  const deck = getDeckById(deckId);
  if (!deck || deck.kind !== "starter") return null;
  const pool = filterPracticeUsefulCards(expandContentDeck(deck));
  const cardIds = toPracticeConstructedSlice(pool, rng);
  if (cardIds.length < CONSTRUCTED_RULES.deckSize) return null;
  const commanderHeroId = commanderForStarterDeck(
    deckId,
    opts?.commanderFallback ?? "hero-elara-venn",
  );
  return { deckId, cardIds, commanderHeroId };
}

/**
 * True when the binder is still on a teaching/starter list (safe to rotate).
 * Custom / saved constructed decks are left as the player built them.
 */
export function isRotatablePracticeDeck(activeDeckId: string): boolean {
  if (!activeDeckId) return true;
  if (activeDeckId.startsWith("starter-")) return true;
  if (activeDeckId === "starter-showcase-20") return true;
  return false;
}

export type PracticeMatchLoadouts = {
  player: PracticeLoadout;
  ai: PracticeLoadout;
};

/**
 * Resolve player + AI practice decks for a fresh match / rematch.
 * Always re-rolls; never reuses prior shuffle state.
 */
export function resolvePracticeMatchLoadouts(input: {
  activeDeckId: string;
  activeDeck: string[];
  commanderHeroId?: string | null;
  rng?: () => number;
}): PracticeMatchLoadouts {
  const rng = input.rng ?? secureRandom;
  const starterIds = listPracticeStarterDeckIds();
  const fallbackCommander = input.commanderHeroId ?? "hero-elara-venn";

  let player: PracticeLoadout;
  if (isRotatablePracticeDeck(input.activeDeckId)) {
    const deckId = pickRandomId(starterIds, rng);
    player =
      buildPracticeStarterLoadout(deckId, {
        commanderFallback: fallbackCommander,
        rng,
      }) ?? {
        deckId: input.activeDeckId || "starter-fire",
        cardIds: toPracticeConstructedSlice(
          filterPracticeUsefulCards(input.activeDeck),
          rng,
        ),
        commanderHeroId: fallbackCommander,
      };
  } else {
    // Player-built list stays fixed; match engine still shuffles for opening hand.
    player = {
      deckId: input.activeDeckId,
      cardIds: [...input.activeDeck],
      commanderHeroId: fallbackCommander,
    };
  }

  const aiDeckId = pickRandomId(starterIds, rng, player.deckId);
  const ai =
    buildPracticeStarterLoadout(aiDeckId, {
      commanderFallback: "hero-kael-forge",
      rng,
    }) ?? {
      deckId: "starter-fire",
      cardIds: toPracticeConstructedSlice(
        filterPracticeUsefulCards(input.activeDeck),
        rng,
      ),
      commanderHeroId: "hero-kael-forge",
    };

  return { player, ai };
}

/**
 * Soft-mulligan for Practice Board: if opening hand has nothing affordable on
 * turn 1, swap the priciest hand card with a cheap playable from the deck.
 * Teaching-only — does not alter constructed deck composition.
 */
export function ensurePracticeOpeningHandPlayable(
  deck: TcgCardInstance[],
  opts?: { openingHand?: number; maxOpenCost?: number },
): TcgCardInstance[] {
  const openingHand = opts?.openingHand ?? TCG_DEFAULTS.openingHand;
  /** Turn-1 energy is 2 under Standard rules. */
  const maxOpenCost = opts?.maxOpenCost ?? TCG_DEFAULTS.riftEnergyStartMax;
  if (deck.length <= openingHand) return [...deck];

  const cards = [...deck];
  const hand = cards.slice(0, openingHand);
  const rest = cards.slice(openingHand);

  const affordable = (inst: TcgCardInstance) => {
    const def = getTcgCardDef(inst.defId);
    return Boolean(def && def.riftCost <= maxOpenCost && isPracticeUsefulCard(def.id));
  };

  if (hand.some(affordable)) return cards;

  const donorIdx = rest.findIndex(affordable);
  if (donorIdx < 0) {
    // Fall back to cost ≤ 2 so turn-2 teaching hands are rarely bricks.
    const midIdx = rest.findIndex((inst) => {
      const def = getTcgCardDef(inst.defId);
      return Boolean(
        def && def.riftCost <= EARLY_CURVE_MAX_COST && isPracticeUsefulCard(def.id),
      );
    });
    if (midIdx < 0) return cards;
    const handCost = (inst: TcgCardInstance) =>
      getTcgCardDef(inst.defId)?.riftCost ?? 99;
    let replaceAt = 0;
    for (let i = 1; i < hand.length; i += 1) {
      if (handCost(hand[i]!) > handCost(hand[replaceAt]!)) replaceAt = i;
    }
    const tmp = hand[replaceAt]!;
    hand[replaceAt] = rest[midIdx]!;
    rest[midIdx] = tmp;
    return [...hand, ...rest];
  }

  const handCost = (inst: TcgCardInstance) =>
    getTcgCardDef(inst.defId)?.riftCost ?? 99;
  let replaceAt = 0;
  for (let i = 1; i < hand.length; i += 1) {
    if (handCost(hand[i]!) > handCost(hand[replaceAt]!)) replaceAt = i;
  }
  const tmp = hand[replaceAt]!;
  hand[replaceAt] = rest[donorIdx]!;
  rest[donorIdx] = tmp;
  return [...hand, ...rest];
}

export function materializePracticeLoadout(
  loadout: PracticeLoadout,
): TcgCardInstance[] {
  // Fresh instance ids + shuffle. Opening-hand soft-mulligan runs in createTcgMatch
  // after makeSide's own shuffle so it is not undone.
  return shuffleDeck(materializeDeck(loadout.cardIds), secureRandom);
}
