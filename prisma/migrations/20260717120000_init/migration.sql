-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "TokenTier" AS ENUM ('VISITOR', 'KEEPER', 'RANGER', 'WARDEN', 'FOUNDER');

-- CreateEnum
CREATE TYPE "Rarity" AS ENUM ('COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC', 'CELESTIAL');

-- CreateEnum
CREATE TYPE "AffinityName" AS ENUM ('EMBER', 'TIDE', 'GROVE', 'STORM', 'STONE', 'FROST', 'RADIANT', 'VOID', 'ALLOY', 'SPIRIT');

-- CreateEnum
CREATE TYPE "MatchupResult" AS ENUM ('STRONG', 'WEAK', 'RESIST', 'NEUTRAL');

-- CreateEnum
CREATE TYPE "EggClass" AS ENUM ('WILD', 'EMBER', 'TIDE', 'GROVE', 'STORM', 'ANCIENT', 'VOID', 'CELESTIAL', 'EVENT');

-- CreateEnum
CREATE TYPE "EggAcquisitionMethod" AS ENUM ('STARTER_CLAIM', 'QUEST_REWARD', 'EVENT', 'ADMIN_PROMO', 'SHOP', 'ALLOWLIST');

-- CreateEnum
CREATE TYPE "EggStatus" AS ENUM ('UNCLAIMED', 'OWNED', 'INCUBATING', 'READY', 'HATCHED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "CreatureLifecycle" AS ENUM ('THRIVING', 'HAPPY', 'STABLE', 'TIRED', 'NEGLECTED', 'DORMANT', 'CRITICAL', 'MEMORIALIZED', 'RETIRED');

-- CreateEnum
CREATE TYPE "AbilityCategory" AS ENUM ('STRIKE', 'GUARD', 'RESTORE', 'CONTROL', 'BOOST', 'WEAKEN', 'FIELD');

-- CreateEnum
CREATE TYPE "ItemCategory" AS ENUM ('FOOD', 'CARE', 'TRAINING', 'EXPLORATION', 'BATTLE', 'CRAFTING', 'EVOLUTION', 'COSMETIC', 'EVENT', 'QUEST', 'WEAPON', 'ARMOR', 'POTION', 'SCROLL', 'MATERIAL', 'RECOVERY');

-- CreateEnum
CREATE TYPE "QuestCategory" AS ENUM ('STORY', 'DAILY', 'WEEKLY', 'EXPLORATION', 'CARE', 'BATTLE', 'COLLECTION', 'COMMUNITY', 'EVENT');

-- CreateEnum
CREATE TYPE "BattleStatus" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'FORFEITED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "MarketplaceListingStatus" AS ENUM ('ACTIVE', 'SOLD', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "CraftingJobStatus" AS ENUM ('QUEUED', 'IN_PROGRESS', 'READY', 'CLAIMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RandomnessSource" AS ENUM ('SERVER_CSPRNG', 'FUTURE_VRF');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('EGG_READY', 'CARE_NEEDED', 'DORMANT', 'QUEST_COMPLETE', 'MARKETPLACE_SALE', 'MARKETPLACE_PURCHASE', 'EVOLUTION_AVAILABLE', 'REGION_UNLOCKED', 'EVENT_BEGIN', 'BOSS_MILESTONE', 'TIER_CHANGED', 'SYSTEM');

-- CreateEnum
CREATE TYPE "LeaderboardKind" AS ENUM ('PLAYER_LEVEL', 'COLLECTION', 'BATTLE_RATING', 'QUEST_POINTS', 'CARE_STREAK', 'CREATURE_BOND', 'RARE_DISCOVERIES', 'EVENT_POINTS', 'BOSS_CONTRIBUTION', 'MARKETPLACE_VOLUME');

-- CreateEnum
CREATE TYPE "SeasonScope" AS ENUM ('WEEKLY', 'SEASONAL', 'ALL_TIME');

-- CreateEnum
CREATE TYPE "AllocationBucket" AS ENUM ('GROWTH', 'PET_REWARDS', 'OPERATIONS', 'EVENTS', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "RevenueDepositStatus" AS ENUM ('PENDING', 'VERIFIED', 'ALLOCATED', 'REJECTED', 'REVERSED');

-- CreateEnum
CREATE TYPE "RewardEpochStatus" AS ENUM ('SCHEDULED', 'SNAPSHOTTING', 'FINALIZED', 'CLAIMABLE', 'CLOSED', 'PAUSED');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('PENDING', 'CLAIMABLE', 'CLAIMED', 'EXPIRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "primaryWalletId" TEXT,
    "role" TEXT NOT NULL DEFAULT 'player',
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "banReason" TEXT,
    "suspiciousScore" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "network" TEXT NOT NULL DEFAULT 'devnet',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "lastSeenAt" TIMESTAMP(3),

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthNonce" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "wallet" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "ipHash" TEXT,

    CONSTRAINT "AuthNonce_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "userAgentHash" TEXT,
    "ipHash" TEXT,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerProfile" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT,
    "displayName" TEXT,
    "avatarKey" TEXT,
    "bio" TEXT,
    "level" INTEGER NOT NULL DEFAULT 1,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "rankTitle" TEXT NOT NULL DEFAULT 'Hatchling Keeper',
    "tokenTier" "TokenTier" NOT NULL DEFAULT 'VISITOR',
    "joinDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inventoryCapacity" INTEGER NOT NULL DEFAULT 40,
    "creatureCapacity" INTEGER NOT NULL DEFAULT 12,
    "publicProfile" BOOLEAN NOT NULL DEFAULT true,
    "starterEggClaimed" BOOLEAN NOT NULL DEFAULT false,
    "demoCredits" INTEGER NOT NULL DEFAULT 10000,
    "softCurrency" INTEGER NOT NULL DEFAULT 0,
    "careStreak" INTEGER NOT NULL DEFAULT 0,
    "battleRating" INTEGER NOT NULL DEFAULT 1000,
    "questPoints" INTEGER NOT NULL DEFAULT 0,
    "eventPoints" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PlayerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerSettings" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "reducedMotion" BOOLEAN NOT NULL DEFAULT false,
    "soundEnabled" BOOLEAN NOT NULL DEFAULT true,
    "musicVolume" INTEGER NOT NULL DEFAULT 70,
    "sfxVolume" INTEGER NOT NULL DEFAULT 80,
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "emailOptIn" BOOLEAN NOT NULL DEFAULT false,
    "skipHatchAnimations" BOOLEAN NOT NULL DEFAULT false,
    "lowPowerMode" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT NOT NULL DEFAULT 'en',

    CONSTRAINT "PlayerSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokenBalanceSnapshot" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "wallet" TEXT NOT NULL,
    "mint" TEXT NOT NULL,
    "amountRaw" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL,
    "tier" "TokenTier" NOT NULL,
    "slot" BIGINT,
    "source" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "TokenBalanceSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokenGateRule" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tier" "TokenTier" NOT NULL,
    "minAmount" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "benefits" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TokenGateRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Affinity" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" "AffinityName" NOT NULL,
    "slug" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "colorHex" TEXT NOT NULL,
    "iconKey" TEXT NOT NULL,

    CONSTRAINT "Affinity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AffinityMatchup" (
    "id" TEXT NOT NULL,
    "attackerAffinityId" TEXT NOT NULL,
    "defenderAffinityId" TEXT NOT NULL,
    "result" "MatchupResult" NOT NULL,
    "modifierBps" INTEGER NOT NULL DEFAULT 10000,

    CONSTRAINT "AffinityMatchup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatureSpecies" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "internalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "loreDescription" TEXT NOT NULL,
    "primaryAffinityId" TEXT NOT NULL,
    "secondaryAffinityId" TEXT,
    "baseRarity" "Rarity" NOT NULL,
    "baseStats" JSONB NOT NULL,
    "growthRates" JSONB NOT NULL,
    "maxLevel" INTEGER NOT NULL DEFAULT 50,
    "hatchWeight" INTEGER NOT NULL DEFAULT 100,
    "habitat" TEXT NOT NULL,
    "temperament" TEXT NOT NULL,
    "preferredFood" TEXT NOT NULL,
    "idleAnimationKey" TEXT NOT NULL,
    "battleAnimationKeys" JSONB NOT NULL,
    "soundKeys" JSONB NOT NULL,
    "spritePath" TEXT NOT NULL,
    "artworkPath" TEXT NOT NULL,
    "passiveAbilityKey" TEXT NOT NULL,
    "generation" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "prismaticChanceBps" INTEGER NOT NULL DEFAULT 50,

    CONSTRAINT "CreatureSpecies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatureVariant" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "speciesId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "artworkPath" TEXT NOT NULL,
    "isPrismatic" BOOLEAN NOT NULL DEFAULT false,
    "weight" INTEGER NOT NULL DEFAULT 100,

    CONSTRAINT "CreatureVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatureAbility" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "affinityId" TEXT,
    "category" "AbilityCategory" NOT NULL,
    "basePower" INTEGER NOT NULL DEFAULT 0,
    "accuracy" INTEGER NOT NULL DEFAULT 100,
    "energyCost" INTEGER NOT NULL DEFAULT 0,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "cooldownTurns" INTEGER NOT NULL DEFAULT 0,
    "target" TEXT NOT NULL DEFAULT 'OPPONENT',
    "statusEffect" TEXT,
    "animationKey" TEXT NOT NULL,
    "soundKey" TEXT NOT NULL,
    "aiWeight" INTEGER NOT NULL DEFAULT 100,
    "unlockLevel" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "CreatureAbility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpeciesAbility" (
    "id" TEXT NOT NULL,
    "speciesId" TEXT NOT NULL,
    "abilityId" TEXT NOT NULL,
    "slot" INTEGER NOT NULL,
    "unlockLevel" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "SpeciesAbility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvolutionRule" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fromSpeciesId" TEXT NOT NULL,
    "toSpeciesId" TEXT NOT NULL,
    "branchKey" TEXT NOT NULL,
    "minLevel" INTEGER NOT NULL DEFAULT 1,
    "requiredBond" INTEGER,
    "requiredItemKey" TEXT,
    "requiredQuestId" TEXT,
    "requiredAffinity" "AffinityName",
    "timeOfDay" TEXT,
    "irreversible" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT NOT NULL,

    CONSTRAINT "EvolutionRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OddsVersion" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "odds" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "OddsVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EggType" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "key" TEXT NOT NULL,
    "eggClass" "EggClass" NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "appearanceKey" TEXT NOT NULL,
    "incubationHours" INTEGER NOT NULL DEFAULT 6,
    "possibleAffinities" JSONB NOT NULL,
    "possibleRarities" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "EggType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Egg" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT,
    "eggTypeId" TEXT NOT NULL,
    "eggClass" "EggClass" NOT NULL,
    "acquisitionMethod" "EggAcquisitionMethod" NOT NULL,
    "acquisitionAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "incubationStartedAt" TIMESTAMP(3),
    "hatchReadyAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "status" "EggStatus" NOT NULL DEFAULT 'OWNED',
    "appearanceKey" TEXT NOT NULL,
    "oddsVersionId" TEXT NOT NULL,
    "txReference" TEXT,
    "metadata" JSONB,
    "careBoostCosmeticBps" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Egg_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HatchAttempt" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "eggId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "randomnessSource" "RandomnessSource" NOT NULL DEFAULT 'SERVER_CSPRNG',
    "rollValue" INTEGER NOT NULL,
    "oddsVersionId" TEXT NOT NULL,
    "rarity" "Rarity" NOT NULL,
    "speciesId" TEXT NOT NULL,
    "variantKey" TEXT,
    "isPrismatic" BOOLEAN NOT NULL DEFAULT false,
    "integrityHash" TEXT NOT NULL,
    "serverSignature" TEXT,
    "resultPayload" JSONB NOT NULL,

    CONSTRAINT "HatchAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Creature" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "creatureNumber" INTEGER NOT NULL,
    "customName" TEXT,
    "speciesId" TEXT NOT NULL,
    "variantId" TEXT,
    "ownerId" TEXT NOT NULL,
    "originalOwnerId" TEXT NOT NULL,
    "eggId" TEXT,
    "rarity" "Rarity" NOT NULL,
    "isPrismatic" BOOLEAN NOT NULL DEFAULT false,
    "level" INTEGER NOT NULL DEFAULT 1,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "lifecycle" "CreatureLifecycle" NOT NULL DEFAULT 'STABLE',
    "hunger" INTEGER NOT NULL DEFAULT 80,
    "happiness" INTEGER NOT NULL DEFAULT 80,
    "hygiene" INTEGER NOT NULL DEFAULT 80,
    "energy" INTEGER NOT NULL DEFAULT 80,
    "bond" INTEGER NOT NULL DEFAULT 20,
    "health" INTEGER NOT NULL DEFAULT 100,
    "maxHealth" INTEGER NOT NULL DEFAULT 100,
    "mood" TEXT NOT NULL DEFAULT 'curious',
    "ageHours" INTEGER NOT NULL DEFAULT 0,
    "careStreak" INTEGER NOT NULL DEFAULT 0,
    "lastCareAt" TIMESTAMP(3),
    "lastDecayAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "protectionUntil" TIMESTAMP(3),
    "hatchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "battleWins" INTEGER NOT NULL DEFAULT 0,
    "battleLosses" INTEGER NOT NULL DEFAULT 0,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "isOnActiveTeam" BOOLEAN NOT NULL DEFAULT false,
    "teamSlot" INTEGER,
    "cosmeticSkinKey" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Creature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatureLearnedAbility" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatureId" TEXT NOT NULL,
    "abilityId" TEXT NOT NULL,
    "slot" INTEGER NOT NULL,

    CONSTRAINT "CreatureLearnedAbility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatureStatSnapshot" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatureId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "stats" JSONB NOT NULL,
    "reason" TEXT NOT NULL,

    CONSTRAINT "CreatureStatSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatureCareEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatureId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "deltas" JSONB NOT NULL,
    "itemKey" TEXT,
    "requestId" TEXT NOT NULL,

    CONSTRAINT "CreatureCareEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatureStatusEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatureId" TEXT NOT NULL,
    "fromStatus" "CreatureLifecycle",
    "toStatus" "CreatureLifecycle" NOT NULL,
    "reason" TEXT NOT NULL,

    CONSTRAINT "CreatureStatusEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatureEvolution" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatureId" TEXT NOT NULL,
    "fromSpeciesId" TEXT NOT NULL,
    "toSpeciesId" TEXT NOT NULL,
    "branchKey" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,

    CONSTRAINT "CreatureEvolution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "ItemCategory" NOT NULL,
    "stackable" BOOLEAN NOT NULL DEFAULT true,
    "maxStack" INTEGER NOT NULL DEFAULT 99,
    "tradeable" BOOLEAN NOT NULL DEFAULT true,
    "boundOnAcquire" BOOLEAN NOT NULL DEFAULT false,
    "iconPath" TEXT NOT NULL,
    "rarity" "Rarity" NOT NULL DEFAULT 'COMMON',
    "metadata" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "bound" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemTransaction" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "ItemTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipmentSlot" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EquipmentSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatureEquipment" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatureId" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,

    CONSTRAINT "CreatureEquipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recipe" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "outputItemId" TEXT NOT NULL,
    "outputQuantity" INTEGER NOT NULL DEFAULT 1,
    "craftDurationSec" INTEGER NOT NULL DEFAULT 60,
    "minPlayerLevel" INTEGER NOT NULL DEFAULT 1,
    "requiredRegionKey" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeIngredient" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "RecipeIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CraftingJob" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "status" "CraftingJobStatus" NOT NULL DEFAULT 'QUEUED',
    "startedAt" TIMESTAMP(3),
    "readyAt" TIMESTAMP(3),
    "claimedAt" TIMESTAMP(3),
    "requestId" TEXT NOT NULL,

    CONSTRAINT "CraftingJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Region" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPlayable" BOOLEAN NOT NULL DEFAULT false,
    "unlockLevel" INTEGER NOT NULL DEFAULT 1,
    "unlockTier" "TokenTier" NOT NULL DEFAULT 'VISITOR',
    "mapAssetKey" TEXT NOT NULL,
    "musicKey" TEXT,
    "comingLater" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MapDefinition" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "regionId" TEXT NOT NULL,
    "tilemapPath" TEXT NOT NULL,
    "collisionKey" TEXT NOT NULL,
    "spawnZones" JSONB NOT NULL,
    "npcSpawns" JSONB NOT NULL,
    "pickupSpawns" JSONB NOT NULL,
    "portals" JSONB NOT NULL,

    CONSTRAINT "MapDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerRegionProgress" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "unlocked" BOOLEAN NOT NULL DEFAULT false,
    "discoveryPct" INTEGER NOT NULL DEFAULT 0,
    "lastVisitedAt" TIMESTAMP(3),
    "checkpointJson" JSONB,

    CONSTRAINT "PlayerRegionProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Encounter" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "wildSpeciesId" TEXT,
    "hostility" INTEGER NOT NULL DEFAULT 50,
    "resonance" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "seed" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "result" TEXT,
    "requestId" TEXT NOT NULL,

    CONSTRAINT "Encounter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EncounterAction" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "encounterId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "payload" JSONB,
    "requestId" TEXT NOT NULL,

    CONSTRAINT "EncounterAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Battle" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'PVE',
    "status" "BattleStatus" NOT NULL DEFAULT 'PENDING',
    "challengerId" TEXT NOT NULL,
    "defenderId" TEXT,
    "encounterId" TEXT,
    "seed" TEXT NOT NULL,
    "randomnessRecord" JSONB NOT NULL,
    "turnNumber" INTEGER NOT NULL DEFAULT 0,
    "winnerUserId" TEXT,
    "expiresAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Battle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BattleParticipant" (
    "id" TEXT NOT NULL,
    "battleId" TEXT NOT NULL,
    "creatureId" TEXT,
    "side" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,
    "currentHp" INTEGER NOT NULL,
    "currentEnergy" INTEGER NOT NULL,
    "fainted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "BattleParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BattleTurn" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "battleId" TEXT NOT NULL,
    "turnNumber" INTEGER NOT NULL,
    "actions" JSONB NOT NULL,
    "resultLog" JSONB NOT NULL,

    CONSTRAINT "BattleTurn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BattleAction" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "battleId" TEXT,
    "turnId" TEXT NOT NULL,
    "actorSide" TEXT NOT NULL,
    "abilityKey" TEXT,
    "payload" JSONB NOT NULL,
    "requestId" TEXT NOT NULL,

    CONSTRAINT "BattleAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BattleEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "battleId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,

    CONSTRAINT "BattleEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quest" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "QuestCategory" NOT NULL,
    "chainKey" TEXT,
    "requirements" JSONB NOT NULL,
    "startConditions" JSONB NOT NULL,
    "expirationHours" INTEGER,
    "repeatable" BOOLEAN NOT NULL DEFAULT false,
    "regionId" TEXT,
    "npcKey" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Quest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestObjective" (
    "id" TEXT NOT NULL,
    "questId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetCount" INTEGER NOT NULL DEFAULT 1,
    "metric" TEXT NOT NULL,

    CONSTRAINT "QuestObjective_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestReward" (
    "id" TEXT NOT NULL,
    "questId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "payload" JSONB NOT NULL,

    CONSTRAINT "QuestReward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerQuest" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "questId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "claimedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "PlayerQuest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerQuestProgress" (
    "id" TEXT NOT NULL,
    "playerQuestId" TEXT NOT NULL,
    "objectiveId" TEXT NOT NULL,
    "currentCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PlayerQuestProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconKey" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 10,
    "criteria" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerAchievement" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketplaceListing" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sellerId" TEXT NOT NULL,
    "creatureId" TEXT,
    "itemId" TEXT,
    "priceCredits" INTEGER NOT NULL,
    "feeCredits" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'DEMO_CREDITS',
    "status" "MarketplaceListingStatus" NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MarketplaceListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketplaceSale" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "listingId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "priceCredits" INTEGER NOT NULL,
    "feeCredits" INTEGER NOT NULL,
    "requestId" TEXT NOT NULL,

    CONSTRAINT "MarketplaceSale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurrencyLedger" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "CurrencyLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardLedger" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "payload" JSONB NOT NULL,
    "requestId" TEXT NOT NULL,
    "legalOk" BOOLEAN NOT NULL DEFAULT false,
    "auditOk" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RewardLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WithdrawalRequest" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "amountRaw" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DISABLED',
    "reason" TEXT,

    CONSTRAINT "WithdrawalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Season" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "seasonId" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,

    CONSTRAINT "CommunityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityBoss" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "maxHealth" INTEGER NOT NULL,
    "currentHealth" INTEGER NOT NULL,
    "dailyAttemptCap" INTEGER NOT NULL DEFAULT 3,
    "artworkPath" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CommunityBoss_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BossAttempt" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bossId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "battleId" TEXT,
    "damageDealt" INTEGER NOT NULL DEFAULT 0,
    "requestId" TEXT NOT NULL,

    CONSTRAINT "BossAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaderboardEntry" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "kind" "LeaderboardKind" NOT NULL,
    "scope" "SeasonScope" NOT NULL DEFAULT 'ALL_TIME',
    "seasonId" TEXT,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "rank" INTEGER,
    "disqualified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LeaderboardEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Memorial" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creatureId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "epitaph" TEXT,
    "tribute" TEXT,
    "publicVisible" BOOLEAN NOT NULL DEFAULT true,
    "lifeHours" INTEGER NOT NULL,
    "favoriteItem" TEXT,
    "moderated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Memorial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "payload" JSONB,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "reason" TEXT,
    "metadata" JSONB,
    "requestId" TEXT,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAction" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "payload" JSONB,

    CONSTRAINT "AdminAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureFlag" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "note" TEXT,

    CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameSetting" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "GameSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemStatus" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "key" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskDisclosureVersion" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RiskDisclosureVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserDisclosureAcceptance" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "disclosureId" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserDisclosureAcceptance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModerationReport" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reporterId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',

    CONSTRAINT "ModerationReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdempotencyKey" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "key" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "response" JSONB,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IdempotencyKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "provider" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "processedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'RECEIVED',

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreasuryWallet" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "label" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "bucket" "AllocationBucket",
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "explorerUrl" TEXT,

    CONSTRAINT "TreasuryWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RevenueSource" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "RevenueSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RevenueDeposit" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sourceId" TEXT NOT NULL,
    "asset" TEXT NOT NULL,
    "amountRaw" TEXT NOT NULL,
    "wallet" TEXT NOT NULL,
    "txSignature" TEXT,
    "network" TEXT NOT NULL,
    "slot" BIGINT,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "status" "RevenueDepositStatus" NOT NULL DEFAULT 'PENDING',
    "policyVersion" INTEGER NOT NULL,
    "requestId" TEXT NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "RevenueDeposit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AllocationPolicy" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'demo',
    "effectiveAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AllocationPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AllocationPolicyEntry" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "bucket" "AllocationBucket" NOT NULL,
    "percentBps" INTEGER NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "AllocationPolicyEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreasuryAllocation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "depositId" TEXT NOT NULL,
    "bucket" "AllocationBucket" NOT NULL,
    "asset" TEXT NOT NULL,
    "amountRaw" TEXT NOT NULL,
    "wallet" TEXT NOT NULL,
    "policyVersion" INTEGER NOT NULL,
    "requestId" TEXT NOT NULL,
    "txSignature" TEXT,
    "network" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RECORDED',

    CONSTRAINT "TreasuryAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreasuryExpense" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bucket" "AllocationBucket" NOT NULL,
    "category" TEXT NOT NULL,
    "asset" TEXT NOT NULL,
    "amountRaw" TEXT NOT NULL,
    "wallet" TEXT NOT NULL,
    "recipientLabel" TEXT NOT NULL,
    "txSignature" TEXT,
    "network" TEXT NOT NULL,
    "slot" BIGINT,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "approvalStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "policyVersion" INTEGER NOT NULL,
    "requestId" TEXT NOT NULL,
    "explorerUrl" TEXT,

    CONSTRAINT "TreasuryExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketplaceFeePolicy" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "sellerBps" INTEGER NOT NULL,
    "growthBps" INTEGER NOT NULL,
    "petRewardBps" INTEGER NOT NULL,
    "operationsBps" INTEGER NOT NULL,
    "eventsBps" INTEGER NOT NULL,
    "effectiveAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "MarketplaceFeePolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardEpoch" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "key" TEXT NOT NULL,
    "status" "RewardEpochStatus" NOT NULL DEFAULT 'SCHEDULED',
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "snapshotAt" TIMESTAMP(3),
    "finalizedAt" TIMESTAMP(3),
    "poolAsset" TEXT NOT NULL DEFAULT 'DEMO_CREDITS',
    "poolAmountRaw" TEXT NOT NULL DEFAULT '0',
    "policyVersion" INTEGER NOT NULL,
    "formulaVersion" INTEGER NOT NULL DEFAULT 1,
    "eligibleCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RewardEpoch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PetRewardSelection" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "creatureId" TEXT NOT NULL,
    "slot" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PetRewardSelection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PetRewardAllocation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "epochId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "creatureId" TEXT NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "amountRaw" TEXT NOT NULL,
    "asset" TEXT NOT NULL,
    "eligible" BOOLEAN NOT NULL DEFAULT true,
    "ineligibleReason" TEXT,
    "requestId" TEXT NOT NULL,

    CONSTRAINT "PetRewardAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PetRewardClaim" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "epochId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amountRaw" TEXT NOT NULL,
    "asset" TEXT NOT NULL,
    "status" "ClaimStatus" NOT NULL DEFAULT 'PENDING',
    "claimedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "txSignature" TEXT,
    "requestId" TEXT NOT NULL,
    "network" TEXT,

    CONSTRAINT "PetRewardClaim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PetCareState" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creatureId" TEXT NOT NULL,
    "hunger" INTEGER NOT NULL DEFAULT 80,
    "happiness" INTEGER NOT NULL DEFAULT 80,
    "hygiene" INTEGER NOT NULL DEFAULT 80,
    "energy" INTEGER NOT NULL DEFAULT 80,
    "health" INTEGER NOT NULL DEFAULT 100,
    "bond" INTEGER NOT NULL DEFAULT 20,
    "condition" TEXT NOT NULL DEFAULT 'HEALTHY',
    "lastFedAt" TIMESTAMP(3),
    "lastCleanedAt" TIMESTAMP(3),
    "lastPlayedAt" TIMESTAMP(3),
    "lastRestedAt" TIMESTAMP(3),
    "lastDecayAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextStatusAt" TIMESTAMP(3),
    "rewardEligible" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PetCareState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PetCareDeadline" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatureId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "PetCareDeadline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PetStatusTransition" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatureId" TEXT NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "serverTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PetStatusTransition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EconomyMetric" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "key" TEXT NOT NULL,
    "asset" TEXT NOT NULL,
    "amountRaw" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "isDemo" BOOLEAN NOT NULL DEFAULT true,
    "observedAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "EconomyMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReconciliationRun" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "finishedAt" TIMESTAMP(3),
    "notes" TEXT,
    "diffJson" JSONB,
    "requestId" TEXT NOT NULL,

    CONSTRAINT "ReconciliationRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArenaSeason" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "balanceVersion" INTEGER NOT NULL DEFAULT 1,
    "affinityVersion" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "ArenaSeason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArenaRating" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 1500,
    "ratingDev" DOUBLE PRECISION NOT NULL DEFAULT 350,
    "volatility" DOUBLE PRECISION NOT NULL DEFAULT 0.06,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "placementsLeft" INTEGER NOT NULL DEFAULT 5,
    "rankTitle" TEXT NOT NULL DEFAULT 'Scout',

    CONSTRAINT "ArenaRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArenaPointLedger" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "seasonId" TEXT,
    "delta" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "battlePublicId" TEXT,
    "metadata" JSONB,
    "nonTransferable" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ArenaPointLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArenaBattle" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publicId" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "ownerUserId" TEXT,
    "balanceVersion" INTEGER NOT NULL,
    "affinityVersion" INTEGER NOT NULL,
    "seedCommitment" TEXT NOT NULL,
    "seedReveal" TEXT,
    "winnerSide" TEXT,
    "completionReason" TEXT,
    "replayHash" TEXT,
    "antiCheatStatus" TEXT NOT NULL DEFAULT 'CLEAR',
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "stateSnapshot" JSONB,
    "eventsJson" JSONB,

    CONSTRAINT "ArenaBattle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DuelChallenge" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "challengerId" TEXT NOT NULL,
    "opponentId" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "rulesJson" JSONB,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "battlePublicId" TEXT,

    CONSTRAINT "DuelChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeaponDefinition" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "weaponClass" TEXT NOT NULL,
    "affinity" "AffinityName",
    "rarity" "Rarity" NOT NULL DEFAULT 'COMMON',
    "description" TEXT NOT NULL,
    "attackBonus" INTEGER NOT NULL DEFAULT 0,
    "defenseBonus" INTEGER NOT NULL DEFAULT 0,
    "speedBonus" INTEGER NOT NULL DEFAULT 0,
    "attachment" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "balanceVersion" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "WeaponDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeaponInstance" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "definitionId" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "creatureId" TEXT,
    "energyCharge" INTEGER NOT NULL DEFAULT 100,
    "cosmeticOnly" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "WeaponInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PetBattleLoadout" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "creatureId" TEXT,
    "name" TEXT NOT NULL DEFAULT 'Default',
    "weaponKey" TEXT,
    "armorKey" TEXT,
    "charmKey" TEXT,
    "cosmeticKey" TEXT,
    "abilityKeys" JSONB NOT NULL,
    "itemKeys" JSONB,

    CONSTRAINT "PetBattleLoadout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityPrediction" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "battleId" TEXT NOT NULL,
    "userId" TEXT,
    "sessionKey" TEXT,
    "choice" TEXT NOT NULL,
    "isEntertainmentOnly" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CommunityPrediction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BattleAuditLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "battleId" TEXT,
    "actorUserId" TEXT,
    "action" TEXT NOT NULL,
    "reason" TEXT,
    "payload" JSONB,

    CONSTRAINT "BattleAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArenaSuspension" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "until" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ArenaSuspension_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BalanceVersion" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" INTEGER NOT NULL,
    "notes" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT false,
    "configJson" JSONB NOT NULL,

    CONSTRAINT "BalanceVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AffinityMatrixVersion" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" INTEGER NOT NULL,
    "notes" TEXT NOT NULL,
    "matrixJson" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AffinityMatrixVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemPriceVersion" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "itemKey" TEXT NOT NULL,
    "priceLamports" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "reason" TEXT NOT NULL,
    "adminUserId" TEXT,

    CONSTRAINT "ItemPriceVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemSupply" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "itemKey" TEXT NOT NULL,
    "supplyMode" TEXT NOT NULL,
    "totalSupply" INTEGER,
    "remainingSupply" INTEGER,
    "saleStartsAt" TIMESTAMP(3),
    "saleEndsAt" TIMESTAMP(3),
    "maxPerWallet" INTEGER,

    CONSTRAINT "ItemSupply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentIntent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "requestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "itemKey" TEXT NOT NULL,
    "amountLamports" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "priceVersion" INTEGER NOT NULL,
    "feePolicyVersion" INTEGER,
    "metadata" JSONB,

    CONSTRAINT "PaymentIntent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentVerification" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentIntentId" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "slot" BIGINT,
    "network" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "verifiedAmountLamports" TEXT NOT NULL,
    "verifiedDestination" TEXT NOT NULL,
    "finalizedAt" TIMESTAMP(3),
    "rawJson" JSONB,

    CONSTRAINT "PaymentVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemPurchase" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "itemKey" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "amountLamports" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "slot" BIGINT,
    "network" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "priceVersion" INTEGER NOT NULL,
    "feePolicyVersion" INTEGER,
    "paymentIntentId" TEXT,
    "requestId" TEXT NOT NULL,
    "finalizedAt" TIMESTAMP(3),

    CONSTRAINT "ItemPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PetLoadout" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "publicPetId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Default',
    "weaponKey" TEXT,
    "armorKey" TEXT,
    "charmKey" TEXT,
    "cosmeticKey" TEXT,
    "ability1Key" TEXT,
    "ability2Key" TEXT,
    "ability3Key" TEXT,
    "ultimateKey" TEXT,
    "potion1Key" TEXT,
    "potion2Key" TEXT,

    CONSTRAINT "PetLoadout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryLedger" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "itemKey" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "InventoryLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RevenueAllocationPolicy" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "transactionType" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'demo',
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveUntil" TIMESTAMP(3),
    "totalBasisPoints" INTEGER NOT NULL DEFAULT 10000,
    "remainderDestination" TEXT NOT NULL DEFAULT 'GROWTH_RESERVE',
    "createdBy" TEXT,
    "approvedBy" TEXT,
    "reason" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RevenueAllocationPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RevenueAllocationEntry" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "destinationType" TEXT NOT NULL,
    "destinationWallet" TEXT,
    "basisPoints" INTEGER NOT NULL,
    "settlementMode" TEXT NOT NULL DEFAULT 'LEDGER',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "label" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#ffffff',

    CONSTRAINT "RevenueAllocationEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AllocationLedgerEntry" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentId" TEXT,
    "policyVersion" INTEGER NOT NULL,
    "transactionType" TEXT NOT NULL,
    "destinationType" TEXT NOT NULL,
    "rawGrossAmountLamports" TEXT NOT NULL,
    "basisPoints" INTEGER NOT NULL,
    "allocatedAmountLamports" TEXT NOT NULL,
    "roundingAdjustmentLamports" TEXT NOT NULL DEFAULT '0',
    "assetMint" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RECORDED',
    "settlementBatchId" TEXT,
    "requestId" TEXT NOT NULL,

    CONSTRAINT "AllocationLedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SettlementBatch" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "destinationType" TEXT NOT NULL,
    "destinationWallet" TEXT NOT NULL,
    "assetMint" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "grossAmountLamports" TEXT NOT NULL,
    "destinationAmountLamports" TEXT NOT NULL,
    "txSignature" TEXT,
    "slot" BIGINT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "finalizedAt" TIMESTAMP(3),

    CONSTRAINT "SettlementBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HolderRewardCarryover" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "amountLamports" TEXT NOT NULL,
    "sourceEpochKey" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "HolderRewardCarryover_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HolderRewardAdjustment" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "epochKey" TEXT NOT NULL,
    "amountLamports" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "relatedPaymentId" TEXT,
    "requestId" TEXT NOT NULL,

    CONSTRAINT "HolderRewardAdjustment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PetMemory" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatureId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "metadata" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PetMemory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guild" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "emblemKey" TEXT,
    "description" TEXT,
    "founderId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "Guild_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuildMember" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "GuildMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuildEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guildId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "kind" TEXT NOT NULL,

    CONSTRAINT "GuildEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Homestead" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publicId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "themeKey" TEXT,
    "visitPolicy" TEXT NOT NULL DEFAULT 'FRIENDS',

    CONSTRAINT "Homestead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomesteadRoom" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "homesteadId" TEXT NOT NULL,
    "roomKey" TEXT NOT NULL,
    "unlocked" BOOLEAN NOT NULL DEFAULT false,
    "layoutJson" JSONB,

    CONSTRAINT "HomesteadRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BreedingRecord" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "parentAId" TEXT NOT NULL,
    "parentBId" TEXT NOT NULL,
    "eggId" TEXT,
    "ownerUserId" TEXT NOT NULL,
    "feeLamports" TEXT NOT NULL DEFAULT '0',
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "previewJson" JSONB,

    CONSTRAINT "BreedingRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityVote" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publicId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "opensAt" TIMESTAMP(3),
    "closesAt" TIMESTAMP(3),
    "controlsTreasury" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CommunityVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerBusiness" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publicId" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "reputation" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PlayerBusiness_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_primaryWalletId_key" ON "User"("primaryWalletId");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "Wallet_userId_idx" ON "Wallet"("userId");

-- CreateIndex
CREATE INDEX "Wallet_address_idx" ON "Wallet"("address");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_address_network_key" ON "Wallet"("address", "network");

-- CreateIndex
CREATE UNIQUE INDEX "AuthNonce_nonce_key" ON "AuthNonce"("nonce");

-- CreateIndex
CREATE INDEX "AuthNonce_wallet_idx" ON "AuthNonce"("wallet");

-- CreateIndex
CREATE INDEX "AuthNonce_expiresAt_idx" ON "AuthNonce"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerProfile_userId_key" ON "PlayerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerProfile_username_key" ON "PlayerProfile"("username");

-- CreateIndex
CREATE INDEX "PlayerProfile_level_idx" ON "PlayerProfile"("level");

-- CreateIndex
CREATE INDEX "PlayerProfile_tokenTier_idx" ON "PlayerProfile"("tokenTier");

-- CreateIndex
CREATE INDEX "PlayerProfile_battleRating_idx" ON "PlayerProfile"("battleRating");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerSettings_userId_key" ON "PlayerSettings"("userId");

-- CreateIndex
CREATE INDEX "TokenBalanceSnapshot_userId_createdAt_idx" ON "TokenBalanceSnapshot"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "TokenBalanceSnapshot_wallet_mint_idx" ON "TokenBalanceSnapshot"("wallet", "mint");

-- CreateIndex
CREATE UNIQUE INDEX "TokenGateRule_tier_key" ON "TokenGateRule"("tier");

-- CreateIndex
CREATE UNIQUE INDEX "Affinity_name_key" ON "Affinity"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Affinity_slug_key" ON "Affinity"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "AffinityMatchup_attackerAffinityId_defenderAffinityId_key" ON "AffinityMatchup"("attackerAffinityId", "defenderAffinityId");

-- CreateIndex
CREATE UNIQUE INDEX "CreatureSpecies_internalId_key" ON "CreatureSpecies"("internalId");

-- CreateIndex
CREATE UNIQUE INDEX "CreatureSpecies_slug_key" ON "CreatureSpecies"("slug");

-- CreateIndex
CREATE INDEX "CreatureSpecies_baseRarity_idx" ON "CreatureSpecies"("baseRarity");

-- CreateIndex
CREATE INDEX "CreatureSpecies_isActive_idx" ON "CreatureSpecies"("isActive");

-- CreateIndex
CREATE INDEX "CreatureSpecies_hatchWeight_idx" ON "CreatureSpecies"("hatchWeight");

-- CreateIndex
CREATE UNIQUE INDEX "CreatureVariant_speciesId_key_key" ON "CreatureVariant"("speciesId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "CreatureAbility_key_key" ON "CreatureAbility"("key");

-- CreateIndex
CREATE UNIQUE INDEX "SpeciesAbility_speciesId_slot_key" ON "SpeciesAbility"("speciesId", "slot");

-- CreateIndex
CREATE UNIQUE INDEX "SpeciesAbility_speciesId_abilityId_key" ON "SpeciesAbility"("speciesId", "abilityId");

-- CreateIndex
CREATE UNIQUE INDEX "EvolutionRule_fromSpeciesId_branchKey_key" ON "EvolutionRule"("fromSpeciesId", "branchKey");

-- CreateIndex
CREATE UNIQUE INDEX "OddsVersion_version_key" ON "OddsVersion"("version");

-- CreateIndex
CREATE UNIQUE INDEX "EggType_key_key" ON "EggType"("key");

-- CreateIndex
CREATE INDEX "Egg_ownerId_status_idx" ON "Egg"("ownerId", "status");

-- CreateIndex
CREATE INDEX "Egg_status_hatchReadyAt_idx" ON "Egg"("status", "hatchReadyAt");

-- CreateIndex
CREATE UNIQUE INDEX "Egg_ownerId_acquisitionMethod_txReference_key" ON "Egg"("ownerId", "acquisitionMethod", "txReference");

-- CreateIndex
CREATE UNIQUE INDEX "HatchAttempt_requestId_key" ON "HatchAttempt"("requestId");

-- CreateIndex
CREATE INDEX "HatchAttempt_userId_createdAt_idx" ON "HatchAttempt"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "HatchAttempt_eggId_idx" ON "HatchAttempt"("eggId");

-- CreateIndex
CREATE UNIQUE INDEX "Creature_eggId_key" ON "Creature"("eggId");

-- CreateIndex
CREATE INDEX "Creature_ownerId_lifecycle_idx" ON "Creature"("ownerId", "lifecycle");

-- CreateIndex
CREATE INDEX "Creature_speciesId_idx" ON "Creature"("speciesId");

-- CreateIndex
CREATE INDEX "Creature_rarity_idx" ON "Creature"("rarity");

-- CreateIndex
CREATE INDEX "Creature_isOnActiveTeam_idx" ON "Creature"("isOnActiveTeam");

-- CreateIndex
CREATE UNIQUE INDEX "Creature_ownerId_creatureNumber_key" ON "Creature"("ownerId", "creatureNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CreatureLearnedAbility_creatureId_slot_key" ON "CreatureLearnedAbility"("creatureId", "slot");

-- CreateIndex
CREATE UNIQUE INDEX "CreatureLearnedAbility_creatureId_abilityId_key" ON "CreatureLearnedAbility"("creatureId", "abilityId");

-- CreateIndex
CREATE INDEX "CreatureStatSnapshot_creatureId_createdAt_idx" ON "CreatureStatSnapshot"("creatureId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CreatureCareEvent_requestId_key" ON "CreatureCareEvent"("requestId");

-- CreateIndex
CREATE INDEX "CreatureCareEvent_creatureId_createdAt_idx" ON "CreatureCareEvent"("creatureId", "createdAt");

-- CreateIndex
CREATE INDEX "CreatureStatusEvent_creatureId_createdAt_idx" ON "CreatureStatusEvent"("creatureId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CreatureEvolution_requestId_key" ON "CreatureEvolution"("requestId");

-- CreateIndex
CREATE INDEX "CreatureEvolution_creatureId_idx" ON "CreatureEvolution"("creatureId");

-- CreateIndex
CREATE UNIQUE INDEX "Item_key_key" ON "Item"("key");

-- CreateIndex
CREATE INDEX "InventoryItem_userId_idx" ON "InventoryItem"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItem_userId_itemId_bound_key" ON "InventoryItem"("userId", "itemId", "bound");

-- CreateIndex
CREATE UNIQUE INDEX "ItemTransaction_requestId_key" ON "ItemTransaction"("requestId");

-- CreateIndex
CREATE INDEX "ItemTransaction_userId_createdAt_idx" ON "ItemTransaction"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "EquipmentSlot_key_key" ON "EquipmentSlot"("key");

-- CreateIndex
CREATE UNIQUE INDEX "CreatureEquipment_creatureId_slotId_key" ON "CreatureEquipment"("creatureId", "slotId");

-- CreateIndex
CREATE UNIQUE INDEX "Recipe_key_key" ON "Recipe"("key");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeIngredient_recipeId_itemId_key" ON "RecipeIngredient"("recipeId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "CraftingJob_requestId_key" ON "CraftingJob"("requestId");

-- CreateIndex
CREATE INDEX "CraftingJob_userId_status_idx" ON "CraftingJob"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Region_key_key" ON "Region"("key");

-- CreateIndex
CREATE UNIQUE INDEX "MapDefinition_regionId_key" ON "MapDefinition"("regionId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerRegionProgress_userId_regionId_key" ON "PlayerRegionProgress"("userId", "regionId");

-- CreateIndex
CREATE UNIQUE INDEX "Encounter_requestId_key" ON "Encounter"("requestId");

-- CreateIndex
CREATE INDEX "Encounter_userId_status_idx" ON "Encounter"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "EncounterAction_requestId_key" ON "EncounterAction"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "Battle_encounterId_key" ON "Battle"("encounterId");

-- CreateIndex
CREATE INDEX "Battle_challengerId_status_idx" ON "Battle"("challengerId", "status");

-- CreateIndex
CREATE INDEX "Battle_status_expiresAt_idx" ON "Battle"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "BattleParticipant_battleId_idx" ON "BattleParticipant"("battleId");

-- CreateIndex
CREATE UNIQUE INDEX "BattleTurn_battleId_turnNumber_key" ON "BattleTurn"("battleId", "turnNumber");

-- CreateIndex
CREATE UNIQUE INDEX "BattleAction_requestId_key" ON "BattleAction"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "BattleEvent_battleId_sequence_key" ON "BattleEvent"("battleId", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "Quest_key_key" ON "Quest"("key");

-- CreateIndex
CREATE UNIQUE INDEX "QuestObjective_questId_key_key" ON "QuestObjective"("questId", "key");

-- CreateIndex
CREATE INDEX "PlayerQuest_userId_status_idx" ON "PlayerQuest"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerQuest_userId_questId_acceptedAt_key" ON "PlayerQuest"("userId", "questId", "acceptedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerQuestProgress_playerQuestId_objectiveId_key" ON "PlayerQuestProgress"("playerQuestId", "objectiveId");

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_key_key" ON "Achievement"("key");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerAchievement_userId_achievementId_key" ON "PlayerAchievement"("userId", "achievementId");

-- CreateIndex
CREATE INDEX "MarketplaceListing_status_createdAt_idx" ON "MarketplaceListing"("status", "createdAt");

-- CreateIndex
CREATE INDEX "MarketplaceListing_sellerId_idx" ON "MarketplaceListing"("sellerId");

-- CreateIndex
CREATE INDEX "MarketplaceListing_priceCredits_idx" ON "MarketplaceListing"("priceCredits");

-- CreateIndex
CREATE UNIQUE INDEX "MarketplaceSale_listingId_key" ON "MarketplaceSale"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "MarketplaceSale_requestId_key" ON "MarketplaceSale"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "CurrencyLedger_requestId_key" ON "CurrencyLedger"("requestId");

-- CreateIndex
CREATE INDEX "CurrencyLedger_userId_createdAt_idx" ON "CurrencyLedger"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RewardLedger_requestId_key" ON "RewardLedger"("requestId");

-- CreateIndex
CREATE INDEX "RewardLedger_userId_createdAt_idx" ON "RewardLedger"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Season_key_key" ON "Season"("key");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityEvent_key_key" ON "CommunityEvent"("key");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityBoss_eventId_key" ON "CommunityBoss"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "BossAttempt_battleId_key" ON "BossAttempt"("battleId");

-- CreateIndex
CREATE UNIQUE INDEX "BossAttempt_requestId_key" ON "BossAttempt"("requestId");

-- CreateIndex
CREATE INDEX "BossAttempt_bossId_userId_createdAt_idx" ON "BossAttempt"("bossId", "userId", "createdAt");

-- CreateIndex
CREATE INDEX "LeaderboardEntry_kind_scope_score_idx" ON "LeaderboardEntry"("kind", "scope", "score");

-- CreateIndex
CREATE UNIQUE INDEX "LeaderboardEntry_kind_scope_seasonId_userId_key" ON "LeaderboardEntry"("kind", "scope", "seasonId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Memorial_creatureId_key" ON "Memorial"("creatureId");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AdminAction_adminId_createdAt_idx" ON "AdminAction"("adminId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureFlag_key_key" ON "FeatureFlag"("key");

-- CreateIndex
CREATE UNIQUE INDEX "GameSetting_key_key" ON "GameSetting"("key");

-- CreateIndex
CREATE UNIQUE INDEX "SystemStatus_key_key" ON "SystemStatus"("key");

-- CreateIndex
CREATE UNIQUE INDEX "RiskDisclosureVersion_version_key" ON "RiskDisclosureVersion"("version");

-- CreateIndex
CREATE UNIQUE INDEX "UserDisclosureAcceptance_userId_disclosureId_key" ON "UserDisclosureAcceptance"("userId", "disclosureId");

-- CreateIndex
CREATE INDEX "ModerationReport_status_createdAt_idx" ON "ModerationReport"("status", "createdAt");

-- CreateIndex
CREATE INDEX "IdempotencyKey_expiresAt_idx" ON "IdempotencyKey"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "IdempotencyKey_userId_key_route_key" ON "IdempotencyKey"("userId", "key", "route");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookEvent_provider_eventId_key" ON "WebhookEvent"("provider", "eventId");

-- CreateIndex
CREATE INDEX "TreasuryWallet_bucket_idx" ON "TreasuryWallet"("bucket");

-- CreateIndex
CREATE UNIQUE INDEX "TreasuryWallet_address_network_key" ON "TreasuryWallet"("address", "network");

-- CreateIndex
CREATE UNIQUE INDEX "RevenueSource_key_key" ON "RevenueSource"("key");

-- CreateIndex
CREATE UNIQUE INDEX "RevenueDeposit_requestId_key" ON "RevenueDeposit"("requestId");

-- CreateIndex
CREATE INDEX "RevenueDeposit_status_createdAt_idx" ON "RevenueDeposit"("status", "createdAt");

-- CreateIndex
CREATE INDEX "RevenueDeposit_txSignature_idx" ON "RevenueDeposit"("txSignature");

-- CreateIndex
CREATE UNIQUE INDEX "AllocationPolicy_version_key" ON "AllocationPolicy"("version");

-- CreateIndex
CREATE UNIQUE INDEX "AllocationPolicyEntry_policyId_bucket_key" ON "AllocationPolicyEntry"("policyId", "bucket");

-- CreateIndex
CREATE UNIQUE INDEX "TreasuryAllocation_requestId_key" ON "TreasuryAllocation"("requestId");

-- CreateIndex
CREATE INDEX "TreasuryAllocation_bucket_createdAt_idx" ON "TreasuryAllocation"("bucket", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TreasuryExpense_requestId_key" ON "TreasuryExpense"("requestId");

-- CreateIndex
CREATE INDEX "TreasuryExpense_bucket_timestamp_idx" ON "TreasuryExpense"("bucket", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "MarketplaceFeePolicy_version_key" ON "MarketplaceFeePolicy"("version");

-- CreateIndex
CREATE UNIQUE INDEX "RewardEpoch_key_key" ON "RewardEpoch"("key");

-- CreateIndex
CREATE INDEX "PetRewardSelection_userId_active_idx" ON "PetRewardSelection"("userId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "PetRewardSelection_userId_slot_key" ON "PetRewardSelection"("userId", "slot");

-- CreateIndex
CREATE UNIQUE INDEX "PetRewardSelection_userId_creatureId_key" ON "PetRewardSelection"("userId", "creatureId");

-- CreateIndex
CREATE UNIQUE INDEX "PetRewardAllocation_requestId_key" ON "PetRewardAllocation"("requestId");

-- CreateIndex
CREATE INDEX "PetRewardAllocation_userId_epochId_idx" ON "PetRewardAllocation"("userId", "epochId");

-- CreateIndex
CREATE UNIQUE INDEX "PetRewardAllocation_epochId_creatureId_key" ON "PetRewardAllocation"("epochId", "creatureId");

-- CreateIndex
CREATE UNIQUE INDEX "PetRewardClaim_requestId_key" ON "PetRewardClaim"("requestId");

-- CreateIndex
CREATE INDEX "PetRewardClaim_status_expiresAt_idx" ON "PetRewardClaim"("status", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "PetRewardClaim_epochId_userId_key" ON "PetRewardClaim"("epochId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "PetCareState_creatureId_key" ON "PetCareState"("creatureId");

-- CreateIndex
CREATE INDEX "PetCareDeadline_creatureId_dueAt_idx" ON "PetCareDeadline"("creatureId", "dueAt");

-- CreateIndex
CREATE INDEX "PetStatusTransition_creatureId_createdAt_idx" ON "PetStatusTransition"("creatureId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "EconomyMetric_key_asset_network_key" ON "EconomyMetric"("key", "asset", "network");

-- CreateIndex
CREATE UNIQUE INDEX "ReconciliationRun_requestId_key" ON "ReconciliationRun"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "ArenaSeason_key_key" ON "ArenaSeason"("key");

-- CreateIndex
CREATE INDEX "ArenaRating_seasonId_rating_idx" ON "ArenaRating"("seasonId", "rating");

-- CreateIndex
CREATE UNIQUE INDEX "ArenaRating_userId_seasonId_key" ON "ArenaRating"("userId", "seasonId");

-- CreateIndex
CREATE INDEX "ArenaPointLedger_userId_createdAt_idx" ON "ArenaPointLedger"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ArenaPointLedger_battlePublicId_idx" ON "ArenaPointLedger"("battlePublicId");

-- CreateIndex
CREATE UNIQUE INDEX "ArenaBattle_publicId_key" ON "ArenaBattle"("publicId");

-- CreateIndex
CREATE INDEX "ArenaBattle_mode_status_idx" ON "ArenaBattle"("mode", "status");

-- CreateIndex
CREATE INDEX "ArenaBattle_ownerUserId_createdAt_idx" ON "ArenaBattle"("ownerUserId", "createdAt");

-- CreateIndex
CREATE INDEX "DuelChallenge_opponentId_status_idx" ON "DuelChallenge"("opponentId", "status");

-- CreateIndex
CREATE INDEX "DuelChallenge_challengerId_status_idx" ON "DuelChallenge"("challengerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "WeaponDefinition_key_key" ON "WeaponDefinition"("key");

-- CreateIndex
CREATE INDEX "WeaponInstance_ownerUserId_idx" ON "WeaponInstance"("ownerUserId");

-- CreateIndex
CREATE INDEX "PetBattleLoadout_userId_idx" ON "PetBattleLoadout"("userId");

-- CreateIndex
CREATE INDEX "CommunityPrediction_battleId_idx" ON "CommunityPrediction"("battleId");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityPrediction_battleId_userId_key" ON "CommunityPrediction"("battleId", "userId");

-- CreateIndex
CREATE INDEX "BattleAuditLog_createdAt_idx" ON "BattleAuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "ArenaSuspension_userId_active_idx" ON "ArenaSuspension"("userId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "BalanceVersion_version_key" ON "BalanceVersion"("version");

-- CreateIndex
CREATE UNIQUE INDEX "AffinityMatrixVersion_version_key" ON "AffinityMatrixVersion"("version");

-- CreateIndex
CREATE INDEX "ItemPriceVersion_itemKey_active_idx" ON "ItemPriceVersion"("itemKey", "active");

-- CreateIndex
CREATE UNIQUE INDEX "ItemPriceVersion_itemKey_version_key" ON "ItemPriceVersion"("itemKey", "version");

-- CreateIndex
CREATE UNIQUE INDEX "ItemSupply_itemKey_key" ON "ItemSupply"("itemKey");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentIntent_requestId_key" ON "PaymentIntent"("requestId");

-- CreateIndex
CREATE INDEX "PaymentIntent_userId_status_idx" ON "PaymentIntent"("userId", "status");

-- CreateIndex
CREATE INDEX "PaymentIntent_expiresAt_idx" ON "PaymentIntent"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentVerification_paymentIntentId_key" ON "PaymentVerification"("paymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentVerification_signature_key" ON "PaymentVerification"("signature");

-- CreateIndex
CREATE UNIQUE INDEX "ItemPurchase_signature_key" ON "ItemPurchase"("signature");

-- CreateIndex
CREATE UNIQUE INDEX "ItemPurchase_paymentIntentId_key" ON "ItemPurchase"("paymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "ItemPurchase_requestId_key" ON "ItemPurchase"("requestId");

-- CreateIndex
CREATE INDEX "ItemPurchase_userId_createdAt_idx" ON "ItemPurchase"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "PetLoadout_publicPetId_idx" ON "PetLoadout"("publicPetId");

-- CreateIndex
CREATE UNIQUE INDEX "PetLoadout_userId_publicPetId_name_key" ON "PetLoadout"("userId", "publicPetId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryLedger_requestId_key" ON "InventoryLedger"("requestId");

-- CreateIndex
CREATE INDEX "InventoryLedger_userId_createdAt_idx" ON "InventoryLedger"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "RevenueAllocationPolicy_transactionType_active_idx" ON "RevenueAllocationPolicy"("transactionType", "active");

-- CreateIndex
CREATE UNIQUE INDEX "RevenueAllocationPolicy_transactionType_version_key" ON "RevenueAllocationPolicy"("transactionType", "version");

-- CreateIndex
CREATE UNIQUE INDEX "RevenueAllocationEntry_policyId_destinationType_key" ON "RevenueAllocationEntry"("policyId", "destinationType");

-- CreateIndex
CREATE UNIQUE INDEX "AllocationLedgerEntry_requestId_key" ON "AllocationLedgerEntry"("requestId");

-- CreateIndex
CREATE INDEX "AllocationLedgerEntry_transactionType_createdAt_idx" ON "AllocationLedgerEntry"("transactionType", "createdAt");

-- CreateIndex
CREATE INDEX "AllocationLedgerEntry_settlementBatchId_idx" ON "AllocationLedgerEntry"("settlementBatchId");

-- CreateIndex
CREATE INDEX "AllocationLedgerEntry_paymentId_idx" ON "AllocationLedgerEntry"("paymentId");

-- CreateIndex
CREATE INDEX "SettlementBatch_status_createdAt_idx" ON "SettlementBatch"("status", "createdAt");

-- CreateIndex
CREATE INDEX "HolderRewardCarryover_userId_status_idx" ON "HolderRewardCarryover"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "HolderRewardAdjustment_requestId_key" ON "HolderRewardAdjustment"("requestId");

-- CreateIndex
CREATE INDEX "PetMemory_creatureId_occurredAt_idx" ON "PetMemory"("creatureId", "occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "Guild_publicId_key" ON "Guild"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Guild_slug_key" ON "Guild"("slug");

-- CreateIndex
CREATE INDEX "Guild_status_idx" ON "Guild"("status");

-- CreateIndex
CREATE INDEX "GuildMember_userId_idx" ON "GuildMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GuildMember_guildId_userId_key" ON "GuildMember"("guildId", "userId");

-- CreateIndex
CREATE INDEX "GuildEvent_guildId_startsAt_idx" ON "GuildEvent"("guildId", "startsAt");

-- CreateIndex
CREATE UNIQUE INDEX "Homestead_publicId_key" ON "Homestead"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Homestead_userId_key" ON "Homestead"("userId");

-- CreateIndex
CREATE INDEX "Homestead_userId_idx" ON "Homestead"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "HomesteadRoom_homesteadId_roomKey_key" ON "HomesteadRoom"("homesteadId", "roomKey");

-- CreateIndex
CREATE INDEX "BreedingRecord_ownerUserId_createdAt_idx" ON "BreedingRecord"("ownerUserId", "createdAt");

-- CreateIndex
CREATE INDEX "BreedingRecord_parentAId_idx" ON "BreedingRecord"("parentAId");

-- CreateIndex
CREATE INDEX "BreedingRecord_parentBId_idx" ON "BreedingRecord"("parentBId");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityVote_publicId_key" ON "CommunityVote"("publicId");

-- CreateIndex
CREATE INDEX "CommunityVote_status_closesAt_idx" ON "CommunityVote"("status", "closesAt");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerBusiness_publicId_key" ON "PlayerBusiness"("publicId");

-- CreateIndex
CREATE INDEX "PlayerBusiness_ownerUserId_status_idx" ON "PlayerBusiness"("ownerUserId", "status");

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthNonce" ADD CONSTRAINT "AuthNonce_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerProfile" ADD CONSTRAINT "PlayerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerSettings" ADD CONSTRAINT "PlayerSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenBalanceSnapshot" ADD CONSTRAINT "TokenBalanceSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffinityMatchup" ADD CONSTRAINT "AffinityMatchup_attackerAffinityId_fkey" FOREIGN KEY ("attackerAffinityId") REFERENCES "Affinity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffinityMatchup" ADD CONSTRAINT "AffinityMatchup_defenderAffinityId_fkey" FOREIGN KEY ("defenderAffinityId") REFERENCES "Affinity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureSpecies" ADD CONSTRAINT "CreatureSpecies_primaryAffinityId_fkey" FOREIGN KEY ("primaryAffinityId") REFERENCES "Affinity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureSpecies" ADD CONSTRAINT "CreatureSpecies_secondaryAffinityId_fkey" FOREIGN KEY ("secondaryAffinityId") REFERENCES "Affinity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureVariant" ADD CONSTRAINT "CreatureVariant_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "CreatureSpecies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureAbility" ADD CONSTRAINT "CreatureAbility_affinityId_fkey" FOREIGN KEY ("affinityId") REFERENCES "Affinity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpeciesAbility" ADD CONSTRAINT "SpeciesAbility_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "CreatureSpecies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpeciesAbility" ADD CONSTRAINT "SpeciesAbility_abilityId_fkey" FOREIGN KEY ("abilityId") REFERENCES "CreatureAbility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvolutionRule" ADD CONSTRAINT "EvolutionRule_fromSpeciesId_fkey" FOREIGN KEY ("fromSpeciesId") REFERENCES "CreatureSpecies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvolutionRule" ADD CONSTRAINT "EvolutionRule_toSpeciesId_fkey" FOREIGN KEY ("toSpeciesId") REFERENCES "CreatureSpecies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Egg" ADD CONSTRAINT "Egg_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Egg" ADD CONSTRAINT "Egg_eggTypeId_fkey" FOREIGN KEY ("eggTypeId") REFERENCES "EggType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Egg" ADD CONSTRAINT "Egg_oddsVersionId_fkey" FOREIGN KEY ("oddsVersionId") REFERENCES "OddsVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HatchAttempt" ADD CONSTRAINT "HatchAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HatchAttempt" ADD CONSTRAINT "HatchAttempt_eggId_fkey" FOREIGN KEY ("eggId") REFERENCES "Egg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HatchAttempt" ADD CONSTRAINT "HatchAttempt_oddsVersionId_fkey" FOREIGN KEY ("oddsVersionId") REFERENCES "OddsVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HatchAttempt" ADD CONSTRAINT "HatchAttempt_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "CreatureSpecies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Creature" ADD CONSTRAINT "Creature_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "CreatureSpecies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Creature" ADD CONSTRAINT "Creature_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "CreatureVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Creature" ADD CONSTRAINT "Creature_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Creature" ADD CONSTRAINT "Creature_originalOwnerId_fkey" FOREIGN KEY ("originalOwnerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Creature" ADD CONSTRAINT "Creature_eggId_fkey" FOREIGN KEY ("eggId") REFERENCES "Egg"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureLearnedAbility" ADD CONSTRAINT "CreatureLearnedAbility_creatureId_fkey" FOREIGN KEY ("creatureId") REFERENCES "Creature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureLearnedAbility" ADD CONSTRAINT "CreatureLearnedAbility_abilityId_fkey" FOREIGN KEY ("abilityId") REFERENCES "CreatureAbility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureStatSnapshot" ADD CONSTRAINT "CreatureStatSnapshot_creatureId_fkey" FOREIGN KEY ("creatureId") REFERENCES "Creature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureCareEvent" ADD CONSTRAINT "CreatureCareEvent_creatureId_fkey" FOREIGN KEY ("creatureId") REFERENCES "Creature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureCareEvent" ADD CONSTRAINT "CreatureCareEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureStatusEvent" ADD CONSTRAINT "CreatureStatusEvent_creatureId_fkey" FOREIGN KEY ("creatureId") REFERENCES "Creature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureEvolution" ADD CONSTRAINT "CreatureEvolution_creatureId_fkey" FOREIGN KEY ("creatureId") REFERENCES "Creature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemTransaction" ADD CONSTRAINT "ItemTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemTransaction" ADD CONSTRAINT "ItemTransaction_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureEquipment" ADD CONSTRAINT "CreatureEquipment_creatureId_fkey" FOREIGN KEY ("creatureId") REFERENCES "Creature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureEquipment" ADD CONSTRAINT "CreatureEquipment_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "EquipmentSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureEquipment" ADD CONSTRAINT "CreatureEquipment_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_outputItemId_fkey" FOREIGN KEY ("outputItemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CraftingJob" ADD CONSTRAINT "CraftingJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CraftingJob" ADD CONSTRAINT "CraftingJob_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapDefinition" ADD CONSTRAINT "MapDefinition_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerRegionProgress" ADD CONSTRAINT "PlayerRegionProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerRegionProgress" ADD CONSTRAINT "PlayerRegionProgress_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Encounter" ADD CONSTRAINT "Encounter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Encounter" ADD CONSTRAINT "Encounter_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EncounterAction" ADD CONSTRAINT "EncounterAction_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "Encounter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Battle" ADD CONSTRAINT "Battle_challengerId_fkey" FOREIGN KEY ("challengerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Battle" ADD CONSTRAINT "Battle_defenderId_fkey" FOREIGN KEY ("defenderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Battle" ADD CONSTRAINT "Battle_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "Encounter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleParticipant" ADD CONSTRAINT "BattleParticipant_battleId_fkey" FOREIGN KEY ("battleId") REFERENCES "Battle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleParticipant" ADD CONSTRAINT "BattleParticipant_creatureId_fkey" FOREIGN KEY ("creatureId") REFERENCES "Creature"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleTurn" ADD CONSTRAINT "BattleTurn_battleId_fkey" FOREIGN KEY ("battleId") REFERENCES "Battle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleAction" ADD CONSTRAINT "BattleAction_turnId_fkey" FOREIGN KEY ("turnId") REFERENCES "BattleTurn"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleEvent" ADD CONSTRAINT "BattleEvent_battleId_fkey" FOREIGN KEY ("battleId") REFERENCES "Battle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quest" ADD CONSTRAINT "Quest_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestObjective" ADD CONSTRAINT "QuestObjective_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestReward" ADD CONSTRAINT "QuestReward_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerQuest" ADD CONSTRAINT "PlayerQuest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerQuest" ADD CONSTRAINT "PlayerQuest_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerQuestProgress" ADD CONSTRAINT "PlayerQuestProgress_playerQuestId_fkey" FOREIGN KEY ("playerQuestId") REFERENCES "PlayerQuest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerQuestProgress" ADD CONSTRAINT "PlayerQuestProgress_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "QuestObjective"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerAchievement" ADD CONSTRAINT "PlayerAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerAchievement" ADD CONSTRAINT "PlayerAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplaceListing" ADD CONSTRAINT "MarketplaceListing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplaceListing" ADD CONSTRAINT "MarketplaceListing_creatureId_fkey" FOREIGN KEY ("creatureId") REFERENCES "Creature"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplaceSale" ADD CONSTRAINT "MarketplaceSale_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "MarketplaceListing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplaceSale" ADD CONSTRAINT "MarketplaceSale_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplaceSale" ADD CONSTRAINT "MarketplaceSale_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurrencyLedger" ADD CONSTRAINT "CurrencyLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardLedger" ADD CONSTRAINT "RewardLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WithdrawalRequest" ADD CONSTRAINT "WithdrawalRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityEvent" ADD CONSTRAINT "CommunityEvent_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityBoss" ADD CONSTRAINT "CommunityBoss_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "CommunityEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BossAttempt" ADD CONSTRAINT "BossAttempt_bossId_fkey" FOREIGN KEY ("bossId") REFERENCES "CommunityBoss"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BossAttempt" ADD CONSTRAINT "BossAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BossAttempt" ADD CONSTRAINT "BossAttempt_battleId_fkey" FOREIGN KEY ("battleId") REFERENCES "Battle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaderboardEntry" ADD CONSTRAINT "LeaderboardEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaderboardEntry" ADD CONSTRAINT "LeaderboardEntry_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Memorial" ADD CONSTRAINT "Memorial_creatureId_fkey" FOREIGN KEY ("creatureId") REFERENCES "Creature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Memorial" ADD CONSTRAINT "Memorial_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAction" ADD CONSTRAINT "AdminAction_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDisclosureAcceptance" ADD CONSTRAINT "UserDisclosureAcceptance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDisclosureAcceptance" ADD CONSTRAINT "UserDisclosureAcceptance_disclosureId_fkey" FOREIGN KEY ("disclosureId") REFERENCES "RiskDisclosureVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationReport" ADD CONSTRAINT "ModerationReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdempotencyKey" ADD CONSTRAINT "IdempotencyKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevenueDeposit" ADD CONSTRAINT "RevenueDeposit_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "RevenueSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AllocationPolicyEntry" ADD CONSTRAINT "AllocationPolicyEntry_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "AllocationPolicy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreasuryAllocation" ADD CONSTRAINT "TreasuryAllocation_depositId_fkey" FOREIGN KEY ("depositId") REFERENCES "RevenueDeposit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetRewardAllocation" ADD CONSTRAINT "PetRewardAllocation_epochId_fkey" FOREIGN KEY ("epochId") REFERENCES "RewardEpoch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetRewardClaim" ADD CONSTRAINT "PetRewardClaim_epochId_fkey" FOREIGN KEY ("epochId") REFERENCES "RewardEpoch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArenaRating" ADD CONSTRAINT "ArenaRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArenaRating" ADD CONSTRAINT "ArenaRating_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "ArenaSeason"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArenaPointLedger" ADD CONSTRAINT "ArenaPointLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArenaPointLedger" ADD CONSTRAINT "ArenaPointLedger_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "ArenaSeason"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArenaBattle" ADD CONSTRAINT "ArenaBattle_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DuelChallenge" ADD CONSTRAINT "DuelChallenge_challengerId_fkey" FOREIGN KEY ("challengerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DuelChallenge" ADD CONSTRAINT "DuelChallenge_opponentId_fkey" FOREIGN KEY ("opponentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeaponInstance" ADD CONSTRAINT "WeaponInstance_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "WeaponDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeaponInstance" ADD CONSTRAINT "WeaponInstance_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetBattleLoadout" ADD CONSTRAINT "PetBattleLoadout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityPrediction" ADD CONSTRAINT "CommunityPrediction_battleId_fkey" FOREIGN KEY ("battleId") REFERENCES "ArenaBattle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityPrediction" ADD CONSTRAINT "CommunityPrediction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleAuditLog" ADD CONSTRAINT "BattleAuditLog_battleId_fkey" FOREIGN KEY ("battleId") REFERENCES "ArenaBattle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArenaSuspension" ADD CONSTRAINT "ArenaSuspension_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentIntent" ADD CONSTRAINT "PaymentIntent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemPurchase" ADD CONSTRAINT "ItemPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemPurchase" ADD CONSTRAINT "ItemPurchase_paymentIntentId_fkey" FOREIGN KEY ("paymentIntentId") REFERENCES "PaymentIntent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetLoadout" ADD CONSTRAINT "PetLoadout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevenueAllocationEntry" ADD CONSTRAINT "RevenueAllocationEntry_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "RevenueAllocationPolicy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AllocationLedgerEntry" ADD CONSTRAINT "AllocationLedgerEntry_settlementBatchId_fkey" FOREIGN KEY ("settlementBatchId") REFERENCES "SettlementBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildMember" ADD CONSTRAINT "GuildMember_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildEvent" ADD CONSTRAINT "GuildEvent_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomesteadRoom" ADD CONSTRAINT "HomesteadRoom_homesteadId_fkey" FOREIGN KEY ("homesteadId") REFERENCES "Homestead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
