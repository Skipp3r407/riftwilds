/**
 * New-player Helper system — opt-in, capped rewards, no private data access.
 */

import { HELPER_REWARDS_DAY_CAP } from "@/lib/social-presence/config";

export type HelperProfile = {
  userId: string;
  optIn: boolean;
  eligible: boolean;
  badgeVisible: boolean;
  helpsToday: number;
  helpDayKey: string;
  tutorialComplete: boolean;
  standingOk: boolean;
  accountAgeDays: number;
};

type HelperStore = {
  helpers: Map<string, HelperProfile>;
};

const globalForHelper = globalThis as unknown as { __riftwildsHelpers?: HelperStore };

function store(): HelperStore {
  if (!globalForHelper.__riftwildsHelpers) {
    globalForHelper.__riftwildsHelpers = { helpers: new Map() };
  }
  return globalForHelper.__riftwildsHelpers;
}

export function resetHelpersForTests(): void {
  globalForHelper.__riftwildsHelpers = { helpers: new Map() };
}

function dayKey(now: number) {
  return new Date(now).toISOString().slice(0, 10);
}

export function getHelperProfile(userId: string): HelperProfile {
  const existing = store().helpers.get(userId);
  if (existing) return existing;
  const created: HelperProfile = {
    userId,
    optIn: false,
    eligible: false,
    badgeVisible: false,
    helpsToday: 0,
    helpDayKey: "",
    tutorialComplete: false,
    standingOk: true,
    accountAgeDays: 14,
  };
  store().helpers.set(userId, created);
  return created;
}

export function evaluateHelperEligibility(profile: HelperProfile): boolean {
  return (
    profile.standingOk &&
    profile.tutorialComplete &&
    profile.accountAgeDays >= 7 &&
    profile.optIn
  );
}

export function setHelperOptIn(params: {
  userId: string;
  optIn: boolean;
  tutorialComplete?: boolean;
}): HelperProfile {
  const prev = getHelperProfile(params.userId);
  const next: HelperProfile = {
    ...prev,
    optIn: params.optIn,
    tutorialComplete: params.tutorialComplete ?? prev.tutorialComplete,
    badgeVisible: params.optIn,
  };
  next.eligible = evaluateHelperEligibility(next);
  store().helpers.set(params.userId, next);
  return next;
}

export function recordHelperAssist(params: {
  helperId: string;
  newcomerId: string;
  now?: number;
}):
  | { ok: true; tokensGranted: number; profile: HelperProfile }
  | { ok: false; error: string; message: string } {
  const now = params.now ?? Date.now();
  if (params.helperId === params.newcomerId) {
    return { ok: false, error: "self", message: "Cannot help yourself." };
  }
  const profile = getHelperProfile(params.helperId);
  if (!profile.eligible) {
    return { ok: false, error: "ineligible", message: "Helper role not active." };
  }
  const dk = dayKey(now);
  const helps = profile.helpDayKey === dk ? profile.helpsToday : 0;
  if (helps >= HELPER_REWARDS_DAY_CAP) {
    return {
      ok: false,
      error: "cap",
      message: "Helper reward daily cap reached.",
    };
  }
  const next = {
    ...profile,
    helpsToday: helps + 1,
    helpDayKey: dk,
  };
  store().helpers.set(params.helperId, next);
  return { ok: true, tokensGranted: 2, profile: next };
}

export const HELPER_RULES = [
  "Never request passwords or wallet seeds.",
  "Never control another player's account.",
  "Never handle financial transactions.",
  "Never promise official support outcomes.",
  "Use approved tutorial links only.",
  "Rewards are capped Community Tokens / cosmetics — never SOL.",
] as const;
