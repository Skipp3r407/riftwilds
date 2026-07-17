import {
  PrismaClient,
  Prisma,
  AffinityName,
  Rarity,
  EggClass,
  QuestCategory,
  ItemCategory,
  AbilityCategory,
  TokenTier,
  MatchupResult,
  EggAcquisitionMethod,
  EggStatus,
  CreatureLifecycle,
} from "@prisma/client";

const prisma = new PrismaClient();

const AFFINITY_MODIFIER_BPS: Record<MatchupResult, number> = {
  STRONG: 12500,
  WEAK: 7500,
  RESIST: 5000,
  NEUTRAL: 10000,
};

const AFFINITY_CHART: Partial<
  Record<AffinityName, Partial<Record<AffinityName, MatchupResult>>>
> = {
  EMBER: { GROVE: "STRONG", FROST: "STRONG", TIDE: "WEAK", STONE: "WEAK", VOID: "RESIST" },
  TIDE: { EMBER: "STRONG", STONE: "STRONG", STORM: "WEAK", GROVE: "WEAK", ALLOY: "RESIST" },
  GROVE: { TIDE: "STRONG", STONE: "STRONG", EMBER: "WEAK", FROST: "WEAK", SPIRIT: "RESIST" },
  STORM: { TIDE: "STRONG", ALLOY: "STRONG", STONE: "WEAK", SPIRIT: "WEAK", FROST: "RESIST" },
  STONE: { STORM: "STRONG", EMBER: "STRONG", TIDE: "WEAK", GROVE: "WEAK", VOID: "RESIST" },
  FROST: { GROVE: "STRONG", STORM: "STRONG", EMBER: "WEAK", ALLOY: "WEAK", RADIANT: "RESIST" },
  RADIANT: { VOID: "STRONG", SPIRIT: "STRONG", ALLOY: "WEAK", FROST: "WEAK", EMBER: "RESIST" },
  VOID: { RADIANT: "STRONG", SPIRIT: "STRONG", STONE: "WEAK", GROVE: "WEAK", STORM: "RESIST" },
  ALLOY: { FROST: "STRONG", RADIANT: "STRONG", STORM: "WEAK", TIDE: "WEAK", SPIRIT: "RESIST" },
  SPIRIT: { ALLOY: "STRONG", STORM: "STRONG", VOID: "WEAK", RADIANT: "WEAK", TIDE: "RESIST" },
};

function getMatchup(attacker: AffinityName, defender: AffinityName): MatchupResult {
  if (attacker === defender) return "NEUTRAL";
  return AFFINITY_CHART[attacker]?.[defender] ?? "NEUTRAL";
}

const BASE_STATS = {
  balanced: { hp: 60, attack: 45, guard: 40, focus: 35, speed: 50 },
  tank: { hp: 75, attack: 35, guard: 55, focus: 30, speed: 35 },
  striker: { hp: 50, attack: 60, guard: 30, focus: 40, speed: 55 },
  support: { hp: 55, attack: 35, guard: 35, focus: 60, speed: 45 },
};

const GROWTH_RATES = {
  balanced: { hp: 1.2, attack: 1.1, guard: 1.0, focus: 1.0, speed: 1.15 },
  tank: { hp: 1.35, attack: 0.95, guard: 1.2, focus: 0.9, speed: 0.95 },
  striker: { hp: 1.05, attack: 1.25, guard: 0.95, focus: 1.05, speed: 1.2 },
  support: { hp: 1.15, attack: 0.9, guard: 1.0, focus: 1.25, speed: 1.05 },
};

const SPECIES_DATA = [
  { internalId: "sp_cindercub", name: "Cindercub", slug: "cindercub", affinity: AffinityName.EMBER, rarity: Rarity.UNCOMMON, stats: "striker", habitat: "Cindercrag Basin", temperament: "Bold", food: "Emberberry", passive: "warm-pelt", weight: 120 },
  { internalId: "sp_mossprig", name: "Mossprig", slug: "mossprig", affinity: AffinityName.GROVE, rarity: Rarity.COMMON, stats: "support", habitat: "Sproutfall Grove", temperament: "Gentle", food: "Mossmeal", passive: "root-sense", weight: 140 },
  { internalId: "sp_bubbloon", name: "Bubbloon", slug: "bubbloon", affinity: AffinityName.TIDE, rarity: Rarity.COMMON, stats: "balanced", habitat: "Tidepool Expanse", temperament: "Playful", food: "Kelp Crisp", passive: "bubble-veil", weight: 130 },
  { internalId: "sp_voltkit", name: "Voltkit", slug: "voltkit", affinity: AffinityName.STORM, rarity: Rarity.UNCOMMON, stats: "striker", habitat: "Stormpeaks Ridge", temperament: "Restless", food: "Storm Nectar", passive: "static-fur", weight: 110 },
  { internalId: "sp_pebblit", name: "Pebblit", slug: "pebblit", affinity: AffinityName.STONE, rarity: Rarity.COMMON, stats: "tank", habitat: "Cindercrag Basin", temperament: "Stoic", food: "Mineral Mash", passive: "stone-skin", weight: 125 },
  { internalId: "sp_wisplet", name: "Wisplet", slug: "wisplet", affinity: AffinityName.SPIRIT, rarity: Rarity.RARE, stats: "support", habitat: "Astral Convergence", temperament: "Calm", food: "Dream Petals", passive: "whisper-guard", weight: 90 },
  { internalId: "sp_frostnip", name: "Frostnip", slug: "frostnip", affinity: AffinityName.FROST, rarity: Rarity.UNCOMMON, stats: "balanced", habitat: "Frostveil Tundra", temperament: "Shy", food: "Glacier Mint", passive: "chill-aura", weight: 100 },
  { internalId: "sp_luminara", name: "Luminara", slug: "luminara", affinity: AffinityName.RADIANT, rarity: Rarity.RARE, stats: "support", habitat: "Astral Convergence", temperament: "Serene", food: "Sunlit Dew", passive: "radiant-glow", weight: 85 },
  { internalId: "sp_hollowshade", name: "Hollowshade", slug: "hollowshade", affinity: AffinityName.VOID, rarity: Rarity.EPIC, stats: "striker", habitat: "Voidshard Depths", temperament: "Mysterious", food: "Umbral Fruit", passive: "void-step", weight: 70 },
  { internalId: "sp_gearling", name: "Gearling", slug: "gearling", affinity: AffinityName.ALLOY, rarity: Rarity.UNCOMMON, stats: "tank", habitat: "Cindercrag Basin", temperament: "Diligent", food: "Iron Shavings", passive: "alloy-frame", weight: 105 },
  { internalId: "sp_bramblefox", name: "Bramblefox", slug: "bramblefox", affinity: AffinityName.GROVE, rarity: Rarity.UNCOMMON, stats: "striker", habitat: "Sproutfall Grove", temperament: "Clever", food: "Thornberry", passive: "bramble-dash", weight: 115 },
  { internalId: "sp_coralurge", name: "Coralurge", slug: "coralurge", affinity: AffinityName.TIDE, rarity: Rarity.RARE, stats: "tank", habitat: "Tidepool Expanse", temperament: "Patient", food: "Reef Algae", passive: "coral-shell", weight: 95 },
  { internalId: "sp_ashwing", name: "Ashwing", slug: "ashwing", affinity: AffinityName.EMBER, rarity: Rarity.RARE, stats: "striker", habitat: "Cindercrag Basin", temperament: "Fierce", food: "Charcoal Seed", passive: "ash-glide", weight: 80 },
  { internalId: "sp_quartzhorn", name: "Quartzhorn", slug: "quartzhorn", affinity: AffinityName.STONE, rarity: Rarity.UNCOMMON, stats: "tank", habitat: "Stormpeaks Ridge", temperament: "Steadfast", food: "Crystal Grain", passive: "quartz-horn", weight: 100 },
  { internalId: "sp_staticat", name: "Staticat", slug: "staticat", affinity: AffinityName.STORM, rarity: Rarity.COMMON, stats: "striker", habitat: "Stormpeaks Ridge", temperament: "Skittish", food: "Spark Ribbon", passive: "static-pounce", weight: 135 },
  { internalId: "sp_glimmerp", name: "Glimmerp", slug: "glimmerp", affinity: AffinityName.RADIANT, rarity: Rarity.UNCOMMON, stats: "support", habitat: "Sproutfall Grove", temperament: "Cheerful", food: "Prism Pollen", passive: "glimmer-trail", weight: 110 },
  { internalId: "sp_mistwraith", name: "Mistwraith", slug: "mistwraith", affinity: AffinityName.VOID, rarity: Rarity.LEGENDARY, stats: "support", habitat: "Voidshard Depths", temperament: "Elusive", food: "Echo Mist", passive: "mist-form", weight: 45 },
  { internalId: "sp_ironbloom", name: "Ironbloom", slug: "ironbloom", affinity: AffinityName.ALLOY, rarity: Rarity.RARE, stats: "balanced", habitat: "Cindercrag Basin", temperament: "Loyal", food: "Forge Petals", passive: "iron-bloom", weight: 88 },
] as const;

