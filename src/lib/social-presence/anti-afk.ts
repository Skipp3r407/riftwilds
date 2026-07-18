/**
 * Anti-AFK for Presence XP — motionless standing and scripted loops earn nothing.
 */

import {
  ANTI_AFK_SIGNAL_WINDOW_MS,
  MAX_ACTION_LOG,
  MAX_INPUT_LOG,
  MOTIONLESS_BLOCK_MS,
  MULTI_ACCOUNT_XP_SHARE,
  SCRIPTED_REPEAT_THRESHOLD,
  SCRIPTED_REPEAT_WINDOW_MS,
} from "@/lib/social-presence/config";
import type {
  AntiAfkVerdict,
  PresenceActionEvent,
  PresenceInputEvent,
  PresenceInputSignal,
  PresencePlayerState,
} from "@/lib/social-presence/types";

export function appendInputSignal(
  inputs: PresenceInputEvent[],
  signal: PresenceInputSignal,
  now = Date.now(),
  detail?: string,
): PresenceInputEvent[] {
  const next = [...inputs, { signal, at: now, detail }];
  return next.length > MAX_INPUT_LOG ? next.slice(next.length - MAX_INPUT_LOG) : next;
}

export function lastSignalAt(inputs: PresenceInputEvent[]): number | null {
  if (inputs.length === 0) return null;
  return inputs[inputs.length - 1]!.at;
}

export function hasRecentEngagement(
  inputs: PresenceInputEvent[],
  now = Date.now(),
  windowMs = ANTI_AFK_SIGNAL_WINDOW_MS,
): boolean {
  const last = lastSignalAt(inputs);
  if (last == null) return false;
  return now - last <= windowMs;
}

/** Same action kind spammed in a short window → likely bot/script. */
export function detectScriptedRepetition(
  actions: PresenceActionEvent[],
  now = Date.now(),
): boolean {
  const cutoff = now - SCRIPTED_REPEAT_WINDOW_MS;
  const recent = actions.filter((a) => a.at >= cutoff);
  if (recent.length < SCRIPTED_REPEAT_THRESHOLD) return false;

  const counts = new Map<string, number>();
  for (const a of recent) {
    counts.set(a.kind, (counts.get(a.kind) ?? 0) + 1);
  }
  for (const count of counts.values()) {
    if (count >= SCRIPTED_REPEAT_THRESHOLD) return true;
  }

  // Alternating A/B script pattern
  if (recent.length >= SCRIPTED_REPEAT_THRESHOLD) {
    const kinds = recent.map((a) => a.kind);
    let alternating = true;
    for (let i = 2; i < kinds.length; i++) {
      if (kinds[i] !== kinds[i % 2]) {
        alternating = false;
        break;
      }
    }
    if (alternating && new Set(kinds.slice(0, 2)).size <= 2) return true;
  }

  return false;
}

export function evaluateAntiAfk(
  state: Pick<PresencePlayerState, "inputs" | "actions" | "lastMeaningfulAt">,
  now = Date.now(),
): AntiAfkVerdict {
  const last = lastSignalAt(state.inputs);
  const age = last == null ? null : now - last;

  if (detectScriptedRepetition(state.actions, now)) {
    return {
      ok: false,
      reason: "scripted_repetition",
      message: "Anti-AFK: scripted repetition detected — Presence XP paused.",
      lastSignalAgeMs: age,
    };
  }

  if (!hasRecentEngagement(state.inputs, now)) {
    return {
      ok: false,
      reason: "no_recent_signal",
      message:
        "Anti-AFK: move, look around, chat, emote, care for a pet, or use UI to stay present.",
      lastSignalAgeMs: age,
    };
  }

  const lastMeaningful = state.lastMeaningfulAt;
  if (
    lastMeaningful != null &&
    now - lastMeaningful > MOTIONLESS_BLOCK_MS &&
    !state.inputs.some(
      (i) =>
        now - i.at <= ANTI_AFK_SIGNAL_WINDOW_MS &&
        (i.signal === "MOVE" ||
          i.signal === "CAMERA" ||
          i.signal === "INTERACT" ||
          i.signal === "CHAT" ||
          i.signal === "EMOTE" ||
          i.signal === "PET" ||
          i.signal === "UI"),
    )
  ) {
    return {
      ok: false,
      reason: "motionless",
      message: "Anti-AFK: motionless standing earns no Presence XP.",
      lastSignalAgeMs: age,
    };
  }

  return {
    ok: true,
    reason: "ok",
    message: "Engaged — Presence XP allowed.",
    lastSignalAgeMs: age,
  };
}

/**
 * Soft multi-account guard: shared device fingerprint reduces XP share.
 * Does not ban — just prevents AFK farming farms from stacking rewards.
 */
export function multiAccountXpMultiplier(
  fingerprintHash: string | null,
  otherAccountsWithSameFingerprint: number,
): number {
  if (!fingerprintHash || otherAccountsWithSameFingerprint <= 0) return 1;
  return Math.max(MULTI_ACCOUNT_XP_SHARE, 1 / (1 + otherAccountsWithSameFingerprint));
}

export function trimActionLog(actions: PresenceActionEvent[]): PresenceActionEvent[] {
  if (actions.length <= MAX_ACTION_LOG) return actions;
  return actions.slice(actions.length - MAX_ACTION_LOG);
}
