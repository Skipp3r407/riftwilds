"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { GameImage } from "@/components/assets/game-image";
import { RarityBadge } from "@/components/items/rarity-badge";
import { useDemoInventory } from "@/hooks/use-demo-inventory";
import type { DemoInventoryTab } from "@/lib/shop/demo-inventory";
import { cn } from "@/lib/utils/cn";

const TABS: DemoInventoryTab[] = [
  "All",
  "Weapons",
  "Armor",
  "Potions",
  "Abilities",
  "Materials",
  "Care",
  "Cosmetics",
  "Recovery",
  "Collectibles",
];

export function InventoryBrowser() {
  const [tab, setTab] = useState<DemoInventoryTab>("All");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const { rows, ready } = useDemoInventory();

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const tabOk = tab === "All" || r.tab === tab;
      const q = query.trim().toLowerCase();
      const qOk = !q || r.name.toLowerCase().includes(q) || r.id.includes(q);
      return tabOk && qOk;
    });
  }, [rows, tab, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "focus-ring rounded-md px-3 py-1.5 text-xs",
                tab === t
                  ? "bg-[var(--cyan)] text-black"
                  : "bg-[var(--bg-elevated)] text-[var(--text-muted)]",
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="rounded-md border border-[var(--stroke)] bg-[var(--bg-elevated)] px-3 py-1.5 text-sm text-white"
          />
          <button
            type="button"
            className="btn-secondary focus-ring text-xs"
            onClick={() => setView((v) => (v === "grid" ? "list" : "grid"))}
          >
            {view === "grid" ? "List" : "Grid"}
          </button>
        </div>
      </div>

      <p className="text-xs text-[var(--text-muted)]">
        {ready ? "Demo inventory (local)." : "Loading inventory…"} Server inventory syncs after
        Phase 2 wallet settlement.{" "}
        <Link href="/shop" className="text-[var(--cyan)] underline">
          Browse shop
        </Link>{" "}
        ·{" "}
        <Link href="/pets/demo-riftling/loadout" className="text-[var(--cyan)] underline">
          Pet loadout
        </Link>
      </p>

      {filtered.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">No items in this tab.</p>
      ) : view === "grid" ? (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <li key={r.id} className="panel p-4">
              <div className="flex gap-3">
                <div className="inventory-item-thumb">
                  <GameImage
                    src={r.iconPath}
                    alt=""
                    width={80}
                    height={80}
                    fallbackSrc={r.iconPath.replace(/\.png(\?.*)?$/, ".svg")}
                    showDevBadge={false}
                    unoptimized
                    className="inventory-item-thumb__img"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-white">{r.name}</h3>
                    <RarityBadge rarity={r.rarity} />
                  </div>
                  <p className="mt-1 text-[10px] text-[var(--text-muted)]">
                    ×{r.quantity} · {r.ownership} · {r.tradeability}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {["View", "Equip", "Use", "Favorite"].map((a) => (
                      <button
                        key={a}
                        type="button"
                        className="rounded border border-[var(--stroke)] bg-[var(--bg-elevated)] px-2 py-0.5 text-[10px] font-medium text-[var(--text)] hover:border-[var(--cyan)]/50 hover:text-white"
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="panel-soft divide-y divide-[var(--stroke)] overflow-hidden">
          {filtered.map((r) => (
            <li key={r.id} className="flex items-center gap-3 px-3 py-2">
              <div className="inventory-item-thumb inventory-item-thumb--sm">
                <GameImage
                  src={r.iconPath}
                  alt=""
                  width={40}
                  height={40}
                  fallbackSrc={r.iconPath.replace(/\.png(\?.*)?$/, ".svg")}
                  showDevBadge={false}
                  unoptimized
                  className="inventory-item-thumb__img"
                />
              </div>
              <span className="flex-1 text-sm text-white">{r.name}</span>
              <RarityBadge rarity={r.rarity} />
              <span className="text-xs text-[var(--text-muted)]">×{r.quantity}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
