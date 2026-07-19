import { getDeckById, getCardById, getHeroById, type TcgDeck } from "@/content/tcg";
import {
  CONSTRUCTED_RULES,
  toConstructedSlice,
  validateConstructedDeck,
} from "@/content/tcg/framework/deck-rules";
import { getTcgCardDef } from "@/game/tcg/card-catalog";
import { TCG_DEFAULTS, type TcgCardInstance } from "@/game/tcg/types";

export type DeckValidation =
  | { ok: true; size: number }
  | { ok: false; reason: string };

const LOOKUP = {
  getCard: getCardById,
  getHero: getHeroById,
};

function newInstanceId(): string {
  return `ci_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

/** Expand content deck map → ordered card id list. */
export function expandContentDeck(deck: TcgDeck): string[] {
  const list: string[] = [];
  for (const [id, count] of Object.entries(deck.cards)) {
    const n = Math.max(0, Math.floor(count));
    for (let i = 0; i < n; i += 1) list.push(id);
  }
  return list;
}

/**
 * Default playable starter from foundational set.
 * Content teaching pools may exceed constructed size; practice uses a legal slice.
 */
export function buildStarterDeckList(deckId = "starter-fire"): string[] {
  const deck = getDeckById(deckId) ?? getDeckById("starter-nature");
  if (!deck) {
    return [];
  }
  const list = expandContentDeck(deck);
  return toConstructedSlice(list);
}

export function validateDeckList(
  defIds: string[],
  commanderHeroId?: string | null,
): DeckValidation {
  // Legacy callers without commander — still enforce size + copy limits.
  if (commanderHeroId !== undefined) {
    const result = validateConstructedDeck(defIds, commanderHeroId, LOOKUP, {
      allowNonCompetitive: true,
    });
    if (!result.ok) return { ok: false, reason: result.reason };
    return { ok: true, size: result.size };
  }

  if (defIds.length < TCG_DEFAULTS.minDeckSize) {
    return {
      ok: false,
      reason: `Deck needs exactly ${CONSTRUCTED_RULES.deckSize} cards`,
    };
  }
  if (defIds.length > TCG_DEFAULTS.maxDeckSize) {
    return {
      ok: false,
      reason: `Deck exceeds ${CONSTRUCTED_RULES.deckSize} cards`,
    };
  }
  if (defIds.length !== CONSTRUCTED_RULES.deckSize) {
    return {
      ok: false,
      reason: `Constructed decks must be exactly ${CONSTRUCTED_RULES.deckSize} cards`,
    };
  }
  const counts = new Map<string, number>();
  for (const id of defIds) {
    const def = getTcgCardDef(id);
    if (!def) return { ok: false, reason: `Unknown card ${id}` };
    const n = (counts.get(id) ?? 0) + 1;
    if (n > def.maxCopies) {
      return { ok: false, reason: `Too many copies of ${def.name}` };
    }
    counts.set(id, n);
  }
  return { ok: true, size: defIds.length };
}

/**
 * Content starter decks may intentionally exceed constructed maxCopies
 * (teaching decks). Use this for official content lists only.
 */
export function validateContentDeckList(defIds: string[]): DeckValidation {
  const sliced = toConstructedSlice(defIds);
  if (sliced.length < TCG_DEFAULTS.minDeckSize) {
    return {
      ok: false,
      reason: `Deck needs at least ${TCG_DEFAULTS.minDeckSize} cards`,
    };
  }
  for (const id of sliced) {
    if (!getTcgCardDef(id)) return { ok: false, reason: `Unknown card ${id}` };
  }
  return { ok: true, size: sliced.length };
}

export function materializeDeck(defIds: string[]): TcgCardInstance[] {
  return defIds.map((defId) => ({
    instanceId: newInstanceId(),
    defId,
  }));
}

/** Unbiased [0, 1) — prefers crypto so practice rematches never share a fixed seed. */
export function secureRandom(): number {
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0]! / 2 ** 32;
  }
  return Math.random();
}

export function shuffleDeck<T>(items: T[], rng: () => number = secureRandom): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

/**
 * Legal constructed slice from an oversized teaching pool.
 * Unlike a fixed prefix, this shuffles first so practice boards vary card mix.
 */
export function toRandomConstructedSlice(
  cardIds: string[],
  rng: () => number = secureRandom,
): string[] {
  if (cardIds.length <= CONSTRUCTED_RULES.deckSize) return [...cardIds];
  return shuffleDeck(cardIds, rng).slice(0, CONSTRUCTED_RULES.deckSize);
}

export function buildStarterDeckInstances(deckId?: string): TcgCardInstance[] {
  return materializeDeck(buildStarterDeckList(deckId));
}
