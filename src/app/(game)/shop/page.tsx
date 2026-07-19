import Link from "next/link";
import { SoundscapeMount } from "@/components/audio/soundscape-mount";
import { catalogStats } from "@/lib/items/catalog";
import { itemDisclosures } from "@/lib/items/disclosures";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { REAL_VALUE_WAGERING_ENABLED } from "@/lib/config/arena";
import { PageHeader, StatusChip } from "@/components/shared/page-header";
import { ShopShell } from "@/components/items/shop-shell";
import { getAllShopSectionsWithItems } from "@/lib/shop/sections";
import { RiftPageShell } from "@/components/ui/rift-page-shell";
import { RiftPanel } from "@/components/ui/rift-panel";

export const metadata = { title: "Shop" };

export default function ShopHomePage() {
  const stats = catalogStats();
  const sections = getAllShopSectionsWithItems(150);
  const catalogSummary = `Card shop first — packs, binders, sleeves, board skins. Live World gear is demoted (${stats.weapons} weapons · ${stats.armor} armor · ${stats.abilities} scrolls still available).`;

  return (
    <RiftPageShell mood="merchant" className="!max-w-7xl !px-0 !py-0">
      <SoundscapeMount mode="shop" fadeMs={750} />
      <div className="space-y-6">
        <RiftPanel material="gold" className="mb-1">
          <p className="font-display text-[10px] uppercase tracking-[0.28em] text-[var(--amber)]">
            Merchant Hall
          </p>
          <p className="mt-1 max-w-2xl text-sm text-[var(--text-muted)]">
            Lantern light and crystal stock — Credits buy packs and binder gear. SOL is optional
            cosmetics only and never buys competitive power. No paid loot boxes.
          </p>
        </RiftPanel>

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
    </RiftPageShell>
  );
}
