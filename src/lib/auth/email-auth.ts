/**
 * Email/password account lifecycle — register, verify (link + 10-min code), login, reset.
 */

import type { AccountStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  hashPassword,
  isValidUsername,
  normalizeEmail,
  passwordPolicyError,
  verifyPassword,
} from "@/lib/auth/password";
import { createUserSession, hashIp, hashUserAgent } from "@/lib/auth/session";
import { recordLoginAttempt, writeSecurityAudit } from "@/lib/auth/security-audit";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { LEGAL_PRIVACY_VERSION, LEGAL_TERMS_VERSION } from "@/lib/auth/legal-versions";
import {
  mailConfigured,
  sendPasswordResetEmail,
  sendVerificationEmail,
  type EmailDelivery,
} from "@/lib/auth/mail";
import {
  EMAIL_VERIFICATION_TTL_MINUTES,
  EMAIL_VERIFICATION_TTL_MS,
  hashVerificationSecret,
  mintLinkToken,
  mintVerificationCode,
  normalizeVerificationCode,
} from "@/lib/auth/email-verification";

export {
  EMAIL_VERIFICATION_TTL_MINUTES,
  EMAIL_VERIFICATION_TTL_MS,
  mintVerificationCode,
  normalizeVerificationCode,
} from "@/lib/auth/email-verification";

const MAX_FAILED = 8;
const LOCKOUT_MS = 15 * 60 * 1000;
const RESEND_WINDOW_MS = 15 * 60 * 1000;
const RESEND_MAX_PER_WINDOW = 3;
const RESEND_COOLDOWN_MS = 45 * 1000;

function tokenHash(raw: string): string {
  return hashVerificationSecret(raw);
}

function mintRawToken(): string {
  return mintLinkToken();
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

export type IssuedVerification = {
  linkToken: string;
  code: string;
  expiresAt: Date;
  emailDelivery: EmailDelivery;
};

async function issueEmailVerification(params: {
  userId: string;
  email: string;
}): Promise<IssuedVerification> {
  const linkToken = mintRawToken();
  const code = mintVerificationCode();
  const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS);

  // Invalidate prior unused challenges for this user.
  await prisma.emailVerificationToken.updateMany({
    where: { userId: params.userId, usedAt: null },
    data: { usedAt: new Date() },
  });

  await prisma.emailVerificationToken.create({
    data: {
      userId: params.userId,
      email: params.email,
      tokenHash: tokenHash(linkToken),
      codeHash: tokenHash(code),
      expiresAt,
    },
  });

  const mail = await sendVerificationEmail({
    to: params.email,
    code,
    linkToken,
    expiresMinutes: EMAIL_VERIFICATION_TTL_MINUTES,
  });
  if (!mail.ok) {
    console.warn("[auth] verification email failed:", mail.error);
  }

  return {
    linkToken,
    code,
    expiresAt,
    emailDelivery: mail.ok ? mail.provider : mailConfigured() ? "resend" : "console",
  };
}

export type RegisterResult =
  | {
      ok: true;
      userId: string;
      accountStatus: AccountStatus;
      verificationToken?: string;
      verificationCode?: string;
      verificationExpiresAt?: string;
      emailDelivery?: EmailDelivery;
      needsVerification: boolean;
    }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function registerEmailAccount(params: {
  email: string;
  password: string;
  username: string;
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

  const username = params.username.trim();
  if (!isValidUsername(username)) {
    return {
      ok: false,
      error: "Username must be 3–24 chars, start with a letter, and use letters, numbers, or _.",
      fieldErrors: { username: ["Invalid username"] },
    };
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

  const usernameTaken = await prisma.playerProfile.findUnique({
    where: { username },
  });
  if (usernameTaken) {
    return {
      ok: false,
      error: "That username is taken.",
      fieldErrors: { username: ["Taken"] },
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
      profile: {
        create: {
          username,
          displayName: username,
        },
      },
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
  let verificationCode: string | undefined;
  let verificationExpiresAt: string | undefined;
  let emailDelivery: EmailDelivery | undefined;
  if (needsVerification) {
    const issued = await issueEmailVerification({ userId: user.id, email });
    verificationToken = issued.linkToken;
    verificationCode = issued.code;
    verificationExpiresAt = issued.expiresAt.toISOString();
    emailDelivery = issued.emailDelivery;
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
    verificationCode,
    verificationExpiresAt,
    emailDelivery,
    needsVerification,
  };
}

export type LoginResult =
  | {
      ok: true;
      userId: string;
      accountStatus: AccountStatus;
      onboardingComplete: boolean;
      sessionToken: string;
      refreshToken: string;
      rememberMe: boolean;
      sessionExpiresAt: Date;
      refreshExpiresAt: Date;
    }
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

  const sessionTokens = await createUserSession({
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

  return {
    ok: true,
    userId: user.id,
    accountStatus: user.accountStatus,
    onboardingComplete: Boolean(user.onboardingCompletedAt),
    sessionToken: sessionTokens.token,
    refreshToken: sessionTokens.refreshToken,
    rememberMe: sessionTokens.rememberMe,
    sessionExpiresAt: sessionTokens.expiresAt,
    refreshExpiresAt: sessionTokens.refreshExpiresAt,
  };
}

async function activateVerifiedUser(userId: string, reason: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        emailVerifiedAt: new Date(),
        accountStatus:
          user.accountStatus === "PENDING_VERIFICATION" ? "ACTIVE" : user.accountStatus,
      },
    }),
    prisma.authAccount.updateMany({
      where: { userId, provider: "email", verifiedAt: null },
      data: { verifiedAt: new Date() },
    }),
    prisma.accountStatusHistory.create({
      data: {
        userId,
        fromStatus: user.accountStatus,
        toStatus:
          user.accountStatus === "PENDING_VERIFICATION" ? "ACTIVE" : user.accountStatus,
        reason,
      },
    }),
  ]);

  await writeSecurityAudit({
    userId,
    action: "account.email_verified",
    metadata: { reason },
  });
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

  await prisma.emailVerificationToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });
  await activateVerifiedUser(record.userId, "email_verified_link");

  return { ok: true, userId: record.userId };
}

