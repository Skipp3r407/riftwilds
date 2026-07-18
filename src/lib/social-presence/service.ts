/**
 * Living Server Population service — presence states, XP, tokens, hubs, helpers.
 * Never grants SOL. Soft Credits / Community Tokens / cosmetics only with caps.
 */

import { trackAnalytics } from "@/lib/analytics/events";
import { isFeatureEnabled } from "@/lib/config/feature-flags";
import { creditCredits, ensureStarterCredits } from "@/lib/credits/ledger";
import {
  appendInputSignal,
  evaluateAntiAfk,
  multiAccountXpMultiplier,
  trimActionLog,
} from "@/lib/social-presence/anti-afk";
import { analyzeRisk, rewardMultiplierForRisk } from "@/lib/social-presence/anti-bot";
import { achievementView, evaluateNewAchievements } from "@/lib/social-presence/achievements";
import {
  applyActivityScoreGain,
  categoryForAction,
  decayActivityScore,
} from "@/lib/social-presence/activity-score";
import {
  eventBonusForLocation,
  listActiveCommunityEvents,
} from "@/lib/social-presence/community-events";
import {
  creditCommunityTokens,
  getCommunityTokenBalance,
  tokensEarnedToday,
} from "@/lib/social-presence/community-tokens";
import {
  PRESENCE_XP_DAY_CAP,
  PRESENCE_XP_HOUR_CAP,
  COMMUNITY_TOKENS_DAY_CAP,
} from "@/lib/social-presence/config";
import {
  progressTask,
  tasksForDay,
  type CommunityTaskDef,
} from "@/lib/social-presence/daily-tasks";
import {
  applyDiminishing,
  bumpCategoryCount,
} from "@/lib/social-presence/diminishing-returns";
import {
  buildIdleClaim,
  canClaimIdleParticipation,
} from "@/lib/social-presence/idle-rewards";
import {
  getHomePopularity,
  listPopularHomes,
  recordHomeVisit,
} from "@/lib/social-presence/home-visits";
import {
  getHelperProfile,
  recordHelperAssist,
  setHelperOptIn,
} from "@/lib/social-presence/helper-system";
import {
  derivePresenceState,
  engagementTierFromState,
  rewardsAllowedForTier,
} from "@/lib/social-presence/presence-state";
import { presenceLevelFromXp } from "@/lib/social-presence/presence-levels";
import { computePresenceXpAward, densityBonusPercent } from "@/lib/social-presence/presence-xp";
import {
  bumpLocationActivity,
  listPopularLocations,
  populationByRegion,
} from "@/lib/social-presence/popular-locations";
import {
  isValidPlayerSocialStatus,
  statusFromAction,
} from "@/lib/social-presence/player-status";
import { getRestHub, restBonusPercent } from "@/lib/social-presence/rest-zones";
import { getSocialHub } from "@/lib/social-presence/social-hubs";
import { pickSocialPrompt } from "@/lib/social-presence/social-prompts";
import {
  getPresenceState,
  getSessionStartedAt,
  otherAccountsForFingerprint,
  registerFingerprint,
  savePresenceState,
  touchSessionStart,
} from "@/lib/social-presence/store";
import {
  featuredTitlesForUser,
  recordTownReputation,
  resolveFeaturedPlayers,
} from "@/lib/social-presence/town-reputation";
import type {
  PresenceActionKind,
  PresenceInputSignal,
  PresencePlayerState,
  RestZoneKind,
  SocialPresenceSnapshot,
} from "@/lib/social-presence/types";

