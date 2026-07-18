/**
 * Rift Storm event engine — warning → active → waves → final participation → end/cancel.
 * Integrates with loyalty streaks, pity, Credits, Loyalty Tokens (not a duplicate system).
 */

import { trackAnalytics } from "@/lib/analytics/events";
import { isFeatureEnabled } from "@/lib/config/feature-flags";
import { creditCredits } from "@/lib/credits/ledger";
import { PITY_MIN_RARITY, rarityIndex } from "@/lib/loyalty/config";
import { nextPityCount, shouldForcePity } from "@/lib/loyalty/pity";
import {
  DEFAULT_COMMUNITY_OBJECTIVE,
  DEFAULT_PRESENTATION,
  STORM_ACTIVE_HOURS_UTC,
  STORM_ACTIVE_MESSAGE,
  STORM_ACTIVE_MS,
  STORM_DISCONNECT_GRACE_MS,
  STORM_INBOX_TTL_MS,
  STORM_PARTICIPATION_REQUIREMENTS,
  STORM_QUALIFY_SCORE,
  STORM_REWARD_CATEGORIES,
  STORM_TIER_WEIGHT_BOOST,
  STORM_WARNING_MESSAGE,
  STORM_WARNING_MS,
  STORM_WAVES,
  STORM_WAVE_TABLES,
} from "@/lib/loyalty/rift-storm-config";
import {
  applyParticipationAction,
  emptyParticipant,
  isStormParticipationAction,
  loginAloneQualifies,
} from "@/lib/loyalty/rift-storm-participation";
import {
  applyTierWeightBoost,
  computeSelectionWeight,
  weightToWinChance,
} from "@/lib/loyalty/rift-storm-selection";
import { attemptStormSolGrant } from "@/lib/loyalty/rift-storm-sol";
import type {
  RiftStormState,
  StormAuditEntry,
  StormIntensityTier,
  StormParticipantState,
  StormParticipationAction,
  StormPlayerView,
  StormTriggerReason,
  StormWaveId,
  TempStormQuest,
  UnclaimedInboxItem,
} from "@/lib/loyalty/rift-storm-types";
import {
  appendStormAudit,
  getStormAudit,
  getStormInbox,
  getStormParticipant,
  getStormSolUserDayGrants,
  getStormState,
  getStreakState,
  hasClaimKey,
  incrementStormSolUserDay,
  listStormInboxForUser,
  markClaimKey,
  saveStormInboxItem,
  saveStormParticipant,
  saveStormState,
  saveStreakState,
} from "@/lib/loyalty/store";
import { utcDayKey } from "@/lib/loyalty/streaks";
import { tierFromDailyStreak, tierMeetsMinimum } from "@/lib/loyalty/tiers";
import { creditLoyaltyTokens } from "@/lib/loyalty/tokens";
import type { AirdropRewardDef, ClaimedRewardRecord, LoyaltyTier } from "@/lib/loyalty/types";

export function isNewlyQualified(
  prevScore: number,
  nextScore: number,
  intensity: StormIntensityTier,
): boolean {
  const q = STORM_QUALIFY_SCORE[intensity];
  return prevScore < q && nextScore >= q;
}

function createSeedPair(now: number): { commit: string; reveal: string } {
  const reveal = `rw_${now}_${Math.random().toString(36).slice(2)}_${Math.random().toString(36).slice(2)}`;
  // Commit hides reveal until event ends (demo hash)
  let h = 0;
  for (let i = 0; i < reveal.length; i++) h = (h * 31 + reveal.charCodeAt(i)) >>> 0;
  return { commit: `commit_${h.toString(16)}`, reveal };
}

