import { calculateDamage, rollCritical } from "@/game/combat/damage";
import { getArenaAffinityModifier } from "@/game/arena/affinity-matrix";
import { arenaConfig } from "@/lib/config/arena";
import { createSeededRng } from "@/game/arena/rng";
import type {
  ArenaAction,
  ArenaBattleState,
  ArenaCombatant,
  ArenaEvent,
} from "@/game/arena/types";
import { assertNoRealValueWagering } from "@/lib/config/arena";

function cloneCombatant(c: ArenaCombatant): ArenaCombatant {
  return {
    ...c,
    abilities: [...c.abilities],
    statuses: c.statuses.map((s) => ({ ...s })),
  };
}

export function createTrainingBattle(params: {
  publicId: string;
  seed: string;
  player: ArenaCombatant;
  opponent: ArenaCombatant;
}): ArenaBattleState {
  assertNoRealValueWagering();
  return {
    publicId: params.publicId,
    round: 0,
    maxRounds: arenaConfig.MAX_ROUNDS,
    seed: params.seed,
    balanceVersion: arenaConfig.BALANCE_VERSION,
    affinityVersion: arenaConfig.AFFINITY_VERSION,
    combatants: [cloneCombatant(params.player), cloneCombatant(params.opponent)],
    events: [],
    status: "ACTIVE",
    winnerId: null,
    completionReason: null,
  };
}

function actionPriority(action: ArenaAction, combatant: ArenaCombatant): number {
  if (action.kind === "SURRENDER") return 99;
  if (action.kind === "DEFEND" || action.kind === "FOCUS") return 2;
  if (action.kind === "ABILITY") {
    const ab = combatant.abilities.find((a) => a.id === action.abilityId);
    return ab?.priority ?? 0;
  }
  return 0;
}

function tickStatuses(c: ArenaCombatant, events: ArenaEvent[]) {
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
  if (c.statuses.some((s) => s.id === "REGENERATING")) {
    const heal = Math.max(1, Math.floor(c.maxHp * 0.05));
    c.hp = Math.min(c.maxHp, c.hp + heal);
    events.push({
      type: "HEAL",
      actorId: c.id,
      payload: { amount: heal, source: "REGENERATING" },
    });
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

  if (action.kind === "SURRENDER") {
    state.status = "COMPLETED";
    state.winnerId = target.id;
    state.completionReason = "SURRENDER";
    events.push({ type: "SURRENDER", actorId: actor.id, payload: {} });
    return;
  }

  if (action.kind === "DEFEND") {
    actor.defending = true;
    events.push({ type: "DEFEND", actorId: actor.id, payload: {} });
    return;
  }

  if (action.kind === "FOCUS") {
    actor.focusing = true;
    actor.energy = Math.min(actor.maxEnergy, actor.energy + 8);
    events.push({ type: "FOCUS", actorId: actor.id, payload: { energyGain: 8 } });
    return;
  }

  const ability =
    action.kind === "ABILITY"
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
    ability.accuracy + Math.floor(actor.accuracy / 20) + (actor.focusing ? 8 : 0),
  );
  const evade = Math.floor(target.evasion / 25) + (target.statuses.some((s) => s.id === "SHROUDED") ? 10 : 0);
  const hitChance = Math.max(20, effectiveAcc - evade);
  if (accRoll >= hitChance * 100) {
    events.push({
      type: "MISS",
      actorId: actor.id,
      targetId: target.id,
      payload: { abilityId: ability.id },
    });
    return;
  }

  const affinityMod = ability.affinity
    ? getArenaAffinityModifier(ability.affinity, target.affinity)
    : 1;
  const atkStat = actor.attack * actor.equipMod * (actor.focusing ? 1.1 : 1);
  const defStat =
    target.defense *
    (target.defending ? 1.35 : 1) *
    (target.statuses.some((s) => s.id === "ARMORED" || s.id === "FORTIFIED") ? 1.15 : 1);

  const randomBps = rng.nextRangeBps(
    arenaConfig.RANDOM_DAMAGE_MIN_BPS,
    arenaConfig.RANDOM_DAMAGE_MAX_BPS,
  );
  const isCrit = rollCritical(actor.critChanceBps, rng.nextBps());
  const dmg = calculateDamage({
    abilityPower: ability.power,
    attackerStat: atkStat,
    defenderStat: defStat,
    affinityModifier: affinityMod,
    attackerLevel: actor.level,
    randomFactor: randomBps / 10000,
    isCritical: isCrit,
    statusModifier: target.statuses.some((s) => s.id === "WEAKENED") ? 1.1 : 1,
  });

  target.hp = Math.max(0, target.hp - dmg.finalDamage);
  events.push({
    type: "DAMAGE",
    actorId: actor.id,
    targetId: target.id,
    payload: {
      abilityId: ability.id,
      damage: dmg.finalDamage,
      isCritical: dmg.isCritical,
      affinityMod,
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
    events: [...state.events],
  };

  const rng = createSeededRng(`${state.seed}:r${next.round}`);
  next.combatants[0]!.defending = false;
  next.combatants[1]!.defending = false;
  next.combatants[0]!.focusing = false;
  next.combatants[1]!.focusing = false;

  tickStatuses(next.combatants[0]!, next.events);
  tickStatuses(next.combatants[1]!, next.events);

  const order = [0, 1].sort((a, b) => {
    const pa = actionPriority(actions[a]!, next.combatants[a]!);
    const pb = actionPriority(actions[b]!, next.combatants[b]!);
    if (pb !== pa) return pb - pa;
    const sa = next.combatants[a]!.speed;
    const sb = next.combatants[b]!.speed;
    if (sb !== sa) return sb - sa;
    return rng.nextBps() < 5000 ? -1 : 1;
  });

  next.events.push({
    type: "ROUND_STARTED",
    actorId: "system",
    payload: { round: next.round },
  });

  for (const idx of order) {
    if (next.status !== "ACTIVE") break;
    const other = idx === 0 ? 1 : 0;
    resolveAction(next, idx, other, actions[idx]!, rng);
  }

  if (next.status === "ACTIVE" && next.round >= next.maxRounds) {
    const [a, b] = next.combatants;
    const winner =
      a!.hp === b!.hp ? null : a!.hp > b!.hp ? a!.id : b!.id;
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

  return next;
}

/** Simple AI: heal if low, else strongest affordable ability, else basic. */
export function chooseAiAction(combatant: ArenaCombatant): ArenaAction {
  if (combatant.hp < combatant.maxHp * 0.35) {
    const heal = combatant.abilities.find(
      (a) => a.category === "HEALING" && combatant.energy >= a.energyCost,
    );
    if (heal) return { kind: "ABILITY", abilityId: heal.id };
  }
  const options = combatant.abilities
    .filter((a) => a.target === "OPPONENT" && combatant.energy >= a.energyCost)
    .sort((a, b) => b.power - a.power);
  if (options[0]) return { kind: "ABILITY", abilityId: options[0].id };
  if (combatant.energy < 8) return { kind: "FOCUS" };
  return { kind: "BASIC_ATTACK" };
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
