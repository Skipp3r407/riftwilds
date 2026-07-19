/**
 * Phase 2 SOL escrow scaffold — schema-shaped types + docs only.
 * Never moves funds. All write paths no-op while stakes flags are OFF.
 */

import { isRiftArenaSolStakesLive, riftArenaConfig } from "@/game/rift-arena/config";

export type EscrowStatus =
  | "PROPOSED"
  | "FUNDED"
  | "LOCKED"
  | "RELEASED_WINNER"
  | "REFUNDED"
  | "CANCELLED"
  | "DISPUTED";

export type EscrowProposal = {
  id: string;
  matchPublicId: string | null;
  stakeTierId: string;
  amountLamports: number;
  status: EscrowStatus;
  hostWallet: string | null;
  guestWallet: string | null;
  createdAt: string;
  note: string;
};

export function listStakeTiersDoc() {
  return riftArenaConfig.SOL_STAKE_TIERS_LAMPORTS_DOC.map((t) => ({
    ...t,
    live: false,
    note: "Documentation only — stakes flag OFF",
  }));
}

export function proposeEscrowStub(input: {
  stakeTierId: string;
  matchPublicId?: string;
}): { ok: false; error: string } | { ok: true; proposal: EscrowProposal } {
  if (!isRiftArenaSolStakesLive()) {
    return {
      ok: false,
      error:
        "SOL_ARENA_STAKES_DISABLED — escrow is scaffold-only. Free play never requires a wallet.",
    };
  }
  const tier = riftArenaConfig.SOL_STAKE_TIERS_LAMPORTS_DOC.find(
    (t) => t.id === input.stakeTierId,
  );
  if (!tier) return { ok: false, error: "UNKNOWN_TIER" };
  return {
    ok: true,
    proposal: {
      id: `escrow_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`,
      matchPublicId: input.matchPublicId ?? null,
      stakeTierId: tier.id,
      amountLamports: tier.lamports,
      status: "PROPOSED",
      hostWallet: null,
      guestWallet: null,
      createdAt: new Date().toISOString(),
      note: "Would create escrow — not wired to chain in this build.",
    },
  };
}
