import { ShopBrowser } from "@/components/items/shop-browser";
import { getShopSectionItems } from "@/lib/shop/sections";

export const metadata = { title: "Shop · Potions" };

export default function ShopPotionsPage() {
  return <ShopBrowser title="Potions" items={getShopSectionItems("potions")} />;
}
