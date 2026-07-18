import Link from "next/link";
import { catalogStats } from "@/lib/items/catalog";
import { itemDisclosures } from "@/lib/items/disclosures";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { REAL_VALUE_WAGERING_ENABLED } from "@/lib/config/arena";
import { PageHeader, StatusChip } from "@/components/shared/page-header";
import { ShopShell } from "@/components/items/shop-shell";
import { getAllShopSectionsWithItems } from "@/lib/shop/sections";

export const metadata = { title: "Shop" };

export default function ShopHomePage() {
  const stats = catalogStats();
  const sections = getAllShopSectionsWithItems(150);
  const catalogSummary = `Card shop first — packs, binders, sleeves, board skins. Live World gear is demoted (${stats.weapons} weapons · ${stats.armor} armor · ${stats.abilities} scrolls still available).`;

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Card shop · Rift Battles"
        titleSlug="shop"
        title="Shop"
        description={
          <>
            Build your Card Binder with Credits — packs, binder pages, deck slots, sleeves, and
            board skins. SOL is optional cosmetics only and never buys competitive power. No paid
            loot boxes. {catalogSummary}
          </>
        }
        status="Credits-first"
        statusTone="live"
        actions={
          <>
            <Link href="/shop/packs" className="btn-primary focus-ring">
              Card packs
            </Link>
            <Link href="/tcg/collection" className="btn-secondary focus-ring">
              Card Binder
            </Link>
            <Link href="/marketplace" className="btn-secondary focus-ring">
              Trade desk
            </Link>
          </>
        }
      />

      <p className="panel-inset px-3 py-2 text-xs text-[var(--amber)]">{itemDisclosures.shop}</p>
      <div className="flex flex-wrap gap-2">
        <StatusChip tone={featureFlagDefaults.SOL_ITEM_PURCHASES_ENABLED ? "live" : "warn"}>
          Wallet SOL {featureFlagDefaults.SOL_ITEM_PURCHASES_ENABLED ? "shell" : "gated"}
        </StatusChip>
        <StatusChip tone={featureFlagDefaults.SOL_PURCHASES_ENABLED ? "live" : "warn"}>
          SOL_PURCHASES={String(featureFlagDefaults.SOL_PURCHASES_ENABLED)}
        </StatusChip>
        <StatusChip tone="live">In-game SOL on</StatusChip>
        <StatusChip tone="danger">
          Paid random={String(featureFlagDefaults.PAID_RANDOM_REWARDS_ENABLED)}
        </StatusChip>
        <StatusChip tone="danger">Wagering={String(REAL_VALUE_WAGERING_ENABLED)}</StatusChip>
      </div>

      <ShopShell sections={sections} catalogSummary={catalogSummary} />
    </div>
  );
}
