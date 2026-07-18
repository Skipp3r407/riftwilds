import {
  solToLamports,
  lamportsToSolString,
  splitMarketplaceProceeds,
} from "@/lib/items/lamports";
import type { ItemRarity } from "@/lib/items/types";
import { itemDisclosures } from "@/lib/items/disclosures";

export const PRICE_CONFIG_VERSION = 1;

/** Bootstrap price table — admin future prices via ItemPriceVersion rows. */
const RARITY_DEFAULT_SOL: Record<ItemRarity, string> = {
  COMMON: "0.005",
  UNCOMMON: "0.02",
  RARE: "0.05",
  EPIC: "0.12",
  LEGENDARY: "0.40",
  MYTHIC: "1.00",
  CELESTIAL: "2.50",
};

/** Per-item overrides (SOL decimal strings → lamports). */
const ITEM_PRICE_SOL: Record<string, string> = {
  "wooden-paw-guard": "0.002",
  "smooth-stone-claw": "0.003",
  "training-tail-ring": "0.002",
  "basic-focus-orb": "0.004",
  "cloth-battle-harness": "0.003",
  "grove-twig-wand": "0.004",
  "simple-horncap": "0.003",
  "ember-talons": "0.015",
  "tideglass-claws": "0.015",
  "heart-of-the-volcano": "0.55",
  "riftmaker-prism": "1.25",
  "starforged-halo": "3.00",
  "celestial-riftblade": "3.50",
  "crown-of-ten-affinities": "5.00",
  "small-healing-salve": "0.002",
  "riftberry-tonic": "0.003",
  "moonwater-flask": "0.015",
  "celestial-renewal": "1.10",
  "basic-pet-meal": "0.002",
  "premium-pet-meal": "0.01",
  "dormancy-revival-bloom": "0.08",
  "spirit-crystal": "0.04",
  "phoenix-feather": "0.09",
  "ancient-heart": "0.18",
  "revival-herb": "0.015",
  "healing-stone": "0.008",
  "soul-bloom": "0.04",
  "moon-tear": "0.09",
  "heart-flame": "0.045",
  "sacred-feather": "0.09",
  "ancestor-stone": "0.20",
  "ancient-bell": "0.05",
  "revival-water": "0.012",
  "healing-rune": "0.04",
  "spirit-lantern-charm": "0.08",
};

export type PriceQuote = {
  priceVersion: number;
  itemId: string;
  priceLamports: bigint;
  priceSol: string;
  estimatedUsd: number | null;
  usdDisclaimer: string;
  networkFeeEstimateLamports: bigint;
  marketplaceFeeLamports: bigint;
  creatorFeeLamports: bigint;
  sellerProceedsLamports: bigint;
  totalBuyerCostLamports: bigint;
  disclosures: string[];
};

export function getItemPriceLamports(itemId: string, rarity: ItemRarity): bigint {
  const sol = ITEM_PRICE_SOL[itemId] ?? RARITY_DEFAULT_SOL[rarity];
  return solToLamports(sol);
}

export function quoteDirectPurchase(params: {
  itemId: string;
  rarity: ItemRarity;
  solUsdRate?: number | null;
  networkFeeEstimateLamports?: bigint;
  creatorFeeBps?: number;
}): PriceQuote {
  const priceLamports = getItemPriceLamports(params.itemId, params.rarity);
  const networkFee = params.networkFeeEstimateLamports ?? 5000n;
  const creatorBps = params.creatorFeeBps ?? 0;
  const creatorFee = (priceLamports * BigInt(creatorBps)) / 10_000n;
  const marketplaceFee = 0n;
  const sellerProceeds = 0n;
  const total = priceLamports + networkFee + creatorFee;

  const usd =
    params.solUsdRate != null
      ? Number(lamportsToSolString(priceLamports)) * params.solUsdRate
      : null;

  return {
    priceVersion: PRICE_CONFIG_VERSION,
    itemId: params.itemId,
    priceLamports,
    priceSol: lamportsToSolString(priceLamports),
    estimatedUsd: usd,
    usdDisclaimer: "Estimated value. SOL prices change continuously.",
    networkFeeEstimateLamports: networkFee,
    marketplaceFeeLamports: marketplaceFee,
    creatorFeeLamports: creatorFee,
    sellerProceedsLamports: sellerProceeds,
    totalBuyerCostLamports: total,
    disclosures: [itemDisclosures.shop, itemDisclosures.sol, itemDisclosures.combat],
  };
}

export function quoteMarketplacePurchase(params: {
  itemId: string;
  listingPriceLamports: bigint;
  solUsdRate?: number | null;
  networkFeeEstimateLamports?: bigint;
  feeSplit: {
    sellerPercent: number;
    growthPercent: number;
    petRewardPercent: number;
    operationsPercent: number;
    eventsPercent: number;
  };
}): PriceQuote & {
  feeBreakdown: ReturnType<typeof splitMarketplaceProceeds>;
} {
  const priceLamports = params.listingPriceLamports;
  const networkFee = params.networkFeeEstimateLamports ?? 5000n;
  const feeBreakdown = splitMarketplaceProceeds(priceLamports, params.feeSplit);
  const marketplaceFee =
    feeBreakdown.growth +
    feeBreakdown.petReward +
    feeBreakdown.operations +
    feeBreakdown.events;

  const usd =
    params.solUsdRate != null
      ? Number(lamportsToSolString(priceLamports)) * params.solUsdRate
      : null;

  return {
    priceVersion: PRICE_CONFIG_VERSION,
    itemId: params.itemId,
    priceLamports,
    priceSol: lamportsToSolString(priceLamports),
    estimatedUsd: usd,
    usdDisclaimer: "Estimated value. SOL prices change continuously.",
    networkFeeEstimateLamports: networkFee,
    marketplaceFeeLamports: marketplaceFee,
    creatorFeeLamports: 0n,
    sellerProceedsLamports: feeBreakdown.seller,
    totalBuyerCostLamports: priceLamports + networkFee,
    disclosures: [itemDisclosures.marketplace, itemDisclosures.sol],
    feeBreakdown,
  };
}
