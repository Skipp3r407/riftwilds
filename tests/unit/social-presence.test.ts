import { beforeEach, describe, expect, it } from "vitest";
import { resetAnalyticsForTests } from "@/lib/analytics/events";
import { getCreditBalance, resetCreditLedgerForTests } from "@/lib/credits/ledger";
import {
  evaluateAntiAfk,
  appendInputSignal,
  detectScriptedRepetition,
  multiAccountXpMultiplier,
} from "@/lib/social-presence/anti-afk";
import { analyzeRisk, rewardMultiplierForRisk } from "@/lib/social-presence/anti-bot";
import { computePresenceXpAward, densityBonusPercent } from "@/lib/social-presence/presence-xp";
import { restBonusPercent, getRestHub, isLogoutFriendlyRest } from "@/lib/social-presence/rest-zones";
import {
  claimDailyTask,
  claimIdleParticipation,
  creditCommunityTokens,
  derivePresenceState,
  getCommunityTokenBalance,
  getSocialPresenceSnapshot,
  getTownFeaturedSnapshot,
  listSocialHubs,
  presenceLevelFromXp,
  purchaseCommunityShopItem,
  recommendHubForNewPlayer,
  recordPresenceAction,
  recordPresenceHeartbeat,
  resetCommunityTokensForTests,
  resetHelpersForTests,
  resetSocialPresenceStoreForTests,
  setHelperOptIn,
  setPlayerSocialStatus,
  submitHomeVisit,
  toggleHelper,
  categoryMultiplier,
} from "@/lib/social-presence";
import { resetHomeVisitsForTests } from "@/lib/social-presence/home-visits";
import { resetPopularLocationsForTests } from "@/lib/social-presence/popular-locations";
import { resetTownReputationForTests } from "@/lib/social-presence/town-reputation";
import { getPresenceState, savePresenceState } from "@/lib/social-presence/store";
import { pickRiftlingRestBehavior } from "@/game/social-presence/riftling-rest-behaviors";
import { pickRiftlingSocialBehavior } from "@/game/social-presence/riftling-socialization";
import { presenceKindFromEmoteKey } from "@/game/social-presence/player-activities";
import { crowdLodForDistance } from "@/game/social-presence/crowd-lod";
import { IDLE_CLAIM_MIN_MS } from "@/lib/social-presence/config";

describe("presence XP math", () => {
  it("applies rest and density bonuses with a combined cap", () => {
    const award = computePresenceXpAward({
      kind: "HELP_NEWBIE",
      restZoneKind: "festival_grounds",
      nearbyEstimate: 25,
    });
    expect(award.base).toBe(10);
    expect(award.total).toBeGreaterThan(award.base);
    expect(award.total).toBeLessThanOrEqual(14); // 40% cap on 10
    expect(densityBonusPercent(25)).toBe(20);
    expect(restBonusPercent("festival_grounds")).toBe(22);
  });

  it("reduces XP under multi-account fingerprint share", () => {
    expect(multiAccountXpMultiplier("fp1", 0)).toBe(1);
    expect(multiAccountXpMultiplier("fp1", 3)).toBeLessThan(1);
  });
});

describe("rest hubs", () => {
  it("catalog includes logout-friendly and safe_zone reuse", () => {
    const plaza = getRestHub("commons-plaza");
    expect(plaza?.kind).toBe("town_plaza");
    expect(isLogoutFriendlyRest("logout_rest")).toBe(true);
    expect(isLogoutFriendlyRest("safe_zone")).toBe(true);
    expect(isLogoutFriendlyRest("market_square")).toBe(false);
  });
});

