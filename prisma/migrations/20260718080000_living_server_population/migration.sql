-- Living Server Population System
-- PREPARED ONLY — do not apply to production without explicit approval.

CREATE TYPE "ServerPresenceState" AS ENUM (
  'ACTIVE',
  'CASUAL_ACTIVE',
  'SOCIAL_ACTIVE',
  'RESTING',
  'IDLE',
  'AFK',
  'DISCONNECTED',
  'RECONNECTING',
  'SAFE_LOGOUT_PENDING',
  'IN_COMBAT',
  'IN_EVENT',
  'IN_MINIGAME',
  'IN_PRIVATE_INSTANCE'
);

CREATE TABLE "PlayerPresenceProfile" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "userId" TEXT,
  "ownerKey" TEXT NOT NULL,
  "presenceXp" INTEGER NOT NULL DEFAULT 0,
  "lifetimePresenceXp" INTEGER NOT NULL DEFAULT 0,
  "presenceLevel" TEXT NOT NULL DEFAULT 'wanderer',
  "communityTokenBalance" INTEGER NOT NULL DEFAULT 0,
  "currentEngagementTier" INTEGER NOT NULL DEFAULT 0,
  "serverPresenceState" "ServerPresenceState" NOT NULL DEFAULT 'IDLE',
  "selectedSocialStatus" TEXT,
  "helperOptIn" BOOLEAN NOT NULL DEFAULT false,
  "helperEligible" BOOLEAN NOT NULL DEFAULT false,
  "totalQualifiedMinutes" INTEGER NOT NULL DEFAULT 0,
  "socialStreakDays" INTEGER NOT NULL DEFAULT 0,
  "riskScore" INTEGER NOT NULL DEFAULT 0,
  "privacyJson" JSONB,
  "version" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "PlayerPresenceProfile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PlayerPresenceProfile_ownerKey_key" ON "PlayerPresenceProfile"("ownerKey");
CREATE INDEX "PlayerPresenceProfile_userId_idx" ON "PlayerPresenceProfile"("userId");
CREATE INDEX "PlayerPresenceProfile_presenceLevel_idx" ON "PlayerPresenceProfile"("presenceLevel");
CREATE INDEX "PlayerPresenceProfile_currentEngagementTier_idx" ON "PlayerPresenceProfile"("currentEngagementTier");

ALTER TABLE "PlayerPresenceProfile"
  ADD CONSTRAINT "PlayerPresenceProfile_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "PlayerPresenceActivity" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId" TEXT,
  "ownerKey" TEXT NOT NULL,
  "sessionId" TEXT,
  "activityType" TEXT NOT NULL,
  "activityCategory" TEXT NOT NULL,
  "score" INTEGER NOT NULL DEFAULT 0,
  "xpAwarded" INTEGER NOT NULL DEFAULT 0,
  "sourceEntityId" TEXT,
  "regionId" TEXT,
  "hubId" TEXT,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "validationStatus" TEXT NOT NULL DEFAULT 'ok',
  "antiAbuseStatus" TEXT NOT NULL DEFAULT 'clear',
  "metadataJson" JSONB,
  CONSTRAINT "PlayerPresenceActivity_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PlayerPresenceActivity_ownerKey_occurredAt_idx" ON "PlayerPresenceActivity"("ownerKey", "occurredAt");
CREATE INDEX "PlayerPresenceActivity_userId_occurredAt_idx" ON "PlayerPresenceActivity"("userId", "occurredAt");
CREATE INDEX "PlayerPresenceActivity_hubId_occurredAt_idx" ON "PlayerPresenceActivity"("hubId", "occurredAt");

CREATE TABLE "SocialHub" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "worldId" TEXT NOT NULL DEFAULT 'riftwilds',
  "regionId" TEXT NOT NULL,
  "hubKey" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "hubType" TEXT NOT NULL,
  "boundsJson" JSONB,
  "capacity" INTEGER NOT NULL DEFAULT 40,
  "presenceMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "scheduleJson" JSONB,
  "metadataJson" JSONB,
  CONSTRAINT "SocialHub_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SocialHub_hubKey_key" ON "SocialHub"("hubKey");
CREATE INDEX "SocialHub_regionId_enabled_idx" ON "SocialHub"("regionId", "enabled");

CREATE TABLE "CommunityRewardGrant" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId" TEXT,
  "ownerKey" TEXT NOT NULL,
  "sessionId" TEXT,
  "rewardDefinitionId" TEXT NOT NULL,
  "eligibilityWindowId" TEXT,
  "idempotencyKey" TEXT NOT NULL,
  "rewardPayloadJson" JSONB NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'granted',
  "denialReason" TEXT,
  "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "claimedAt" TIMESTAMP(3),
  CONSTRAINT "CommunityRewardGrant_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CommunityRewardGrant_idempotencyKey_key" ON "CommunityRewardGrant"("idempotencyKey");
CREATE INDEX "CommunityRewardGrant_ownerKey_grantedAt_idx" ON "CommunityRewardGrant"("ownerKey", "grantedAt");
CREATE INDEX "CommunityRewardGrant_userId_grantedAt_idx" ON "CommunityRewardGrant"("userId", "grantedAt");

CREATE TABLE "CommunityTaskDefinition" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "taskType" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "requirement" INTEGER NOT NULL,
  "rewardJson" JSONB NOT NULL,
  "startAt" TIMESTAMP(3),
  "endAt" TIMESTAMP(3),
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "CommunityTaskDefinition_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CommunityTaskDefinition_taskType_enabled_idx" ON "CommunityTaskDefinition"("taskType", "enabled");

CREATE TABLE "CommunityTokenLedger" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId" TEXT,
  "ownerKey" TEXT NOT NULL,
  "delta" INTEGER NOT NULL,
  "balanceAfter" INTEGER NOT NULL,
  "reason" TEXT NOT NULL,
  "requestId" TEXT NOT NULL,
  "metadataJson" JSONB,
  CONSTRAINT "CommunityTokenLedger_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CommunityTokenLedger_requestId_key" ON "CommunityTokenLedger"("requestId");
CREATE INDEX "CommunityTokenLedger_ownerKey_createdAt_idx" ON "CommunityTokenLedger"("ownerKey", "createdAt");
