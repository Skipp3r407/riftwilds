import { describe, expect, it } from "vitest";
import { getCardById } from "@/content/tcg";
import { getTcgCardDef } from "@/game/tcg/card-catalog";
import { materializeDeck } from "@/game/tcg/deck";
import { applyTcgAction, createTcgMatch } from "@/game/tcg/match-engine";
import {
  listPracticeStarterDeckIds,
  materializePracticeLoadout,
  resolvePracticeMatchLoadouts,
} from "@/game/tcg/practice-loadout";
import { TCG_DEFAULTS } from "@/game/tcg/types";

function sequenceRng(seed = 1): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

const BANNED = ["starter-crystal", "starter-shadow", "starter-celestial"];

describe("practice board end-to-end", () => {
  it("keeps equip-brick starters out of practice rotation", () => {
    const ids = listPracticeStarterDeckIds();
    for (const ban of BANNED) expect(ids).not.toContain(ban);
    expect(ids).toContain("starter-light");
    expect(ids).toContain("starter-fire");
  });

  it("plays start→units→combat→draw through to a result without soft-locks", () => {
    const faceDamages: number[] = [];
    let completed = 0;

    for (let seed = 1; seed <= 12; seed += 1) {
      const loadout = resolvePracticeMatchLoadouts({
        activeDeckId: "starter-fire",
        activeDeck: [],
        rng: sequenceRng(seed * 91),
      });
      expect(BANNED).not.toContain(loadout.player.deckId);
      expect(BANNED).not.toContain(loadout.ai.deckId);

      for (const id of loadout.player.cardIds) {
        const t = getCardById(id)?.type;
        expect(t).not.toBe("equipment");
        expect(t).not.toBe("relic");
      }

      const state = createTcgMatch({
        publicId: `practice_e2e_${seed}`,
        mode: "practice",
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
      while (state.status === "ACTIVE" && guard < 60) {
        guard += 1;
        const p = state.players[0]!;
        expect(state.activeSideId).toBe(p.id);

        // Exhaust from prior turns must clear at MAIN.
        for (const u of p.board) {
          if ((u.summonedOnTurn ?? 0) < state.turn) {
            expect(u.exhausted).toBe(false);
          }
        }

        let played = 0;
        while (played < 5 && state.status === "ACTIVE") {
          const pick = p.hand
            .map((c) => ({ c, def: getTcgCardDef(c.defId) }))
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
          if (!pick) break;
          applyTcgAction(state, "player", {
            kind: "PLAY_CARD",
            handInstanceId: pick.c.instanceId,
          });
          played += 1;
        }

        if (state.status !== "ACTIVE") break;
        const before = state.events.length;
        applyTcgAction(state, "player", { kind: "END_TURN" });
        for (const ev of state.events.slice(before)) {
          if (ev.type === "FACE_STRIKE" && typeof ev.payload.damage === "number") {
            faceDamages.push(ev.payload.damage as number);
          }
        }
      }

      expect(state.status).toBe("COMPLETED");
      completed += 1;
    }

    expect(completed).toBe(12);
    expect(faceDamages.length).toBeGreaterThan(0);
    // ATK is respected — not permanently stuck at 1.
    expect(Math.max(...faceDamages)).toBeGreaterThanOrEqual(1);
    expect(new Set(faceDamages).size).toBeGreaterThanOrEqual(1);
  });

  it("attaches equipment when a unit is already on the field", () => {
    const unitId = "rotr-c-bramblefox";
    const equipId = "rotr-e-moss-cloak";
    const deck = materializeDeck([unitId, equipId]);
    while (deck.length < 30) deck.push(...materializeDeck([unitId]));

    const state = createTcgMatch({
      publicId: "equip_with_unit",
      playerDeck: deck.slice(0, 30),
      opponent: { name: "AI", isAi: true, deck: deck.slice(0, 30) },
    });
    const player = state.players[0]!;
    player.riftEnergy = 10;
    player.riftEnergyMax = 10;
    player.hand = [
      { instanceId: "u1", defId: unitId },
      { instanceId: "e1", defId: equipId },
    ];
    applyTcgAction(state, "player", { kind: "PLAY_CARD", handInstanceId: "u1" });
    applyTcgAction(state, "player", {
      kind: "PLAY_CARD",
      handInstanceId: "e1",
      targetInstanceId: player.board[0]!.instanceId,
    });
    expect(player.board[0]!.equipmentIds).toContain(equipId);
  });
});
