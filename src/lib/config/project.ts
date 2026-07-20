/**
 * Centralized project configuration.
 * Edit placeholders here — do not scatter brand/token values across the app.
 */

export const projectConfig = {
  PROJECT_NAME: "Riftwilds",
  TOKEN_NAME: "Riftwilds",
  TOKEN_SYMBOL: "$RIFT",
  BRAND_ALIAS: "Project Hatch",
  TOKEN_MINT_ADDRESS: "COMING_SOON",
  PUMP_FUN_URL: "COMING_SOON",
  TWITTER_URL: "COMING_SOON",
  TELEGRAM_URL: "COMING_SOON",
  DISCORD_URL: "COMING_SOON",
  SOLANA_NETWORK: "devnet" as const,
  ADMIN_WALLET: "COMING_SOON",
  TREASURY_WALLET: "COMING_SOON",
  UNIVERSE_NAME: "The Riftwilds",
  CREATURE_NAME: "Riftling",
  CREATURE_NAME_PLURAL: "Riftlings",
  GAME_VERSION: "0.1.0-phase1",
  SUPPORT_EMAIL: "support@riftwilds.game",
} as const;

export type SolanaNetwork = "devnet" | "mainnet-beta" | "testnet" | "localnet";

export const tokenTierThresholds = {
  /** Token amounts in smallest units (base units). Adjust when mint decimals are known. */
  VISITOR: 0n,
  KEEPER: 1_000_000n,
  RANGER: 10_000_000n,
  WARDEN: 100_000_000n,
  FOUNDER: 1_000_000_000n,
} as const;

export const hatchOddsDefault = {
  COMMON: 42,
  UNCOMMON: 27,
  RARE: 16,
  EPIC: 8,
  LEGENDARY: 4,
  MYTHIC: 2,
  CELESTIAL: 1,
} as const;

export const economyDefaults = {
  MARKETPLACE_FEE_BPS: 250, // 2.5%
  DEMO_CREDITS_ENABLED: true,
  EPOCH_REWARDS_ENABLED: false,
  REAL_MONEY_REWARDS_ENABLED: false,
  REAL_SOL_MARKETPLACE_ENABLED: false,
  NFT_MINTING_ENABLED: false,
  PERMANENT_DEATH_ENABLED: false,
  STARTER_EGG_CLAIM_LIMIT: 1,
  ACTIVE_TEAM_SIZE: 3,
  NEW_PLAYER_PROTECTION_HOURS: 72,
  CARE_GRACE_HOURS: 36,
} as const;

export const authDefaults = {
  NONCE_TTL_SECONDS: 300,
  SESSION_TTL_SECONDS: 60 * 60 * 24 * 7,
  /** Remember-me extends to 30 days when selected. */
  SESSION_TTL_REMEMBER_SECONDS: 60 * 60 * 24 * 30,
  COOKIE_NAME: "ph_session",
  REFRESH_COOKIE_NAME: "ph_refresh",
} as const;
