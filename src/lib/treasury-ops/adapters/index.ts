import type { RevenueAdapter } from "./base";
import { runAdapter } from "./base";
import type { RevenueSourceKey } from "../types";

function amountFrom(event: Record<string, unknown>): string {
  if (typeof event.amountLamports === "string") return event.amountLamports;
  if (typeof event.amountLamports === "number") return String(Math.floor(event.amountLamports));
  if (typeof event.amountSol === "number") {
    return String(Math.floor(event.amountSol * 1_000_000_000));
  }
  throw new Error("amountLamports or amountSol required");
}

export const pumpfunAdapter: RevenueAdapter = {
  key: "pumpfun_creator_fees",
  label: "Pump.fun creator fees",
  description:
    "All creator fees land in the single Project Treasury Wallet, then distribute by rules.",
  normalize: (event) => ({
    sourceKey: "pumpfun_creator_fees",
    amountLamports: amountFrom(event),
    senderAddress: String(event.senderAddress ?? "PUMPFUN_CREATOR"),
    txSignature: (event.txSignature as string | null | undefined) ?? null,
    confirmations: Number(event.confirmations ?? 1),
    metadata: { adapter: "pumpfun", ...event },
  }),
};

export const marketplaceAdapter: RevenueAdapter = {
  key: "marketplace_fees",
  label: "Marketplace fees",
  description: "Platform fee share from Credits/SOL marketplace settlements.",
  normalize: (event) => ({
    sourceKey: "marketplace_fees",
    amountLamports: amountFrom(event),
    senderAddress: String(event.senderAddress ?? "MARKETPLACE_SETTLEMENT"),
    txSignature: (event.txSignature as string | null | undefined) ?? null,
    metadata: { adapter: "marketplace", ...event },
  }),
};

export const nftRoyaltyAdapter: RevenueAdapter = {
  key: "nft_royalties",
  label: "NFT royalties",
  description: "Modular NFT market royalty ingest.",
  normalize: (event) => ({
    sourceKey: "nft_royalties",
    amountLamports: amountFrom(event),
    senderAddress: String(event.senderAddress ?? "NFT_MARKET"),
    metadata: { adapter: "nft_royalties", ...event },
  }),
};

export const battlePassAdapter: RevenueAdapter = {
  key: "battle_pass",
  label: "Battle pass",
  description: "Battle pass product fee revenue (not PvP escrow).",
  normalize: (event) => ({
    sourceKey: "battle_pass",
    amountLamports: amountFrom(event),
    senderAddress: String(event.senderAddress ?? "BATTLE_PASS_SHOP"),
    metadata: { adapter: "battle_pass", ...event },
  }),
};

export const cosmeticShopAdapter: RevenueAdapter = {
  key: "cosmetic_shop",
  label: "Cosmetic shop",
  description: "Cosmetic / vanity shop proceeds.",
  normalize: (event) => ({
    sourceKey: "cosmetic_shop",
    amountLamports: amountFrom(event),
    senderAddress: String(event.senderAddress ?? "COSMETIC_SHOP"),
    metadata: { adapter: "cosmetic_shop", ...event },
  }),
};

export const websiteSalesAdapter: RevenueAdapter = {
  key: "website_sales",
  label: "Website sales",
  description: "Direct website / store checkout revenue adapter.",
  normalize: (event) => ({
    sourceKey: "website_sales",
    amountLamports: amountFrom(event),
    senderAddress: String(event.senderAddress ?? "WEBSITE_STORE"),
    metadata: { adapter: "website_sales", ...event },
  }),
};

