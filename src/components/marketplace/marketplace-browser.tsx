"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { EggListingCard } from "@/components/marketplace/egg-listing-card";
import { PetListingCard } from "@/components/marketplace/pet-listing-card";
import { PriceHistoryPanel } from "@/components/marketplace/price-history-panel";
import { SupplyStatusPanel } from "@/components/marketplace/supply-status-panel";
import { ListAssetPanel } from "@/components/marketplace/list-asset-panel";
import { GameImage } from "@/components/assets/game-image";
import type { MarketplaceListingView } from "@/lib/marketplace/types";
import {
  resolveMarketplaceCategoryArt,
  resolveMarketplaceEggArt,
  resolveMarketplacePetArt,
  resolveMarketplaceProductIcon,
} from "@/lib/marketplace/product-icons";
import { playSfx } from "@/hooks/use-sfx";
import { enterSoundscape } from "@/lib/audio/adaptive-engine";
import { cn } from "@/lib/utils/cn";

type CategoryId =
  | "ALL"
  | "PACKS"
  | "CARDS"
  | "EQUIPMENT"
  | "COLLECTIBLES"
  | "EGGS"
  | "PETS"
  | "CONSUMABLES"
  | "PROPERTY";

const PRIMARY_TABS: { id: CategoryId; label: string }[] = [
  { id: "ALL", label: "All" },
  { id: "PACKS", label: "Card packs" },
  { id: "CARDS", label: "Single cards" },
  { id: "EQUIPMENT", label: "Binders & cosmetics" },
  { id: "COLLECTIBLES", label: "Collectibles" },
];

const SECONDARY_TABS: { id: CategoryId; label: string }[] = [
  { id: "EGGS", label: "Eggs" },
  { id: "PETS", label: "Pets" },
  { id: "CONSUMABLES", label: "Consumables" },
  { id: "PROPERTY", label: "Property" },
];

const ALL_TAB_IDS = new Set<string>([
  ...PRIMARY_TABS.map((t) => t.id),
  ...SECONDARY_TABS.map((t) => t.id),
]);

type Flags = {
  MARKETPLACE_ENABLED: boolean;
  MARKETPLACE_WRITES_ENABLED: boolean;
  MARKETPLACE_DEMO_CATALOG_ENABLED: boolean;
  MARKETPLACE_BUNDLE_LISTINGS_ENABLED?: boolean;
  REAL_SOL_MARKETPLACE_ENABLED: boolean;
  SOL_PURCHASES_ENABLED: boolean;
  SOL_MARKETPLACE_ENABLED?: boolean;
};

function listingIcon(listing: MarketplaceListingView): string | null {
  if (listing.kind === "EGG" && listing.egg) {
    return resolveMarketplaceEggArt(listing.egg.sourceKind);
  }
  if (listing.kind === "PET" && listing.pet) {
    return resolveMarketplacePetArt(listing.pet.speciesSlug);
  }
  return (
    listing.item?.iconPath ??
    resolveMarketplaceProductIcon(listing.item?.key) ??
    null
  );
}

function listingCredits(listing: MarketplaceListingView): number {
  return (
    listing.priceCredits ??
    Math.round(Number.parseFloat(listing.priceSol) * 10_000)
  );
}

function parseCategory(raw: string | null): CategoryId {
  if (raw && ALL_TAB_IDS.has(raw)) return raw as CategoryId;
  return "PACKS";
}

function MarketplaceBrowserInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const category = parseCategory(searchParams.get("category"));

  const [listings, setListings] = useState<MarketplaceListingView[]>([]);
  const [flags, setFlags] = useState<Flags | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [purchaseMsg, setPurchaseMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"recent" | "price_asc" | "price_desc">("recent");

  const setCategory = useCallback(
    (next: CategoryId) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next === "ALL") params.delete("category");
      else params.set("category", next);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      setSelectedId(null);
      setPurchaseMsg(null);
    },
    [pathname, router, searchParams],
  );

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const qs = category === "ALL" ? "" : `?category=${category}`;
      const res = await fetch(`/api/marketplace/listings${qs}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load listings");
        setListings([]);
        return;
      }
      setFlags(data.flags);
      setListings(data.listings ?? []);
    } catch {
      setError("Failed to load listings");
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    void enterSoundscape("marketplace", { fadeMs: 700 });
    void load();
  }, [load]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = listings;
    if (q) {
      rows = rows.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.sellerLabel.toLowerCase().includes(q) ||
          (l.item?.name ?? "").toLowerCase().includes(q) ||
          (l.listingType ?? "").toLowerCase().includes(q),
      );
    }
    const credits = (l: MarketplaceListingView) =>
      l.priceCredits ?? Math.round(Number.parseFloat(l.priceSol) * 10_000);
    rows = [...rows].sort((a, b) => {
      if (sort === "price_asc") return credits(a) - credits(b);
      if (sort === "price_desc") return credits(b) - credits(a);
      return b.createdAt.localeCompare(a.createdAt);
    });
    return rows;
  }, [listings, query, sort]);

  const selected = useMemo(
    () => listings.find((l) => l.publicId === selectedId) ?? null,
    [listings, selectedId],
  );

  const writesEnabled = Boolean(
    flags?.MARKETPLACE_WRITES_ENABLED || flags?.MARKETPLACE_ENABLED,
  );

  const purchase = async () => {
    if (!selected) return;
    setPurchaseMsg(null);
    playSfx("ui.click");
    const res = await fetch(`/api/marketplace/listings/${selected.publicId}/purchase`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: `req_${crypto.randomUUID()}` }),
    });
    const data = await res.json();
    if (!res.ok) {
      playSfx("shop.purchase_fail");
      setPurchaseMsg(data.message ?? data.error ?? "Purchase blocked");
      return;
    }
    playSfx("shop.purchase_ok");
    // Cosmetic feedback only — does not enable SOL wagering.
    if (Number.parseFloat(String(selected.priceSol ?? "0")) > 0) {
      playSfx("marketplace.sol_transfer");
    }
    setPurchaseMsg(`${data.note} Mode: ${data.mode}`);
    void load();
  };

  const selectedIcon = selected ? listingIcon(selected) : null;
  const deskArt = resolveMarketplaceCategoryArt(category);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {PRIMARY_TABS.map((tab) => {
          const thumb = resolveMarketplaceCategoryArt(tab.id);
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                playSfx("ui.nav");
                setCategory(tab.id);
              }}
              className={cn(
                "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition duration-200",
                category === tab.id
                  ? "border-[var(--cyan)] bg-[rgba(61,231,255,0.14)] text-white shadow-[0_0_0_1px_rgba(61,231,255,0.2)]"
                  : "border-[var(--stroke)] text-[var(--text-muted)] hover:border-[var(--cyan)]/40 hover:text-white",
              )}
            >
              <span className="relative h-5 w-5 overflow-hidden rounded-sm border border-[var(--stroke)] bg-[rgba(7,11,22,0.55)]">
                <GameImage
                  src={thumb}
                  alt=""
                  width={20}
                  height={20}
                  className="object-cover"
                  showDevBadge={false}
                  unoptimized
                />
              </span>
              {tab.label}
            </button>
          );
        })}
        <span className="text-[10px] text-[var(--text-dim)]">·</span>
        {SECONDARY_TABS.map((tab) => {
          const thumb = resolveMarketplaceCategoryArt(tab.id);
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                playSfx("ui.nav");
                setCategory(tab.id);
              }}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition duration-200",
                category === tab.id
                  ? "border-[var(--cyan)] bg-[rgba(61,231,255,0.1)] text-white"
                  : "border-[var(--stroke)] text-[var(--text-dim)] hover:text-[var(--text-muted)]",
              )}
              title="Companion / Live World secondary market"
            >
              <span className="relative h-4 w-4 overflow-hidden rounded-sm opacity-90">
                <GameImage
                  src={thumb}
                  alt=""
                  width={16}
                  height={16}
                  className="object-cover"
                  showDevBadge={false}
                  unoptimized
                />
              </span>
              {tab.label}
              {tab.id === "PROPERTY" ? " (stub)" : ""}
            </button>
          );
        })}
      </div>

      {flags ? (
        <p className="text-xs text-[var(--text-muted)]">
          Credits settle the card desk · catalog demo=
          {String(flags.MARKETPLACE_DEMO_CATALOG_ENABLED)} · writes=
          {String(writesEnabled)} · SOL marketplace=
          {String(flags.SOL_MARKETPLACE_ENABLED ?? false)} (optional, never required for power)
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          placeholder="Search title, seller, listing type…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-w-[200px] flex-1 rounded-md border border-[var(--stroke)] bg-[rgba(8,10,18,0.6)] px-3 py-2 text-sm text-white"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="rounded-md border border-[var(--stroke)] bg-[rgba(8,10,18,0.6)] px-3 py-2 text-sm text-white"
        >
          <option value="recent">Newest</option>
          <option value="price_asc">Credits ↑</option>
          <option value="price_desc">Credits ↓</option>
        </select>
        <Link
          href="/marketplace/wishlist"
          className="rounded-md border border-[var(--stroke)] px-3 py-2 text-xs text-[var(--text-muted)] hover:text-white"
        >
          Wishlist
        </Link>
      </div>

      {error ? <p className="text-sm text-[var(--coral)]">{error}</p> : null}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="panel relative space-y-3 overflow-hidden p-4">
          <div
            className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.32]"
            style={{ backgroundImage: `url(${deskArt})` }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[rgba(8,10,18,0.58)] via-[rgba(8,10,18,0.78)] to-[rgba(8,10,18,0.94)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(61,231,255,0.08),transparent_55%)]"
            aria-hidden
          />
          <h2 className="relative z-[1] font-display text-xl text-white">
            Card trade desk
          </h2>
          <p className="relative z-[1] text-xs text-[var(--text-muted)]">
            Packs, singles, binders, and sleeves lead. Credits are the play path — SOL stays
            optional and never buys competitive power.
          </p>

          {loading ? (
            <p className="relative z-[1] panel p-6 text-sm text-[var(--text-muted)]">
              Loading desk listings…
            </p>
          ) : visible.length === 0 ? (
            <div className="relative z-[1] panel flex flex-col items-center gap-3 p-8 text-center">
              <div className="relative h-28 w-28 overflow-hidden rounded-md border border-[var(--stroke)]">
                <GameImage
                  src={
                    category === "PROPERTY"
                      ? "/assets/ui/ecosystem/housing-catalog.png"
                      : "/assets/ui/empty-states/inventory.png"
                  }
                  alt=""
                  width={112}
                  height={112}
                  className="object-cover opacity-85"
                  showDevBadge={false}
                  unoptimized
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(8,10,18,0.75)] to-transparent"
                  aria-hidden
                />
              </div>
              <p className="text-sm text-white">No listings match.</p>
              <p className="max-w-sm text-xs text-[var(--text-muted)]">
                {category === "PROPERTY"
                  ? "Property trade is scaffolded for Living World — not live yet."
                  : "Try another tab, clear search, or list an asset when writes are enabled."}
              </p>
            </div>
          ) : (
            <div className="relative z-[1] grid gap-3 sm:grid-cols-2">
              {visible.map((listing) => {
                if (listing.kind === "EGG") {
                  return (
                    <EggListingCard
                      key={listing.publicId}
                      listing={listing}
                      selected={selectedId === listing.publicId}
                      onSelect={() => setSelectedId(listing.publicId)}
                    />
                  );
                }
                if (listing.kind === "PET") {
                  return (
                    <PetListingCard
                      key={listing.publicId}
                      listing={listing}
                      selected={selectedId === listing.publicId}
                      onSelect={() => setSelectedId(listing.publicId)}
                    />
                  );
                }
                const icon = listingIcon(listing);
                const credits = listingCredits(listing);
                return (
                  <button
                    key={listing.publicId}
                    type="button"
                    onClick={() => setSelectedId(listing.publicId)}
                    className={cn(
                      "group panel relative flex w-full gap-3 overflow-hidden p-3 text-left transition duration-200",
                      "hover:-translate-y-0.5 hover:border-[var(--cyan)]/55 hover:shadow-[0_12px_28px_rgba(0,0,0,0.35)]",
                      selectedId === listing.publicId &&
                        "border-[var(--cyan)] ring-1 ring-[var(--cyan)]/40",
                    )}
                  >
                    <div className="panel-inset relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden">
                      <div
                        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[rgba(61,231,255,0.14)] via-transparent to-[rgba(255,184,77,0.08)]"
                        aria-hidden
                      />
                      {icon ? (
                        <GameImage
                          src={icon}
                          alt=""
                          width={80}
                          height={80}
                          className="relative z-[1] object-contain transition duration-200 group-hover:scale-105"
                          fallbackSrc={icon.replace(/\.png(\?.*)?$/i, ".svg")}
                          showDevBadge={false}
                          unoptimized
                        />
                      ) : (
                        <span className="relative z-[1] text-[10px] text-[var(--text-dim)]">
                          TCG
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                        {listing.category}
                        {listing.listingType ? ` · ${listing.listingType}` : ""}
                      </p>
                      <h3 className="mt-0.5 font-display text-base text-white">
                        {listing.title}
                      </h3>
                      <p className="mt-1 text-sm text-[var(--cyan)]">
                        {credits.toLocaleString()} Credits
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)]">
                        {listing.item?.rarity} · optional {listing.priceSol} SOL
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {selected ? (
            <div className="relative z-[1] panel space-y-3 border-[var(--cyan)]/25 bg-[rgba(8,10,18,0.72)] p-4 backdrop-blur-[2px]">
              <div className="flex gap-3">
                {selectedIcon ? (
                  <div className="panel-inset relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden">
                    <div
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(8,10,18,0.55)] to-transparent"
                      aria-hidden
                    />
                    <GameImage
                      src={selectedIcon}
                      alt=""
                      width={96}
                      height={96}
                      className="relative z-[1] object-contain"
                      fallbackSrc={selectedIcon.replace(/\.png(\?.*)?$/i, ".svg")}
                      showDevBadge={false}
                      unoptimized
                    />
                  </div>
                ) : null}
                <div>
                  <p className="text-sm text-white">
                    Selected: <span className="font-display">{selected.title}</span>
                  </p>
                  <p className="mt-1 text-sm text-[var(--cyan)]">
                    {listingCredits(selected).toLocaleString()} Credits
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Optional prestige path: {selected.priceSol} SOL · never required for power.
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    Sale fee disclosure: {selected.feeDisclosure.saleFeeNote} Listing fee{" "}
                    {selected.feeDisclosure.listingFeeSol} SOL (non-refundable).
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={!writesEnabled}
                onClick={() => void purchase()}
                className="btn-primary focus-ring disabled:opacity-40"
              >
                Purchase (Credits)
              </button>
              {purchaseMsg ? (
                <p className="text-xs text-[var(--text-muted)]">{purchaseMsg}</p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <PriceHistoryPanel publicId={selected?.publicId ?? null} />
          <SupplyStatusPanel />
          <ListAssetPanel
            writesEnabled={writesEnabled}
            bundleEnabled={flags?.MARKETPLACE_BUNDLE_LISTINGS_ENABLED !== false}
            onCreated={() => void load()}
          />
        </div>
      </div>
    </div>
  );
}

export function MarketplaceBrowser() {
  return (
    <Suspense
      fallback={
        <div className="panel p-6 text-sm text-[var(--text-muted)]">Loading trade desk…</div>
      }
    >
      <MarketplaceBrowserInner />
    </Suspense>
  );
}
