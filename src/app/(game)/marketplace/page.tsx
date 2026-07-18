import Link from "next/link";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import {
  MarketplaceFeeBreakdown,
  MarketplaceDisclaimer,
  EconomySummary,
} from "@/components/economy";
import { SolMarketplaceFeeStub } from "@/components/economy/sol";
import { MarketplaceSellerProceeds } from "@/components/revenue";
import {
  MarketplaceBrowser,
  BreedingRulesPanel,
} from "@/components/marketplace";
import { solToLamports } from "@/lib/items/lamports";
import { PageHeader } from "@/components/shared/page-header";
import { LISTING_RULES } from "@/lib/marketplace/listing-rules";
import { listBrowseCategories } from "@/lib/marketplace/browse-categories";

export const metadata = { title: "Marketplace" };

export default function MarketplacePage() {
  const solLive = featureFlagDefaults.REAL_SOL_MARKETPLACE_ENABLED;
  const browse = featureFlagDefaults.ECOSYSTEM_MARKETPLACE_BROWSE_ENABLED
    ? listBrowseCategories({ includeScaffold: true })
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Card trade desk · Rift Battles"
        titleSlug="marketplace"
        title="Marketplace"
        description={
          <>
            Trade card packs, singles, binder pages, sleeves, and board skins with Credits. Eggs and
            pets stay available as a secondary companion market. Real SOL escrow remains{" "}
            <strong className="text-[var(--amber)]">{solLive ? "enabled" : "disabled"}</strong>
            {" "}— optional, never required for competitive power. Sellers set prices; Riftwilds never
            assigns guaranteed value.
          </>
        }
        status={solLive ? "SOL live" : "Credits demo"}
        statusTone={solLive ? "live" : "warn"}
        actions={
          <>
            <Link href="/shop" className="btn-primary focus-ring">
              Card shop
            </Link>
            <Link href="/tcg/collection" className="btn-secondary focus-ring">
              Card Binder
            </Link>
          </>
        }
      >
        <ul className="mt-4 space-y-1 text-sm text-[var(--text-muted)]">
          <li>• Card packs, singles, binders & cosmetics lead the desk.</li>
          <li>• Credits settle core trades — SOL is optional prestige, never P2W.</li>
          <li>• Eggs/pets remain disclosed secondary listings (ranges / known traits).</li>
          <li>• Sale split 90/5/3/1/1 · listing fee ~0.002 SOL non-refundable.</li>
          <li>
            • Max {LISTING_RULES.maxActiveListingsPerWallet.petOrEgg} pet/egg and{" "}
            {LISTING_RULES.maxActiveListingsPerWallet.items} item listings per wallet ·{" "}
            {LISTING_RULES.maxListingDurationDays}-day expiry.
          </li>
        </ul>
        <MarketplaceDisclaimer className="mt-4" />
      </PageHeader>

      {browse.length > 0 ? (
        <section className="panel p-5">
          <h2 className="font-display text-lg text-white">Browse categories</h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Card packs, singles, and duel cosmetics lead. Eggs, pets, and housing stay secondary /
            scaffolded.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {browse.map((c) => (
              <span
                key={c.id}
                className={`rounded-md border border-[var(--stroke)] px-2.5 py-1 text-xs ${
                  c.enabled ? "text-white" : "text-[var(--text-dim)]"
                }`}
                title={c.description}
              >
                {c.label}
                {c.scaffold ? " · stub" : ""}
                {!c.enabled ? " · soon" : ""}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      <MarketplaceBrowser />

      <div className="grid gap-6 lg:grid-cols-2">
        <BreedingRulesPanel />
        <section className="space-y-4">
          <h2 className="font-display text-xl text-white">Example sale breakdown (1 SOL)</h2>
          <MarketplaceSellerProceeds listingPriceLamports={solToLamports("1")} mode="listing" />
          <SolMarketplaceFeeStub />
          <MarketplaceFeeBreakdown />
        </section>
      </div>

      <EconomySummary variant="compact" />
    </div>
  );
}
