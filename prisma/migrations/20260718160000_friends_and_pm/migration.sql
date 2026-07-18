-- Friends + private messages
-- PREPARED ONLY — do not apply to production without approval.
-- Runtime hot path is in-memory (src/lib/social).
-- Enable FRIENDS_AND_PM_PRISMA_ENABLED only after migrate deploy.

CREATE TABLE "SocialProfileRow" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "ownerKey" TEXT NOT NULL,
  "handle" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "rankTitle" TEXT NOT NULL DEFAULT 'Hatchling Keeper',
  "avatarSrc" TEXT,
  "messagePrivacy" TEXT NOT NULL DEFAULT 'friends_only',
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "systemKeeper" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "SocialProfileRow_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SocialProfileRow_ownerKey_key" ON "SocialProfileRow"("ownerKey");
CREATE UNIQUE INDEX "SocialProfileRow_handle_key" ON "SocialProfileRow"("handle");
CREATE INDEX "SocialProfileRow_lastSeenAt_idx" ON "SocialProfileRow"("lastSeenAt");

CREATE TABLE "FriendshipRow" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ownerKeyA" TEXT NOT NULL,
  "ownerKeyB" TEXT NOT NULL,
  CONSTRAINT "FriendshipRow_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "FriendshipRow_ownerKeyA_ownerKeyB_key" ON "FriendshipRow"("ownerKeyA", "ownerKeyB");
CREATE INDEX "FriendshipRow_ownerKeyA_idx" ON "FriendshipRow"("ownerKeyA");
CREATE INDEX "FriendshipRow_ownerKeyB_idx" ON "FriendshipRow"("ownerKeyB");

CREATE TABLE "FriendRequestRow" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "fromOwnerKey" TEXT NOT NULL,
  "toOwnerKey" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "note" TEXT,
  CONSTRAINT "FriendRequestRow_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "FriendRequestRow_toOwnerKey_status_idx" ON "FriendRequestRow"("toOwnerKey", "status");
CREATE INDEX "FriendRequestRow_fromOwnerKey_status_idx" ON "FriendRequestRow"("fromOwnerKey", "status");

CREATE TABLE "SocialBlockRow" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "blockerOwnerKey" TEXT NOT NULL,
  "blockedOwnerKey" TEXT NOT NULL,
  "reason" TEXT,
  CONSTRAINT "SocialBlockRow_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SocialBlockRow_blockerOwnerKey_blockedOwnerKey_key" ON "SocialBlockRow"("blockerOwnerKey", "blockedOwnerKey");
CREATE INDEX "SocialBlockRow_blockerOwnerKey_idx" ON "SocialBlockRow"("blockerOwnerKey");

CREATE TABLE "DirectMessageThreadRow" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "ownerKeyA" TEXT NOT NULL,
  "ownerKeyB" TEXT NOT NULL,
  "lastMessageAt" TIMESTAMP(3),
  CONSTRAINT "DirectMessageThreadRow_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "DirectMessageThreadRow_ownerKeyA_ownerKeyB_key" ON "DirectMessageThreadRow"("ownerKeyA", "ownerKeyB");
CREATE INDEX "DirectMessageThreadRow_lastMessageAt_idx" ON "DirectMessageThreadRow"("lastMessageAt");

CREATE TABLE "DirectMessageRow" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "threadId" TEXT NOT NULL,
  "senderOwnerKey" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "readAt" TIMESTAMP(3),
  CONSTRAINT "DirectMessageRow_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "DirectMessageRow_threadId_createdAt_idx" ON "DirectMessageRow"("threadId", "createdAt");
CREATE INDEX "DirectMessageRow_senderOwnerKey_idx" ON "DirectMessageRow"("senderOwnerKey");

ALTER TABLE "DirectMessageRow"
  ADD CONSTRAINT "DirectMessageRow_threadId_fkey"
  FOREIGN KEY ("threadId") REFERENCES "DirectMessageThreadRow"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "SocialReportRow" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reporterOwnerKey" TEXT NOT NULL,
  "targetOwnerKey" TEXT NOT NULL,
  "targetType" TEXT NOT NULL,
  "targetId" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "details" TEXT,
  "status" TEXT NOT NULL DEFAULT 'open',
  CONSTRAINT "SocialReportRow_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "SocialReportRow_status_createdAt_idx" ON "SocialReportRow"("status", "createdAt");
CREATE INDEX "SocialReportRow_reporterOwnerKey_idx" ON "SocialReportRow"("reporterOwnerKey");
