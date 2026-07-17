/**
 * In-memory Community Reward Treasury (Pet Reward system) — Phase 1 server truth.
 *
 * Critical honesty rules:
 * - Estimated pending NEVER increases on a timer.
 * - Pool / estimates only grow when recordVerifiedVaultDeposit succeeds.
 * - Claimable only moves via epoch finalization or claim (never fabricated).
 * - Buying the Pump.fun coin does NOT auto-credit pet owners.
 */

import { randomUUID } from "crypto";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { HOLDER_REWARD_CONFIG, computeWalletEpochShare } from "@/lib/revenue/eligibility";
import { allocateForTransactionType } from "@/lib/revenue/allocate";
import { revenueDisclosures } from "@/lib/revenue/disclosures";
import { lamportsToSolString } from "@/lib/items/lamports";
import { labelsForReasons } from "@/lib/rewards/inactive-reasons";
import { publishVaultEvent } from "@/lib/rewards/events";
import type {
  CelebrationStyle,
  DailyRewardPoint,
  EligiblePetWeight,
  FundingSourceKind,
  InactiveReasonCode,
  PetRewardStatus,
  PetRewardVaultView,
  RecordVerifiedDepositInput,
  RewardEpochState,
  VerifiedFundingRecord,
  WalletClaimBalance,
} from "@/lib/rewards/types";

/** Server-only verification secret for deposit injector / settlement hooks. */
export const VAULT_VERIFICATION_TOKEN =
  process.env.PET_REWARD_VAULT_VERIFY_TOKEN ?? "riftwilds-vault-dev-verify";

const EPOCH_MS = HOLDER_REWARD_CONFIG.epochDurationHours * 60 * 60 * 1000;
const EXPLORER_TX = (sig: string, network: string) =>
  `https://explorer.solana.com/tx/${sig}?cluster=${network === "mainnet-beta" ? "mainnet-beta" : "devnet"}`;

type RegisteredPet = {
  publicPetId: string;
  petName: string;
  walletKey: string;
  careScore: number;
  isSick: boolean;
  isDormant: boolean;
  isDeceased: boolean;
  isListedForSale: boolean;
  ownershipHours: number;
  meetsMinTokenBalance: boolean;
  petSelectedForRewards: boolean;
  tokenHoldHours: number;
  walletBlocked: boolean;
  transferredRecently: boolean;
};

type DayBucket = {
  day: string;
  estimatedLamports: bigint;
  claimableLamports: bigint;
  depositsLamports: bigint;
};

type Store = {
  epochNumber: number;
  epoch: RewardEpochState;
  poolLamports: bigint;
  funding: VerifiedFundingRecord[];
  seenRequestIds: Set<string>;
  pets: Map<string, RegisteredPet>;
  /** Per-wallet claimable (finalized unclaimed). */
  claimable: Map<string, bigint>;
  lifetimeClaimed: Map<string, bigint>;
  /** Last server estimate per pet — only updated on verified deposits / eligibility. */
  lastEstimate: Map<string, bigint>;
  dayHistory: DayBucket[];
  rewardRateLabel: string;
};

function iso(ms = Date.now()) {
  return new Date(ms).toISOString();
}

function dayKey(ms = Date.now()) {
  return new Date(ms).toISOString().slice(0, 10);
}

function createOpenEpoch(epochNumber: number, nowMs = Date.now()): RewardEpochState {
  return {
    key: `epoch-${epochNumber}`,
    epochNumber,
    status: "OPEN",
    startsAt: iso(nowMs),
    endsAt: iso(nowMs + EPOCH_MS),
    nextSnapshotAt: iso(nowMs + EPOCH_MS),
    poolLamports: "0",
    totalEligibleWeight: 0,
    eligiblePetCount: 0,
    rewardRateLabel: "Share of verified Community Reward Treasury deposits this epoch",
  };
}

function emptyDay(day: string): DayBucket {
  return {
    day,
    estimatedLamports: 0n,
    claimableLamports: 0n,
    depositsLamports: 0n,
  };
}

