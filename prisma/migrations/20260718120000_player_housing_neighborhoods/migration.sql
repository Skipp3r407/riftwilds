-- Player Housing + Neighborhoods
-- PREPARED ONLY — do not apply to production without approval.
-- Runtime hot path is in-memory; enable PLAYER_HOUSING_PRISMA_ENABLED /
-- PLAYER_NEIGHBORHOODS_PRISMA_ENABLED only after migrate deploy.

-- Housing
CREATE TABLE "PlayerHome" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "publicId" TEXT NOT NULL,
  "ownerUserId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "propertyTier" TEXT NOT NULL,
  "acquisition" TEXT NOT NULL,
  "plotId" TEXT,
  "neighborhoodId" TEXT,
  "visitPolicy" TEXT NOT NULL DEFAULT 'FRIENDS',
  "themeKey" TEXT,
  "exteriorFacadeKey" TEXT,
  "musicAmbient" TEXT,
  "lightingGlobal" TEXT NOT NULL DEFAULT 'day_hearth',
  "likes" INTEGER NOT NULL DEFAULT 0,
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "expansionLevel" INTEGER NOT NULL DEFAULT 0,
  "revision" INTEGER NOT NULL DEFAULT 1,
  "stateJson" JSONB,
  CONSTRAINT "PlayerHome_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PlayerHome_publicId_key" ON "PlayerHome"("publicId");
CREATE UNIQUE INDEX "PlayerHome_ownerUserId_key" ON "PlayerHome"("ownerUserId");
CREATE INDEX "PlayerHome_neighborhoodId_idx" ON "PlayerHome"("neighborhoodId");
CREATE INDEX "PlayerHome_visitPolicy_featured_idx" ON "PlayerHome"("visitPolicy", "featured");

CREATE TABLE "HomeInstance" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "homeId" TEXT NOT NULL,
  "ownerUserId" TEXT NOT NULL,
  "instanceKey" TEXT NOT NULL,
  "entryKind" TEXT NOT NULL DEFAULT 'door',
  "worldMapId" TEXT,
  "worldPosX" INTEGER,
  "worldPosY" INTEGER,
  "metadataJson" JSONB,
  CONSTRAINT "HomeInstance_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "HomeInstance_homeId_key" ON "HomeInstance"("homeId");
CREATE UNIQUE INDEX "HomeInstance_instanceKey_key" ON "HomeInstance"("instanceKey");
CREATE INDEX "HomeInstance_ownerUserId_idx" ON "HomeInstance"("ownerUserId");
ALTER TABLE "HomeInstance" ADD CONSTRAINT "HomeInstance_homeId_fkey"
  FOREIGN KEY ("homeId") REFERENCES "PlayerHome"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "HomeRoom" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "homeId" TEXT NOT NULL,
  "roomKey" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "unlocked" BOOLEAN NOT NULL DEFAULT false,
  "wallKey" TEXT NOT NULL DEFAULT 'wall_timber',
  "floorKey" TEXT NOT NULL DEFAULT 'floor_plank',
  "lightingPreset" TEXT NOT NULL DEFAULT 'hearth_warm',
  "musicTrack" TEXT,
  "weatherThroughWindows" BOOLEAN NOT NULL DEFAULT true,
  "isSecret" BOOLEAN NOT NULL DEFAULT false,
  "layoutJson" JSONB,
  CONSTRAINT "HomeRoom_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "HomeRoom_homeId_roomKey_key" ON "HomeRoom"("homeId", "roomKey");
ALTER TABLE "HomeRoom" ADD CONSTRAINT "HomeRoom_homeId_fkey"
  FOREIGN KEY ("homeId") REFERENCES "PlayerHome"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "HomeFurniture" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "homeId" TEXT NOT NULL,
  "roomKey" TEXT NOT NULL,
  "instanceId" TEXT NOT NULL,
  "skuKey" TEXT NOT NULL,
  "posX" INTEGER NOT NULL DEFAULT 0,
  "posY" INTEGER NOT NULL DEFAULT 0,
  "rotation" INTEGER NOT NULL DEFAULT 0,
  "scale" DOUBLE PRECISION NOT NULL DEFAULT 1,
  "layer" INTEGER NOT NULL DEFAULT 1,
  "locked" BOOLEAN NOT NULL DEFAULT false,
  "metadataJson" JSONB,
  CONSTRAINT "HomeFurniture_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "HomeFurniture_instanceId_key" ON "HomeFurniture"("instanceId");
