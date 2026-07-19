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
import { GameImage } from "@/components/assets/game-image";
import { solToLamports } from "@/lib/items/lamports";
import { PageHeader } from "@/components/shared/page-header";
import { LISTING_RULES } from "@/lib/marketplace/listing-rules";
import { listBrowseCategories } from "@/lib/marketplace/browse-categories";
import { resolveMarketplaceCategoryArt } from "@/lib/marketplace/product-icons";

export const metadata = { title: "Player Marketplace" };

const HUB_LINKS = [
  { href: "/marketplace/auctions", label: "Auctions", status: "demo" },
  { href: "/marketplace/shops", label: "Player shops", status: "partial" },
  { href: "/marketplace/trade", label: "Trade", status: "shell" },
  { href: "/marketplace/wishlist", label: "Wishlist", status: "demo" },
  { href: "/marketplace/rentals", label: "Rentals", status: "soon" },
  { href: "/marketplace/commissions", label: "Commissions", status: "soon" },
  { href: "/marketplace/guild", label: "Guild vendors", status: "soon" },
  { href: "/exchange", label: "Rift Exchange", status: "hub" },
] as const;

function browseHref(
  id: string,
  listingCategory: string | null,
  enabled: boolean,
): string | null {
  if (!enabled) return null;
  if (id === "WISHLISTS") return "/marketplace/wishlist";
  if (id === "OFFERS") return "/marketplace/auctions";
  if (!listingCategory) return null;
  return `/marketplace?category=${listingCategory}`;
}

export default function MarketplacePage() {
  const solLive = featureFlagDefaults.REAL_SOL_MARKETPLACE_ENABLED;
  const browse = featureFlagDefaults.ECOSYSTEM_MARKETPLACE_BROWSE_ENABLED
    ? listBrowseCategories({ includeScaffold: true })
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Player Marketplace · Rift Exchange"
        titleSlug="marketplace"
        title="Player Marketplace"
        description={
          <>
            Social hub for buy / sell / trade / auction of eligible cosmetics and collectibles.
            Credits-first; SOL optional.{" "}
            <strong className="text-[var(--amber)]">
              No guaranteed competitive advantages
            </strong>
            {" "}— base progression stays achievable without the marketplace. Escrow{" "}
            <strong className="text-[var(--amber)]">{solLive ? "enabled" : "disabled"}</strong>.
          </>
        }
        status={solLive ? "SOL live" : "Credits demo"}
        statusTone={solLive ? "live" : "warn"}
        actions={
          <>
            <Link href="/exchange" className="btn-primary focus-ring">
              Rift Exchange
            </Link>
            <Link href="/shop" className="btn-secondary focus-ring">
              Card shop
            </Link>
            <Link href="/tcg/museum" className="btn-secondary focus-ring">
              Museum
            </Link>
          </>
        }
      >
        <ul className="mt-4 space-y-1 text-sm text-[var(--text-muted)]">
          <li>• Fixed price, auction, and best-offer demos · trade / rental scaffolds.</li>
          <li>• Eligible: cosmetics, alt-art, collectibles · blocked: base competitive power.</li>
          <li>• Credits settle core trades — SOL is optional prestige, never P2W.</li>
          <li>• Fee split display · price history · wishlist / watchlist · player shops.</li>
          <li>
            • Max {LISTING_RULES.maxActiveListingsPerWallet.petOrEgg} pet/egg and{" "}
            {LISTING_RULES.maxActiveListingsPerWallet.items} item listings ·{" "}
            {LISTING_RULES.maxListingDurationDays}-day expiry.
          </li>
        </ul>
        <MarketplaceDisclaimer className="mt-4" />
      </PageHeader>

      <section className="flex flex-wrap gap-2">
        {HUB_LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-md border border-[var(--stroke)] bg-[rgba(8,10,18,0.55)] px-3 py-1.5 text-sm text-white transition hover:border-[var(--cyan)]/45"
          >
            {l.label}
            <span className="ml-1.5 text-[10px] uppercase text-[var(--text-dim)]">{l.status}</span>
          </Link>
        ))}
      </section>

      {browse.length > 0 ? (
        <section className="panel relative overflow-hidden p-5">
          <div
            className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-20"
            style={{
              backgroundImage: "url(/assets/marketplace/desk-atmosphere.png)",
            }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[rgba(8,10,18,0.88)] via-[rgba(8,10,18,0.72)] to-[rgba(8,10,18,0.9)]"
            aria-hidden
          />
          <div className="relative z-[1]">
            <h2 className="font-display text-lg text-white">Browse categories</h2>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Card packs, singles, and duel cosmetics lead. Eggs, pets, and housing stay secondary /
              scaffolded. Jump straight into a desk tab.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {browse.map((c) => {
                const href = browseHref(c.id, c.listingCategory, c.enabled);
                const art = resolveMarketplaceCategoryArt(c.listingCategory ?? "ALL");
                const className =
                  "group flex items-center gap-3 rounded-md border border-[var(--stroke)] bg-[rgba(8,10,18,0.55)] px-3 py-2.5 text-left transition duration-200 hover:border-[var(--cyan)]/45 hover:bg-[rgba(61,231,255,0.06)]";
                const body = (
                  <>
                    <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md border border-[var(--stroke)]">
                      <GameImage
                        src={art}
                        alt=""
                        width={44}
                        height={44}
                        className="object-cover transition duration-200 group-hover:scale-105"
                        showDevBadge={false}
                        unoptimized
                      />
                      <span
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(8,10,18,0.55)] to-transparent"
                        aria-hidden
                      />
                    </span>
                    <span className="min-w-0">
                      <span
                        className={`block text-sm ${
                          c.enabled ? "text-white" : "text-[var(--text-dim)]"
                        }`}
                      >
                        {c.label}
                        {c.scaffold ? " · stub" : ""}
                        {!c.enabled ? " · soon" : ""}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-[var(--text-muted)] line-clamp-2">
                        {c.description}
                      </span>
                    </span>
                  </>
                );

                if (href) {
                  return (
                    <Link key={c.id} href={href} className={className} title={c.description}>
                      {body}
                    </Link>
                  );
                }

                return (
                  <span
                    key={c.id}
                    className={`${className} cursor-default opacity-70`}
                    title={c.description}
                  >
                    {body}
                  </span>
                );
              })}
            </div>
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
