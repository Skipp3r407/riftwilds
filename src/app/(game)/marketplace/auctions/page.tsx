import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { getDemoMarketplaceListings } from "@/lib/marketplace/demo-listings";
import { listingTypesForPhase } from "@/lib/marketplace/listing-kinds";

export const metadata = { title: "Auction house · Marketplace" };

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
          {types.map((t) => (
            <li
              key={t.id}
              className="rounded-md border border-[var(--stroke)] px-3 py-2 text-sm"
            >
              <span className="text-white">{t.label}</span>
              <span className="ml-2 text-[10px] uppercase text-[var(--text-dim)]">{t.phase}</span>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">{t.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl text-white">Active auctions (demo)</h2>
        {auctions.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">No auction listings in demo catalog.</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {auctions.map((a) => (
              <li key={a.publicId} className="panel p-4">
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
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl text-white">Best offer (demo)</h2>
        <ul className="grid gap-3 md:grid-cols-2">
          {offers.map((o) => (
            <li key={o.publicId} className="panel p-4">
              <h3 className="font-display text-white">{o.title}</h3>
              <p className="mt-1 text-sm text-[var(--cyan)]">
                Top offer {o.bestOffer?.topOfferCredits ?? "—"} Credits
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Min {o.bestOffer?.minOfferCredits} · {o.bestOffer?.offerCount ?? 0} offers
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
