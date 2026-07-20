/**
 * Email/password account lifecycle — register, verify, login, reset.
 */

import type { AccountStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  hashPassword,
  normalizeEmail,
  passwordPolicyError,
  verifyPassword,
} from "@/lib/auth/password";
import { createUserSession, hashIp, hashUserAgent } from "@/lib/auth/session";
import { recordLoginAttempt, writeSecurityAudit } from "@/lib/auth/security-audit";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { createHash, randomBytes } from "crypto";
import { LEGAL_PRIVACY_VERSION, LEGAL_TERMS_VERSION } from "@/lib/auth/legal-versions";

const MAX_FAILED = 8;
const LOCKOUT_MS = 15 * 60 * 1000;

function tokenHash(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

function mintRawToken(): string {
  return randomBytes(32).toString("base64url");
}

export function emailVerificationRequired(): boolean {
  if (process.env.AUTH_SKIP_EMAIL_VERIFY === "true") return false;
  if (process.env.AUTH_EMAIL_VERIFICATION_REQUIRED === "false") return false;
  // Local/test demos skip verification unless explicitly forced on.
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.AUTH_EMAIL_VERIFICATION_REQUIRED !== "true"
  ) {
    return false;
  }
  return featureFlagDefaults.AUTH_EMAIL_VERIFICATION_REQUIRED;
}

export type RegisterResult =
  | {
      ok: true;
      userId: string;
      accountStatus: AccountStatus;
      verificationToken?: string;
      needsVerification: boolean;
    }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function registerEmailAccount(params: {
  email: string;
  password: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  rememberMe?: boolean;
  ip?: string | null;
  userAgent?: string | null;
  requestId?: string;
}): Promise<RegisterResult> {
  if (!featureFlagDefaults.AUTH_EMAIL_ENABLED) {
    return { ok: false, error: "Email sign-up is disabled." };
  }
  if (!params.acceptTerms || !params.acceptPrivacy) {
    return {
      ok: false,
      error: "You must accept the Terms of Service and Privacy Policy.",
      fieldErrors: { legal: ["Required"] },
    };
  }
  const policy = passwordPolicyError(params.password);
  if (policy) {
    return { ok: false, error: policy, fieldErrors: { password: [policy] } };
  }

  const email = normalizeEmail(params.email);
  if (!email.includes("@") || email.length < 5) {
    return {
      ok: false,
      error: "Enter a valid email address.",
      fieldErrors: { email: ["Invalid email"] },
    };
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { emailNormalized: email }] },
  });
  if (existing && !existing.deletedAt) {
    return {
      ok: false,
      error: "An account with this email already exists.",
      fieldErrors: { email: ["Already registered"] },
    };
  }

  const passwordHash = await hashPassword(params.password);
  const needsVerification = emailVerificationRequired();
  const status: AccountStatus = needsVerification
    ? "PENDING_VERIFICATION"
    : "ACTIVE";

  const user = await prisma.user.create({
    data: {
      email,
      emailNormalized: email,
      passwordHash,
      accountStatus: status,
      emailVerifiedAt: needsVerification ? null : new Date(),
      termsAcceptedAt: new Date(),
      privacyAcceptedAt: new Date(),
      onboardingCompletedAt: null,
      rememberMeDefault: Boolean(params.rememberMe),
      profile: { create: {} },
      settings: { create: {} },
      authAccounts: {
        create: {
          provider: "email",
          providerAccountId: email,
          email,
          passwordHash,
          verifiedAt: needsVerification ? null : new Date(),
        },
      },
      termsAcceptances: {
        create: {
          version: LEGAL_TERMS_VERSION,
          ipHash: hashIp(params.ip ?? null),
          userAgentHash: hashUserAgent(params.userAgent ?? null),
        },
      },
      privacyAcceptances: {
        create: {
          version: LEGAL_PRIVACY_VERSION,
          ipHash: hashIp(params.ip ?? null),
          userAgentHash: hashUserAgent(params.userAgent ?? null),
        },
      },
      accountStatusHistory: {
        create: {
          toStatus: status,
          reason: "email_register",
        },
      },
    },
  });

  let verificationToken: string | undefined;
  if (needsVerification) {
    verificationToken = mintRawToken();
    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        email,
        tokenHash: tokenHash(verificationToken),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    });
  }

  await writeSecurityAudit({
    userId: user.id,
    action: "account.register",
    requestId: params.requestId,
    ipHash: hashIp(params.ip ?? null),
    metadata: { provider: "email", status },
  });

  // Session even when pending verification — gate routes to /verify-email.
  await createUserSession({
    userId: user.id,
    rememberMe: params.rememberMe,
    ipHash: hashIp(params.ip ?? null),
    userAgentHash: hashUserAgent(params.userAgent ?? null),
    authMethod: "email",
  });

  return {
    ok: true,
    userId: user.id,
    accountStatus: status,
    verificationToken,
    needsVerification,
  };
}

export type LoginResult =
  | { ok: true; userId: string; accountStatus: AccountStatus }
  | { ok: false; error: string; lockedUntil?: Date };

