import { ShopBrowser } from "@/components/items/shop-browser";
import { getShopSectionItems } from "@/lib/shop/sections";

export const metadata = { title: "Shop · Featured" };

export default function ShopFeaturedPage() {
  return <ShopBrowser title="Featured" items={getShopSectionItems("featured")} />;
}
