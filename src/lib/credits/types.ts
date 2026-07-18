/**
 * Server-authoritative Credits types.
 * Credits are soft currency — never SOL, never a token claim, never profit.
 * All amounts are integers (no floats).
 */

export const CREDITS_CURRENCY = "CREDITS" as const;

/** Faucet (earn) reasons — every source must have caps/cooldowns in config. */
export type CreditFaucetReason =
  | "QUEST_REWARD"
  | "DAILY_GOAL"
  | "WEEKLY_GOAL"
  | "GATHER"
  | "CRAFT"
  | "EVENT_REWARD"
  | "JOB_BOARD"
  | "ACHIEVEMENT"
  | "RIFTLING_BONUS"
  | "RESTORATION_PARTICIPATION"
  | "STARTER_GRANT"
  | "NPC_SELL_BACK"
  | "STREAK_AIRDROP"
  | "LOYALTY_MILESTONE"
  | "MARKETPLACE_SALE"
  | "GUILD_PAYOUT"
  | "TOURNAMENT_PRIZE"
  | "SEASON_PASS_REFUND"
  | "LAND_SALE"
  | "PLAYER_SHOP_SALE"
  | "CREATOR_ROYALTY"
  | "PRESENCE_IDLE"
  | "ADMIN_ADJUST";

/** Sink (spend) reasons — Credits leave player balance; some leave circulation. */
export type CreditSinkReason =
  | "SHOP_BUY"
  | "NPC_SHOP_BUY"
  | "REPAIR"
  | "TRAVEL_FEE"
  | "HOUSING_FEE"
  | "MARKETPLACE_FEE"
  | "MARKETPLACE_LISTING_FEE"
  | "MARKETPLACE_PURCHASE"
  | "RESTORATION_DONATION"
  | "CRAFT_FEE"
  | "JOB_BOARD_FEE"
  | "SERVICE_FEE"
  | "CARE_ACTION"
  | "CARE_ITEM"
  | "EGG_PURCHASE"
  | "BREEDING_FEE"
  | "GUILD_DUES"
  | "SEASON_PASS"
  | "TOURNAMENT_ENTRY"
  | "LAND_CLAIM"
  | "PREMIUM_STORE"
  | "COLLECTIBLE_BUY"
  | "PLAYER_SHOP_FEE"
  | "SPIRIT_RECOVERY"
  | "ADMIN_ADJUST";

export type CreditReason = CreditFaucetReason | CreditSinkReason;

export type CreditLedgerEntry = {
  id: string;
  createdAt: string;
  userId: string;
  currency: typeof CREDITS_CURRENCY;
  /** Positive = credit, negative = debit. Integer only. */
  delta: number;
  balanceAfter: number;
  reason: CreditReason;
  /** Idempotency key — unique per successful mutation. */
  requestId: string;
  metadata?: Record<string, unknown>;
  /** If true, Credits leave player→player circulation (burn / restoration / fees). */
  leavesCirculation?: boolean;
};

export type CreditAccount = {
  userId: string;
  balance: number;
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type CreditMutationResult =
  | {
      ok: true;
      entry: CreditLedgerEntry;
      balance: number;
      idempotentReplay?: boolean;
    }
  | {
      ok: false;
      error:
        | "insufficient_credits"
        | "invalid_amount"
        | "rate_limited"
        | "daily_cap"
        | "cooldown"
        | "unknown_reason"
        | "ai_cannot_grant"
        | "validation_failed"
        | "account_locked";
      message: string;
      balance?: number;
      retryAfterMs?: number;
    };

export type FaucetRule = {
  reason: CreditFaucetReason;
  /** Max Credits per single grant. */
  maxPerGrant: number;
  /** Max Credits per user per UTC day (0 = disabled for this reason). */
  dailyCap: number;
  /** Min ms between grants of this reason (0 = none). */
  cooldownMs: number;
  /** Max grants per user per UTC day. */
  dailyGrantCount: number;
  /** Human label for UI / admin. */
  label: string;
  /** Primary sink(s) this faucet is meant to fund. */
  pairedSinks: CreditSinkReason[];
};

export type SinkRule = {
  reason: CreditSinkReason;
  /** Min spend for this sink type. */
  minAmount: number;
  /** Max spend per single action. */
  maxPerAction: number;
  /** Whether Credits leave total circulation. */
  leavesCirculation: boolean;
  label: string;
};

export type EconomyHealthSnapshot = {
  at: string;
  totalAccounts: number;
  totalCreditsInCirculation: number;
  totalCreditedLifetime: number;
  totalDebitedLifetime: number;
  totalBurnedLifetime: number;
  faucetTotals: Partial<Record<CreditFaucetReason, number>>;
  sinkTotals: Partial<Record<CreditSinkReason, number>>;
  netFaucetMinusSink24h: number;
  /** Heuristic flags — never auto-mutate extreme changes. */
  alerts: EconomyAlert[];
  configVersion: number;
};

export type EconomyAlert = {
  code: string;
  severity: "info" | "warn" | "critical";
  message: string;
};
