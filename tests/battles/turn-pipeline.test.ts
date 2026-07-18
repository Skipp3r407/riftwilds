import { describe, expect, it } from "vitest";
import {
  createTrainingBattle,
  resolveRound,
  chooseAiAction,
} from "@/game/arena/engine";
import { buildCombatant, buildTrainingAi } from "@/game/arena/combatants";
import { combineFieldMods, fieldAffinityMultiplier } from "@/game/arena/weather-terrain";
import { aggregateStatusMods } from "@/game/arena/status-catalog";
import { buildReplayFromEvents, framesSince } from "@/game/arena/replay";
import { validateBattleAction, timeoutDefaultAction } from "@/game/arena/anti-cheat";
import { computeBattleRewards } from "@/game/arena/rewards";
import { arenaConfig } from "@/lib/config/arena";

function spar() {
  const player = buildCombatant({
    id: "p1",
    name: "Tester",
    speciesSlug: "cindercub",
    affinity: "EMBER",
    level: 8,
    weaponId: "ember-talons",
    normalizeEquipment: true,
  });
  const ai = buildTrainingAi("GROVE");
  return createTrainingBattle({
    publicId: "trn_pipeline",
    seed: "pipeline-seed-1",
    player,
    opponent: ai,
    weather: "EMBER_HAZE",
    terrain: "EMBER_FLOOR",
  });
}

describe("turn pipeline", () => {
  it("emits phase order markers in a resolved round", () => {
    let state = spar();
    state = resolveRound(state, [
      { kind: "BASIC_ATTACK" },
      chooseAiAction(state.combatants[1]!),
    ]);
    const phases = state.events
      .filter((e) => e.type === "PHASE")
      .map((e) => e.payload.phase);
    expect(phases).toContain("TURN_START");
    expect(phases).toContain("WEATHER");
    expect(phases).toContain("TERRAIN");
    expect(phases).toContain("STATUS");
    expect(phases).toContain("ENERGY");
    expect(phases).toContain("LOCK");
    expect(phases).toContain("ORDER");
    expect(phases).toContain("RESOLVE");
    expect(phases).toContain("PASSIVES");
    expect(phases).toContain("EOT");
    expect(state.events.some((e) => e.type === "TURN_ORDER")).toBe(true);
  });

  it("uses 30s turn timer config", () => {
    expect(arenaConfig.TURN_TIMER_SECONDS).toBe(30);
  });

  it("orders defend before basic when speeds tie via priority", () => {
    const player = buildCombatant({
      id: "fast-p",
      name: "P",
      speciesSlug: "cindercub",
      affinity: "EMBER",
      level: 5,
    });
    const foe = buildCombatant({
      id: "fast-f",
      name: "F",
      speciesSlug: "mossprig",
      affinity: "GROVE",
      level: 5,
    });
    foe.speed = player.speed;
    let state = createTrainingBattle({
      publicId: "trn_order",
      seed: "order-seed",
      player,
      opponent: foe,
    });
    state = resolveRound(state, [{ kind: "BASIC_ATTACK" }, { kind: "DEFEND" }]);
    const order = state.events.find((e) => e.type === "TURN_ORDER");
    expect(order?.payload.first).toBe("fast-f");
  });
});

describe("damage + weather", () => {
  it("applies weather/terrain affinity field multipliers", () => {
    const mods = combineFieldMods("EMBER_HAZE", "EMBER_FLOOR");
    expect(fieldAffinityMultiplier(mods, "EMBER")).toBeGreaterThan(1);
    expect(fieldAffinityMultiplier(mods, "FROST")).toBeLessThan(1);
  });

  it("deals damage events with affinity mod payload", () => {
    let state = spar();
    for (let i = 0; i < 5 && state.status === "ACTIVE"; i++) {
      state = resolveRound(state, [
        { kind: "BASIC_ATTACK" },
        { kind: "DEFEND" },
      ]);
    }
    const dmg = state.events.find((e) => e.type === "DAMAGE");
    expect(dmg).toBeTruthy();
    expect(Number(dmg!.payload.damage)).toBeGreaterThan(0);
  });
});

describe("status", () => {
  it("aggregates status mods for burn/armored", () => {
    const mods = aggregateStatusMods([{ id: "BURN" }, { id: "ARMORED" }]);
    expect(mods.attackMul).toBeLessThan(1);
    expect(mods.defenseMul).toBeGreaterThan(1);
  });

  it("ticks regenerating heal during status phase", () => {
    let state = spar();
    state.combatants[0]!.statuses.push({ id: "REGENERATING", turnsLeft: 2 });
    const hpBefore = state.combatants[0]!.hp;
    state.combatants[0]!.hp = Math.floor(hpBefore * 0.5);
    state = resolveRound(state, [{ kind: "DEFEND" }, { kind: "DEFEND" }]);
    expect(state.events.some((e) => e.type === "HEAL" && e.payload.source === "REGENERATING")).toBe(
      true,
    );
  });
});

describe("anti-cheat + sync stubs", () => {
  it("rejects unknown ability and defaults timeout to defend", () => {
    const state = spar();
    const bad = validateBattleAction({
      state,
      actor: state.combatants[0]!,
      action: { kind: "ABILITY", abilityId: "not-real" },
    });
    expect(bad.ok).toBe(false);
    expect(timeoutDefaultAction().kind).toBe("DEFEND");
  });

  it("builds replay frames for spectator sync stub", () => {
    let state = spar();
    state = resolveRound(state, [{ kind: "FOCUS" }, { kind: "FOCUS" }]);
    const replay = buildReplayFromEvents({
      publicId: state.publicId,
      seed: state.seed,
      events: state.events,
    });
    expect(replay.frames.length).toBe(state.events.length);
    expect(framesSince(replay, 2).length).toBe(replay.frames.length - 3);
  });

  it("caps practice rewards", () => {
    const win = computeBattleRewards({ battleType: "PRACTICE", won: true });
    expect(win.credits).toBeLessThanOrEqual(40);
    expect(win.xp).toBeLessThanOrEqual(80);
  });
});
