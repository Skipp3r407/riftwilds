"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { GameImage } from "@/components/assets/game-image";
import { RarityBadge } from "@/components/items/rarity-badge";
import { useDemoInventory } from "@/hooks/use-demo-inventory";
import { getInventoryItemDef } from "@/lib/inventory/item-database";
import type { DemoInventoryTab } from "@/lib/shop/demo-inventory";
import { cn } from "@/lib/utils/cn";

const TABS: DemoInventoryTab[] = [
  "All",
  "Food",
  "Care",
  "Recovery",
  "Potions",
  "Tools",
  "Materials",
  "Quests",
  "Weapons",
  "Armor",
  "Abilities",
  "Cosmetics",
  "Collectibles",
];

type SortKey = "name" | "qty" | "rarity";

const RARITY_RANK: Record<string, number> = {
  COMMON: 0,
  UNCOMMON: 1,
  RARE: 2,
  EPIC: 3,
  LEGENDARY: 4,
  MYTHIC: 5,
  CELESTIAL: 6,
};

export function InventoryBrowser() {
  const [tab, setTab] = useState<DemoInventoryTab>("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("name");
  const [view, setView] = useState<"grid" | "list">("grid");
  const { rows, ready } = useDemoInventory();

  const filtered = useMemo(() => {
    const list = rows.filter((r) => {
      const tabOk = tab === "All" || r.tab === tab;
      const q = query.trim().toLowerCase();
      const def = getInventoryItemDef(r.id);
      const qOk =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.id.includes(q) ||
        (def?.category ?? "").includes(q) ||
        (def?.description ?? "").toLowerCase().includes(q);
      return tabOk && qOk;
    });
    return [...list].sort((a, b) => {
      if (sort === "qty") return b.quantity - a.quantity;
      if (sort === "rarity") {
        return (RARITY_RANK[b.rarity] ?? 0) - (RARITY_RANK[a.rarity] ?? 0);
      }
      return a.name.localeCompare(b.name);
    });
  }, [rows, tab, query, sort]);

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
        <div className="flex flex-wrap gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="rounded-md border border-[var(--stroke)] bg-[var(--bg-elevated)] px-3 py-1.5 text-sm text-white"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-md border border-[var(--stroke)] bg-[var(--bg-elevated)] px-2 py-1.5 text-xs text-white"
            aria-label="Sort inventory"
          >
            <option value="name">Sort: Name</option>
            <option value="qty">Sort: Stack size</option>
            <option value="rarity">Sort: Rarity</option>
          </select>
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
        {ready ? "Keeper inventory (local stacks)." : "Loading inventory…"} Food, care, and housing
        never enter Combat Decks.{" "}
        <Link href="/shop" className="text-[var(--cyan)] underline">
          Browse shop
        </Link>{" "}
        ·{" "}
        <Link href="/pets" className="text-[var(--cyan)] underline">
          Companion Care
        </Link>{" "}
        ·{" "}
        <Link href="/tcg/deck-builder" className="text-[var(--cyan)] underline">
          Deck Builder
        </Link>
      </p>

      {filtered.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">No items in this tab.</p>
      ) : view === "grid" ? (
        <div className="relative">
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.07]"
            aria-hidden
          >
            <GameImage
              src="/assets/ui/inventory/crest-watermark.png?v=inv2"
              alt=""
              width={280}
              height={280}
              showDevBadge={false}
              unoptimized
              className="max-h-[min(420px,55vw)] w-auto object-contain"
            />
          </div>
          <ul className="relative grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((r) => {
              const def = getInventoryItemDef(r.id);
              return (
                <li key={r.id} className="panel p-4" title={def?.description}>
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
                        ×{r.quantity} stack · {def?.category ?? r.tab} ·{" "}
                        {def?.useLocation === "companion_care"
                          ? "Companion Care / Inventory"
                          : def?.useLocation === "combat"
                            ? "Combat Deck / Battle"
                            : "Inventory"}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {(r.tab === "Food" || r.tab === "Care" || r.careHint
                          ? ["Feed / Use", "Favorite"]
                          : ["View", "Equip", "Use", "Favorite"]
                        ).map((a) => (
                          <Link
                            key={a}
                            href={
                              a.startsWith("Feed")
                                ? "/pets"
                                : a === "View"
                                  ? "/inventory"
                                  : "/pets"
                            }
                            className="rounded border border-[var(--stroke)] bg-[var(--bg-elevated)] px-2 py-0.5 text-[10px] font-medium text-[var(--text)] hover:border-[var(--cyan)]/50 hover:text-white"
                          >
                            {a}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <ul className="panel-soft divide-y divide-[var(--stroke)] overflow-hidden">
          {filtered.map((r) => {
            const def = getInventoryItemDef(r.id);
            return (
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
                <span className="text-[10px] text-[var(--text-muted)]">
                  {def?.category ?? r.tab}
                </span>
                <RarityBadge rarity={r.rarity} />
                <span className="text-xs text-[var(--text-muted)]">×{r.quantity}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
