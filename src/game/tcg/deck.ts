import {
  getDeckById,
  getCardById,
  getHeroById,
  TCG_CARDS,
  TCG_LAUNCH_POOL,
  type TcgDeck,
} from "@/content/tcg";
import {
  CONSTRUCTED_RULES,
  toConstructedSlice,
  validateConstructedDeck,
} from "@/content/tcg/framework/deck-rules";
import {
  INVENTORY_DECK_REJECT_MESSAGE,
  isCombatEligibleCard,
  isInventoryOnlyCard,
} from "@/content/tcg/framework/combat-eligibility";
import { resolveCardCategory } from "@/content/tcg/framework/card-categories";
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
 * Keep first occurrence of each cardId (order preserved).
 * Constructed / practice decks are unique-only — never 2+ of the same id.
 */
export function uniqueCardIds(cardIds: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of cardIds) {
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

/** Catalog ids for padding unique decks up to constructed size (never duplicates). */
function catalogFillIds(exclude: Set<string>): string[] {
  const out: string[] = [];
  const push = (id: string) => {
    if (exclude.has(id) || !getTcgCardDef(id)) return;
    // Never pad combat decks with food / care / materials / tools / quests.
    if (!isCombatEligibleCard(id)) return;
    const raw = getCardById(id);
    if (!raw) return;
    // Commanders sit in the hero slot; tokens are not constructed main-deck fills.
    const category = resolveCardCategory(raw.type, raw.id);
    if (category === "commander" || raw.isToken) return;
    exclude.add(id);
    out.push(id);
  };
  for (const id of TCG_LAUNCH_POOL.cardIds) push(id);
  for (const card of TCG_CARDS) push(card.id);
  return out;
}

/**
 * Unique-only list padded to exact constructed main-deck size.
 * Draws additional unique cards from launch pool → full catalog when needed.
 */
export function padUniqueToConstructedSize(
  cardIds: string[],
  rng: () => number = secureRandom,
): string[] {
  const size = CONSTRUCTED_RULES.deckSize;
  // Strip inventory-only leftovers from legacy saves / teaching pools first.
  let unique = uniqueCardIds(cardIds.filter((id) => isCombatEligibleCard(id)));
  if (unique.length > size) {
    return shuffleDeck(unique, rng).slice(0, size);
  }
  if (unique.length === size) return unique;

  const have = new Set(unique);
  const filler = shuffleDeck(catalogFillIds(have), rng);
  unique = [...unique, ...filler].slice(0, size);
  return unique.length === size ? unique : shuffleDeck(unique, rng);
}

/**
 * Default playable starter from foundational set.
 * Content teaching pools may exceed constructed size — take a random legal slice
 * so Practice Board / binder loads are not stuck on the same fixed prefix forever.
 * Always unique-only and exactly constructed size (pads from catalog if needed).
 */
export function buildStarterDeckList(
  deckId = "starter-fire",
  rng: () => number = secureRandom,
): string[] {
  const deck = getDeckById(deckId) ?? getDeckById("starter-nature");
  if (!deck) {
    return padUniqueToConstructedSize([], rng);
  }
  const list = expandContentDeck(deck);
  return toRandomConstructedSlice(list, rng);
}

export function validateDeckList(
  defIds: string[],
  commanderHeroId?: string | null,
): DeckValidation {
  for (const id of defIds) {
    if (isInventoryOnlyCard(id)) {
      return { ok: false, reason: INVENTORY_DECK_REJECT_MESSAGE };
    }
  }

  // Legacy callers without commander — still enforce size + copy limits.
  if (commanderHeroId !== undefined) {
    const result = validateConstructedDeck(defIds, commanderHeroId, LOOKUP, {
      allowNonCompetitive: true,
    });
    if (!result.ok) return { ok: false, reason: result.reason };
    return { ok: true, size: result.size };
  }

  if (defIds.length !== CONSTRUCTED_RULES.deckSize) {
    return {
      ok: false,
      reason: `Constructed decks must be exactly ${CONSTRUCTED_RULES.deckSize} cards + 1 Commander (have ${defIds.length} main-deck cards)`,
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
 * Unique-only: duplicate-heavy teaching lists are padded to legal size first.
 */
export function validateContentDeckList(defIds: string[]): DeckValidation {
  const unique = uniqueCardIds(defIds);
  const sliced =
    unique.length >= TCG_DEFAULTS.minDeckSize
      ? toConstructedSlice(unique)
      : padUniqueToConstructedSize(defIds);
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

/**
 * Unbiased [0, 1) for Fisher–Yates.
 * Prefers Web Crypto so practice rematches never share a fixed seed.
 * Seeded RNGs are opt-in via explicit `rng` args (unit tests / sims only) —
 * never a default env seed for live Practice Board play.
 */
export function secureRandom(): number {
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    // Exclusive of 1 so Fisher–Yates never picks j === i + 1.
    return buf[0]! / 2 ** 32;
  }
  return Math.random();
}

/** Fisher–Yates. Pass an explicit rng only for tests; production uses secureRandom. */
export function shuffleDeck<T>(items: T[], rng: () => number = secureRandom): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const u = rng();
    // Guard bad rng implementations that return 1.
    const j = Math.floor((u >= 1 ? 0.999999999 : u < 0 ? 0 : u) * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

/**
 * Legal constructed slice from an oversized teaching pool.
 * Unique-only; pads from catalog when dedupe leaves the pool undersized.
 */
export function toRandomConstructedSlice(
  cardIds: string[],
  rng: () => number = secureRandom,
): string[] {
  return padUniqueToConstructedSize(cardIds, rng);
}

export function buildStarterDeckInstances(deckId?: string): TcgCardInstance[] {
  return materializeDeck(buildStarterDeckList(deckId));
}
