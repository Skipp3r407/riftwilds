/**
 * Rules v2.2 — card draw / hand management.
 * One draw at turn start; no auto-replace-on-play; conversions + keywords.
 */

import { describe, expect, it } from "vitest";
import { TCG_CARDS, getCardById } from "@/content/tcg";
import { clearTcgCardCatalogCache, getTcgCardDef } from "@/game/tcg/card-catalog";
import { materializeDeck } from "@/game/tcg/deck";
import {
  applyTcgAction,
  createTcgMatch,
} from "@/game/tcg/match-engine";
import { KEYWORD_REGISTRY } from "@/game/tcg/combat/keywords";
import { STANDARD_BATTLE_RULES } from "@/game/tcg/rules/battle-rules-config";
import { TUTORIAL_STAGES } from "@/game/tcg/tutorial/stages";

function seededRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

function buildTestDeckIds(): string[] {
  const prefer = [
    "rotr-c-glowbug",
    "rotr-c-pocket-scout",
    "rotr-c-plaza-herald",
    "rotr-s-storm-sip",
    "rotr-s-rift-reshuffle",
    "rotr-s-pathfinders-glance",
    "rotr-s-morning-dew",
    "rotr-c-emberfox",
    "rotr-c-mossprig",
    "rotr-c-bramblefox",
    "rotr-c-commonspark",
    "rotr-c-thornling",
  ];
  const ids = prefer.filter((id) => getCardById(id) && getTcgCardDef(id));
  for (const c of TCG_CARDS) {
    if (ids.length >= 29) break;
    if (c.isToken || c.type === "commander") continue;
    if (!getTcgCardDef(c.id)) continue;
    if (ids.includes(c.id)) continue;
    ids.push(c.id);
  }
  return ids.slice(0, 29);
}

describe("card advantage v2.2", () => {
  it("bumps rules to 2.2.0 with cardAdvantage config", () => {
    expect(STANDARD_BATTLE_RULES.rulesVersion).toBe("2.2.0");
    expect(STANDARD_BATTLE_RULES.cardAdvantage.energyToDrawCost).toBe(2);
    expect(STANDARD_BATTLE_RULES.cardAdvantage.commanderDrawCost).toBe(1);
  });

  it("registers Insight, Inspire, Scout, Discover", () => {
    for (const id of ["insight", "inspire", "scout", "discover"]) {
      expect(KEYWORD_REGISTRY[id]?.support).toBe("full");
    }
  });

  it("draws one at turn start and does not auto-draw on play", () => {
    clearTcgCardCatalogCache();
    const deck = materializeDeck(buildTestDeckIds());
    const state = createTcgMatch({
      publicId: "adv_draw_rules",
      mode: "practice",
      skipMulligan: true,
      playerDeck: deck,
      rng: seededRng(42),
    });

    const player = state.players[0]!;
    const handBefore = player.hand.length;
    const drawsBeforePlay = state.events.filter((e) => e.type === "DRAW").length;

    const plain = player.hand.find((c) => {
      const def = getTcgCardDef(c.defId);
      if (!def || def.type !== "UNIT") return false;
      if (def.riftCost > player.riftEnergy) return false;
      const kw = def.keywords.map((k) => k.toLowerCase());
      return (
        !kw.includes("scout") &&
        !kw.includes("insight") &&
        !kw.includes("discover")
      );
    });
    expect(plain).toBeTruthy();
    applyTcgAction(state, "player", {
      kind: "PLAY_CARD",
      handInstanceId: plain!.instanceId,
    });

    const drawsAfterPlay = state.events.filter((e) => e.type === "DRAW").length;
    expect(drawsAfterPlay).toBe(drawsBeforePlay);
    expect(player.hand.length).toBe(handBefore - 1);

    applyTcgAction(state, "player", { kind: "END_TURN" });
    const playerDraws = state.events.filter(
      (e) => e.type === "DRAW" && e.actorId === "player",
    );
    expect(playerDraws.length).toBeGreaterThanOrEqual(1);
  });

  it("allows Channel (energy→draw) once and rejects a second use", () => {
    clearTcgCardCatalogCache();
    const state = createTcgMatch({
      publicId: "adv_channel",
      mode: "practice",
      skipMulligan: true,
      rng: seededRng(7),
    });
    const player = state.players[0]!;
    player.riftEnergy = 4;
    const handBefore = player.hand.length;
    applyTcgAction(state, "player", { kind: "ENERGY_TO_DRAW" });
    expect(player.hand.length).toBe(handBefore + 1);
    expect(player.riftEnergy).toBe(2);
    expect(() =>
      applyTcgAction(state, "player", { kind: "ENERGY_TO_DRAW" }),
    ).toThrow(/CONVERSION_USED/);
  });

  it("Storm Sip has Insight and draws when played", () => {
    clearTcgCardCatalogCache();
    expect(getTcgCardDef("rotr-s-storm-sip")?.keywords).toContain("insight");
    const state = createTcgMatch({
      publicId: "adv_insight",
      mode: "practice",
      skipMulligan: true,
      rng: seededRng(11),
    });
    const player = state.players[0]!;
    const sip = {
      instanceId: "test_sip",
      defId: "rotr-s-storm-sip",
    };
    player.hand.push(sip);
    player.riftEnergy = 3;
    const handBefore = player.hand.length;
    const drawsBefore = state.events.filter((e) => e.type === "DRAW").length;
    applyTcgAction(state, "player", {
      kind: "PLAY_CARD",
      handInstanceId: sip.instanceId,
    });
    const drawsAfter = state.events.filter((e) => e.type === "DRAW").length;
    expect(drawsAfter).toBe(drawsBefore + 1);
    expect(player.hand.length).toBe(handBefore);
  });

  it("tutorial includes cardadvantage stage", () => {
    expect(TUTORIAL_STAGES.some((s) => s.id === "cardadvantage")).toBe(true);
  });
});
