import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { getPlayerShop } from "@/lib/marketplace/player-shops";
import { getMarketplaceListing } from "@/lib/marketplace/demo-listings";
import { GameImage } from "@/components/assets/game-image";

export const metadata = { title: "Player shop · Marketplace" };

export default async function PlayerShopDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const shop = getPlayerShop(slug);
  if (!shop) notFound();

  const featured = shop.featuredListingIds
    .map((id) => getMarketplaceListing(id))
    .filter(Boolean);

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Player shop"
        titleSlug="marketplace"
        title={shop.name}
        description={
          <>
            {shop.motto} Owner <span className="text-white">{shop.ownerLabel}</span>. Ratings are
            demo stubs — not ledger-backed reputation.
          </>
        }
        status={`${shop.rating.score} · ${shop.rating.tierLabel}`}
        statusTone="info"
        actions={
          <>
            <Link href="/marketplace/shops" className="btn-secondary focus-ring text-sm">
              All shops
            </Link>
            <Link href="/marketplace" className="btn-primary focus-ring text-sm">
              Browse desk
            </Link>
          </>
        }
      />

      <section className="panel relative overflow-hidden p-0">
        <div className="relative h-40 w-full">
          <GameImage
            src={shop.bannerPath}
            alt=""
            width={1200}
            height={240}
            className="h-full w-full object-cover"
            showDevBadge={false}
            unoptimized
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(8,10,18,0.92)] via-[rgba(8,10,18,0.4)] to-transparent"
            aria-hidden
          />
        </div>
        <div className="flex flex-wrap gap-2 p-4">
          {shop.specialties.map((s) => (
            <span
              key={s}
              className="rounded border border-[var(--stroke)] px-2 py-0.5 text-[11px] text-[var(--text-muted)]"
            >
              {s}
            </span>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl text-white">Featured listings</h2>
        {featured.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">No featured listings yet.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((listing) =>
              listing ? (
                <li key={listing.publicId} className="panel p-4">
                  <p className="text-[10px] uppercase text-[var(--text-dim)]">
                    {listing.listingType ?? "FIXED_PRICE"} · {listing.category}
                  </p>
                  <h3 className="mt-1 font-display text-base text-white">{listing.title}</h3>
                  <p className="mt-1 text-sm text-[var(--cyan)]">
                    {(listing.priceCredits ?? 0).toLocaleString()} Credits
                  </p>
                  <Link
                    href={`/marketplace?category=${listing.category}`}
                    className="mt-2 inline-block text-xs text-[var(--cyan)] underline"
                  >
                    View on desk
                  </Link>
                </li>
              ) : null,
            )}
          </ul>
        )}
      </section>
    </div>
  );
}
