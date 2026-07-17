import { randomUUID } from "crypto";
import {
  arenaPointsForResult,
  chooseAiAction,
  createTrainingBattle,
  resolveRound,
} from "@/game/arena/engine";
import {
  buildCombatant,
  buildTrainingAi,
  DEMO_PLAYER_DEFAULTS,
  type TrainingPetInput,
} from "@/game/arena/combatants";
import { assertNoRealValueWagering } from "@/lib/config/arena";
import type { ArenaAction, ArenaBattleState } from "@/game/arena/types";

export type TrainingBattleRecord = {
  state: ArenaBattleState;
  mode: "TRAINING";
  arenaPointsAwarded: number | null;
  createdAt: string;
  completedAt: string | null;
  ownerKey: string;
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
}): TrainingBattleRecord {
  assertNoRealValueWagering();
  const publicId = `trn_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
  const seed = `seed_${randomUUID()}`;
  const player = buildCombatant({
    ...DEMO_PLAYER_DEFAULTS,
    ...params.player,
    id: params.player?.id ?? `player_${params.ownerKey.slice(0, 8)}`,
  });
  const opponent = buildTrainingAi(params.opponentAffinity ?? "STONE");
  const state = createTrainingBattle({ publicId, seed, player, opponent });
  const record: TrainingBattleRecord = {
    state,
    mode: "TRAINING",
    arenaPointsAwarded: null,
    createdAt: new Date().toISOString(),
    completedAt: null,
    ownerKey: params.ownerKey,
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
}): TrainingBattleRecord {
  assertNoRealValueWagering();
  const record = battles.get(params.publicId);
  if (!record) throw new Error("BATTLE_NOT_FOUND");
  if (record.ownerKey !== params.ownerKey) throw new Error("FORBIDDEN");
  if (record.state.status !== "ACTIVE") throw new Error("BATTLE_NOT_ACTIVE");

  const aiAction = chooseAiAction(record.state.combatants[1]!);
  const next = resolveRound(record.state, [params.action, aiAction]);
  record.state = next;

  if (next.status === "COMPLETED" && record.arenaPointsAwarded === null) {
    const won = next.winnerId === next.combatants[0]!.id;
    record.arenaPointsAwarded = arenaPointsForResult({ training: true, won });
    record.completedAt = new Date().toISOString();
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
    ...record,
    state: {
      ...rest,
      seed: record.state.status === "COMPLETED" ? seed : null,
      seedCommitted: true,
    },
  };
}
