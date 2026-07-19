import { describe, expect, it } from "vitest";
import {
  CONSTRUCTED_RULES,
  getCardById,
  getHeroById,
  getTcgRegistry,
  normalizeCard,
  TCG_CARD_FAMILIES,
  TCG_CARDS,
  TCG_FORMATS,
  TCG_LAUNCH_POOL,
  TCG_LIVE_OPS,
} from "@/content/tcg";
import {
  validateConstructedDeck,
} from "@/content/tcg/framework/deck-rules";
import { CRAFT_POLICY, craftCostForCard } from "@/content/tcg/framework/craft";
import { queryCards } from "@/content/tcg/framework/registry";
import { ELEMENT_TO_AFFINITY } from "@/content/tcg/framework/element-map";

const lookup = { getCard: getCardById, getHero: getHeroById };

describe("TCG AAA framework", () => {
  it("exposes a scalable registry with facets", () => {
    const registry = getTcgRegistry();
    expect(registry.all.length).toBe(TCG_CARDS.length);
    expect(registry.competitive.length).toBeGreaterThanOrEqual(300);
    expect(registry.facets.elements.length).toBeGreaterThan(5);
    expect(registry.facets.roles.length).toBeGreaterThan(3);
  });

  it("curates a ~330 launch pool from migrated cards", () => {
    expect(TCG_LAUNCH_POOL.cardIds.length).toBe(330);
    for (const id of TCG_LAUNCH_POOL.cardIds.slice(0, 20)) {
      expect(getCardById(id), id).toBeTruthy();
    }
  });

  it("covers species families for Codex scale", () => {
    expect(TCG_CARD_FAMILIES.length).toBeGreaterThanOrEqual(100);
  });

  it("normalizes defense/speed/role/craft without destroying lore", () => {
    const raw = getCardById("rotr-c-ashwing");
    expect(raw).toBeTruthy();
    const n = normalizeCard(raw!);
    expect(n.localization.name).toBe("Ashwing");
    expect(n.art.assetPath || n.art.cardImagePath).toBeTruthy();
    expect(n.defense).toBeGreaterThanOrEqual(0);
    expect(n.speed).toBeGreaterThanOrEqual(1);
    expect(n.role.length).toBeGreaterThan(0);
    expect(n.craftCosts.gold).toBeGreaterThan(0);
    expect(n.familyId).toBe("family-ashwing");
  });

  it("enforces 30-card constructed + commander", () => {
    const ids = TCG_LAUNCH_POOL.cardIds.slice(0, 30);
    const ok = validateConstructedDeck(ids, "hero-elara-venn", lookup, {
      allowNonCompetitive: true,
    });
    expect(ok.ok).toBe(true);

    const short = validateConstructedDeck(ids.slice(0, 20), "hero-elara-venn", lookup, {
      allowNonCompetitive: true,
    });
    expect(short.ok).toBe(false);

    const noCmd = validateConstructedDeck(ids, null, lookup, {
      allowNonCompetitive: true,
    });
    expect(noCmd.ok).toBe(false);
  });

  it("never requires crypto for craft/competitive", () => {
    expect(CRAFT_POLICY.cryptoRequired).toBe(false);
    expect(CRAFT_POLICY.solRequired).toBe(false);
    expect(CONSTRUCTED_RULES.f2pCompetitive.toLowerCase()).toContain("crypto");
    const card = getCardById("rotr-c-ashwing")!;
    const cost = craftCostForCard(card);
    expect(cost.gold + cost.riftShards).toBeGreaterThan(0);
  });

  it("maps design elements to battle affinities", () => {
    expect(ELEMENT_TO_AFFINITY.fire).toBe("EMBER");
    expect(ELEMENT_TO_AFFINITY.crystal).toBe("FROST");
    expect(ELEMENT_TO_AFFINITY.metal).toBe("ALLOY");
  });

  it("supports format + live-ops config", () => {
    expect(TCG_FORMATS.some((f) => f.id === "standard")).toBe(true);
    expect(TCG_LIVE_OPS.f2pGrants.gold).toBeGreaterThan(0);
    expect(TCG_LIVE_OPS.bannerMessage.toLowerCase()).toContain("sol");
  });

  it("queries cards by facet", () => {
    const registry = getTcgRegistry();
    const { total, cards } = queryCards(registry, {
      element: "fire",
      competitiveOnly: true,
      limit: 10,
    });
    expect(total).toBeGreaterThan(0);
    expect(cards.every((c) => c.element === "fire")).toBe(true);
  });

  it("keeps constructed copy limits by rarity", () => {
    expect(CONSTRUCTED_RULES.copyLimits.common).toBe(3);
    expect(CONSTRUCTED_RULES.copyLimits.rare).toBe(2);
    expect(CONSTRUCTED_RULES.copyLimits.legendary).toBe(1);
    expect(CONSTRUCTED_RULES.deckSize).toBe(30);
  });
});
