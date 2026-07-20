/**
 * Migrate / flag decks from rules v1 (30 main + Commander) → v2 (29 + Commander).
 * Collections are preserved; illegal lists are reported, not deleted.
 */

import { getCardById, getHeroById } from "@/content/tcg";
import {
  CONSTRUCTED_RULES,
  validateConstructedDeck,
  type DeckValidationResult,
} from "@/content/tcg/framework/deck-rules";
import { countDeckComposition } from "@/game/tcg/rules/deck-composition";
import { normalizeCard } from "@/content/tcg/framework/normalize-card";

export type DeckMigrationFlag = {
  code: string;
  message: string;
  severity: "error" | "warn";
};

export type DeckMigrationReport = {
  deckId: string;
  originalSize: number;
  migratedCardIds: string[];
  legal: boolean;
  flags: DeckMigrationFlag[];
  validation: DeckValidationResult;
};

const LOOKUP = { getCard: getCardById, getHero: getHeroById };

/**
 * Trim oversized main decks to 29 (drop from the end — caller may re-order).
 * Does not invent cards for undersized lists.
 */
export function migrateMainDeckIds(cardIds: string[]): {
  cardIds: string[];
  flags: DeckMigrationFlag[];
} {
  const flags: DeckMigrationFlag[] = [];
  let next = [...cardIds];

  if (next.length > CONSTRUCTED_RULES.deckSize) {
    const dropped = next.length - CONSTRUCTED_RULES.deckSize;
    next = next.slice(0, CONSTRUCTED_RULES.deckSize);
    flags.push({
      code: "TRIMMED_TO_29",
      message: `Trimmed ${dropped} card(s) to reach main-deck size ${CONSTRUCTED_RULES.deckSize}.`,
      severity: "warn",
    });
  } else if (next.length < CONSTRUCTED_RULES.deckSize) {
    flags.push({
      code: "UNDERSIZED",
      message: `Main deck has ${next.length}/${CONSTRUCTED_RULES.deckSize} cards.`,
      severity: "error",
    });
  }

  return { cardIds: next, flags };
}

export function auditDeckMigration(input: {
  deckId: string;
  cardIds: string[];
  commanderHeroId?: string | null;
}): DeckMigrationReport {
  const { cardIds: migrated, flags } = migrateMainDeckIds(input.cardIds);
  const cards = migrated
    .map((id) => getCardById(id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
    .map(normalizeCard);
  const composition = countDeckComposition(cards);

  if (composition.creatures < CONSTRUCTED_RULES.minCreatures) {
    flags.push({
      code: "MIN_CREATURES",
      message: `Need ≥${CONSTRUCTED_RULES.minCreatures} creatures/companions (have ${composition.creatures}).`,
      severity: "error",
    });
  }
  if (composition.spells > CONSTRUCTED_RULES.maxSpells) {
    flags.push({
      code: "MAX_SPELLS",
      message: `At most ${CONSTRUCTED_RULES.maxSpells} spells (have ${composition.spells}).`,
      severity: "error",
    });
  }
  if (composition.support > CONSTRUCTED_RULES.maxSupportCombined) {
    flags.push({
      code: "MAX_SUPPORT",
      message: `At most ${CONSTRUCTED_RULES.maxSupportCombined} support/equip/terrain (have ${composition.support}).`,
      severity: "error",
    });
  }
  if (composition.powerRarity > CONSTRUCTED_RULES.maxPowerRarityCombined) {
    flags.push({
      code: "MAX_POWER_RARITY",
      message: `At most ${CONSTRUCTED_RULES.maxPowerRarityCombined} Leg/Mythic/Ancient (have ${composition.powerRarity}).`,
      severity: "error",
    });
  }

  const validation = validateConstructedDeck(
    migrated,
    input.commanderHeroId ?? "hero-elara-venn",
    LOOKUP,
    { allowNonCompetitive: true, relaxComposition: false, mode: "standard" },
  );

  return {
    deckId: input.deckId,
    originalSize: input.cardIds.length,
    migratedCardIds: migrated,
    legal: validation.ok && !flags.some((f) => f.severity === "error"),
    flags,
    validation,
  };
}
