/**
 * Deck composition helpers for Standard (and mode-aware) legality.
 * Soft guidance vs hard caps: see card-categories DECK_COMPOSITION_RESOLUTION.
 */

import type { TcgCard } from "@/content/tcg/types";
import {
  DECK_COMPOSITION_GUIDANCE,
  resolveCardCategory,
  type TcgCardCategory,
} from "@/content/tcg/framework/card-categories";
import {
  getBattleRules,
  isPowerRarity,
  type BattleModeId,
  type BattleRulesConfig,
} from "@/game/tcg/rules/battle-rules-config";

/** Companions + evolutions fill the creature bucket (battle rules minCreatures). */
const CREATURE_CATEGORIES = new Set<TcgCardCategory>([
  "companion",
  "evolution",
]);

/** Spells + items share maxSpells (items consume like one-shots). */
const SPELL_BUCKET = new Set<TcgCardCategory>(["spell", "item"]);

/** Equipment + terrain + relic + trap share maxSupportCombined. */
const SUPPORT_CATEGORIES = new Set<TcgCardCategory>([
  "equipment",
  "terrain",
  "relic",
  "trap",
]);

export function categoryOf(card: TcgCard): TcgCardCategory {
  return resolveCardCategory(card.type, card.id);
}

export function isCreatureOrCompanion(card: TcgCard): boolean {
  return CREATURE_CATEGORIES.has(categoryOf(card));
}

export function isSpellCard(card: TcgCard): boolean {
  return categoryOf(card) === "spell";
}

export function isItemCard(card: TcgCard): boolean {
  return categoryOf(card) === "item";
}

export function isSupportSlotCard(card: TcgCard): boolean {
  return SUPPORT_CATEGORIES.has(categoryOf(card));
}

export function isCommanderCard(card: TcgCard): boolean {
  return categoryOf(card) === "commander";
}

export type CompositionCounts = {
  creatures: number;
  spells: number;
  items: number;
  /** spells + items (hard-cap bucket). */
  spellBucket: number;
  support: number;
  equipment: number;
  terrain: number;
  relic: number;
  trap: number;
  evolution: number;
  commander: number;
  powerRarity: number;
  other: number;
  total: number;
};

export function countDeckComposition(cards: TcgCard[]): CompositionCounts {
  let creatures = 0;
  let spells = 0;
  let items = 0;
  let support = 0;
  let equipment = 0;
  let terrain = 0;
  let relic = 0;
  let trap = 0;
  let evolution = 0;
  let commander = 0;
  let powerRarity = 0;
  let other = 0;

  for (const card of cards) {
    const cat = categoryOf(card);
    if (cat === "companion") creatures += 1;
    else if (cat === "evolution") {
      creatures += 1;
      evolution += 1;
    } else if (cat === "spell") spells += 1;
    else if (cat === "item") items += 1;
    else if (cat === "equipment") {
      support += 1;
      equipment += 1;
    } else if (cat === "terrain") {
      support += 1;
      terrain += 1;
    } else if (cat === "relic") {
      support += 1;
      relic += 1;
    } else if (cat === "trap") {
      support += 1;
      trap += 1;
    } else if (cat === "commander") commander += 1;
    else other += 1;
    if (isPowerRarity(card.rarity)) powerRarity += 1;
  }

  return {
    creatures,
    spells,
    items,
    spellBucket: spells + items,
    support,
    equipment,
    terrain,
    relic,
    trap,
    evolution,
    commander,
    powerRarity,
    other,
    total: cards.length,
  };
}

export function validateComposition(
  cards: TcgCard[],
  rules: BattleRulesConfig,
): { ok: true } | { ok: false; reason: string; code: string } {
  const c = countDeckComposition(cards);
  if (c.creatures < rules.deck.minCreatures) {
    return {
      ok: false,
      reason: `Need at least ${rules.deck.minCreatures} companion/evolution cards (have ${c.creatures}).`,
      code: "MIN_CREATURES",
    };
  }
  if (c.spellBucket > rules.deck.maxSpells) {
    return {
      ok: false,
      reason: `At most ${rules.deck.maxSpells} spells+items combined (have ${c.spellBucket}: ${c.spells} spells, ${c.items} items).`,
      code: "MAX_SPELLS",
    };
  }
  if (c.support > rules.deck.maxSupportCombined) {
    return {
      ok: false,
      reason: `At most ${rules.deck.maxSupportCombined} equipment/terrain/relic/trap cards (have ${c.support}).`,
      code: "MAX_SUPPORT",
    };
  }
  if (c.powerRarity > rules.deck.maxPowerRarityCombined) {
    return {
      ok: false,
      reason: `At most ${rules.deck.maxPowerRarityCombined} Legendary/Mythic/Ancient cards combined (have ${c.powerRarity}).`,
      code: "MAX_POWER_RARITY",
    };
  }
  return { ok: true };
}

/** Soft starter guidance (not legality). */
export function guidanceDelta(cards: TcgCard[]): {
  guidance: typeof DECK_COMPOSITION_GUIDANCE;
  counts: CompositionCounts;
  notes: string[];
} {
  const counts = countDeckComposition(cards);
  const g = DECK_COMPOSITION_GUIDANCE;
  const notes: string[] = [];
  if (counts.creatures < g.companions) {
    notes.push(`Guidance: aim ~${g.companions} companions (have ${counts.creatures}).`);
  }
  if (counts.spells > g.spells) {
    notes.push(`Guidance: ~${g.spells} spells (have ${counts.spells}).`);
  }
  if (counts.items > g.items) {
    notes.push(`Guidance: ~${g.items} items (have ${counts.items}).`);
  }
  if (counts.equipment > g.equipment) {
    notes.push(`Guidance: ~${g.equipment} equipment (have ${counts.equipment}).`);
  }
  if (counts.terrain > g.terrain) {
    notes.push(`Guidance: ${g.terrain} terrain (have ${counts.terrain}).`);
  }
  if (counts.relic > g.relic) {
    notes.push(`Guidance: ${g.relic} relic (have ${counts.relic}).`);
  }
  return { guidance: g, counts, notes };
}

export function rulesForMode(mode?: BattleModeId | string): BattleRulesConfig {
  return getBattleRules(mode ?? "standard");
}
