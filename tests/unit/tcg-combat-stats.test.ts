import { describe, expect, it } from "vitest";
import {
  getCardById,
  getNormalizedCardById,
  TCG_CARD_STATS_V2,
} from "@/content/tcg";
import {
  compareCombatSpeed,
  computeStrikeDamage,
  elementMultiplier,
  unitHasKeyword,
} from "@/game/tcg/combat";
import { getTcgCardDef } from "@/game/tcg/card-catalog";
import {
  applyTcgAction,
  createTcgMatch,
} from "@/game/tcg/match-engine";
import { materializeDeck } from "@/game/tcg/deck";

describe("card stat migration v2", () => {
  it("loads overlays for combat units", () => {
    expect(Object.keys(TCG_CARD_STATS_V2.overlays).length).toBeGreaterThan(300);
    const fox = getNormalizedCardById("rotr-c-bramblefox");
    expect(fox).toBeTruthy();
    expect(fox!.defense).toBeGreaterThanOrEqual(0);
    expect(fox!.speed).toBeGreaterThanOrEqual(1);
    expect(fox!.role).toBeTruthy();
    expect(fox!.attack).toBe(3);
    expect(fox!.health).toBe(5);
  });

  it("gives mossprig tank identity with guardian", () => {
    const m = getNormalizedCardById("rotr-c-mossprig");
    expect(m?.role).toBe("tank");
    expect(m?.keywords.some((k) => k === "guardian" || k === "bloom")).toBe(
      true,
    );
  });

  it("keeps cosmetic finishes power-neutral in catalog", () => {
    const def = getTcgCardDef("rotr-c-ashwing");
    expect(def?.attack).toBeGreaterThan(0);
    expect(def?.defense).toBeGreaterThanOrEqual(0);
    expect(def?.keywords).toContain("flying");
  });
});

describe("combat formulas", () => {
  it("applies ATK-DEF with minimum damage", () => {
    expect(
      computeStrikeDamage({ attack: 5, defense: 3, attackerElement: "fire" }),
    ).toBe(2);
    expect(
      computeStrikeDamage({ attack: 2, defense: 10, attackerElement: "fire" }),
    ).toBe(1);
    expect(computeStrikeDamage({ attack: 0, defense: 0 })).toBe(0);
  });

  it("applies element ±15%", () => {
    expect(elementMultiplier("fire", "nature")).toBe(1.15);
    expect(elementMultiplier("nature", "fire")).toBe(0.85);
  });

  it("sorts speed deterministically", () => {
    const a = { speed: 5, instanceId: "b" };
    const b = { speed: 5, instanceId: "a" };
    const c = { speed: 8, instanceId: "z" };
    const sorted = [a, b, c].sort(compareCombatSpeed);
    expect(sorted[0]!.instanceId).toBe("z");
    expect(sorted[1]!.instanceId).toBe("a");
  });

  it("canonicalizes taunt as guardian", () => {
    expect(unitHasKeyword(["taunt"], "guardian")).toBe(true);
    expect(unitHasKeyword(["guard"], "guardian")).toBe(true);
  });
});

describe("match engine combat stats", () => {
  it("summons units with full combat axes and charge ready", () => {
    const deck = materializeDeck(
      Array.from({ length: 30 }, () => "rotr-c-cinderquill"),
    );
    const state = createTcgMatch({
      publicId: "combat_stat_1",
      playerDeck: deck,
      opponent: {
        name: "AI",
        deck: materializeDeck(
          Array.from({ length: 30 }, () => "rotr-c-mossprig"),
        ),
      },
    });
    const hand = state.players[0].hand.find((c) => {
      const d = getTcgCardDef(c.defId);
      return d && d.riftCost <= state.players[0].riftEnergy;
    });
    expect(hand).toBeTruthy();
    applyTcgAction(state, "player", {
      kind: "PLAY_CARD",
      handInstanceId: hand!.instanceId,
    });
    const unit = state.players[0].board[0]!;
    expect(unit.attack).toBeGreaterThanOrEqual(1);
    expect(unit.health).toBeGreaterThanOrEqual(1);
    expect(unit.defense).toBeGreaterThanOrEqual(0);
    expect(unit.speed).toBeGreaterThanOrEqual(1);
    expect(unit.exhausted).toBe(false); // Charge
  });

  it("resolves combat strikes without throwing", () => {
    const state = createTcgMatch({ publicId: "combat_stat_2" });
    applyTcgAction(state, "player", { kind: "END_TURN" });
    expect(state.turn).toBeGreaterThanOrEqual(2);
    expect(state.status === "ACTIVE" || state.status === "COMPLETED").toBe(
      true,
    );
  });
});

describe("source cards preserved", () => {
  it("does not require defense on raw JSON", () => {
    const raw = getCardById("rotr-c-bramblefox");
    expect(raw?.defense == null || typeof raw.defense === "number").toBe(true);
    // Overlay supplies defense at normalize time
    expect(getNormalizedCardById("rotr-c-bramblefox")!.defense).toBeGreaterThanOrEqual(
      0,
    );
  });
});
