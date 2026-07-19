"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { WishlistEntry } from "@/lib/marketplace/wishlist";
import type { MarketplaceListingView } from "@/lib/marketplace/types";
import { playSfx } from "@/hooks/use-sfx";

export function WishlistPanel() {
  const [entries, setEntries] = useState<WishlistEntry[]>([]);
  const [catalog, setCatalog] = useState<MarketplaceListingView[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [wishRes, listRes] = await Promise.all([
      fetch("/api/marketplace/wishlist?keeperId=demo-keeper"),
      fetch("/api/marketplace/listings?category=EQUIPMENT"),
    ]);
    const wish = await wishRes.json();
    const list = await listRes.json();
    setEntries(wish.entries ?? []);
    setCatalog((list.listings as MarketplaceListingView[] | undefined)?.slice(0, 8) ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const add = async (listingPublicId: string, kind: "wishlist" | "watchlist") => {
    playSfx("ui.click");
    const res = await fetch("/api/marketplace/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        keeperId: "demo-keeper",
        listingPublicId,
        kind,
        action: "add",
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error ?? "Failed");
      return;
    }
    setMsg(`Added to ${kind}`);
    setEntries(data.entries ?? []);
  };

  const remove = async (listingPublicId: string, kind: "wishlist" | "watchlist") => {
    playSfx("ui.click");
    const res = await fetch("/api/marketplace/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        keeperId: "demo-keeper",
        listingPublicId,
        kind,
        action: "remove",
      }),
    });
    const data = await res.json();
    setEntries(data.entries ?? []);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="panel space-y-3 p-5">
        <h2 className="font-display text-lg text-white">Add from demo catalog</h2>
        <ul className="space-y-2">
          {catalog.map((l) => (
            <li
              key={l.publicId}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--stroke)] px-3 py-2"
            >
              <span className="text-sm text-white">{l.title}</span>
              <span className="flex gap-1">
                <button
                  type="button"
                  className="btn-secondary focus-ring text-[10px]"
                  onClick={() => void add(l.publicId, "wishlist")}
                >
                  Wishlist
                </button>
                <button
                  type="button"
                  className="btn-secondary focus-ring text-[10px]"
                  onClick={() => void add(l.publicId, "watchlist")}
                >
                  Watch
                </button>
              </span>
            </li>
          ))}
        </ul>
        {msg ? <p className="text-xs text-[var(--amber)]">{msg}</p> : null}
      </section>

      <section className="panel space-y-3 p-5">
        <h2 className="font-display text-lg text-white">Saved</h2>
        {entries.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">Wishlist / watchlist empty.</p>
        ) : (
          <ul className="space-y-2">
            {entries.map((e) => (
              <li
                key={`${e.kind}-${e.listingPublicId}`}
                className="flex items-center justify-between gap-2 rounded-md border border-[var(--stroke)] px-3 py-2"
              >
                <div>
                  <p className="text-[10px] uppercase text-[var(--text-dim)]">{e.kind}</p>
                  <p className="text-sm text-white">{e.listingPublicId}</p>
                </div>
                <button
                  type="button"
                  className="text-xs text-[var(--coral)] underline"
                  onClick={() => void remove(e.listingPublicId, e.kind)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
        <Link href="/marketplace" className="text-xs text-[var(--cyan)] underline">
          Back to desk →
        </Link>
      </section>
    </div>
  );
}
