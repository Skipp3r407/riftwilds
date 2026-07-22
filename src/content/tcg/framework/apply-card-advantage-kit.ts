/**
 * Merge Rules v2.2 card-advantage patches + example cards into the catalog.
 */

import type { TcgCard } from "@/content/tcg/types";

export type CardAdvantagePatch = {
  id: string;
  addKeywords?: string[];
  rulesText?: string;
  curveTags?: string[];
};

export type CardAdvantageKit = {
  version: number;
  rulesVersion?: string;
  description?: string;
  patches?: CardAdvantagePatch[];
  cards?: TcgCard[];
};

export function applyCardAdvantageKit(
  cards: TcgCard[],
  kit: CardAdvantageKit,
): TcgCard[] {
  const byId = new Map(cards.map((c) => [c.id, { ...c }]));

  for (const patch of kit.patches ?? []) {
    const existing = byId.get(patch.id);
    if (!existing) continue;
    const keywords = Array.from(
      new Set([...(existing.keywords ?? []), ...(patch.addKeywords ?? [])]),
    );
    const localization = {
      ...existing.localization,
      ...(patch.rulesText
        ? { rulesText: patch.rulesText }
        : {}),
    };
    const curveTags = Array.from(
      new Set([...(existing.curveTags ?? []), ...(patch.curveTags ?? [])]),
    );
    byId.set(patch.id, {
      ...existing,
      keywords,
      localization,
      curveTags,
    });
  }

  for (const card of kit.cards ?? []) {
    byId.set(card.id, card);
  }

  return Array.from(byId.values());
}

export function cardAdvantageKitIds(kit: CardAdvantageKit): string[] {
  const ids = new Set<string>();
  for (const p of kit.patches ?? []) ids.add(p.id);
  for (const c of kit.cards ?? []) ids.add(c.id);
  return Array.from(ids);
}
