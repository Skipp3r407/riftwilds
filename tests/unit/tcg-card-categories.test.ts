/**
 * Card category ecosystem — frames, migration, engine rules, composition.
 */

import { describe, expect, it } from "vitest";
import {
  getCardById,
  normalizeCard,
  TCG_CARDS,
} from "@/content/tcg";
import {
  CATEGORY_LABELS,
  DECK_COMPOSITION_GUIDANCE,
  DECK_COMPOSITION_RESOLUTION,
  TCG_CARD_CATEGORIES,
  resolveCardCategory,
} from "@/content/tcg/framework/card-categories";
import { layoutForType } from "@/components/tcg/master-card-template";
import {
  isEquipmentContentType,
  isItemContentType,
  isRelicContentType,
  isTerrainContentType,
  isTrapContentType,
} from "@/game/tcg/combat/equipment";
import { getTcgCardDef, clearTcgCardCatalogCache } from "@/game/tcg/card-catalog";
import {
  countDeckComposition,
  validateComposition,
} from "@/game/tcg/rules/deck-composition";
import { STANDARD_BATTLE_RULES } from "@/game/tcg/rules/battle-rules-config";
import { createTcgMatch, applyTcgAction } from "@/game/tcg/match-engine";
import { materializeDeck } from "@/game/tcg/deck";

