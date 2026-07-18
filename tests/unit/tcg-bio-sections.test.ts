import { describe, expect, it } from "vitest";
import { getSpeciesLore } from "@/content/pets/lore";
import { contentPackForRegion } from "@/content/regions";
import { getTcgCardDetail } from "@/lib/tcg/card-detail";
import {
  buildCreatureBioSections,
  buildPlaceBioSections,
  buildRegionBioSections,
  regionSlugFromName,
} from "@/lib/tcg/bio-sections";
import { TCG_CARDS } from "@/content/tcg";

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
    expect(detail?.illustratedBio?.kind).toBe("creature");
    expect(detail?.illustratedBio?.sections.length).toBe(5);
  });

  it("builds region bio sections from content packs", () => {
    const pack = contentPackForRegion("stoneheart-canyon");
    expect(pack).toBeTruthy();
    const sections = buildRegionBioSections(pack!);
    expect(sections.length).toBeGreaterThanOrEqual(3);
    expect(sections[0]?.imageSrc).toContain("stoneheart-canyon");
    expect(sections.every((s) => s.body.trim().length > 0)).toBe(true);
  });

  it("includes Spirit Realm instance pack in region lookup", () => {
    const pack = contentPackForRegion("spirit-realm");
    expect(pack?.regionName).toBe("Spirit Realm");
    const sections = buildRegionBioSections(pack!);
    expect(sections[0]?.body.length).toBeGreaterThan(20);
  });

  it("attaches region bio on region aura cards", () => {
    const detail = getTcgCardDetail("rotr-l-region-void-hollow");
    expect(detail?.illustratedBio?.kind).toBe("region");
    expect(detail?.illustratedBio?.sections.length).toBeGreaterThanOrEqual(3);
  });

  it("builds distinct stall place lore with images", () => {
    const produce = buildPlaceBioSections({
      id: "rotr-prop-stall-produce",
      name: "Produce Market Stall",
      regionId: "riftwild-commons",
    });
    const fish = buildPlaceBioSections({
      id: "rotr-prop-stall-fish",
      name: "Fish Market Stall",
      regionId: "riftwild-commons",
    });
    expect(produce.length).toBeGreaterThanOrEqual(2);
    expect(fish[0]?.body).not.toBe(produce[0]?.body);
    expect(produce.every((s) => s.imageSrc.length > 0)).toBe(true);
  });

  it("attaches place lore on market stall cards", () => {
    const detail = getTcgCardDetail("rotr-prop-stall-potions");
    expect(detail?.illustratedBio?.kind).toBe("place");
    expect(detail?.illustratedBio?.sections.length).toBeGreaterThanOrEqual(2);
  });

  it("covers creature bio for every riftling-linked card", () => {
    const linked = TCG_CARDS.filter((c) => c.riftlingSlug);
    const missing = linked.filter((c) => !getTcgCardDetail(c.id)?.creatureBio);
    expect(missing.map((c) => c.id)).toEqual([]);
  });
});
