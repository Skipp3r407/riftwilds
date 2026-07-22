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
        description={
          <>
            Packs, food, cosmetics, and care goods land here — never in a Combat
            Deck. Open{" "}
            <Link
              href="/companion-care"
              className="text-[var(--cyan)] underline-offset-2 hover:underline"
            >
              Companion Care
            </Link>{" "}
            to feed pets, or your{" "}
            <Link href="/tcg/collection" className="text-[var(--cyan)] underline-offset-2 hover:underline">
              Card Binder
            </Link>{" "}
            for duel cards — {itemDisclosures.combat}
          </>
        }
        actions={
          <>
            <Link href="/companion-care" className="btn-primary focus-ring text-sm">
              Companion Care
            </Link>
            <Link href="/shop/packs" className="btn-secondary focus-ring text-sm">
              Card packs
            </Link>
            <Link href="/tcg/collection" className="btn-secondary focus-ring text-sm">
              Card Binder
            </Link>
          </>
        }
      />
      <InventoryBrowser />
    </div>
  );
}
