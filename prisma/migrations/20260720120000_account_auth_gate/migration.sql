-- Account auth gate — NO ACCOUNT = NO GAMEPLAY
-- PREPARED for local migrate. Apply with: npm run db:migrate
-- Breaking: anonymous rift_guest gameplay is no longer supported when AUTH_ACCOUNT_REQUIRED_FOR_PLAY is on.

CREATE TYPE "AccountStatus" AS ENUM (
  'PENDING_VERIFICATION',
  'ACTIVE',
  'SUSPENDED',
  'BANNED',
  'DELETED',
  'UNDER_REVIEW',
  'PARENTAL_CONSENT_REQUIRED',
  'RECOVERY_PENDING'
);

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "accountStatus" "AccountStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
  ADD COLUMN IF NOT EXISTS "email" TEXT,
  ADD COLUMN IF NOT EXISTS "emailNormalized" TEXT,
  ADD COLUMN IF NOT EXISTS "emailVerifiedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "passwordHash" TEXT,
  ADD COLUMN IF NOT EXISTS "lockedUntil" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "region" TEXT,
  ADD COLUMN IF NOT EXISTS "dateOfBirth" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "parentalConsentAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "onboardingCompletedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "termsAcceptedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "privacyAcceptedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "rememberMeDefault" BOOLEAN NOT NULL DEFAULT false;

-- Existing wallet SIWS users become ACTIVE so local demos keep working after migrate.
UPDATE "User"
SET "accountStatus" = 'ACTIVE',
    "onboardingCompletedAt" = COALESCE("onboardingCompletedAt", "createdAt"),
    "termsAcceptedAt" = COALESCE("termsAcceptedAt", "createdAt"),
    "privacyAcceptedAt" = COALESCE("privacyAcceptedAt", "createdAt")
WHERE "deletedAt" IS NULL
  AND "isBanned" = false
  AND EXISTS (SELECT 1 FROM "Wallet" w WHERE w."userId" = "User"."id");

UPDATE "User"
SET "accountStatus" = 'BANNED'
WHERE "isBanned" = true;

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "User_emailNormalized_key" ON "User"("emailNormalized");
CREATE INDEX IF NOT EXISTS "User_accountStatus_idx" ON "User"("accountStatus");
CREATE INDEX IF NOT EXISTS "User_emailNormalized_idx" ON "User"("emailNormalized");

ALTER TABLE "Session"
  ADD COLUMN IF NOT EXISTS "refreshTokenHash" TEXT,
  ADD COLUMN IF NOT EXISTS "refreshExpiresAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "deviceId" TEXT,
  ADD COLUMN IF NOT EXISTS "rememberMe" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "csrfSecretHash" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Session_refreshTokenHash_key" ON "Session"("refreshTokenHash");
CREATE INDEX IF NOT EXISTS "Session_deviceId_idx" ON "Session"("deviceId");

ALTER TABLE "PlayerProfile"
  ADD COLUMN IF NOT EXISTS "starterKeeperChosen" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "tutorialIntroSeen" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "lastLocationPath" TEXT;

CREATE TABLE IF NOT EXISTS "AuthAccount" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "userId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "email" TEXT,
  "accessTokenEnc" TEXT,
  "refreshTokenEnc" TEXT,
  "expiresAt" TIMESTAMP(3),
  "scope" TEXT,
  "tokenType" TEXT,
  "idTokenEnc" TEXT,
  "passwordHash" TEXT,
  "verifiedAt" TIMESTAMP(3),
  "lastUsedAt" TIMESTAMP(3),
  CONSTRAINT "AuthAccount_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "AuthAccount_provider_providerAccountId_key" ON "AuthAccount"("provider", "providerAccountId");
CREATE INDEX IF NOT EXISTS "AuthAccount_userId_idx" ON "AuthAccount"("userId");
CREATE INDEX IF NOT EXISTS "AuthAccount_email_idx" ON "AuthAccount"("email");

CREATE TABLE IF NOT EXISTS "EmailVerificationToken" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  CONSTRAINT "EmailVerificationToken_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "EmailVerificationToken_tokenHash_key" ON "EmailVerificationToken"("tokenHash");
CREATE INDEX IF NOT EXISTS "EmailVerificationToken_userId_idx" ON "EmailVerificationToken"("userId");
CREATE INDEX IF NOT EXISTS "EmailVerificationToken_expiresAt_idx" ON "EmailVerificationToken"("expiresAt");

CREATE TABLE IF NOT EXISTS "PasswordResetToken" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "ipHash" TEXT,
  CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");
CREATE INDEX IF NOT EXISTS "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");
CREATE INDEX IF NOT EXISTS "PasswordResetToken_expiresAt_idx" ON "PasswordResetToken"("expiresAt");