export async function verifyEmailCode(params: {
  code: string;
  userId?: string;
  email?: string;
}): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
  const code = normalizeVerificationCode(params.code);
  if (!/^\d{6}$/.test(code)) {
    return { ok: false, error: "Enter the 6-digit verification code." };
  }

  const hash = tokenHash(code);
  const whereUser =
    params.userId
      ? { userId: params.userId }
      : params.email
        ? { email: normalizeEmail(params.email) }
        : null;
  if (!whereUser) {
    return { ok: false, error: "Sign in again, then enter your verification code." };
  }

  const record = await prisma.emailVerificationToken.findFirst({
    where: {
      ...whereUser,
      codeHash: hash,
      usedAt: null,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record || record.expiresAt < new Date()) {
    return {
      ok: false,
      error: "Invalid or expired verification code. Request a new one (codes last 10 minutes).",
    };
  }

  await prisma.emailVerificationToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });
  await activateVerifiedUser(record.userId, "email_verified_code");

  return { ok: true, userId: record.userId };
}

export type ResendResult =
  | {
      ok: true;
      verificationToken?: string;
      verificationCode?: string;
      verificationExpiresAt: string;
      emailDelivery: EmailDelivery;
    }
  | { ok: false; error: string; retryAfterSeconds?: number };

export async function resendEmailVerification(params: {
  userId: string;
}): Promise<ResendResult> {
  const user = await prisma.user.findUnique({ where: { id: params.userId } });
  if (!user || !user.email || user.deletedAt) {
    return { ok: false, error: "Account not found." };
  }
  if (user.emailVerifiedAt && user.accountStatus === "ACTIVE") {
    return { ok: false, error: "Email is already verified." };
  }

  const recent = await prisma.emailVerificationToken.findMany({
    where: {
      userId: user.id,
      createdAt: { gte: new Date(Date.now() - RESEND_WINDOW_MS) },
    },
    orderBy: { createdAt: "desc" },
    take: RESEND_MAX_PER_WINDOW,
  });

  if (recent.length >= RESEND_MAX_PER_WINDOW) {
    const oldestInWindow = recent[recent.length - 1]!;
    const retryAt = oldestInWindow.createdAt.getTime() + RESEND_WINDOW_MS;
    return {
      ok: false,
      error: "Too many verification emails. Try again later.",
      retryAfterSeconds: Math.max(1, Math.ceil((retryAt - Date.now()) / 1000)),
    };
  }

  const latest = recent[0];
  if (latest && Date.now() - latest.createdAt.getTime() < RESEND_COOLDOWN_MS) {
    const retryAfterSeconds = Math.ceil(
      (RESEND_COOLDOWN_MS - (Date.now() - latest.createdAt.getTime())) / 1000,
    );
    return {
      ok: false,
      error: `Please wait ${retryAfterSeconds}s before requesting another code.`,
      retryAfterSeconds,
    };
  }

  const issued = await issueEmailVerification({
    userId: user.id,
    email: user.email,
  });

  await writeSecurityAudit({
    userId: user.id,
    action: "account.verification_resent",
  });

  return {
    ok: true,
    verificationToken: issued.linkToken,
    verificationCode: issued.code,
    verificationExpiresAt: issued.expiresAt.toISOString(),
    emailDelivery: issued.emailDelivery,
  };
}

const PASSWORD_RESET_TTL_MINUTES = 60;

export async function createPasswordResetToken(emailRaw: string): Promise<{
  ok: true;
  token?: string;
  userId?: string;
  emailDelivery?: EmailDelivery;
}> {
  const email = normalizeEmail(emailRaw);
  const user = await prisma.user.findFirst({
    where: { OR: [{ email }, { emailNormalized: email }], deletedAt: null },
  });
  // Always succeed outwardly (no email enumeration).
  if (!user || !user.passwordHash) {
    return {
      ok: true,
      emailDelivery: mailConfigured() ? "resend" : "console",
    };
  }

  const token = mintRawToken();
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: tokenHash(token),
      expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MINUTES * 60 * 1000),
    },
  });

  const mail = await sendPasswordResetEmail({
    to: user.email ?? email,
    resetToken: token,
    expiresMinutes: PASSWORD_RESET_TTL_MINUTES,
  });
  if (!mail.ok) {
    console.warn("[auth] password reset email failed:", mail.error);
  }

  await writeSecurityAudit({
    userId: user.id,
    action: "auth.password_reset_requested",
  });
  return {
    ok: true,
    token,
    userId: user.id,
    emailDelivery: mail.ok ? mail.provider : mailConfigured() ? "resend" : "console",
  };
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
      },
    }),
    prisma.authAccount.updateMany({
      where: { userId: record.userId, provider: "email" },
      data: { passwordHash },
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
