/**
 * Scalable card registry — O(1) id lookup + facet indexes for 5,000+ cards.
 * Expansion packs register independently; registry rebuilds indexes once.
 */

import type { TcgCard, TcgExpansion } from "@/content/tcg/types";
import {
  normalizeCard,
  type NormalizedTcgCard,
} from "@/content/tcg/framework/normalize-card";

export type SearchFacets = {
  elements: string[];
  rarities: string[];
  types: string[];
  roles: string[];
  factions: string[];
  regions: string[];
  expansions: string[];
  families: string[];
  unlockMethods: string[];
  keywords: string[];
};

export type CardQuery = {
  q?: string;
  element?: string;
  rarity?: string;
  type?: string;
  role?: string;
  factionId?: string;
  regionId?: string;
  expansionId?: string;
  familyId?: string;
  keyword?: string;
  competitiveOnly?: boolean;
  ownedOnly?: boolean;
  ownedIds?: Set<string>;
  limit?: number;
  offset?: number;
};

export type CardRegistry = {
  version: string;
  byId: Map<string, NormalizedTcgCard>;
  all: NormalizedTcgCard[];
  competitive: NormalizedTcgCard[];
  byExpansion: Map<string, NormalizedTcgCard[]>;
  byFamily: Map<string, NormalizedTcgCard[]>;
  byElement: Map<string, NormalizedTcgCard[]>;
  byRarity: Map<string, NormalizedTcgCard[]>;
  byRole: Map<string, NormalizedTcgCard[]>;
  facets: SearchFacets;
  expansions: TcgExpansion[];
};

function pushIndex(
  map: Map<string, NormalizedTcgCard[]>,
  key: string | null | undefined,
  card: NormalizedTcgCard,
) {
  if (!key) return;
  const list = map.get(key);
  if (list) list.push(card);
  else map.set(key, [card]);
}

export function buildCardRegistry(
  cards: TcgCard[],
  expansions: TcgExpansion[],
  version = "aaa-1",
): CardRegistry {
  const normalized = cards.map(normalizeCard);
  const byId = new Map<string, NormalizedTcgCard>();
  const byExpansion = new Map<string, NormalizedTcgCard[]>();
  const byFamily = new Map<string, NormalizedTcgCard[]>();
  const byElement = new Map<string, NormalizedTcgCard[]>();
  const byRarity = new Map<string, NormalizedTcgCard[]>();
  const byRole = new Map<string, NormalizedTcgCard[]>();

  const elementSet = new Set<string>();
  const raritySet = new Set<string>();
  const typeSet = new Set<string>();
  const roleSet = new Set<string>();
  const factionSet = new Set<string>();
  const regionSet = new Set<string>();
  const expansionSet = new Set<string>();
  const familySet = new Set<string>();
  const unlockSet = new Set<string>();
  const keywordSet = new Set<string>();

  for (const card of normalized) {
    byId.set(card.id, card);
    pushIndex(byExpansion, card.expansionId, card);
    pushIndex(byFamily, card.familyId, card);
    pushIndex(byElement, card.element, card);
    pushIndex(byRarity, card.rarity, card);
    pushIndex(byRole, card.role, card);

    elementSet.add(card.element);
    raritySet.add(card.rarity);
    typeSet.add(card.type);
    roleSet.add(card.role);
    if (card.factionId) factionSet.add(card.factionId);
    if (card.regionId) regionSet.add(card.regionId);
    expansionSet.add(card.expansionId);
    if (card.familyId) familySet.add(card.familyId);
    unlockSet.add(card.unlockMethod);
    for (const k of card.keywords) keywordSet.add(k);
  }

  return {
    version,
    byId,
    all: normalized,
    competitive: normalized.filter((c) => c.competitiveEligible),
    byExpansion,
    byFamily,
    byElement,
    byRarity,
    byRole,
    facets: {
      elements: [...elementSet].sort(),
      rarities: [...raritySet].sort(),
      types: [...typeSet].sort(),
      roles: [...roleSet].sort(),
      factions: [...factionSet].sort(),
      regions: [...regionSet].sort(),
      expansions: [...expansionSet].sort(),
      families: [...familySet].sort(),
      unlockMethods: [...unlockSet].sort(),
      keywords: [...keywordSet].sort(),
    },
    expansions,
  };
}

export function queryCards(
  registry: CardRegistry,
  query: CardQuery,
): { total: number; cards: NormalizedTcgCard[] } {
  const q = query.q?.trim().toLowerCase();
  let list = query.competitiveOnly ? registry.competitive : registry.all;

  if (query.element) list = list.filter((c) => c.element === query.element);
  if (query.rarity) list = list.filter((c) => c.rarity === query.rarity);
  if (query.type) list = list.filter((c) => c.type === query.type);
  if (query.role) list = list.filter((c) => c.role === query.role);
  if (query.factionId) list = list.filter((c) => c.factionId === query.factionId);
  if (query.regionId) list = list.filter((c) => c.regionId === query.regionId);
  if (query.expansionId) {
    list = list.filter((c) => c.expansionId === query.expansionId);
  }
  if (query.familyId) list = list.filter((c) => c.familyId === query.familyId);
  if (query.keyword) {
    const kw = query.keyword.toLowerCase();
    list = list.filter((c) =>
      c.keywords.some((k) => k.toLowerCase() === kw),
    );
  }
  if (query.ownedOnly && query.ownedIds) {
    list = list.filter((c) => query.ownedIds!.has(c.id));
  }
  if (q) {
    list = list.filter((c) => {
      return (
        c.localization.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.localization.flavorText.toLowerCase().includes(q) ||
        c.keywords.some((k) => k.toLowerCase().includes(q)) ||
        (c.familyId?.includes(q) ?? false) ||
        c.role.includes(q) ||
        c.element.includes(q)
      );
    });
  }

  const total = list.length;
  const offset = query.offset ?? 0;
  const limit = query.limit ?? 100;
  return { total, cards: list.slice(offset, offset + limit) };
}

export function collectionCompletion(
  registry: CardRegistry,
  ownedIds: Set<string>,
  opts?: { competitiveOnly?: boolean },
): { total: number; owned: number; percent: number } {
  const pool = opts?.competitiveOnly ? registry.competitive : registry.all;
  const owned = pool.filter((c) => ownedIds.has(c.id)).length;
  const total = pool.length;
  return {
    total,
    owned,
    percent: total === 0 ? 0 : Math.round((owned / total) * 100),
  };
}
