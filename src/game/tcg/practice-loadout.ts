/**
 * Practice Board loadouts — variety for free practice only.
 * Ranked / invite / private paths must keep player-built deck lists intact.
 *
 * Teaching practice prefers solo-playable engine cards: units + damage/heal/Echo
 * spells. Equipment / relics stay out — they brick empty opening fields
 * (EQUIP_NO_TARGET) and several starters are catalog-item heavy after regen.
 * Terrain/traps stay out of random pools. Items (consumables) allowed if heal.
 *
 * Unique-only: each cardId appears at most once. Companion variants with
 * different ids (e.g. Dawnkit vs Dawnkit Companion) are not duplicates.
 */

import { getCardById, TCG_CARDS, TCG_DECKS, TCG_FACTIONS, TCG_LAUNCH_POOL, getDeckById, getHeroById } from "@/content/tcg";
import { resolveCardCategory } from "@/content/tcg/framework/card-categories";
import { isCombatEligibleCard } from "@/content/tcg/framework/combat-eligibility";
import { CONSTRUCTED_RULES } from "@/content/tcg/framework/deck-rules";
import { getTcgCardDef } from "@/game/tcg/card-catalog";
import {
  expandContentDeck,
  materializeDeck,
  padUniqueToConstructedSize,
  secureRandom,
  shuffleDeck,
  uniqueCardIds,
} from "@/game/tcg/deck";
import { ensureOpeningHandPlayable } from "@/game/tcg/rules/opening-hand";
import { TCG_DEFAULTS, type TcgCardInstance } from "@/game/tcg/types";

export type PracticeLoadout = {
  deckId: string;
  cardIds: string[];
  commanderHeroId: string;
};

/**
 * Minimum unique useful cards a starter must contribute before Practice Board
 * may rotate it. Undersized pools are padded from the launch catalog.
 */
const MIN_PRACTICE_POOL_SIZE = 12;

/** Keep early plays available after a random 29-card unique slice. */
const MIN_EARLY_CURVE_CARDS = 10;
const EARLY_CURVE_MAX_COST = 2;

/**
 * True when Practice Board should deal this card.
 * Solo-playable combat only: companions / evolutions and combat spells.
 * Food / care / medicine / materials never appear — even if they have heal ops.
 * Equipment needs a friendly unit — excluded from teaching pools entirely.
 */
