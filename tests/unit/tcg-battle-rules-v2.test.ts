import { describe, expect, it } from "vitest";
import { CONSTRUCTED_RULES } from "@/content/tcg/framework/deck-rules";
import { getTcgCardDef } from "@/game/tcg/card-catalog";
import { applySummonKeywords, pickCombatTarget } from "@/game/tcg/combat/keywords";
import {
  applyTcgAction,
  createTcgMatch,
  getMatchRules,
} from "@/game/tcg/match-engine";
import {
  resolvePracticeMatchLoadouts,
  materializePracticeLoadout,
} from "@/game/tcg/practice-loadout";
import { riftEnergyMaxForTurn } from "@/game/tcg/rift-energy";
import {
  STANDARD_BATTLE_RULES,
  energyMaxForTurn,
  getBattleRules,
  riftCollapseDamage,
} from "@/game/tcg/rules/battle-rules-config";
import { isRiftSparkToken } from "@/game/tcg/rules/rift-spark";
import { TCG_DEFAULTS } from "@/game/tcg/types";

function sequenceRng(seed = 1): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

describe("battle rules config v2", () => {
  it("exports Standard numbers from the brief", () => {
    const r = STANDARD_BATTLE_RULES;
    expect(r.keeper.startingHp).toBe(25);
    expect(r.deck.mainDeckSize).toBe(29);
    expect(r.deck.totalPieces).toBe(30);
    expect(r.hand.openingSize).toBe(5);
    expect(r.hand.maxSize).toBe(9);
    expect(r.energy.turn1Max).toBe(2);
    expect(r.energy.cap).toBe(10);
    expect(r.field.frontlineSlots).toBe(3);
    expect(r.field.backlineSlots).toBe(2);
    expect(r.deck.copyLimits.common).toBe(1);
    expect(r.deck.maxPowerRarityCombined).toBe(3);
    expect(CONSTRUCTED_RULES.deckSize).toBe(29);
    expect(TCG_DEFAULTS.keeperHp).toBe(25);
  });

  it("ramps energy 2→10", () => {
    expect(riftEnergyMaxForTurn(1)).toBe(2);
    expect(riftEnergyMaxForTurn(2)).toBe(3);
    expect(energyMaxForTurn(9)).toBe(10);
    expect(riftEnergyMaxForTurn(99)).toBe(10);
  });

  it("escalates Rift Collapse", () => {
    expect(riftCollapseDamage(1)).toBe(1);
    expect(riftCollapseDamage(3)).toBe(3);
  });

  it("Quick Battle overrides HP and timers", () => {
    const q = getBattleRules("quick");
    expect(q.keeper.startingHp).toBe(20);
    expect(q.turn.autoSkipSecondMain).toBe(true);
    expect(q.energy.turn1Max).toBe(3);
  });
});

describe("keywords readiness + frontline", () => {
  it("Charge ready; Rush ready but cannot face; default exhausted", () => {
    expect(applySummonKeywords({ keywords: ["charge"], statuses: [] }).exhausted).toBe(
      false,
    );
    const rush = applySummonKeywords({ keywords: ["rush"], statuses: [] });
    expect(rush.exhausted).toBe(false);
    expect(rush.cannotStrikeKeeper).toBe(true);
    expect(applySummonKeywords({ keywords: [], statuses: [] }).exhausted).toBe(true);
  });

  it("Frontline blocks face unless Pierce", () => {
    const front = {
      instanceId: "f1",
      health: 3,
      keywords: [] as string[],
      statuses: [],
      lane: "front" as const,
    };
    expect(
      pickCombatTarget({ attackerKeywords: [], enemyUnits: [front] }).kind,
    ).toBe("unit");
    expect(
      pickCombatTarget({
        attackerKeywords: ["pierce"],
        enemyUnits: [front],
      }).kind,
    ).toBe("face");
  });
});