const ACTION_KINDS = new Set<PresenceActionKind>([
  "TOWN_VISIT",
  "MARKET_BROWSE",
  "NPC_TALK",
  "CHAT",
  "EMOTE",
  "PET_CARE",
  "HOME_VISIT",
  "HOME_LIKE",
  "FISH",
  "CAMPFIRE_REST",
  "PUBLIC_EVENT",
  "MUSIC_LISTEN",
  "TRADE",
  "HELP_NEWBIE",
  "FESTIVAL",
  "SIT",
  "WAVE",
  "DANCE",
  "GUESTBOOK",
  "COMMUNITY_EVENT",
  "READ_LORE",
  "GARDEN",
  "COOK",
  "CRAFT_SOCIAL",
  "PHOTO",
  "DECORATE",
  "WELCOME_NEWBIE",
  "GROUP_EMOTE",
  "PERFORMANCE",
  "MINIGAME",
  "INSTRUMENT",
  "DAILY_TASK",
]);

const INPUT_SIGNALS = new Set<PresenceInputSignal>([
  "MOVE",
  "CAMERA",
  "INTERACT",
  "CHAT",
  "EMOTE",
  "UI",
  "PET",
  "TRADE",
  "MUSIC",
  "HELP",
]);

function dayKey(now: number): string {
  return new Date(now).toISOString().slice(0, 10);
}

function hourKey(now: number): string {
  return new Date(now).toISOString().slice(0, 13);
}

function nearbyStub(locationId: string | null): number | null {
  if (!locationId) return null;
  const seed = [...locationId].reduce((a, c) => a + c.charCodeAt(0), 0);
  return 2 + (seed % 7);
}

function syncDerived(state: PresencePlayerState, now: number): PresencePlayerState {
  const activityScore = decayActivityScore(
    state.activityScore,
    state.lastMeaningfulAt,
    now,
  );
  const serverPresenceState = derivePresenceState({ state, now });
  const engagementTier = engagementTierFromState(serverPresenceState, activityScore);
  const level = presenceLevelFromXp(state.lifetimePresenceXp);
  return {
    ...state,
    activityScore,
    serverPresenceState,
    engagementTier,
    presenceLevel: level.id,
    communityTokenBalance: getCommunityTokenBalance(state.userId),
  };
}

export function isValidPresenceAction(kind: unknown): kind is PresenceActionKind {
  return typeof kind === "string" && ACTION_KINDS.has(kind as PresenceActionKind);
}

export function isValidPresenceSignal(signal: unknown): signal is PresenceInputSignal {
  return typeof signal === "string" && INPUT_SIGNALS.has(signal as PresenceInputSignal);
}

export function recordPresenceHeartbeat(params: {
  userId: string;
  signals?: PresenceInputSignal[];
  regionSlug?: string | null;
  locationId?: string | null;
  restZoneKind?: RestZoneKind | null;
  fingerprintHash?: string | null;
  genuineDeltaMs?: number;
  now?: number;
}): { ok: true; state: PresencePlayerState; antiAfk: ReturnType<typeof evaluateAntiAfk> } {
  const now = params.now ?? Date.now();
  touchSessionStart(params.userId, now);
  let state = getPresenceState(params.userId);

  if (params.fingerprintHash) {
    state = savePresenceState({
      ...state,
      fingerprintHash: params.fingerprintHash,
    });
    registerFingerprint(params.userId, params.fingerprintHash);
    state = getPresenceState(params.userId);
  }

  let inputs = state.inputs;
  for (const signal of params.signals ?? []) {
    if (isValidPresenceSignal(signal)) {
      inputs = appendInputSignal(inputs, signal, now);
    }
  }

  const hub = params.locationId
    ? getSocialHub(params.locationId) ?? getRestHub(params.locationId)
    : undefined;
  const restKind =
    params.restZoneKind ??
    (hub && "hubType" in hub ? hub.hubType : hub && "kind" in hub ? hub.kind : null) ??
    state.restZoneKind;
  const inRest = Boolean(restKind);

  if (inRest && !state.inRestZone) {
    trackAnalytics("presence_rest_enter", {
      userId: params.userId,
      locationId: params.locationId ?? "",
    });
  }

  const genuine = Math.max(0, params.genuineDeltaMs ?? 0);
  state = savePresenceState(
    syncDerived(
      {
        ...state,
        inputs,
        currentRegionSlug: params.regionSlug ?? state.currentRegionSlug,
        currentLocationId: params.locationId ?? state.currentLocationId,
        currentHubId: params.locationId ?? state.currentHubId,
        inRestZone: inRest,
        restZoneKind: restKind,
        genuineActiveMs: state.genuineActiveMs + genuine,
        qualifiedActiveMs:
          state.qualifiedActiveMs +
          (evaluateAntiAfk({ ...state, inputs }, now).ok ? genuine : 0),
      },
      now,
    ),
  );

  const antiAfk = evaluateAntiAfk(state, now);
  return { ok: true, state, antiAfk };
}

