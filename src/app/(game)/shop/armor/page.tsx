import { ShopBrowser } from "@/components/items/shop-browser";
import { getShopSectionItems } from "@/lib/shop/sections";

export const metadata = { title: "Shop · Armor" };

export default function ShopArmorPage() {
  return <ShopBrowser title="Armor" items={getShopSectionItems("armor")} />;
}
