import { describe, expect, it, vi } from "vitest";
import { getTcgCardDef, clearTcgCardCatalogCache } from "@/game/tcg/card-catalog";
import {
  resolvePlayCost,
  isCommanderPlayDef,
  canAffordPlay,
  playCostContextFromSide,
} from "@/game/tcg/play-cost";
import {
  applyTcgAction,
  createTcgMatch,
} from "@/game/tcg/match-engine";
import {
  materializePracticeLoadout,
  resolvePracticeMatchLoadouts,
} from "@/game/tcg/practice-loadout";
import { isRiftSparkToken, RIFT_SPARK_DEF_ID } from "@/game/tcg/rules/rift-spark";

function seededRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

function practiceMatch(publicId: string, seed = 1) {
  const rng = seededRng(seed);
  const loadout = resolvePracticeMatchLoadouts({
    activeDeckId: "starter-fire",
    activeDeck: [],
    rng,
  });
  return createTcgMatch({
    publicId,
    mode: "practice",
    skipMulligan: true,
    playerDeck: materializePracticeLoadout(loadout.player, rng),
    commanderHeroId: loadout.player.commanderHeroId,
  });
}

describe("tcg rift energy play costs", () => {
  it("allows authored collectible 0-cost utilities and keeps commanders as hero-slot 0", () => {
    clearTcgCardCatalogCache();
    expect(getTcgCardDef("rotr-c-emberfox")!.riftCost).toBeGreaterThanOrEqual(1);
    expect(getTcgCardDef("rotr-c-glowbug")!.riftCost).toBe(0);
    expect(getTcgCardDef("rotr-s-morning-dew")!.riftCost).toBe(0);
    expect(getTcgCardDef("rotr-h-npc-keeper-travel-cloak")!.riftCost).toBe(0);
    expect(isCommanderPlayDef(getTcgCardDef("rotr-h-npc-keeper-travel-cloak")!)).toBe(
      true,
    );
    expect(getTcgCardDef("rotr-t-spark-fragment")!.riftCost).toBe(0);
  });

  it("applies first-companion discount once without making everything free", () => {
    const gale = getTcgCardDef("rotr-c-galekit");
    expect(gale).toBeTruthy();
    expect(gale!.riftCost).toBeGreaterThanOrEqual(1);
    const first = resolvePlayCost(gale!, {
      firstCompanionDiscountAvailable: true,
    });
    expect(first.cost).toBe(Math.max(0, gale!.riftCost - 1));
    expect(first.usedCompanionDiscount).toBe(true);
    const second = resolvePlayCost(gale!, {
      firstCompanionDiscountAvailable: false,
    });
    expect(second.cost).toBe(gale!.riftCost);
    expect(second.usedCompanionDiscount).toBe(false);
  });

  it("allows exact energy equals cost", () => {
    const state = practiceMatch("energy_exact");
    const side = state.players[0]!;
    const pick = side.hand
      .map((c) => ({ c, def: getTcgCardDef(c.defId)! }))
      .filter((x) => x.def && x.def.type === "UNIT" && !isCommanderPlayDef(x.def))
      .sort((a, b) => a.def.riftCost - b.def.riftCost)[0];
    expect(pick).toBeTruthy();
    const cost = resolvePlayCost(
      pick!.def,
      playCostContextFromSide(side),
    ).cost;
    side.riftEnergy = cost;
    expect(canAffordPlay(side.riftEnergy, pick!.def, playCostContextFromSide(side))).toBe(
      true,
    );
    applyTcgAction(state, side.id, {
      kind: "PLAY_CARD",
      handInstanceId: pick!.c.instanceId,
    });
    expect(side.riftEnergy).toBe(0);
    expect(side.hand.some((c) => c.instanceId === pick!.c.instanceId)).toBe(false);
  });

  it("rejects plays that exceed current energy before leaving hand", () => {
    const state = practiceMatch("energy_reject", 9);
    const side = state.players[0]!;
    const expensive = side.hand
      .map((c) => ({ c, def: getTcgCardDef(c.defId)! }))
      .find(
        (x) =>
          x.def &&
          !isCommanderPlayDef(x.def) &&
          resolvePlayCost(x.def, playCostContextFromSide(side)).cost >
            side.riftEnergy,
      );
    const target = expensive
      ? expensive
      : (() => {
          side.riftEnergy = 0;
          const any = side.hand
            .map((c) => ({ c, def: getTcgCardDef(c.defId)! }))
            .find(
              (x) =>
                x.def &&
                x.def.type === "UNIT" &&
                resolvePlayCost(x.def, playCostContextFromSide(side)).cost > 0,
            );
          expect(any).toBeTruthy();
          return any!;
        })();

    const beforeHand = side.hand.map((c) => c.instanceId);
    const beforeEnergy = side.riftEnergy;
    expect(() =>
      applyTcgAction(state, side.id, {
        kind: "PLAY_CARD",
        handInstanceId: target.c.instanceId,
      }),
    ).toThrow(/INSUFFICIENT_RIFT_ENERGY/);
    expect(side.hand.map((c) => c.instanceId)).toEqual(beforeHand);
    expect(side.riftEnergy).toBe(beforeEnergy);
  });

  it("allows zero-cost Rift Spark", () => {
    const state = practiceMatch("energy_zero");
    const side = state.players[0]!;
    side.riftEnergy = 0;
    const spark = side.hand.find((c) => isRiftSparkToken(c.defId));
    if (!spark) {
      side.hand.push({
        instanceId: "spark_test",
        defId: RIFT_SPARK_DEF_ID,
      });
    }
    const id = spark?.instanceId ?? "spark_test";
    const def = getTcgCardDef(spark?.defId ?? RIFT_SPARK_DEF_ID)!;
    expect(resolvePlayCost(def).cost).toBe(0);
    expect(canAffordPlay(0, def)).toBe(true);
    applyTcgAction(state, side.id, {
      kind: "PLAY_CARD",
      handInstanceId: id,
    });
    // Spark is free to play, then grants +1 temporary energy.
    expect(side.riftEnergy).toBe(1);
    expect(side.hand.some((c) => c.instanceId === id)).toBe(false);
  });

  it("applies discounted companion cost to affordability", () => {
    const gale = getTcgCardDef("rotr-c-galekit")!;
    const printed = gale.riftCost;
    expect(printed).toBeGreaterThanOrEqual(1);
    const discounted = resolvePlayCost(gale, {
      firstCompanionDiscountAvailable: true,
    });
    expect(discounted.cost).toBe(printed - 1);
    expect(canAffordPlay(discounted.cost, gale, {
      firstCompanionDiscountAvailable: true,
    })).toBe(true);
    expect(canAffordPlay(discounted.cost - 1, gale, {
      firstCompanionDiscountAvailable: true,
    })).toBe(discounted.cost - 1 >= discounted.cost);
    if (discounted.cost > 0) {
      expect(
        canAffordPlay(discounted.cost - 1, gale, {
          firstCompanionDiscountAvailable: true,
        }),
      ).toBe(false);
    }
  });

  it("applies temporary cost modifiers before affordability", () => {
    const unit = getTcgCardDef("rotr-c-emberfox")!;
    const printed = unit.riftCost;
    const cheaper = resolvePlayCost(unit, { temporaryCostModifier: -2 });
    expect(cheaper.cost).toBe(Math.max(0, printed - 2));
    const pricier = resolvePlayCost(unit, { temporaryCostModifier: 3 });
    expect(pricier.cost).toBe(printed + 3);
    expect(canAffordPlay(cheaper.cost, unit, { temporaryCostModifier: -2 })).toBe(
      true,
    );
    expect(
      canAffordPlay(pricier.cost - 1, unit, { temporaryCostModifier: 3 }),
    ).toBe(false);
  });

  it("applies relic/buff costReduction after temp modifiers", () => {
    const unit = getTcgCardDef("rotr-c-emberfox")!;
    const resolved = resolvePlayCost(unit, {
      temporaryCostModifier: 2,
      costReduction: 3,
    });
    expect(resolved.cost).toBe(Math.max(0, unit.riftCost + 2 - 3));
  });

  it("rechecks affordability after energy changes mid-turn", () => {
    const state = practiceMatch("energy_midturn", 3);
    const side = state.players[0]!;
    const units = side.hand
      .map((c) => ({ c, def: getTcgCardDef(c.defId)! }))
      .filter(
        (x) =>
          x.def?.type === "UNIT" &&
          !isCommanderPlayDef(x.def) &&
          resolvePlayCost(x.def, playCostContextFromSide(side)).cost >= 1,
      )
      .sort((a, b) => a.def.riftCost - b.def.riftCost);
    expect(units.length).toBeGreaterThanOrEqual(1);
    const first = units[0]!;
    const firstCost = resolvePlayCost(
      first.def,
      playCostContextFromSide(side),
    ).cost;
    side.riftEnergy = firstCost;
    applyTcgAction(state, side.id, {
      kind: "PLAY_CARD",
      handInstanceId: first.c.instanceId,
    });
    expect(side.riftEnergy).toBe(0);

    const next = side.hand
      .map((c) => ({ c, def: getTcgCardDef(c.defId)! }))
      .find(
        (x) =>
          x.def?.type === "UNIT" &&
          !isCommanderPlayDef(x.def) &&
          resolvePlayCost(x.def, playCostContextFromSide(side)).cost > 0,
      );
    if (next) {
      const before = side.hand.length;
      expect(() =>
        applyTcgAction(state, side.id, {
          kind: "PLAY_CARD",
          handInstanceId: next.c.instanceId,
        }),
      ).toThrow(/INSUFFICIENT_RIFT_ENERGY/);
      expect(side.hand.length).toBe(before);
      expect(side.riftEnergy).toBe(0);
    }
  });

  it("logs rejected plays in developer mode", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    vi.stubEnv("NODE_ENV", "development");
    try {
      const state = practiceMatch("energy_log", 11);
      const side = state.players[0]!;
      side.riftEnergy = 0;
      const unit = side.hand
        .map((c) => ({ c, def: getTcgCardDef(c.defId)! }))
        .find(
          (x) =>
            x.def &&
            !isCommanderPlayDef(x.def) &&
            resolvePlayCost(x.def, playCostContextFromSide(side)).cost > 0,
        );
      expect(unit).toBeTruthy();
      expect(() =>
        applyTcgAction(state, side.id, {
          kind: "PLAY_CARD",
          handInstanceId: unit!.c.instanceId,
        }),
      ).toThrow(/INSUFFICIENT_RIFT_ENERGY/);
      expect(spy).toHaveBeenCalled();
      const logged = spy.mock.calls.some(
        (args) =>
          String(args[0]).includes("rejected play") &&
          args[1] === "INSUFFICIENT_RIFT_ENERGY",
      );
      expect(logged).toBe(true);
    } finally {
      vi.unstubAllEnvs();
      spy.mockRestore();
    }
  });

  it("spends printed energy when playing a practice unit", () => {
    const state = practiceMatch("energy_spend_verify");
    const side = state.players[0]!;
    const pick = side.hand
      .map((c) => ({ c, def: getTcgCardDef(c.defId)! }))
      .filter((x) => x.def.type === "UNIT" && x.def.riftCost >= 1)
      .sort((a, b) => a.def.riftCost - b.def.riftCost)[0];
    expect(pick).toBeTruthy();
    const before = side.riftEnergy;
    const expected = resolvePlayCost(
      pick!.def,
      playCostContextFromSide(side),
    ).cost;
    expect(expected).toBeGreaterThanOrEqual(0);
    expect(before).toBeGreaterThanOrEqual(expected);
    applyTcgAction(state, side.id, {
      kind: "PLAY_CARD",
      handInstanceId: pick!.c.instanceId,
    });
    expect(side.riftEnergy).toBe(before - expected);
  });
});
