import { InventoryBrowser } from "@/components/items/inventory-browser";
import { itemDisclosures } from "@/lib/items/disclosures";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";

export const metadata = { title: "Inventory" };

export default function InventoryPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        kicker="Keeper pack"
        titleSlug="inventory"
        title="Inventory"
        description={itemDisclosures.combat}
        actions={
          <Link href="/shop" className="btn-primary focus-ring text-sm">
            Open shop
          </Link>
        }
      />
      <InventoryBrowser />
    </div>
  );
}
