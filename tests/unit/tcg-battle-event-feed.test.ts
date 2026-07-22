import { describe, expect, it } from "vitest";
import {
  buildBattleFeed,
  computeMatchFeedSummary,
  filterFeedLines,
  formatDevEventLine,
  isPlayerVisibleEvent,
} from "@/game/tcg/events";
import {
  applyTcgAction,
  createTcgMatch,
} from "@/game/tcg/match-engine";
import { getTcgCardCatalog } from "@/game/tcg/card-catalog";

describe("battle event feed", () => {
  it("hides internal codes from players", () => {
    expect(isPlayerVisibleEvent("SECOND_MAIN_SKIPPED")).toBe(false);
    expect(isPlayerVisibleEvent("DRAW")).toBe(true);
    expect(
      isPlayerVisibleEvent("PLAY_ITEM", { hiddenFromPlayer: true }),
    ).toBe(false);
  });

  it("renders natural-language draw / summon / combat lines", () => {
    const events = [
      {
        type: "TURN_START",
        actorId: "player",
        payload: { turn: 4, phase: "MAIN", seq: 1 },
      },
      {
        type: "ENERGY_REFILL",
        actorId: "player",
        payload: {
          turn: 4,
          seq: 2,
          gained: 1,
          energyBefore: 5,
          energyAfter: 6,
        },
      },
      {
        type: "DRAW",
        actorId: "player",
        payload: { turn: 4, seq: 3, defId: "frostfin", cardName: "Frostfin" },
      },
      {
        type: "PLAY_UNIT",
        actorId: "player",
        payload: {
          turn: 4,
          seq: 4,
          defId: "sprayfin",
          cardName: "Sprayfin",
          lane: "front",
        },
      },
      {
        type: "UNIT_STRIKE",
        actorId: "ai",
        payload: {
          turn: 4,
          seq: 5,
          attackerName: "Mossdrake",
          targetName: "Bramblefox",
          attackerId: "a1",
          targetId: "b1",
          damage: 3,
        },
      },
      {
        type: "UNIT_DEATH",
        actorId: "player",
        payload: {
          turn: 4,
          seq: 6,
          defId: "bramblefox",
          cardName: "Bramblefox",
          instanceId: "b1",
        },
      },
      {
        type: "SECOND_MAIN_SKIPPED",
        actorId: "player",
        payload: { turn: 4, seq: 7, hiddenFromPlayer: true },
      },
    ];

    const feed = buildBattleFeed(events, { yourSideId: "player" });
    const texts = feed
      .flatMap((l) =>
        l.children?.length ? [l.text, ...l.children.map((c) => c.text)] : [l.text],
      )
      .join("\n");

    expect(texts).toContain("Turn 4");
    expect(texts).toContain("YOUR TURN");
    expect(texts).toMatch(/You gained 1 Rift Energy/);
    expect(texts).toContain("You drew Frostfin");
    expect(texts).toContain("You summoned Sprayfin to the Frontline");
    expect(texts).toContain("Mossdrake attacked Bramblefox");
    expect(texts).toContain("3 Damage");
    expect(texts).toContain("Bramblefox was defeated");
    expect(texts).not.toContain("SECOND_MAIN_SKIPPED");
    expect(texts).not.toContain("DRAW");
    expect(texts).not.toMatch(/\bUnit fell\b/);
  });

  it("collapses combat into a block and supports filters", () => {
    const events = [
      {
        type: "UNIT_STRIKE",
        actorId: "ai",
        payload: {
          turn: 2,
          seq: 1,
          attackerName: "A",
          targetName: "B",
          damage: 2,
          attackerId: "x",
          targetId: "y",
        },
      },
      {
        type: "UNIT_DEATH",
        actorId: "player",
        payload: { turn: 2, seq: 2, cardName: "B", instanceId: "y" },
      },
    ];
    const feed = buildBattleFeed(events, { yourSideId: "player" });
    const block = feed.find((l) => l.kind === "combat-block");
    expect(block).toBeTruthy();
    expect(block?.children?.length).toBeGreaterThan(1);

    const combatOnly = filterFeedLines(feed, "combat");
    expect(combatOnly.some((l) => l.kind === "combat-block")).toBe(true);
  });

  it("computes end-of-match summary", () => {
    const summary = computeMatchFeedSummary(
      [
        {
          type: "FACE_STRIKE",
          actorId: "player",
          payload: { damage: 4, turn: 3 },
        },
        {
          type: "PLAY_SPELL_HEAL",
          actorId: "player",
          payload: { heal: 2, turn: 3 },
        },
        {
          type: "PLAY_UNIT",
          actorId: "player",
          payload: { turn: 3 },
        },
        {
          type: "UNIT_DEATH",
          actorId: "player",
          payload: { turn: 3 },
        },
        {
          type: "MATCH_END",
          actorId: "player",
          payload: { reason: "KEEPER_DOWN", turn: 3 },
        },
      ],
      "player",
    );
    expect(summary.damageDealt).toBe(4);
    expect(summary.healing).toBe(2);
    expect(summary.cardsPlayed).toBe(2);
    expect(summary.companionsLost).toBe(1);
    expect(summary.winnerId).toBe("player");
  });

  it("formats raw engine lines for Dev console", () => {
    expect(
      formatDevEventLine({
        type: "DRAW",
        actorId: "player",
        payload: { seq: 9, turn: 4, defId: "frostfin", cardName: "Frostfin" },
      }),
    ).toContain("DRAW");
  });

  it("engine enrichs events with seq/turn/cardName and skips SECOND_MAIN in player feed", () => {
    const state = createTcgMatch({ publicId: "feed_enrich_1" });
    const affordable = state.players[0]!.hand.find((c) => {
      const def = getTcgCardCatalog().find((d) => d.id === c.defId);
      return (
        def &&
        def.type === "UNIT" &&
        def.riftCost <= state.players[0]!.riftEnergy
      );
    });
    if (affordable) {
      applyTcgAction(state, "player", {
        kind: "PLAY_CARD",
        handInstanceId: affordable.instanceId,
      });
    }
    applyTcgAction(state, "player", { kind: "END_TURN" });

    const types = state.events.map((e) => e.type);
    expect(types).toContain("ENERGY_REFILL");
    expect(types).toContain("COMBAT_PHASE");
    expect(types).toContain("END_PHASE");

    for (const e of state.events) {
      expect(typeof e.payload.seq).toBe("number");
      expect(typeof e.payload.turn).toBe("number");
      expect(typeof e.payload.phase).toBe("string");
    }

    const skipped = state.events.find((e) => e.type === "SECOND_MAIN_SKIPPED");
    expect(skipped?.payload.hiddenFromPlayer).toBe(true);

    const feed = buildBattleFeed(state.events, { yourSideId: "player" });
    const blob = feed.map((l) => l.text).join(" ");
    expect(blob).not.toContain("SECOND_MAIN_SKIPPED");
    expect(blob).not.toMatch(/\bDRAW\b/);
  });
});
