-- Marketplace / supply economy extensions

CREATE TYPE "MarketplaceListingKind" AS ENUM ('EGG', 'PET', 'ITEM');
CREATE TYPE "MarketplaceListingCategory" AS ENUM ('EGGS', 'PETS', 'EQUIPMENT', 'CONSUMABLES', 'PROPERTY');
CREATE TYPE "ListingBundleMode" AS ENUM ('PET_ONLY', 'PET_PLUS_LOADOUT');
CREATE TYPE "EggSourceKind" AS ENUM ('STARTER', 'OFFICIAL_SEASONAL', 'STORY_ACHIEVEMENT', 'BREEDING', 'COMMUNITY_EVENT', 'LIMITED_COLLECTOR');

-- Egg supply fields
ALTER TABLE "Egg" ADD COLUMN "sourceKind" "EggSourceKind" NOT NULL DEFAULT 'STARTER';
ALTER TABLE "Egg" ADD COLUMN "generation" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Egg" ADD COLUMN "accountBound" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Egg" ADD COLUMN "sellable" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Egg" ADD COLUMN "parentACreatureId" TEXT;
ALTER TABLE "Egg" ADD COLUMN "parentBCreatureId" TEXT;
ALTER TABLE "Egg" ADD COLUMN "tradeCooldownUntil" TIMESTAMP(3);
CREATE INDEX "Egg_sourceKind_status_idx" ON "Egg"("sourceKind", "status");

-- Creature breeding / generation fields
ALTER TABLE "Creature" ADD COLUMN "generation" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Creature" ADD COLUMN "founderStatus" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Creature" ADD COLUMN "breedingUsesRemaining" INTEGER NOT NULL DEFAULT 5;
ALTER TABLE "Creature" ADD COLUMN "lastBredAt" TIMESTAMP(3);
ALTER TABLE "Creature" ADD COLUMN "seasonalOrigin" TEXT;
CREATE INDEX "Creature_generation_idx" ON "Creature"("generation");

-- Marketplace listing extensions
ALTER TABLE "MarketplaceListing" ADD COLUMN "publicId" TEXT;
UPDATE "MarketplaceListing" SET "publicId" = "id" WHERE "publicId" IS NULL;
ALTER TABLE "MarketplaceListing" ALTER COLUMN "publicId" SET NOT NULL;
CREATE UNIQUE INDEX "MarketplaceListing_publicId_key" ON "MarketplaceListing"("publicId");

ALTER TABLE "MarketplaceListing" ADD COLUMN "eggId" TEXT;
ALTER TABLE "MarketplaceListing" ADD COLUMN "kind" "MarketplaceListingKind" NOT NULL DEFAULT 'PET';
ALTER TABLE "MarketplaceListing" ADD COLUMN "category" "MarketplaceListingCategory" NOT NULL DEFAULT 'PETS';
ALTER TABLE "MarketplaceListing" ADD COLUMN "subfilter" TEXT;
ALTER TABLE "MarketplaceListing" ADD COLUMN "bundleMode" "ListingBundleMode";
ALTER TABLE "MarketplaceListing" ADD COLUMN "priceLamports" TEXT NOT NULL DEFAULT '0';
ALTER TABLE "MarketplaceListing" ADD COLUMN "listingFeeLamports" TEXT NOT NULL DEFAULT '0';
ALTER TABLE "MarketplaceListing" ADD COLUMN "disclosureJson" JSONB;
ALTER TABLE "MarketplaceListing" ADD COLUMN "ownershipVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "MarketplaceListing" ADD COLUMN "washRiskScore" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX "MarketplaceListing_kind_status_idx" ON "MarketplaceListing"("kind", "status");
CREATE INDEX "MarketplaceListing_category_status_idx" ON "MarketplaceListing"("category", "status");
CREATE INDEX "MarketplaceListing_eggId_idx" ON "MarketplaceListing"("eggId");

ALTER TABLE "MarketplaceListing" ADD CONSTRAINT "MarketplaceListing_eggId_fkey"
  FOREIGN KEY ("eggId") REFERENCES "Egg"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "MarketplaceListingBundleItem" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "listingId" TEXT NOT NULL,
  "itemKey" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "slot" TEXT,
  "selectedBySeller" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "MarketplaceListingBundleItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MarketplaceListingBundleItem_listingId_idx" ON "MarketplaceListingBundleItem"("listingId");