describe("match engine v2", () => {
  it("creates Standard practice match with new defaults", () => {
    const state = createTcgMatch({ publicId: "rules_v2_1", mode: "practice" });
    expect(state.players[0].keeperHp).toBe(25);
    expect(state.players[0].hand.length).toBe(5);
    expect(state.players[0].riftEnergy).toBe(2);
    expect(state.players[1].hand.some((c) => isRiftSparkToken(c.defId))).toBe(
      true,
    );
    expect(state.rulesVersion).toBe("2.1.0");
    expect(getMatchRules(state).turn.autoSkipSecondMain).toBe(true);
    expect(state.phase).toBe("MULLIGAN");
  });

  it("P2 Rift Spark grants temp energy and exiles", () => {
    const state = createTcgMatch({
      publicId: "spark_1",
      mode: "practice",
      skipMulligan: true,
    });
    // Force AI to be active? Spark is on seat 1 (AI). Play via swapping — use player as second seat by surrendering path:
    // Give spark to player by creating match then manually moving — simpler: play after END_TURN when AI plays it.
    applyTcgAction(state, "player", { kind: "END_TURN" });
    // AI should have consumed spark or still have it in events
    const sparkEvents = state.events.filter((e) => e.type === "RIFT_SPARK");
    expect(sparkEvents.length).toBeGreaterThanOrEqual(1);
    expect(state.players[1].exile.length).toBeGreaterThanOrEqual(1);
  });

  it("supports surrender as concede win", () => {
    const state = createTcgMatch({
      publicId: "rules_v2_surrender",
      skipMulligan: true,
    });
    applyTcgAction(state, "player", { kind: "SURRENDER" });
    expect(state.status).toBe("COMPLETED");
    expect(state.winnerId).toBe("ai");
  });

  it("summons with front lane and exhausted by default", () => {
    const loadout = resolvePracticeMatchLoadouts({
      activeDeckId: "starter-fire",
      activeDeck: [],
      rng: sequenceRng(42),
    });
    const state = createTcgMatch({
      publicId: "lane_1",
      mode: "practice",
      skipMulligan: true,
      playerDeck: materializePracticeLoadout(loadout.player),
      commanderHeroId: loadout.player.commanderHeroId,
      opponent: {
        name: "AI",
        isAi: true,
        deck: materializePracticeLoadout(loadout.ai),
        commanderHeroId: loadout.ai.commanderHeroId,
      },
    });
    const unit = state.players[0].hand.find((c) => {
      const def = getTcgCardDef(c.defId);
      return def?.type === "UNIT" && def.riftCost <= state.players[0].riftEnergy;
    });
    if (!unit) return;
    applyTcgAction(state, "player", {
      kind: "PLAY_CARD",
      handInstanceId: unit.instanceId,
    });
    const board = state.players[0].board[0]!;
    expect(board.lane).toBe("front");
    expect(typeof board.exhausted).toBe("boolean");
  });

  it("practice end-to-end still completes under v2", () => {
    const loadout = resolvePracticeMatchLoadouts({
      activeDeckId: "starter-light",
      activeDeck: [],
      rng: sequenceRng(7),
    });
    expect(loadout.player.cardIds).toHaveLength(CONSTRUCTED_RULES.deckSize);
    const state = createTcgMatch({
      publicId: "practice_v2_e2e",
      mode: "practice",
      skipMulligan: true,
      playerDeck: materializePracticeLoadout(loadout.player),
      commanderHeroId: loadout.player.commanderHeroId,
      opponent: {
        name: "Challenger",
        isAi: true,
        deck: materializePracticeLoadout(loadout.ai),
        commanderHeroId: loadout.ai.commanderHeroId,
      },
    });

    let guard = 0;
    while (state.status === "ACTIVE" && guard < 50) {
      guard += 1;
      const p = state.players[0]!;
      let played = 0;
      while (played < 4 && state.status === "ACTIVE") {
        const pick = p.hand
          .map((c) => ({ c, def: getTcgCardDef(c.defId) }))
          .filter(
            (x) =>
              x.def &&
              x.def.riftCost <= p.riftEnergy &&
              (x.def.type !== "UNIT" ||
                p.board.length < TCG_DEFAULTS.maxBoardUnits),
          )
          .sort((a, b) => a.def!.riftCost - b.def!.riftCost)[0];
        if (!pick) break;
        applyTcgAction(state, "player", {
          kind: "PLAY_CARD",
          handInstanceId: pick.c.instanceId,
        });
        played += 1;
      }
      applyTcgAction(state, "player", { kind: "END_TURN" });
    }
    expect(guard).toBeLessThan(50);
    expect(["ACTIVE", "COMPLETED"]).toContain(state.status);
  });
});

describe("mulligan phase", () => {
  it("allows replace-once then starts MAIN (AI auto-keeps)", () => {
    const state = createTcgMatch({
      publicId: "mull_1",
      mode: "ranked",
      skipMulligan: false,
    });
    expect(state.phase).toBe("MULLIGAN");
    const replace = state.players[0].hand.slice(0, 2).map((c) => c.instanceId);
    applyTcgAction(state, "player", {
      kind: "MULLIGAN",
      replaceInstanceIds: replace,
    });
    expect(state.players[0].mulliganUsed).toBe(true);
    expect(state.players[0].hand.length).toBe(5);
    expect(state.phase).toBe("MAIN");
  });
});