function idleStorm(): RiftStormState {
  return {
    id: "storm_idle",
    phase: "IDLE",
    intensity: "MINOR",
    triggerReason: "DEV",
    active: false,
    warningStartedAt: null,
    warningEndsAt: null,
    startedAt: null,
    endsAt: null,
    cancelledAt: null,
    cancelReason: null,
    worldMessage: STORM_ACTIVE_MESSAGE,
    warningMessage: STORM_WARNING_MESSAGE,
    participantCount: 0,
    winnerCount: 0,
    qualifiedCount: 0,
    publicHighlights: [],
    triggeredBy: "dev",
    eligibleRegions: [],
    regional: {
      regionIds: [],
      weather: "clear",
      empoweredEnemies: false,
      rareRiftlings: false,
      treasureNodes: false,
      npcReactions: false,
      tempQuests: false,
      mapMarkers: false,
      mustTravel: false,
      global: true,
    },
    presentation: { ...DEFAULT_PRESENTATION },
    currentWave: null,
    wavesCompleted: [],
    community: {
      objective: { ...DEFAULT_COMMUNITY_OBJECTIVE },
      communityScore: 0,
      milestonesHit: [],
    },
    tempQuests: [],
    solPoolLamports: 0,
    solGrantedLamports: 0,
    solGrantsCount: 0,
    seedCommit: "",
    seedReveal: null,
  };
}

