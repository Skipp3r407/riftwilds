/**
 * Phase 12 — Tournament Economy (Credits / AP entry; never real-value wagering).
 */

import { settleCredit, settleDebit, settleEnsureStarter } from "@/lib/economy/core/settlement";
import { isFeatureEnabled } from "@/lib/config/feature-flags";

export type TournamentEntry = {
  userId: string;
  enteredAt: string;
};

export type TournamentState = {
  publicId: string;
  name: string;
  entryCredits: number;
  prizePoolCredits: number;
  status: "OPEN" | "LOCKED" | "COMPLETED";
  entrants: TournamentEntry[];
  winners: { userId: string; place: number; prizeCredits: number }[];
};

type Store = { tournaments: Map<string, TournamentState> };

function seedTournaments(): Map<string, TournamentState> {
  const tournaments = new Map<string, TournamentState>();
  tournaments.set("tourney-training-cup", {
    publicId: "tourney-training-cup",
    name: "Training Cup",
    entryCredits: 25,
    prizePoolCredits: 0,
    status: "OPEN",
    entrants: [],
    winners: [],
  });
  return tournaments;
}

function store(): Store {
  const g = globalThis as unknown as { __riftwildsTournaments?: Store };
  if (!g.__riftwildsTournaments) {
    g.__riftwildsTournaments = { tournaments: seedTournaments() };
  }
  return g.__riftwildsTournaments;
}

/** Test helper */
export function resetTournamentsForTests(): void {
  const g = globalThis as unknown as { __riftwildsTournaments?: Store };
  g.__riftwildsTournaments = { tournaments: seedTournaments() };
}

export function listTournaments(): TournamentState[] {
  return [...store().tournaments.values()];
}

export function registerForTournament(params: {
  tournamentId: string;
  userId: string;
  requestId: string;
}): { ok: true; tournament: TournamentState } | { ok: false; error: string; message: string } {
  if (!isFeatureEnabled("TOURNAMENT_ECONOMY_ENABLED")) {
    return { ok: false, error: "disabled", message: "Tournament economy disabled" };
  }
  const t = store().tournaments.get(params.tournamentId);
  if (!t || t.status !== "OPEN") {
    return { ok: false, error: "not_open", message: "Tournament not open" };
  }
  if (t.entrants.some((e) => e.userId === params.userId)) {
    return { ok: false, error: "already_entered", message: "Already entered" };
  }
  settleEnsureStarter(params.userId);
  const debit = settleDebit({
    userId: params.userId,
    amount: t.entryCredits,
    reason: "TOURNAMENT_ENTRY",
    requestId: params.requestId,
    metadata: { tournamentId: t.publicId },
  });
  if (!debit.ok) return { ok: false, error: debit.error, message: debit.message };
  t.prizePoolCredits += t.entryCredits;
  t.entrants.push({ userId: params.userId, enteredAt: new Date().toISOString() });
  store().tournaments.set(t.publicId, t);
  return { ok: true, tournament: t };
}

/** Demo payout — 60/30/10 to top 3. Never SOL / never real wagering. */
export function payoutTournamentDemo(params: {
  tournamentId: string;
  winnerUserIds: [string, string?, string?];
  requestId: string;
}): { ok: true; tournament: TournamentState } | { ok: false; error: string; message: string } {
  const t = store().tournaments.get(params.tournamentId);
  if (!t || t.entrants.length < 1) {
    return { ok: false, error: "invalid", message: "Tournament not ready" };
  }
  const pool = t.prizePoolCredits;
  const splits = [0.6, 0.3, 0.1];
  t.winners = [];
  params.winnerUserIds.forEach((userId, i) => {
    if (!userId) return;
    const prize = Math.floor(pool * splits[i]!);
    if (prize < 1) return;
    settleCredit({
      userId,
      amount: prize,
      reason: "TOURNAMENT_PRIZE",
      requestId: `${params.requestId}:p${i + 1}`,
      metadata: { tournamentId: t.publicId, place: i + 1 },
    });
    t.winners.push({ userId, place: i + 1, prizeCredits: prize });
  });
  t.status = "COMPLETED";
  t.prizePoolCredits = 0;
  store().tournaments.set(t.publicId, t);
  return { ok: true, tournament: t };
}
