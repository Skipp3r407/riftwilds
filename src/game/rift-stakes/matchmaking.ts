/**
 * Separate Rift Stakes matchmaking — never mixes with free/casual/ranked queues.
 */

import { getStakeTier } from "@/game/rift-stakes/config";
import {
  attachGuest,
  createStakeMatch,
} from "@/game/rift-stakes/escrow";
import { resolveEffectiveFee } from "@/game/rift-stakes/fee-resolver";
import {
  getRiftStakesStore,
  saveRiftStakesStore,
  upsertEscrow,
  upsertMatch,
} from "@/game/rift-stakes/store";
import type { StakeQueueEntry, StakeTierId } from "@/game/rift-stakes/types";

export function enqueueStakes(input: {
  ownerKey: string;
  displayName: string;
  wallet: string | null;
  stakeTierId: StakeTierId;
  vipTierId?: string | null;
}):
  | { ok: false; error: string }
  | { ok: true; queued: true; queueSize: number }
  | {
      ok: true;
      matched: true;
      matchId: string;
      publicId: string;
      escrowId: string;
    } {
  const store = getRiftStakesStore();
  if (store.admin.matchmakingPaused || store.admin.stakesPaused) {
    return {
      ok: false,
      error: store.admin.pauseReason || "STAKES_MATCHMAKING_PAUSED",
    };
  }
  const tier = getStakeTier(input.stakeTierId);
  if (!tier) return { ok: false, error: "UNKNOWN_TIER" };

  // Already in queue?
  if (store.queue.some((q) => q.ownerKey === input.ownerKey)) {
    return { ok: false, error: "ALREADY_QUEUED" };
  }

  const opponent = store.queue.find(
    (q) =>
      q.stakeTierId === input.stakeTierId && q.ownerKey !== input.ownerKey,
  );

  if (!opponent) {
    const entry: StakeQueueEntry = {
      ownerKey: input.ownerKey,
      displayName: input.displayName,
      wallet: input.wallet,
      stakeTierId: input.stakeTierId,
      vipTierId: input.vipTierId ?? null,
      joinedAt: new Date().toISOString(),
    };
    saveRiftStakesStore((s) => {
      s.queue.push(entry);
    });
    return {
      ok: true,
      queued: true,
      queueSize: getRiftStakesStore().queue.length,
    };
  }

  // Pair — remove opponent from queue
  saveRiftStakesStore((s) => {
    s.queue = s.queue.filter((q) => q.ownerKey !== opponent.ownerKey);
  });

  const fee = resolveEffectiveFee({
    stakePerPlayerLamports: tier.stakeLamports,
    vipTierId: input.vipTierId ?? opponent.vipTierId,
  });

  const { match, escrow } = createStakeMatch({
    stakeTierId: input.stakeTierId,
    hostOwnerKey: opponent.ownerKey,
    hostDisplayName: opponent.displayName,
    fee,
  });

  let nextEscrow = {
    ...escrow,
    hostWallet: opponent.wallet,
  };
  nextEscrow = attachGuest(nextEscrow, input.ownerKey, input.wallet);

  const nextMatch = {
    ...match,
    guestOwnerKey: input.ownerKey,
    guestDisplayName: input.displayName,
    status: "AWAITING_DEPOSITS" as const,
    feeSnapshot: fee,
    escrowId: nextEscrow.id,
    updatedAt: new Date().toISOString(),
  };

  upsertEscrow(nextEscrow);
  upsertMatch(nextMatch);

  return {
    ok: true,
    matched: true,
    matchId: nextMatch.id,
    publicId: nextMatch.publicId,
    escrowId: nextEscrow.id,
  };
}

export function leaveStakesQueue(ownerKey: string): void {
  saveRiftStakesStore((s) => {
    s.queue = s.queue.filter((q) => q.ownerKey !== ownerKey);
  });
}

export function stakesQueueSize(): number {
  return getRiftStakesStore().queue.length;
}
