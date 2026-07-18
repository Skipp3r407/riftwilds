import { ShopBrowser } from "@/components/items/shop-browser";
import { getShopSectionItems } from "@/lib/shop/sections";

export const metadata = { title: "Shop · Card cosmetics" };

export default function ShopCardCosmeticsPage() {
  return (
    <ShopBrowser title="Card cosmetics" items={getShopSectionItems("card-cosmetics")} />
  );
}
