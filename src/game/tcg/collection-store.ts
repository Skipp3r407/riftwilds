import { TCG_CARDS, getDeckById } from "@/content/tcg";
import { buildStarterDeckList, expandContentDeck } from "@/game/tcg/deck";
import { TCG_DEFAULTS } from "@/game/tcg/types";

/**
 * In-memory binder stub — seeds from foundational content pack.
 * Later ties to inventory / pet ownership / Credits packs (not a second ledger).
 */

export type BinderEntry = {
  defId: string;
  count: number;
};

type Binder = {
  ownerKey: string;
  cards: Map<string, number>;
  activeDeck: string[];
};

const binders = new Map<string, Binder>();

function ensure(ownerKey: string): Binder {
  let b = binders.get(ownerKey);
  if (!b) {
    const cards = new Map<string, number>();
    const starter = buildStarterDeckList("starter-fire");
    for (const id of starter) {
      cards.set(id, (cards.get(id) ?? 0) + 1);
    }
    // Unlock browse copies of all foundational cards (demo binder)
    for (const c of TCG_CARDS) {
      if (!cards.has(c.id)) cards.set(c.id, 1);
    }
    b = { ownerKey, cards, activeDeck: starter };
    binders.set(ownerKey, b);
  }
  return b;
}

export function getCollection(ownerKey: string): {
  cards: BinderEntry[];
  activeDeck: string[];
  catalogSize: number;
  activeDeckId: string;
} {
  const b = ensure(ownerKey);
  return {
    cards: [...b.cards.entries()].map(([defId, count]) => ({ defId, count })),
    activeDeck: [...b.activeDeck],
    catalogSize: TCG_CARDS.length,
    activeDeckId: "starter-fire",
  };
}

export function getActiveDeckList(ownerKey: string): string[] {
  const list = [...ensure(ownerKey).activeDeck];
  if (list.length <= TCG_DEFAULTS.maxDeckSize) return list;
  // Hot binders may still hold oversized teaching pools — practice uses a legal slice.
  return list.slice(0, TCG_DEFAULTS.starterDeckSize);
}

export function setActiveContentDeck(ownerKey: string, deckId: string): boolean {
  const deck = getDeckById(deckId);
  if (!deck) return false;
  const b = ensure(ownerKey);
  const list = expandContentDeck(deck);
  b.activeDeck =
    list.length > TCG_DEFAULTS.maxDeckSize
      ? list.slice(0, TCG_DEFAULTS.starterDeckSize)
      : list;
  return true;
}

export function __clearTcgCollectionForTests(): void {
  binders.clear();
}
