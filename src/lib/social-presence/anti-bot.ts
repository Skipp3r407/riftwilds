/**
 * Anti-macro / anti-bot risk scoring — reduce rewards, don't instant-ban on one signal.
 */

import { detectScriptedRepetition } from "@/lib/social-presence/anti-afk";
import type { PresenceActionEvent, PresenceInputEvent } from "@/lib/social-presence/types";

export type RiskSignals = {
  scriptedRepetition: boolean;
  perfectlyTimed: boolean;
  longSessionHours: number;
  reciprocalCluster: boolean;
  identicalChatSpam: boolean;
};

export function analyzeRisk(params: {
  actions: PresenceActionEvent[];
  inputs: PresenceInputEvent[];
  sessionStartedAt: number | null;
  reciprocalHits?: number;
  now?: number;
}): { riskScore: number; signals: RiskSignals; restrictRewards: boolean } {
  const now = params.now ?? Date.now();
  const scriptedRepetition = detectScriptedRepetition(params.actions, now);

  // Perfectly timed: many actions at nearly identical intervals
  let perfectlyTimed = false;
  if (params.actions.length >= 8) {
    const intervals: number[] = [];
    const sorted = [...params.actions].sort((a, b) => a.at - b.at);
    for (let i = 1; i < sorted.length; i++) {
      intervals.push(sorted[i]!.at - sorted[i - 1]!.at);
    }
    const recent = intervals.slice(-8);
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const variance =
      recent.reduce((a, b) => a + (b - avg) ** 2, 0) / recent.length;
    perfectlyTimed = avg > 0 && variance < (Math.abs(avg) * 0.02) ** 2;
  }

  const sessionHours =
    params.sessionStartedAt == null
      ? 0
      : (now - params.sessionStartedAt) / 3_600_000;

  const reciprocalCluster = (params.reciprocalHits ?? 0) >= 8;
  const identicalChatSpam = params.actions.filter((a) => a.kind === "CHAT").length > 20;

  let riskScore = 0;
  if (scriptedRepetition) riskScore += 40;
  if (perfectlyTimed) riskScore += 25;
  if (sessionHours >= 18) riskScore += 20;
  if (reciprocalCluster) riskScore += 30;
  if (identicalChatSpam) riskScore += 15;

  return {
    riskScore: Math.min(100, riskScore),
    signals: {
      scriptedRepetition,
      perfectlyTimed,
      longSessionHours: Math.round(sessionHours * 10) / 10,
      reciprocalCluster,
      identicalChatSpam,
    },
    restrictRewards: riskScore >= 50,
  };
}

export function rewardMultiplierForRisk(riskScore: number): number {
  if (riskScore >= 80) return 0;
  if (riskScore >= 50) return 0.25;
  if (riskScore >= 30) return 0.6;
  return 1;
}
