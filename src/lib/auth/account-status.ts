import type { AccountStatus } from "@prisma/client";

export type AccountGateReason =
  | "NO_SESSION"
  | "EXPIRED"
  | "REVOKED"
  | "PENDING_VERIFICATION"
  | "SUSPENDED"
  | "BANNED"
  | "DELETED"
  | "UNDER_REVIEW"
  | "PARENTAL_CONSENT_REQUIRED"
  | "RECOVERY_PENDING"
  | "ONBOARDING_REQUIRED"
  | "LOCKED";

export type AccountGateOk = { ok: true; canPlay: true };

export type AccountGateBlocked = {
  ok: false;
  canPlay: false;
  reason: AccountGateReason;
  clearSession: boolean;
  redirectTo: string;
  message: string;
};

export type AccountGateDecision = AccountGateOk | AccountGateBlocked;

const STATUS_MESSAGES: Record<AccountStatus, string> = {
  PENDING_VERIFICATION: "Verify your email before entering the Riftwilds.",
  ACTIVE: "Account active.",
  SUSPENDED: "This account is suspended. Contact support if you believe this is a mistake.",
  BANNED: "This account is banned and cannot access gameplay.",
  DELETED: "This account has been deleted.",
  UNDER_REVIEW: "This account is under review. Gameplay is paused.",
  PARENTAL_CONSENT_REQUIRED: "Parental consent is required before you can play.",
  RECOVERY_PENDING: "Account recovery is in progress. Sign-in is limited until it completes.",
};

/** Statuses that must clear the cookie and force re-auth. */
export function shouldClearSessionForStatus(status: AccountStatus): boolean {
  return (
    status === "BANNED" ||
    status === "DELETED" ||
    status === "SUSPENDED" ||
    status === "UNDER_REVIEW"
  );
}

/** Statuses allowed to hold a session but not enter gameplay. */
export function canHoldSession(status: AccountStatus): boolean {
  return (
    status === "ACTIVE" ||
    status === "PENDING_VERIFICATION" ||
    status === "PARENTAL_CONSENT_REQUIRED" ||
    status === "RECOVERY_PENDING"
  );
}

export function canEnterGameplay(status: AccountStatus): boolean {
  return status === "ACTIVE";
}

export function evaluateAccountStatus(params: {
  status: AccountStatus;
  onboardingComplete: boolean;
  lockedUntil?: Date | null;
  returnUrl?: string;
}): AccountGateOk | AccountGateBlocked {
  const returnUrl = params.returnUrl ?? "/play";

  if (params.lockedUntil && params.lockedUntil > new Date()) {
    return {
      ok: false,
      canPlay: false,
      reason: "LOCKED",
      clearSession: false,
      redirectTo: `/login?reason=locked&returnUrl=${encodeURIComponent(returnUrl)}`,
      message: "Too many failed sign-in attempts. Try again later.",
    };
  }

  if (params.status === "PENDING_VERIFICATION") {
    return {
      ok: false,
      canPlay: false,
      reason: "PENDING_VERIFICATION",
      clearSession: false,
      redirectTo: `/verify-email?returnUrl=${encodeURIComponent(returnUrl)}`,
      message: STATUS_MESSAGES.PENDING_VERIFICATION,
    };
  }

  if (params.status === "PARENTAL_CONSENT_REQUIRED") {
    return {
      ok: false,
      canPlay: false,
      reason: "PARENTAL_CONSENT_REQUIRED",
      clearSession: false,
      redirectTo: `/onboarding?step=parental&returnUrl=${encodeURIComponent(returnUrl)}`,
      message: STATUS_MESSAGES.PARENTAL_CONSENT_REQUIRED,
    };
  }

  if (params.status === "RECOVERY_PENDING") {
    return {
      ok: false,
      canPlay: false,
      reason: "RECOVERY_PENDING",
      clearSession: false,
      redirectTo: `/login?reason=recovery&returnUrl=${encodeURIComponent(returnUrl)}`,
      message: STATUS_MESSAGES.RECOVERY_PENDING,
    };
  }

  if (!canEnterGameplay(params.status)) {
    return {
      ok: false,
      canPlay: false,
      reason: params.status as AccountGateReason,
      clearSession: shouldClearSessionForStatus(params.status),
      redirectTo: `/login?reason=${params.status.toLowerCase()}&returnUrl=${encodeURIComponent(returnUrl)}`,
      message: STATUS_MESSAGES[params.status],
    };
  }

  if (!params.onboardingComplete) {
    return {
      ok: false,
      canPlay: false,
      reason: "ONBOARDING_REQUIRED",
      clearSession: false,
      redirectTo: `/onboarding?returnUrl=${encodeURIComponent(returnUrl)}`,
      message: "Finish Riftkeeper onboarding before gameplay.",
    };
  }

  return { ok: true, canPlay: true };
}

export function accountStatusLabel(status: AccountStatus): string {
  return status
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
