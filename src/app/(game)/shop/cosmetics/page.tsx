import { ShopBrowser } from "@/components/items/shop-browser";
import { getShopSectionItems } from "@/lib/shop/sections";

export const metadata = { title: "Shop · Cosmetics" };

export default function ShopCosmeticsPage() {
  return (
    <ShopBrowser title="Cosmetics & prestige" items={getShopSectionItems("cosmetics")} />
  );
}