describe("anti-AFK", () => {
  beforeEach(() => {
    resetSocialPresenceStoreForTests();
  });

  it("blocks Presence XP with no engagement signals", () => {
    const state = getPresenceState("afk-user");
    const verdict = evaluateAntiAfk(state, Date.now());
    expect(verdict.ok).toBe(false);
    expect(verdict.reason).toBe("no_recent_signal");
  });

  it("allows XP after move/emote signals and meaningful action", () => {
    const now = Date.now();
    recordPresenceHeartbeat({
      userId: "keeper-social",
      signals: ["MOVE", "EMOTE"],
      locationId: "commons-plaza",
      restZoneKind: "town_plaza",
      genuineDeltaMs: 8_000,
      now,
    });
    const result = recordPresenceAction({
      userId: "keeper-social",
      kind: "WAVE",
      locationId: "commons-plaza",
      regionSlug: "riftwild-commons",
      now: now + 100,
    });
    expect(result.ok).toBe(true);
    expect(result.xp).toBeGreaterThan(0);
  });

  it("detects scripted repetition", () => {
    const now = Date.now();
    const actions = Array.from({ length: 14 }, (_, i) => ({
      id: `a${i}`,
      kind: "WAVE" as const,
      at: now - i * 1000,
      xpAwarded: 1,
    }));
    expect(detectScriptedRepetition(actions, now)).toBe(true);
  });

  it("motionless AFK earns nothing meaningful", () => {
    const now = Date.now();
    recordPresenceHeartbeat({
      userId: "statue",
      signals: ["MOVE"],
      now: now - 200_000,
    });
    // Stale signal only — no fresh engagement
    let state = getPresenceState("statue");
    state = savePresenceState({
      ...state,
      inputs: appendInputSignal([], "MOVE", now - 200_000),
      lastMeaningfulAt: now - 200_000,
    });
    const verdict = evaluateAntiAfk(state, now);
    expect(verdict.ok).toBe(false);
  });
});

describe("idle participation & credits", () => {
  beforeEach(() => {
    resetSocialPresenceStoreForTests();
    resetCreditLedgerForTests();
    resetAnalyticsForTests();
  });

  it("grants tiny Credits never labeled as SOL after genuine activity", () => {
    const now = Date.now();
    const userId = "idle-claimer";
    recordPresenceHeartbeat({
      userId,
      signals: ["MOVE", "CHAT", "UI"],
      genuineDeltaMs: IDLE_CLAIM_MIN_MS,
      now,
    });
    // Ensure genuineActiveMs is enough
    let state = getPresenceState(userId);
    state = savePresenceState({
      ...state,
      genuineActiveMs: IDLE_CLAIM_MIN_MS,
      inputs: appendInputSignal(state.inputs, "MOVE", now),
    });

    const claim = claimIdleParticipation({ userId, now: now + 1000 });
    expect(claim.ok).toBe(true);
    expect(claim.claim?.credits).toBeGreaterThanOrEqual(5);
    expect(claim.claim?.credits).toBeLessThanOrEqual(18);
    expect(claim.message?.toLowerCase()).toContain("never sol");
    expect(getCreditBalance(userId)).toBeGreaterThanOrEqual(claim.claim!.credits);
  });

  it("denies idle claim when AFK", () => {
    const r = claimIdleParticipation({ userId: "afk-idle", now: Date.now() });
    expect(r.ok).toBe(false);
  });
});

describe("town featured titles", () => {
  beforeEach(() => {
    resetSocialPresenceStoreForTests();
    resetTownReputationForTests();
    resetPopularLocationsForTests();
    resetAnalyticsForTests();
  });

  it("awards cosmetic featured titles to active social-hub players", () => {
    const now = Date.now();
    const users = [
      { id: "hero-a", kinds: ["HELP_NEWBIE", "HELP_NEWBIE", "PUBLIC_EVENT", "CHAT"] as const },
      { id: "merchant-b", kinds: ["TRADE", "MARKET_BROWSE", "TRADE", "MARKET_BROWSE"] as const },
      { id: "fav-c", kinds: ["WAVE", "DANCE", "HOME_LIKE", "GUESTBOOK"] as const },
    ];

    for (const u of users) {
      recordPresenceHeartbeat({
        userId: u.id,
        signals: ["MOVE", "INTERACT", "EMOTE"],
        locationId: "commons-plaza",
        now,
      });
      for (const kind of u.kinds) {
        recordPresenceAction({
          userId: u.id,
          kind,
          locationId: "commons-plaza",
          regionSlug: "riftwild-commons",
          now: now + 50,
        });
      }
    }

    const snap = getTownFeaturedSnapshot(now + 100);
    expect(snap.featured.length).toBeGreaterThan(0);
    const titles = snap.featured.map((f) => f.title);
    expect(titles.some((t) => t === "Town Hero" || t === "Master Merchant" || t === "Community Favorite")).toBe(
      true,
    );
    // Cosmetic only — no combat fields on slots
    for (const f of snap.featured) {
      expect(f).toHaveProperty("title");
      expect(f).toHaveProperty("displayName");
      expect(f).not.toHaveProperty("combatPower");
    }
  });
});