function createStore(): Store {
  const epochNumber = 1;
  return {
    epochNumber,
    epoch: createOpenEpoch(epochNumber),
    poolLamports: 0n,
    funding: [],
    seenRequestIds: new Set(),
    pets: new Map(),
    claimable: new Map(),
    lifetimeClaimed: new Map(),
    lastEstimate: new Map(),
    dayHistory: [emptyDay(dayKey())],
    rewardRateLabel: "Share of verified Community Reward Treasury deposits this epoch",
  };
}

/** Server-side community activity counters (game metrics). Never fabricate holder SOL. */
type CommunityActivityState = {
  marketplaceTrades: number;
  eggsHatched: number;
  petsEvolved: number;
  /** Holders only when an indexer provides a real count. */
  newHolders: number | null;
};

let communityActivity: CommunityActivityState = {
  marketplaceTrades: 0,
  eggsHatched: 0,
  petsEvolved: 0,
  newHolders: null,
};

let store = createStore();

export function __resetPetRewardVault(): void {
  store = createStore();
  communityActivity = {
    marketplaceTrades: 0,
    eggsHatched: 0,
    petsEvolved: 0,
    newHolders: null,
  };
}

/** Update today's community activity snapshot (verified game metrics only). */
export function setCommunityActivitySnapshot(
  partial: Partial<CommunityActivityState>,
): CommunityActivityState {
  communityActivity = { ...communityActivity, ...partial };
  return { ...communityActivity };
}

export function getCommunityActivitySnapshot(): CommunityActivityState {
  return { ...communityActivity };
}

export function recordCommunityMarketplaceTrade(): void {
  communityActivity.marketplaceTrades += 1;
}

export function recordCommunityEggHatched(): void {
  communityActivity.eggsHatched += 1;
}

export function recordCommunityPetEvolved(): void {
  communityActivity.petsEvolved += 1;
}

function ensureDayBucket(day: string): DayBucket {
  let b = store.dayHistory.find((d) => d.day === day);
  if (!b) {
    b = emptyDay(day);
    store.dayHistory.push(b);
    store.dayHistory.sort((a, c) => a.day.localeCompare(c.day));
    if (store.dayHistory.length > 60) {
      store.dayHistory = store.dayHistory.slice(-60);
    }
  }
  return b;
}

function evaluatePet(pet: RegisteredPet): {
  status: PetRewardStatus;
  weight: number;
  reasons: InactiveReasonCode[];
} {
  const reasons: InactiveReasonCode[] = [];

  if (!featureFlagDefaults.PET_HOLDER_REWARDS_ENABLED || !featureFlagDefaults.HOLDER_REWARD_VAULT_ENABLED) {
    reasons.push("rewards_disabled");
  }
  if (pet.walletBlocked) reasons.push("wallet_blocked");
  if (pet.isDeceased) reasons.push("deceased");
  if (pet.isDormant) reasons.push("sleeping");
  if (pet.isSick) reasons.push("sick");
  if (pet.isListedForSale) reasons.push("listed");
  if (pet.transferredRecently) reasons.push("transferred");
  if (pet.ownershipHours < HOLDER_REWARD_CONFIG.minPetOwnershipHours) reasons.push("cooldown");
  if (!pet.meetsMinTokenBalance) reasons.push("min_token");
  if (!pet.petSelectedForRewards) reasons.push("not_selected");
  if (pet.careScore < HOLDER_REWARD_CONFIG.minCareScore) reasons.push("care_too_low");

  const walletPets = [...store.pets.values()].filter(
    (p) => p.walletKey === pet.walletKey && p.petSelectedForRewards && !p.isDeceased,
  );
  if (walletPets.length > HOLDER_REWARD_CONFIG.maxRewardBearingPets) {
    const sorted = walletPets
      .slice()
      .sort((a, b) => a.publicPetId.localeCompare(b.publicPetId));
    const allowed = new Set(
      sorted.slice(0, HOLDER_REWARD_CONFIG.maxRewardBearingPets).map((p) => p.publicPetId),
    );
    if (!allowed.has(pet.publicPetId)) reasons.push("slots_exceeded");
  }

  const eligible = reasons.length === 0;
  return {
    status: eligible ? "active" : "inactive",
    weight: eligible ? HOLDER_REWARD_CONFIG.petWeight : 0,
    reasons,
  };
}

