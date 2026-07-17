/**
 * Economy tunables for the Riftwilds flywheel.
 * Real-money paths stay gated; demo credits can exercise the full loop.
 */

export const economyConfig = {
  /** Marketplace fee in basis points (250 = 2.5%). */
  MARKETPLACE_FEE_BPS: 250,

  /** Share of marketplace fee credited to community treasury ledger (remainder can be ops). */
  TREASURY_FEE_SHARE_BPS: 10000, // 100% of fee → treasury in MVP demo

  /** Soft-currency shop prices (demo credits). */
  FOOD_BASE_PRICE_CREDITS: 50,
  CARE_ITEM_BASE_PRICE_CREDITS: 75,

  /** Epoch reward settings (inactive unless flags allow). */
  EPOCH_DURATION_HOURS: 24,
  EPOCH_REWARD_SOFT_CURRENCY_PER_PET: 25,
  EPOCH_MAX_PETS_PER_USER: 3,
  EPOCH_MAX_GLOBAL_PAYOUT_SOFT: 100_000,
  EPOCH_MIN_CARE_ACTIONS: 1,
  EPOCH_REQUIRE_LIVING: true,

  /**
   * Real-money epoch payouts remain off until explicitly enabled + reviewed.
   * Amounts stored as integer smallest units when activated.
   */
  EPOCH_REAL_MONEY_PER_PET_RAW: 0n,
  EPOCH_REAL_MONEY_DAILY_GLOBAL_CAP_RAW: 0n,
  EPOCH_REAL_MONEY_PER_USER_CAP_RAW: 0n,

  CREATOR_FEE_NOTE:
    "Pump.fun creator fees are external. Optional creator allocations enter the Community Reward Treasury only after verified, project-controlled deposits — buying the coin does not automatically pay pet owners.",
} as const;

export type EconomyStageId =
  | "BUY_COIN"
  | "GET_EGG"
  | "HATCH"
  | "FEED"
  | "BUY_ITEMS"
  | "MARKETPLACE_FEES"
  | "TREASURY_GROWS"
  | "COMMUNITY_EVENTS"
  | "MORE_PLAYERS"
  | "CREATOR_FEES"
  | "EPOCH_REWARDS";
