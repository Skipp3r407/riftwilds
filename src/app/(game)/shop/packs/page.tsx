import { ShopBrowser } from "@/components/items/shop-browser";
import { PackOpeningShell } from "@/components/tcg/pack-opening";
import { RiftPageShell } from "@/components/ui/rift-page-shell";
import { RiftPanel } from "@/components/ui/rift-panel";
import { getShopSectionItems } from "@/lib/shop/sections";

export const metadata = { title: "Shop · Card packs" };

export default function ShopPacksPage() {
  return (
    <RiftPageShell mood="merchant">
      <RiftPanel material="gold" className="mb-6">
        <p className="font-display text-[10px] uppercase tracking-[0.28em] text-[var(--amber)]">
          Merchant Hall
        </p>
        <h1 className="font-display mt-1 text-3xl text-[var(--text)]">
          Card packs
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
          Named Credits packs only — no paid mystery power. Tear a demo seal
          below, then browse the catalog. Foil finishes are cosmetic.
        </p>
      </RiftPanel>

      <div className="mb-8">
        <PackOpeningShell packName="Ember Spark Pack" />
      </div>

      <ShopBrowser title="Pack catalog" items={getShopSectionItems("packs")} />
    </RiftPageShell>
  );
}
