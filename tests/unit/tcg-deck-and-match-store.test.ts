import { describe, expect, it, beforeEach } from "vitest";
import { TCG_STARTER_SET_20 } from "@/content/tcg";
import {
  buildStarterDeckList,
  validateDeckList,
  validateContentDeckList,
} from "@/game/tcg/deck";
import {
  __clearTcgCollectionForTests,
  getActiveDeckList,
  setActiveDeckList,
  setActiveShowcaseDeck,
} from "@/game/tcg/collection-store";
import {
  __clearTcgMatchesForTests,
  getTcgMatch,
  snapshotTcgMatch,
  startTcgMatch,
  submitTcgAction,
} from "@/game/tcg/match-store";
import { applyTcgAction, createTcgMatch } from "@/game/tcg/match-engine";
import { TCG_DEFAULTS } from "@/game/tcg/types";
import { getTcgCardCatalog, getTcgCardDef } from "@/game/tcg/card-catalog";

describe("tcg deck validation (constructed)", () => {
  it("rejects undersized, oversized, unknown, and over-copy decks", () => {
    expect(validateDeckList([]).ok).toBe(false);
    expect(validateDeckList(Array(19).fill("card-ember-spark")).ok).toBe(false);

    const tooBig = Array.from({ length: TCG_DEFAULTS.maxDeckSize + 1 }, (_, i) => {
      const id = TCG_STARTER_SET_20.cardIds[i % TCG_STARTER_SET_20.cardIds.length]!;
      return id;
    });
    expect(validateDeckList(tooBig).ok).toBe(false);

    const unknown = [...TCG_STARTER_SET_20.cardIds.slice(0, 19), "not-a-real-card"];
    expect(validateDeckList(unknown).ok).toBe(false);

    const first = TCG_STARTER_SET_20.cardIds[0]!;
    const def = getTcgCardDef(first);
    expect(def).toBeTruthy();
    const max = def!.maxCopies;
    const overCopy: string[] = Array.from({ length: max + 1 }, () => first);
    for (const id of TCG_STARTER_SET_20.cardIds) {
      if (id === first) continue;
      if (overCopy.length >= TCG_DEFAULTS.minDeckSize) break;
      overCopy.push(id);
    }
    expect(validateDeckList(overCopy).ok).toBe(false);
  });

  it("accepts the showcase twenty under constructed rules", () => {
    expect(validateDeckList(TCG_STARTER_SET_20.cardIds).ok).toBe(true);
  });

  it("content validator allows teaching pools that break copy caps when sized legally", () => {
    const list = buildStarterDeckList("starter-fire");
    const sliced = list.slice(0, TCG_DEFAULTS.starterDeckSize);
    expect(validateContentDeckList(sliced).ok).toBe(true);
  });
});

describe("tcg collection binder ownership", () => {
  beforeEach(() => {
    __clearTcgCollectionForTests();
  });

  it("rejects decks with unowned or excess copies", () => {
    const owner = "guest_test_binder";
    setActiveShowcaseDeck(owner);
    const base = getActiveDeckList(owner);
    expect(base.length).toBeGreaterThanOrEqual(20);

    const bad = setActiveDeckList(owner, [
      ...base.slice(0, 19),
      "totally-fake-card-id",
    ]);
    expect(bad.ok).toBe(false);

    const ok = setActiveDeckList(owner, base, { name: "Legal" });
    expect(ok.ok).toBe(true);
  });
});

describe("tcg match store identity", () => {
  beforeEach(() => {
    __clearTcgMatchesForTests();
  });

  it("keeps start→turn on the same owner and rejects wrong seat", () => {
    const owner = "guest_match_a";
    const other = "guest_match_b";
    const rec = startTcgMatch(owner, { playerName: "QA" });
    const id = rec.state.publicId;

    expect(getTcgMatch(id, owner)).toBeTruthy();
    expect(getTcgMatch(id, other)).toBeNull();

    const after = submitTcgAction(id, owner, { kind: "END_TURN" });
    expect(after).toBeTruthy();
    expect(after!.state.turn).toBeGreaterThanOrEqual(2);

    expect(submitTcgAction(id, other, { kind: "END_TURN" })).toBeNull();
    expect(snapshotTcgMatch(after!, owner).publicId).toBe(id);
  });

  it("surrender completes and blocks further plays", () => {
    const owner = "guest_surrender";
    const rec = startTcgMatch(owner);
    submitTcgAction(rec.state.publicId, owner, { kind: "SURRENDER" });
    expect(rec.state.status).toBe("COMPLETED");
    expect(() =>
      submitTcgAction(rec.state.publicId, owner, { kind: "END_TURN" }),
    ).toThrow(/MATCH_NOT_ACTIVE/);
  });
});

describe("tcg combat edge cases", () => {
  it("rejects playing a card not in hand and insufficient energy", () => {
    const state = createTcgMatch({ publicId: "edge_1" });
    expect(() =>
      applyTcgAction(state, "player", {
        kind: "PLAY_CARD",
        handInstanceId: "ci_missing",
      }),
    ).toThrow(/CARD_NOT_IN_HAND/);

    const expensive = state.players[0].hand.find((c) => {
      const def = getTcgCardCatalog().find((d) => d.id === c.defId);
      return def && def.riftCost > state.players[0].riftEnergy;
    });
    if (expensive) {
      expect(() =>
        applyTcgAction(state, "player", {
          kind: "PLAY_CARD",
          handInstanceId: expensive.instanceId,
        }),
      ).toThrow(/INSUFFICIENT_RIFT_ENERGY/);
    }
  });

  it("rejects actions from the inactive side", () => {
    const state = createTcgMatch({ publicId: "edge_2" });
    expect(() =>
      applyTcgAction(state, "ai", { kind: "END_TURN" }),
    ).toThrow(/NOT_YOUR_TURN/);
  });
});
