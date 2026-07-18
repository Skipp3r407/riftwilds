import { randomUUID } from "crypto";
import {
  arenaPointsForResult,
  createTrainingBattle,
  resolveRound,
} from "@/game/arena/engine";
import { chooseAiAction, type AiDifficulty } from "@/game/arena/ai";
import {
  buildCombatant,
  buildTrainingAi,
  DEMO_PLAYER_DEFAULTS,
  type TrainingPetInput,
} from "@/game/arena/combatants";
import { assertNoRealValueWagering, arenaConfig } from "@/lib/config/arena";
import type { ArenaAction, ArenaBattleState } from "@/game/arena/types";
import {
  checkIdempotency,
  checkRateLimit,
  timeoutDefaultAction,
  validateBattleAction,
} from "@/game/arena/anti-cheat";
import { computeBattleRewards, type BattleReward } from "@/game/arena/rewards";
import { buildReplayFromEvents, type BattleReplayStub } from "@/game/arena/replay";
import { arenaFieldForAffinity } from "@/game/arena/arenas";

export type TrainingBattleRecord = {
  state: ArenaBattleState;
  mode: "TRAINING";
  arenaPointsAwarded: number | null;
  rewards: BattleReward | null;
  createdAt: string;
  completedAt: string | null;
  ownerKey: string;
  lastActionKey: string | null;
  replay: BattleReplayStub | null;
};

const battles = new Map<string, TrainingBattleRecord>();
const historyByOwner = new Map<string, string[]>();

function remember(ownerKey: string, publicId: string) {
  const list = historyByOwner.get(ownerKey) ?? [];
  list.unshift(publicId);
  historyByOwner.set(ownerKey, list.slice(0, 50));
}

export function startTrainingBattle(params: {
  ownerKey: string;
  player?: Partial<TrainingPetInput>;
  opponentAffinity?: TrainingPetInput["affinity"];
  aiDifficulty?: AiDifficulty;
}): TrainingBattleRecord {
  assertNoRealValueWagering();
  const publicId = `trn_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
  const seed = `seed_${randomUUID()}`;
  const player = buildCombatant({
    ...DEMO_PLAYER_DEFAULTS,
    ...params.player,
    id: params.player?.id ?? `player_${params.ownerKey.slice(0, 8)}`,
  });
  const opponentAffinity = params.opponentAffinity ?? "STONE";
  const opponent = buildTrainingAi(opponentAffinity);
  const field = arenaFieldForAffinity(player.affinity);
  const state = createTrainingBattle({
    publicId,
    seed,
    player,
    opponent,
    battleType: "PRACTICE",
    teamSize: "1v1",
    weather: field.weather,
    terrain: field.terrain,
    aiDifficulty: params.aiDifficulty ?? "ADEPT",
    careNormalized: false,
  });
  state.turnDeadlineMs = Date.now() + arenaConfig.TURN_TIMER_SECONDS * 1000;
  state.arenaId = field.arena.id;

  const record: TrainingBattleRecord = {
    state,
    mode: "TRAINING",
    arenaPointsAwarded: null,
    rewards: null,
    createdAt: new Date().toISOString(),
    completedAt: null,
    ownerKey: params.ownerKey,
    lastActionKey: null,
    replay: null,
  };
  battles.set(publicId, record);
  remember(params.ownerKey, publicId);
  return record;
}

export function getTrainingBattle(publicId: string): TrainingBattleRecord | undefined {
  return battles.get(publicId);
}

export function submitTrainingTurn(params: {
  publicId: string;
  ownerKey: string;
  action: ArenaAction;
  clientActionId?: string;
  timedOut?: boolean;
}): TrainingBattleRecord {
  assertNoRealValueWagering();
  const record = battles.get(params.publicId);
  if (!record) throw new Error("BATTLE_NOT_FOUND");
  if (record.ownerKey !== params.ownerKey) throw new Error("FORBIDDEN");
  if (record.state.status !== "ACTIVE") throw new Error("BATTLE_NOT_ACTIVE");

  if (!checkRateLimit(params.ownerKey)) {
    throw new Error("RATE_LIMITED");
  }

  const idemKey =
    params.clientActionId ??
    `${params.publicId}:${record.state.round}:${params.action.kind}:${params.action.abilityId ?? ""}`;
  if (!checkIdempotency(idemKey)) {
    // Return current state for duplicate submissions (idempotent success)
    return record;
  }

  let action = params.timedOut ? timeoutDefaultAction() : params.action;
  const validated = validateBattleAction({
    state: record.state,
    actor: record.state.combatants[0]!,
    action,
  });
  if (!validated.ok) throw new Error(validated.reason);
  action = validated.action;

  // Auto-defend if deadline passed
  if (
    !params.timedOut &&
    record.state.turnDeadlineMs != null &&
    Date.now() > record.state.turnDeadlineMs
  ) {
    action = timeoutDefaultAction();
  }

  const player = record.state.combatants[0]!;
  const foe = record.state.combatants[1]!;
  const aiAction = chooseAiAction(foe, {
    difficulty: record.state.aiDifficulty ?? "ADEPT",
    seed: `${record.state.seed}:ai:${record.state.round}`,
    foeHpPct: player.hp / Math.max(player.maxHp, 1),
  });

  const next = resolveRound(record.state, [action, aiAction]);
  if (next.status === "ACTIVE") {
    next.turnDeadlineMs = Date.now() + arenaConfig.TURN_TIMER_SECONDS * 1000;
  }
  record.state = next;
  record.lastActionKey = idemKey;

  if (next.status === "COMPLETED" && record.arenaPointsAwarded === null) {
    const won = next.winnerId === next.combatants[0]!.id;
    const draw = next.winnerId == null;
    record.arenaPointsAwarded = arenaPointsForResult({ training: true, won: won && !draw });
    record.rewards = computeBattleRewards({
      battleType: "PRACTICE",
      won,
      draw,
    });
    record.completedAt = new Date().toISOString();
    record.replay = buildReplayFromEvents({
      publicId: next.publicId,
      seed: next.seed,
      events: next.events,
    });
  }

  battles.set(params.publicId, record);
  return record;
}

export function listTrainingHistory(ownerKey: string): TrainingBattleRecord[] {
  const ids = historyByOwner.get(ownerKey) ?? [];
  return ids
    .map((id) => battles.get(id))
    .filter((r): r is TrainingBattleRecord => Boolean(r));
}

/** Public snapshot — omit raw seed while battle is active. */
export function toClientSnapshot(record: TrainingBattleRecord) {
  const { seed, ...rest } = record.state;
  return {
    mode: record.mode,
    arenaPointsAwarded: record.arenaPointsAwarded,
    rewards: record.rewards,
    createdAt: record.createdAt,
    completedAt: record.completedAt,
    state: {
      ...rest,
      seed: record.state.status === "COMPLETED" ? seed : null,
      seedCommitted: true,
      turnRemainingMs:
        record.state.turnDeadlineMs != null
          ? Math.max(0, record.state.turnDeadlineMs - Date.now())
          : null,
    },
    replay: record.state.status === "COMPLETED" ? record.replay : null,
  };
}