export function recordPresenceAction(params: {
  userId: string;
  kind: PresenceActionKind;
  locationId?: string;
  regionSlug?: string;
  restZoneKind?: RestZoneKind | null;
  detail?: string;
  nearbyEstimate?: number | null;
  now?: number;
}): {
  ok: boolean;
  error?: string;
  message: string;
  xp?: number;
  state?: PresencePlayerState;
  achievementsUnlocked?: string[];
} {
  if (
    !isFeatureEnabled("SOCIAL_PRESENCE_ENABLED") &&
    !isFeatureEnabled("LIVING_SERVER_POPULATION_ENABLED")
  ) {
    return { ok: false, error: "feature_disabled", message: "Social presence is disabled." };
  }
  if (!isValidPresenceAction(params.kind)) {
    return { ok: false, error: "invalid_kind", message: "Unknown presence action." };
  }

  const now = params.now ?? Date.now();
  touchSessionStart(params.userId, now);
  let state = getPresenceState(params.userId);

  if (
    state.socialRewardRestrictedUntil != null &&
    now < state.socialRewardRestrictedUntil
  ) {
    return {
      ok: false,
      error: "restricted",
      message: "Social rewards temporarily restricted pending review.",
      state,
    };
  }

  const antiAfk = evaluateAntiAfk(state, now);
  if (!antiAfk.ok) {
    trackAnalytics("presence_afk_block", {
      userId: params.userId,
      reason: antiAfk.reason,
    });
    if (antiAfk.reason === "scripted_repetition") {
      trackAnalytics("presence_scripted_block", { userId: params.userId });
    }
    state = savePresenceState(syncDerived(state, now));
    return { ok: false, error: antiAfk.reason, message: antiAfk.message, state };
  }

  const risk = analyzeRisk({
    actions: state.actions,
    inputs: state.inputs,
    sessionStartedAt: getSessionStartedAt(params.userId),
    now,
  });
  const riskMult = rewardMultiplierForRisk(risk.riskScore);

  const hub =
    (params.locationId ? getSocialHub(params.locationId) : undefined) ??
    (params.locationId ? getRestHub(params.locationId) : undefined);
  const restKind =
    params.restZoneKind ??
    (hub && "hubType" in hub ? hub.hubType : hub && "kind" in hub ? hub.kind : null) ??
    (state.inRestZone ? state.restZoneKind : null);

  const derivedPreview = syncDerived(state, now);
  const allowed = rewardsAllowedForTier(derivedPreview.engagementTier);
  // First action of a session can still earn if signals are present (tier may be low until score rises)
  const canEarnXp =
    allowed.presenceXp ||
    derivedPreview.engagementTier >= 1 ||
    evaluateAntiAfk(state, now).ok;

  if (!canEarnXp || riskMult === 0) {
    state = savePresenceState(
      syncDerived({ ...state, riskScore: risk.riskScore }, now),
    );
    return {
      ok: false,
      error: "tier_or_risk",
      message: "Engagement too low or risk score blocked rewards.",
      state,
    };
  }

  const nearby =
    params.nearbyEstimate ?? nearbyStub(params.locationId ?? state.currentLocationId);
  const others = otherAccountsForFingerprint(state.fingerprintHash, params.userId);
  const mult = multiAccountXpMultiplier(state.fingerprintHash, others) * riskMult;
  const hubMult =
    hub && "presenceMultiplier" in hub ? (hub.presenceMultiplier as number) : 1;

  const award = computePresenceXpAward({
    kind: params.kind,
    restZoneKind: restKind,
    nearbyEstimate: nearby,
    multiAccountMultiplier: mult,
  });
  const eventBonus = eventBonusForLocation(
    params.locationId ?? state.currentLocationId,
    now,
  );

  const category = categoryForAction(params.kind);
  const catBump = bumpCategoryCount(
    state.categoryCounts,
    category,
    state.categoryWindowStartedAt,
    now,
  );
  const diminished = applyDiminishing(
    Math.floor((award.total + eventBonus) * hubMult),
    category,
    catBump.counts,
  );

  // Hour / day caps
  const hk = hourKey(now);
  const dk = dayKey(now);
  let hourXp = state.presenceXpHourKey === hk ? state.presenceXpEarnedHour : 0;
  let dayXp = state.presenceXpDayKey === dk ? state.presenceXpEarnedDay : 0;
  let totalXp = diminished.xp;
  if (hourXp + totalXp > PRESENCE_XP_HOUR_CAP) {
    totalXp = Math.max(0, PRESENCE_XP_HOUR_CAP - hourXp);
  }
  if (dayXp + totalXp > PRESENCE_XP_DAY_CAP) {
    totalXp = Math.max(0, PRESENCE_XP_DAY_CAP - dayXp);
  }
  if (totalXp <= 0) {
    return {
      ok: false,
      error: "cap",
      message: "Presence XP hourly/daily cap reached.",
      state,
    };
  }

  const action = {
    id: `pxp_${now}_${Math.random().toString(36).slice(2, 7)}`,
    kind: params.kind,
    at: now,
    locationId: params.locationId ?? state.currentLocationId ?? undefined,
    restZoneKind: restKind ?? undefined,
    detail: params.detail,
    xpAwarded: totalXp,
  };

  const inferred = statusFromAction(params.kind);
  const activityScore = applyActivityScoreGain(state.activityScore, params.kind);

  let taskDayKey = state.dailyTaskDayKey === dk ? state.dailyTaskDayKey : dk;
  let taskProgress =
    state.dailyTaskDayKey === dk ? state.dailyTaskProgress : {};
  let tasksClaimed = state.dailyTaskDayKey === dk ? state.dailyTasksClaimed : [];
  taskProgress = progressTask(taskProgress, params.kind, tasksForDay(now));

  state = savePresenceState(
    syncDerived(
      {
        ...state,
        presenceXp: state.presenceXp + totalXp,
        lifetimePresenceXp: state.lifetimePresenceXp + totalXp,
        activityScore,
        actions: trimActionLog([...state.actions, action]),
        lastMeaningfulAt: now,
        currentLocationId: params.locationId ?? state.currentLocationId,
        currentHubId: params.locationId ?? state.currentHubId,
        currentRegionSlug:
          params.regionSlug ??
          (hub && "regionSlug" in hub ? hub.regionSlug : undefined) ??
          state.currentRegionSlug,
        inRestZone: Boolean(restKind),
        restZoneKind: restKind,
        status: inferred ?? state.status,
        statusSetAt: inferred ? now : state.statusSetAt,
        categoryCounts: catBump.counts,
        categoryWindowStartedAt: catBump.windowStartedAt,
        presenceXpEarnedHour: hourXp + totalXp,
        presenceXpHourKey: hk,
        presenceXpEarnedDay: dayXp + totalXp,
        presenceXpDayKey: dk,
        riskScore: risk.riskScore,
        socialRewardRestrictedUntil: risk.restrictRewards
          ? now + 30 * 60_000
          : state.socialRewardRestrictedUntil,
        dailyTaskDayKey: taskDayKey,
        dailyTaskProgress: taskProgress,
        dailyTasksClaimed: tasksClaimed,
      },
      now,
    ),
  );

  if (params.locationId || state.currentLocationId) {
    bumpLocationActivity(params.locationId ?? state.currentLocationId!, 1);
  }

  const region =
    params.regionSlug ??
    (hub && "regionSlug" in hub ? hub.regionSlug : undefined) ??
    state.currentRegionSlug ??
    "riftwild-commons";
  recordTownReputation({
    userId: params.userId,
    regionSlug: region,
    kind: params.kind,
    presenceXp: totalXp,
    now,
  });

  const featured = featuredTitlesForUser(params.userId, now);
  if (featured.length) {
    const newly = featured.filter((t) => !state.featuredTitles.includes(t));
    state = savePresenceState({
      ...state,
      featuredTitles: [...new Set([...state.featuredTitles, ...featured])],
      activeFeaturedTitle: featured[0] ?? state.activeFeaturedTitle,
    });
    for (const title of newly) {
      trackAnalytics("presence_featured_award", {
        userId: params.userId,
        title,
        regionSlug: region,
      });
    }
  }

  const newAchievements = evaluateNewAchievements(state);
  if (newAchievements.length) {
    state = savePresenceState({
      ...state,
      achievementsUnlocked: [...state.achievementsUnlocked, ...newAchievements],
    });
    for (const id of newAchievements) {
      trackAnalytics("achievement_unlock", {
        userId: params.userId,
        achievementId: id,
      });
    }
  }

  // Social streak day bump
  if (state.lastSocialStreakDayKey !== dk) {
    const yesterday = dayKey(now - 86_400_000);
    const streak =
      state.lastSocialStreakDayKey === yesterday ? state.socialStreakDays + 1 : 1;
    state = savePresenceState({
      ...state,
      socialStreakDays: streak,
      lastSocialStreakDayKey: dk,
    });
  }

  trackAnalytics("presence_xp_award", {
    userId: params.userId,
    kind: params.kind,
    xp: totalXp,
    rest: Boolean(restKind),
    tier: state.engagementTier,
  });

  return {
    ok: true,
    message: `+${totalXp} Presence XP`,
    xp: totalXp,
    state,
    achievementsUnlocked: newAchievements,
  };
}

