import { ShopBrowser } from "@/components/items/shop-browser";
import { getShopSectionItems } from "@/lib/shop/sections";

export const metadata = { title: "Shop · Recovery" };

export default function ShopRecoveryPage() {
  return (
    <ShopBrowser title="Recovery & care" items={getShopSectionItems("recovery")} />
  );
}
