/**
 * Participation scoring + anti-AFK for Dynamic World Events.
 * Reuses presence-style engagement signals — motionless standing earns nothing.
 */

import {
  WORLD_EVENT_ACTION_POINTS,
  WORLD_EVENT_DIMINISHING_AFTER,
  WORLD_EVENT_DIMINISHING_DECAY,
  WORLD_EVENT_MAX_INPUT_LOG,
  WORLD_EVENT_MOTIONLESS_BLOCK_MS,
  WORLD_EVENT_SIGNAL_WINDOW_MS,
} from "@/lib/world-events/config";
import type {
  WorldEventInputSignal,
  WorldEventParticipant,
  WorldEventParticipationAction,
} from "@/lib/world-events/types";

export const WORLD_EVENT_PARTICIPATION_ACTIONS: WorldEventParticipationAction[] = [
  "ARRIVE",
  "DEFEND",
  "RESCUE",
  "SCOUT",
  "REPAIR",
  "ESCORT",
  "GATHER_AID",
  "NPC_HELP",
  "PHOTO",
  "BOSS_HIT",
  "TREASURE_CLAIM",
];

export function isWorldEventParticipationAction(
  v: unknown,
): v is WorldEventParticipationAction {
  return (
    typeof v === "string" &&
    (WORLD_EVENT_PARTICIPATION_ACTIONS as readonly string[]).includes(v)
  );
}

export function emptyWorldEventParticipant(
  userId: string,
  eventInstanceId: string,
): WorldEventParticipant {
  return {
    userId,
    eventInstanceId,
    score: 0,
    actionCounts: {},
    lastActionAt: null,
    lastMeaningfulAt: null,
    inputs: [],
    qualified: false,
    creditsGranted: 0,
    fraudRisk: 0,
    regionSlug: null,
  };
}

export function appendWorldEventSignals(
  participant: WorldEventParticipant,
  signals: WorldEventInputSignal[],
  now = Date.now(),
): WorldEventParticipant {
  const inputs = [...participant.inputs];
  for (const signal of signals) {
    inputs.push({ signal, at: now });
  }
  const trimmed =
    inputs.length > WORLD_EVENT_MAX_INPUT_LOG
      ? inputs.slice(inputs.length - WORLD_EVENT_MAX_INPUT_LOG)
      : inputs;
  const meaningful = signals.some((s) =>
    ["MOVE", "INTERACT", "CHAT", "EMOTE", "PET", "COMBAT"].includes(s),
  );
  return {
    ...participant,
    inputs: trimmed,
    lastMeaningfulAt: meaningful ? now : participant.lastMeaningfulAt,
  };
}

export type WorldEventAntiAfkVerdict = {
  ok: boolean;
  reason: "ok" | "no_recent_signal" | "motionless" | "scripted_spam";
  message: string;
};

export function evaluateWorldEventAntiAfk(
  participant: WorldEventParticipant,
  now = Date.now(),
): WorldEventAntiAfkVerdict {
  const last = participant.inputs[participant.inputs.length - 1];
  if (!last || now - last.at > WORLD_EVENT_SIGNAL_WINDOW_MS) {
    return {
      ok: false,
      reason: "no_recent_signal",
      message: "Anti-AFK: move, interact, or fight near the event to earn participation.",
    };
  }

  const engaged = participant.inputs.some(
    (i) =>
      now - i.at <= WORLD_EVENT_SIGNAL_WINDOW_MS &&
      (i.signal === "MOVE" ||
        i.signal === "INTERACT" ||
        i.signal === "CHAT" ||
        i.signal === "EMOTE" ||
        i.signal === "PET" ||
        i.signal === "COMBAT"),
  );
  if (!engaged) {
    return {
      ok: false,
      reason: "motionless",
      message: "Anti-AFK: standing still earns nothing — participate in the event.",
    };
  }

  if (
    participant.lastMeaningfulAt != null &&
    now - participant.lastMeaningfulAt > WORLD_EVENT_MOTIONLESS_BLOCK_MS &&
    !participant.inputs.some(
      (i) => now - i.at <= WORLD_EVENT_SIGNAL_WINDOW_MS && i.signal === "MOVE",
    )
  ) {
    return {
      ok: false,
      reason: "motionless",
      message: "Anti-AFK: you have been motionless too long for event scoring.",
    };
  }

  const recentActions = Object.values(participant.actionCounts).reduce((a, b) => a + (b ?? 0), 0);
  if (recentActions > 40 && participant.fraudRisk > 0.7) {
    return {
      ok: false,
      reason: "scripted_spam",
      message: "Anti-AFK: unusual action spam — participation paused.",
    };
  }

  return { ok: true, reason: "ok", message: "Engaged." };
}

export function pointsForWorldEventAction(
  action: WorldEventParticipationAction,
  occurrenceIndex: number,
): number {
  const base = WORLD_EVENT_ACTION_POINTS[action] ?? 1;
  if (occurrenceIndex <= WORLD_EVENT_DIMINISHING_AFTER) return base;
  const extra = occurrenceIndex - WORLD_EVENT_DIMINISHING_AFTER;
  const scaled = base * Math.pow(WORLD_EVENT_DIMINISHING_DECAY, extra);
  return Math.max(0.25, Math.round(scaled * 100) / 100);
}

/** Login / idle alone never qualifies. */
export function idleAloneQualifiesForWorldEvent(): false {
  return false;
}

export function applyWorldEventParticipation(
  participant: WorldEventParticipant,
  action: WorldEventParticipationAction,
  qualifyScore: number,
  now = Date.now(),
  opts?: { regionSlug?: string; fraudBump?: number },
): { participant: WorldEventParticipant; pointsGained: number } {
  const prevCount = participant.actionCounts[action] ?? 0;
  const nextCount = prevCount + 1;
  const pointsGained = pointsForWorldEventAction(action, nextCount);
  const score = Math.round((participant.score + pointsGained) * 100) / 100;
  const fraudRisk = Math.min(1, participant.fraudRisk + (opts?.fraudBump ?? 0));

  return {
    pointsGained,
    participant: {
      ...participant,
      score,
      actionCounts: { ...participant.actionCounts, [action]: nextCount },
      lastActionAt: new Date(now).toISOString(),
      lastMeaningfulAt: now,
      qualified: score >= qualifyScore && fraudRisk < 0.85,
      fraudRisk,
      regionSlug: opts?.regionSlug ?? participant.regionSlug,
    },
  };
}
