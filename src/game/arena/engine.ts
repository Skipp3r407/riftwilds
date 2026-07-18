import { calculateDamage, rollCritical } from "@/game/combat/damage";
import { getArenaAffinityModifier } from "@/game/arena/affinity-matrix";
import { arenaConfig } from "@/lib/config/arena";
import { createSeededRng } from "@/game/arena/rng";
import { aggregateStatusMods, getStatusDef } from "@/game/arena/status-catalog";
import {
  combineFieldMods,
  fieldAffinityMultiplier,
  type WeatherId,
  type TerrainId,
} from "@/game/arena/weather-terrain";
import { bondCombatBonuses } from "@/game/arena/bond";
import {
  advanceCombo,
  comboDamageMultiplier,
  emptyCombo,
} from "@/game/arena/combo-affinity";
import {
  gainRiftBurst,
  RIFT_BURST_CONFIG,
  spendRiftBurst,
} from "@/game/arena/rift-burst";
import { chooseAiAction as chooseAiActionFromAi } from "@/game/arena/ai";
import { arenaForAffinity } from "@/game/arena/arenas";
import { assertNoRealValueWagering } from "@/lib/config/arena";
import type {
  ArenaAction,
  ArenaBattleState,
  ArenaCombatant,
  ArenaEvent,
  TurnPhase,
} from "@/game/arena/types";
import type { BattleType, TeamSizeMode } from "@/game/arena/battle-types";
import type { AiDifficulty } from "@/game/arena/ai";

export { chooseAiActionFromAi as chooseAiAction };

function cloneCombatant(c: ArenaCombatant): ArenaCombatant {
  return {
    ...c,
    abilities: c.abilities.map((a) => ({ ...a })),
    statuses: c.statuses.map((s) => ({ ...s })),
  };
}

function pushPhase(events: ArenaEvent[], phase: TurnPhase, round: number) {
  events.push({
    type: "PHASE",
    actorId: "system",
    payload: { phase, round },
  });
}

export function createTrainingBattle(params: {
  publicId: string;
  seed: string;
  player: ArenaCombatant;
  opponent: ArenaCombatant;
  battleType?: BattleType;
  teamSize?: TeamSizeMode;
  weather?: WeatherId;
  terrain?: TerrainId;
  aiDifficulty?: AiDifficulty;
  careNormalized?: boolean;
}): ArenaBattleState {
  assertNoRealValueWagering();
  const arena = arenaForAffinity(params.player.affinity);
  return {
    publicId: params.publicId,
    battleType: params.battleType ?? "PRACTICE",
    teamSize: params.teamSize ?? "1v1",
    round: 0,
    maxRounds: arenaConfig.MAX_ROUNDS,
    seed: params.seed,
    balanceVersion: arenaConfig.BALANCE_VERSION,
    affinityVersion: arenaConfig.AFFINITY_VERSION,
    weather: params.weather ?? arena.defaultWeather,
    terrain: params.terrain ?? arena.defaultTerrain,
    arenaId: arena.id,
    turnPhase: "CHOOSE",
    turnDeadlineMs: null,
    turnTimerSeconds: arenaConfig.TURN_TIMER_SECONDS,
    combatants: [cloneCombatant(params.player), cloneCombatant(params.opponent)],
    benches: [[], []],
    combos: [emptyCombo(), emptyCombo()],
    events: [
      {
        type: "BATTLE_STARTED",
        actorId: "system",
        payload: {
          arenaId: arena.id,
          weather: params.weather ?? arena.defaultWeather,
          terrain: params.terrain ?? arena.defaultTerrain,
          battleType: params.battleType ?? "PRACTICE",
        },
      },
    ],
    status: "ACTIVE",
    winnerId: null,
    completionReason: null,
    aiDifficulty: params.aiDifficulty ?? "ADEPT",
    careNormalized: params.careNormalized ?? false,
  };
}

