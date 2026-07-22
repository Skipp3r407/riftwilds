/**
 * Combat vs Inventory / Companion Care separation.
 */

import { describe, expect, it } from "vitest";
import { getCardById, TCG_CARDS } from "@/content/tcg";
import {
  INVENTORY_DECK_REJECT_MESSAGE,
  isCombatEligibleCard,
  isInventoryOnlyCard,
  classifyCardSystem,
} from "@/content/tcg/framework/combat-eligibility";
import { validateConstructedDeck } from "@/content/tcg/framework/deck-rules";
import { getHeroById } from "@/content/tcg";
import { isPracticeUsefulCard } from "@/game/tcg/practice-loadout";
import { BASIC_PET_MEAL_CARE } from "@/lib/items/card-inventory-migration";

const LOOKUP = {
  getCard: getCardById,
  getHero: getHeroById,
};

describe("combat vs inventory split", () => {
  it("marks Basic Pet Meal as inventory-only Food", () => {
    const cls = classifyCardSystem("rotr-s-item-basic-pet-meal", "item");
    expect(cls.system).toBe("inventory");
    if (cls.system === "inventory") {
      expect(cls.domain).toBe("food");
      expect(cls.inventoryItemId).toBe(BASIC_PET_MEAL_CARE.inventoryItemId);
    }
    expect(isCombatEligibleCard("rotr-s-item-basic-pet-meal")).toBe(false);
    expect(isPracticeUsefulCard("rotr-s-item-basic-pet-meal")).toBe(false);
  });

  it("keeps battle healing salves as combat Utility", () => {
    expect(isCombatEligibleCard("rotr-s-item-small-healing-salve", "item")).toBe(
      true,
    );
    expect(isInventoryOnlyCard("rotr-s-item-small-healing-salve", "item")).toBe(
      false,
    );
  });

  it("rejects inventory cards from constructed decks with the canonical message", () => {
    const combatIds = TCG_CARDS.filter((c) =>
      isCombatEligibleCard(c.id, c.type),
    )
      .slice(0, 28)
      .map((c) => c.id);
    const withMeal = [...combatIds, "rotr-s-item-basic-pet-meal"];
    // Pad/trim is not the point — validation should fail on inventory id first
    // when size matches; build an exact-size illegal list.
    while (withMeal.length < 29) {
      const filler = TCG_CARDS.find(
        (c) =>
          isCombatEligibleCard(c.id, c.type) && !withMeal.includes(c.id),
      );
      if (!filler) break;
      withMeal.push(filler.id);
    }
    const deck = withMeal.slice(0, 29);
    // Ensure meal is present
    if (!deck.includes("rotr-s-item-basic-pet-meal")) {
      deck[0] = "rotr-s-item-basic-pet-meal";
    }
    const result = validateConstructedDeck(
      deck,
      "hero-elara-venn",
      LOOKUP,
      { allowNonCompetitive: true, relaxComposition: true },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe(INVENTORY_DECK_REJECT_MESSAGE);
      expect(result.code).toMatch(/INVENTORY/);
    }
  });

  it("never classifies commanders as main-deck combat eligible", () => {
    const commander = TCG_CARDS.find((c) => c.type === "commander");
    expect(commander).toBeTruthy();
    expect(isCombatEligibleCard(commander!.id, commander!.type)).toBe(false);
    const cls = classifyCardSystem(commander!.id, commander!.type);
    expect(cls.system).toBe("combat");
    if (cls.system === "combat") expect(cls.kind).toBe("commander");
  });
});