export function isPracticeUsefulCard(cardId: string): boolean {
  const card = getCardById(cardId);
  if (!card) return false;

  // Hard gate: Inventory / Companion Care goods never enter Practice hands.
  if (!isCombatEligibleCard(card.id, card.type)) return false;

  const category = resolveCardCategory(card.type, card.id);

  // Commanders are a separate hero slot (not shuffled / not hand-played).
  // Tokens are free by design but do not belong in teaching constructed pools.
  if (category === "commander" || card.isToken) {
    return false;
  }

  if (category === "companion" || category === "evolution") {
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

  // Legacy item category that somehow remained combat-eligible (none expected).
  if (category === "item") {
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

/** Unique practice-useful ids from launch pool + full catalog (fill source). */
export function listPracticeCatalogFillIds(): string[] {
  const launch = filterPracticeUsefulCards(TCG_LAUNCH_POOL.cardIds);
  const all = filterPracticeUsefulCards(TCG_CARDS.map((c) => c.id));
  return uniqueCardIds([...launch, ...all]);
}

function cardEnergyCost(cardId: string): number {
  const def = getTcgCardDef(cardId);
  if (def) return def.riftCost;
  const card = getCardById(cardId);
  return card ? Math.max(0, card.energyCost) : 99;
}

/**
 * Pad a unique useful pool up to constructed size from the launch catalog.
 * Never reintroduces a cardId already present. Falls back to any unique
 * catalog card (via padUniqueToConstructedSize) if useful-only is still short.
 */
function padUniquePracticePool(
  seedIds: string[],
  rng: () => number,
): string[] {
  const unique = uniqueCardIds(filterPracticeUsefulCards(seedIds));
  if (unique.length >= CONSTRUCTED_RULES.deckSize) return unique;
  const have = new Set(unique);
  const filler = shuffleDeck(
    listPracticeCatalogFillIds().filter((id) => !have.has(id)),
    rng,
  );
  const usefulPadded = [...unique, ...filler];
  if (usefulPadded.length >= CONSTRUCTED_RULES.deckSize) return usefulPadded;
  // Extremely small useful pools — pad with any unique catalog cards.
  return padUniqueToConstructedSize(usefulPadded, rng);
}

/**
 * Custom constructed lists: strip inventory leftovers + duplicate cardIds,
 * keep the player's combat picks, and only pad from the combat catalog.
 */
function uniquifyCustomPracticeDeck(
  activeDeck: string[],
  rng: () => number,
): string[] {
  return shuffleDeck(
    padUniqueToConstructedSize(
      activeDeck.filter((id) => isCombatEligibleCard(id)),
      rng,
    ),
    rng,
  );
}

/**
 * Random legal unique 29-card slice from a useful-only pool, biased to keep a low curve.
 * If the seed pool is too small after dedupe, fills with other unique launch cards.
 */
export function toPracticeConstructedSlice(
  cardIds: string[],
  rng: () => number = secureRandom,
): string[] {
  const pool = padUniquePracticePool(cardIds, rng);
  // Always shuffle — even exact-size pools used to return catalog order, which
  // made opening hands look identical when a later shuffle was skipped.
  if (pool.length <= CONSTRUCTED_RULES.deckSize) {
    return shuffleDeck(pool, rng);
  }

  const early = shuffleDeck(
    pool.filter((id) => cardEnergyCost(id) <= EARLY_CURVE_MAX_COST),
    rng,
  );
  const late = shuffleDeck(
    pool.filter((id) => cardEnergyCost(id) > EARLY_CURVE_MAX_COST),
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
  // uniqueCardIds is belt-and-suspenders — early/late partitions are disjoint.
  return uniqueCardIds(
    shuffleDeck([...pickedEarly, ...filler.slice(0, need)], rng),
  );
}

/** Curated starter ids legal for Practice Board rotation (playable pools only). */
export function listPracticeStarterDeckIds(): string[] {
  return TCG_DECKS.filter((d) => {
    if (d.kind !== "starter") return false;
    const useful = uniqueCardIds(filterPracticeUsefulCards(expandContentDeck(d)));
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

/** Build a legal unique 29-card practice list from a content starter (useful cards only). */
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
  // Enforce uniqueness even if a future fill path regresses.
  if (new Set(cardIds).size !== cardIds.length) return null;
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
 * All practice lists are unique-only (max 1 of each cardId).
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
    // Keep the player's picks; strip illegal duplicate cardIds and pad if needed.
    player = {
      deckId: input.activeDeckId,
      cardIds: uniquifyCustomPracticeDeck(input.activeDeck, rng),
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
 * Soft-shape for Practice Board: if opening hand has nothing affordable on
 * turn 1, swap the priciest hand card with a cheap playable from the deck.
 * Teaching-only — does not alter constructed deck composition.
 * Delegates to canonical opening-hand rules (practiceUsefulOnly).
 */
export function ensurePracticeOpeningHandPlayable(
  deck: TcgCardInstance[],
  opts?: { openingHand?: number; maxOpenCost?: number },
): TcgCardInstance[] {
  return ensureOpeningHandPlayable(deck, {
    openingSize: opts?.openingHand ?? TCG_DEFAULTS.openingHand,
    maxOpenCost: opts?.maxOpenCost ?? TCG_DEFAULTS.riftEnergyStartMax,
    practiceUsefulOnly: true,
  });
}

export function materializePracticeLoadout(
  loadout: PracticeLoadout,
  rng: () => number = secureRandom,
): TcgCardInstance[] {
  // Fresh instance ids + Fisher–Yates. makeSide shuffles again before dealing
  // the opening hand so rematches never replay binder order.
  return shuffleDeck(materializeDeck(uniqueCardIds(loadout.cardIds)), rng);
}
