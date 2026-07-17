/**
 * Feature flag defaults. Runtime overrides live in GameSetting / FeatureFlag tables.
 * Risky real-money features default to false.
 *
 * REAL_VALUE_WAGERING_ENABLED is intentionally NOT listed here and has no admin toggle.
 * See `src/lib/config/arena.ts`.
 */

export const featureFlagDefaults = {
  TOKEN_GATE_ENABLED: true,
  STARTER_EGG_CLAIMS_ENABLED: true,
  HATCHING_ENABLED: true,
  CARE_ENABLED: true,
  PERMANENT_DEATH_ENABLED: false,
  EXPLORATION_ENABLED: false,
  /** Legacy flag — prefer ARENA_ENABLED for Riftwilds Arena. */
  BATTLES_ENABLED: true,
  PVP_ENABLED: false,
  MARKETPLACE_ENABLED: false,
  /** Browse demo / scaffolding catalog even when live marketplace writes are off. */
  MARKETPLACE_DEMO_CATALOG_ENABLED: true,
  /** Create / cancel listings (still demo-credit unless SOL flags are on). */
  MARKETPLACE_WRITES_ENABLED: false,
  MARKETPLACE_EGG_SALES_ENABLED: true,
  MARKETPLACE_PET_SALES_ENABLED: true,
  MARKETPLACE_BUNDLE_LISTINGS_ENABLED: true,
  REAL_SOL_MARKETPLACE_ENABLED: false,
  QUESTS_ENABLED: false,
  CRAFTING_ENABLED: false,
  EVOLUTION_ENABLED: false,
  COMMUNITY_BOSS_ENABLED: false,
  /** Soft-currency / demo epoch rewards loop (still not real money). */
  EPOCH_REWARDS_ENABLED: false,
  REAL_MONEY_REWARDS_ENABLED: false,
  NFT_MINTING_ENABLED: false,
  MAINTENANCE_MODE: false,

  // ─── MMO systems (Phase 1 shells + progressive unlock) ─────────────────────
  EGG_SYSTEM_ENABLED: true,
  BREEDING_ENABLED: false,
  GENETICS_ENABLED: true,
  PET_CARE_ENABLED: true,
  /** Species lore Codex + deterministic personal biographies at hatch. */
  PET_LORE_ENABLED: true,
  STORY_ENABLED: false,
  /** Legacy shell flag — keep in sync with PLAYABLE_LIVE_WORLD_ENABLED for older checks. */
  LIVE_WORLD_ENABLED: true,

  // ─── Playable Live World (browser multiplayer habitat) ─────────────────────
  /** Phase 1 playable Phaser world (local-authoritative movement). */
  PLAYABLE_LIVE_WORLD_ENABLED: true,
  /** Phase 2+ WebSocket instances — hooks scaffolded; still local in Phase 1. */
  LIVE_WORLD_MULTIPLAYER_ENABLED: true,
  LIVE_WORLD_CHAT_ENABLED: true,
  LIVE_WORLD_PVE_ENABLED: true,
  LIVE_WORLD_GATHERING_ENABLED: true,
  LIVE_WORLD_EVENTS_ENABLED: true,
  LIVE_WORLD_WORLD_BOSSES_ENABLED: true,
  LIVE_WORLD_HOMESTEADS_ENABLED: false,
  LIVE_WORLD_GUILDS_ENABLED: false,
  /** Secondary / embed camera — not the default UX. */
  LIVE_WORLD_SPECTATOR_MODE_ENABLED: false,
  LIVE_WORLD_MOBILE_CONTROLS_ENABLED: true,

  RANKED_ENABLED: false,
  UPGRADES_ENABLED: false,
  SOL_PURCHASES_ENABLED: false,
  REVENUE_SPLIT_ENABLED: true,
  HOLDER_REWARDS_ENABLED: true,
  GUILDS_ENABLED: false,
  HOMESTEADS_ENABLED: false,
  FARMING_ENABLED: false,
  PET_JOBS_ENABLED: false,
  WORLD_BOSSES_ENABLED: false,
  SEASONAL_EVENTS_ENABLED: false,
  PLAYER_BUSINESSES_ENABLED: false,
  COMMUNITY_VOTING_ENABLED: false,

  // ─── Riftwilds Arena ───────────────────────────────────────────────────────
  ARENA_ENABLED: true,
  CASUAL_DUELS_ENABLED: false,
  RANKED_DUELS_ENABLED: false,
  TOURNAMENTS_ENABLED: false,
  WEAPONS_ENABLED: true,
  EQUIPMENT_CRAFTING_ENABLED: false,
  SPECTATOR_MODE_ENABLED: false,
  COMMUNITY_PREDICTIONS_ENABLED: false,
  ARENA_POINTS_ENABLED: true,
  SPONSORED_PRIZES_ENABLED: false,

  // ─── Item / SOL economy ────────────────────────────────────────────────────
  /** Phase 1: browse shop; live SOL checkout stays off until Phase 2. */
  SOL_ITEM_PURCHASES_ENABLED: false,
  ITEM_MARKETPLACE_ENABLED: false,
  WEAPON_SYSTEM_ENABLED: true,
  ARMOR_SYSTEM_ENABLED: true,
  POTION_SYSTEM_ENABLED: true,
  ABILITY_SCROLLS_ENABLED: true,
  CRAFTING_SOL_FEES_ENABLED: false,
  ITEM_UPGRADES_ENABLED: false,
  ONCHAIN_COLLECTIBLES_ENABLED: false,
  /** Hard-off: no paid mystery boxes / gacha. */
  PAID_RANDOM_REWARDS_ENABLED: false,
  RANKED_EQUIPMENT_NORMALIZATION_ENABLED: true,
  ITEM_SHOP_BROWSE_ENABLED: true,

  // ─── Revenue allocation & holder rewards ───────────────────────────────────
  REVENUE_ALLOCATION_ENABLED: true,
  SHOP_REVENUE_SPLIT_ENABLED: true,
  MARKETPLACE_REVENUE_SPLIT_ENABLED: true,
  CRAFTING_REVENUE_SPLIT_ENABLED: true,
  UPGRADE_REVENUE_SPLIT_ENABLED: true,
  HOLDER_REWARD_VAULT_ENABLED: true,
  PET_HOLDER_REWARDS_ENABLED: true,
  EGG_HOLDER_REWARDS_ENABLED: false,
  REWARD_CLAIMS_ENABLED: false,
  AUTOMATIC_SETTLEMENT_ENABLED: false,
  ONCHAIN_ATOMIC_SPLIT_ENABLED: false,
  REVENUE_TRANSPARENCY_ENABLED: true,

  // ─── 10-year expansion foundations ─────────────────────────────────────────
  /** Plugin-style expansion packs + content registries. */
  EXPANSION_FRAMEWORK_ENABLED: true,
  /** Day/night, seasons, weather clock for Live World + APIs. */
  LIVING_WORLD_CLOCK_ENABLED: true,
  /** Branching story engine (sample arcs). */
  STORY_ENGINE_ENABLED: true,
  /** Collective milestones that permanently alter world state. */
  CIVILIZATION_RESTORATION_ENABLED: true,
  /** Large achievement catalog + pure evaluator. */
  ACHIEVEMENT_UNIVERSE_ENABLED: true,
  /** Deterministic procedural expedition generator. */
  PROCEDURAL_EXPEDITIONS_ENABLED: true,
  /** Recurring festival calendar framework. */
  FESTIVALS_ENABLED: true,
  /** Structured alleles extending hatchery seeds. */
  GENETICS_V2_ENABLED: true,
  /** Personality / mood / memory / idle interaction stubs. */
  RIFTLING_AI_ENABLED: true,
  /** Lore-grounded Archivist companion. */
  AI_ARCHIVIST_ENABLED: true,
  /** Ecosystem dashboard + expansion discovery UI. */
  ECOSYSTEM_DASHBOARD_ENABLED: true,
  /** Living timeline (player / pet / world). */
  LIVING_TIMELINE_ENABLED: true,
  /** Raid scaffolds — requires multiplayer service later. */
  ENDGAME_RAIDS_ENABLED: false,
  /** Endless Rift floor generator stub. */
  ENDLESS_RIFT_ENABLED: false,
  /** Cinematic script player framework. */
  CINEMATICS_ENABLED: true,
  /** Admin analytics shell (in-memory). */
  ANALYTICS_DASHBOARD_ENABLED: true,
  /** Photo mode / galleries / contests stubs. */
  COMMUNITY_PHOTO_ENABLED: false,
  /** Rich marketplace pet history cards. */
  MARKETPLACE_PET_HISTORY_ENABLED: true,

  // ─── Post-Pump.fun ecosystem transition ────────────────────────────────────
  /** Player hub dashboard (/dashboard). */
  ECOSYSTEM_PLAYER_DASHBOARD_ENABLED: true,
  /** Live token analytics surfaces (/token, /analytics/token). */
  ECOSYSTEM_TOKEN_ANALYTICS_ENABLED: true,
  /** Community treasury page (/treasury). */
  ECOSYSTEM_TREASURY_ENABLED: true,
  /** Reward Center (/rewards) — community treasury framing. */
  ECOSYSTEM_REWARD_CENTER_ENABLED: true,
  /** Global activity feed component + API. */
  ECOSYSTEM_ACTIVITY_FEED_ENABLED: true,
  /** World restoration progress page. */
  ECOSYSTEM_RESTORATION_DISPLAY_ENABLED: true,
  /** Live MMO presence stubs (counts stay null until WS). */
  ECOSYSTEM_PRESENCE_STUBS_ENABLED: true,
  /** Creator Hub scaffolding. */
  ECOSYSTEM_CREATOR_HUB_ENABLED: true,
  /** Social hub stubs (friends / party / DM / posts / calendar). */
  ECOSYSTEM_SOCIAL_HUB_ENABLED: true,
  /** Marketplace browse categories (housing, cosmetics, wishlists…). */
  ECOSYSTEM_MARKETPLACE_BROWSE_ENABLED: true,
  /** Post-grad nav emphasis (Play / Dashboard / Treasury / Rewards / World). */
  ECOSYSTEM_POST_GRAD_NAV_ENABLED: true,

  // ─── Modular auth (email/social first, wallet optional) ────────────────────
  /** Show email/social-first login scaffolding. */
  AUTH_EMAIL_ENABLED: false,
  AUTH_SOCIAL_ENABLED: false,
  /** SIWS wallet auth — production path today. */
  AUTH_WALLET_SIWS_ENABLED: true,
  /** Soft play without wallet (recommended onboarding). */
  AUTH_WALLET_OPTIONAL_PLAY: true,
  AUTH_NEXTAUTH_BRIDGE_ENABLED: false,
  AUTH_CLERK_BRIDGE_ENABLED: false,
  /** Login / account page with modular providers. */
  AUTH_MODULAR_LOGIN_UI_ENABLED: true,
} as const;

export type FeatureFlagKey = keyof typeof featureFlagDefaults;

/** Runtime overrides may flip any flag — not constrained to default literal values. */
export type FeatureFlagOverrides = Partial<Record<FeatureFlagKey, boolean>>;

export function isFeatureEnabled(
  key: FeatureFlagKey,
  overrides?: FeatureFlagOverrides,
): boolean {
  if (overrides && key in overrides && typeof overrides[key] === "boolean") {
    return overrides[key]!;
  }
  return featureFlagDefaults[key];
}
