import { describe, expect, it } from "vitest";
import { getSpeciesLore } from "@/content/pets/lore";
import { getTcgCardDetail } from "@/lib/tcg/card-detail";
import {
  buildCreatureBioSections,
  regionSlugFromName,
} from "@/lib/tcg/bio-sections";

describe("tcg bio sections", () => {
  it("maps native region names to scenic asset slugs", () => {
    expect(regionSlugFromName("Ember Crater")).toBe("ember-crater");
    expect(regionSlugFromName("Radiant Citadel")).toBe("radiant-citadel");
  });

  it("builds five illustrated sections for Ashwing lore", () => {
    const lore = getSpeciesLore("ashwing");
    expect(lore).toBeTruthy();
    const sections = buildCreatureBioSections(lore!);
    expect(sections.map((s) => s.id)).toEqual([
      "portrait",
      "habitat",
      "behavior",
      "diet",
      "affinity",
    ]);
    expect(sections[0]?.imageSrc).toBe("/assets/pets/ashwing.png");
    expect(sections[1]?.imageSrc).toBe("/assets/maps/regions/ember-crater.png");
    expect(sections[2]?.imageSrc).toBe("/assets/tcg/bio/behavior-ember.svg");
    expect(sections[3]?.imageSrc).toBe("/assets/tcg/bio/diet-ember.svg");
    expect(sections[4]?.imageSrc).toBe("/assets/battle/elements/ember.svg");
  });

  it("attaches sections on creature card detail", () => {
    const detail = getTcgCardDetail("rotr-c-ashwing");
    expect(detail?.creatureBio?.sections.length).toBe(5);
  });
});
