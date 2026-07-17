import { describe, expect, it } from "vitest";
import {
  AMBIENT_NPCS,
  NAMED_NPCS,
  NPC_CATALOG,
  NPC_BY_SLUG,
  npcsForRegion,
} from "@/content/npcs";
import { STARTER_QUEST_CHAIN } from "@/game/npcs/starter-quests";
import { NPC_SHOPS } from "@/game/npcs/shops";
import { startNpcDialogue } from "@/game/npcs/dialogue";

describe("NPC catalog playability", () => {
  it("has exactly 54 named NPCs", () => {
    expect(NAMED_NPCS).toHaveLength(54);
  });

  it("has unique slugs and ids", () => {
    const slugs = new Set(NPC_CATALOG.map((n) => n.slug));
    const ids = new Set(NPC_CATALOG.map((n) => n.id));
    expect(slugs.size).toBe(NPC_CATALOG.length);
    expect(ids.size).toBe(NPC_CATALOG.length);
  });

  it("Commons meets density minimums", () => {
    const commons = npcsForRegion("riftwild-commons");
    expect(commons.filter((n) => n.kind === "named").length).toBeGreaterThanOrEqual(10);
    expect(commons.filter((n) => n.kind === "ambient").length).toBeGreaterThanOrEqual(8);
    expect(commons.filter((n) => n.kind === "guard").length).toBeGreaterThanOrEqual(3);
    expect(commons.filter((n) => n.kind === "ambient_riftling").length).toBeGreaterThanOrEqual(3);
  });

  it("other regions have at least 4 named and 4 ambient+", () => {
    const regions = [
      "ember-crater",
      "moonwater-coast",
      "elderwood-forest",
      "stormspire-peaks",
      "stoneheart-canyon",
      "frostveil-basin",
      "radiant-citadel",
      "void-hollow",
      "alloy-ruins",
      "spirit-marsh",
      "celestial-rift",
    ];
    for (const region of regions) {
      const list = npcsForRegion(region);
      expect(list.filter((n) => n.kind === "named").length, region).toBeGreaterThanOrEqual(4);
      expect(
        list.filter((n) => n.kind !== "named").length,
        region,
      ).toBeGreaterThanOrEqual(4);
    }
  });

  it("starter quest chain Q1–Q8 exists", () => {
    expect(STARTER_QUEST_CHAIN).toHaveLength(8);
    expect(STARTER_QUEST_CHAIN.map((q) => q.key)).toEqual([
      "starter-q1-awakening",
      "starter-q2-fragments",
      "starter-q3-waiting-heart",
      "starter-q4-new-bond",
      "starter-q5-first-steps",
      "starter-q6-tools",
      "starter-q7-broken-marker",
      "starter-q8-world-beyond",
    ]);
  });

  it("required shops exist", () => {
    for (const id of [
      "shop-mira-care",
      "shop-bram-tools",
      "shop-tessa-goods",
      "shop-nyla-heal",
    ]) {
      expect(NPC_SHOPS[id]?.buy.length).toBeGreaterThan(0);
    }
  });

  it("dialogue never returns placeholder/undefined lines for Commons cast", () => {
    const keys = [
      "rowan-vale",
      "elara-venn",
      "mira-shellbright",
      "bram-ironroot",
      "tessa-windmere",
      "archivist-solen",
      "captain-orren",
      "nyla-brook",
      "pip-gearwhistle",
      "rook-emberfall",
    ];
    for (const key of keys) {
      expect(NPC_BY_SLUG[key]).toBeTruthy();
      const d = startNpcDialogue(key);
      expect(d).toBeTruthy();
      for (const line of d!.lines) {
        expect(line.length).toBeGreaterThan(0);
        expect(line).not.toMatch(/undefined|null|TODO|placeholder/i);
      }
      for (const c of d!.choices) {
        expect(c.label).not.toMatch(/undefined|null|TODO/i);
      }
    }
  });

  it("ambient catalog is non-empty", () => {
    expect(AMBIENT_NPCS.length).toBeGreaterThanOrEqual(40);
  });
});
