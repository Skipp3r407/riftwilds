import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { listPlayerShops } from "@/lib/marketplace/player-shops";
import { GameImage } from "@/components/assets/game-image";

export const metadata = { title: "Player Shops · Marketplace" };

export default function PlayerShopsPage() {
  const shops = listPlayerShops();

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Player Marketplace"
        titleSlug="marketplace"
        title="Player shops"
        description="Named stalls with featured cosmetics, banners, and demo ratings. Sales never grant competitive power."
        status="Partial"
        statusTone="warn"
        actions={
          <>
            <Link href="/marketplace" className="btn-primary focus-ring text-sm">
              Trade desk
            </Link>
            <Link href="/exchange" className="btn-secondary focus-ring text-sm">
              Rift Exchange
            </Link>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {shops.map((shop) => (
          <Link
            key={shop.slug}
            href={`/marketplace/shops/${shop.slug}`}
            className="panel group relative overflow-hidden p-0 transition hover:border-[var(--cyan)]/45"
          >
            <div className="relative h-28 w-full overflow-hidden">
              <GameImage
                src={shop.bannerPath}
                alt=""
                width={640}
                height={180}
                className="h-full w-full object-cover opacity-80 transition group-hover:scale-105"
                showDevBadge={false}
                unoptimized
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(8,10,18,0.95)] to-transparent"
                aria-hidden
              />
            </div>
            <div className="space-y-1 p-4">
              <h2 className="font-display text-lg text-white">{shop.name}</h2>
              <p className="text-xs text-[var(--text-muted)]">{shop.motto}</p>
              <p className="text-[11px] text-[var(--cyan)]">
                {shop.rating.tierLabel} · {shop.rating.score} · {shop.rating.reviewCount} reviews
                (demo)
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