export function claimIdleParticipation(params: {
  userId: string;
  now?: number;
}): {
  ok: boolean;
  error?: string;
  message: string;
  claim?: ReturnType<typeof buildIdleClaim>;
  balance?: number;
  communityTokens?: number;
} {
  if (
    !isFeatureEnabled("SOCIAL_PRESENCE_ENABLED") &&
    !isFeatureEnabled("LIVING_SERVER_POPULATION_ENABLED")
  ) {
    return { ok: false, error: "feature_disabled", message: "Social presence is disabled." };
  }
  if (!isFeatureEnabled("SOCIAL_PRESENCE_IDLE_REWARDS_ENABLED")) {
    return {
      ok: false,
      error: "idle_disabled",
      message: "Idle participation rewards are disabled.",
    };
  }

  const now = params.now ?? Date.now();
  let state = getPresenceState(params.userId);
  state = savePresenceState(syncDerived(state, now));
  const antiAfk = evaluateAntiAfk(state, now);
  if (!antiAfk.ok) {
    return { ok: false, error: antiAfk.reason, message: antiAfk.message };
  }
  if (state.engagementTier < 2 && state.serverPresenceState === "AFK") {
    return {
      ok: false,
      error: "afk",
      message: "AFK players do not receive community participation rewards.",
    };
  }

  const gate = canClaimIdleParticipation(state, now);
  if (!gate.ok) {
    return {
      ok: false,
      error: gate.reason,
      message:
        gate.reason === "daily_cap"
          ? "Daily idle participation cap reached (Credits/cosmetics only — never SOL)."
          : "Keep engaging socially a bit longer before the next soft reward.",
    };
  }

  const claim = buildIdleClaim(state, 12, now);
  ensureStarterCredits(params.userId);
  const credited = creditCredits({
    userId: params.userId,
    amount: claim.credits,
    reason: "PRESENCE_IDLE",
    requestId: claim.id,
    metadata: {
      cosmeticStubId: claim.cosmeticStubId,
      windowMinutes: claim.windowMinutes,
      neverSol: true,
    },
  });

  if (!credited.ok) {
    return {
      ok: false,
      error: credited.error,
      message: credited.message,
      balance: credited.balance,
    };
  }

  let tokenGrant = 0;
  if (state.engagementTier >= 2) {
    const tok = creditCommunityTokens({
      userId: params.userId,
      amount: state.engagementTier >= 3 ? 3 : 1,
      reason: "idle_participation",
      requestId: `ct_${claim.id}`,
      now,
    });
    if (tok.ok) tokenGrant = tok.granted;
  }

  const key = dayKey(now);
  const claimsToday = state.idleClaimDayKey === key ? state.idleClaimsToday : 0;
  state = savePresenceState(
    syncDerived(
      {
        ...state,
        presenceXp: state.presenceXp + claim.presenceXp,
        lifetimePresenceXp: state.lifetimePresenceXp + claim.presenceXp,
        lastIdleClaimAt: now,
        idleClaimsToday: claimsToday + 1,
        idleClaimDayKey: key,
        genuineActiveMs: 0,
        communityTokensEarnedToday: tokensEarnedToday(params.userId, now),
        communityTokenDayKey: key,
      },
      now,
    ),
  );

  trackAnalytics("presence_idle_claim", {
    userId: params.userId,
    credits: claim.credits,
    cosmetic: claim.cosmeticStubId ?? "",
    tokens: tokenGrant,
  });

  return {
    ok: true,
    message:
      `Idle participation: +${claim.credits} Credits` +
      (tokenGrant ? ` · +${tokenGrant} Community Tokens` : "") +
      (claim.cosmeticStubId ? ` · ${claim.cosmeticStubId}` : "") +
      " (never SOL)",
    claim,
    balance: credited.balance,
    communityTokens: tokenGrant,
  };
}