export async function loginEmailAccount(params: {
  email: string;
  password: string;
  rememberMe?: boolean;
  ip?: string | null;
  userAgent?: string | null;
  requestId?: string;
}): Promise<LoginResult> {
  const email = normalizeEmail(params.email);
  const ipHash = hashIp(params.ip ?? null);
  const uaHash = hashUserAgent(params.userAgent ?? null);

  const user = await prisma.user.findFirst({
    where: { OR: [{ email }, { emailNormalized: email }] },
  });

  if (!user || !user.passwordHash || user.deletedAt) {
    await recordLoginAttempt({
      email,
      success: false,
      reason: "unknown_user",
      ipHash,
      userAgentHash: uaHash,
      provider: "email",
    });
    return { ok: false, error: "Invalid email or password." };
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    await recordLoginAttempt({
      email,
      userId: user.id,
      success: false,
      reason: "locked",
      ipHash,
      userAgentHash: uaHash,
      provider: "email",
    });
    return {
      ok: false,
      error: "Account temporarily locked. Try again later.",
      lockedUntil: user.lockedUntil,
    };
  }

  if (
    user.accountStatus === "BANNED" ||
    user.accountStatus === "DELETED" ||
    user.isBanned
  ) {
    await recordLoginAttempt({
      email,
      userId: user.id,
      success: false,
      reason: "banned_or_deleted",
      ipHash,
      userAgentHash: uaHash,
      provider: "email",
    });
    return { ok: false, error: "This account cannot sign in." };
  }

  const valid = await verifyPassword(params.password, user.passwordHash);
  if (!valid) {
    const failed = user.failedLoginCount + 1;
    const lock =
      failed >= MAX_FAILED ? new Date(Date.now() + LOCKOUT_MS) : null;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginCount: failed,
        lockedUntil: lock ?? undefined,
      },
    });
    await recordLoginAttempt({
      email,
      userId: user.id,
      success: false,
      reason: "bad_password",
      ipHash,
      userAgentHash: uaHash,
      provider: "email",
    });
    await writeSecurityAudit({
      userId: user.id,
      action: "auth.login_failed",
      ipHash,
      requestId: params.requestId,
      metadata: { failed, locked: Boolean(lock) },
    });
    return {
      ok: false,
      error: lock
        ? "Too many failed attempts. Account locked for 15 minutes."
        : "Invalid email or password.",
      lockedUntil: lock ?? undefined,
    };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { failedLoginCount: 0, lockedUntil: null },
  });

  await createUserSession({
    userId: user.id,
    rememberMe: params.rememberMe,
    ipHash,
    userAgentHash: uaHash,
    authMethod: "email",
  });

  await recordLoginAttempt({
    email,
    userId: user.id,
    success: true,
    ipHash,
    userAgentHash: uaHash,
    provider: "email",
  });
  await writeSecurityAudit({
    userId: user.id,
    action: "auth.login",
    ipHash,
    requestId: params.requestId,
    metadata: { provider: "email", rememberMe: Boolean(params.rememberMe) },
  });

  return { ok: true, userId: user.id, accountStatus: user.accountStatus };
}

export async function verifyEmailToken(rawToken: string): Promise<
  | { ok: true; userId: string }
  | { ok: false; error: string }
> {
  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash: tokenHash(rawToken) },
  });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { ok: false, error: "Invalid or expired verification link." };
  }

  await prisma.$transaction([
    prisma.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: record.userId },
      data: {
        emailVerifiedAt: new Date(),
        accountStatus: "ACTIVE",
      },
    }),
    prisma.accountStatusHistory.create({
      data: {
        userId: record.userId,
        fromStatus: "PENDING_VERIFICATION",
        toStatus: "ACTIVE",
        reason: "email_verified",
      },
    }),
  ]);

  await writeSecurityAudit({
    userId: record.userId,
    action: "account.email_verified",
  });

  return { ok: true, userId: record.userId };
}

export async function createPasswordResetToken(emailRaw: string): Promise<{
  ok: true;
  token?: string;
  userId?: string;
}> {
  const email = normalizeEmail(emailRaw);
  const user = await prisma.user.findFirst({
    where: { OR: [{ email }, { emailNormalized: email }], deletedAt: null },
  });
  // Always succeed outwardly (no email enumeration).
  if (!user || !user.passwordHash) return { ok: true };

  const token = mintRawToken();
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: tokenHash(token),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    },
  });
  await writeSecurityAudit({
    userId: user.id,
    action: "auth.password_reset_requested",
  });
  return { ok: true, token, userId: user.id };
}

export async function resetPasswordWithToken(params: {
  token: string;
  password: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const policy = passwordPolicyError(params.password);
  if (policy) return { ok: false, error: policy };

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: tokenHash(params.token) },
  });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { ok: false, error: "Invalid or expired reset link." };
  }

  const passwordHash = await hashPassword(params.password);
  await prisma.$transaction([
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: record.userId },
      data: {
        passwordHash,
        failedLoginCount: 0,
        lockedUntil: null,
        accountStatus:
          // Keep recovery → active if they reset while recovering
          undefined,
      },
    }),
    prisma.session.updateMany({
      where: { userId: record.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);

  await writeSecurityAudit({
    userId: record.userId,
    action: "auth.password_reset_completed",
  });

  return { ok: true };
}
