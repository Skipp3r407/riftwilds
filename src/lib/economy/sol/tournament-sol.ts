/**
 * Tournament economy config stubs.
 * Free tournaments remain available. SOL entry architecture flagged OFF.
 * No spectator betting.
 */

import { isFeatureEnabled } from "@/lib/config/feature-flags";
import { isSolTournamentEntryLive } from "@/lib/economy/sol/flags";
import {
  listTournaments,
  registerForTournament,
  type TournamentState,
} from "@/lib/economy/tournament";

export type TournamentEntryCurrency = "FREE" | "GOLD" | "RIFT_SHARDS" | "SOL";

export type TournamentEconomyConfig = {
  tournamentId: string;
  name: string;
  entryCurrency: TournamentEntryCurrency;
  entryAmount: string;
  playerCap: number;
  /** Prize split bps — must sum to 10000 for SOL pools. */
  prizePlayerBps: number;
  opsBps: number;
  communityFundBps: number;
  regionalEligibilityRequired: boolean;
  solEntryEnabled: boolean;
  spectatorBetting: false;
};

export const FREE_TOURNAMENT_CONFIG: TournamentEconomyConfig = {
  tournamentId: "tourney-free-rift-open",
  name: "Free Rift Open",
  entryCurrency: "FREE",
  entryAmount: "0",
  playerCap: 256,
  prizePlayerBps: 10000,
  opsBps: 0,
  communityFundBps: 0,
  regionalEligibilityRequired: false,
  solEntryEnabled: false,
  spectatorBetting: false,
};

/** Example SOL pool math only — never live while flags are off. */
export const EXAMPLE_SOL_TOURNAMENT_CONFIG: TournamentEconomyConfig = {
  tournamentId: "tourney-sol-example",
  name: "Example SOL Cup (DISABLED)",
  entryCurrency: "SOL",
  entryAmount: "0.02",
  playerCap: 100,
  prizePlayerBps: 8500,
  opsBps: 1000,
  communityFundBps: 500,
  regionalEligibilityRequired: true,
  solEntryEnabled: false,
  spectatorBetting: false,
};

export function listTournamentEconomyConfigs(): TournamentEconomyConfig[] {
  return [FREE_TOURNAMENT_CONFIG, EXAMPLE_SOL_TOURNAMENT_CONFIG];
}

export function assertNoSpectatorBetting(config: TournamentEconomyConfig): void {
  if (config.spectatorBetting !== false) {
    throw new Error("Spectator betting is forbidden");
  }
}

export function computeSolPrizePool(params: {
  entrants: number;
  entryLamports: bigint;
  config: TournamentEconomyConfig;
}): {
  gross: bigint;
  playerPrizes: bigint;
  ops: bigint;
  community: bigint;
} {
  const gross = params.entryLamports * BigInt(params.entrants);
  const playerPrizes = (gross * BigInt(params.config.prizePlayerBps)) / 10_000n;
  const ops = (gross * BigInt(params.config.opsBps)) / 10_000n;
  const community = gross - playerPrizes - ops;
  return { gross, playerPrizes, ops, community };
}

/**
 * Register for free tournament — no currency debit.
 * SOL entry always rejected while SOL_TOURNAMENTS_ENABLED is false.
 */
export function registerTournamentEntry(params: {
  tournamentId: string;
  userId: string;
  requestId: string;
  entryCurrency: TournamentEntryCurrency;
}):
  | { ok: true; mode: "free" | "gold"; tournament?: TournamentState }
  | { ok: false; error: string; message: string } {
  assertNoSpectatorBetting(FREE_TOURNAMENT_CONFIG);

  if (params.entryCurrency === "SOL") {
    if (!isSolTournamentEntryLive()) {
      return {
        ok: false,
        error: "sol_tournaments_disabled",
        message: "SOL tournament entry is feature-flagged off. Join free or Gold tournaments.",
      };
    }
    return {
      ok: false,
      error: "sol_entry_not_wired",
      message: "SOL entry architecture present but escrow not wired.",
    };
  }

  if (params.entryCurrency === "FREE" || params.tournamentId === FREE_TOURNAMENT_CONFIG.tournamentId) {
    if (!isFeatureEnabled("TOURNAMENT_ECONOMY_ENABLED")) {
      return { ok: false, error: "disabled", message: "Tournament economy disabled" };
    }
    return { ok: true, mode: "free" };
  }

  /** Gold / Credits path — reuse existing tournament module. */
  const result = registerForTournament({
    tournamentId: params.tournamentId,
    userId: params.userId,
    requestId: params.requestId,
  });
  if (!result.ok) return result;
  return { ok: true, mode: "gold", tournament: result.tournament };
}

export function listPlayableTournaments(): {
  free: TournamentEconomyConfig;
  creditsTournaments: TournamentState[];
  solEntryLive: boolean;
} {
  return {
    free: FREE_TOURNAMENT_CONFIG,
    creditsTournaments: listTournaments(),
    solEntryLive: isSolTournamentEntryLive(),
  };
}
