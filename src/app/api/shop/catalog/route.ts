import { NextResponse } from "next/server";
import { getShopItemsByCategory, catalogStats, serializeShopItem } from "@/lib/items/catalog";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { itemDisclosures } from "@/lib/items/disclosures";
import type { ShopCategory } from "@/lib/items/types";

export async function GET(req: Request) {
  if (!featureFlagDefaults.ITEM_SHOP_BROWSE_ENABLED) {
    return NextResponse.json({ error: "SHOP_DISABLED" }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const category = (searchParams.get("category") ?? "ALL") as ShopCategory | "ALL";
  const items = getShopItemsByCategory(category).map((i) =>
    serializeShopItem(i, Number(searchParams.get("solUsd")) || 150),
  );
  return NextResponse.json({
    flags: {
      SOL_ITEM_PURCHASES_ENABLED: featureFlagDefaults.SOL_ITEM_PURCHASES_ENABLED,
      PAID_RANDOM_REWARDS_ENABLED: featureFlagDefaults.PAID_RANDOM_REWARDS_ENABLED,
    },
    disclosures: itemDisclosures,
    stats: catalogStats(),
    items: items.map((i) => ({
      ...i,
      price: {
        ...i.price,
        // JSON-safe (bigint already stringified in serialize)
      },
    })),
  });
}