function listEligibleWeights(): EligiblePetWeight[] {
  return [...store.pets.values()].map((pet) => {
    const ev = evaluatePet(pet);
    return {
      publicPetId: pet.publicPetId,
      walletKey: pet.walletKey,
      weight: ev.weight,
      status: ev.status,
      inactiveReasons: ev.reasons,
      inactiveReasonLabels: labelsForReasons(ev.reasons),
    };
  });
}

function totalEligibleWeight(): number {
  return listEligibleWeights().reduce((s, p) => s + p.weight, 0);
}

function syncEpochMeta(): void {
  const weights = listEligibleWeights();
  const total = weights.reduce((s, p) => s + p.weight, 0);
  const eligiblePetCount = weights.filter((p) => p.status === "active").length;
  store.epoch.poolLamports = store.poolLamports.toString();
  store.epoch.totalEligibleWeight = total;
  store.epoch.eligiblePetCount = eligiblePetCount;
  store.epoch.rewardRateLabel = store.rewardRateLabel;
}

function estimateForPet(publicPetId: string): bigint {
  const pet = store.pets.get(publicPetId);
  if (!pet) return 0n;
  const ev = evaluatePet(pet);
  if (ev.status !== "active" || ev.weight <= 0) return 0n;
  const total = totalEligibleWeight();
  return computeWalletEpochShare({
    availableEpochRewardLamports: store.poolLamports,
    walletEligibleWeight: ev.weight,
    totalEligibleWeight: total,
  });
}

function celebrationForPet(publicPetId: string): CelebrationStyle {
  const styles: CelebrationStyle[] = ["jump", "spin", "stretch", "sparkle-burst"];
  let h = 0;
  for (let i = 0; i < publicPetId.length; i++) h = (h + publicPetId.charCodeAt(i) * (i + 1)) % 997;
  return styles[h % styles.length]!;
}

export type RegisterPetInput = {
  publicPetId: string;
  petName: string;
  walletKey: string;
  careScore?: number;
  isSick?: boolean;
  isDormant?: boolean;
  isDeceased?: boolean;
  isListedForSale?: boolean;
  ownershipHours?: number;
  meetsMinTokenBalance?: boolean;
  petSelectedForRewards?: boolean;
  tokenHoldHours?: number;
  walletBlocked?: boolean;
  transferredRecently?: boolean;
};

export function registerPetForRewards(input: RegisterPetInput): EligiblePetWeight {
  const prev = store.pets.get(input.publicPetId);
  const pet: RegisteredPet = {
    publicPetId: input.publicPetId,
    petName: input.petName,
    walletKey: input.walletKey,
    careScore: input.careScore ?? prev?.careScore ?? 55,
    isSick: input.isSick ?? prev?.isSick ?? false,
    isDormant: input.isDormant ?? prev?.isDormant ?? false,
    isDeceased: input.isDeceased ?? prev?.isDeceased ?? false,
    isListedForSale: input.isListedForSale ?? prev?.isListedForSale ?? false,
    ownershipHours: input.ownershipHours ?? prev?.ownershipHours ?? 48,
    meetsMinTokenBalance: input.meetsMinTokenBalance ?? prev?.meetsMinTokenBalance ?? true,
    petSelectedForRewards: input.petSelectedForRewards ?? prev?.petSelectedForRewards ?? true,
    tokenHoldHours: input.tokenHoldHours ?? prev?.tokenHoldHours ?? 0,
    walletBlocked: input.walletBlocked ?? prev?.walletBlocked ?? false,
    transferredRecently: input.transferredRecently ?? prev?.transferredRecently ?? false,
  };
  store.pets.set(pet.publicPetId, pet);
  const ev = evaluatePet(pet);
  syncEpochMeta();
  const nextEstimate = estimateForPet(pet.publicPetId);
  store.lastEstimate.set(pet.publicPetId, nextEstimate);

  publishVaultEvent({
    type: "petEligibilityChanged",
    publicPetId: pet.publicPetId,
    status: ev.status,
    inactiveReasons: ev.reasons,
    weight: ev.weight,
    at: iso(),
  });

  return {
    publicPetId: pet.publicPetId,
    walletKey: pet.walletKey,
    weight: ev.weight,
    status: ev.status,
    inactiveReasons: ev.reasons,
    inactiveReasonLabels: labelsForReasons(ev.reasons),
  };
}

