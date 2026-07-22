/**
 * Feature flag defaults. Runtime overrides live in GameSetting / FeatureFlag tables.
 * Risky real-money features default to false.
 *
 * REAL_VALUE_WAGERING_ENABLED is intentionally NOT listed here and has no admin toggle.
 * See `src/lib/config/arena.ts`.
 */

export const featureFlagDefaults = {
  /**
   * Legacy seed flag for optional $RIFT cosmetic tier scaffolding.
   * Default OFF — never gate hatchery, TCG, quests, or starter package.
   * See `src/lib/economy/token-cosmetic-perks.ts` (cosmetics only, no P2W).
   */
  TOKEN_GATE_ENABLED: false,
  /** Optional holder cosmetic tiers (Explorer→Mythic Keeper). Default OFF. */
  TOKEN_COSMETIC_PERKS_ENABLED: false,
  /** Real holder payout / claim rails — always OFF unless explicitly enabled. */
  TOKEN_COSMETIC_PAYOUTS_ENABLED: false,
  /** Explicit anti-P2W product stance (copy + validators). */
  ANTI_PAY_TO_WIN_ENFORCED: true,
  /** Free-to-play core loop — hatch / battle / quests without wallet. */
  FREE_TO_PLAY_CORE_ENABLED: true,
  /** Auto-grant first-login starter package (Credits + starter egg path). */
  STARTER_PACKAGE_AUTO_GRANT_ENABLED: true,
  STARTER_EGG_CLAIMS_ENABLED: true,
  HATCHING_ENABLED: true,
  CARE_ENABLED: true,
  PERMANENT_DEATH_ENABLED: false,
  /** Riftling Life & Spirit — Downed, Spirit Realm, recovery methods. */
  SPIRIT_SYSTEM_ENABLED: true,
  /** Optional Instant Spirit Recall (SOL convenience). Never required. */
  SOL_SPIRIT_RECALL_ENABLED: false,
  /** Hardcore permadeath — opt-in only with explicit warnings. */
  HARDCORE_MODE_ENABLED: true,
  /** Memorial Garden + ancestor lore surfaces. */
  MEMORIAL_GARDEN_ENABLED: true,
  EXPLORATION_ENABLED: false,
  /** Legacy flag — prefer ARENA_ENABLED for Riftwilds Arena. */
  BATTLES_ENABLED: true,
  PVP_ENABLED: false,
  MARKETPLACE_ENABLED: false,
  /** Browse demo / scaffolding catalog even when live marketplace writes are off. */
  MARKETPLACE_DEMO_CATALOG_ENABLED: true,
  /** Create / cancel / Credits purchase (SOL escrow stays off). */
  MARKETPLACE_WRITES_ENABLED: true,
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
  /** Credits-fee breeding path live; SOL fee never required. */
  BREEDING_ENABLED: true,
  GENETICS_ENABLED: true,
  PET_CARE_ENABLED: true,
  /** Species lore Codex + deterministic personal biographies at hatch. */
  PET_LORE_ENABLED: true,
  STORY_ENABLED: false,
  /** Legacy shell flag — keep in sync with PLAYABLE_LIVE_WORLD_ENABLED for older checks. */
  LIVE_WORLD_ENABLED: true,

  // ─── Playable Live World (browser multiplayer habitat) ─────────────────────
  /**
   * Phaser systems / shell remain intact. TCG / Rift Battles stay the product
   * focus in nav/docs. Soft-gate entry with PUBLIC_ACCESS / DEV_PREVIEW.
   * See `isLiveWorldEntryOpen` / `canEnterLiveWorld`.
   */
  PLAYABLE_LIVE_WORLD_ENABLED: true,
  /**
   * Soft-gate for `/live-world`, `/restoration`, and World directory labels.
   * OFF = Coming Soon for everyone (including signed-in) until public launch.
   * Flip to `true` when Live World is ready for the public. Systems stay in-repo.
   */
  LIVE_WORLD_PUBLIC_ACCESS_ENABLED: false,
  /**
   * When PUBLIC_ACCESS is off, still allow Phaser enter outside production
   * (local/dev/internal preview). Ignored when NODE_ENV === "production".
   * Default OFF — `isLiveWorldEntryOpen` also auto-opens for NODE_ENV=development
   * / DEV_OVERRIDE / NEXT_PUBLIC_DEV_OVERRIDE (see docs/DEV_OVERRIDE.md).
   * Set true to force preview in other non-prod runtimes.
   */
  LIVE_WORLD_DEV_PREVIEW_ENABLED: false,
  /** Phase 2+ WebSocket instances — hooks scaffolded; still local in Phase 1. */
  LIVE_WORLD_MULTIPLAYER_ENABLED: true,
  LIVE_WORLD_CHAT_ENABLED: true,
  LIVE_WORLD_PVE_ENABLED: true,
  LIVE_WORLD_GATHERING_ENABLED: true,
  LIVE_WORLD_EVENTS_ENABLED: true,
  LIVE_WORLD_WORLD_BOSSES_ENABLED: true,
  LIVE_WORLD_HOMESTEADS_ENABLED: true,
  LIVE_WORLD_GUILDS_ENABLED: false,
  /** Secondary / embed camera — not the default UX. */
  LIVE_WORLD_SPECTATOR_MODE_ENABLED: false,
  LIVE_WORLD_MOBILE_CONTROLS_ENABLED: true,
  /** Player emotes, wheel, pings, consent stubs — cosmetic only. */
  LIVE_WORLD_EMOTES_ENABLED: true,

  // ─── Live World persistence / save-state ───────────────────────────────────
  /** Server session + autosave + safe logout APIs. */
  WORLD_PERSISTENCE_ENABLED: true,
  /** Persist WorldSaveState to Prisma when client regenerated + migration applied. */
  WORLD_PERSISTENCE_PRISMA_ENABLED: false,
  /** Sleeping character stubs in world — DEFAULT OFF. */
  SLEEPING_CHARACTERS_ENABLED: false,

  RANKED_ENABLED: false,
  UPGRADES_ENABLED: false,
  SOL_PURCHASES_ENABLED: false,
  REVENUE_SPLIT_ENABLED: true,
  HOLDER_REWARDS_ENABLED: true,
  GUILDS_ENABLED: false,
  HOMESTEADS_ENABLED: true,
  FARMING_ENABLED: false,
  PET_JOBS_ENABLED: false,
  WORLD_BOSSES_ENABLED: false,
  SEASONAL_EVENTS_ENABLED: false,
  PLAYER_BUSINESSES_ENABLED: false,
  COMMUNITY_VOTING_ENABLED: false,

  // ─── Riftwilds TCG (Reborn — primary battle resolution) ────────────────────
  /** Card framework, match engine, collection stubs. */
  TCG_FRAMEWORK_ENABLED: true,
  /** Live World enemy zones open TCG battles instead of instant demo resolve. */
  TCG_WORLD_ENCOUNTERS_ENABLED: true,
  /**
   * Soft-deprecated: AABB zone → instant “Training clash resolved” dialogue.
   * Kept for rollback demos; prefer TCG_WORLD_ENCOUNTERS_ENABLED.
   */
  LIVE_WORLD_LEGACY_INSTANT_COMBAT_ENABLED: false,

  // ─── Rift Arena (skill TCG hub — default free play) ────────────────────────
  /** Hub UI at /arena — browse, train, invite, ladder scaffolds. */
  RIFT_ARENA_HUB_ENABLED: true,
  /** Local free matchmaking queue (pairs into private lobby codes). */
  RIFT_ARENA_FREE_MATCHMAKING_ENABLED: true,
  /** Ranked ladder scaffolding visible; live rated queues stay soft. */
  RIFT_ARENA_RANKED_SCAFFOLD_ENABLED: true,
  /** Phase 2 — optional SOL stake matches. DEFAULT OFF. Never enable casually. */
  RIFT_ARENA_SOL_STAKES_ENABLED: false,
  /** Phase 2 — escrow write path. DEFAULT OFF. Requires stakes + wallet + compliance. */
  RIFT_ARENA_SOL_ESCROW_ENABLED: false,

  // ─── Rift Stakes (optional SOL wager PvP — separate from free Arena) ───────
  /**
   * Optional Rift Stakes lobby + DEMO escrow. DEFAULT OFF in production builds.
   * Local preview: set true here, or RIFT_STAKES_ENABLED=true in env.
   * Never gates Casual / Ranked / Training / Practice.
   */
  RIFT_STAKES_ENABLED: process.env.NODE_ENV !== "production",
  /** Real on-chain escrow/payout. DEFAULT OFF — DEMO uses identical API. */
  RIFT_STAKES_ONCHAIN_ENABLED: false,
  /** Public fee/treasury transparency surfaces for Rift Stakes. */
  RIFT_STAKES_TREASURY_UI_ENABLED: true,

  // ─── Riftwilds Arena (legacy pet battler — soft-secondary) ─────────────────
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

  // ─── SOL Economy mandate flags (ALL DEFAULT FALSE — never enable casually) ─
  /** Wallet UX for optional SOL spends (identity SIWS remains separate). */
  SOL_WALLET_ENABLED: false,
  /** SOL marketplace listings/settlement (also requires REAL_SOL_MARKETPLACE_ENABLED). */
  SOL_MARKETPLACE_ENABLED: false,
  /** SOL tournament entry fees — free/Gold tournaments stay available. */
  SOL_TOURNAMENTS_ENABLED: false,
  /** On-chain mint pipeline for collectible editions (also requires NFT_MINTING_ENABLED). */
  SOL_MINTING_ENABLED: false,
  /** Player SOL withdrawals / cash-out rails. */
  SOL_WITHDRAWALS_ENABLED: false,
  /** Creator marketplace SOL payouts (Credits creator path stays). */
  SOL_CREATOR_MARKETPLACE_ENABLED: false,
  /** Community funding campaigns accepting SOL. */
  SOL_COMMUNITY_FUNDING_ENABLED: false,
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
  /**
   * Project Treasury Ops — Pump.fun → single Project Treasury → distribution engine.
   * Demo-simulated by default; never enables player P2W or holder dividend autopay.
   */
  TREASURY_OPS_ENABLED: true,
  /** Live Solana payout broadcasts (requires encrypted server signer). Default OFF. */
  TREASURY_OPS_REAL_TRANSFERS: false,
  /** Monitoring worker / poll tick surface. */
  TREASURY_OPS_MONITOR_ENABLED: true,
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
  /** Server-authoritative friends + private messages (in-memory hot path). */
  FRIENDS_AND_PM_ENABLED: true,
  /** Persist friends/PM tables via Prisma — prepare-only until migration approved. */
  FRIENDS_AND_PM_PRISMA_ENABLED: false,
  /** Marketplace browse categories (housing, cosmetics, wishlists…). */
  ECOSYSTEM_MARKETPLACE_BROWSE_ENABLED: true,
  /** Post-grad nav emphasis (Play / Dashboard / Treasury / Rewards / World). */
  ECOSYSTEM_POST_GRAD_NAV_ENABLED: true,

  // ─── Credits soft currency + content systems ───────────────────────────────
  /** Server-authoritative Credits ledger APIs. */
  CREDITS_LEDGER_ENABLED: true,
  /**
   * Persist Credits to Prisma CurrencyLedger + PlayerProfile.softCurrency when
   * DATABASE_URL is configured and the user row exists. Memory remains hot path.
   */
  CREDITS_PRISMA_ENABLED: true,
  /** Map Goals panel + /api/map-goals. */
  MAP_GOALS_ENABLED: true,
  /** AI NPC dialogue with authored fallback (never grants rewards). */
  NPC_AI_DIALOGUE_ENABLED: true,
  /** Job board + public events content surfaces. */
  JOB_BOARD_EVENTS_ENABLED: true,
  /** Admin Content Studio shell. */
  ADMIN_CONTENT_STUDIO_ENABLED: true,

  // ─── Modular auth (account required for gameplay) ─────────────────────────
  /**
   * Absolute product rule: NO ACCOUNT = NO GAMEPLAY.
   * When true, rift_guest minting stops and protected routes/APIs require session.
   */
  AUTH_ACCOUNT_REQUIRED_FOR_PLAY: true,
  /** Email/password register + sign-in. */
  AUTH_EMAIL_ENABLED: true,
  /** Require email verification before ACTIVE gameplay (local may skip via env). */
  AUTH_EMAIL_VERIFICATION_REQUIRED: true,
  /** Google / Discord / Apple OAuth — scaffolded; live when keys present. */
  AUTH_SOCIAL_ENABLED: true,
  /** SIWS wallet auth — link wallet after account; may also create account via SIWS. */
  AUTH_WALLET_SIWS_ENABLED: true,
  /**
   * Legacy guest/soft play without account. OFF — guest gameplay removed.
   * Kept for rollback; AUTH_ACCOUNT_REQUIRED_FOR_PLAY takes precedence when true.
   */
  AUTH_WALLET_OPTIONAL_PLAY: false,
  AUTH_NEXTAUTH_BRIDGE_ENABLED: false,
  AUTH_CLERK_BRIDGE_ENABLED: false,
  /** Login / account page with modular providers. */
  AUTH_MODULAR_LOGIN_UI_ENABLED: true,

  // ─── Nakama (additive multiplayer backend — never replaces local systems) ─
  /**
   * Master switch for Nakama client + bridges. Default OFF so local demo paths
   * keep working without Docker. Flip on after `docker compose up`.
   */
  NAKAMA_ENABLED: false,
  /** Bridge guest/`rift_guest` + email auth to Nakama sessions (keeps SIWS). */
  NAKAMA_AUTH_BRIDGE_ENABLED: true,
  /** Augment TCG invite / arena matchmaking with Nakama matchmaker tickets. */
  NAKAMA_MATCHMAKING_BRIDGE_ENABLED: true,
  /** Optional Nakama chat channels alongside in-memory friends/PM. */
  NAKAMA_CHAT_BRIDGE_ENABLED: true,
  /** Optional Nakama groups bridge for /guilds shell. */
  NAKAMA_GUILDS_BRIDGE_ENABLED: true,
  /** Optional Nakama leaderboards alongside demo leaderboard HUD. */
  NAKAMA_LEADERBOARDS_BRIDGE_ENABLED: true,
  /** Optional Nakama tournaments alongside Credits tournament economy. */
  NAKAMA_TOURNAMENTS_BRIDGE_ENABLED: true,
  /** Optional Nakama storage engine for soft player prefs (not Credits/SOL). */
  NAKAMA_STORAGE_BRIDGE_ENABLED: true,

  // ─── Loyalty / streaks / airdrops / Rift Storm ──────────────────────────────
  /** Account loyalty streaks, weighted airdrops, milestones, Loyalty Shop. */
  LOYALTY_SYSTEM_ENABLED: true,
  /** Daily weighted airdrop claims (anti-AFK + pity). */
  LOYALTY_DAILY_AIRDROP_ENABLED: true,
  /** Loyalty Token cosmetics shop (never gameplay advantages). */
  LOYALTY_SHOP_ENABLED: true,
  /** Rift Storm global / regional airdrop events. */
  RIFT_STORM_ENABLED: true,
  /** Optional promo SOL from treasury pool — default OFF; never required. */
  RIFT_STORM_SOL_ENABLED: false,
  /** Social announce opt-in blurbs for loyalty / storm claims. */
  LOYALTY_SOCIAL_ANNOUNCE_ENABLED: true,

  // ─── Master Economy Core (Phases 1–16) ─────────────────────────────────────
  /** Unified SettlementService facade over Credits (+ optional adapters). */
  MASTER_ECONOMY_CORE_ENABLED: true,
  /** Shop checkout with Credits (required play path). */
  SHOP_CREDITS_CHECKOUT_ENABLED: true,
  /** Creator marketplace listing kind + royalty splits (Credits). */
  CREATOR_MARKETPLACE_ENABLED: true,
  /** Land parcel registry + Credits claim. */
  LAND_OWNERSHIP_ENABLED: true,
  /** Homestead Credits persistence path. */
  HOUSING_ECONOMY_ENABLED: true,
  /** Private player home instances + build mode (extends homestead). */
  PLAYER_HOUSING_ENABLED: true,
  /** Persist housing tables via Prisma — prepare-only until migration approved. */
  PLAYER_HOUSING_PRISMA_ENABLED: false,
  /** Shared neighborhood exteriors + land deeds (private interiors stay instanced). */
  PLAYER_NEIGHBORHOODS_ENABLED: true,
  /** Persist neighborhood tables via Prisma — prepare-only until migration approved. */
  PLAYER_NEIGHBORHOODS_PRISMA_ENABLED: false,
  /** Automatic World Expansion — capacity, generation, assignment, overflow. */
  WORLD_EXPANSION_ENABLED: true,
  /** Persist world-expansion tables via Prisma — prepare-only until migration approved. */
  WORLD_EXPANSION_PRISMA_ENABLED: false,
  /** Guild bank Credits. */
  GUILD_ECONOMY_ENABLED: true,
  /** Season pass Credits track. */
  SEASON_PASS_ENABLED: true,
  /** Player-owned shopfronts (Credits). */
  PLAYER_SHOPS_ENABLED: true,
  /** Tournament entry/prize in Credits or AP — never real-value wagering. */
  TOURNAMENT_ECONOMY_ENABLED: true,
  /** Off-chain collectibles registry. */
  COLLECTIBLES_ECONOMY_ENABLED: true,
  /** Spirit recovery HTTP surface (extends game/spirit — does not replace). */
  SPIRIT_RECOVERY_API_ENABLED: true,

  // ─── Keeper XP / leveling ──────────────────────────────────────────────────
  /** Server-authoritative keeper XP, levels, mastery, prestige UI + APIs. */
  KEEPER_PROGRESSION_ENABLED: true,
  /** Persist PlayerProgression rows to Prisma when User exists (best-effort). */
  KEEPER_PROGRESSION_PRISMA_ENABLED: false,

  // ─── Living World social presence / rest / town reputation ─────────────────
  /** Presence XP, rest hubs, social density, anti-AFK (never SOL / never P2W). */
  SOCIAL_PRESENCE_ENABLED: true,
  /** Full Living Server Population System (extends social presence). */
  LIVING_SERVER_POPULATION_ENABLED: true,
  /** Idle participation soft rewards every 15–30m of genuine activity. */
  SOCIAL_PRESENCE_IDLE_REWARDS_ENABLED: true,
  /** Hourly Town Hero / Master Merchant / Community Favorite cosmetics. */
  TOWN_FEATURED_PLAYER_ENABLED: true,
  /** Home visit likes / guestbook / popularity stubs. */
  SOCIAL_HOME_VISITS_ENABLED: true,
  /** Mini community event stubs (merchant, musician, fireworks…). */
  SOCIAL_COMMUNITY_EVENTS_ENABLED: true,
  /** Account-bound Community Tokens (never SOL, never transferable). */
  COMMUNITY_TOKENS_ENABLED: true,
  /** Opt-in new-player Helper role. */
  SOCIAL_HELPER_SYSTEM_ENABLED: true,
  /** Player performance stubs at music stages. */
  SOCIAL_PERFORMANCES_ENABLED: true,
  /** Riftling socialization in hubs (privacy-gated). */
  RIFTLING_SOCIALIZATION_ENABLED: true,
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

/**
 * Whether `/live-world` may open for this runtime (public launch or non-prod preview).
 * Does not delete or disable Phaser systems — only the product entry gate.
 *
 * Public stays Coming Soon when LIVE_WORLD_PUBLIC_ACCESS_ENABLED is false.
 * Local/dev (NODE_ENV=development, DEV_OVERRIDE, NEXT_PUBLIC_DEV_OVERRIDE, or
 * LIVE_WORLD_DEV_PREVIEW_ENABLED) may enter for testing — never in production
 * unless PUBLIC_ACCESS is on.
 */
export function isLiveWorldEntryOpen(
  overrides?: FeatureFlagOverrides,
  env: {
    nodeEnv?: string | undefined;
    nextPublicDevOverride?: string | undefined;
    liveWorldDevPreviewEnv?: string | undefined;
    devOverride?: string | undefined;
  } = {},
): boolean {
  if (isFeatureEnabled("LIVE_WORLD_PUBLIC_ACCESS_ENABLED", overrides)) {
    return true;
  }
  const nodeEnv = env.nodeEnv ?? process.env.NODE_ENV;
  if (nodeEnv === "production") {
    return false;
  }

  // Explicit feature-flag preview (flag default stays false; env may flip it).
  if (isFeatureEnabled("LIVE_WORLD_DEV_PREVIEW_ENABLED", overrides)) {
    return true;
  }

  // Auto-open for local Development Override / NODE_ENV=development.
  // Keeps public Coming Soon messaging available via isLiveWorldPublicAccess.
  const flagTrue = (v: string | undefined) => {
    if (!v) return false;
    const n = v.trim().toLowerCase();
    return n === "true" || n === "1" || n === "yes" || n === "on";
  };
  if (nodeEnv === "development") return true;
  if (flagTrue(env.nextPublicDevOverride ?? process.env.NEXT_PUBLIC_DEV_OVERRIDE)) {
    return true;
  }
  if (flagTrue(env.devOverride ?? process.env.DEV_OVERRIDE)) return true;
  if (
    flagTrue(env.liveWorldDevPreviewEnv ?? process.env.LIVE_WORLD_DEV_PREVIEW_ENABLED)
  ) {
    return true;
  }
  return false;
}

/** True when the public product gate is open (not merely local/dev preview). */
export function isLiveWorldPublicAccess(
  overrides?: FeatureFlagOverrides,
): boolean {
  return isFeatureEnabled("LIVE_WORLD_PUBLIC_ACCESS_ENABLED", overrides);
}

/**
 * Soft-gate badge label: public Coming Soon, or Coming Soon · DEV ACCESS when
 * local/dev can enter while public remains closed.
 */
export function liveWorldAccessBadge(
  overrides?: FeatureFlagOverrides,
  env: { nodeEnv?: string | undefined } = {},
): string | undefined {
  if (isLiveWorldPublicAccess(overrides)) return undefined;
  if (isLiveWorldEntryOpen(overrides, env)) return "COMING SOON · DEV ACCESS";
  return "Coming Soon";
}

/** Phaser enter: playable flag AND entry open (public or dev preview). */
export function canEnterLiveWorld(
  overrides?: FeatureFlagOverrides,
  env: { nodeEnv?: string | undefined } = {},
): boolean {
  return (
    isFeatureEnabled("PLAYABLE_LIVE_WORLD_ENABLED", overrides) &&
    isLiveWorldEntryOpen(overrides, env)
  );
}
