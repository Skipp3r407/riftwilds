import { ShopBrowser } from "@/components/items/shop-browser";
import { getShopSectionItems } from "@/lib/shop/sections";

export const metadata = { title: "Shop · Materials" };

export default function ShopMaterialsPage() {
  return <ShopBrowser title="Materials" items={getShopSectionItems("materials")} />;
}