import { describe, expect, it } from "vitest";
import {
  TCG_CARDS,
  TCG_DECKS,
  TCG_HEROES,
  TCG_KEYWORDS,
  deckCardCount,
  getCardById,
  RIFT_ENERGY,
} from "@/content/tcg";
import { SPECIES_LORE_SLUGS } from "@/content/pets/lore";

describe("TCG foundational content", () => {
  it("has a large foundational card pool", () => {
    expect(TCG_CARDS.length).toBeGreaterThanOrEqual(250);
    expect(TCG_HEROES.length).toBeGreaterThanOrEqual(12);
    expect(TCG_KEYWORDS.length).toBeGreaterThanOrEqual(12);
  });

  it("requires unique card ids and collector numbers", () => {
    const ids = new Set(TCG_CARDS.map((c) => c.id));
    expect(ids.size).toBe(TCG_CARDS.length);
    const nums = TCG_CARDS.map((c) => c.collectorNumber);
    expect(new Set(nums).size).toBe(nums.length);
  });

  it("every card has localization, art prompt, and craft cost", () => {
    for (const c of TCG_CARDS) {
      expect(c.localization.name.length).toBeGreaterThan(0);
      expect(c.localization.flavorText.length).toBeGreaterThan(0);
      expect(c.art.promptId).toBeTruthy();
      expect(c.art.prompt.toLowerCase()).toContain("riftwilds");
      expect(c.art.negativePrompt.toLowerCase()).toContain("pokémon");
      expect(c.craftCost).toBeGreaterThan(0);
      expect(c.expansionId).toBe("rise-of-the-rift");
    }
  });

  it("creature flavor text is complete (not mid-sentence truncated)", () => {
    const truncated = TCG_CARDS.filter((c) => {
      if (c.type !== "creature") return false;
      const f = c.localization.flavorText.trim();
      return f.includes("…") || f.endsWith("...") || !/[.!?]"?$/.test(f);
    });
    expect(
      truncated.map((c) => c.id),
      `truncated flavor on: ${truncated.map((c) => c.id).join(", ")}`,
    ).toEqual([]);
  });

  it("covers every lore species with at least one creature card", () => {
    expect(SPECIES_LORE_SLUGS.length).toBeGreaterThanOrEqual(100);
    const creatureSlugs = new Set(
      TCG_CARDS.filter((c) => c.type === "creature" && c.riftlingSlug).map((c) => c.riftlingSlug!),
    );
    const missing = SPECIES_LORE_SLUGS.filter((slug) => !creatureSlugs.has(slug));
    expect(missing, `missing creature cards for: ${missing.join(", ")}`).toEqual([]);
  });

  it("riftling creature cards reference existing species slugs and companion stubs", () => {
    const riftlingCards = TCG_CARDS.filter((c) => c.riftlingSlug);
    expect(riftlingCards.length).toBeGreaterThanOrEqual(SPECIES_LORE_SLUGS.length);
    for (const c of riftlingCards) {
      expect(c.relatedRiftlings).toContain(c.riftlingSlug);
    }
    const companions = TCG_CARDS.filter((c) => c.type === "companion" && c.riftlingSlug);
    expect(companions.length).toBeGreaterThanOrEqual(SPECIES_LORE_SLUGS.length);
  });

  it("wires art.assetPath for riftling creatures when pet thumbs exist", () => {
    const riftlingCreatures = TCG_CARDS.filter((c) => c.type === "creature" && c.riftlingSlug);
    const withPath = riftlingCreatures.filter((c) => c.art.assetPath);
    expect(withPath.length).toBe(riftlingCreatures.length);
    for (const c of withPath) {
      expect(c.art.assetPath!.startsWith("/assets/")).toBe(true);
    }
  });

  it("includes location and catalog-derived equipment/spell cards", () => {
    expect(TCG_CARDS.filter((c) => c.type === "location").length).toBeGreaterThanOrEqual(12);
    expect(TCG_CARDS.filter((c) => c.id.startsWith("rotr-e-item-")).length).toBeGreaterThanOrEqual(40);
    expect(TCG_CARDS.filter((c) => c.id.startsWith("rotr-s-item-")).length).toBeGreaterThanOrEqual(40);
  });

  it("starter decks are near 30 cards and resolve to known ids", () => {
    const starters = TCG_DECKS.filter((d) => d.kind === "starter");
    expect(starters.length).toBeGreaterThanOrEqual(8);
    for (const d of starters) {
      expect(deckCardCount(d)).toBeGreaterThanOrEqual(20);
      for (const id of Object.keys(d.cards)) {
        expect(getCardById(id), `missing ${id} in ${d.id}`).toBeTruthy();
      }
    }
  });

  it("defines Rift Energy instead of mana", () => {
    expect(RIFT_ENERGY.start).toBe(1);
    expect(RIFT_ENERGY.perTurnGain).toBe(1);
    expect(RIFT_ENERGY.maxCap).toBe(10);
  });

  it("keywords include rules and counterplay", () => {
    for (const k of TCG_KEYWORDS) {
      expect(k.rules.length).toBeGreaterThan(20);
      expect(k.counterplay.length).toBeGreaterThan(0);
    }
  });
});