export function setPetRewardSelection(publicPetId: string, selected: boolean): EligiblePetWeight | null {
  const pet = store.pets.get(publicPetId);
  if (!pet) return null;
  return registerPetForRewards({ ...pet, petSelectedForRewards: selected });
}

/**
 * Record a verified deposit that funds the Community Reward Treasury.
 * Only the vault allocation line from server-side revenue split is added.
 * Rejects unverified / duplicate / non-positive vault slices.
 * Token-purchase fees on Pump.fun are NOT an automatic deposit path.
 */
export function recordVerifiedVaultDeposit(
  input: RecordVerifiedDepositInput,
):
  | { ok: true; funding: VerifiedFundingRecord; vaultLamports: bigint }
  | { ok: false; reason: string } {
  if (input.verificationToken !== VAULT_VERIFICATION_TOKEN) {
    return { ok: false, reason: "verification_failed" };
  }
  if (store.seenRequestIds.has(input.requestId)) {
    return { ok: false, reason: "duplicate_request" };
  }
  if (input.grossLamports <= 0n) {
    return { ok: false, reason: "non_positive_gross" };
  }
  if (store.epoch.status !== "OPEN") {
    return { ok: false, reason: "epoch_not_open" };
  }

  const allocation = allocateForTransactionType(input.grossLamports, input.transactionType);
  const vaultLine = allocation.lines.find((l) => l.destination === "PET_HOLDER_REWARD_VAULT");
  if (!vaultLine || vaultLine.allocatedAmountLamports <= 0n) {
    return { ok: false, reason: "no_vault_allocation" };
  }

  const vaultLamports = vaultLine.allocatedAmountLamports;
  const network = input.network ?? "devnet";
  const txSignature = input.txSignature ?? null;
  const funding: VerifiedFundingRecord = {
    id: `fund_${randomUUID().replace(/-/g, "").slice(0, 12)}`,
    requestId: input.requestId,
    createdAt: iso(),
    amountLamports: vaultLamports.toString(),
    source: input.source,
    transactionType: input.transactionType,
    txSignature,
    network,
    explorerUrl: txSignature ? EXPLORER_TX(txSignature, network) : null,
    epochKey: store.epoch.key,
    verified: true,
    note: input.note,
  };

  store.seenRequestIds.add(input.requestId);
  store.poolLamports += vaultLamports;
  store.funding.unshift(funding);
  if (store.funding.length > 100) store.funding.length = 100;

  const bucket = ensureDayBucket(dayKey());
  bucket.depositsLamports += vaultLamports;

  syncEpochMeta();

  publishVaultEvent({
    type: "newFundingTransaction",
    funding,
    at: funding.createdAt,
  });
  publishVaultEvent({
    type: "rewardPoolUpdated",
    epochKey: store.epoch.key,
    poolLamports: store.poolLamports.toString(),
    at: funding.createdAt,
  });

  // Recompute estimates for every registered pet — only active pets increase.
  for (const pet of store.pets.values()) {
    const previous = store.lastEstimate.get(pet.publicPetId) ?? 0n;
    const next = estimateForPet(pet.publicPetId);
    store.lastEstimate.set(pet.publicPetId, next);
    const ev = evaluatePet(pet);
    if (ev.status === "active" && next > previous) {
      publishVaultEvent({
        type: "rewardEstimateUpdated",
        publicPetId: pet.publicPetId,
        walletKey: pet.walletKey,
        estimatedPendingLamports: next.toString(),
        previousEstimatedLamports: previous.toString(),
        at: funding.createdAt,
        fromVerifiedDeposit: true,
        fundingId: funding.id,
      });
    }
  }

  return { ok: true, funding, vaultLamports };
}

