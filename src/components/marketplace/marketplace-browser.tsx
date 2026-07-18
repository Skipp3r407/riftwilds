"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { EggListingCard } from "@/components/marketplace/egg-listing-card";
import { PetListingCard } from "@/components/marketplace/pet-listing-card";
import { PriceHistoryPanel } from "@/components/marketplace/price-history-panel";
import { SupplyStatusPanel } from "@/components/marketplace/supply-status-panel";
import { ListAssetPanel } from "@/components/marketplace/list-asset-panel";
import { GameImage } from "@/components/assets/game-image";
import type { MarketplaceListingView } from "@/lib/marketplace/types";
import { resolveMarketplaceProductIcon } from "@/lib/marketplace/product-icons";
import { playSfx } from "@/hooks/use-sfx";
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
  return (
    listing.item?.iconPath ??
    resolveMarketplaceProductIcon(listing.item?.key) ??
    null
  );
}

export function MarketplaceBrowser() {
  const [category, setCategory] = useState<CategoryId>("PACKS");
  const [listings, setListings] = useState<MarketplaceListingView[]>([]);
  const [flags, setFlags] = useState<Flags | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [purchaseMsg, setPurchaseMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
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
  }, [category]);

  useEffect(() => {
    void load();
  }, [load]);

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
      setPurchaseMsg(data.error ?? "Purchase blocked");
      return;
    }
    playSfx("shop.purchase_ok");
    setPurchaseMsg(`${data.note} Mode: ${data.mode}`);
    void load();
  };

  const selectedIcon = selected ? listingIcon(selected) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {PRIMARY_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              playSfx("ui.nav");
              setCategory(tab.id);
            }}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm transition",
              category === tab.id
                ? "border-[var(--cyan)] bg-[rgba(61,231,255,0.12)] text-white"
                : "border-[var(--stroke)] text-[var(--text-muted)] hover:text-white",
            )}
          >
            {tab.label}
          </button>
        ))}
        <span className="text-[10px] text-[var(--text-dim)]">·</span>
        {SECONDARY_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              playSfx("ui.nav");
              setCategory(tab.id);
            }}
            className={cn(
              "rounded-md border px-2.5 py-1 text-xs transition",
              category === tab.id
                ? "border-[var(--cyan)] bg-[rgba(61,231,255,0.08)] text-white"
                : "border-[var(--stroke)] text-[var(--text-dim)] hover:text-[var(--text-muted)]",
            )}
            title="Companion / Live World secondary market"
          >
            {tab.label}
            {tab.id === "PROPERTY" ? " (stub)" : ""}
          </button>
        ))}
      </div>

      {flags ? (
        <p className="text-xs text-[var(--text-muted)]">
          Credits settle the card desk · catalog demo=
          {String(flags.MARKETPLACE_DEMO_CATALOG_ENABLED)} · writes=
          {String(writesEnabled)} · SOL marketplace=
          {String(flags.SOL_MARKETPLACE_ENABLED ?? false)} (optional, never required for power)
        </p>
      ) : null}

      {error ? <p className="text-sm text-[var(--coral)]">{error}</p> : null}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="panel relative space-y-3 overflow-hidden p-4">
          <div
            className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-25"
            style={{ backgroundImage: "url(/assets/marketplace/desk-atmosphere.png?v=mk2)" }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[rgba(8,10,18,0.55)] to-[rgba(8,10,18,0.92)]"
            aria-hidden
          />
          <h2 className="relative z-[1] font-display text-xl text-white">
            Card trade desk
          </h2>
          <p className="relative z-[1] text-xs text-[var(--text-muted)]">
            Packs, singles, binders, and sleeves lead. Credits are the play path — SOL stays
            optional and never buys competitive power.
          </p>
          {listings.length === 0 ? (
            <p className="relative z-[1] panel p-6 text-sm text-[var(--text-muted)]">
              No listings in this category.
            </p>
          ) : (
            <div className="relative z-[1] grid gap-3 sm:grid-cols-2">
              {listings.map((listing) => {
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
                const credits =
                  listing.priceCredits ??
                  Math.round(Number.parseFloat(listing.priceSol) * 10_000);
                return (
                  <button
                    key={listing.publicId}
                    type="button"
                    onClick={() => setSelectedId(listing.publicId)}
                    className={cn(
                      "panel flex w-full gap-3 p-3 text-left transition",
                      selectedId === listing.publicId && "border-[var(--cyan)]",
                    )}
                  >
                    <div className="panel-inset relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden">
                      {icon ? (
                        <GameImage
                          src={icon}
                          alt=""
                          width={80}
                          height={80}
                          className="object-contain"
                          fallbackSrc={icon.replace(/\.png(\?.*)?$/i, ".svg")}
                          showDevBadge={false}
                          unoptimized
                        />
                      ) : (
                        <span className="text-[10px] text-[var(--text-dim)]">TCG</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                        {listing.category}
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
            <div className="relative z-[1] panel space-y-3 p-4">
              <div className="flex gap-3">
                {selectedIcon ? (
                  <div className="panel-inset flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden">
                    <GameImage
                      src={selectedIcon}
                      alt=""
                      width={96}
                      height={96}
                      className="object-contain"
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
                    {(
                      selected.priceCredits ??
                      Math.round(Number.parseFloat(selected.priceSol) * 10_000)
                    ).toLocaleString()}{" "}
                    Credits
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
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
          <PriceHistoryPanel publicId={selectedId} />
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
