-- Live World persistence / session / save-state
-- PREPARED ONLY — do not apply to production without approval.

CREATE TYPE "WorldPlaySessionStatus" AS ENUM (
  'ACTIVE',
  'RECONNECTING',
  'DISCONNECTED',
  'LOGGED_OUT_SAFE',
  'LOGGED_OUT_UNSAFE',
  'EXPIRED',
  'FORCE_ENDED'
);

CREATE TYPE "SaveCategory" AS ENUM (
  'A_CRITICAL',
  'B_PROGRESSION',
  'C_COSMETIC'
);

CREATE TYPE "LogoutZoneKind" AS ENUM (
  'INN',
  'HOME',
  'CAMP',
  'SETTLEMENT',
  'WAYPOINT'
);

CREATE TABLE "WorldPlaySession" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "userId" TEXT,
  "ownerKey" TEXT NOT NULL,
  "authSessionId" TEXT,
  "status" "WorldPlaySessionStatus" NOT NULL DEFAULT 'ACTIVE',
  "mapId" TEXT NOT NULL DEFAULT 'riftwild-commons',
  "posX" INTEGER NOT NULL DEFAULT 1024,
  "posY" INTEGER NOT NULL DEFAULT 768,
  "facingRad" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "inCombat" BOOLEAN NOT NULL DEFAULT false,
  "combatStartedAt" TIMESTAMP(3),
  "lastHeartbeatAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastAutosaveAt" TIMESTAMP(3),
  "reconnectDeadline" TIMESTAMP(3),
  "disconnectAt" TIMESTAMP(3),
  "logoutZoneId" TEXT,
  "logoutZoneKind" "LogoutZoneKind",
  "clientInstanceId" TEXT,
  "version" INTEGER NOT NULL DEFAULT 0,
  "dirtyFlagsJson" JSONB,
  "metadata" JSONB,
  CONSTRAINT "WorldPlaySession_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "WorldPlaySession_ownerKey_status_idx" ON "WorldPlaySession"("ownerKey", "status");
CREATE INDEX "WorldPlaySession_userId_status_idx" ON "WorldPlaySession"("userId", "status");
CREATE INDEX "WorldPlaySession_lastHeartbeatAt_idx" ON "WorldPlaySession"("lastHeartbeatAt");
CREATE INDEX "WorldPlaySession_reconnectDeadline_idx" ON "WorldPlaySession"("reconnectDeadline");
CREATE INDEX "WorldPlaySession_status_updatedAt_idx" ON "WorldPlaySession"("status", "updatedAt");

ALTER TABLE "WorldPlaySession" ADD CONSTRAINT "WorldPlaySession_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "WorldSaveState" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "userId" TEXT,
  "ownerKey" TEXT NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 0,
  "mapId" TEXT NOT NULL DEFAULT 'riftwild-commons',
  "posX" INTEGER NOT NULL DEFAULT 1024,
  "posY" INTEGER NOT NULL DEFAULT 768,
  "lastSafeMapId" TEXT,
  "lastSafePosX" INTEGER,
  "lastSafePosY" INTEGER,
  "lastSafeZoneId" TEXT,
  "lastSafeZoneKind" "LogoutZoneKind",
  "playStateJson" JSONB,
  "dirtyCategoryA" BOOLEAN NOT NULL DEFAULT false,
  "dirtyCategoryB" BOOLEAN NOT NULL DEFAULT false,
  "dirtyCategoryC" BOOLEAN NOT NULL DEFAULT false,
  "lastCategoryAAt" TIMESTAMP(3),
  "lastCategoryBAt" TIMESTAMP(3),
  "lastCategoryCAt" TIMESTAMP(3),
  "lastRequestId" TEXT,
  "schemaVersion" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "WorldSaveState_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WorldSaveState_ownerKey_key" ON "WorldSaveState"("ownerKey");
CREATE INDEX "WorldSaveState_userId_idx" ON "WorldSaveState"("userId");
CREATE INDEX "WorldSaveState_updatedAt_idx" ON "WorldSaveState"("updatedAt");

ALTER TABLE "WorldSaveState" ADD CONSTRAINT "WorldSaveState_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "WorldSaveSnapshot" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId" TEXT,
  "ownerKey" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "reason" TEXT NOT NULL,
  "category" "SaveCategory" NOT NULL DEFAULT 'B_PROGRESSION',
  "mapId" TEXT NOT NULL,
  "posX" INTEGER NOT NULL,
  "posY" INTEGER NOT NULL,
  "payloadJson" JSONB NOT NULL,
  "requestId" TEXT,
  CONSTRAINT "WorldSaveSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WorldSaveSnapshot_requestId_key" ON "WorldSaveSnapshot"("requestId");
CREATE INDEX "WorldSaveSnapshot_ownerKey_createdAt_idx" ON "WorldSaveSnapshot"("ownerKey", "createdAt");
CREATE INDEX "WorldSaveSnapshot_userId_createdAt_idx" ON "WorldSaveSnapshot"("userId", "createdAt");

ALTER TABLE "WorldSaveSnapshot" ADD CONSTRAINT "WorldSaveSnapshot_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "SafeLogoutCheckpoint" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "userId" TEXT,
  "ownerKey" TEXT NOT NULL,
  "mapId" TEXT NOT NULL,
  "posX" INTEGER NOT NULL,
  "posY" INTEGER NOT NULL,
  "zoneId" TEXT NOT NULL,
  "zoneKind" "LogoutZoneKind" NOT NULL,
  "restBonusApplied" BOOLEAN NOT NULL DEFAULT false,
  "loggedOutAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "requestId" TEXT,
  CONSTRAINT "SafeLogoutCheckpoint_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SafeLogoutCheckpoint_ownerKey_key" ON "SafeLogoutCheckpoint"("ownerKey");
CREATE UNIQUE INDEX "SafeLogoutCheckpoint_requestId_key" ON "SafeLogoutCheckpoint"("requestId");
CREATE INDEX "SafeLogoutCheckpoint_userId_idx" ON "SafeLogoutCheckpoint"("userId");

ALTER TABLE "SafeLogoutCheckpoint" ADD CONSTRAINT "SafeLogoutCheckpoint_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "SleepingCharacterStub" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "userId" TEXT,
  "ownerKey" TEXT NOT NULL,
  "mapId" TEXT NOT NULL,
  "posX" INTEGER NOT NULL,
  "posY" INTEGER NOT NULL,
  "displayName" TEXT,
  "appearanceJson" JSONB,
  "visibleToVisitors" BOOLEAN NOT NULL DEFAULT false,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "SleepingCharacterStub_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SleepingCharacterStub_ownerKey_key" ON "SleepingCharacterStub"("ownerKey");
CREATE INDEX "SleepingCharacterStub_mapId_active_idx" ON "SleepingCharacterStub"("mapId", "active");
CREATE INDEX "SleepingCharacterStub_expiresAt_idx" ON "SleepingCharacterStub"("expiresAt");

ALTER TABLE "SleepingCharacterStub" ADD CONSTRAINT "SleepingCharacterStub_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "WorldSaveIdempotency" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ownerKey" TEXT NOT NULL,
  "requestId" TEXT NOT NULL,
  "route" TEXT NOT NULL,
  "responseJson" JSONB,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WorldSaveIdempotency_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WorldSaveIdempotency_ownerKey_requestId_route_key"
  ON "WorldSaveIdempotency"("ownerKey", "requestId", "route");
CREATE INDEX "WorldSaveIdempotency_expiresAt_idx" ON "WorldSaveIdempotency"("expiresAt");
