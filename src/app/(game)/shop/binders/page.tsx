import { ShopBrowser } from "@/components/items/shop-browser";
import { getShopSectionItems } from "@/lib/shop/sections";

export const metadata = { title: "Shop · Binders & decks" };

export default function ShopBindersPage() {
  return <ShopBrowser title="Binders & decks" items={getShopSectionItems("binders")} />;
}