function actionPriority(action: ArenaAction, combatant: ArenaCombatant): number {
  if (action.kind === "SURRENDER" || action.kind === "RETREAT") return 99;
  if (action.kind === "DEFEND" || action.kind === "GUARD" || action.kind === "FOCUS") return 2;
  if (action.kind === "CHARGE" || action.kind === "MEDITATE" || action.kind === "ANALYZE") return 1;
  if (action.kind === "SWITCH") return 3;
  if (action.kind === "ULTIMATE" || action.kind === "ABILITY") {
    const ab = combatant.abilities.find((a) => a.id === action.abilityId);
    return ab?.priority ?? 0;
  }
  return 0;
}

function effectiveSpeed(c: ArenaCombatant, fieldSpeedMul: number): number {
  const mods = aggregateStatusMods(c.statuses);
  const moraleMul = 0.85 + 0.15 * (c.morale / 100);
  return c.speed * mods.speedMul * fieldSpeedMul * moraleMul;
}

function applyStatusTicks(c: ArenaCombatant, events: ArenaEvent[]) {
  for (const s of c.statuses) {
    const def = getStatusDef(s.id);
    if (!def?.tick) continue;
    if (def.tick.kind === "DAMAGE_PCT") {
      const dmg = Math.max(1, Math.floor(c.maxHp * def.tick.amount));
      c.hp = Math.max(0, c.hp - dmg);
      events.push({
        type: "STATUS_TICK",
        actorId: c.id,
        payload: { status: s.id, damage: dmg },
      });
    } else if (def.tick.kind === "HEAL_PCT") {
      const heal = Math.max(1, Math.floor(c.maxHp * def.tick.amount));
      c.hp = Math.min(c.maxHp, c.hp + heal);
      events.push({
        type: "HEAL",
        actorId: c.id,
        payload: { amount: heal, source: s.id },
      });
    } else if (def.tick.kind === "ENERGY") {
      c.energy = Math.min(c.maxEnergy, c.energy + def.tick.amount);
    }
  }
}

function tickStatuses(c: ArenaCombatant, events: ArenaEvent[]) {
  applyStatusTicks(c, events);
  c.statuses = c.statuses
    .map((s) => ({ ...s, turnsLeft: s.turnsLeft - 1 }))
    .filter((s) => {
      if (s.turnsLeft <= 0) {
        events.push({
          type: "STATUS_REMOVED",
          actorId: c.id,
          payload: { status: s.id },
        });
        return false;
      }
      return true;
    });
}

function applyEnergyPhase(c: ArenaCombatant, regen: number, events: ArenaEvent[]) {
  const gain = 4 + regen + (c.focusing ? 0 : 0);
  if (gain <= 0) return;
  c.energy = Math.min(c.maxEnergy, c.energy + gain);
  events.push({
    type: "ENERGY_REGEN",
    actorId: c.id,
    payload: { amount: gain, energy: c.energy },
  });
}

function runPassives(c: ArenaCombatant, events: ArenaEvent[]) {
  for (const ab of c.abilities) {
    if (ab.category !== "PASSIVE" && ab.category !== "SUPPORT") continue;
    if (ab.power !== 0 || ab.target !== "SELF") continue;
    if (ab.id.includes("mend")) continue;
    // Soft passive: tiny energy drip for SUPPORT / PASSIVE slots
    if (ab.energyCost === 0) {
      c.energy = Math.min(c.maxEnergy, c.energy + 1);
      events.push({
        type: "PASSIVE",
        actorId: c.id,
        payload: { abilityId: ab.id, effect: "energy_drip" },
      });
    }
  }
  // Morale soft recover
  if (c.morale < 100) {
    c.morale = Math.min(100, c.morale + 1);
  }
}