/**
 * Finalize the open epoch: move each wallet's estimate into claimable.
 * Does not invent amounts — uses server estimates at close.
 */
export function closeCurrentEpoch(nowMs = Date.now()): {
  epochKey: string;
  finalizedPoolLamports: bigint;
} {
  syncEpochMeta();
  const finalizedPool = store.poolLamports;
  const byWallet = new Map<string, bigint>();

  for (const pet of store.pets.values()) {
    const share = estimateForPet(pet.publicPetId);
    if (share <= 0n) continue;
    byWallet.set(pet.walletKey, (byWallet.get(pet.walletKey) ?? 0n) + share);
  }

  for (const [wallet, amount] of byWallet) {
    store.claimable.set(wallet, (store.claimable.get(wallet) ?? 0n) + amount);
  }

  const closedKey = store.epoch.key;
  const closedNumber = store.epoch.epochNumber;

  publishVaultEvent({
    type: "epochClosed",
    epochKey: closedKey,
    epochNumber: closedNumber,
    finalizedPoolLamports: finalizedPool.toString(),
    at: iso(nowMs),
  });

  store.epochNumber += 1;
  store.epoch = createOpenEpoch(store.epochNumber, nowMs);
  store.poolLamports = 0n;
  for (const petId of store.lastEstimate.keys()) {
    store.lastEstimate.set(petId, 0n);
  }
  syncEpochMeta();

  return { epochKey: closedKey, finalizedPoolLamports: finalizedPool };
}

export function claimPetRewards(params: {
  publicPetId: string;
  walletKey: string;
}):
  | {
      ok: true;
      claimedLamports: bigint;
      celebrationStyle: CelebrationStyle;
      chainWrite: boolean;
      txSignature: string | null;
    }
  | { ok: false; reason: string } {
  if (!featureFlagDefaults.REWARD_CLAIMS_ENABLED) {
    return { ok: false, reason: "claims_disabled" };
  }
  const pet = store.pets.get(params.publicPetId);
  if (!pet) return { ok: false, reason: "pet_not_registered" };
  if (pet.walletKey !== params.walletKey) return { ok: false, reason: "not_owner" };

  const claimable = store.claimable.get(params.walletKey) ?? 0n;
  if (claimable <= 0n) return { ok: false, reason: "nothing_claimable" };

  store.claimable.set(params.walletKey, 0n);
  store.lifetimeClaimed.set(
    params.walletKey,
    (store.lifetimeClaimed.get(params.walletKey) ?? 0n) + claimable,
  );

  const chainWrite = featureFlagDefaults.AUTOMATIC_SETTLEMENT_ENABLED;
  const txSignature = chainWrite ? `sim_${randomUUID().replace(/-/g, "").slice(0, 16)}` : null;
  const celebrationStyle = celebrationForPet(params.publicPetId);
  const at = iso();

  publishVaultEvent({
    type: "claimCompleted",
    publicPetId: params.publicPetId,
    walletKey: params.walletKey,
    claimedLamports: claimable.toString(),
    celebrationStyle,
    at,
    txSignature,
    chainWrite,
  });

  return { ok: true, claimedLamports: claimable, celebrationStyle, chainWrite, txSignature };
}

function pointFromBucket(b: DayBucket): DailyRewardPoint {
  return {
    day: b.day,
    estimatedLamports: b.estimatedLamports.toString(),
    claimableLamports: b.claimableLamports.toString(),
    depositsLamports: b.depositsLamports.toString(),
  };
}

function historySlice(days: number): DailyRewardPoint[] {
  const out: DailyRewardPoint[] = [];
  const today = Date.now();
  for (let i = days - 1; i >= 0; i--) {
    const d = dayKey(today - i * 86_400_000);
    const bucket = store.dayHistory.find((x) => x.day === d) ?? emptyDay(d);
    out.push(pointFromBucket(bucket));
  }
  return out;
}

