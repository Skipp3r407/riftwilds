/**
 * Player Marketplace listing kinds.
 * Phase 1–2: FIXED_PRICE + AUCTION + BEST_OFFER are UI/API-ready (demo).
 * Others are scaffolded in the data model only.
 */

export type MarketplaceListingType =
  | "FIXED_PRICE"
  | "AUCTION"
  | "BEST_OFFER"
  | "TRADE"
  | "RENTAL"
  | "SHOWCASE"
  | "COMMISSION"
  | "MUSEUM_EXHIBIT";

export type ListingTypeMeta = {
  id: MarketplaceListingType;
  label: string;
  description: string;
  /** Working in Phase 1–2 demo vs coming soon */
  phase: "live_demo" | "scaffold";
};

export const LISTING_TYPE_CATALOG: ListingTypeMeta[] = [
  {
    id: "FIXED_PRICE",
    label: "Fixed price",
    description: "Buy now at the listed Credits ask (SOL optional prestige).",
    phase: "live_demo",
  },
  {
    id: "AUCTION",
    label: "Auction",
    description: "Timed bidding with starting Credits and optional reserve.",
    phase: "live_demo",
  },
  {
    id: "BEST_OFFER",
    label: "Best offer",
    description: "Buyers submit offers; seller accepts / counters (demo).",
    phase: "live_demo",
  },
  {
    id: "TRADE",
    label: "Trade request",
    description: "Item-for-item with double-confirm — shell UI.",
    phase: "scaffold",
  },
  {
    id: "RENTAL",
    label: "Rental",
    description: "Time-boxed cosmetic rentals — coming.",
    phase: "scaffold",
  },
  {
    id: "SHOWCASE",
    label: "Showcase",
    description: "Display-only museum / shop feature — not a sale.",
    phase: "scaffold",
  },
  {
    id: "COMMISSION",
    label: "Commission",
    description: "Custom cosmetic / lore brief — coming.",
    phase: "scaffold",
  },
  {
    id: "MUSEUM_EXHIBIT",
    label: "Museum listing",
    description: "List cosmetic from a sealed exhibit hook.",
    phase: "scaffold",
  },
];

export function listingTypesForPhase(phase: "live_demo" | "all" = "all") {
  if (phase === "live_demo") {
    return LISTING_TYPE_CATALOG.filter((t) => t.phase === "live_demo");
  }
  return LISTING_TYPE_CATALOG;
}