export function claimDailyTask(params: {
  userId: string;
  taskId: string;
  now?: number;
}): {
  ok: boolean;
  message: string;
  task?: CommunityTaskDef;
  credits?: number;
  tokens?: number;
} {
  const now = params.now ?? Date.now();
  let state = getPresenceState(params.userId);
  const tasks = tasksForDay(now);
  const task = tasks.find((t) => t.id === params.taskId);
  if (!task) return { ok: false, message: "Unknown daily task." };

  const dk = dayKey(now);
  if (state.dailyTaskDayKey !== dk) {
    state = savePresenceState({
      ...state,
      dailyTaskDayKey: dk,
      dailyTaskProgress: {},
      dailyTasksClaimed: [],
    });
  }
  if (state.dailyTasksClaimed.includes(task.id)) {
    return { ok: false, message: "Already claimed." };
  }
  const progress = state.dailyTaskProgress[task.id] ?? 0;
  if (progress < task.requirement) {
    return {
      ok: false,
      message: `Progress ${progress}/${task.requirement}`,
    };
  }

  ensureStarterCredits(params.userId);
  creditCredits({
    userId: params.userId,
    amount: task.rewardCredits,
    reason: "PRESENCE_IDLE",
    requestId: `daily_task_${params.userId}_${dk}_${task.id}`,
    metadata: { taskId: task.id, neverSol: true },
  });
  creditCommunityTokens({
    userId: params.userId,
    amount: task.rewardTokens,
    reason: `daily_task:${task.id}`,
    requestId: `ct_daily_${params.userId}_${dk}_${task.id}`,
    now,
  });

  state = savePresenceState(
    syncDerived(
      {
        ...state,
        presenceXp: state.presenceXp + task.rewardPresenceXp,
        lifetimePresenceXp: state.lifetimePresenceXp + task.rewardPresenceXp,
        dailyTasksClaimed: [...state.dailyTasksClaimed, task.id],
      },
      now,
    ),
  );

  trackAnalytics("presence_daily_task_claim", {
    userId: params.userId,
    taskId: task.id,
  });

  return {
    ok: true,
    message: `Claimed ${task.title}`,
    task,
    credits: task.rewardCredits,
    tokens: task.rewardTokens,
  };
}