describe("home visits & status", () => {
  beforeEach(() => {
    resetSocialPresenceStoreForTests();
    resetHomeVisitsForTests();
  });

  it("records likes/guestbook and popularity", () => {
    const now = Date.now();
    recordPresenceHeartbeat({
      userId: "visitor",
      signals: ["INTERACT"],
      now,
    });
    const result = submitHomeVisit({
      userId: "visitor",
      homeId: "home-mira",
      liked: true,
      rating: 5,
      guestbookNote: "Cozy hearth!",
      now: now + 10,
    });
    expect(result.popularity.likes).toBeGreaterThanOrEqual(1);
    expect(result.action.ok).toBe(true);
  });

  it("sets optional player social status", () => {
    const r = setPlayerSocialStatus({ userId: "u1", status: "Trading" });
    expect(r.ok).toBe(true);
    expect(getPresenceState("u1").status).toBe("Trading");
  });
});

describe("snapshot & stubs", () => {
  beforeEach(() => {
    resetSocialPresenceStoreForTests();
    resetTownReputationForTests();
    resetPopularLocationsForTests();
  });

  it("exposes playable snapshot fields", () => {
    const snap = getSocialPresenceSnapshot({ userId: "snap-user" });
    expect(snap.enabled).toBe(true);
    expect(snap.popularLocations.length).toBeGreaterThan(0);
    expect(snap.activeEvents.length).toBeGreaterThan(0);
    expect(snap.socialPrompt?.text).toBeTruthy();
    expect(snap.note.toLowerCase()).toContain("never sol");
  });

  it("riftling rest + emote hooks + crowd LOD stubs work", () => {
    expect(pickRiftlingRestBehavior({ restZoneKind: "campfire", nearbyPlayers: 3, ownerStatus: "Resting" })).toBeTruthy();
    expect(presenceKindFromEmoteKey("wave")).toBe("WAVE");
    expect(crowdLodForDistance(40, 12).tier).toBe("hero");
    expect(crowdLodForDistance(1000, 50).tier).toBe("billboard");
  });

  it("exposes engagement tier, level, caps, and daily tasks on snapshot", () => {
    const now = Date.now();
    recordPresenceHeartbeat({
      userId: "tier-user",
      signals: ["MOVE", "EMOTE"],
      locationId: "commons-plaza",
      now,
    });
    recordPresenceAction({
      userId: "tier-user",
      kind: "WAVE",
      locationId: "commons-plaza",
      now: now + 10,
    });
    const snap = getSocialPresenceSnapshot({ userId: "tier-user", now: now + 20 });
    expect(snap.presenceLevelLabel).toBeTruthy();
    expect(snap.caps.presenceXpHourCap).toBeGreaterThan(0);
    expect(snap.dailyTasks.length).toBeGreaterThan(0);
    expect(snap.serverPresenceState).toBeTruthy();
  });
});

