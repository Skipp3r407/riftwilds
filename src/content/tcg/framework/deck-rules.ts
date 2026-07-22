/**
 * Constructed deck rules — Standard format (v2).
 * 29 main-deck cards + 1 Commander (not shuffled) = 30 total pieces.
 * Cosmetics never count as power.
 */

import type { TcgCard, TcgHero, TcgRarity } from "@/content/tcg/types";
import { normalizeCard } from "@/content/tcg/framework/normalize-card";
import {
  INVENTORY_DECK_REJECT_MESSAGE,
  isInventoryOnlyCard,
} from "@/content/tcg/framework/combat-eligibility";
import {
  STANDARD_BATTLE_RULES,
  getBattleRules,
  isPowerRarity,
  maxCopiesForRarity,
  type BattleModeId,
} from "@/game/tcg/rules/battle-rules-config";
import {
  countDeckComposition,
  validateComposition,
} from "@/game/tcg/rules/deck-composition";
import {
  analyzeDeckCurveWarnings,
  countZeroCostInDeck,
} from "@/game/tcg/rules/mana-curve";

const RULES = STANDARD_BATTLE_RULES;

/** @deprecated Prefer getBattleRules(mode).deck — kept for call-site compatibility. */
export const CONSTRUCTED_RULES = {
  /** Exact main-deck size (commander is separate, not shuffled). */
  deckSize: RULES.deck.mainDeckSize,
  minDeckSize: RULES.deck.mainDeckSize,
  maxDeckSize: RULES.deck.mainDeckSize,
  totalPieces: RULES.deck.totalPieces,
  commanderSlots: RULES.deck.commanderSlots,
  minCreatures: RULES.deck.minCreatures,
  maxSpells: RULES.deck.maxSpells,
  maxSupportCombined: RULES.deck.maxSupportCombined,
  maxPowerRarityCombined: RULES.deck.maxPowerRarityCombined,
  maxZeroCostPerDeck: RULES.deck.maxZeroCostPerDeck,
  requireCommander: true,
  cosmeticsArePowerNeutral: true,
  f2pCompetitive:
    "Every legal competitive deck is buildable via starter grants + soft-currency craft. No crypto / SOL required.",
  copyLimits: RULES.deck.copyLimits as Record<TcgRarity | string, number>,
  rulesVersion: RULES.rulesVersion,
} as const;

export type DeckValidationResult =
  | {
      ok: true;
      size: number;
      commanderHeroId: string;
      formatId: string;
      composition: {
        creatures: number;
        spells: number;
        support: number;
        powerRarity: number;
      };
      curveWarnings?: import("@/game/tcg/rules/mana-curve").CurveWarning[];
      zeroCostCount?: number;
    }
  | { ok: false; reason: string; code: string };

function maxCopiesFor(card: TcgCard, mode?: BattleModeId | string): number {
  const rules = getBattleRules(mode ?? "standard");
  return maxCopiesForRarity(card.rarity, rules);
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
  opts?: {
    formatId?: string;
    allowNonCompetitive?: boolean;
    /** Skip composition mins/maxes (teaching / migration soft mode). */
    relaxComposition?: boolean;
    mode?: BattleModeId | string;
  },
): DeckValidationResult {
  const formatId = opts?.formatId ?? opts?.mode ?? "standard";
  const rules = getBattleRules(opts?.mode ?? formatId);

  if (!commanderHeroId) {
    return {
      ok: false,
      reason: "Choose a Commander (1 Keeper — separate from the 29-card deck).",
      code: "COMMANDER_REQUIRED",
    };
  }
  if (!lookup.getHero(commanderHeroId)) {
    return { ok: false, reason: "Unknown commander", code: "COMMANDER_UNKNOWN" };
  }

  if (cardIds.length !== rules.deck.mainDeckSize) {
    return {
      ok: false,
      reason: `Constructed decks must be exactly ${rules.deck.mainDeckSize} cards + 1 Commander (have ${cardIds.length} main-deck cards).`,
      code: "DECK_SIZE",
    };
  }

  const counts = new Map<string, number>();
  const resolved: TcgCard[] = [];
  let powerRarity = 0;

  for (const id of cardIds) {
    const raw = lookup.getCard(id);
    if (!raw) {
      return { ok: false, reason: `Unknown card ${id}`, code: "UNKNOWN_CARD" };
    }
    const card = normalizeCard(raw);
    // Inventory / Companion Care goods are never legal in combat decks —
    // even when allowNonCompetitive is set for teaching soft-mode.
    if (isInventoryOnlyCard(card.id, card.type)) {
      return {
        ok: false,
        reason: INVENTORY_DECK_REJECT_MESSAGE,
        code: "INVENTORY_NOT_COMBAT",
      };
    }
    if (!opts?.allowNonCompetitive && !card.competitiveEligible) {
      return {
        ok: false,
        reason: `${card.localization.name} is not competitive-eligible (lore/prop/cosmetic).`,
        code: "NON_COMPETITIVE",
      };
    }
    const key = gameplayCardId(card);
    const n = (counts.get(key) ?? 0) + 1;
    const max = maxCopiesFor(card, opts?.mode ?? formatId);
    if (n > max) {
      return {
        ok: false,
        reason: `Too many copies of ${card.localization.name} (max ${max} for ${card.rarity}).`,
        code: "COPY_LIMIT",
      };
    }
    counts.set(key, n);
    if (isPowerRarity(card.rarity, rules)) powerRarity += 1;
    resolved.push(card);
  }

  if (powerRarity > rules.deck.maxPowerRarityCombined) {
    return {
      ok: false,
      reason: `At most ${rules.deck.maxPowerRarityCombined} Legendary/Mythic/Ancient cards combined (have ${powerRarity}).`,
      code: "MAX_POWER_RARITY",
    };
  }

  if (!opts?.relaxComposition) {
    const comp = validateComposition(resolved, rules);
    if (!comp.ok) return comp;
  }

  const zeroCostCount = countZeroCostInDeck(resolved);
  if (zeroCostCount > rules.deck.maxZeroCostPerDeck) {
    return {
      ok: false,
      reason: `At most ${rules.deck.maxZeroCostPerDeck} zero-cost cards per deck (have ${zeroCostCount}).`,
      code: "MAX_ZERO_COST",
    };
  }

  const composition = countDeckComposition(resolved);

  return {
    ok: true,
    size: cardIds.length,
    commanderHeroId,
    formatId,
    composition: {
      creatures: composition.creatures,
      spells: composition.spells,
      support: composition.support,
      powerRarity: composition.powerRarity,
    },
    curveWarnings: analyzeDeckCurveWarnings(resolved, rules),
    zeroCostCount,
  };
}

/** Slice oversized teaching pools to a legal constructed main-deck list. */
export function toConstructedSlice(cardIds: string[]): string[] {
  const size = CONSTRUCTED_RULES.deckSize;
  const unique: string[] = [];
  const seen = new Set<string>();
  for (const id of cardIds) {
    if (seen.has(id)) continue;
    seen.add(id);
    unique.push(id);
    if (unique.length >= size) break;
  }
  return unique;
}
