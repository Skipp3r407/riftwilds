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
  const catalogSummary = `TCG packs & binders lead · legacy gear still listed (${stats.weapons} weapons · ${stats.armor} armor · ${stats.abilities} scrolls).`;

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Rift Battle shop"
        titleSlug="shop"
        title="Shop"
        description={
          <>
            Buy card packs, binder pages, deck slots, and duel cosmetics with Credits. SOL stays
            optional for prestige skins — never required to play Rift Battles. No paid loot boxes.{" "}
            {catalogSummary}
          </>
        }
        status="TCG catalog"
        statusTone="live"
        actions={
          <>
            <Link href="/shop/packs" className="btn-primary focus-ring">
              Card packs
            </Link>
            <Link href="/tcg/collection" className="btn-secondary focus-ring">
              Card Binder
            </Link>
            <Link href="/inventory" className="btn-secondary focus-ring">
              Inventory
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
