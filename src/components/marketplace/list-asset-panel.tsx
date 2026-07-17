"use client";

import { useState } from "react";
import { MarketplaceSellerProceeds } from "@/components/revenue";
import { solToLamports } from "@/lib/items/lamports";

type Props = {
  writesEnabled: boolean;
  bundleEnabled: boolean;
  onCreated?: () => void;
};

export function ListAssetPanel({ writesEnabled, bundleEnabled, onCreated }: Props) {
  const [kind, setKind] = useState<"PET" | "EGG">("PET");
  const [bundleMode, setBundleMode] = useState<"PET_ONLY" | "PET_PLUS_LOADOUT">("PET_ONLY");
  const [priceSol, setPriceSol] = useState("0.45");
  const [title, setTitle] = useState("Demo Cinder Cub");
  const [includeWeapon, setIncludeWeapon] = useState(true);
  const [includeArmor, setIncludeArmor] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const bundledItems =
        kind === "PET" && bundleMode === "PET_PLUS_LOADOUT"
          ? [
              ...(includeWeapon
                ? [{ key: "ember-talons", name: "Ember Talons", slot: "weapon" }]
                : []),
              ...(includeArmor
                ? [{ key: "ash-guard", name: "Ash Guard", slot: "chest" }]
                : []),
            ]
          : [];

      const body =
        kind === "EGG"
          ? {
              kind: "EGG",
              category: "EGGS",
              subfilter: "seasonal",
              title,
              priceSol,
              durationDays: 7,
              eggSourceKind: "OFFICIAL_SEASONAL",
              generation: 1,
              parents: null,
              sellerLabel: "demo-seller",
            }
          : {
              kind: "PET",
              category: "PETS",
              subfilter: "battle-trained",
              title,
              priceSol,
              durationDays: 7,
              bundleMode,
              bundledItems,
              sellerLabel: "demo-seller",
              pet: {
                rarity: "RARE",
                speciesSlug: "cindercub",
                speciesName: "Cinder Cub",
                affinity: "EMBER",
                level: 12,
                evolutionStage: "young",
                abilities: ["Ember Swipe", "Heat Guard"],
                ultimate: null,
                battleRecord: { wins: 10, losses: 6 },
                breedingUsesRemaining: 4,
                generation: 1,
                founderStatus: false,
              },
            };

      const res = await fetch("/api/marketplace/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Listing failed");
        return;
      }
      setMessage(`Listed ${data.listing.publicId} (demo). Listing fee ${data.listing.feeDisclosure?.listingFeeSol ?? "0.002"} SOL non-refundable.`);
      onCreated?.();
    } catch {
      setMessage("Network error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="panel space-y-4 p-5">
      <div>
        <h2 className="font-display text-lg text-white">List an asset</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Choose pet-only or an explicit loadout bundle. Equipped gear is never auto-included.
        </p>
      </div>

      {!writesEnabled ? (
        <p className="rounded-md border border-[var(--amber)]/40 bg-[rgba(255,184,77,0.08)] px-3 py-2 text-xs text-[var(--amber)]">
          Writes are off (`MARKETPLACE_WRITES_ENABLED` / `MARKETPLACE_ENABLED`). Toggle flags to
          create demo listings.
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs">
          <span className="text-[var(--text-muted)]">Asset kind</span>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as "PET" | "EGG")}
            className="focus-ring mt-1 w-full rounded-md border border-[var(--stroke)] bg-[var(--bg-panel)] px-3 py-2 text-white"
          >
            <option value="PET">Hatched pet</option>
            <option value="EGG">Unopened egg</option>
          </select>
        </label>
        <label className="text-xs">
          <span className="text-[var(--text-muted)]">Asking price (SOL)</span>
          <input
            value={priceSol}
            onChange={(e) => setPriceSol(e.target.value)}
            className="focus-ring mt-1 w-full rounded-md border border-[var(--stroke)] bg-[var(--bg-panel)] px-3 py-2 text-white"
          />
        </label>
        <label className="text-xs sm:col-span-2">
          <span className="text-[var(--text-muted)]">Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="focus-ring mt-1 w-full rounded-md border border-[var(--stroke)] bg-[var(--bg-panel)] px-3 py-2 text-white"
          />
        </label>
      </div>

      {kind === "PET" ? (
        <fieldset className="space-y-2">
          <legend className="text-xs text-[var(--text-muted)]">Bundle choice</legend>
          <label className="flex items-center gap-2 text-sm text-white">
            <input
              type="radio"
              name="bundle"
              checked={bundleMode === "PET_ONLY"}
              onChange={() => setBundleMode("PET_ONLY")}
            />
            Pet only
          </label>
          <label className="flex items-center gap-2 text-sm text-white">
            <input
              type="radio"
              name="bundle"
              checked={bundleMode === "PET_PLUS_LOADOUT"}
              disabled={!bundleEnabled}
              onChange={() => setBundleMode("PET_PLUS_LOADOUT")}
            />
            Pet + selected loadout bundle
            {!bundleEnabled ? (
              <span className="text-[10px] text-[var(--amber)]">(flag off)</span>
            ) : null}
          </label>
          {bundleMode === "PET_PLUS_LOADOUT" ? (
            <div className="ml-6 space-y-1 text-sm text-[var(--text-muted)]">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeWeapon}
                  onChange={(e) => setIncludeWeapon(e.target.checked)}
                />
                Include Ember Talons (weapon)
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeArmor}
                  onChange={(e) => setIncludeArmor(e.target.checked)}
                />
                Include Ash Guard (chest)
              </label>
            </div>
          ) : null}
        </fieldset>
      ) : (
        <p className="text-xs text-[var(--amber)]">
          Egg listings disclose ranges only. Starter eggs cannot be listed (account-bound).
        </p>
      )}

      <MarketplaceSellerProceeds
        listingPriceLamports={solToLamports(priceSol || "0")}
        mode="listing"
      />

      <button
        type="button"
        disabled={!writesEnabled || busy}
        onClick={() => void submit()}
        className="btn-primary focus-ring disabled:opacity-40"
      >
        {busy ? "Listing…" : "Create listing"}
      </button>
      {message ? <p className="text-xs text-[var(--text-muted)]">{message}</p> : null}
    </section>
  );
}
