import type { ArenaAction, ArenaBattleState, ArenaCombatant } from "@/game/arena/types";

const rateBuckets = new Map<string, { count: number; windowStart: number }>();

export const ANTI_CHEAT = {
  MAX_TURNS_PER_MINUTE: 40,
  IDEMPOTENCY_TTL_MS: 60_000,
  MAX_ACTION_PAYLOAD_CHARS: 200,
} as const;

const idempotencyKeys = new Map<string, number>();

export type ValidationResult =
  | { ok: true; action: ArenaAction }
  | { ok: false; reason: string };

export function validateBattleAction(params: {
  state: ArenaBattleState;
  actor: ArenaCombatant;
  action: ArenaAction;
}): ValidationResult {
  const { state, actor, action } = params;
  if (state.status !== "ACTIVE") {
    return { ok: false, reason: "BATTLE_NOT_ACTIVE" };
  }

  const allowed: ArenaAction["kind"][] = [
    "BASIC_ATTACK",
    "ATTACK",
    "ABILITY",
    "ULTIMATE",
    "DEFEND",
    "GUARD",
    "FOCUS",
    "CHARGE",
    "MEDITATE",
    "ANALYZE",
    "SWITCH",
    "ITEM",
    "RETREAT",
    "SURRENDER",
  ];
  if (!allowed.includes(action.kind)) {
    return { ok: false, reason: "UNKNOWN_ACTION" };
  }

  if (action.kind === "ABILITY" || action.kind === "ULTIMATE") {
    if (!action.abilityId) return { ok: false, reason: "MISSING_ABILITY_ID" };
    const ab = actor.abilities.find((a) => a.id === action.abilityId);
    if (!ab) return { ok: false, reason: "UNKNOWN_ABILITY" };
    if (action.kind === "ULTIMATE" && ab.category !== "ULTIMATE") {
      return { ok: false, reason: "NOT_ULTIMATE" };
    }
    if (actor.energy < ab.energyCost) {
      return { ok: false, reason: "INSUFFICIENT_ENERGY" };
    }
    if (ab.riftBurstCost && actor.riftBurst < ab.riftBurstCost) {
      return { ok: false, reason: "INSUFFICIENT_RIFT_BURST" };
    }
  }

  if (action.kind === "SWITCH" && !action.switchSlot && action.switchSlot !== 0) {
    return { ok: false, reason: "MISSING_SWITCH_SLOT" };
  }

  if (action.kind === "ITEM" && !action.itemId) {
    return { ok: false, reason: "MISSING_ITEM_ID" };
  }

  const serialized = JSON.stringify(action);
  if (serialized.length > ANTI_CHEAT.MAX_ACTION_PAYLOAD_CHARS) {
    return { ok: false, reason: "PAYLOAD_TOO_LARGE" };
  }

  // Normalize ATTACK → BASIC_ATTACK
  if (action.kind === "ATTACK") {
    return { ok: true, action: { kind: "BASIC_ATTACK" } };
  }

  return { ok: true, action };
}

export function checkRateLimit(ownerKey: string, now = Date.now()): boolean {
  const windowMs = 60_000;
  const bucket = rateBuckets.get(ownerKey);
  if (!bucket || now - bucket.windowStart > windowMs) {
    rateBuckets.set(ownerKey, { count: 1, windowStart: now });
    return true;
  }
  if (bucket.count >= ANTI_CHEAT.MAX_TURNS_PER_MINUTE) return false;
  bucket.count += 1;
  return true;
}

export function checkIdempotency(key: string, now = Date.now()): boolean {
  pruneIdempotency(now);
  if (idempotencyKeys.has(key)) return false;
  idempotencyKeys.set(key, now);
  return true;
}

function pruneIdempotency(now: number) {
  for (const [k, t] of idempotencyKeys) {
    if (now - t > ANTI_CHEAT.IDEMPOTENCY_TTL_MS) idempotencyKeys.delete(k);
  }
}

/** Default action when turn timer expires — auto-defend (server-authoritative). */
export function timeoutDefaultAction(): ArenaAction {
  return { kind: "DEFEND" };
}