function resolveAction(
  state: ArenaBattleState,
  actorIdx: number,
  targetIdx: number,
  action: ArenaAction,
  rng: ReturnType<typeof createSeededRng>,
): void {
  const actor = state.combatants[actorIdx]!;
  const target = state.combatants[targetIdx]!;
  const events = state.events;
  const field = combineFieldMods(state.weather, state.terrain);
  const actorBond = bondCombatBonuses({
    bond: actor.bond,
    careNormalized: state.careNormalized,
  });
  const actorMods = aggregateStatusMods(actor.statuses);
  const targetMods = aggregateStatusMods(target.statuses);

  if (action.kind === "SURRENDER" || action.kind === "RETREAT") {
    state.status = "COMPLETED";
    state.winnerId = target.id;
    state.completionReason = action.kind === "SURRENDER" ? "SURRENDER" : "RETREAT";
    events.push({ type: action.kind, actorId: actor.id, payload: {} });
    events.push({
      type: "BATTLE_ENDED",
      actorId: actor.id,
      payload: { winnerId: target.id, reason: state.completionReason },
    });
    return;
  }

  if (action.kind === "DEFEND") {
    actor.defending = true;
    events.push({ type: "DEFEND", actorId: actor.id, payload: {} });
    return;
  }

  if (action.kind === "GUARD") {
    actor.guarding = true;
    actor.defending = true;
    actor.statuses.push({ id: "GUARDING", turnsLeft: 1 });
    events.push({ type: "GUARD", actorId: actor.id, payload: {} });
    return;
  }

  if (action.kind === "FOCUS") {
    actor.focusing = true;
    actor.energy = Math.min(actor.maxEnergy, actor.energy + 8);
    actor.riftBurst = gainRiftBurst(actor.riftBurst, RIFT_BURST_CONFIG.ON_FOCUS);
    events.push({
      type: "FOCUS",
      actorId: actor.id,
      payload: { energyGain: 8, riftBurst: actor.riftBurst },
    });
    return;
  }

  if (action.kind === "CHARGE") {
    actor.riftBurst = gainRiftBurst(actor.riftBurst, RIFT_BURST_CONFIG.ON_CHARGE);
    actor.energy = Math.min(actor.maxEnergy, actor.energy + 4);
    events.push({
      type: "CHARGE",
      actorId: actor.id,
      payload: { riftBurst: actor.riftBurst, energyGain: 4 },
    });
    return;
  }

  if (action.kind === "MEDITATE") {
    actor.energy = Math.min(actor.maxEnergy, actor.energy + 14);
    actor.morale = Math.min(100, actor.morale + 4);
    events.push({
      type: "MEDITATE",
      actorId: actor.id,
      payload: { energyGain: 14, morale: actor.morale },
    });
    return;
  }

  if (action.kind === "ANALYZE") {
    target.statuses.push({ id: "ANALYZED", turnsLeft: 2 });
    events.push({
      type: "ANALYZE",
      actorId: actor.id,
      targetId: target.id,
      payload: { status: "ANALYZED", duration: 2 },
    });
    return;
  }

  if (action.kind === "SWITCH") {
    if (actorMods.blocksSwitch || actor.statuses.some((s) => s.id === "ROOTED")) {
      events.push({
        type: "COMMAND_REJECTED",
        actorId: actor.id,
        payload: { reason: "SWITCH_BLOCKED" },
      });
      return;
    }
    // 1v1 scaffold: no bench — emit stub event
    events.push({
      type: "SWITCH_STUB",
      actorId: actor.id,
      payload: { slot: action.switchSlot ?? 0, teamSize: state.teamSize },
    });
    return;
  }

  if (action.kind === "ITEM") {
    events.push({
      type: "ITEM_STUB",
      actorId: actor.id,
      payload: { itemId: action.itemId ?? null },
    });
    return;
  }

  if (actorMods.blocksAbilities && (action.kind === "ABILITY" || action.kind === "ULTIMATE")) {
    events.push({
      type: "COMMAND_REJECTED",
      actorId: actor.id,
      payload: { reason: "SILENCED" },
    });
    return;
  }

  const ability =
    action.kind === "ABILITY" || action.kind === "ULTIMATE"
      ? actor.abilities.find((a) => a.id === action.abilityId)
      : actor.abilities.find((a) => a.id === "basic-strike") ?? actor.abilities[0];

  if (!ability) {
    events.push({
      type: "COMMAND_REJECTED",
      actorId: actor.id,
      payload: { reason: "UNKNOWN_ABILITY" },
    });
    return;
  }

  if (action.kind === "ULTIMATE" || ability.category === "ULTIMATE") {
    const cost = ability.riftBurstCost ?? RIFT_BURST_CONFIG.ULTIMATE_COST;
    if (actor.riftBurst < cost) {
      events.push({
        type: "COMMAND_REJECTED",
        actorId: actor.id,
        payload: { reason: "INSUFFICIENT_RIFT_BURST", abilityId: ability.id },
      });
      return;
    }
    actor.riftBurst = spendRiftBurst(actor.riftBurst, cost);
  }

  if (actor.energy < ability.energyCost) {
    events.push({
      type: "COMMAND_REJECTED",
      actorId: actor.id,
      payload: { reason: "INSUFFICIENT_ENERGY", abilityId: ability.id },
    });
    return;
  }

  actor.energy -= ability.energyCost;

  if (ability.target === "SELF" || ability.category === "HEALING" || ability.category === "DEFENSIVE") {
    if (ability.category === "HEALING") {
      const heal = Math.max(1, Math.round(ability.power * (1 + actor.level * 0.02)));
      actor.hp = Math.min(actor.maxHp, actor.hp + heal);
      events.push({
        type: "HEAL",
        actorId: actor.id,
        payload: { amount: heal, abilityId: ability.id },
      });
    }
    if (ability.status && rng.nextBps() < ability.status.chanceBps) {
      actor.statuses.push({ id: ability.status.id, turnsLeft: ability.status.duration });
      events.push({
        type: "STATUS_APPLIED",
        actorId: actor.id,
        payload: { status: ability.status.id, duration: ability.status.duration },
      });
    }
    events.push({
      type: "ABILITY_USED",
      actorId: actor.id,
      payload: { abilityId: ability.id, target: "SELF" },
    });
    return;
  }

  const accRoll = rng.nextBps();
  const effectiveAcc = Math.min(
    100,
    ability.accuracy +
      Math.floor(actor.accuracy / 20) +
      (actor.focusing ? 8 : 0) +
      actorMods.accuracyFlat +
      actorBond.accuracyFlat +
      (field.accuracyFlat ?? 0) +
      Math.floor(actor.luck / 40),
  );
  const evade =
    Math.floor(target.evasion / 25) +
    targetMods.evasionFlat +
    (target.statuses.some((s) => s.id === "SHROUDED") ? 0 : 0);
  const hitChance = Math.max(20, Math.min(98, effectiveAcc - evade));
  // Fair dodge: never below 20% hit, never above 98%
  if (accRoll >= hitChance * 100) {
    events.push({
      type: "MISS",
      actorId: actor.id,
      targetId: target.id,
      payload: { abilityId: ability.id },
    });
    state.combos[actorIdx] = emptyCombo();
    return;
  }

  const affinityMod =
    (ability.affinity
      ? getArenaAffinityModifier(ability.affinity, target.affinity)
      : 1) * fieldAffinityMultiplier(field, ability.affinity);

  const useMagic = ability.category === "AFFINITY" || ability.category === "ULTIMATE";
  const atkStat =
    (useMagic ? actor.magic : actor.attack) *
    actor.equipMod *
    actorMods.attackMul *
    actorMods.damageDealtMul *
    actorBond.damageMul *
    (actor.focusing ? 1.1 : 1);
  const defStat =
    (useMagic ? target.resistance : target.defense) *
    targetMods.defenseMul *
    (target.defending ? 1.35 : 1) *
    (target.guarding ? 1.15 : 1);

  state.combos[actorIdx] = advanceCombo(state.combos[actorIdx]!, ability.affinity);
  const comboMul = comboDamageMultiplier(state.combos[actorIdx]!);

  const randomBps = rng.nextRangeBps(
    arenaConfig.RANDOM_DAMAGE_MIN_BPS,
    arenaConfig.RANDOM_DAMAGE_MAX_BPS,
  );
  const critChance = actor.critChanceBps + actorBond.critChanceBps + Math.floor(actor.luck * 5);
  const isCrit = rollCritical(critChance, rng.nextBps());
  const dmg = calculateDamage({
    abilityPower: ability.power * comboMul,
    attackerStat: atkStat,
    defenderStat: defStat,
    affinityModifier: affinityMod,
    attackerLevel: actor.level,
    randomFactor: randomBps / 10000,
    isCritical: isCrit,
    statusModifier: targetMods.damageTakenMul,
    maxDamage: arenaConfig.MAX_DAMAGE_PER_HIT,
  });

  target.hp = Math.max(0, target.hp - dmg.finalDamage);
  actor.riftBurst = gainRiftBurst(
    actor.riftBurst,
    RIFT_BURST_CONFIG.ON_DAMAGE_DEALT + (isCrit ? RIFT_BURST_CONFIG.ON_CRIT : 0),
  );
  target.riftBurst = gainRiftBurst(target.riftBurst, RIFT_BURST_CONFIG.ON_DAMAGE_TAKEN);
  target.morale = Math.max(40, target.morale - (isCrit ? 4 : 2));

  events.push({
    type: "DAMAGE",
    actorId: actor.id,
    targetId: target.id,
    payload: {
      abilityId: ability.id,
      damage: dmg.finalDamage,
      isCritical: dmg.isCritical,
      affinityMod,
      comboStacks: state.combos[actorIdx]!.stacks,
    },
  });

  if (ability.status && rng.nextBps() < ability.status.chanceBps) {
    target.statuses.push({ id: ability.status.id, turnsLeft: ability.status.duration });
    events.push({
      type: "STATUS_APPLIED",
      actorId: actor.id,
      targetId: target.id,
      payload: { status: ability.status.id, duration: ability.status.duration },
    });
  }

  if (target.hp <= 0) {
    state.status = "COMPLETED";
    state.winnerId = actor.id;
    state.completionReason = "FAINT";
    events.push({ type: "FAINT", actorId: target.id, payload: {} });
    events.push({
      type: "BATTLE_ENDED",
      actorId: actor.id,
      payload: { winnerId: actor.id, reason: "FAINT" },
    });
  }
}

