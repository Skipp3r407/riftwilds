/**
 * Hardcore permadeath — strictly opt-in with red warning + checkbox.
 * Never applies to normal gameplay.
 */

import { SPIRIT_RECOVERY_CONFIG } from "@/game/spirit/config";
import type { HardcoreOptIn } from "@/game/spirit/types";
import { isFeatureEnabled } from "@/lib/config/feature-flags";

export const HARDCORE_MODES = [
  "HARDCORE_EXPEDITION",
  "HARDCORE_PVE",
  "IRONMAN",
  "SPECIAL_EVENT",
  "EXTREME_DUNGEON",
] as const;

export type HardcoreMode = (typeof HARDCORE_MODES)[number];

export type HardcoreEnableRequest = {
  checkboxAccepted: boolean;
  warningAcknowledged: boolean;
  typedConfirm?: string;
};

export type HardcoreEnableResult =
  | { ok: true; hardcore: HardcoreOptIn }
  | {
      ok: false;
      error: "FLAG_OFF" | "MISSING_CHECKBOX" | "MISSING_WARNING" | "CONFIRM_MISMATCH";
      message: string;
      warning: string;
    };

export function defaultHardcoreOptIn(): HardcoreOptIn {
  return {
    enabled: false,
    warnedAt: null,
    confirmedAt: null,
    checkboxAccepted: false,
    warningAcknowledged: false,
  };
}

export function enableHardcore(req: HardcoreEnableRequest, nowIso: string = new Date().toISOString()): HardcoreEnableResult {
  const warning = SPIRIT_RECOVERY_CONFIG.hardcoreWarning;
  if (!isFeatureEnabled("HARDCORE_MODE_ENABLED")) {
    return {
      ok: false,
      error: "FLAG_OFF",
      message: "Hardcore mode is disabled. Normal play never permanently kills Riftlings.",
      warning,
    };
  }
  if (!req.warningAcknowledged) {
    return {
      ok: false,
      error: "MISSING_WARNING",
      message: "You must acknowledge the red warning before enabling Hardcore.",
      warning,
    };
  }
  if (!req.checkboxAccepted) {
    return {
      ok: false,
      error: "MISSING_CHECKBOX",
      message: 'Check "I understand this Riftling may be permanently lost."',
      warning,
    };
  }
  if (req.typedConfirm && req.typedConfirm.trim().toUpperCase() !== "HARDCORE") {
    return {
      ok: false,
      error: "CONFIRM_MISMATCH",
      message: 'Type HARDCORE to confirm.',
      warning,
    };
  }
  return {
    ok: true,
    hardcore: {
      enabled: true,
      warnedAt: nowIso,
      confirmedAt: nowIso,
      checkboxAccepted: true,
      warningAcknowledged: true,
    },
  };
}

export function disableHardcore(): HardcoreOptIn {
  return defaultHardcoreOptIn();
}

export function hardcoreWarningPayload() {
  return {
    tone: "danger" as const,
    title: "Hardcore — permanent loss possible",
    body: SPIRIT_RECOVERY_CONFIG.hardcoreWarning,
    checkboxLabel: "I understand this Riftling may be permanently lost.",
    modes: [...HARDCORE_MODES],
    normalPlaySafe: true,
  };
}
