/**
 * Unit coverage for early-game curve / 0-cost / opening hand (Rules v2.1).
 */

import { describe, expect, it } from "vitest";
import { TCG_CARDS, getCardById } from "@/content/tcg";
import { clearTcgCardCatalogCache, getTcgCardDef } from "@/game/tcg/card-catalog";
import { materializeDeck } from "@/game/tcg/deck";
import { STANDARD_BATTLE_RULES } from "@/game/tcg/rules/battle-rules-config";
import {
  analyzeCurve,
  countZeroCostInDeck,
  isCollectibleZeroCostCombat,
} from "@/game/tcg/rules/mana-curve";
import {
  ensureOpeningHandPlayable,
  openingHandHasPlayable,
} from "@/game/tcg/rules/opening-hand";
import { auditZeroCostCard } from "@/game/tcg/rules/zero-cost-design";
import { validateConstructedDeck } from "@/content/tcg/framework/deck-rules";
import { getHeroById } from "@/content/tcg";

describe("early-game v2.1", () => {
  it("keeps starting energy at 2 and rules version 2.1.0", () => {
    expect(STANDARD_BATTLE_RULES.rulesVersion).toBe("2.1.0");
    expect(STANDARD_BATTLE_RULES.energy.turn1Max).toBe(2);
    expect(STANDARD_BATTLE_RULES.deck.maxZeroCostPerDeck).toBe(4);
    expect(STANDARD_BATTLE_RULES.hand.ensureOpeningPlayable).toBe(true);
  });

  it("authors glowbug / morning dew as 0-cost and they pass design audit", () => {
    clearTcgCardCatalogCache();
    expect(getTcgCardDef("rotr-c-glowbug")!.riftCost).toBe(0);
    expect(getTcgCardDef("rotr-s-morning-dew")!.riftCost).toBe(0);
    const glow = getCardById("rotr-c-glowbug")!;
    const dew = getCardById("rotr-s-morning-dew")!;
    expect(auditZeroCostCard(glow).ok).toBe(true);
    expect(auditZeroCostCard(dew).ok).toBe(true);
  });

  it("rejects decks over the zero-cost cap", () => {
    const zeros = TCG_CARDS.filter(isCollectibleZeroCostCombat).slice(0, 5);
    expect(zeros.length).toBeGreaterThanOrEqual(5);
    const fillers = TCG_CARDS.filter(
      (c) =>
        !c.isToken &&
        c.type === "companion" &&
        c.energyCost >= 1 &&
        c.rarity === "common",
    ).slice(0, 24);
    const ids = [...zeros.map((c) => c.id), ...fillers.map((c) => c.id)].slice(
      0,
      29,
    );
    const result = validateConstructedDeck(ids, "hero-elara-venn", {
      getCard: getCardById,
      getHero: getHeroById,
    }, { relaxComposition: true });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("MAX_ZERO_COST");
  });

  it("shapes a brick opening hand toward a turn-1 play", () => {
    clearTcgCardCatalogCache();
    const expensive = TCG_CARDS.filter(
      (c) => !c.isToken && c.type === "companion" && (c.energyCost ?? 0) >= 4,
    )
      .slice(0, 5)
      .map((c) => c.id);
    const cheap = TCG_CARDS.filter(
      (c) => !c.isToken && c.type === "companion" && (c.energyCost ?? 99) <= 2,
    )
      .slice(0, 5)
      .map((c) => c.id);
    const deck = materializeDeck([...expensive, ...cheap]);
    expect(
      openingHandHasPlayable(deck.slice(0, 5), { maxOpenCost: 2 }),
    ).toBe(false);
    const shaped = ensureOpeningHandPlayable(deck, { maxOpenCost: 2 });
    expect(openingHandHasPlayable(shaped.slice(0, 5), { maxOpenCost: 2 })).toBe(
      true,
    );
  });

  it("reports a non-zero collectible 0-cost pool share", () => {
    const combat = TCG_CARDS.filter(
      (c) => !c.isToken && c.type !== "commander" && isCollectibleZeroCostCombat(c)
        ? true
        : !c.isToken &&
          c.type !== "commander" &&
          (c.type === "companion" ||
            c.type === "spell" ||
            c.type === "evolution" ||
            c.type === "equipment"),
    );
    // Simpler: all non-token non-commander with energy
    const pool = TCG_CARDS.filter(
      (c) =>
        !c.isToken &&
        c.type !== "commander" &&
        ["companion", "spell", "evolution", "equipment", "relic", "terrain", "trap"].includes(
          c.type,
        ),
    );
    const curve = analyzeCurve(pool);
    expect(curve.zeroCost).toBeGreaterThanOrEqual(20);
    expect(countZeroCostInDeck(pool.filter(isCollectibleZeroCostCombat))).toBe(
      curve.zeroCost,
    );
  });
});