CREATE UNIQUE INDEX "MarketplaceListingBundleItem_listingId_itemKey_key" ON "MarketplaceListingBundleItem"("listingId", "itemKey");
ALTER TABLE "MarketplaceListingBundleItem" ADD CONSTRAINT "MarketplaceListingBundleItem_listingId_fkey"
  FOREIGN KEY ("listingId") REFERENCES "MarketplaceListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MarketplaceSale" ADD COLUMN "priceLamports" TEXT NOT NULL DEFAULT '0';
ALTER TABLE "MarketplaceSale" ADD COLUMN "feeLamports" TEXT NOT NULL DEFAULT '0';
ALTER TABLE "MarketplaceSale" ADD COLUMN "settlementMode" TEXT NOT NULL DEFAULT 'DEMO_CREDITS';
ALTER TABLE "MarketplaceSale" ADD COLUMN "raritySnapshot" TEXT;
ALTER TABLE "MarketplaceSale" ADD COLUMN "speciesSlug" TEXT;
CREATE INDEX "MarketplaceSale_createdAt_idx" ON "MarketplaceSale"("createdAt");
CREATE INDEX "MarketplaceSale_raritySnapshot_createdAt_idx" ON "MarketplaceSale"("raritySnapshot", "createdAt");
CREATE INDEX "MarketplaceSale_speciesSlug_createdAt_idx" ON "MarketplaceSale"("speciesSlug", "createdAt");

CREATE TABLE "EggSupplyCounter" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "sourceKind" "EggSourceKind" NOT NULL,
  "sourceKey" TEXT NOT NULL,
  "totalReleased" INTEGER NOT NULL DEFAULT 0,
  "releasedToday" INTEGER NOT NULL DEFAULT 0,
  "releasedThisWeek" INTEGER NOT NULL DEFAULT 0,
  "dayKey" TEXT NOT NULL DEFAULT '',
  "weekKey" TEXT NOT NULL DEFAULT '',
  CONSTRAINT "EggSupplyCounter_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EggSupplyCounter_sourceKind_key" ON "EggSupplyCounter"("sourceKind");
CREATE INDEX "EggSupplyCounter_sourceKey_idx" ON "EggSupplyCounter"("sourceKey");

CREATE TABLE "AssetTradeCooldown" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "assetKind" TEXT NOT NULL,
  "assetId" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "cooldownUntil" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AssetTradeCooldown_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AssetTradeCooldown_assetKind_assetId_key" ON "AssetTradeCooldown"("assetKind", "assetId");
CREATE INDEX "AssetTradeCooldown_ownerId_cooldownUntil_idx" ON "AssetTradeCooldown"("ownerId", "cooldownUntil");

CREATE TABLE "MarketplaceCancelCooldown" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "sellerId" TEXT NOT NULL,
  "assetKind" TEXT NOT NULL,
  "assetId" TEXT NOT NULL,
  "cooldownUntil" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MarketplaceCancelCooldown_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MarketplaceCancelCooldown_sellerId_assetKind_assetId_key"
  ON "MarketplaceCancelCooldown"("sellerId", "assetKind", "assetId");
CREATE INDEX "MarketplaceCancelCooldown_cooldownUntil_idx" ON "MarketplaceCancelCooldown"("cooldownUntil");

ALTER TABLE "BreedingRecord" ADD COLUMN "feeUseIndex" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "BreedingRecord" ADD COLUMN "offspringGeneration" INTEGER NOT NULL DEFAULT 2;
ALTER TABLE "BreedingRecord" ADD COLUMN "rarityGuaranteed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "BreedingRecord" ADD COLUMN "feeSplitJson" JSONB;
ALTER TABLE "BreedingRecord" ADD COLUMN "requestId" TEXT;
CREATE UNIQUE INDEX "BreedingRecord_requestId_key" ON "BreedingRecord"("requestId");
CREATE INDEX "BreedingRecord_createdAt_idx" ON "BreedingRecord"("createdAt");