describe("presence state machine & levels", () => {
  beforeEach(() => {
    resetSocialPresenceStoreForTests();
  });

  it("marks AFK when no activity for a long time", () => {
    const state = getPresenceState("afk-state");
    const derived = derivePresenceState({
      state: {
        ...state,
        lastMeaningfulAt: Date.now() - 20 * 60_000,
        inputs: [],
        actions: [],
      },
      now: Date.now(),
    });
    expect(derived).toBe("AFK");
  });

  it("maps lifetime XP to presence levels", () => {
    expect(presenceLevelFromXp(0).id).toBe("wanderer");
    expect(presenceLevelFromXp(300).id).toBe("familiar_face");
    expect(presenceLevelFromXp(13000).id).toBe("riftwilds_luminary");
  });
});

describe("community tokens & diminishing returns", () => {
  beforeEach(() => {
    resetCommunityTokensForTests();
  });

  it("credits capped Community Tokens and sells cosmetic shop items", () => {
    const r = creditCommunityTokens({
      userId: "ct-user",
      amount: 30,
      reason: "test",
      requestId: "ct-test-1",
    });
    expect(r.ok).toBe(true);
    expect(getCommunityTokenBalance("ct-user")).toBe(30);
    const buy = purchaseCommunityShopItem({ userId: "ct-user", itemId: "ct-emote-cheer" });
    expect(buy.ok).toBe(true);
    if (buy.ok) expect(buy.item.cosmeticOnly).toBe(true);
  });

  it("applies diminishing returns for repeated category actions", () => {
    expect(categoryMultiplier(1)).toBe(1);
    expect(categoryMultiplier(5)).toBeLessThan(1);
    expect(categoryMultiplier(15)).toBeLessThan(0.5);
  });
});

describe("helpers, hubs, riftling social, risk", () => {
  beforeEach(() => {
    resetHelpersForTests();
    resetSocialPresenceStoreForTests();
  });

  it("requires tutorial + age for helper eligibility", () => {
    const profile = setHelperOptIn({
      userId: "helper-1",
      optIn: true,
      tutorialComplete: true,
    });
    expect(profile.eligible).toBe(true);
    const toggled = toggleHelper({ userId: "helper-1", optIn: false });
    expect(toggled.optIn).toBe(false);
  });

  it("recommends welcome center hub for new players", () => {
    const hub = recommendHubForNewPlayer();
    expect(hub.welcomeNewPlayers).toBe(true);
    expect(listSocialHubs().length).toBeGreaterThan(10);
  });

  it("picks privacy-aware riftling social behaviors", () => {
    expect(
      pickRiftlingSocialBehavior({
        trait: "Playful",
        allowSocial: true,
        nearbyRiftlings: 2,
        hubKind: "riftling_park",
      }),
    ).toBeTruthy();
  });

  it("reduces rewards under high risk score", () => {
    expect(rewardMultiplierForRisk(10)).toBe(1);
    expect(rewardMultiplierForRisk(55)).toBeLessThan(1);
    expect(rewardMultiplierForRisk(90)).toBe(0);
    const risk = analyzeRisk({
      actions: Array.from({ length: 14 }, (_, i) => ({
        id: `r${i}`,
        kind: "WAVE" as const,
        at: Date.now() - i * 1000,
        xpAwarded: 1,
      })),
      inputs: [],
      sessionStartedAt: Date.now() - 20 * 3_600_000,
    });
    expect(risk.riskScore).toBeGreaterThan(0);
  });

  it("claims daily task after progress", () => {
    const now = Date.now();
    const userId = "task-user";
    recordPresenceHeartbeat({
      userId,
      signals: ["MOVE", "EMOTE"],
      now,
    });
    for (let i = 0; i < 4; i++) {
      recordPresenceAction({
        userId,
        kind: "WAVE",
        locationId: "commons-plaza",
        now: now + i * 10,
      });
    }
    const snap = getSocialPresenceSnapshot({ userId, now: now + 100 });
    const waveTask = snap.dailyTasks.find((t) => t.id === "daily-wave");
    if (waveTask && waveTask.progress >= waveTask.requirement) {
      const claim = claimDailyTask({ userId, taskId: "daily-wave", now: now + 200 });
      expect(claim.ok).toBe(true);
      expect(claim.message?.toLowerCase()).not.toContain("sol reward");
    }
  });
});
