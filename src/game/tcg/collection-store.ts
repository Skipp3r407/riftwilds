import {
  TCG_CARDS,
  TCG_FACTIONS,
  TCG_STARTER_SET_20,
  getDeckById,
  getHeroById,
} from "@/content/tcg";
import { buildStarterDeckList, expandContentDeck, validateDeckList } from "@/game/tcg/deck";
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
  activeDeckId: string;
  commanderHeroId: string | null;
  savedDecks: Map<string, { name: string; cardIds: string[]; commanderHeroId: string | null }>;
};

/** Share binders across Turbopack route bundles (same pattern as hatchery / matches). */
const globalForBinders = globalThis as unknown as {
  __riftwildsTcgBinders?: Map<string, Binder>;
};

function binders(): Map<string, Binder> {
  if (!globalForBinders.__riftwildsTcgBinders) {
    globalForBinders.__riftwildsTcgBinders = new Map();
  }
  return globalForBinders.__riftwildsTcgBinders;
}

function ensure(ownerKey: string): Binder {
  let b = binders().get(ownerKey);
  if (!b) {
    const cards = new Map<string, number>();
    const starter = buildStarterDeckList("starter-fire");
    for (const id of starter) {
      cards.set(id, (cards.get(id) ?? 0) + 1);
    }
    // Demo binder: enough copies for constructed practice (not a second ledger).
    for (const c of TCG_CARDS) {
      if (!cards.has(c.id)) cards.set(c.id, 3);
    }
    b = {
      ownerKey,
      cards,
      activeDeck: starter,
      activeDeckId: "starter-fire",
      commanderHeroId: "hero-elara-venn",
      savedDecks: new Map(),
    };
    binders().set(ownerKey, b);
  }
  return b;
}

export function getCollection(ownerKey: string): {
  cards: BinderEntry[];
  activeDeck: string[];
  catalogSize: number;
  activeDeckId: string;
  commanderHeroId: string | null;
  savedDecks: { id: string; name: string; size: number; commanderHeroId: string | null }[];
} {
  const b = ensure(ownerKey);
  return {
    cards: [...b.cards.entries()].map(([defId, count]) => ({ defId, count })),
    activeDeck: [...b.activeDeck],
    catalogSize: TCG_CARDS.length,
    activeDeckId: b.activeDeckId,
    commanderHeroId: b.commanderHeroId,
    savedDecks: [...b.savedDecks.entries()].map(([id, d]) => ({
      id,
      name: d.name,
      size: d.cardIds.length,
      commanderHeroId: d.commanderHeroId,
    })),
  };
}

export function getActiveDeckList(ownerKey: string): string[] {
  const list = [...ensure(ownerKey).activeDeck];
  if (list.length <= TCG_DEFAULTS.maxDeckSize) return list;
  // Hot binders may still hold oversized teaching pools — practice uses a legal slice.
  return list.slice(0, TCG_DEFAULTS.starterDeckSize);
}

export function getActiveCommanderHeroId(ownerKey: string): string | null {
  return ensure(ownerKey).commanderHeroId;
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
  b.activeDeckId = deckId;
  const faction = TCG_FACTIONS.find((f) => f.defaultStarterDeckId === deckId);
  if (faction?.commanderHeroIds[0]) {
    b.commanderHeroId = faction.commanderHeroIds[0]!;
  }
  return true;
}

export function setActiveShowcaseDeck(ownerKey: string): boolean {
  const b = ensure(ownerKey);
  const list = [...TCG_STARTER_SET_20.cardIds];
  if (list.length < TCG_DEFAULTS.minDeckSize) return false;
  b.activeDeck = list;
  b.activeDeckId = TCG_STARTER_SET_20.id;
  b.commanderHeroId = TCG_STARTER_SET_20.recommendedCommanderId;
  return true;
}

export function setActiveDeckList(
  ownerKey: string,
  cardIds: string[],
  opts?: { name?: string; commanderHeroId?: string | null; saveAsId?: string },
): { ok: true; size: number } | { ok: false; reason: string } {
  const b = ensure(ownerKey);
  const owned = cardIds.every((id) => (b.cards.get(id) ?? 0) > 0);
  if (!owned) return { ok: false, reason: "Deck contains cards not in binder" };

  const counts = new Map<string, number>();
  for (const id of cardIds) {
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  for (const [id, need] of counts) {
    if ((b.cards.get(id) ?? 0) < need) {
      return { ok: false, reason: `Not enough copies of ${id} in binder` };
    }
  }

  const commander =
    opts?.commanderHeroId !== undefined
      ? opts.commanderHeroId
      : b.commanderHeroId;
  const valid = validateDeckList(cardIds, commander);
  if (!valid.ok) return valid;

  if (opts?.commanderHeroId) {
    if (!getHeroById(opts.commanderHeroId)) {
      return { ok: false, reason: "Unknown commander" };
    }
    b.commanderHeroId = opts.commanderHeroId;
  }
  if (!b.commanderHeroId) {
    return { ok: false, reason: "Choose a commander" };
  }

  b.activeDeck = [...cardIds];
  const saveId = opts?.saveAsId ?? `custom_${Date.now().toString(36)}`;
  b.activeDeckId = saveId;
  b.savedDecks.set(saveId, {
    name: opts?.name ?? "Custom Deck",
    cardIds: [...cardIds],
    commanderHeroId: b.commanderHeroId,
  });
  return { ok: true, size: cardIds.length };
}

export function setActiveCommander(
  ownerKey: string,
  heroId: string | null,
): boolean {
  const b = ensure(ownerKey);
  if (heroId && !getHeroById(heroId)) return false;
  b.commanderHeroId = heroId;
  return true;
}

/**
 * Grant copies of a card into the binder (companion hatch / quest / pack hooks).
 * Does not remove other cards or alter decks. Never wallet-gated.
 */
export function grantCardCopies(
  ownerKey: string,
  cardId: string,
  amount = 1,
): { ok: boolean; cardId: string; previousCount: number; count: number } {
  if (amount <= 0) {
    const b = ensure(ownerKey);
    const previousCount = b.cards.get(cardId) ?? 0;
    return { ok: false, cardId, previousCount, count: previousCount };
  }
  const exists = TCG_CARDS.some((c) => c.id === cardId);
  if (!exists) {
    return { ok: false, cardId, previousCount: 0, count: 0 };
  }
  const b = ensure(ownerKey);
  const previousCount = b.cards.get(cardId) ?? 0;
  const count = previousCount + Math.floor(amount);
  b.cards.set(cardId, count);
  return { ok: true, cardId, previousCount, count };
}

/** Resolve + grant the best matching card for a Riftling species slug. */
export function grantCardForSpecies(
  ownerKey: string,
  speciesSlug: string,
): { ok: boolean; cardId: string | null; previousCount: number; count: number } {
  const match = TCG_CARDS.find(
    (c) => c.riftlingSlug === speciesSlug || c.relatedRiftlings?.includes(speciesSlug),
  );
  if (!match) {
    return { ok: false, cardId: null, previousCount: 0, count: 0 };
  }
  const r = grantCardCopies(ownerKey, match.id, 1);
  return { ok: r.ok, cardId: match.id, previousCount: r.previousCount, count: r.count };
}

export function __clearTcgCollectionForTests(): void {
  binders().clear();
}