export function getWalletClaimBalance(walletKey: string): WalletClaimBalance {
  return {
    walletKey,
    claimableLamports: (store.claimable.get(walletKey) ?? 0n).toString(),
    lifetimeClaimedLamports: (store.lifetimeClaimed.get(walletKey) ?? 0n).toString(),
  };
}

export function getRecentFunding(limit = 20): VerifiedFundingRecord[] {
  return store.funding.slice(0, limit);
}

export function getCurrentEpochState(): RewardEpochState {
  syncEpochMeta();
  return { ...store.epoch, poolLamports: store.poolLamports.toString() };
}

/**
 * Build the pet profile vault card DTO. Wallet estimates only when isOwner.
 */
export function getPetRewardVaultView(params: {
  publicPetId: string;
  viewerWalletKey: string | null;
  isOwner: boolean;
}): PetRewardVaultView | null {
  const pet = store.pets.get(params.publicPetId);
  if (!pet) return null;

  syncEpochMeta();
  const ev = evaluatePet(pet);
  const estimated = estimateForPet(pet.publicPetId);
  store.lastEstimate.set(pet.publicPetId, estimated);

  const claimable = store.claimable.get(pet.walletKey) ?? 0n;
  const lifetime = store.lifetimeClaimed.get(pet.walletKey) ?? 0n;
  const totalW = totalEligibleWeight();
  const walletSharePercent =
    totalW > 0 && ev.weight > 0 ? Math.round((ev.weight / totalW) * 10_000) / 100 : 0;

  const activePets = listEligibleWeights()
    .filter((p) => p.status === "active")
    .sort((a, b) => b.weight - a.weight || a.publicPetId.localeCompare(b.publicPetId));
  const rankIdx = activePets.findIndex((p) => p.publicPetId === pet.publicPetId);
  const petRank = rankIdx >= 0 ? rankIdx + 1 : null;

  const today = ensureDayBucket(dayKey());
  const yesterdayKey = dayKey(Date.now() - 86_400_000);
  const yesterday = store.dayHistory.find((d) => d.day === yesterdayKey) ?? emptyDay(yesterdayKey);

  const showWallet = params.isOwner && params.viewerWalletKey === pet.walletKey;
  const nextSnapshotSeconds = Math.max(
    0,
    Math.floor((new Date(store.epoch.nextSnapshotAt).getTime() - Date.now()) / 1000),
  );

  const eligibleCount = Math.max(1, store.epoch.eligiblePetCount);
  const avg =
    store.epoch.eligiblePetCount > 0 ? store.poolLamports / BigInt(eligibleCount) : 0n;

  const lifetimeDeposits = store.funding.reduce((s, f) => s + BigInt(f.amountLamports), 0n);
  const holdersLabel =
    communityActivity.newHolders === null
      ? "N/A (awaiting holder indexer)"
      : String(communityActivity.newHolders);

  return {
    publicPetId: pet.publicPetId,
    petName: pet.petName,
    status: ev.status,
    inactiveReasons: ev.reasons,
    inactiveReasonLabels: labelsForReasons(ev.reasons),
    currentEpoch: getCurrentEpochState(),
    currentRewardRate: store.rewardRateLabel,
    estimatedPendingLamports: showWallet ? estimated.toString() : "0",
    estimatedPendingSol: showWallet ? lamportsToSolString(estimated) : "—",
    claimableLamports: showWallet ? claimable.toString() : "0",
    claimableSol: showWallet ? lamportsToSolString(claimable) : "—",
    lifetimeEarnedLamports: showWallet ? lifetime.toString() : "0",
    lifetimeEarnedSol: showWallet ? lamportsToSolString(lifetime) : "—",
    eligibleWeight: ev.weight,
    currentRewardPoolLamports: store.poolLamports.toString(),
    currentRewardPoolSol: lamportsToSolString(store.poolLamports),
    walletSharePercent: showWallet ? walletSharePercent : 0,
    nextSnapshotAt: store.epoch.nextSnapshotAt,
    nextSnapshotSeconds,
    nextDistributionAt: store.epoch.nextSnapshotAt,
    nextDistributionSeconds: nextSnapshotSeconds,
    communityActivity: {
      newHolders: communityActivity.newHolders,
      marketplaceTrades: communityActivity.marketplaceTrades,
      eggsHatched: communityActivity.eggsHatched,
      petsEvolved: communityActivity.petsEvolved,
      holdersLabel,
    },
    claimsEnabled: featureFlagDefaults.REWARD_CLAIMS_ENABLED,
    chainSettlementEnabled: featureFlagDefaults.AUTOMATIC_SETTLEMENT_ENABLED,
    isOwner: params.isOwner,
    walletEstimatesVisible: showWallet,
    explorerVaultUrl: null,
    recentFunding: store.funding.slice(0, 12),
    analytics: {
      petRank: showWallet ? petRank : null,
      totalEligiblePets: store.epoch.eligiblePetCount,
      walletSharePercent: showWallet ? walletSharePercent : 0,
      epochNumber: store.epoch.epochNumber,
      vaultBalanceLamports: store.poolLamports.toString(),
      vaultBalanceSol: lamportsToSolString(store.poolLamports),
      todayDepositsLamports: today.depositsLamports.toString(),
      todayDepositsSol: lamportsToSolString(today.depositsLamports),
      avgRewardPerEligiblePetLamports: avg.toString(),
      avgRewardPerEligiblePetSol: lamportsToSolString(avg),
      history: {
        today: pointFromBucket({
          ...today,
          estimatedLamports: showWallet ? estimated : 0n,
          claimableLamports: showWallet ? claimable : 0n,
        }),
        yesterday: pointFromBucket(yesterday),
        last7d: historySlice(7),
        last30d: historySlice(30),
        lifetime: {
          day: "lifetime",
          estimatedLamports: showWallet ? estimated.toString() : "0",
          claimableLamports: showWallet ? claimable.toString() : "0",
          depositsLamports: lifetimeDeposits.toString(),
        },
      },
    },
    disclaimers: {
      entertainment:
        "Entertainment feature: pets do not mint SOL. Owning a Riftling unlocks access to share in Community Reward Treasury distributions funded by verified project-controlled deposits.",
      estimates: revenueDisclosures.estimates,
      holderRewards: revenueDisclosures.holderRewards,
      communityTreasury: revenueDisclosures.communityTreasury,
    },
    dataSource: "server_vault",
  };
}

