import { ShopBrowser } from "@/components/items/shop-browser";
import { getShopSectionItems } from "@/lib/shop/sections";

export const metadata = { title: "Shop · Card packs" };

export default function ShopPacksPage() {
  return <ShopBrowser title="Card packs" items={getShopSectionItems("packs")} />;
}
