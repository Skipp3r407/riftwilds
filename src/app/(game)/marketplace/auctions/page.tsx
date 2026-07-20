import Link from "next/link";
import { GameImage } from "@/components/assets/game-image";
import { PageHeader } from "@/components/shared/page-header";
import { getDemoMarketplaceListings } from "@/lib/marketplace/demo-listings";
import { listingTypesForPhase } from "@/lib/marketplace/listing-kinds";
import {
  resolveMarketplaceListingTypeArt,
  resolveMarketplaceProductIcon,
} from "@/lib/marketplace/product-icons";

export const metadata = { title: "Auction house · Marketplace" };

function listingThumb(listing: {
  item?: { key?: string; iconPath?: string | null } | null;
}): string | null {
  return (
    listing.item?.iconPath ??
    resolveMarketplaceProductIcon(listing.item?.key) ??
    null
  );
}

export default function MarketplaceAuctionsPage() {
  const auctions = getDemoMarketplaceListings().filter((l) => l.listingType === "AUCTION");
  const offers = getDemoMarketplaceListings().filter((l) => l.listingType === "BEST_OFFER");
  const types = listingTypesForPhase("all");

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Player Marketplace"
        titleSlug="marketplace"
        title="Auction house"
        description="Timed auctions and best-offer demos for cosmetics / collectibles. Credits-first; no competitive power sales."
        status="Live demo"
        statusTone="live"
        actions={
          <>
            <Link href="/marketplace" className="btn-primary focus-ring text-sm">
              Desk
            </Link>
            <Link href="/marketplace/wishlist" className="btn-secondary focus-ring text-sm">
              Watchlist
            </Link>
          </>
        }
      />

      <section className="panel p-5">
        <h2 className="font-display text-lg text-white">Listing types</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {types.map((t) => {
            const thumb = resolveMarketplaceListingTypeArt(t.id);
            return (
              <li
                key={t.id}
                className="flex items-start gap-3 rounded-md border border-[var(--stroke)] px-3 py-2 text-sm"
              >
                <span className="relative mt-0.5 h-12 w-12 shrink-0 overflow-hidden rounded-md border border-[var(--stroke)] bg-[rgba(8,10,18,0.65)]">
                  <GameImage
                    src={thumb}
                    alt=""
                    width={48}
                    height={48}
                    className="object-cover"
                    showDevBadge={false}
                    unoptimized
                  />
                  <span
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(8,10,18,0.45)] to-transparent"
                    aria-hidden
                  />
                </span>
                <span className="min-w-0">
                  <span className="text-white">{t.label}</span>
                  <span className="ml-2 text-[10px] uppercase text-[var(--text-dim)]">
                    {t.phase}
                  </span>
                  <p className="mt-0.5 text-xs text-[var(--text-muted)]">{t.description}</p>
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl text-white">Active auctions (demo)</h2>
        {auctions.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">No auction listings in demo catalog.</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {auctions.map((a) => {
              const thumb = listingThumb(a);
              return (
                <li key={a.publicId} className="panel flex gap-3 p-4">
                  <div className="panel-inset relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden">
                    <div
                      className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[rgba(61,231,255,0.14)] via-transparent to-[rgba(255,184,77,0.08)]"
                      aria-hidden
                    />
                    {thumb ? (
                      <GameImage
                        src={thumb}
                        alt=""
                        width={80}
                        height={80}
                        className="relative z-[1] object-contain"
                        fallbackSrc={thumb.replace(/\.png(\?.*)?$/i, ".svg")}
                        showDevBadge={false}
                        unoptimized
                      />
                    ) : (
                      <span className="relative z-[1] text-xs text-[var(--text-dim)]">—</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display text-white">{a.title}</h3>
                    <p className="mt-1 text-sm text-[var(--cyan)]">
                      High bid {a.auction?.highBidCredits ?? "—"} Credits ·{" "}
                      {a.auction?.bidCount ?? 0} bids
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      Starts {a.auction?.startingCredits} · reserve{" "}
                      {a.auction?.reserveCredits ?? "none"} · ends{" "}
                      {a.auction?.endsAt
                        ? new Date(a.auction.endsAt).toLocaleString()
                        : "—"}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl text-white">Best offer (demo)</h2>
        <ul className="grid gap-3 md:grid-cols-2">
          {offers.map((o) => {
            const thumb = listingThumb(o);
            return (
              <li key={o.publicId} className="panel flex gap-3 p-4">
                <div className="panel-inset relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden">
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[rgba(255,184,77,0.14)] via-transparent to-[rgba(61,231,255,0.08)]"
                    aria-hidden
                  />
                  {thumb ? (
                    <GameImage
                      src={thumb}
                      alt=""
                      width={80}
                      height={80}
                      className="relative z-[1] object-contain"
                      fallbackSrc={thumb.replace(/\.png(\?.*)?$/i, ".svg")}
                      showDevBadge={false}
                      unoptimized
                    />
                  ) : (
                    <span className="relative z-[1] text-xs text-[var(--text-dim)]">—</span>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-white">{o.title}</h3>
                  <p className="mt-1 text-sm text-[var(--cyan)]">
                    Top offer {o.bestOffer?.topOfferCredits ?? "—"} Credits
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Min {o.bestOffer?.minOfferCredits} · {o.bestOffer?.offerCount ?? 0} offers
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