export function setPlayerSocialStatus(params: {
  userId: string;
  status: string;
  now?: number;
}): { ok: boolean; message: string; state?: PresencePlayerState } {
  if (!isValidPlayerSocialStatus(params.status)) {
    return { ok: false, message: "Invalid social status." };
  }
  const now = params.now ?? Date.now();
  const state = savePresenceState(
    syncDerived(
      {
        ...getPresenceState(params.userId),
        status: params.status,
        statusSetAt: now,
      },
      now,
    ),
  );
  trackAnalytics("presence_status_set", {
    userId: params.userId,
    status: params.status,
  });
  return { ok: true, message: `Status set to ${params.status}`, state };
}

export function toggleHelper(params: {
  userId: string;
  optIn: boolean;
  tutorialComplete?: boolean;
}) {
  const profile = setHelperOptIn(params);
  savePresenceState({
    ...getPresenceState(params.userId),
    helperOptIn: profile.optIn,
    helperEligible: profile.eligible,
  });
  return profile;
}

export function helpNewPlayer(params: {
  helperId: string;
  newcomerId: string;
  now?: number;
}) {
  const now = params.now ?? Date.now();
  recordPresenceHeartbeat({
    userId: params.helperId,
    signals: ["HELP", "INTERACT"],
    locationId: "commons-welcome",
    restZoneKind: "welcome_center",
    now,
  });
  const assist = recordHelperAssist({
    helperId: params.helperId,
    newcomerId: params.newcomerId,
    now,
  });
  if (!assist.ok) return assist;

  creditCommunityTokens({
    userId: params.helperId,
    amount: assist.tokensGranted,
    reason: "helper_assist",
    requestId: `helper_${params.helperId}_${params.newcomerId}_${dayKey(now)}_${assist.profile.helpsToday}`,
    now,
  });
  const action = recordPresenceAction({
    userId: params.helperId,
    kind: "WELCOME_NEWBIE",
    locationId: "commons-welcome",
    regionSlug: "riftwild-commons",
    now,
  });
  return { ...assist, action };
}