async function clearDatabase() {
  await prisma.bossAttempt.deleteMany();
  await prisma.battleAction.deleteMany();
  await prisma.battleEvent.deleteMany();
  await prisma.battleTurn.deleteMany();
  await prisma.battleParticipant.deleteMany();
  await prisma.battle.deleteMany();
  await prisma.encounterAction.deleteMany();
  await prisma.encounter.deleteMany();
  await prisma.playerQuestProgress.deleteMany();
  await prisma.playerQuest.deleteMany();
  await prisma.playerAchievement.deleteMany();
  await prisma.playerRegionProgress.deleteMany();
  await prisma.creatureLearnedAbility.deleteMany();
  await prisma.creatureStatSnapshot.deleteMany();
  await prisma.creatureCareEvent.deleteMany();
  await prisma.creatureStatusEvent.deleteMany();
  await prisma.creatureEvolution.deleteMany();
  await prisma.creatureEquipment.deleteMany();
  await prisma.memorial.deleteMany();
  await prisma.marketplaceSale.deleteMany();
  await prisma.marketplaceListing.deleteMany();
  await prisma.currencyLedger.deleteMany();
  await prisma.rewardLedger.deleteMany();
  await prisma.withdrawalRequest.deleteMany();
  await prisma.craftingJob.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.itemTransaction.deleteMany();
  await prisma.hatchAttempt.deleteMany();
  await prisma.creature.deleteMany();
  await prisma.egg.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.adminAction.deleteMany();
  await prisma.userDisclosureAcceptance.deleteMany();
  await prisma.moderationReport.deleteMany();
  await prisma.idempotencyKey.deleteMany();
  await prisma.leaderboardEntry.deleteMany();
  await prisma.tokenBalanceSnapshot.deleteMany();
  await prisma.authNonce.deleteMany();
  await prisma.session.deleteMany();
  await prisma.playerSettings.deleteMany();
  await prisma.playerProfile.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.user.deleteMany();
  await prisma.questObjective.deleteMany();
  await prisma.questReward.deleteMany();
  await prisma.quest.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.communityBoss.deleteMany();
  await prisma.communityEvent.deleteMany();
  await prisma.season.deleteMany();
  await prisma.mapDefinition.deleteMany();
  await prisma.region.deleteMany();
  await prisma.recipeIngredient.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.speciesAbility.deleteMany();
  await prisma.evolutionRule.deleteMany();
  await prisma.creatureVariant.deleteMany();
  await prisma.creatureSpecies.deleteMany();
  await prisma.creatureAbility.deleteMany();
  await prisma.affinityMatchup.deleteMany();
  await prisma.affinity.deleteMany();
  await prisma.item.deleteMany();
  await prisma.eggType.deleteMany();
  await prisma.oddsVersion.deleteMany();
  await prisma.tokenGateRule.deleteMany();
  await prisma.featureFlag.deleteMany();
  await prisma.gameSetting.deleteMany();
  await prisma.systemStatus.deleteMany();
  await prisma.riskDisclosureVersion.deleteMany();
  await prisma.equipmentSlot.deleteMany();
}