/** Map hatchery care condition → vault registration flags. */
export function flagsFromPetCondition(condition: string): {
  isSick: boolean;
  isDormant: boolean;
  isDeceased: boolean;
} {
  const c = condition.toUpperCase();
  return {
    isSick: c === "SICK" || c === "CRITICAL",
    isDormant: c === "DORMANT" || c === "SLEEPING",
    isDeceased: c === "DECEASED" || c === "MEMORIALIZED",
  };
}

export function fundingSourceFromTransactionType(
  type: RecordVerifiedDepositInput["transactionType"],
): FundingSourceKind {
  switch (type) {
    case "SHOP_PURCHASE":
      return "SHOP_PURCHASE";
    case "MARKETPLACE_SALE":
      return "MARKETPLACE_SALE";
    case "CRAFTING_FEE":
      return "CRAFTING_FEE";
    case "UPGRADE_FEE":
      return "UPGRADE_FEE";
    case "LISTING_FEE":
      return "LISTING_FEE";
    default:
      return "GAME_PURCHASE";
  }
}

/** Read-only accessors for tests */
export function __debugVaultState() {
  return {
    poolLamports: store.poolLamports,
    epoch: { ...store.epoch },
    fundingCount: store.funding.length,
    petCount: store.pets.size,
    lastEstimates: Object.fromEntries(
      [...store.lastEstimate.entries()].map(([k, v]) => [k, v.toString()]),
    ),
    claimable: Object.fromEntries(
      [...store.claimable.entries()].map(([k, v]) => [k, v.toString()]),
    ),
  };
}
