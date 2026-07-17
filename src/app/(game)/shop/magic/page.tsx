import { ShopBrowser } from "@/components/items/shop-browser";
import { getShopSectionItems } from "@/lib/shop/sections";

export const metadata = { title: "Shop · Magic" };

export default function ShopMagicPage() {
  return <ShopBrowser title="Magic scrolls" items={getShopSectionItems("magic")} />;
}
