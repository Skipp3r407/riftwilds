/**
 * In-memory + optional file-backed store for Rift Stakes vertical slice.
 * Prisma models are proposed; this store powers DEMO/local without migration.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import {
  DEFAULT_FEE_BPS,
  DEFAULT_VIP_TIERS,
} from "@/game/rift-stakes/config";
import type {
  EscrowRecord,
  FeeHistoryEntry,
  PromoFeeEvent,
  RiftStakesAdminState,
  RiftStakesTreasuryTx,
  StakeMatch,
  StakeQueueEntry,
  VipFeeTier,
} from "@/game/rift-stakes/types";

export type LeaderboardRow = {
  ownerKey: string;
  displayName: string;
  wins: number;
  losses: number;
  netLamports: number;
  feesPaidLamports: number;
};

type StoreShape = {
  matches: StakeMatch[];
  escrows: EscrowRecord[];
  queue: StakeQueueEntry[];
  treasuryTx: RiftStakesTreasuryTx[];
  feeHistory: FeeHistoryEntry[];
  promotions: PromoFeeEvent[];
  vipTiers: VipFeeTier[];
  leaderboard: LeaderboardRow[];
  admin: RiftStakesAdminState;
  treasuryWallet: string;
  collectedFeesLamports: number;
};

const DATA_DIR = path.join(process.cwd(), ".data", "rift-stakes");
const DATA_FILE = path.join(DATA_DIR, "state.json");

function defaultAdmin(): RiftStakesAdminState {
  return {
    stakesPaused: false,
    treasuryPaused: false,
    matchmakingPaused: false,
    feeBps: DEFAULT_FEE_BPS,
    pauseReason: null,
    updatedAt: new Date().toISOString(),
  };
}

function emptyStore(): StoreShape {
  return {
    matches: [],
    escrows: [],
    queue: [],
    treasuryTx: [],
    feeHistory: [],
    promotions: [
      {
        id: "promo_zero_weekend",
        name: "Zero-Fee Weekend (scaffold)",
        feeBps: 0,
        active: false,
        startsAt: new Date(0).toISOString(),
        endsAt: new Date(0).toISOString(),
        note: "Admin can activate for promotional 0% fee events.",
      },
    ],
    vipTiers: [...DEFAULT_VIP_TIERS],
    leaderboard: [],
    admin: defaultAdmin(),
    treasuryWallet: "RIFT_STAKES_TREASURY_DEMO_WALLET",
    collectedFeesLamports: 0,
  };
}

let memory: StoreShape | null = null;

function load(): StoreShape {
  if (memory) return memory;
  try {
    if (existsSync(DATA_FILE)) {
      memory = JSON.parse(readFileSync(DATA_FILE, "utf8")) as StoreShape;
      return memory!;
    }
  } catch {
    // fall through
  }
  memory = emptyStore();
  return memory;
}

function persist() {
  if (!memory) return;
  try {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(DATA_FILE, JSON.stringify(memory, null, 2), "utf8");
  } catch {
    // local-only soft fail
  }
}

export function getRiftStakesStore(): StoreShape {
  return load();
}

export function saveRiftStakesStore(mutator: (s: StoreShape) => void): StoreShape {
  const s = load();
  mutator(s);
  persist();
  return s;
}

export function resetRiftStakesStoreForTests(): void {
  memory = emptyStore();
}

export function getEscrow(id: string): EscrowRecord | undefined {
  return load().escrows.find((e) => e.id === id);
}

export function getMatch(id: string): StakeMatch | undefined {
  return load().matches.find((m) => m.id === id || m.publicId === id);
}

export function upsertMatch(match: StakeMatch) {
  saveRiftStakesStore((s) => {
    const i = s.matches.findIndex((m) => m.id === match.id);
    if (i >= 0) s.matches[i] = match;
    else s.matches.unshift(match);
  });
}

export function upsertEscrow(escrow: EscrowRecord) {
  saveRiftStakesStore((s) => {
    const i = s.escrows.findIndex((e) => e.id === escrow.id);
    if (i >= 0) s.escrows[i] = escrow;
    else s.escrows.unshift(escrow);
  });
}

export function appendTreasuryTx(tx: RiftStakesTreasuryTx) {
  saveRiftStakesStore((s) => {
    s.treasuryTx.unshift(tx);
    if (tx.kind === "PLATFORM_FEE") {
      s.collectedFeesLamports += tx.amountLamports;
    }
  });
}

export function appendFeeHistory(entry: FeeHistoryEntry) {
  saveRiftStakesStore((s) => {
    s.feeHistory.unshift(entry);
  });
}

export function updateLeaderboard(row: {
  ownerKey: string;
  displayName: string;
  won: boolean;
  netDeltaLamports: number;
  feePaidLamports: number;
}) {
  saveRiftStakesStore((s) => {
    let existing = s.leaderboard.find((l) => l.ownerKey === row.ownerKey);
    if (!existing) {
      existing = {
        ownerKey: row.ownerKey,
        displayName: row.displayName,
        wins: 0,
        losses: 0,
        netLamports: 0,
        feesPaidLamports: 0,
      };
      s.leaderboard.push(existing);
    }
    existing.displayName = row.displayName;
    if (row.won) existing.wins += 1;
    else existing.losses += 1;
    existing.netLamports += row.netDeltaLamports;
    existing.feesPaidLamports += row.feePaidLamports;
    s.leaderboard.sort((a, b) => b.wins - a.wins || b.netLamports - a.netLamports);
  });
}
