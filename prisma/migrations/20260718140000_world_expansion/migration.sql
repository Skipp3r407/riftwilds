-- Automatic World Expansion
-- PREPARED ONLY — do not apply to production without approval.
-- Runtime hot path is in-memory; enable WORLD_EXPANSION_PRISMA_ENABLED only after migrate deploy.

CREATE TABLE "WorldMap" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "mapId" TEXT NOT NULL,
  "publicName" TEXT NOT NULL,
  "templateKey" TEXT NOT NULL,
  "biome" TEXT NOT NULL,
  "mapKind" TEXT NOT NULL,
  "lifecycle" TEXT NOT NULL,
  "seed" TEXT NOT NULL,
  "regionSlug" TEXT NOT NULL,
  "neighborhoodId" TEXT,
  "allowsPermanentHousing" BOOLEAN NOT NULL DEFAULT true,
  "softPlayerLimit" INTEGER NOT NULL,
  "hardPlayerLimit" INTEGER NOT NULL,
  "plotsTotal" INTEGER NOT NULL DEFAULT 0,
  "plotsOccupied" INTEGER NOT NULL DEFAULT 0,
  "playersOnline" INTEGER NOT NULL DEFAULT 0,
  "visitors" INTEGER NOT NULL DEFAULT 0,
  "entityCount" INTEGER NOT NULL DEFAULT 0,
  "tickLatencyMs" INTEGER NOT NULL DEFAULT 0,
  "crowdLabel" TEXT NOT NULL DEFAULT 'Quiet',
  "founderTitleKey" TEXT,
  "generatorVersion" TEXT NOT NULL,
  "templateVersion" TEXT NOT NULL,
  "seedVersion" TEXT NOT NULL,
  "parentMapId" TEXT,
  "overflowEventKey" TEXT,
  "expiresAt" TIMESTAMP(3),
  "stateJson" JSONB,
  "validationReportId" TEXT,
  "openedAt" TIMESTAMP(3),
  "archivedAt" TIMESTAMP(3),
  CONSTRAINT "WorldMap_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "WorldMap_mapId_key" ON "WorldMap"("mapId");
CREATE INDEX "WorldMap_lifecycle_mapKind_idx" ON "WorldMap"("lifecycle", "mapKind");
CREATE INDEX "WorldMap_regionSlug_idx" ON "WorldMap"("regionSlug");
CREATE INDEX "WorldMap_overflowEventKey_idx" ON "WorldMap"("overflowEventKey");

CREATE TABLE "MapTemplate" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "key" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "biome" TEXT NOT NULL,
  "mapKind" TEXT NOT NULL,
  "blurb" TEXT NOT NULL,
  "housingStylesJson" JSONB NOT NULL,
  "districtKindsJson" JSONB NOT NULL,
  "hubsJson" JSONB NOT NULL,
  "roadStyle" TEXT NOT NULL,
  "performanceBudgetJson" JSONB NOT NULL,
  "softPlayerLimit" INTEGER NOT NULL,
  "hardPlayerLimit" INTEGER NOT NULL,
  "targetPlotMin" INTEGER NOT NULL,
  "targetPlotMax" INTEGER NOT NULL,
  "allowsPermanentHousing" BOOLEAN NOT NULL,
  "generatorVersion" TEXT NOT NULL,
  CONSTRAINT "MapTemplate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "MapTemplate_key_key" ON "MapTemplate"("key");

CREATE TABLE "ExpansionRequest" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "requestId" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "sourceMapId" TEXT,
  "templateKey" TEXT NOT NULL,
  "mapKind" TEXT NOT NULL,
  "lifecycle" TEXT NOT NULL,
  "priority" INTEGER NOT NULL DEFAULT 50,
  "jobId" TEXT,
  "resultingMapId" TEXT,
  "note" TEXT,
  "adminActorId" TEXT,
  CONSTRAINT "ExpansionRequest_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ExpansionRequest_requestId_key" ON "ExpansionRequest"("requestId");
CREATE INDEX "ExpansionRequest_lifecycle_priority_idx" ON "ExpansionRequest"("lifecycle", "priority");
CREATE INDEX "ExpansionRequest_sourceMapId_idx" ON "ExpansionRequest"("sourceMapId");

CREATE TABLE "GenerationJob" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "jobId" TEXT NOT NULL,
  "expansionRequestId" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "maxAttempts" INTEGER NOT NULL DEFAULT 3,
  "seed" TEXT NOT NULL,
  "templateKey" TEXT NOT NULL,
  "mapId" TEXT,
  "lastError" TEXT,
  CONSTRAINT "GenerationJob_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "GenerationJob_jobId_key" ON "GenerationJob"("jobId");
CREATE INDEX "GenerationJob_status_idx" ON "GenerationJob"("status");
CREATE INDEX "GenerationJob_expansionRequestId_idx" ON "GenerationJob"("expansionRequestId");