async function main() {
  console.log("Clearing database...");
  await clearDatabase();

  // ─── Affinities ────────────────────────────────────────────────────────────
  const affinityMeta: Record<
    AffinityName,
    { slug: string; displayName: string; colorHex: string; iconKey: string; description: string }
  > = {
    EMBER: { slug: "ember", displayName: "Ember", colorHex: "#FF6B35", iconKey: "affinity-ember", description: "Heat and forge-fire resonance." },
    TIDE: { slug: "tide", displayName: "Tide", colorHex: "#2E86AB", iconKey: "affinity-tide", description: "Flowing water and deep currents." },
    GROVE: { slug: "grove", displayName: "Grove", colorHex: "#4CAF50", iconKey: "affinity-grove", description: "Living roots and wild growth." },
    STORM: { slug: "storm", displayName: "Storm", colorHex: "#7B68EE", iconKey: "affinity-storm", description: "Crackling sky and charged winds." },
    STONE: { slug: "stone", displayName: "Stone", colorHex: "#8D6E63", iconKey: "affinity-stone", description: "Bedrock patience and mineral might." },
    FROST: { slug: "frost", displayName: "Frost", colorHex: "#81D4FA", iconKey: "affinity-frost", description: "Glacial chill and crystalline calm." },
    RADIANT: { slug: "radiant", displayName: "Radiant", colorHex: "#FFD54F", iconKey: "affinity-radiant", description: "Prismatic light and dawn energy." },
    VOID: { slug: "void", displayName: "Void", colorHex: "#5C4B8A", iconKey: "affinity-void", description: "Shadow rifts and absent gravity." },
    ALLOY: { slug: "alloy", displayName: "Alloy", colorHex: "#90A4AE", iconKey: "affinity-alloy", description: "Forged metal and adaptive craft." },
    SPIRIT: { slug: "spirit", displayName: "Spirit", colorHex: "#CE93D8", iconKey: "affinity-spirit", description: "Ethereal whispers and dream echoes." },
  };

  const affinityIds = new Map<AffinityName, string>();
  for (const name of Object.values(AffinityName)) {
    const meta = affinityMeta[name];
    const row = await prisma.affinity.create({
      data: { name, slug: meta.slug, displayName: meta.displayName, description: meta.description, colorHex: meta.colorHex, iconKey: meta.iconKey },
    });
    affinityIds.set(name, row.id);
  }
  console.log(`Seeded ${affinityIds.size} affinities`);

  // ─── Affinity Matchups ─────────────────────────────────────────────────────
  const matchupRows: { attackerAffinityId: string; defenderAffinityId: string; result: MatchupResult; modifierBps: number }[] = [];
  for (const attacker of Object.values(AffinityName)) {
    for (const defender of Object.values(AffinityName)) {
      const result = getMatchup(attacker, defender);
      matchupRows.push({
        attackerAffinityId: affinityIds.get(attacker)!,
        defenderAffinityId: affinityIds.get(defender)!,
        result,
        modifierBps: AFFINITY_MODIFIER_BPS[result],
      });
    }
  }
  await prisma.affinityMatchup.createMany({ data: matchupRows });
  console.log(`Seeded ${matchupRows.length} affinity matchups`);

  // ─── Odds Version ──────────────────────────────────────────────────────────
  const oddsVersion = await prisma.oddsVersion.create({
    data: {
      version: 1,
      label: "Launch Odds v1",
      odds: { COMMON: 42, UNCOMMON: 27, RARE: 16, EPIC: 8, LEGENDARY: 4, MYTHIC: 2, CELESTIAL: 1 },
      active: true,
      publishedAt: new Date(),
      notes: "Initial hatch rarity distribution for Project Hatch.",
    },
  });

  // ─── Feature Flags ─────────────────────────────────────────────────────────
  const featureFlags: { key: string; enabled: boolean; note?: string }[] = [
    { key: "TOKEN_GATE_ENABLED", enabled: true },
    { key: "STARTER_EGG_CLAIMS_ENABLED", enabled: true },
    { key: "HATCHING_ENABLED", enabled: true },
    { key: "CARE_ENABLED", enabled: true },
    { key: "PERMANENT_DEATH_ENABLED", enabled: false },
    { key: "EXPLORATION_ENABLED", enabled: false },
    { key: "BATTLES_ENABLED", enabled: true },
    { key: "PVP_ENABLED", enabled: false },
    { key: "MARKETPLACE_ENABLED", enabled: false },
    { key: "REAL_SOL_MARKETPLACE_ENABLED", enabled: false },
    { key: "QUESTS_ENABLED", enabled: false },
    { key: "CRAFTING_ENABLED", enabled: false },
    { key: "EVOLUTION_ENABLED", enabled: false },
    { key: "COMMUNITY_BOSS_ENABLED", enabled: false },
    { key: "REAL_MONEY_REWARDS_ENABLED", enabled: false },
    { key: "NFT_MINTING_ENABLED", enabled: false },
    { key: "MAINTENANCE_MODE", enabled: false },
    { key: "ARENA_ENABLED", enabled: true },
    { key: "CASUAL_DUELS_ENABLED", enabled: false },
    { key: "RANKED_DUELS_ENABLED", enabled: false },
    { key: "TOURNAMENTS_ENABLED", enabled: false },
    { key: "WEAPONS_ENABLED", enabled: true },
    { key: "EQUIPMENT_CRAFTING_ENABLED", enabled: false },
    { key: "SPECTATOR_MODE_ENABLED", enabled: false },
    { key: "COMMUNITY_PREDICTIONS_ENABLED", enabled: false },
    { key: "ARENA_POINTS_ENABLED", enabled: true },
    { key: "SPONSORED_PRIZES_ENABLED", enabled: false },
  ];
  await prisma.featureFlag.createMany({ data: featureFlags });

  // ─── Token Gate Rules ──────────────────────────────────────────────────────
  const tokenGateRules = [
    { tier: TokenTier.VISITOR, minAmount: "0", label: "Visitor", description: "Explore The Riftwilds with basic access.", benefits: { dailyQuests: 1, creatureSlots: 12, marketplaceAccess: false } },
    { tier: TokenTier.KEEPER, minAmount: "1000000", label: "Keeper", description: "Hold $HATCH to unlock keeper perks.", benefits: { dailyQuests: 2, creatureSlots: 16, cosmeticAuras: true } },
    { tier: TokenTier.RANGER, minAmount: "10000000", label: "Ranger", description: "Seasoned keepers gain expanded capacity.", benefits: { dailyQuests: 3, creatureSlots: 20, eventBoostBps: 500 } },
    { tier: TokenTier.WARDEN, minAmount: "100000000", label: "Warden", description: "Wardens receive priority event access.", benefits: { dailyQuests: 4, creatureSlots: 24, exclusiveSkins: true } },
    { tier: TokenTier.FOUNDER, minAmount: "1000000000", label: "Founder", description: "Founding keepers of the Riftwilds.", benefits: { dailyQuests: 5, creatureSlots: 30, founderBadge: true, earlyFeatures: true } },
  ];
  for (const rule of tokenGateRules) {
    await prisma.tokenGateRule.create({ data: { ...rule, active: true } });
  }

  // ─── Abilities (40+) ───────────────────────────────────────────────────────
  const abilityDefs: {
    key: string; name: string; description: string; category: AbilityCategory;
    affinity?: AffinityName; basePower?: number; energyCost?: number; animationKey: string; soundKey: string;
  }[] = [
    { key: "ember-claw", name: "Ember Claw", description: "Raking strike wreathed in heat.", category: AbilityCategory.STRIKE, affinity: AffinityName.EMBER, basePower: 55, energyCost: 8, animationKey: "anim-ember-claw", soundKey: "sfx-ember-hit" },
    { key: "tide-splash", name: "Tide Splash", description: "A pressurized burst of brine.", category: AbilityCategory.STRIKE, affinity: AffinityName.TIDE, basePower: 50, energyCost: 7, animationKey: "anim-tide-splash", soundKey: "sfx-water-splash" },
    { key: "grove-vine", name: "Grove Vine", description: "Entangling roots sap momentum.", category: AbilityCategory.CONTROL, affinity: AffinityName.GROVE, basePower: 30, energyCost: 10, animationKey: "anim-grove-vine", soundKey: "sfx-vine-rustle" },
    { key: "storm-bolt", name: "Storm Bolt", description: "A crackling lightning jab.", category: AbilityCategory.STRIKE, affinity: AffinityName.STORM, basePower: 65, energyCost: 12, animationKey: "anim-storm-bolt", soundKey: "sfx-thunder-crack" },
    { key: "stone-wall", name: "Stone Wall", description: "Raises a defensive mineral barrier.", category: AbilityCategory.GUARD, affinity: AffinityName.STONE, basePower: 0, energyCost: 9, animationKey: "anim-stone-wall", soundKey: "sfx-stone-rumble" },
    { key: "frost-shard", name: "Frost Shard", description: "Piercing icicle strike.", category: AbilityCategory.STRIKE, affinity: AffinityName.FROST, basePower: 52, energyCost: 8, animationKey: "anim-frost-shard", soundKey: "sfx-ice-crack" },
    { key: "radiant-beam", name: "Radiant Beam", description: "Focused prism light attack.", category: AbilityCategory.STRIKE, affinity: AffinityName.RADIANT, basePower: 58, energyCost: 10, animationKey: "anim-radiant-beam", soundKey: "sfx-light-chime" },
    { key: "void-echo", name: "Void Echo", description: "Shadow resonance drains focus.", category: AbilityCategory.WEAKEN, affinity: AffinityName.VOID, basePower: 40, energyCost: 11, animationKey: "anim-void-echo", soundKey: "sfx-void-hum" },
    { key: "alloy-shield", name: "Alloy Shield", description: "Deploys a forged metal guard.", category: AbilityCategory.GUARD, affinity: AffinityName.ALLOY, basePower: 0, energyCost: 8, animationKey: "anim-alloy-shield", soundKey: "sfx-metal-clang" },
    { key: "spirit-whisper", name: "Spirit Whisper", description: "Soothing echo restores bond.", category: AbilityCategory.RESTORE, affinity: AffinityName.SPIRIT, basePower: 35, energyCost: 6, animationKey: "anim-spirit-whisper", soundKey: "sfx-spirit-chime" },
    { key: "ember-burst", name: "Ember Burst", description: "Explosive heat wave.", category: AbilityCategory.STRIKE, affinity: AffinityName.EMBER, basePower: 70, energyCost: 14, animationKey: "anim-ember-burst", soundKey: "sfx-fire-burst" },
    { key: "tide-heal", name: "Tide Heal", description: "Gentle currents mend wounds.", category: AbilityCategory.RESTORE, affinity: AffinityName.TIDE, basePower: 45, energyCost: 10, animationKey: "anim-tide-heal", soundKey: "sfx-water-heal" },
    { key: "grove-bloom", name: "Grove Bloom", description: "Flowering boost to guard.", category: AbilityCategory.BOOST, affinity: AffinityName.GROVE, basePower: 0, energyCost: 8, animationKey: "anim-grove-bloom", soundKey: "sfx-bloom-rustle" },
    { key: "storm-field", name: "Storm Field", description: "Charged atmosphere weakens foes.", category: AbilityCategory.FIELD, affinity: AffinityName.STORM, basePower: 0, energyCost: 12, animationKey: "anim-storm-field", soundKey: "sfx-storm-ambient" },
    { key: "stone-slam", name: "Stone Slam", description: "Heavy ground impact.", category: AbilityCategory.STRIKE, affinity: AffinityName.STONE, basePower: 62, energyCost: 11, animationKey: "anim-stone-slam", soundKey: "sfx-stone-impact" },
    { key: "frost-slow", name: "Frost Slow", description: "Chilling mist reduces speed.", category: AbilityCategory.WEAKEN, affinity: AffinityName.FROST, basePower: 25, energyCost: 9, animationKey: "anim-frost-slow", soundKey: "sfx-ice-wind" },
    { key: "radiant-pulse", name: "Radiant Pulse", description: "Healing pulse of dawn light.", category: AbilityCategory.RESTORE, affinity: AffinityName.RADIANT, basePower: 50, energyCost: 10, animationKey: "anim-radiant-pulse", soundKey: "sfx-light-pulse" },
    { key: "void-tear", name: "Void Tear", description: "Rift slash ignores guard.", category: AbilityCategory.STRIKE, affinity: AffinityName.VOID, basePower: 68, energyCost: 13, animationKey: "anim-void-tear", soundKey: "sfx-void-slash" },
    { key: "alloy-ram", name: "Alloy Ram", description: "Full-body metal charge.", category: AbilityCategory.STRIKE, affinity: AffinityName.ALLOY, basePower: 60, energyCost: 10, animationKey: "anim-alloy-ram", soundKey: "sfx-metal-charge" },
    { key: "spirit-ward", name: "Spirit Ward", description: "Ethereal barrier absorbs damage.", category: AbilityCategory.GUARD, affinity: AffinityName.SPIRIT, basePower: 0, energyCost: 9, animationKey: "anim-spirit-ward", soundKey: "sfx-spirit-shield" },
    { key: "quick-strike", name: "Quick Strike", description: "Fast basic attack.", category: AbilityCategory.STRIKE, basePower: 40, energyCost: 5, animationKey: "anim-quick-strike", soundKey: "sfx-quick-hit" },
    { key: "guard-stance", name: "Guard Stance", description: "Brace for incoming damage.", category: AbilityCategory.GUARD, basePower: 0, energyCost: 4, animationKey: "anim-guard-stance", soundKey: "sfx-guard-up" },
    { key: "focus-charge", name: "Focus Charge", description: "Build focus for next turn.", category: AbilityCategory.BOOST, basePower: 0, energyCost: 6, animationKey: "anim-focus-charge", soundKey: "sfx-focus-build" },
    { key: "rest-nest", name: "Rest Nest", description: "Recover health over time.", category: AbilityCategory.RESTORE, basePower: 30, energyCost: 7, animationKey: "anim-rest-nest", soundKey: "sfx-rest-cozy" },
    { key: "weaken-dust", name: "Weaken Dust", description: "Scattering dust lowers attack.", category: AbilityCategory.WEAKEN, basePower: 20, energyCost: 8, animationKey: "anim-weaken-dust", soundKey: "sfx-dust-puff" },
    { key: "field-mist", name: "Field Mist", description: "Misty field reduces accuracy.", category: AbilityCategory.FIELD, basePower: 0, energyCost: 10, animationKey: "anim-field-mist", soundKey: "sfx-mist-ambient" },
    { key: "ember-brand", name: "Ember Brand", description: "Burning mark on foe.", category: AbilityCategory.WEAKEN, affinity: AffinityName.EMBER, basePower: 35, energyCost: 9, animationKey: "anim-ember-brand", soundKey: "sfx-burn-sizzle" },
    { key: "tide-pull", name: "Tide Pull", description: "Drag opponent off balance.", category: AbilityCategory.CONTROL, affinity: AffinityName.TIDE, basePower: 30, energyCost: 8, animationKey: "anim-tide-pull", soundKey: "sfx-water-pull" },
    { key: "grove-seed", name: "Grove Seed", description: "Plant seed for delayed heal.", category: AbilityCategory.RESTORE, affinity: AffinityName.GROVE, basePower: 25, energyCost: 7, animationKey: "anim-grove-seed", soundKey: "sfx-seed-grow" },
    { key: "storm-chain", name: "Storm Chain", description: "Chained lightning strike.", category: AbilityCategory.STRIKE, affinity: AffinityName.STORM, basePower: 55, energyCost: 12, animationKey: "anim-storm-chain", soundKey: "sfx-chain-lightning" },
    { key: "stone-fortify", name: "Stone Fortify", description: "Boost guard for several turns.", category: AbilityCategory.BOOST, affinity: AffinityName.STONE, basePower: 0, energyCost: 8, animationKey: "anim-stone-fortify", soundKey: "sfx-stone-fortify" },
    { key: "frost-barrier", name: "Frost Barrier", description: "Ice wall blocks one hit.", category: AbilityCategory.GUARD, affinity: AffinityName.FROST, basePower: 0, energyCost: 10, animationKey: "anim-frost-barrier", soundKey: "sfx-ice-wall" },
    { key: "radiant-bless", name: "Radiant Bless", description: "Bless ally with light.", category: AbilityCategory.BOOST, affinity: AffinityName.RADIANT, basePower: 0, energyCost: 9, animationKey: "anim-radiant-bless", soundKey: "sfx-bless-chime" },
    { key: "void-drain", name: "Void Drain", description: "Drain energy from foe.", category: AbilityCategory.WEAKEN, affinity: AffinityName.VOID, basePower: 30, energyCost: 11, animationKey: "anim-void-drain", soundKey: "sfx-void-drain" },
    { key: "alloy-spike", name: "Alloy Spike", description: "Retaliation spike on guard.", category: AbilityCategory.STRIKE, affinity: AffinityName.ALLOY, basePower: 45, energyCost: 7, animationKey: "anim-alloy-spike", soundKey: "sfx-spike-pop" },
    { key: "spirit-link", name: "Spirit Link", description: "Share healing with ally.", category: AbilityCategory.RESTORE, affinity: AffinityName.SPIRIT, basePower: 40, energyCost: 10, animationKey: "anim-spirit-link", soundKey: "sfx-spirit-link" },
    { key: "rift-surge", name: "Rift Surge", description: "Universal rift energy blast.", category: AbilityCategory.STRIKE, basePower: 75, energyCost: 15, animationKey: "anim-rift-surge", soundKey: "sfx-rift-blast" },
    { key: "wild-rush", name: "Wild Rush", description: "Reckless full-speed tackle.", category: AbilityCategory.STRIKE, basePower: 58, energyCost: 9, animationKey: "anim-wild-rush", soundKey: "sfx-rush-whoosh" },
    { key: "calm-breath", name: "Calm Breath", description: "Restore energy and composure.", category: AbilityCategory.RESTORE, basePower: 0, energyCost: 5, animationKey: "anim-calm-breath", soundKey: "sfx-calm-exhale" },
    { key: "haze-veil", name: "Haze Veil", description: "Obscuring field lowers accuracy.", category: AbilityCategory.FIELD, basePower: 0, energyCost: 11, animationKey: "anim-haze-veil", soundKey: "sfx-haze-ambient" },
    { key: "power-up", name: "Power Up", description: "Raise attack for next strikes.", category: AbilityCategory.BOOST, basePower: 0, energyCost: 7, animationKey: "anim-power-up", soundKey: "sfx-power-up" },
  ];

  const abilityIds = new Map<string, string>();
  for (const def of abilityDefs) {
    const row = await prisma.creatureAbility.create({
      data: {
        key: def.key,
        name: def.name,
        description: def.description,
        category: def.category,
        affinityId: def.affinity ? affinityIds.get(def.affinity) : null,
        basePower: def.basePower ?? 0,
        accuracy: 100,
        energyCost: def.energyCost ?? 0,
        animationKey: def.animationKey,
        soundKey: def.soundKey,
      },
    });
    abilityIds.set(def.key, row.id);
  }
  console.log(`Seeded ${abilityIds.size} abilities`);

  // ─── Creature Species (18) ─────────────────────────────────────────────────
  const speciesIds = new Map<string, string>();
  for (const sp of SPECIES_DATA) {
    const statKey = sp.stats as keyof typeof BASE_STATS;
    const row = await prisma.creatureSpecies.create({
      data: {
        internalId: sp.internalId,
        name: sp.name,
        slug: sp.slug,
        shortDescription: `A ${sp.temperament.toLowerCase()} ${sp.affinity.toLowerCase()} Riftling from ${sp.habitat}.`,
        loreDescription: `${sp.name} roams the ${sp.habitat} of The Riftwilds, resonating with ${sp.affinity} energy. Keepers say its ${sp.passive.replace(/-/g, " ")} marks it as a true Riftling of generation one.`,
        primaryAffinityId: affinityIds.get(sp.affinity)!,
        baseRarity: sp.rarity,
        baseStats: BASE_STATS[statKey],
        growthRates: GROWTH_RATES[statKey],
        maxLevel: 50,
        hatchWeight: sp.weight,
        habitat: sp.habitat,
        temperament: sp.temperament,
        preferredFood: sp.food,
        idleAnimationKey: `idle-${sp.slug}`,
        battleAnimationKeys: { attack: `battle-${sp.slug}-attack`, hurt: `battle-${sp.slug}-hurt`, victory: `battle-${sp.slug}-victory` },
        soundKeys: { idle: `sfx-${sp.slug}-idle`, cry: `sfx-${sp.slug}-cry` },
        spritePath: `/sprites/riftlings/${sp.slug}.png`,
        artworkPath: `/art/riftlings/${sp.slug}.png`,
        passiveAbilityKey: sp.passive,
        generation: 1,
        isActive: true,
        prismaticChanceBps: 50,
      },
    });
    speciesIds.set(sp.slug, row.id);
  }
  console.log(`Seeded ${speciesIds.size} creature species`);

  // ─── Species Abilities (first 4 per species) ───────────────────────────────
  const abilityKeys = abilityDefs.map((a) => a.key);
  let speciesAbilityCount = 0;
  for (const sp of SPECIES_DATA) {
    const speciesId = speciesIds.get(sp.slug)!;
    const affinityPrefix = sp.affinity.toLowerCase();
    const preferred = abilityKeys.filter((k) => k.startsWith(affinityPrefix) || ["quick-strike", "guard-stance", "rest-nest", "focus-charge"].includes(k));
    const slots = preferred.slice(0, 4);
    while (slots.length < 4) slots.push(abilityKeys[slots.length % abilityKeys.length]);
    for (let slot = 0; slot < 4; slot++) {
      await prisma.speciesAbility.create({
        data: { speciesId, abilityId: abilityIds.get(slots[slot])!, slot: slot + 1, unlockLevel: slot === 0 ? 1 : slot * 5 + 1 },
      });
      speciesAbilityCount++;
    }
  }
  console.log(`Seeded ${speciesAbilityCount} species-ability links`);

  // ─── Items (35+) ───────────────────────────────────────────────────────────
  const itemDefs: { key: string; name: string; description: string; category: ItemCategory; rarity?: Rarity; iconPath?: string }[] = [
    { key: "emberberry", name: "Emberberry", description: "Warm berry favored by Ember Riftlings.", category: ItemCategory.FOOD, rarity: Rarity.COMMON },
    { key: "moondew-flask", name: "Moondew Flask", description: "Moonlit dew in a crystal flask for hygiene care.", category: ItemCategory.CARE, rarity: Rarity.UNCOMMON },
    { key: "mossmeal", name: "Mossmeal", description: "Nutrient-rich moss mash for Grove kin.", category: ItemCategory.FOOD, rarity: Rarity.COMMON },
    { key: "spark-ribbon", name: "Spark Ribbon", description: "Conductive ribbon used in storm training.", category: ItemCategory.TRAINING, rarity: Rarity.UNCOMMON },
    { key: "crystal-scrub", name: "Crystal Scrub", description: "Polishing scrub that boosts hygiene.", category: ItemCategory.CARE, rarity: Rarity.COMMON },
    { key: "dreamnest-cushion", name: "Dreamnest Cushion", description: "Soft cushion for restful recovery.", category: ItemCategory.CARE, rarity: Rarity.RARE },
    { key: "rift-compass", name: "Rift Compass", description: "Points toward nearby rift anomalies.", category: ItemCategory.EXPLORATION, rarity: Rarity.UNCOMMON },
    { key: "resonance-charm", name: "Resonance Charm", description: "Amplifies affinity resonance in battle.", category: ItemCategory.BATTLE, rarity: Rarity.RARE },
    { key: "alloy-guardplate", name: "Alloy Guardplate", description: "Forged plate that bolsters guard.", category: ItemCategory.BATTLE, rarity: Rarity.EPIC },
    { key: "astral-thread", name: "Astral Thread", description: "Cosmic fiber used in advanced crafting.", category: ItemCategory.CRAFTING, rarity: Rarity.RARE },
    { key: "kelp-crisp", name: "Kelp Crisp", description: "Crunchy tide-region snack.", category: ItemCategory.FOOD },
    { key: "storm-nectar", name: "Storm Nectar", description: "Charged nectar from stormpeaks.", category: ItemCategory.FOOD, rarity: Rarity.UNCOMMON },
    { key: "mineral-mash", name: "Mineral Mash", description: "Stone affinity meal mix.", category: ItemCategory.FOOD },
    { key: "dream-petals", name: "Dream Petals", description: "Ethereal petals for Spirit Riftlings.", category: ItemCategory.FOOD, rarity: Rarity.RARE },
    { key: "glacier-mint", name: "Glacier Mint", description: "Cooling herb from frost tundra.", category: ItemCategory.FOOD, rarity: Rarity.UNCOMMON },
    { key: "sunlit-dew", name: "Sunlit Dew", description: "Radiant morning harvest.", category: ItemCategory.FOOD, rarity: Rarity.UNCOMMON },
    { key: "umbral-fruit", name: "Umbral Fruit", description: "Dark fruit from void rifts.", category: ItemCategory.FOOD, rarity: Rarity.RARE },
    { key: "iron-shavings", name: "Iron Shavings", description: "Metal filings for Alloy kin.", category: ItemCategory.FOOD },
    { key: "thornberry", name: "Thornberry", description: "Tart grove berry with bite.", category: ItemCategory.FOOD },
    { key: "reef-algae", name: "Reef Algae", description: "Nutritious tide-region algae.", category: ItemCategory.FOOD },
    { key: "charcoal-seed", name: "Charcoal Seed", description: "Smoldering ember-region seed.", category: ItemCategory.FOOD, rarity: Rarity.UNCOMMON },
    { key: "crystal-grain", name: "Crystal Grain", description: "Ground mineral for stone Riftlings.", category: ItemCategory.FOOD },
    { key: "prism-pollen", name: "Prism Pollen", description: "Shimmering radiant pollen.", category: ItemCategory.FOOD, rarity: Rarity.UNCOMMON },
    { key: "echo-mist", name: "Echo Mist", description: "Bottled void mist essence.", category: ItemCategory.FOOD, rarity: Rarity.EPIC },
    { key: "forge-petals", name: "Forge Petals", description: "Heat-treated alloy-region petals.", category: ItemCategory.FOOD, rarity: Rarity.UNCOMMON },
    { key: "training-dummy", name: "Training Dummy", description: "Practice target for battle drills.", category: ItemCategory.TRAINING },
    { key: "bond-bell", name: "Bond Bell", description: "Gentle chime that raises bond.", category: ItemCategory.TRAINING, rarity: Rarity.UNCOMMON },
    { key: "explore-kit", name: "Explore Kit", description: "Basic kit for region treks.", category: ItemCategory.EXPLORATION },
    { key: "guard-amulet", name: "Guard Amulet", description: "Protective charm for battles.", category: ItemCategory.BATTLE, rarity: Rarity.UNCOMMON },
    { key: "craft-essence", name: "Craft Essence", description: "Concentrated crafting catalyst.", category: ItemCategory.CRAFTING },
    { key: "evolution-stone", name: "Evolution Stone", description: "Rare catalyst for evolution paths.", category: ItemCategory.EVOLUTION, rarity: Rarity.EPIC },
    { key: "prismatic-ribbon", name: "Prismatic Ribbon", description: "Cosmetic ribbon with rainbow sheen.", category: ItemCategory.COSMETIC, rarity: Rarity.LEGENDARY },
    { key: "event-sparkler", name: "Event Sparkler", description: "Limited event celebration item.", category: ItemCategory.EVENT, rarity: Rarity.RARE },
    { key: "quest-seal", name: "Quest Seal", description: "Official seal for quest turn-ins.", category: ItemCategory.QUEST },
    { key: "demo-snack-pack", name: "Demo Snack Pack (Demo)", description: "Starter snack bundle for demo keepers.", category: ItemCategory.FOOD },
    { key: "demo-care-kit", name: "Demo Care Kit (Demo)", description: "Basic care supplies for demo sessions.", category: ItemCategory.CARE },
  ];

  const itemIds = new Map<string, string>();
  for (const def of itemDefs) {
    const row = await prisma.item.create({
      data: {
        key: def.key,
        name: def.name,
        description: def.description,
        category: def.category,
        rarity: def.rarity ?? Rarity.COMMON,
        iconPath: def.iconPath ?? `/icons/items/${def.key}.png`,
        stackable: true,
        maxStack: 99,
        tradeable: !def.key.startsWith("demo-"),
        active: true,
      },
    });
    itemIds.set(def.key, row.id);
  }
  console.log(`Seeded ${itemIds.size} items`);

  // ─── Recipes (12+) ─────────────────────────────────────────────────────────
  const recipeDefs: { key: string; name: string; description: string; outputKey: string; outputQty?: number; duration?: number; ingredients: { key: string; qty: number }[] }[] = [
    { key: "craft-moondew-flask", name: "Brew Moondew Flask", description: "Distill moonlit dew into a care flask.", outputKey: "moondew-flask", ingredients: [{ key: "sunlit-dew", qty: 2 }, { key: "craft-essence", qty: 1 }] },
    { key: "craft-spark-ribbon", name: "Weave Spark Ribbon", description: "Braid conductive fibers into a training ribbon.", outputKey: "spark-ribbon", ingredients: [{ key: "storm-nectar", qty: 2 }, { key: "astral-thread", qty: 1 }] },
    { key: "craft-resonance-charm", name: "Forge Resonance Charm", description: "Channel rift energy into a battle charm.", outputKey: "resonance-charm", ingredients: [{ key: "prism-pollen", qty: 3 }, { key: "craft-essence", qty: 2 }] },
    { key: "craft-alloy-guardplate", name: "Smith Alloy Guardplate", description: "Hammer iron shavings into a guardplate.", outputKey: "alloy-guardplate", ingredients: [{ key: "iron-shavings", qty: 4 }, { key: "forge-petals", qty: 2 }, { key: "astral-thread", qty: 1 }] },
    { key: "craft-dreamnest-cushion", name: "Stitch Dreamnest Cushion", description: "Sew spirit-soft cushion for rest.", outputKey: "dreamnest-cushion", ingredients: [{ key: "dream-petals", qty: 3 }, { key: "astral-thread", qty: 2 }] },
    { key: "craft-rift-compass", name: "Calibrate Rift Compass", description: "Tune a compass to local rift fields.", outputKey: "rift-compass", ingredients: [{ key: "explore-kit", qty: 1 }, { key: "craft-essence", qty: 2 }, { key: "crystal-grain", qty: 1 }] },
    { key: "craft-crystal-scrub", name: "Grind Crystal Scrub", description: "Polish crystal grains into scrub.", outputKey: "crystal-scrub", ingredients: [{ key: "crystal-grain", qty: 3 }, { key: "glacier-mint", qty: 1 }] },
    { key: "craft-bond-bell", name: "Cast Bond Bell", description: "Ring that strengthens keeper bonds.", outputKey: "bond-bell", ingredients: [{ key: "iron-shavings", qty: 2 }, { key: "craft-essence", qty: 1 }, { key: "prism-pollen", qty: 1 }] },
    { key: "craft-guard-amulet", name: "Enchant Guard Amulet", description: "Infuse amulet with protective resonance.", outputKey: "guard-amulet", ingredients: [{ key: "crystal-grain", qty: 2 }, { key: "craft-essence", qty: 2 }] },
    { key: "craft-mossmeal", name: "Prepare Mossmeal", description: "Mix thornberry and grove herbs.", outputKey: "mossmeal", ingredients: [{ key: "thornberry", qty: 2 }, { key: "kelp-crisp", qty: 1 }] },
    { key: "craft-demo-care-kit", name: "Assemble Demo Care Kit (Demo)", description: "Bundle demo care supplies.", outputKey: "demo-care-kit", ingredients: [{ key: "crystal-scrub", qty: 1 }, { key: "moondew-flask", qty: 1 }] },
    { key: "craft-evolution-stone", name: "Synthesize Evolution Stone", description: "Rare catalyst for evolution.", outputKey: "evolution-stone", ingredients: [{ key: "astral-thread", qty: 3 }, { key: "echo-mist", qty: 1 }, { key: "craft-essence", qty: 5 }] },
  ];

  for (const def of recipeDefs) {
    const filteredIngredients = def.ingredients.filter((i) => i.qty > 0);
    const recipe = await prisma.recipe.create({
      data: {
        key: def.key,
        name: def.name,
        description: def.description,
        outputItemId: itemIds.get(def.outputKey)!,
        outputQuantity: def.outputQty ?? 1,
        craftDurationSec: def.duration ?? 60,
        minPlayerLevel: 1,
        active: true,
      },
    });
    for (const ing of filteredIngredients) {
      await prisma.recipeIngredient.create({
        data: { recipeId: recipe.id, itemId: itemIds.get(ing.key)!, quantity: ing.qty },
      });
    }
  }
  console.log(`Seeded ${recipeDefs.length} recipes`);

  // ─── Regions (7) ───────────────────────────────────────────────────────────
  const regionDefs = [
    { key: "sproutfall-grove", name: "Sproutfall Grove", description: "Lush starter region where moss and light intertwine.", sortOrder: 1, isPlayable: true, comingLater: false, mapAssetKey: "map-sproutfall-grove", musicKey: "music-grove" },
    { key: "cindercrag-basin", name: "Cindercrag Basin", description: "Volcanic basin of ember stone and ash winds.", sortOrder: 2, isPlayable: true, comingLater: false, mapAssetKey: "map-cindercrag-basin", musicKey: "music-ember" },
    { key: "tidepool-expanse", name: "Tidepool Expanse", description: "Shallow seas and coral arches — arriving soon.", sortOrder: 3, isPlayable: false, comingLater: true, mapAssetKey: "map-tidepool-expanse", musicKey: "music-tide" },
    { key: "stormpeaks-ridge", name: "Stormpeaks Ridge", description: "Lightning-scarred peaks — arriving soon.", sortOrder: 4, isPlayable: false, comingLater: true, mapAssetKey: "map-stormpeaks-ridge", musicKey: "music-storm" },
    { key: "frostveil-tundra", name: "Frostveil Tundra", description: "Endless ice fields — arriving soon.", sortOrder: 5, isPlayable: false, comingLater: true, mapAssetKey: "map-frostveil-tundra", musicKey: "music-frost" },
    { key: "voidshard-depths", name: "Voidshard Depths", description: "Fractured void caverns — arriving soon.", sortOrder: 6, isPlayable: false, comingLater: true, mapAssetKey: "map-voidshard-depths", musicKey: "music-void" },
    { key: "astral-convergence", name: "Astral Convergence", description: "Celestial nexus of rift light — arriving soon.", sortOrder: 7, isPlayable: false, comingLater: true, mapAssetKey: "map-astral-convergence", musicKey: "music-radiant" },
  ];

  const regionIds = new Map<string, string>();
  for (const def of regionDefs) {
    const region = await prisma.region.create({
      data: {
        key: def.key,
        name: def.name,
        description: def.description,
        sortOrder: def.sortOrder,
        isPlayable: def.isPlayable,
        unlockLevel: 1,
        unlockTier: TokenTier.VISITOR,
        mapAssetKey: def.mapAssetKey,
        musicKey: def.musicKey,
        comingLater: def.comingLater,
      },
    });
    regionIds.set(def.key, region.id);
    if (def.isPlayable) {
      await prisma.mapDefinition.create({
        data: {
          regionId: region.id,
          tilemapPath: `/maps/${def.key}/tilemap.json`,
          collisionKey: `${def.key}-collision`,
          spawnZones: { default: { x: 10, y: 12 } },
          npcSpawns: [],
          pickupSpawns: [],
          portals: [],
        },
      });
    }
  }
  console.log(`Seeded ${regionIds.size} regions`);

  // ─── Quests (20) ───────────────────────────────────────────────────────────
  const questDefs: {
    key: string; name: string; description: string; category: QuestCategory;
    regionKey?: string; chainKey?: string; objective: { key: string; description: string; metric: string; target?: number };
    reward: { kind: string; payload: Record<string, unknown> };
  }[] = [
    { key: "story-first-steps", name: "First Steps in the Grove", description: "Learn the basics of keeper life in Sproutfall Grove.", category: QuestCategory.STORY, regionKey: "sproutfall-grove", objective: { key: "visit-grove", description: "Visit Sproutfall Grove", metric: "region_visit", target: 1 }, reward: { kind: "CREDITS", payload: { amount: 100 } } },
    { key: "story-ember-call", name: "Ember's Call", description: "Venture into Cindercrag Basin.", category: QuestCategory.STORY, regionKey: "cindercrag-basin", chainKey: "main", objective: { key: "visit-basin", description: "Reach Cindercrag Basin", metric: "region_visit", target: 1 }, reward: { kind: "ITEM", payload: { itemKey: "emberberry", quantity: 5 } } },
    { key: "daily-feed-riftling", name: "Daily Feeding", description: "Feed a Riftling once today.", category: QuestCategory.DAILY, objective: { key: "feed-once", description: "Feed any Riftling", metric: "care_feed", target: 1 }, reward: { kind: "CREDITS", payload: { amount: 50 } } },
    { key: "daily-hygiene", name: "Sparkling Clean", description: "Perform hygiene care today.", category: QuestCategory.DAILY, objective: { key: "hygiene-once", description: "Clean a Riftling", metric: "care_hygiene", target: 1 }, reward: { kind: "CREDITS", payload: { amount: 50 } } },
    { key: "weekly-hatch", name: "Weekly Hatchling", description: "Hatch an egg this week.", category: QuestCategory.WEEKLY, objective: { key: "hatch-one", description: "Hatch 1 egg", metric: "hatch_count", target: 1 }, reward: { kind: "ITEM", payload: { itemKey: "demo-snack-pack", quantity: 1 } } },
    { key: "weekly-bond", name: "Bond Builder", description: "Raise bond with a Riftling 5 times.", category: QuestCategory.WEEKLY, objective: { key: "bond-five", description: "Bond actions x5", metric: "care_bond", target: 5 }, reward: { kind: "CREDITS", payload: { amount: 200 } } },
    { key: "explore-grove-trail", name: "Grove Trail Scout", description: "Discover grove landmarks.", category: QuestCategory.EXPLORATION, regionKey: "sproutfall-grove", objective: { key: "discover-grove", description: "Discover 3 landmarks", metric: "landmark_discover", target: 3 }, reward: { kind: "ITEM", payload: { itemKey: "rift-compass", quantity: 1 } } },
    { key: "explore-basin-ridge", name: "Basin Ridge Walk", description: "Traverse the cindercrag ridge path.", category: QuestCategory.EXPLORATION, regionKey: "cindercrag-basin", objective: { key: "walk-ridge", description: "Complete ridge path", metric: "path_complete", target: 1 }, reward: { kind: "CREDITS", payload: { amount: 150 } } },
    { key: "care-rest-cycle", name: "Rest Cycle", description: "Let a Riftling rest fully.", category: QuestCategory.CARE, objective: { key: "rest-full", description: "Complete rest care", metric: "care_rest", target: 1 }, reward: { kind: "ITEM", payload: { itemKey: "dreamnest-cushion", quantity: 1 } } },
    { key: "care-happy-streak", name: "Happy Streak", description: "Keep happiness above 80 for 3 days.", category: QuestCategory.CARE, objective: { key: "happy-streak", description: "3-day happiness streak", metric: "happiness_streak", target: 3 }, reward: { kind: "CREDITS", payload: { amount: 300 } } },
    { key: "battle-training", name: "Training Grounds", description: "Complete a training session.", category: QuestCategory.BATTLE, objective: { key: "train-once", description: "Finish training", metric: "training_complete", target: 1 }, reward: { kind: "ITEM", payload: { itemKey: "spark-ribbon", quantity: 1 } } },
    { key: "battle-spar", name: "Friendly Spar", description: "Win a practice spar.", category: QuestCategory.BATTLE, objective: { key: "spar-win", description: "Win 1 spar", metric: "spar_win", target: 1 }, reward: { kind: "CREDITS", payload: { amount: 120 } } },
    { key: "collect-ember-species", name: "Ember Collector", description: "Own an Ember affinity Riftling.", category: QuestCategory.COLLECTION, objective: { key: "own-ember", description: "Own Ember Riftling", metric: "species_affinity", target: 1 }, reward: { kind: "ITEM", payload: { itemKey: "emberberry", quantity: 10 } } },
    { key: "collect-grove-species", name: "Grove Collector", description: "Own a Grove affinity Riftling.", category: QuestCategory.COLLECTION, objective: { key: "own-grove", description: "Own Grove Riftling", metric: "species_affinity", target: 1 }, reward: { kind: "ITEM", payload: { itemKey: "mossmeal", quantity: 10 } } },
    { key: "collect-rare", name: "Rare Discovery", description: "Hatch a Rare or higher Riftling.", category: QuestCategory.COLLECTION, objective: { key: "hatch-rare", description: "Hatch Rare+", metric: "hatch_rarity", target: 1 }, reward: { kind: "CREDITS", payload: { amount: 500 } } },
    { key: "community-gather", name: "Community Gathering", description: "Participate in a community event.", category: QuestCategory.COMMUNITY, objective: { key: "event-participate", description: "Join community event", metric: "event_participate", target: 1 }, reward: { kind: "CREDITS", payload: { amount: 250 } } },
    { key: "community-boss-hit", name: "Boss Strike", description: "Deal damage to the community boss.", category: QuestCategory.COMMUNITY, objective: { key: "boss-damage", description: "Deal 100 boss damage", metric: "boss_damage", target: 100 }, reward: { kind: "ITEM", payload: { itemKey: "event-sparkler", quantity: 1 } } },
    { key: "event-seasonal", name: "Season Opener", description: "Log in during the active season.", category: QuestCategory.EVENT, objective: { key: "season-login", description: "Season login", metric: "season_login", target: 1 }, reward: { kind: "CREDITS", payload: { amount: 100 } } },
    { key: "story-rift-compass", name: "Calibrated Path", description: "Obtain a Rift Compass.", category: QuestCategory.STORY, chainKey: "main", objective: { key: "get-compass", description: "Own Rift Compass", metric: "item_owned", target: 1 }, reward: { kind: "CREDITS", payload: { amount: 175 } } },
    { key: "daily-play-session", name: "Daily Check-In (Demo)", description: "Complete a demo play session.", category: QuestCategory.DAILY, objective: { key: "demo-session", description: "Play demo session", metric: "demo_session", target: 1 }, reward: { kind: "CREDITS", payload: { amount: 25 } } },
  ];

  for (const def of questDefs) {
    const quest = await prisma.quest.create({
      data: {
        key: def.key,
        name: def.name,
        description: def.description,
        category: def.category,
        chainKey: def.chainKey,
        requirements: {},
        startConditions: { minLevel: 1 },
        repeatable: def.category === QuestCategory.DAILY || def.category === QuestCategory.WEEKLY,
        regionId: def.regionKey ? regionIds.get(def.regionKey) : null,
        active: true,
      },
    });
    await prisma.questObjective.create({
      data: {
        questId: quest.id,
        key: def.objective.key,
        description: def.objective.description,
        targetCount: def.objective.target ?? 1,
        metric: def.objective.metric,
      },
    });
    await prisma.questReward.create({
      data: {
        questId: quest.id,
        kind: def.reward.kind,
        payload: def.reward.payload as Prisma.InputJsonValue,
      },
    });
  }
  console.log(`Seeded ${questDefs.length} quests`);

  // ─── Achievements (15) ─────────────────────────────────────────────────────
  const achievementDefs = [
    { key: "first-hatch", name: "First Hatch", description: "Hatch your first Riftling.", iconKey: "ach-first-hatch", points: 10, criteria: { metric: "hatch_count", target: 1 } },
    { key: "keeper-oath", name: "Keeper's Oath", description: "Claim your starter egg.", iconKey: "ach-starter", points: 15, criteria: { metric: "starter_claimed", target: 1 } },
    { key: "care-master", name: "Care Master", description: "Perform 50 care actions.", iconKey: "ach-care", points: 20, criteria: { metric: "care_total", target: 50 } },
    { key: "grove-explorer", name: "Grove Explorer", description: "Fully discover Sproutfall Grove.", iconKey: "ach-grove", points: 25, criteria: { metric: "region_discovery", regionKey: "sproutfall-grove", target: 100 } },
    { key: "basin-explorer", name: "Basin Explorer", description: "Fully discover Cindercrag Basin.", iconKey: "ach-basin", points: 25, criteria: { metric: "region_discovery", regionKey: "cindercrag-basin", target: 100 } },
    { key: "rare-find", name: "Rare Find", description: "Hatch a Rare Riftling.", iconKey: "ach-rare", points: 30, criteria: { metric: "hatch_rarity", rarity: "RARE" } },
    { key: "epic-find", name: "Epic Discovery", description: "Hatch an Epic Riftling.", iconKey: "ach-epic", points: 50, criteria: { metric: "hatch_rarity", rarity: "EPIC" } },
    { key: "legendary-find", name: "Legendary Echo", description: "Hatch a Legendary Riftling.", iconKey: "ach-legendary", points: 100, criteria: { metric: "hatch_rarity", rarity: "LEGENDARY" } },
    { key: "prismatic-shine", name: "Prismatic Shine", description: "Hatch a prismatic variant.", iconKey: "ach-prismatic", points: 75, criteria: { metric: "hatch_prismatic", target: 1 } },
    { key: "collection-5", name: "Growing Collection", description: "Own 5 unique species.", iconKey: "ach-collect-5", points: 20, criteria: { metric: "unique_species", target: 5 } },
    { key: "collection-10", name: "Riftling Archivist", description: "Own 10 unique species.", iconKey: "ach-collect-10", points: 40, criteria: { metric: "unique_species", target: 10 } },
    { key: "bond-100", name: "True Bond", description: "Reach 100 bond with a Riftling.", iconKey: "ach-bond", points: 30, criteria: { metric: "max_bond", target: 100 } },
    { key: "quest-10", name: "Quest Wanderer", description: "Complete 10 quests.", iconKey: "ach-quest", points: 25, criteria: { metric: "quests_completed", target: 10 } },
    { key: "demo-complete", name: "Demo Complete (Demo)", description: "Finish the demo onboarding flow.", iconKey: "ach-demo", points: 10, criteria: { metric: "demo_complete", target: 1 } },
    { key: "season-participant", name: "Season Participant", description: "Earn points in an active season.", iconKey: "ach-season", points: 15, criteria: { metric: "season_points", target: 1 } },
  ];

  for (const def of achievementDefs) {
    await prisma.achievement.create({
      data: { key: def.key, name: def.name, description: def.description, iconKey: def.iconKey, points: def.points, criteria: def.criteria, active: true },
    });
  }
  console.log(`Seeded ${achievementDefs.length} achievements`);

  // ─── Season & Community Event ────────────────────────────────────────────────
  const seasonStart = new Date();
  const seasonEnd = new Date(seasonStart);
  seasonEnd.setMonth(seasonEnd.getMonth() + 3);

  const season = await prisma.season.create({
    data: {
      key: "season-1-awakening",
      name: "Season 1: Awakening",
      startsAt: seasonStart,
      endsAt: seasonEnd,
      active: true,
    },
  });

  const communityEvent = await prisma.communityEvent.create({
    data: {
      key: "event-rift-awakening",
      name: "Rift Awakening (Demo)",
      description: "Community event placeholder for the Awakening season. Boss raids coming soon.",
      seasonId: season.id,
      startsAt: seasonStart,
      endsAt: seasonEnd,
      active: true,
      metadata: { demo: true, placeholder: true },
    },
  });

  await prisma.communityBoss.create({
    data: {
      eventId: communityEvent.id,
      name: "Shard Titan (Placeholder)",
      maxHealth: 1_000_000,
      currentHealth: 1_000_000,
      dailyAttemptCap: 3,
      artworkPath: "/art/bosses/shard-titan-placeholder.png",
      active: true,
    },
  });

  // ─── Egg Types ─────────────────────────────────────────────────────────────
  const allAffinities = Object.values(AffinityName);
  const allRarities = Object.values(Rarity);
  const eggTypeDefs = [
    { key: "wild-egg", eggClass: EggClass.WILD, displayName: "Wild Rift Egg", description: "A mysterious egg found in the wild rifts.", appearanceKey: "egg-wild", affinities: allAffinities, rarities: allRarities },
    { key: "ember-egg", eggClass: EggClass.EMBER, displayName: "Ember Rift Egg", description: "Warm to the touch with ember veins.", appearanceKey: "egg-ember", affinities: [AffinityName.EMBER], rarities: allRarities },
    { key: "tide-egg", eggClass: EggClass.TIDE, displayName: "Tide Rift Egg", description: "Rippling shell like shallow tide pools.", appearanceKey: "egg-tide", affinities: [AffinityName.TIDE], rarities: allRarities },
    { key: "grove-egg", eggClass: EggClass.GROVE, displayName: "Grove Rift Egg", description: "Moss-dappled shell from Sproutfall.", appearanceKey: "egg-grove", affinities: [AffinityName.GROVE], rarities: allRarities },
    { key: "storm-egg", eggClass: EggClass.STORM, displayName: "Storm Rift Egg", description: "Crackling shell charged with storm energy.", appearanceKey: "egg-storm", affinities: [AffinityName.STORM], rarities: allRarities },
  ];

  const eggTypeIds = new Map<string, string>();
  for (const def of eggTypeDefs) {
    const row = await prisma.eggType.create({
      data: {
        key: def.key,
        eggClass: def.eggClass,
        displayName: def.displayName,
        description: def.description,
        appearanceKey: def.appearanceKey,
        incubationHours: 6,
        possibleAffinities: def.affinities,
        possibleRarities: def.rarities,
        active: true,
      },
    });
    eggTypeIds.set(def.key, row.id);
  }
  console.log(`Seeded ${eggTypeIds.size} egg types`);

  // ─── Risk Disclosure ───────────────────────────────────────────────────────
  await prisma.riskDisclosureVersion.create({
    data: {
      version: 1,
      title: "Project Hatch Risk Disclosure v1",
      body: "Project Hatch is a game on The Riftwilds. Demo credits have no cash value. Token holdings unlock access tiers only. No guaranteed returns. Permanent death and real-money features are disabled in this phase.",
      active: true,
    },
  });

  // ─── System Status ─────────────────────────────────────────────────────────
  const systemStatuses = [
    { key: "api", status: "operational", message: "All API services running normally." },
    { key: "database", status: "operational", message: "PostgreSQL connected." },
    { key: "hatching", status: "operational", message: "Hatching pipeline active." },
    { key: "care", status: "operational", message: "Care system active." },
    { key: "solana-rpc", status: "degraded", message: "Devnet RPC — token gate in preview mode." },
    { key: "marketplace", status: "disabled", message: "Marketplace disabled in phase 1." },
  ];
  for (const s of systemStatuses) {
    await prisma.systemStatus.create({ data: s });
  }

  // ─── Game Settings ─────────────────────────────────────────────────────────
  await prisma.gameSetting.create({
    data: {
      key: "MARKETPLACE_FEE_BPS",
      value: { feeBps: 250, description: "2.5% marketplace fee in demo credits" },
      version: 1,
    },
  });

  // ─── Demo User, Eggs & Creatures ───────────────────────────────────────────
  const demoWalletAddress = "Demo1111111111111111111111111111111111111";

  const demoUser = await prisma.user.create({
    data: {
      role: "player",
      wallets: {
        create: {
          address: demoWalletAddress,
          network: "devnet",
          isPrimary: true,
          verifiedAt: new Date(),
        },
      },
      profile: {
        create: {
          username: "demo_keeper",
          displayName: "Demo Keeper (Demo)",
          bio: "Demo account for Project Hatch development.",
          demoCredits: 10000,
          starterEggClaimed: false,
          tokenTier: TokenTier.VISITOR,
          rankTitle: "Hatchling Keeper",
        },
      },
      settings: { create: {} },
    },
    include: { wallets: true, profile: true },
  });

  const primaryWallet = demoUser.wallets[0];
  await prisma.user.update({
    where: { id: demoUser.id },
    data: { primaryWalletId: primaryWallet.id },
  });

  await prisma.playerRegionProgress.createMany({
    data: [
      { userId: demoUser.id, regionId: regionIds.get("sproutfall-grove")!, unlocked: true, discoveryPct: 10 },
      { userId: demoUser.id, regionId: regionIds.get("cindercrag-basin")!, unlocked: true, discoveryPct: 5 },
    ],
  });

  await prisma.inventoryItem.createMany({
    data: [
      { userId: demoUser.id, itemId: itemIds.get("emberberry")!, quantity: 10 },
      { userId: demoUser.id, itemId: itemIds.get("mossmeal")!, quantity: 10 },
      { userId: demoUser.id, itemId: itemIds.get("demo-snack-pack")!, quantity: 3, bound: true },
      { userId: demoUser.id, itemId: itemIds.get("demo-care-kit")!, quantity: 1, bound: true },
    ],
  });

  const demoEggWild = await prisma.egg.create({
    data: {
      ownerId: demoUser.id,
      eggTypeId: eggTypeIds.get("wild-egg")!,
      eggClass: EggClass.WILD,
      acquisitionMethod: EggAcquisitionMethod.ADMIN_PROMO,
      status: EggStatus.OWNED,
      appearanceKey: "egg-wild",
      oddsVersionId: oddsVersion.id,
      txReference: "demo-seed-egg-wild",
      metadata: { demo: true, label: "Demo Wild Egg (Demo)" },
    },
  });

  const demoEggEmber = await prisma.egg.create({
    data: {
      ownerId: demoUser.id,
      eggTypeId: eggTypeIds.get("ember-egg")!,
      eggClass: EggClass.EMBER,
      acquisitionMethod: EggAcquisitionMethod.SHOP,
      status: EggStatus.INCUBATING,
      appearanceKey: "egg-ember",
      oddsVersionId: oddsVersion.id,
      incubationStartedAt: new Date(),
      hatchReadyAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
      txReference: "demo-seed-egg-ember",
      metadata: { demo: true, label: "Demo Ember Egg (Demo)" },
    },
  });

  const demoEggGrove = await prisma.egg.create({
    data: {
      ownerId: demoUser.id,
      eggTypeId: eggTypeIds.get("grove-egg")!,
      eggClass: EggClass.GROVE,
      acquisitionMethod: EggAcquisitionMethod.QUEST_REWARD,
      status: EggStatus.READY,
      appearanceKey: "egg-grove",
      oddsVersionId: oddsVersion.id,
      incubationStartedAt: new Date(Date.now() - 7 * 60 * 60 * 1000),
      hatchReadyAt: new Date(Date.now() - 60 * 60 * 1000),
      txReference: "demo-seed-egg-grove",
      metadata: { demo: true, label: "Demo Grove Egg (Demo)" },
    },
  });

  const mossprigSpeciesId = speciesIds.get("mossprig")!;
  const cindercubSpeciesId = speciesIds.get("cindercub")!;

  await prisma.creature.create({
    data: {
      creatureNumber: 1,
      customName: "Sprout (Demo)",
      speciesId: mossprigSpeciesId,
      ownerId: demoUser.id,
      originalOwnerId: demoUser.id,
      rarity: Rarity.COMMON,
      level: 5,
      lifecycle: CreatureLifecycle.HAPPY,
      hunger: 85,
      happiness: 90,
      hygiene: 80,
      energy: 75,
      bond: 35,
      isFavorite: true,
      isOnActiveTeam: true,
      teamSlot: 1,
      hatchedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.creature.create({
    data: {
      creatureNumber: 2,
      customName: "Cinder (Demo)",
      speciesId: cindercubSpeciesId,
      ownerId: demoUser.id,
      originalOwnerId: demoUser.id,
      rarity: Rarity.UNCOMMON,
      level: 8,
      lifecycle: CreatureLifecycle.STABLE,
      hunger: 70,
      happiness: 75,
      hygiene: 65,
      energy: 80,
      bond: 28,
      isOnActiveTeam: true,
      teamSlot: 2,
      hatchedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  console.log("Seeded demo user with wallet, profile, inventory, eggs, and creatures");
  console.log(`  Demo wallet: ${demoWalletAddress}`);
  console.log(`  Demo eggs: wild=${demoEggWild.id}, ember=${demoEggEmber.id}, grove=${demoEggGrove.id}`);
  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
