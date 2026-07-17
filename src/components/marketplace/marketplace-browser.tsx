"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { EggListingCard } from "@/components/marketplace/egg-listing-card";
import { PetListingCard } from "@/components/marketplace/pet-listing-card";
import { PriceHistoryPanel } from "@/components/marketplace/price-history-panel";
import { SupplyStatusPanel } from "@/components/marketplace/supply-status-panel";
import { ListAssetPanel } from "@/components/marketplace/list-asset-panel";
import type { MarketplaceListingView } from "@/lib/marketplace/types";
import { playSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils/cn";

type CategoryId = "ALL" | "EGGS" | "PETS" | "EQUIPMENT" | "CONSUMABLES" | "PROPERTY";

const TABS: { id: CategoryId; label: string }[] = [
  { id: "ALL", label: "All" },
  { id: "EGGS", label: "Eggs" },
  { id: "PETS", label: "Pets" },
  { id: "EQUIPMENT", label: "Equipment" },
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
};

export function MarketplaceBrowser() {
  const [category, setCategory] = useState<CategoryId>("ALL");
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
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
            {tab.id === "PROPERTY" ? " (stub)" : ""}
          </button>
        ))}
      </div>

      {flags ? (
        <p className="text-xs text-[var(--text-muted)]">
          Catalog demo={String(flags.MARKETPLACE_DEMO_CATALOG_ENABLED)} · writes=
          {String(writesEnabled)} · SOL marketplace=
          {String(flags.REAL_SOL_MARKETPLACE_ENABLED)} · SOL purchases=
          {String(flags.SOL_PURCHASES_ENABLED)}
        </p>
      ) : null}

      {error ? <p className="text-sm text-[var(--coral)]">{error}</p> : null}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-3">
          <h2 className="font-display text-xl text-white">Live desk (demo catalog)</h2>
          {listings.length === 0 ? (
            <p className="panel p-6 text-sm text-[var(--text-muted)]">No listings in this category.</p>
          ) : (
            <div className="space-y-3">
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
                return (
                  <button
                    key={listing.publicId}
                    type="button"
                    onClick={() => setSelectedId(listing.publicId)}
                    className={cn(
                      "panel w-full p-4 text-left",
                      selectedId === listing.publicId && "border-[var(--cyan)]",
                    )}
                  >
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                      {listing.category}
                    </p>
                    <h3 className="mt-1 font-display text-lg text-white">{listing.title}</h3>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                      {listing.item?.rarity} · {listing.priceSol} SOL
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          {selected ? (
            <div className="panel space-y-3 p-4">
              <p className="text-sm text-white">
                Selected: <span className="font-display">{selected.title}</span>
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Sale fee disclosure: {selected.feeDisclosure.saleFeeNote} Listing fee{" "}
                {selected.feeDisclosure.listingFeeSol} SOL (non-refundable).
              </p>
              <button
                type="button"
                disabled={!writesEnabled}
                onClick={() => void purchase()}
                className="btn-primary focus-ring disabled:opacity-40"
              >
                Purchase (demo credits)
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
