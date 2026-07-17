import { WEAPON_CATALOG } from "@/lib/items/catalog/weapons";
import { ARMOR_CATALOG } from "@/lib/items/catalog/armor";
import { POTION_CATALOG } from "@/lib/items/catalog/potions";
import { MATERIAL_CATALOG } from "@/lib/items/catalog/materials";
import { ABILITY_CATALOG } from "@/lib/items/catalog/abilities";
import type { AnyCatalogItem, ShopCategory } from "@/lib/items/types";
import { quoteDirectPurchase } from "@/lib/items/pricing";
import { lamportsToSolString } from "@/lib/items/lamports";

export * from "@/lib/items/catalog/weapons";
export * from "@/lib/items/catalog/armor";
export * from "@/lib/items/catalog/potions";
export * from "@/lib/items/catalog/materials";
export * from "@/lib/items/catalog/abilities";

export function getAllShopItems(): AnyCatalogItem[] {
  return [...WEAPON_CATALOG, ...ARMOR_CATALOG, ...POTION_CATALOG, ...MATERIAL_CATALOG];
}

export function getShopItemsByCategory(category: ShopCategory | "ALL"): AnyCatalogItem[] {
  const all = getAllShopItems();
  if (category === "ALL") return all;
  if (category === "FEATURED") {
    return all.filter((i) =>
      ["ember-talons", "moonwater-flask", "stormweave-armor", "heart-of-the-volcano"].includes(
        i.id,
      ),
    );
  }
  if (category === "MAGIC") {
    // Ability scrolls are sold via shop sections (ABILITY_CATALOG → scroll cards).
    return all.filter((i) => i.id.startsWith("scroll-") || i.family === "ABILITY_SCROLL");
  }
  if (category === "COSMETICS") {
    return all.filter(
      (i) =>
        i.family === "COSMETIC" ||
        (i.family === "WEAPON" && i.rarity === "CELESTIAL") ||
        (i.family === "ARMOR" &&
          (i.rarity === "CELESTIAL" ||
            i.rarity === "MYTHIC" ||
            ("armorClass" in i && i.armorClass === "COSMETIC_SET"))),
    );
  }
  return all.filter((i) => i.shopCategory === category);
}

export function getCatalogItem(id: string): AnyCatalogItem | undefined {
  return getAllShopItems().find((i) => i.id === id);
}

export function serializeShopItem(item: AnyCatalogItem, solUsdRate: number | null = null) {
  const quote = quoteDirectPurchase({
    itemId: item.id,
    rarity: item.rarity,
    solUsdRate,
  });
  return {
    ...item,
    price: {
      version: quote.priceVersion,
      lamports: quote.priceLamports.toString(),
      sol: quote.priceSol,
      estimatedUsd: quote.estimatedUsd,
      usdDisclaimer: quote.usdDisclaimer,
      networkFeeEstimateLamports: quote.networkFeeEstimateLamports.toString(),
      totalBuyerCostLamports: quote.totalBuyerCostLamports.toString(),
      totalBuyerCostSol: lamportsToSolString(quote.totalBuyerCostLamports),
    },
  };
}

export function catalogStats() {
  return {
    weapons: WEAPON_CATALOG.length,
    armor: ARMOR_CATALOG.length,
    potions: POTION_CATALOG.length,
    materials: MATERIAL_CATALOG.length,
    abilities: ABILITY_CATALOG.length,
  };
}