/**
 * Full turn pipeline:
 * start → weather → terrain → status → energy → choose → lock → order → resolve → passives → EOT
 * (choose/lock happen before this call; server receives locked actions)
 */
export function resolveRound(
  state: ArenaBattleState,
  actions: [ArenaAction, ArenaAction],
): ArenaBattleState {
  assertNoRealValueWagering();
  if (state.status !== "ACTIVE") return state;

  const next: ArenaBattleState = {
    ...state,
    round: state.round + 1,
    combatants: [cloneCombatant(state.combatants[0]), cloneCombatant(state.combatants[1])],
    combos: [
      { ...state.combos[0] },
      { ...state.combos[1] },
    ],
    events: [...state.events],
    turnDeadlineMs: null,
  };

  const rng = createSeededRng(`${state.seed}:r${next.round}`);
  const field = combineFieldMods(next.weather, next.terrain);

  next.combatants[0]!.defending = false;
  next.combatants[1]!.defending = false;
  next.combatants[0]!.focusing = false;
  next.combatants[1]!.focusing = false;
  next.combatants[0]!.guarding = false;
  next.combatants[1]!.guarding = false;

  // TURN_START
  next.turnPhase = "TURN_START";
  pushPhase(next.events, "TURN_START", next.round);
  next.events.push({
    type: "ROUND_STARTED",
    actorId: "system",
    payload: { round: next.round },
  });

  // WEATHER
  next.turnPhase = "WEATHER";
  pushPhase(next.events, "WEATHER", next.round);
  next.events.push({
    type: "WEATHER_TICK",
    actorId: "system",
    payload: { weather: next.weather },
  });

  // TERRAIN
  next.turnPhase = "TERRAIN";
  pushPhase(next.events, "TERRAIN", next.round);
  next.events.push({
    type: "TERRAIN_TICK",
    actorId: "system",
    payload: { terrain: next.terrain },
  });

  // STATUS
  next.turnPhase = "STATUS";
  pushPhase(next.events, "STATUS", next.round);
  tickStatuses(next.combatants[0]!, next.events);
  tickStatuses(next.combatants[1]!, next.events);
  for (const c of next.combatants) {
    if (c.hp <= 0 && next.status === "ACTIVE") {
      const winner = next.combatants.find((x) => x.id !== c.id)!;
      next.status = "COMPLETED";
      next.winnerId = winner.id;
      next.completionReason = "STATUS_FAINT";
      next.events.push({ type: "FAINT", actorId: c.id, payload: { reason: "STATUS" } });
      next.events.push({
        type: "BATTLE_ENDED",
        actorId: "system",
        payload: { winnerId: winner.id, reason: "STATUS_FAINT" },
      });
    }
  }
  if (next.status !== "ACTIVE") {
    next.turnPhase = "EOT";
    return next;
  }

  // ENERGY
  next.turnPhase = "ENERGY";
  pushPhase(next.events, "ENERGY", next.round);
  applyEnergyPhase(next.combatants[0]!, field.energyRegen ?? 0, next.events);
  applyEnergyPhase(next.combatants[1]!, field.energyRegen ?? 0, next.events);

  // CHOOSE / LOCK (actions already provided)
  next.turnPhase = "LOCK";
  pushPhase(next.events, "LOCK", next.round);
  next.events.push({
    type: "ACTIONS_LOCKED",
    actorId: "system",
    payload: {
      a0: actions[0].kind,
      a1: actions[1].kind,
    },
  });

  // ORDER
  next.turnPhase = "ORDER";
  pushPhase(next.events, "ORDER", next.round);
  const fieldSpeed = field.speedMul ?? 1;
  const order = [0, 1].sort((a, b) => {
    const pa = actionPriority(actions[a]!, next.combatants[a]!);
    const pb = actionPriority(actions[b]!, next.combatants[b]!);
    if (pb !== pa) return pb - pa;
    const sa = effectiveSpeed(next.combatants[a]!, fieldSpeed);
    const sb = effectiveSpeed(next.combatants[b]!, fieldSpeed);
    if (sb !== sa) return sb - sa;
    return rng.nextBps() < 5000 ? -1 : 1;
  });
  next.events.push({
    type: "TURN_ORDER",
    actorId: "system",
    payload: {
      first: next.combatants[order[0]!]!.id,
      second: next.combatants[order[1]!]!.id,
    },
  });

  // RESOLVE
  next.turnPhase = "RESOLVE";
  pushPhase(next.events, "RESOLVE", next.round);
  for (const idx of order) {
    if (next.status !== "ACTIVE") break;
    const other = idx === 0 ? 1 : 0;
    resolveAction(next, idx, other, actions[idx]!, rng);
  }

  // PASSIVES
  if (next.status === "ACTIVE") {
    next.turnPhase = "PASSIVES";
    pushPhase(next.events, "PASSIVES", next.round);
    runPassives(next.combatants[0]!, next.events);
    runPassives(next.combatants[1]!, next.events);
  }

  // EOT
  next.turnPhase = "EOT";
  pushPhase(next.events, "EOT", next.round);

  if (next.status === "ACTIVE" && next.round >= next.maxRounds) {
    const [a, b] = next.combatants;
    const winner = a!.hp === b!.hp ? null : a!.hp > b!.hp ? a!.id : b!.id;
    next.status = "COMPLETED";
    next.winnerId = winner;
    next.completionReason = "MAX_ROUNDS";
    next.events.push({
      type: "BATTLE_ENDED",
      actorId: "system",
      payload: { winnerId: winner, reason: "MAX_ROUNDS" },
    });
  }

  next.events.push({
    type: "ROUND_ENDED",
    actorId: "system",
    payload: { round: next.round },
  });
  next.turnPhase = "CHOOSE";

  return next;
}

/** @deprecated Use chooseAiAction from @/game/arena/ai — kept for import stability. */
export function chooseAiActionLegacy(combatant: ArenaCombatant) {
  return chooseAiActionFromAi(combatant, { difficulty: "ADEPT" });
}

export function arenaPointsForResult(params: {
  training: boolean;
  won: boolean;
}): number {
  assertNoRealValueWagering();
  if (params.training) {
    return params.won
      ? arenaConfig.ARENA_POINTS_TRAINING_WIN
      : arenaConfig.ARENA_POINTS_TRAINING_LOSS;
  }
  return params.won ? arenaConfig.ARENA_POINTS_WIN : arenaConfig.ARENA_POINTS_LOSS;
}
