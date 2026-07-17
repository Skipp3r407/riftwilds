import type { AnyCatalogItem, ItemRarity } from "@/lib/items/types";
import { serializeShopItem } from "@/lib/items/catalog";

/** JSON-safe shop cards for client components. */
export type ShopCardData = {
  id: string;
  name: string;
  description: string;
  rarity: ItemRarity;
  family: string;
  affinity: string | null;
  iconPath: string;
  affixes: string[];
  supply: string;
  totalSupply?: number;
  remainingSupply?: number;
  compatibleAnatomy: string[];
  price: {
    sol: string;
    estimatedUsd: number | null;
    usdDisclaimer: string;
    lamports: string;
  };
  stats?: Record<string, number>;
  effect?: string;
};

export function toShopCards(
  items: AnyCatalogItem[],
  solUsdRate: number | null = 150,
): ShopCardData[] {
  return items.map((item) => {
    const s = serializeShopItem(item, solUsdRate);
    const stats =
      "stats" in item && item.stats
        ? (item.stats as Record<string, number>)
        : undefined;
    const effect = "effect" in item ? (item.effect as string | undefined) : undefined;
    return {
      id: s.id,
      name: s.name,
      description: s.description,
      rarity: s.rarity,
      family: s.family,
      affinity: s.affinity,
      iconPath: s.iconPath,
      affixes: s.affixes,
      supply: s.supply,
      totalSupply: s.totalSupply,
      remainingSupply: s.remainingSupply,
      compatibleAnatomy: s.compatibleAnatomy,
      price: s.price,
      stats,
      effect,
    };
  });
}