describe("card category ecosystem", () => {
  it("defines nine canonical categories with labels", () => {
    expect(TCG_CARD_CATEGORIES).toHaveLength(9);
    for (const cat of TCG_CARD_CATEGORIES) {
      expect(CATEGORY_LABELS[cat].length).toBeGreaterThan(0);
    }
  });

  it("migrated catalog only uses canonical types", () => {
    const allowed = new Set<string>(TCG_CARD_CATEGORIES);
    const bad = TCG_CARDS.filter((c) => !allowed.has(c.type));
    expect(bad.map((c) => `${c.id}:${c.type}`)).toEqual([]);
  });

  it("Medicine Pack and consumables are Items with item layout", () => {
    const med = getCardById("rotr-s-item-medicine-pack");
    expect(med?.type).toBe("item");
    const n = normalizeCard(med!);
    expect(n.category).toBe("item");
    expect(n.templateLayout).toBe("item");
    expect(layoutForType("item")).toBe("item");
    expect(layoutForType("companion")).not.toBe(layoutForType("item"));

    const items = TCG_CARDS.filter((c) => c.type === "item");
    expect(items.length).toBeGreaterThanOrEqual(50);
    expect(items.every((c) => layoutForType(c.type) === "item")).toBe(true);
  });

  it("each category has a distinct MasterCardTemplate layout", () => {
    const layouts = TCG_CARD_CATEGORIES.map((c) => layoutForType(c));
    expect(new Set(layouts).size).toBe(TCG_CARD_CATEGORIES.length);
  });

  it("normalizeCard remaps legacy aliases", () => {
    const legacy = {
      ...getCardById("rotr-c-bramblefox")!,
      type: "creature" as const,
    };
    const n = normalizeCard(legacy);
    expect(n.category).toBe("companion");
    expect(n.templateLayout).toBe("companion");
  });

  it("maps content categories to engine types correctly", () => {
    clearTcgCardCatalogCache();
    expect(getTcgCardDef("rotr-c-bramblefox")?.type).toBe("UNIT");
    expect(getTcgCardDef("rotr-evo-bramblefox")?.type).toBe("UNIT");
    expect(getTcgCardDef("rotr-s-ember-spark")?.type).toBe("SPELL");
    expect(getTcgCardDef("rotr-s-item-medicine-pack")?.type).toBe("SPELL");
    expect(getTcgCardDef("rotr-s-item-medicine-pack")?.contentType).toBe("item");
    expect(getTcgCardDef("rotr-l-riftwild-plaza")?.type).toBe("AURA");
  });

  it("content-type helpers distinguish equipment / relic / item / trap / terrain", () => {
    expect(isEquipmentContentType("equipment")).toBe(true);
    expect(isEquipmentContentType("relic")).toBe(false);
    expect(isRelicContentType("relic")).toBe(true);
    expect(isItemContentType("item")).toBe(true);
    expect(isTrapContentType("trap")).toBe(true);
    expect(isTerrainContentType("terrain")).toBe(true);
  });

  it("deck composition: items share spell cap; support shares equipment/terrain/relic/trap", () => {
    expect(DECK_COMPOSITION_RESOLUTION.itemsCountAs).toBe("spells");
    expect(DECK_COMPOSITION_GUIDANCE.companions).toBe(18);

    const companions = TCG_CARDS.filter((c) => c.type === "companion").slice(0, 18);
    const spells = TCG_CARDS.filter((c) => c.type === "spell").slice(0, 4);
    const items = TCG_CARDS.filter((c) => c.type === "item").slice(0, 3);
    const equipment = TCG_CARDS.filter((c) => c.type === "equipment").slice(0, 2);
    const terrain = TCG_CARDS.filter((c) => c.type === "terrain").slice(0, 1);
    const relic = TCG_CARDS.filter((c) => c.type === "relic").slice(0, 1);
    const deck = [...companions, ...spells, ...items, ...equipment, ...terrain, ...relic];
    expect(deck.length).toBe(29);

    const counts = countDeckComposition(deck);
    expect(counts.creatures).toBe(18);
    expect(counts.spellBucket).toBe(7);
    expect(counts.support).toBe(4);
    expect(validateComposition(deck, STANDARD_BATTLE_RULES).ok).toBe(true);
  });

  it("item consume goes to defeated and emits PLAY_ITEM", () => {
    // Battle Utility consumable (care Medicine Pack is inventory-only).
    const itemId = "rotr-s-item-small-healing-salve";
    const unitId = "rotr-c-bramblefox";
    const deck = materializeDeck([
      ...Array(20).fill(unitId),
      ...Array(9).fill(itemId),
    ]);
    const state = createTcgMatch({
      publicId: "cat_item_consume",
      mode: "practice",
      playerDeck: deck,
      opponent: { name: "AI", isAi: true, deck: materializeDeck(Array(29).fill(unitId)) },
      skipMulligan: true,
    });
    const side = state.players[0]!;
    side.hand = [{ instanceId: "item_test", defId: itemId }];
    side.riftEnergy = 10;
    side.board = [
      {
        instanceId: "u1",
        defId: unitId,
        power: 2,
        attack: 2,
        health: 5,
        maxHealth: 5,
        defense: 1,
        speed: 5,
        affinity: "GROVE",
        element: "nature",
        keywords: [],
        statuses: [],
        exhausted: false,
        lane: "front",
        equipmentIds: [],
      },
    ];
    state.phase = "MAIN";
    state.activeSideId = side.id;

    applyTcgAction(state, side.id, {
      kind: "PLAY_CARD",
      handInstanceId: "item_test",
    });

    expect(side.hand.find((c) => c.instanceId === "item_test")).toBeUndefined();
    expect(side.defeated.some((c) => c.defId === itemId)).toBe(true);
    expect(state.events.some((e) => e.type === "PLAY_ITEM")).toBe(true);
  });

  it("trap sets face-down scaffold", () => {
    const trap = TCG_CARDS.find((c) => c.type === "trap");
    expect(trap).toBeTruthy();
    const unitId = "rotr-c-bramblefox";
    const state = createTcgMatch({
      publicId: "cat_trap_set",
      mode: "practice",
      playerDeck: materializeDeck(Array(29).fill(unitId)),
      opponent: { name: "AI", isAi: true, deck: materializeDeck(Array(29).fill(unitId)) },
      skipMulligan: true,
    });
    const side = state.players[0]!;
    side.hand = [{ instanceId: "trap_test", defId: trap!.id }];
    side.riftEnergy = 10;
    side.traps = [];
    state.phase = "MAIN";
    state.activeSideId = side.id;

    applyTcgAction(state, side.id, {
      kind: "PLAY_CARD",
      handInstanceId: "trap_test",
    });

    expect(side.traps.length).toBe(1);
    expect(side.traps[0]!.faceDown).toBe(true);
    expect(side.traps[0]!.armed).toBe(true);
    expect(state.events.some((e) => e.type === "SET_TRAP")).toBe(true);
  });

  it("relic persists on board (not attach)", () => {
    const relic = TCG_CARDS.find(
      (c) => c.type === "relic" && !c.id.includes("-mat-"),
    ) ?? TCG_CARDS.find((c) => c.type === "relic");
    expect(relic).toBeTruthy();
    const unitId = "rotr-c-bramblefox";
    const state = createTcgMatch({
      publicId: "cat_relic_persist",
      mode: "practice",
      playerDeck: materializeDeck(Array(29).fill(unitId)),
      opponent: { name: "AI", isAi: true, deck: materializeDeck(Array(29).fill(unitId)) },
      skipMulligan: true,
    });
    const side = state.players[0]!;
    side.hand = [{ instanceId: "relic_test", defId: relic!.id }];
    side.riftEnergy = 10;
    side.relics = [];
    state.phase = "MAIN";
    state.activeSideId = side.id;

    applyTcgAction(state, side.id, {
      kind: "PLAY_CARD",
      handInstanceId: "relic_test",
    });

    expect(side.relics.length).toBe(1);
    expect(side.board.every((u) => !(u.equipmentIds ?? []).includes(relic!.id))).toBe(
      true,
    );
    expect(state.events.some((e) => e.type === "PLAY_RELIC")).toBe(true);
  });

  it("terrain replaces previous terrain", () => {
    const terrains = TCG_CARDS.filter((c) => c.type === "terrain").slice(0, 2);
    expect(terrains.length).toBe(2);
    const unitId = "rotr-c-bramblefox";
    const state = createTcgMatch({
      publicId: "cat_terrain_replace",
      mode: "practice",
      playerDeck: materializeDeck(Array(29).fill(unitId)),
      opponent: { name: "AI", isAi: true, deck: materializeDeck(Array(29).fill(unitId)) },
      skipMulligan: true,
    });
    const side = state.players[0]!;
    side.hand = [
      { instanceId: "t1", defId: terrains[0]!.id },
      { instanceId: "t2", defId: terrains[1]!.id },
    ];
    side.riftEnergy = 10;
    side.board = [
      {
        instanceId: "u1",
        defId: unitId,
        power: 2,
        attack: 2,
        health: 5,
        maxHealth: 5,
        defense: 1,
        speed: 5,
        affinity: "GROVE",
        element: "nature",
        keywords: [],
        statuses: [],
        exhausted: false,
        lane: "front",
        equipmentIds: [],
      },
    ];
    state.phase = "MAIN";
    state.activeSideId = side.id;

    applyTcgAction(state, side.id, { kind: "PLAY_CARD", handInstanceId: "t1" });
    expect(side.terrain?.defId).toBe(terrains[0]!.id);
    applyTcgAction(state, side.id, { kind: "PLAY_CARD", handInstanceId: "t2" });
    expect(side.terrain?.defId).toBe(terrains[1]!.id);
    expect(side.defeated.some((c) => c.defId === terrains[0]!.id)).toBe(true);
  });

  it("resolveCardCategory maps evolution and combat s-item spells", () => {
    expect(resolveCardCategory("legendary", "rotr-evo-ashwing")).toBe("evolution");
    expect(resolveCardCategory("spell", "rotr-s-item-ember-bolt")).toBe("spell");
    expect(resolveCardCategory("spell", "rotr-s-item-medicine-pack")).toBe("item");
  });
});