CREATE TABLE IF NOT EXISTS "LoginAttempt" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "email" TEXT,
  "userId" TEXT,
  "success" BOOLEAN NOT NULL,
  "reason" TEXT,
  "ipHash" TEXT,
  "userAgentHash" TEXT,
  "provider" TEXT,
  CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "LoginAttempt_email_createdAt_idx" ON "LoginAttempt"("email", "createdAt");
CREATE INDEX IF NOT EXISTS "LoginAttempt_userId_createdAt_idx" ON "LoginAttempt"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "LoginAttempt_ipHash_createdAt_idx" ON "LoginAttempt"("ipHash", "createdAt");

CREATE TABLE IF NOT EXISTS "TrustedDevice" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "userId" TEXT NOT NULL,
  "deviceKeyHash" TEXT NOT NULL,
  "label" TEXT,
  "userAgentHash" TEXT,
  "ipHash" TEXT,
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revokedAt" TIMESTAMP(3),
  CONSTRAINT "TrustedDevice_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "TrustedDevice_userId_deviceKeyHash_key" ON "TrustedDevice"("userId", "deviceKeyHash");
CREATE INDEX IF NOT EXISTS "TrustedDevice_userId_idx" ON "TrustedDevice"("userId");

CREATE TABLE IF NOT EXISTS "AccountStatusHistory" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId" TEXT NOT NULL,
  "fromStatus" "AccountStatus",
  "toStatus" "AccountStatus" NOT NULL,
  "reason" TEXT,
  "actorId" TEXT,
  "metadata" JSONB,
  CONSTRAINT "AccountStatusHistory_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "AccountStatusHistory_userId_createdAt_idx" ON "AccountStatusHistory"("userId", "createdAt");

CREATE TABLE IF NOT EXISTS "TermsAcceptance" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId" TEXT NOT NULL,
  "version" TEXT NOT NULL,
  "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ipHash" TEXT,
  "userAgentHash" TEXT,
  CONSTRAINT "TermsAcceptance_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "TermsAcceptance_userId_version_key" ON "TermsAcceptance"("userId", "version");
CREATE INDEX IF NOT EXISTS "TermsAcceptance_userId_idx" ON "TermsAcceptance"("userId");

CREATE TABLE IF NOT EXISTS "PrivacyAcceptance" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId" TEXT NOT NULL,
  "version" TEXT NOT NULL,
  "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ipHash" TEXT,
  "userAgentHash" TEXT,
  CONSTRAINT "PrivacyAcceptance_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "PrivacyAcceptance_userId_version_key" ON "PrivacyAcceptance"("userId", "version");
CREATE INDEX IF NOT EXISTS "PrivacyAcceptance_userId_idx" ON "PrivacyAcceptance"("userId");

CREATE TABLE IF NOT EXISTS "SecurityAuditLog" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId" TEXT,
  "action" TEXT NOT NULL,
  "entityType" TEXT,
  "entityId" TEXT,
  "ipHash" TEXT,
  "userAgentHash" TEXT,
  "requestId" TEXT,
  "metadata" JSONB,
  CONSTRAINT "SecurityAuditLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "SecurityAuditLog_userId_createdAt_idx" ON "SecurityAuditLog"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "SecurityAuditLog_action_createdAt_idx" ON "SecurityAuditLog"("action", "createdAt");

CREATE TABLE IF NOT EXISTS "LinkedWallet" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "userId" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "network" TEXT NOT NULL DEFAULT 'devnet',
  "isPrimary" BOOLEAN NOT NULL DEFAULT false,
  "verifiedAt" TIMESTAMP(3),
  "linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "unlinkedAt" TIMESTAMP(3),
  CONSTRAINT "LinkedWallet_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "LinkedWallet_address_network_key" ON "LinkedWallet"("address", "network");
CREATE INDEX IF NOT EXISTS "LinkedWallet_userId_idx" ON "LinkedWallet"("userId");

DO $$ BEGIN
  ALTER TABLE "AuthAccount" ADD CONSTRAINT "AuthAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "EmailVerificationToken" ADD CONSTRAINT "EmailVerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "LoginAttempt" ADD CONSTRAINT "LoginAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "TrustedDevice" ADD CONSTRAINT "TrustedDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "AccountStatusHistory" ADD CONSTRAINT "AccountStatusHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "TermsAcceptance" ADD CONSTRAINT "TermsAcceptance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "PrivacyAcceptance" ADD CONSTRAINT "PrivacyAcceptance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "SecurityAuditLog" ADD CONSTRAINT "SecurityAuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "LinkedWallet" ADD CONSTRAINT "LinkedWallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
