import { describe, expect, it } from "vitest";
import { getCardById } from "@/content/tcg";
import { CONSTRUCTED_RULES } from "@/content/tcg/framework/deck-rules";
import { getTcgCardDef } from "@/game/tcg/card-catalog";
import { validateContentDeckList } from "@/game/tcg/deck";
import {
  ensurePracticeOpeningHandPlayable,
  isPracticeUsefulCard,
  isRotatablePracticeDeck,
  listPracticeStarterDeckIds,
  resolvePracticeMatchLoadouts,
  toPracticeConstructedSlice,
} from "@/game/tcg/practice-loadout";
import { applyTcgAction, createTcgMatch } from "@/game/tcg/match-engine";
import { materializePracticeLoadout } from "@/game/tcg/practice-loadout";
import { materializeDeck } from "@/game/tcg/deck";
import { TCG_DEFAULTS } from "@/game/tcg/types";

/** Deterministic but non-constant sequence for variety assertions. */
function sequenceRng(seed = 1): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

describe("tcg practice loadout", () => {
  it("lists only starters with a full useful practice pool", () => {
    const ids = listPracticeStarterDeckIds();
    expect(ids.length).toBeGreaterThanOrEqual(4);
    expect(ids).toContain("starter-fire");
    expect(ids).toContain("starter-nature");
  });

  it("marks solo-playable units/spells useful and excludes equip/relic/commander bricks", () => {
    expect(isPracticeUsefulCard("rotr-c-emberfox")).toBe(true);
    expect(isPracticeUsefulCard("rotr-comp-ashwing")).toBe(true);
    expect(isPracticeUsefulCard("rotr-s-ember-spark")).toBe(true);
    // Equipment / relics need a field unit or do nothing — not for teaching hands.
    expect(isPracticeUsefulCard("rotr-e-moss-cloak")).toBe(false);
    expect(isPracticeUsefulCard("rotr-e-keeper-s-satchel")).toBe(false);
    expect(isPracticeUsefulCard("rotr-e-item-celestial-riftblade")).toBe(false);
    expect(isPracticeUsefulCard("rotr-e-item-soft-tail-sleeve")).toBe(false);
    expect(isPracticeUsefulCard("rotr-r-mat-clear-water")).toBe(false);
    // Terrain stays out of randomized practice pools.
    expect(isPracticeUsefulCard("rotr-l-riftwild-plaza")).toBe(false);
    // Commanders are hero-slot only (authored at energyCost 0) — never hand-dealt.
    expect(isPracticeUsefulCard("rotr-h-npc-keeper-travel-cloak")).toBe(false);
    expect(isPracticeUsefulCard("rotr-h-npc-npc-cook")).toBe(false);
    expect(isPracticeUsefulCard("rotr-h-elara-venn")).toBe(false);
    // Free tokens are not constructed teaching fills.
    expect(isPracticeUsefulCard("rotr-t-spark-fragment")).toBe(false);
  });

  it("random practice slices contain only useful cards and keep early curve", () => {
    const fire = resolvePracticeMatchLoadouts({
      activeDeckId: "starter-fire",
      activeDeck: [],
      rng: sequenceRng(21),
    });
    for (const id of fire.player.cardIds) {
      expect(isPracticeUsefulCard(id)).toBe(true);
      const card = getCardById(id);
      expect(card?.type).not.toBe("location");
      expect(card?.type).not.toBe("weather");
      expect(card?.type).not.toBe("trap");
      expect(card?.type).not.toBe("commander");
      expect(card?.type).not.toBe("hero");
      expect(card?.isToken).not.toBe(true);
      // Hand cards must spend meaningful energy (printed ≥ 1 after catalog clamp).
      expect(getTcgCardDef(id)?.riftCost ?? 0).toBeGreaterThanOrEqual(1);
    }
    const early = fire.player.cardIds.filter((id) => {
      const cost = getTcgCardDef(id)?.riftCost ?? 99;
      return cost <= 2;
    });
    expect(early.length).toBeGreaterThanOrEqual(10);
  });

  it("rotates starters but keeps custom constructed lists", () => {
    expect(isRotatablePracticeDeck("starter-fire")).toBe(true);
    expect(isRotatablePracticeDeck("custom_abc123")).toBe(false);
    expect(isRotatablePracticeDeck("my-ember-midrange")).toBe(false);
  });

  it("re-rolls player and AI loadouts across practice matches", () => {
    const active = Array.from({ length: 30 }, (_, i) => `pad-${i}`);
    const a = resolvePracticeMatchLoadouts({
      activeDeckId: "starter-fire",
      activeDeck: active,
      commanderHeroId: "hero-elara-venn",
      rng: sequenceRng(7),
    });
    const b = resolvePracticeMatchLoadouts({
      activeDeckId: "starter-fire",
      activeDeck: active,
      commanderHeroId: "hero-elara-venn",
      rng: sequenceRng(99),
    });

    expect(a.player.cardIds).toHaveLength(CONSTRUCTED_RULES.deckSize);
    expect(a.ai.cardIds).toHaveLength(CONSTRUCTED_RULES.deckSize);
    expect(validateContentDeckList(a.player.cardIds).ok).toBe(true);
    expect(validateContentDeckList(a.ai.cardIds).ok).toBe(true);

    const signature = (l: typeof a) =>
      `${l.player.deckId}|${l.player.cardIds.join(",")}|${l.ai.deckId}|${l.ai.cardIds.join(",")}`;
    expect(signature(a)).not.toBe(signature(b));
  });

  it("preserves custom player deck composition while shuffling order", () => {
    const activeDeck = Array.from(
      { length: CONSTRUCTED_RULES.deckSize },
      (_, i) => `keep-${i}`,
    );
    const custom = resolvePracticeMatchLoadouts({
      activeDeckId: "custom_keep_me",
      activeDeck,
      commanderHeroId: "hero-elara-venn",
      rng: sequenceRng(3),
    });
    expect(custom.player.deckId).toBe("custom_keep_me");
    expect(custom.player.cardIds).toHaveLength(CONSTRUCTED_RULES.deckSize);
    expect(new Set(custom.player.cardIds).size).toBe(CONSTRUCTED_RULES.deckSize);
    // Fake ids are padded from catalog; every original keep-* that remains
    // must still be present when the list was already unique + exact size.
    expect([...custom.player.cardIds].sort()).toEqual([...activeDeck].sort());
    // Seeded shuffle must not leave binder order intact.
    expect(custom.player.cardIds.join(",")).not.toBe(activeDeck.join(","));
    expect(custom.ai.deckId.startsWith("starter-")).toBe(true);
    for (const id of custom.ai.cardIds) {
      expect(isPracticeUsefulCard(id)).toBe(true);
    }
  });

  it("never deals duplicate cardIds in practice loadouts", () => {
    const dupHeavy = [
      ...Array.from({ length: 20 }, () => "rotr-c-emberfox"),
      ...Array.from({ length: 20 }, () => "rotr-comp-ashwing"),
      ...Array.from({ length: 20 }, () => "rotr-s-item-spirit-renewal-potion"),
    ];
    const loadout = resolvePracticeMatchLoadouts({
      activeDeckId: "starter-fire",
      activeDeck: dupHeavy,
      rng: sequenceRng(42),
    });
    expect(loadout.player.cardIds).toHaveLength(CONSTRUCTED_RULES.deckSize);
    expect(new Set(loadout.player.cardIds).size).toBe(CONSTRUCTED_RULES.deckSize);
    expect(loadout.ai.cardIds).toHaveLength(CONSTRUCTED_RULES.deckSize);
    expect(new Set(loadout.ai.cardIds).size).toBe(CONSTRUCTED_RULES.deckSize);
  });

  it("soft-mulligans brick opening hands toward a turn-1 play", () => {
    const brick = materializeDeck([
      "rotr-c-elderfern", // 5
      "rotr-c-elderfern",
      "rotr-c-furnacebeetle", // high
      "rotr-s-item-dormancy-revival-bloom", // 4 damage spell
      "rotr-comp-ashwing", // 1 useful
      "rotr-c-cinderquill", // 1
    ]);
    // Force expensive cards into the opening window
    const ordered = [
      brick[0]!,
      brick[1]!,
      brick[2]!,
      brick[3]!,
      brick[4]!,
      brick[5]!,
    ];
    const shaped = ensurePracticeOpeningHandPlayable(ordered, { maxOpenCost: 1 });
    const hand = shaped.slice(0, TCG_DEFAULTS.openingHand);
    const hasTurn1 = hand.some((c) => {
      const def = getTcgCardDef(c.defId);
      return def != null && def.riftCost <= 1 && isPracticeUsefulCard(def.id);
    });
    expect(hasTurn1).toBe(true);
  });

  it("practice matches open with at least one turn-1 affordable useful card", () => {
    for (let seed = 1; seed <= 12; seed += 1) {
      const loadout = resolvePracticeMatchLoadouts({
        activeDeckId: "starter-fire",
        activeDeck: [],
        rng: sequenceRng(seed * 17),
      });
      const state = createTcgMatch({
        publicId: `practice_curve_${seed}`,
        mode: "practice",
        playerDeck: materializePracticeLoadout(loadout.player),
        commanderHeroId: loadout.player.commanderHeroId,
      });
      const hand = state.players[0]!.hand;
      const playable = hand.some((c) => {
        const def = getTcgCardDef(c.defId);
        return (
          def != null &&
          def.riftCost <= state.players[0]!.riftEnergy &&
          isPracticeUsefulCard(def.id)
        );
      });
      expect(playable).toBe(true);
      expect(state.players[0]!.riftEnergy).toBe(state.players[0]!.riftEnergyMax);
      expect(state.players[0]!.riftEnergy).toBeGreaterThanOrEqual(1);
    }
  });

  it("shuffles opening hands differently across rematch createTcgMatch calls", () => {
    const loadout = resolvePracticeMatchLoadouts({
      activeDeckId: "starter-fire",
      activeDeck: [],
      rng: sequenceRng(11),
    });
    const hands = new Set<string>();
    for (let i = 0; i < 8; i += 1) {
      const state = createTcgMatch({
        publicId: `practice_${i}`,
        mode: "practice",
        playerDeck: materializePracticeLoadout(loadout.player),
        commanderHeroId: loadout.player.commanderHeroId,
      });
      hands.add(state.players[0]!.hand.map((c) => c.defId).join(","));
    }
    expect(hands.size).toBeGreaterThan(1);
  });

  it("toPracticeConstructedSlice never reintroduces filtered junk", () => {
    const mixed = [
      ...Array.from({ length: 20 }, () => "rotr-c-emberfox"),
      ...Array.from({ length: 20 }, () => "rotr-l-riftwild-plaza"),
      ...Array.from({ length: 20 }, () => "rotr-comp-ashwing"),
      ...Array.from({ length: 10 }, () => "rotr-e-moss-cloak"),
    ];
    const slice = toPracticeConstructedSlice(mixed, sequenceRng(5));
    expect(slice).toHaveLength(CONSTRUCTED_RULES.deckSize);
    expect(new Set(slice).size).toBe(CONSTRUCTED_RULES.deckSize);
    expect(slice.every(isPracticeUsefulCard)).toBe(true);
    // Terrain + equipment stay filtered; units / combat spells only.
    expect(slice.some((id) => id.includes("riftwild-plaza"))).toBe(false);
    expect(slice.some((id) => id.includes("moss-cloak"))).toBe(false);
  });

  it("drops equip-heavy starters from Practice Board rotation", () => {
    const ids = listPracticeStarterDeckIds();
    expect(ids).not.toContain("starter-crystal");
    expect(ids).not.toContain("starter-shadow");
    expect(ids).not.toContain("starter-celestial");
    expect(ids.length).toBeGreaterThanOrEqual(4);
  });

  it("never opens practice with equipment-only hands across many seeds", () => {
    for (let seed = 1; seed <= 24; seed += 1) {
      const loadout = resolvePracticeMatchLoadouts({
        activeDeckId: "starter-fire",
        activeDeck: [],
        rng: sequenceRng(seed * 19),
      });
      for (const id of loadout.player.cardIds) {
        const card = getCardById(id);
        expect(card?.type).not.toBe("equipment");
        expect(card?.type).not.toBe("relic");
        expect(card?.type).not.toBe("artifact");
      }
      const state = createTcgMatch({
        publicId: `practice_no_equip_${seed}`,
        mode: "practice",
        playerDeck: materializePracticeLoadout(loadout.player),
        commanderHeroId: loadout.player.commanderHeroId,
      });
      const hand = state.players[0]!.hand;
      expect(hand.length).toBeGreaterThan(0);
      const hasSoloPlay = hand.some((c) => {
        const def = getTcgCardDef(c.defId);
        const card = getCardById(c.defId);
        return (
          def != null &&
          def.riftCost <= state.players[0]!.riftEnergy &&
          (card?.type === "companion" ||
            card?.type === "evolution" ||
            card?.type === "spell" ||
            card?.type === "item")
        );
      });
      expect(hasSoloPlay).toBe(true);
    }
  });

  it("plays several practice turns with units/spells without equip bricks", () => {
    let unitsOrSpells = 0;
    for (let seed = 1; seed <= 10; seed += 1) {
      const loadout = resolvePracticeMatchLoadouts({
        activeDeckId: "starter-fire",
        activeDeck: [],
        rng: sequenceRng(seed * 53),
      });
      const state = createTcgMatch({
        publicId: `practice_turns_${seed}`,
        mode: "practice",
        playerDeck: materializePracticeLoadout(loadout.player),
        commanderHeroId: loadout.player.commanderHeroId,
      });

      for (let step = 0; step < 6 && state.status === "ACTIVE"; step += 1) {
        const p = state.players[0]!;
        if (state.activeSideId !== p.id) break;
        const pick = p.hand
          .map((c) => ({
            c,
            def: getTcgCardDef(c.defId),
            card: getCardById(c.defId),
          }))
          .filter((x) => {
            if (!x.def || x.def.riftCost > p.riftEnergy) return false;
            if (
              x.def.type === "UNIT" &&
              p.board.length >= TCG_DEFAULTS.maxBoardUnits
            ) {
              return false;
            }
            return true;
          })
          .sort((a, b) => a.def!.riftCost - b.def!.riftCost)[0];
        if (pick) {
          applyTcgAction(state, "player", {
            kind: "PLAY_CARD",
            handInstanceId: pick.c.instanceId,
          });
          unitsOrSpells += 1;
          expect(pick.card?.type).not.toBe("equipment");
        }
        if (state.status !== "ACTIVE") break;
        applyTcgAction(state, "player", { kind: "END_TURN" });
      }
    }
    expect(unitsOrSpells).toBeGreaterThan(10);
  });
});