function audit(
  stormId: string,
  action: StormAuditEntry["action"],
  userId?: string,
  detail?: StormAuditEntry["detail"],
): void {
  appendStormAudit({
    id: `aud_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    at: new Date().toISOString(),
    stormId,
    action,
    userId,
    detail,
  });
}

function buildTempQuests(endsAt: string, regionIds: string[]): TempStormQuest[] {
  const base = [
    { id: "tq_seal", label: "Seal a micro-rift", npcRole: "scholar" as const, objective: "seal_rift" as const, points: 8 },
    { id: "tq_rescue", label: "Rescue a stranded traveler", npcRole: "guard" as const, objective: "rescue" as const, points: 10 },
    { id: "tq_protect", label: "Protect the caravan", npcRole: "guard" as const, objective: "protect" as const, points: 10 },
    { id: "tq_fragments", label: "Collect storm fragments", npcRole: "merchant" as const, objective: "fragments" as const, points: 8 },
    { id: "tq_energy", label: "Siphon storm energy", npcRole: "scholar" as const, objective: "storm_energy" as const, points: 12 },
    { id: "tq_treasure", label: "Storm cache hunt", npcRole: "child" as const, objective: "treasure" as const, points: 10 },
  ];
  return base.map((q, i) => ({
    ...q,
    regionId: regionIds[i % Math.max(1, regionIds.length)] ?? undefined,
    expiresAt: endsAt,
  }));
}

export function ensureStormState(): RiftStormState {
  const s = getStormState();
  if (!s.phase) {
    const idle = idleStorm();
    saveStormState(idle);
    return idle;
  }
  return syncStormPhase(s);
}

export function syncStormPhase(storm: RiftStormState, now = Date.now()): RiftStormState {
  if (storm.phase === "CANCELLED" || storm.phase === "ENDED" || storm.phase === "IDLE") {
    return storm;
  }

  if (storm.phase === "WARNING" && storm.warningEndsAt && Date.parse(storm.warningEndsAt) <= now) {
    const next: RiftStormState = {
      ...storm,
      phase: "ACTIVE",
      active: true,
      startedAt: new Date(now).toISOString(),
      endsAt: new Date(now + STORM_ACTIVE_MS[storm.intensity]).toISOString(),
      currentWave: "WAVE_1",
      worldMessage: STORM_ACTIVE_MESSAGE,
    };
    saveStormState(next);
    audit(next.id, "start_active");
    trackAnalytics("rift_storm_start", { intensity: next.intensity, phase: "ACTIVE" });
    return next;
  }

  if (storm.phase === "ACTIVE" && storm.endsAt && Date.parse(storm.endsAt) <= now) {
    const next: RiftStormState = {
      ...storm,
      phase: "ENDED",
      active: false,
      currentWave: null,
      seedReveal: storm.seedReveal ?? storm.seedCommit,
      tempQuests: [],
    };
    saveStormState(next);
    audit(next.id, "wave", undefined, { final: true });
    trackAnalytics("rift_storm_end", {
      winners: next.winnerCount,
      participants: next.participantCount,
    });
    return next;
  }

  if (storm.phase === "ACTIVE" && storm.startedAt) {
    const elapsed = now - Date.parse(storm.startedAt);
    let wave: StormWaveId = "WAVE_1";
    const completed: StormWaveId[] = [];
    for (const w of STORM_WAVES) {
      if (elapsed >= w.startsAfterMs) {
        wave = w.id;
        if (elapsed >= w.startsAfterMs + w.durationMs) completed.push(w.id);
      }
    }
    if (wave !== storm.currentWave || completed.length !== storm.wavesCompleted.length) {
      const next = { ...storm, currentWave: wave, wavesCompleted: completed };
      saveStormState(next);
      return next;
    }
  }

  return storm;
}

export type ActivateStormParams = {
  intensity?: StormIntensityTier;
  triggerReason?: StormTriggerReason;
  triggeredBy?: RiftStormState["triggeredBy"];
  regionIds?: string[];
  global?: boolean;
  warningMs?: number;
  activeMs?: number;
  solPoolLamports?: number;
  skipWarning?: boolean;
  now?: number;
  message?: string;
};

export function activateRiftStorm(params: ActivateStormParams = {}): RiftStormState {
  if (!isFeatureEnabled("LOYALTY_SYSTEM_ENABLED") || !isFeatureEnabled("RIFT_STORM_ENABLED")) {
    return ensureStormState();
  }

  const now = params.now ?? Date.now();
  const intensity = params.intensity ?? "MINOR";
  const warningMs = params.warningMs ?? STORM_WARNING_MS[intensity];
  const activeMs = params.activeMs ?? STORM_ACTIVE_MS[intensity];
  const global = params.global ?? !params.regionIds?.length;
  const regionIds = params.regionIds ?? (global ? [] : ["riftwild-commons"]);
  const seeds = createSeedPair(now);
  const skipWarning = params.skipWarning ?? false;

  const endsAfterWarning = now + warningMs + activeMs;
  const storm: RiftStormState = {
    ...idleStorm(),
    id: `storm_${now}`,
    phase: skipWarning ? "ACTIVE" : "WARNING",
    intensity,
    triggerReason: params.triggerReason ?? "ADMIN",
    active: true,
    warningStartedAt: skipWarning ? null : new Date(now).toISOString(),
    warningEndsAt: skipWarning ? null : new Date(now + warningMs).toISOString(),
    startedAt: skipWarning ? new Date(now).toISOString() : null,
    endsAt: skipWarning
      ? new Date(now + activeMs).toISOString()
      : new Date(endsAfterWarning).toISOString(),
    worldMessage: params.message ?? (skipWarning ? STORM_ACTIVE_MESSAGE : STORM_WARNING_MESSAGE),
    warningMessage: STORM_WARNING_MESSAGE,
    triggeredBy: params.triggeredBy ?? "admin",
    eligibleRegions: global ? ["*"] : regionIds,
    regional: {
      regionIds,
      weather: intensity === "CATACLYSM" ? "rift-maelstrom" : "rift-winds",
      empoweredEnemies: intensity !== "MINOR",
      rareRiftlings: intensity === "LEGENDARY" || intensity === "SEASONAL" || intensity === "CATACLYSM",
      treasureNodes: true,
      npcReactions: true,
      tempQuests: true,
      mapMarkers: true,
      mustTravel: !global,
      global,
    },
    presentation: {
      ...DEFAULT_PRESENTATION,
      particles: intensity === "CATACLYSM" ? "full" : "reduced",
    },
    currentWave: skipWarning ? "WAVE_1" : null,
    community: {
      objective: { ...DEFAULT_COMMUNITY_OBJECTIVE },
      communityScore: 0,
      milestonesHit: [],
    },
    tempQuests: buildTempQuests(new Date(endsAfterWarning).toISOString(), regionIds),
    solPoolLamports: params.solPoolLamports ?? 0,
    seedCommit: seeds.commit,
    seedReveal: null,
  };

  // Stash reveal server-side only until end
  (storm as RiftStormState & { _reveal?: string })._reveal = seeds.reveal;
  saveStormState(storm);
  audit(storm.id, skipWarning ? "start_active" : "warn", undefined, {
    intensity,
    trigger: storm.triggerReason,
  });
  trackAnalytics("rift_storm_start", {
    intensity,
    trigger: storm.triggerReason,
    warning: !skipWarning,
  });
  return storm;
}

/**
 * Secure-ish random activation stub — not fully predictable.
 * Call from scheduler / admin; respects active-hour window unless force.
 */
export function maybeRandomActivate(params?: {
  now?: number;
  force?: boolean;
  rng?: () => number;
}): RiftStormState | null {
  const now = params.now ?? Date.now();
  const current = ensureStormState();
  if (current.phase === "WARNING" || current.phase === "ACTIVE") return null;

  const hour = new Date(now).getUTCHours();
  const inHours =
    hour >= STORM_ACTIVE_HOURS_UTC.start && hour < STORM_ACTIVE_HOURS_UTC.end;
  if (!params?.force && !inHours) return null;

  const rng = params?.rng ?? Math.random;
  // ~8% chance per poll during active hours (stub)
  if (!params?.force && rng() > 0.08) return null;

  const roll = rng();
  const intensity: StormIntensityTier =
    roll > 0.97
      ? "CATACLYSM"
      : roll > 0.9
        ? "LEGENDARY"
        : roll > 0.75
          ? "GREATER"
          : "MINOR";

  return activateRiftStorm({
    intensity,
    triggerReason: "RANDOM_ACTIVE_HOURS",
    triggeredBy: "system",
    now,
  });
}

export function cancelRiftStorm(reason = "Emergency cancellation"): RiftStormState {
  const storm = ensureStormState();
  if (storm.phase === "IDLE" || storm.phase === "ENDED" || storm.phase === "CANCELLED") {
    return storm;
  }
  const next: RiftStormState = {
    ...storm,
    phase: "CANCELLED",
    active: false,
    cancelledAt: new Date().toISOString(),
    cancelReason: reason,
    currentWave: null,
    tempQuests: [],
    worldMessage: `Rift Storm cancelled: ${reason}`,
  };
  saveStormState(next);
  audit(next.id, "cancel", undefined, { reason });
  trackAnalytics("rift_storm_end", { cancelled: true, reason });
  return next;
}

export function endRiftStormEngine(): RiftStormState {
  const storm = ensureStormState();
  const next: RiftStormState = {
    ...storm,
    phase: "ENDED",
    active: false,
    currentWave: null,
    tempQuests: [],
    seedReveal: (storm as RiftStormState & { _reveal?: string })._reveal ?? storm.seedCommit,
  };
  saveStormState(next);
  audit(next.id, "wave", undefined, { ended: true });
  return next;
}

export function recordStormParticipation(params: {
  userId: string;
  action: StormParticipationAction | string;
  regionId?: string;
  accountAgeDays?: number;
  now?: number;
}):
  | { ok: true; participant: StormParticipantState; pointsGained: number; storm: RiftStormState }
  | { ok: false; error: string; message: string } {
  if (!isFeatureEnabled("RIFT_STORM_ENABLED")) {
    return { ok: false, error: "feature_disabled", message: "Rift Storm disabled." };
  }
  if (!isStormParticipationAction(params.action)) {
    if (params.action === "LOGIN" || params.action === "login") {
      return {
        ok: false,
        error: "afk_denied",
        message: "Login alone does not qualify for Rift Storm participation.",
      };
    }
    return { ok: false, error: "invalid", message: "Unknown participation action." };
  }

  const now = params.now ?? Date.now();
  let storm = ensureStormState();
  storm = syncStormPhase(storm, now);

  if (storm.phase !== "ACTIVE") {
    return {
      ok: false,
      error: "storm_inactive",
      message:
        storm.phase === "WARNING"
          ? "Storm is in warning phase — participation scoring starts when it goes live."
          : "No active Rift Storm.",
    };
  }

  if (!storm.regional.global && storm.regional.mustTravel) {
    const rid = params.regionId;
    if (!rid || !storm.regional.regionIds.includes(rid)) {
      return {
        ok: false,
        error: "invalid",
        message: "Regional storm — travel to an eligible region to participate.",
      };
    }
  }

  const existing = getStormParticipant(storm.id, params.userId);
  let participant =
    existing ?? emptyParticipant(params.userId, storm.id, params.accountAgeDays ?? 7);

  if (participant.disconnectGraceUntil && Date.parse(participant.disconnectGraceUntil) > now) {
    participant = { ...participant, disconnectGraceUntil: null };
    audit(storm.id, "disconnect_grace", params.userId);
  }

  const prevScore = participant.score;
  const applied = applyParticipationAction(
    participant,
    params.action,
    storm.intensity,
    now,
    { regionId: params.regionId },
  );
  participant = applied.participant;
  saveStormParticipant(participant);

  const base = getStormState();
  const firstAction = !existing;
  const newlyQualified = isNewlyQualified(prevScore, participant.score, base.intensity);

  const nextStorm: RiftStormState = {
    ...base,
    participantCount: firstAction ? base.participantCount + 1 : base.participantCount,
    qualifiedCount: newlyQualified ? base.qualifiedCount + 1 : base.qualifiedCount,
    community: {
      ...base.community,
      communityScore: base.community.communityScore + applied.pointsGained,
    },
  };

  const target = nextStorm.community.objective.targetScore;
  const milestones = [0.25, 0.5, 0.75, 1].map((p) => Math.floor(target * p));
  const hit = milestones.filter(
    (m) =>
      nextStorm.community.communityScore >= m && !nextStorm.community.milestonesHit.includes(m),
  );
  if (hit.length) {
    nextStorm.community = {
      ...nextStorm.community,
      milestonesHit: [...nextStorm.community.milestonesHit, ...hit],
    };
    audit(nextStorm.id, "community_progress", undefined, { milestones: hit.join(",") });
  }

  saveStormState(nextStorm);
  audit(nextStorm.id, "participate", params.userId, {
    action: params.action,
    points: applied.pointsGained,
    score: participant.score,
  });
  trackAnalytics("rift_storm_participate", {
    action: params.action,
    points: applied.pointsGained,
  });

  return { ok: true, participant, pointsGained: applied.pointsGained, storm: nextStorm };
}

function weightedTablePick(
  table: AirdropRewardDef[],
  tier: LoyaltyTier,
  pityCount: number,
  rng: () => number,
): AirdropRewardDef | null {
  const pityForced = shouldForcePity(pityCount);
  const entries = table
    .filter((r) => {
      if (r.minTier && !tierMeetsMinimum(tier, r.minTier)) return false;
      if (pityForced && rarityIndex(r.rarity) < rarityIndex(PITY_MIN_RARITY)) return false;
      return true;
    })
    .map((r) => ({
      reward: r,
      w: applyTierWeightBoost(r.weight, tier),
    }))
    .filter((e) => e.w > 0);

  if (!entries.length) return null;
  const total = entries.reduce((s, e) => s + e.w, 0);
  let roll = rng() * total;
  for (const e of entries) {
    roll -= e.w;
    if (roll <= 0) return e.reward;
  }
  return entries[entries.length - 1]!.reward;
}

function grantReward(userId: string, reward: AirdropRewardDef, requestId: string): void {
  if (reward.kind === "CREDITS" && reward.creditsAmount) {
    creditCredits({
      userId,
      amount: reward.creditsAmount,
      reason: "STREAK_AIRDROP",
      requestId: `storm-credit:${requestId}`,
      metadata: { rewardId: reward.id, source: "rift_storm" },
    });
  }
  if (reward.kind === "LOYALTY_TOKENS" && reward.loyaltyTokens) {
    creditLoyaltyTokens({
      userId,
      amount: reward.loyaltyTokens,
      reason: "RIFT_STORM",
      requestId: `storm-lt:${requestId}`,
      metadata: { rewardId: reward.id },
    });
  }
}

export function rollStormWave(params: {
  userId: string;
  waveId?: StormWaveId;
  now?: number;
  rng?: () => number;
  shareWin?: boolean;
  walletAddress?: string | null;
}):
  | {
      ok: true;
      won: boolean;
      reward?: AirdropRewardDef;
      claim?: ClaimedRewardRecord;
      inboxItem?: UnclaimedInboxItem;
      solAttempt?: ReturnType<typeof attemptStormSolGrant>["attempt"];
      storm: RiftStormState;
      privacyNote: string;
    }
  | { ok: false; error: string; message: string } {
  if (!isFeatureEnabled("RIFT_STORM_ENABLED")) {
    return { ok: false, error: "feature_disabled", message: "Rift Storm disabled." };
  }

  const now = params.now ?? Date.now();
  const rng = params.rng ?? Math.random;
  let storm = syncStormPhase(ensureStormState(), now);

  if (storm.phase !== "ACTIVE") {
    return { ok: false, error: "storm_inactive", message: "No active Rift Storm." };
  }

  const waveId = params.waveId ?? storm.currentWave ?? "WAVE_1";
  const waveDef = STORM_WAVES.find((w) => w.id === waveId);
  if (!waveDef) return { ok: false, error: "invalid", message: "Unknown wave." };

  let participant = getStormParticipant(storm.id, params.userId);
  if (!participant || participant.score < waveDef.minScore) {
    return {
      ok: false,
      error: "afk_denied",
      message: `Need participation score ≥ ${waveDef.minScore} for ${waveDef.label}. Login alone never qualifies.`,
    };
  }

  if (participant.wavesRolled.includes(waveId)) {
    return { ok: false, error: "already_claimed", message: "Already rolled this wave." };
  }

  const streak = getStreakState(params.userId);
  const tier = tierFromDailyStreak(streak.dailyStreak);
  const pityCount = streak.pityCounters.rift_storm ?? 0;
  const factors = computeSelectionWeight({
    participant,
    loyaltyTier: tier,
    intensity: storm.intensity,
    pityCount,
    rng,
  });

  const claimKey = `storm:${storm.id}:${params.userId}:${waveId}`;
  if (hasClaimKey(claimKey)) {
    return { ok: false, error: "duplicate", message: "Duplicate wave claim blocked." };
  }

  let won = false;
  if (waveDef.guaranteedParticipation) {
    won = participant.qualified || participant.score >= waveDef.minScore;
  } else {
    won = rng() < weightToWinChance(factors.weight, waveDef.minScore);
  }

  participant = {
    ...participant,
    wavesRolled: [...participant.wavesRolled, waveId],
    pityBonusApplied: factors.pityBonus > 1,
  };

  let reward: AirdropRewardDef | undefined;
  let claim: ClaimedRewardRecord | undefined;
  let inboxItem: UnclaimedInboxItem | undefined;
  let solAttempt: ReturnType<typeof attemptStormSolGrant>["attempt"] | undefined;

  if (won) {
    const table = STORM_WAVE_TABLES[waveDef.tableId] ?? STORM_WAVE_TABLES.rift_storm!;
    reward = weightedTablePick(table, tier, pityCount, rng) ?? undefined;

    if (reward?.assetId === "sol_promo_ticket") {
      const dayKey = utcDayKey(now);
      const sol = attemptStormSolGrant({
        userId: params.userId,
        walletAddress: params.walletAddress,
        poolLamports: storm.solPoolLamports,
        grantedThisStorm: storm.solGrantedLamports,
        grantsThisStorm: storm.solGrantsCount,
        userGrantsToday: getStormSolUserDayGrants(params.userId, dayKey),
        fraudRisk: participant.fraudRisk,
        alreadyGrantedKey: hasClaimKey(`storm-sol:${storm.id}:${params.userId}`),
        dayKey,
      });
      solAttempt = sol.attempt;
      storm = {
        ...getStormState(),
        solPoolLamports: sol.poolLamports,
        solGrantedLamports: sol.grantedThisStorm,
        solGrantsCount: sol.grantsThisStorm,
      };
      if (sol.attempt.granted) {
        markClaimKey(`storm-sol:${storm.id}:${params.userId}`);
        incrementStormSolUserDay(params.userId, dayKey);
        audit(storm.id, "sol_attempt", params.userId, {
          granted: true,
          lamports: sol.attempt.lamports ?? 0,
        });
      } else if (sol.substitute) {
        reward = sol.substitute;
        audit(storm.id, "sol_attempt", params.userId, {
          granted: false,
          reason: sol.attempt.failReason ?? "fail",
        });
      }
    }

    if (reward) {
      markClaimKey(claimKey);
      grantReward(params.userId, reward, claimKey);

      // Cosmetic unlocks on streak state
      let state = getStreakState(params.userId);
      const titles = [...state.titles];
      const badges = [...state.badges];
      const cosmetics = [...state.cosmetics];
      const housing = [...state.housingUnlocks];
      if (reward.kind === "TITLE" && reward.label && !titles.includes(reward.label)) titles.push(reward.label);
      if (reward.kind === "BADGE" && reward.assetId && !badges.includes(reward.assetId)) badges.push(reward.assetId);
      if (reward.kind === "COSMETIC" && reward.assetId && !cosmetics.includes(reward.assetId)) cosmetics.push(reward.assetId);
      if (reward.kind === "HOUSING" && reward.assetId && !housing.includes(reward.assetId)) housing.push(reward.assetId);

      claim = {
        id: `storm_claim_${now}`,
        claimKey,
        source: "RIFT_STORM",
        rewardId: reward.id,
        label: reward.label,
        rarity: reward.rarity,
        kind: reward.kind,
        creditsAmount: reward.creditsAmount,
        loyaltyTokens: reward.loyaltyTokens,
        assetId: reward.assetId,
        claimedAt: new Date(now).toISOString(),
        shared: Boolean(params.shareWin),
      };

      state = {
        ...state,
        titles,
        badges,
        cosmetics,
        housingUnlocks: housing,
        pityCounters: {
          ...state.pityCounters,
          rift_storm: nextPityCount(pityCount, reward.rarity),
        },
        collection: [claim, ...state.collection].slice(0, 200),
        updatedAt: new Date(now).toISOString(),
      };
      saveStreakState(state);

      participant = {
        ...participant,
        recentRewardIds: [reward.id, ...participant.recentRewardIds].slice(0, 5),
      };

      inboxItem = {
        id: `inbox_${claimKey}`,
        stormId: storm.id,
        userId: params.userId,
        waveId,
        reward,
        createdAt: new Date(now).toISOString(),
        expiresAt: new Date(now + STORM_INBOX_TTL_MS).toISOString(),
        claimedAt: new Date(now).toISOString(),
        claimKey,
      };
      saveStormInboxItem(inboxItem);

      storm = {
        ...getStormState(),
        winnerCount: getStormState().winnerCount + 1,
      };
      if (params.shareWin && !state.socialAnnounceOptOut) {
        storm = {
          ...storm,
          publicHighlights: [
            ...storm.publicHighlights,
            `A ${tier.toLowerCase()} keeper received a ${reward.rarity.toLowerCase()} storm gift.`,
          ].slice(-20),
        };
      }
    }
  } else {
    // Miss — still advance pity slightly for fairness next wave
    const state = getStreakState(params.userId);
    saveStreakState({
      ...state,
      pityCounters: {
        ...state.pityCounters,
        rift_storm: (state.pityCounters.rift_storm ?? 0) + 1,
      },
    });
  }

  // Community personal threshold reward (once)
  const obj = storm.community.objective;
  if (
    participant.personalContribution >= obj.personalThreshold &&
    storm.community.communityScore >= obj.targetScore &&
    !hasClaimKey(`storm-community:${storm.id}:${params.userId}`)
  ) {
    markClaimKey(`storm-community:${storm.id}:${params.userId}`);
    if (obj.rewardCredits > 0) {
      creditCredits({
        userId: params.userId,
        amount: obj.rewardCredits,
        reason: "EVENT_REWARD",
        requestId: `storm-community:${storm.id}:${params.userId}`,
        metadata: { stormId: storm.id },
      });
    }
    if (obj.rewardLoyaltyTokens > 0) {
      creditLoyaltyTokens({
        userId: params.userId,
        amount: obj.rewardLoyaltyTokens,
        reason: "STORM_COMMUNITY",
        requestId: `storm-community-lt:${storm.id}:${params.userId}`,
      });
    }
    audit(storm.id, "community_progress", params.userId, { qualified: true });
  }

  saveStormParticipant(participant);
  saveStormState(storm);
  audit(storm.id, won ? "claim" : "select", params.userId, {
    wave: waveId,
    won,
    weight: Math.round(factors.weight * 100) / 100,
  });
  trackAnalytics("rift_storm_roll", { won, wave: waveId, tier });

  return {
    ok: true,
    won: Boolean(won && reward),
    reward,
    claim,
    inboxItem,
    solAttempt,
    storm,
    privacyNote:
      "Recipients are private by default. World banners never force wallet or name reveal.",
  };
}

export function markDisconnectGrace(userId: string, now = Date.now()): void {
  const storm = ensureStormState();
  if (storm.phase !== "ACTIVE") return;
  const p = getStormParticipant(storm.id, userId);
  if (!p) return;
  saveStormParticipant({
    ...p,
    disconnectGraceUntil: new Date(now + STORM_DISCONNECT_GRACE_MS).toISOString(),
  });
  audit(storm.id, "disconnect_grace", userId);
}

export function getStormPlayerView(userId: string, now = Date.now()): StormPlayerView {
  const storm = syncStormPhase(ensureStormState(), now);
  const live =
    storm.phase === "WARNING" || storm.phase === "ACTIVE" ? storm : storm.phase === "IDLE" ? null : storm;
  const participant = live ? getStormParticipant(live.id, userId) : null;
  const tier = tierFromDailyStreak(getStreakState(userId).dailyStreak);
  const inbox = listStormInboxForUser(userId).filter((i) => !i.claimedAt || Date.parse(i.expiresAt) > now);

  const ends = live?.endsAt ? Date.parse(live.endsAt) : 0;
  const warnEnds = live?.warningEndsAt ? Date.parse(live.warningEndsAt) : 0;

  return {
    storm: live,
    participant,
    tierBoostPercent: Math.round(STORM_TIER_WEIGHT_BOOST[tier] * 100),
    loyaltyTier: tier,
    canParticipate: live?.phase === "ACTIVE",
    participationRequirements: [...STORM_PARTICIPATION_REQUIREMENTS],
    rewardCategories: [...STORM_REWARD_CATEGORIES],
    inbox,
    communityPersonal: participant?.personalContribution ?? 0,
    communityTotal: live?.community.communityScore ?? 0,
    communityTarget: live?.community.objective.targetScore ?? DEFAULT_COMMUNITY_OBJECTIVE.targetScore,
    communityQualified:
      (participant?.personalContribution ?? 0) >=
        (live?.community.objective.personalThreshold ?? 0) &&
      (live?.community.communityScore ?? 0) >=
        (live?.community.objective.targetScore ?? Infinity),
    nextMilestone: (() => {
      const target = live?.community.objective.targetScore ?? 0;
      const hits = live?.community.milestonesHit ?? [];
      const marks = [0.25, 0.5, 0.75, 1].map((p) => Math.floor(target * p));
      return marks.find((m) => !hits.includes(m)) ?? null;
    })(),
    timeRemainingMs: live?.phase === "ACTIVE" && ends ? Math.max(0, ends - now) : 0,
    warningRemainingMs: live?.phase === "WARNING" && warnEnds ? Math.max(0, warnEnds - now) : 0,
    privacyNote:
      "Winners are not revealed early. Sharing is opt-in. No forced public recipient list.",
  };
}

export function listStormAuditTrail(limit = 50): StormAuditEntry[] {
  return getStormAudit(limit);
}

export function claimInboxItem(userId: string, inboxId: string): { ok: boolean; message: string } {
  const item = getStormInbox(inboxId);
  if (!item || item.userId !== userId) return { ok: false, message: "Inbox item not found." };
  if (item.claimedAt) return { ok: false, message: "Already claimed." };
  if (Date.parse(item.expiresAt) < Date.now()) return { ok: false, message: "Expired." };
  const claimKey = `inbox-claim:${inboxId}`;
  if (hasClaimKey(claimKey)) return { ok: false, message: "Duplicate." };
  markClaimKey(claimKey);
  grantReward(userId, item.reward, claimKey);
  saveStormInboxItem({ ...item, claimedAt: new Date().toISOString() });
  return { ok: true, message: "Claimed from inbox." };
}

export { loginAloneQualifies, idleStorm };