const REGISTRY: RevenueAdapter[] = [
  pumpfunAdapter,
  marketplaceAdapter,
  nftRoyaltyAdapter,
  battlePassAdapter,
  cosmeticShopAdapter,
  websiteSalesAdapter,
  {
    key: "creator_guild_marketplace",
    label: "Creator / guild marketplace",
    description: "Creator hub and guild market platform fees.",
    normalize: (event) => ({
      sourceKey: "creator_guild_marketplace",
      amountLamports: amountFrom(event),
      senderAddress: String(event.senderAddress ?? "CREATOR_GUILD"),
      metadata: { adapter: "creator_guild", ...event },
    }),
  },
  {
    key: "arena_tournament_fees",
    label: "Arena / tournament fees",
    description: "Product entry fees — treasury-funded prizes, not player escrow gambling.",
    normalize: (event) => ({
      sourceKey: "arena_tournament_fees",
      amountLamports: amountFrom(event),
      senderAddress: String(event.senderAddress ?? "TOURNAMENT_OPS"),
      metadata: { adapter: "tournament", noPlayerEscrow: true, ...event },
    }),
  },
  {
    key: "sponsored_events",
    label: "Sponsored events",
    description: "Sponsor deposits for community events.",
    normalize: (event) => ({
      sourceKey: "sponsored_events",
      amountLamports: amountFrom(event),
      senderAddress: String(event.senderAddress ?? "SPONSOR"),
      metadata: { adapter: "sponsored_events", ...event },
    }),
  },
  {
    key: "merch",
    label: "Merch",
    description: "Merchandise revenue adapter.",
    normalize: (event) => ({
      sourceKey: "merch",
      amountLamports: amountFrom(event),
      senderAddress: String(event.senderAddress ?? "MERCH_STORE"),
      metadata: { adapter: "merch", ...event },
    }),
  },
  {
    key: "donations",
    label: "Donations",
    description: "Voluntary donations to project treasury.",
    normalize: (event) => ({
      sourceKey: "donations",
      amountLamports: amountFrom(event),
      senderAddress: String(event.senderAddress ?? "DONOR"),
      metadata: { adapter: "donations", ...event },
    }),
  },
  {
    key: "ads",
    label: "Ads",
    description: "Advertising revenue adapter.",
    normalize: (event) => ({
      sourceKey: "ads",
      amountLamports: amountFrom(event),
      senderAddress: String(event.senderAddress ?? "AD_NETWORK"),
      metadata: { adapter: "ads", ...event },
    }),
  },
  {
    key: "nft_sales",
    label: "NFT sales",
    description: "Primary NFT sale proceeds to treasury (when configured).",
    normalize: (event) => ({
      sourceKey: "nft_sales",
      amountLamports: amountFrom(event),
      senderAddress: String(event.senderAddress ?? "NFT_PRIMARY"),
      metadata: { adapter: "nft_sales", ...event },
    }),
  },
  {
    key: "other",
    label: "Other",
    description: "Extensible catch-all source.",
    normalize: (event) => ({
      sourceKey: "other",
      amountLamports: amountFrom(event),
      senderAddress: String(event.senderAddress ?? "OTHER"),
      metadata: { adapter: "other", ...event },
    }),
  },
];

export function listRevenueAdapters(): RevenueAdapter[] {
  return REGISTRY;
}

export function getAdapter(key: RevenueSourceKey): RevenueAdapter | undefined {
  return REGISTRY.find((a) => a.key === key);
}

export async function ingestViaAdapter(
  key: RevenueSourceKey,
  event: Record<string, unknown>,
  opts?: { actorId?: string | null; requestId?: string | null },
) {
  const adapter = getAdapter(key);
  if (!adapter) throw new Error(`Unknown adapter: ${key}`);
  return runAdapter(adapter, event, opts);
}

/**
 * Clean hook for marketplace fee events — call after settlement without changing shop UX.
 */
export async function ingestMarketplaceFeeHook(params: {
  amountLamports: string;
  listingId?: string;
  settlementId?: string;
  actorId?: string | null;
}) {
  return ingestViaAdapter(
    "marketplace_fees",
    {
      amountLamports: params.amountLamports,
      id: params.settlementId ?? params.listingId ?? `mkt_${Date.now()}`,
      listingId: params.listingId,
      settlementId: params.settlementId,
    },
    { actorId: params.actorId ?? "marketplace" },
  );
}

export { runAdapter };
export type { RevenueAdapter };
