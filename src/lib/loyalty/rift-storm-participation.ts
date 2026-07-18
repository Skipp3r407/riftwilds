/**
 * Temporary participation score — point values + diminishing returns.
 * Login alone never qualifies.
 */

import {
  STORM_ACTION_POINTS,
  STORM_DIMINISHING_AFTER,
  STORM_DIMINISHING_DECAY,
  STORM_QUALIFY_SCORE,
} from "@/lib/loyalty/rift-storm-config";
import type {
  StormIntensityTier,
  StormParticipantState,
  StormParticipationAction,
} from "@/lib/loyalty/rift-storm-types";
import { STORM_PARTICIPATION_ACTIONS } from "@/lib/loyalty/rift-storm-types";

export function isStormParticipationAction(v: unknown): v is StormParticipationAction {
  return typeof v === "string" && (STORM_PARTICIPATION_ACTIONS as readonly string[]).includes(v);
}

/** Points for the Nth occurrence of an action (1-indexed count after increment). */
export function pointsForActionOccurrence(
  action: StormParticipationAction,
  occurrenceIndex: number,
): number {
  const base = STORM_ACTION_POINTS[action] ?? 1;
  if (occurrenceIndex <= STORM_DIMINISHING_AFTER) return base;
  const extra = occurrenceIndex - STORM_DIMINISHING_AFTER;
  const scaled = base * Math.pow(STORM_DIMINISHING_DECAY, extra);
  return Math.max(0.25, Math.round(scaled * 100) / 100);
}

export function emptyParticipant(
  userId: string,
  stormId: string,
  accountAgeDays = 1,
): StormParticipantState {
  return {
    userId,
    stormId,
    score: 0,
    actionCounts: {},
    lastActionAt: null,
    qualified: false,
    personalContribution: 0,
    wavesRolled: [],
    recentRewardIds: [],
    accountAgeDays,
    fraudRisk: 0,
    disconnectGraceUntil: null,
    regionId: null,
    pityBonusApplied: false,
  };
}

export function applyParticipationAction(
  participant: StormParticipantState,
  action: StormParticipationAction,
  intensity: StormIntensityTier,
  now = Date.now(),
  opts?: { regionId?: string; fraudBump?: number },
): { participant: StormParticipantState; pointsGained: number } {
  const prevCount = participant.actionCounts[action] ?? 0;
  const nextCount = prevCount + 1;
  const pointsGained = pointsForActionOccurrence(action, nextCount);
  const score = Math.round((participant.score + pointsGained) * 100) / 100;
  const qualifyScore = STORM_QUALIFY_SCORE[intensity];
  const fraudRisk = Math.min(1, participant.fraudRisk + (opts?.fraudBump ?? 0));

  const next: StormParticipantState = {
    ...participant,
    score,
    personalContribution: score,
    actionCounts: { ...participant.actionCounts, [action]: nextCount },
    lastActionAt: new Date(now).toISOString(),
    qualified: score >= qualifyScore && fraudRisk < 0.85,
    fraudRisk,
    regionId: opts?.regionId ?? participant.regionId,
  };

  return { participant: next, pointsGained };
}

/** Login / idle is never a participation action. */
export function loginAloneQualifies(): false {
  return false;
}