CREATE TABLE "CapacityMetric" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "mapId" TEXT NOT NULL,
  "playersOnline" INTEGER NOT NULL,
  "plotsOccupied" INTEGER NOT NULL,
  "plotsTotal" INTEGER NOT NULL,
  "visitors" INTEGER NOT NULL,
  "entityCount" INTEGER NOT NULL,
  "tickLatencyMs" INTEGER NOT NULL,
  "softPlayerLimit" INTEGER NOT NULL,
  "hardPlayerLimit" INTEGER NOT NULL,
  "rollingLoadAvg" DOUBLE PRECISION NOT NULL,
  "spikeDetected" BOOLEAN NOT NULL DEFAULT false,
  "forecastNeedsExpansion" BOOLEAN NOT NULL DEFAULT false,
  "forecastNeedsOverflow" BOOLEAN NOT NULL DEFAULT false,
  "payloadJson" JSONB,
  CONSTRAINT "CapacityMetric_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CapacityMetric_mapId_createdAt_idx" ON "CapacityMetric"("mapId", "createdAt");

CREATE TABLE "PlayerMapAssignment" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "userId" TEXT NOT NULL,
  "mapId" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "stickyUntil" TIMESTAMP(3),
  CONSTRAINT "PlayerMapAssignment_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PlayerMapAssignment_userId_key" ON "PlayerMapAssignment"("userId");
CREATE INDEX "PlayerMapAssignment_mapId_idx" ON "PlayerMapAssignment"("mapId");

CREATE TABLE "RelocationRequest" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "relocationId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "fromMapId" TEXT NOT NULL,
  "toMapId" TEXT NOT NULL,
  "fromPlotId" TEXT,
  "toPlotId" TEXT,
  "status" TEXT NOT NULL,
  "snapshotHash" TEXT,
  "furnitureIdsJson" JSONB NOT NULL,
  "idempotencyKey" TEXT NOT NULL,
  "guildApprovalRequired" BOOLEAN NOT NULL DEFAULT false,
  "guildApprovedBy" TEXT,
  "error" TEXT,
  CONSTRAINT "RelocationRequest_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "RelocationRequest_relocationId_key" ON "RelocationRequest"("relocationId");
CREATE UNIQUE INDEX "RelocationRequest_idempotencyKey_key" ON "RelocationRequest"("idempotencyKey");
CREATE INDEX "RelocationRequest_userId_status_idx" ON "RelocationRequest"("userId", "status");
CREATE INDEX "RelocationRequest_toMapId_idx" ON "RelocationRequest"("toMapId");

CREATE TABLE "ValidationReport" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reportId" TEXT NOT NULL,
  "mapId" TEXT NOT NULL,
  "passed" BOOLEAN NOT NULL,
  "checksJson" JSONB NOT NULL,
  "visualQaJson" JSONB NOT NULL,
  CONSTRAINT "ValidationReport_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ValidationReport_reportId_key" ON "ValidationReport"("reportId");
CREATE INDEX "ValidationReport_mapId_passed_idx" ON "ValidationReport"("mapId", "passed");

ALTER TABLE "ExpansionRequest" ADD CONSTRAINT "ExpansionRequest_sourceMapId_fkey"
  FOREIGN KEY ("sourceMapId") REFERENCES "WorldMap"("mapId") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ExpansionRequest" ADD CONSTRAINT "ExpansionRequest_resultingMapId_fkey"
  FOREIGN KEY ("resultingMapId") REFERENCES "WorldMap"("mapId") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "GenerationJob" ADD CONSTRAINT "GenerationJob_expansionRequestId_fkey"
  FOREIGN KEY ("expansionRequestId") REFERENCES "ExpansionRequest"("requestId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GenerationJob" ADD CONSTRAINT "GenerationJob_mapId_fkey"
  FOREIGN KEY ("mapId") REFERENCES "WorldMap"("mapId") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CapacityMetric" ADD CONSTRAINT "CapacityMetric_mapId_fkey"
  FOREIGN KEY ("mapId") REFERENCES "WorldMap"("mapId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlayerMapAssignment" ADD CONSTRAINT "PlayerMapAssignment_mapId_fkey"
  FOREIGN KEY ("mapId") REFERENCES "WorldMap"("mapId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RelocationRequest" ADD CONSTRAINT "RelocationRequest_fromMapId_fkey"
  FOREIGN KEY ("fromMapId") REFERENCES "WorldMap"("mapId") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RelocationRequest" ADD CONSTRAINT "RelocationRequest_toMapId_fkey"
  FOREIGN KEY ("toMapId") REFERENCES "WorldMap"("mapId") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ValidationReport" ADD CONSTRAINT "ValidationReport_mapId_fkey"
  FOREIGN KEY ("mapId") REFERENCES "WorldMap"("mapId") ON DELETE CASCADE ON UPDATE CASCADE;
