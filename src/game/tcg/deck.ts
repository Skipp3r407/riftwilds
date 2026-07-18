import { getDeckById, type TcgDeck } from "@/content/tcg";
import { getTcgCardDef } from "@/game/tcg/card-catalog";
import { TCG_DEFAULTS, type TcgCardInstance } from "@/game/tcg/types";

export type DeckValidation =
  | { ok: true; size: number }
  | { ok: false; reason: string };

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
    // Extremely defensive — content pack should always provide starters
    return [];
  }
  const list = expandContentDeck(deck);
  if (list.length <= TCG_DEFAULTS.maxDeckSize) return list;
  return list.slice(0, TCG_DEFAULTS.starterDeckSize);
}

export function validateDeckList(defIds: string[]): DeckValidation {
  if (defIds.length < TCG_DEFAULTS.minDeckSize) {
    return { ok: false, reason: `Deck needs at least ${TCG_DEFAULTS.minDeckSize} cards` };
  }
  if (defIds.length > TCG_DEFAULTS.maxDeckSize) {
    return { ok: false, reason: `Deck exceeds ${TCG_DEFAULTS.maxDeckSize} cards` };
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
  if (defIds.length < TCG_DEFAULTS.minDeckSize) {
    return { ok: false, reason: `Deck needs at least ${TCG_DEFAULTS.minDeckSize} cards` };
  }
  if (defIds.length > TCG_DEFAULTS.maxDeckSize) {
    return { ok: false, reason: `Deck exceeds ${TCG_DEFAULTS.maxDeckSize} cards` };
  }
  for (const id of defIds) {
    if (!getTcgCardDef(id)) return { ok: false, reason: `Unknown card ${id}` };
  }
  return { ok: true, size: defIds.length };
}

export function materializeDeck(defIds: string[]): TcgCardInstance[] {
  return defIds.map((defId) => ({
    instanceId: newInstanceId(),
    defId,
  }));
}

export function shuffleDeck<T>(items: T[], rng: () => number = Math.random): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

export function buildStarterDeckInstances(deckId?: string): TcgCardInstance[] {
  return materializeDeck(buildStarterDeckList(deckId));
}