CREATE INDEX "HomeFurniture_homeId_roomKey_idx" ON "HomeFurniture"("homeId", "roomKey");
CREATE INDEX "HomeFurniture_skuKey_idx" ON "HomeFurniture"("skuKey");
ALTER TABLE "HomeFurniture" ADD CONSTRAINT "HomeFurniture_homeId_fkey"
  FOREIGN KEY ("homeId") REFERENCES "PlayerHome"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "HomeStorageSlot" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "homeId" TEXT NOT NULL,
  "slotId" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "itemKey" TEXT NOT NULL,
  "qty" INTEGER NOT NULL DEFAULT 0,
  "depositToken" TEXT NOT NULL,
  "metadataJson" JSONB,
  CONSTRAINT "HomeStorageSlot_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "HomeStorageSlot_slotId_key" ON "HomeStorageSlot"("slotId");
CREATE UNIQUE INDEX "HomeStorageSlot_homeId_category_itemKey_key" ON "HomeStorageSlot"("homeId", "category", "itemKey");
CREATE INDEX "HomeStorageSlot_depositToken_idx" ON "HomeStorageSlot"("depositToken");
ALTER TABLE "HomeStorageSlot" ADD CONSTRAINT "HomeStorageSlot_homeId_fkey"
  FOREIGN KEY ("homeId") REFERENCES "PlayerHome"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "HomeVisitor" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "homeId" TEXT NOT NULL,
  "visitorId" TEXT NOT NULL,
  "liked" BOOLEAN NOT NULL DEFAULT false,
  "rating" INTEGER,
  "guestbookNote" TEXT,
  "emoteUsed" TEXT,
  CONSTRAINT "HomeVisitor_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "HomeVisitor_homeId_createdAt_idx" ON "HomeVisitor"("homeId", "createdAt");
ALTER TABLE "HomeVisitor" ADD CONSTRAINT "HomeVisitor_homeId_fkey"
  FOREIGN KEY ("homeId") REFERENCES "PlayerHome"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "HomePermission" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "homeId" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "subjectId" TEXT,
  "flagsJson" JSONB NOT NULL,
  CONSTRAINT "HomePermission_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "HomePermission_homeId_role_idx" ON "HomePermission"("homeId", "role");
ALTER TABLE "HomePermission" ADD CONSTRAINT "HomePermission_homeId_fkey"
  FOREIGN KEY ("homeId") REFERENCES "PlayerHome"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "HomeBlueprint" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "blueprintId" TEXT NOT NULL,
  "homeId" TEXT NOT NULL,
  "ownerUserId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "roomSnapshotJson" JSONB NOT NULL,
  "creditsPrice" INTEGER,
  "listed" BOOLEAN NOT NULL DEFAULT false,
  "hash" TEXT NOT NULL,
  CONSTRAINT "HomeBlueprint_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "HomeBlueprint_blueprintId_key" ON "HomeBlueprint"("blueprintId");
CREATE INDEX "HomeBlueprint_hash_idx" ON "HomeBlueprint"("hash");
ALTER TABLE "HomeBlueprint" ADD CONSTRAINT "HomeBlueprint_homeId_fkey"
  FOREIGN KEY ("homeId") REFERENCES "PlayerHome"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "HomeRating" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "homeId" TEXT NOT NULL,
  "raterId" TEXT NOT NULL,
  "score" INTEGER NOT NULL,
  "note" TEXT,
  CONSTRAINT "HomeRating_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "HomeRating_homeId_raterId_key" ON "HomeRating"("homeId", "raterId");
ALTER TABLE "HomeRating" ADD CONSTRAINT "HomeRating_homeId_fkey"
  FOREIGN KEY ("homeId") REFERENCES "PlayerHome"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "HomeEvent" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "homeId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "startsAt" TIMESTAMP(3) NOT NULL,
  "endsAt" TIMESTAMP(3) NOT NULL,
  "invitePolicy" TEXT NOT NULL,
  CONSTRAINT "HomeEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "HomeEvent_homeId_startsAt_idx" ON "HomeEvent"("homeId", "startsAt");
