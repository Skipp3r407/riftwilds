import { ShopBrowser } from "@/components/items/shop-browser";
import { getShopSectionItems } from "@/lib/shop/sections";

export const metadata = { title: "Shop · Weapons" };

export default function ShopWeaponsPage() {
  return <ShopBrowser title="Weapons" items={getShopSectionItems("weapons")} />;
}