export function submitHomeVisit(params: {
  userId: string;
  homeId: string;
  liked?: boolean;
  rating?: number | null;
  guestbookNote?: string | null;
  now?: number;
}) {
  const now = params.now ?? Date.now();
  const state = getPresenceState(params.userId);
  if (!state.privacy.allowHomeVisits) {
    return {
      record: null,
      popularity: getHomePopularity(params.homeId),
      action: { ok: false, message: "Home visits disabled in privacy settings." },
    };
  }
  recordPresenceHeartbeat({
    userId: params.userId,
    signals: ["INTERACT", "UI"],
    now,
  });
  const record = recordHomeVisit({
    homeId: params.homeId,
    visitorId: params.userId,
    liked: params.liked,
    rating: params.rating,
    guestbookNote: params.guestbookNote,
    now,
  });
  const kind: PresenceActionKind = params.liked
    ? "HOME_LIKE"
    : params.guestbookNote
      ? "GUESTBOOK"
      : "HOME_VISIT";
  const action = recordPresenceAction({
    userId: params.userId,
    kind,
    locationId: "homestead-hearth",
    regionSlug: "riftwild-commons",
    detail: params.homeId,
    now,
  });
  if (params.liked) {
    trackAnalytics("presence_home_like", {
      userId: params.userId,
      homeId: params.homeId,
    });
  }
  return {
    record,
    popularity: getHomePopularity(params.homeId),
    action,
  };
}