ALTER TABLE "HomeEvent" ADD CONSTRAINT "HomeEvent_homeId_fkey"
  FOREIGN KEY ("homeId") REFERENCES "PlayerHome"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "HomeGardenPlot" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "homeId" TEXT NOT NULL,
  "plotKey" TEXT NOT NULL,
  "cropKey" TEXT,
  "plantedAt" TIMESTAMP(3),
  "readyAt" TIMESTAMP(3),
  CONSTRAINT "HomeGardenPlot_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "HomeGardenPlot_homeId_plotKey_key" ON "HomeGardenPlot"("homeId", "plotKey");
ALTER TABLE "HomeGardenPlot" ADD CONSTRAINT "HomeGardenPlot_homeId_fkey"
  FOREIGN KEY ("homeId") REFERENCES "PlayerHome"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "HomeNpc" (
  "id" TEXT NOT NULL,
  "homeId" TEXT NOT NULL,
  "npcKey" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "roomKey" TEXT NOT NULL,
  CONSTRAINT "HomeNpc_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "HomeNpc_homeId_idx" ON "HomeNpc"("homeId");
ALTER TABLE "HomeNpc" ADD CONSTRAINT "HomeNpc_homeId_fkey"
  FOREIGN KEY ("homeId") REFERENCES "PlayerHome"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Neighborhoods
CREATE TABLE "PlayerNeighborhood" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "neighborhoodId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "regionSlug" TEXT NOT NULL,
  "mapId" TEXT NOT NULL,
  "stage" TEXT NOT NULL DEFAULT 'hamlet',
  "occupiedHomes" INTEGER NOT NULL DEFAULT 0,
  "plotCap" INTEGER NOT NULL DEFAULT 36,
  "reputation" INTEGER NOT NULL DEFAULT 0,
  "seasonalDecorTheme" TEXT,
  "sharedRoads" BOOLEAN NOT NULL DEFAULT true,
  "lightingPreset" TEXT NOT NULL DEFAULT 'lantern_dusk',
  "stateJson" JSONB,
  CONSTRAINT "PlayerNeighborhood_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PlayerNeighborhood_neighborhoodId_key" ON "PlayerNeighborhood"("neighborhoodId");

CREATE TABLE "NeighborhoodDistrict" (
  "id" TEXT NOT NULL,
  "neighborhoodPk" TEXT NOT NULL,
  "districtId" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "flavor" TEXT NOT NULL,
  "plotIdsJson" JSONB NOT NULL,
  CONSTRAINT "NeighborhoodDistrict_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "NeighborhoodDistrict_neighborhoodPk_districtId_key"
  ON "NeighborhoodDistrict"("neighborhoodPk", "districtId");
ALTER TABLE "NeighborhoodDistrict" ADD CONSTRAINT "NeighborhoodDistrict_neighborhoodPk_fkey"
  FOREIGN KEY ("neighborhoodPk") REFERENCES "PlayerNeighborhood"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "PlayerPlot" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "plotId" TEXT NOT NULL,
  "neighborhoodPk" TEXT NOT NULL,
  "districtId" TEXT NOT NULL,
  "ownerUserId" TEXT,
  "deedSize" TEXT NOT NULL,
  "col" INTEGER NOT NULL,
  "row" INTEGER NOT NULL,
  "biome" TEXT NOT NULL,
  "elevation" TEXT NOT NULL,
  "roadAccess" BOOLEAN NOT NULL DEFAULT true,
  "waterAccess" BOOLEAN NOT NULL DEFAULT false,
  "buildLimit" INTEGER NOT NULL,
  "decorLimit" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'vacant',
  "homeId" TEXT,
  "exteriorFacadeKey" TEXT,
  "mailbox" BOOLEAN NOT NULL DEFAULT true,
  "abandonedWarnedAt" TIMESTAMP(3),
  "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PlayerPlot_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PlayerPlot_plotId_key" ON "PlayerPlot"("plotId");
CREATE INDEX "PlayerPlot_neighborhoodPk_status_idx" ON "PlayerPlot"("neighborhoodPk", "status");
CREATE INDEX "PlayerPlot_ownerUserId_idx" ON "PlayerPlot"("ownerUserId");
ALTER TABLE "PlayerPlot" ADD CONSTRAINT "PlayerPlot_neighborhoodPk_fkey"
  FOREIGN KEY ("neighborhoodPk") REFERENCES "PlayerNeighborhood"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "CommunityProject" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "projectId" TEXT NOT NULL,
  "neighborhoodPk" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "goalMaterials" INTEGER NOT NULL,
  "donatedMaterials" INTEGER NOT NULL DEFAULT 0,
  "completed" BOOLEAN NOT NULL DEFAULT false,
  "worldStateKey" TEXT NOT NULL,
  CONSTRAINT "CommunityProject_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CommunityProject_projectId_key" ON "CommunityProject"("projectId");
ALTER TABLE "CommunityProject" ADD CONSTRAINT "CommunityProject_neighborhoodPk_fkey"
  FOREIGN KEY ("neighborhoodPk") REFERENCES "PlayerNeighborhood"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "PlayerContribution" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "neighborhoodPk" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "materials" INTEGER NOT NULL,
  "projectId" TEXT,
  CONSTRAINT "PlayerContribution_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "PlayerContribution_neighborhoodPk_createdAt_idx" ON "PlayerContribution"("neighborhoodPk", "createdAt");
ALTER TABLE "PlayerContribution" ADD CONSTRAINT "PlayerContribution_neighborhoodPk_fkey"
  FOREIGN KEY ("neighborhoodPk") REFERENCES "PlayerNeighborhood"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "PublicBuilding" (
  "id" TEXT NOT NULL,
  "neighborhoodPk" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "unlocked" BOOLEAN NOT NULL DEFAULT false,
  "unlockStage" TEXT NOT NULL,
  CONSTRAINT "PublicBuilding_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PublicBuilding_neighborhoodPk_key_key" ON "PublicBuilding"("neighborhoodPk", "key");
ALTER TABLE "PublicBuilding" ADD CONSTRAINT "PublicBuilding_neighborhoodPk_fkey"
  FOREIGN KEY ("neighborhoodPk") REFERENCES "PlayerNeighborhood"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "PlayerStore" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "storeId" TEXT NOT NULL,
  "neighborhoodPk" TEXT NOT NULL,
  "plotId" TEXT NOT NULL,
  "ownerUserId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "hours" TEXT NOT NULL,
  "displayItemsJson" JSONB NOT NULL,
  "open" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "PlayerStore_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PlayerStore_storeId_key" ON "PlayerStore"("storeId");
ALTER TABLE "PlayerStore" ADD CONSTRAINT "PlayerStore_neighborhoodPk_fkey"
  FOREIGN KEY ("neighborhoodPk") REFERENCES "PlayerNeighborhood"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "PlayerGovernment" (
  "id" TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "neighborhoodPk" TEXT NOT NULL,
  "mayorUserId" TEXT,
  "councilJson" JSONB NOT NULL,
  "motionsJson" JSONB NOT NULL,
  CONSTRAINT "PlayerGovernment_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PlayerGovernment_neighborhoodPk_key" ON "PlayerGovernment"("neighborhoodPk");
ALTER TABLE "PlayerGovernment" ADD CONSTRAINT "PlayerGovernment_neighborhoodPk_fkey"
  FOREIGN KEY ("neighborhoodPk") REFERENCES "PlayerNeighborhood"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "NeighborhoodEvent" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "neighborhoodPk" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "startsAt" TIMESTAMP(3) NOT NULL,
  "endsAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "NeighborhoodEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "NeighborhoodEvent_neighborhoodPk_startsAt_idx" ON "NeighborhoodEvent"("neighborhoodPk", "startsAt");
ALTER TABLE "NeighborhoodEvent" ADD CONSTRAINT "NeighborhoodEvent_neighborhoodPk_fkey"
  FOREIGN KEY ("neighborhoodPk") REFERENCES "PlayerNeighborhood"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "NeighborhoodLandmark" (
  "id" TEXT NOT NULL,
  "landmarkId" TEXT NOT NULL,
  "neighborhoodPk" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "col" INTEGER NOT NULL,
  "row" INTEGER NOT NULL,
  "seasonalDecor" TEXT,
  CONSTRAINT "NeighborhoodLandmark_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "NeighborhoodLandmark_landmarkId_key" ON "NeighborhoodLandmark"("landmarkId");
ALTER TABLE "NeighborhoodLandmark" ADD CONSTRAINT "NeighborhoodLandmark_neighborhoodPk_fkey"
  FOREIGN KEY ("neighborhoodPk") REFERENCES "PlayerNeighborhood"("id") ON DELETE CASCADE ON UPDATE CASCADE;
