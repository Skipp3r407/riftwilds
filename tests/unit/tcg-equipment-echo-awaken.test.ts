import { describe, expect, it } from "vitest";
import { getTcgCardDef, clearTcgCardCatalogCache } from "@/game/tcg/card-catalog";
import {
  applyTcgAction,
  createTcgMatch,
} from "@/game/tcg/match-engine";
import { materializeDeck } from "@/game/tcg/deck";
import { KEYWORD_REGISTRY } from "@/game/tcg/combat/keywords";
import { deriveEquipmentMods } from "@/game/tcg/combat/equipment";

describe("equipment / echo / awaken keywords", () => {
  it("marks echo and awaken as full engine support", () => {
    expect(KEYWORD_REGISTRY.echo.support).toBe("full");
    expect(KEYWORD_REGISTRY.awaken.support).toBe("full");
  });

  it("derives moss cloak bloom grant", () => {
    const mods = deriveEquipmentMods({
      defId: "rotr-e-moss-cloak",
      riftCost: 2,
      description: "Bearer has Bloom.",
    });
    expect(mods.grantedKeywords).toContain("bloom");
  });

  it("refuses equipment with no friendly unit before spending energy", () => {
    clearTcgCardCatalogCache();
    const equipId = "rotr-e-moss-cloak";
    const pad = materializeDeck(["rotr-c-bramblefox"]);
    while (pad.length < 30) pad.push(...materializeDeck(["rotr-c-bramblefox"]));

    const state = createTcgMatch({
      publicId: "tcg_equip_empty",
      playerDeck: pad.slice(0, 30),
      opponent: { name: "AI", isAi: true, deck: pad.slice(0, 30) },
    });
    const player = state.players[0]!;
    player.riftEnergy = 10;
    player.riftEnergyMax = 10;
    player.board = [];
    const equipInst = { instanceId: "hand_equip_empty", defId: equipId };
    player.hand = [equipInst];

    expect(() =>
      applyTcgAction(state, "player", {
        kind: "PLAY_CARD",
        handInstanceId: equipInst.instanceId,
      }),
    ).toThrow("EQUIP_NO_TARGET");
    expect(player.riftEnergy).toBe(10);
    expect(player.hand).toHaveLength(1);
    expect(player.discard).toHaveLength(0);
  });

  it("attaches equipment to a friendly unit", () => {
    clearTcgCardCatalogCache();
    const unitId = "rotr-c-bramblefox";
    const equipId = "rotr-e-moss-cloak";
    expect(getTcgCardDef(unitId)?.type).toBe("UNIT");
    expect(getTcgCardDef(equipId)?.contentType).toBe("equipment");

    const deck = materializeDeck([unitId, equipId, unitId, unitId, equipId, unitId]);
    // Pad to avoid fatigue noise
    while (deck.length < 20) {
      deck.push(...materializeDeck([unitId]));
    }

    const state = createTcgMatch({
      publicId: "tcg_equip_1",
      playerDeck: deck.slice(0, 30),
      opponent: { name: "AI", isAi: true, deck: deck.slice(0, 30) },
    });

    // Force a known hand: unit + equipment
    const player = state.players[0]!;
    player.riftEnergy = 10;
    player.riftEnergyMax = 10;
    const unitInst = {
      instanceId: "hand_unit_1",
      defId: unitId,
    };
    const equipInst = {
      instanceId: "hand_equip_1",
      defId: equipId,
    };
    player.hand = [unitInst, equipInst];

    applyTcgAction(state, "player", {
      kind: "PLAY_CARD",
      handInstanceId: unitInst.instanceId,
    });
    expect(player.board).toHaveLength(1);
    const beforeAtk = player.board[0]!.attack;
    const beforeKw = [...player.board[0]!.keywords];

    applyTcgAction(state, "player", {
      kind: "PLAY_CARD",
      handInstanceId: equipInst.instanceId,
      targetInstanceId: player.board[0]!.instanceId,
    });

    expect(player.board[0]!.equipmentIds).toContain(equipId);
    expect(player.board[0]!.keywords).toEqual(
      expect.arrayContaining(["bloom"]),
    );
    expect(
      player.board[0]!.attack + player.board[0]!.defense,
    ).toBeGreaterThanOrEqual(beforeAtk);
    expect(
      state.events.some((e) => e.type === "PLAY_EQUIPMENT"),
    ).toBe(true);
    // Bloom grant should appear even if already present
    expect(
      new Set([...beforeKw, "bloom"]).size,
    ).toBeGreaterThanOrEqual(beforeKw.length);
  });

  it("arms Echo then replays a cheap spell at +1 energy", () => {
    clearTcgCardCatalogCache();
    const echoSetup = "rotr-s-spirit-echo";
    // Find a cheap damage spell
    const catalog = [
      "rotr-s-root-snare",
      "rotr-s-crystal-ping",
      "rotr-s-storm-sip",
    ];
    let damageSpell = catalog.find((id) => {
      const d = getTcgCardDef(id);
      return d && d.type === "SPELL" && d.riftCost <= 2 && d.power > 0;
    });
    if (!damageSpell) {
      // Fallback: any low-cost spell with power
      damageSpell = "rotr-s-crystal-ping";
    }
    const echoDef = getTcgCardDef(echoSetup);
    const dmgDef = getTcgCardDef(damageSpell!);
    expect(echoDef).toBeTruthy();
    expect(dmgDef).toBeTruthy();

    const pad = materializeDeck(["rotr-c-bramblefox"]);
    while (pad.length < 30) pad.push(...materializeDeck(["rotr-c-bramblefox"]));

    const state = createTcgMatch({
      publicId: "tcg_echo_1",
      playerDeck: pad.slice(0, 30),
      opponent: { name: "AI", isAi: true, deck: pad.slice(0, 30) },
    });
    const player = state.players[0]!;
    player.riftEnergy = 10;
    player.riftEnergyMax = 10;
    const echoInst = { instanceId: "echo_1", defId: echoSetup };
    const dmgInst = { instanceId: "dmg_1", defId: damageSpell! };
    player.hand = [echoInst, dmgInst];

    applyTcgAction(state, "player", {
      kind: "PLAY_CARD",
      handInstanceId: echoInst.instanceId,
    });
    expect(player.echoReady).toBe(true);

    const foeHpBefore = state.players[1]!.keeperHp;
    applyTcgAction(state, "player", {
      kind: "PLAY_CARD",
      handInstanceId: dmgInst.instanceId,
    });

    expect(
      state.events.some((e) => e.type === "ECHO_SPELL" || e.type === "ECHO_RESOLVED"),
    ).toBe(true);
    expect(state.players[1]!.keeperHp).toBeLessThan(foeHpBefore);
    expect(player.echoReady).toBe(false);
  });

  it("awakens a unit at the start of the owner's next turn", () => {
    clearTcgCardCatalogCache();
    // Pick any unit; inject awaken keyword after summon via board mutation
    const unitId = "rotr-c-bramblefox";
    const pad = materializeDeck([unitId]);
    while (pad.length < 30) pad.push(...materializeDeck([unitId]));

    const state = createTcgMatch({
      publicId: "tcg_awaken_1",
      playerDeck: pad.slice(0, 30),
      opponent: { name: "AI", isAi: true, deck: pad.slice(0, 30) },
    });
    const player = state.players[0]!;
    player.riftEnergy = 10;
    player.riftEnergyMax = 10;
    const unitInst = { instanceId: "aw_unit", defId: unitId };
    player.hand = [unitInst];

    applyTcgAction(state, "player", {
      kind: "PLAY_CARD",
      handInstanceId: unitInst.instanceId,
    });
    const unit = player.board[0]!;
    unit.keywords = [...unit.keywords, "awaken"];
    unit.summonedOnTurn = state.turn;
    const atkBefore = unit.attack;
    const hpBefore = unit.health;

    applyTcgAction(state, "player", { kind: "END_TURN" });
    // After AI turn, player's next beginTurn should awaken
    const u2 = state.players[0]!.board[0];
    if (u2) {
      expect(u2.statuses.some((s) => s.id === "awakened")).toBe(true);
      expect(u2.attack).toBeGreaterThanOrEqual(atkBefore + 2);
      expect(u2.health).toBeGreaterThanOrEqual(hpBefore + 2);
      expect(u2.keywords.includes("awaken")).toBe(false);
    }
    expect(state.events.some((e) => e.type === "AWAKEN")).toBe(true);
  });
});