export function getSocialPresenceSnapshot(params: {
  userId: string;
  now?: number;
}): SocialPresenceSnapshot {
  const now = params.now ?? Date.now();
  const enabled =
    isFeatureEnabled("SOCIAL_PRESENCE_ENABLED") ||
    isFeatureEnabled("LIVING_SERVER_POPULATION_ENABLED");
  let state = getPresenceState(params.userId);
  state = savePresenceState(syncDerived(state, now));
  const antiAfk = evaluateAntiAfk(state, now);
  const featured = resolveFeaturedPlayers(now);
  const gate = canClaimIdleParticipation(state, now);
  const level = presenceLevelFromXp(state.lifetimePresenceXp);
  const helper = getHelperProfile(params.userId);
  const tasks = tasksForDay(now);
  const dk = dayKey(now);
  const progress = state.dailyTaskDayKey === dk ? state.dailyTaskProgress : {};
  const claimed = state.dailyTaskDayKey === dk ? state.dailyTasksClaimed : [];

  return {
    enabled,
    presenceXp: state.presenceXp,
    lifetimePresenceXp: state.lifetimePresenceXp,
    presenceLevel: level.id,
    presenceLevelLabel: level.label,
    communityTokenBalance: getCommunityTokenBalance(params.userId),
    activityScore: state.activityScore,
    engagementTier: state.engagementTier,
    serverPresenceState: state.serverPresenceState,
    status: state.status,
    inRestZone: state.inRestZone,
    restZoneKind: state.restZoneKind,
    currentHubId: state.currentHubId,
    restBonusPercent: restBonusPercent(state.restZoneKind),
    densityBonusPercent: densityBonusPercent(nearbyStub(state.currentLocationId)),
    nearbyEstimate: nearbyStub(state.currentLocationId),
    antiAfk,
    nextIdleClaimInMs: gate.ok ? 0 : gate.nextInMs,
    caps: {
      presenceXpHour:
        state.presenceXpHourKey === hourKey(now) ? state.presenceXpEarnedHour : 0,
      presenceXpHourCap: PRESENCE_XP_HOUR_CAP,
      presenceXpDay:
        state.presenceXpDayKey === dk ? state.presenceXpEarnedDay : 0,
      presenceXpDayCap: PRESENCE_XP_DAY_CAP,
      communityTokensDay: tokensEarnedToday(params.userId, now),
      communityTokensDayCap: COMMUNITY_TOKENS_DAY_CAP,
    },
    popularLocations: listPopularLocations(),
    activeEvents: listActiveCommunityEvents(now),
    socialPrompt: pickSocialPrompt(params.userId, state.currentRegionSlug, now),
    featured,
    achievements: achievementView(state),
    populationByRegion: populationByRegion(),
    helperOptIn: helper.optIn,
    dailyTasks: tasks.map((t) => ({
      id: t.id,
      title: t.title,
      progress: progress[t.id] ?? 0,
      requirement: t.requirement,
      claimed: claimed.includes(t.id),
    })),
    note:
      "Living Server Population: Presence XP rewards meaningful social/rest activity only. AFK / open-browser idling earns nothing valuable. Never SOL.",
  };
}

export function getTownFeaturedSnapshot(now = Date.now()) {
  return {
    hourKey: String(Math.floor(now / (60 * 60_000))),
    featured: resolveFeaturedPlayers(now),
    popularHomes: listPopularHomes(),
    popularLocations: listPopularLocations(),
    activeEvents: listActiveCommunityEvents(now),
    recommendedHub: "commons-welcome",
  };
}

export function getAdminPopulationSnapshot() {
  return {
    featured: resolveFeaturedPlayers(),
    popularLocations: listPopularLocations(12),
    hubs: listPopularLocations(20),
    note: "In-memory demo aggregates — Prisma persistence prepared, not required for local play.",
  };
}
