"use client";

import { GameImage } from "@/components/assets/game-image";
import { RarityBadge, RarityFrame } from "@/components/items/rarity-badge";
import { SupportsEconomyBadge } from "@/components/revenue/supports-economy-badge";
import { itemDisclosures } from "@/lib/items/disclosures";
import { cn } from "@/lib/utils/cn";
import type { ShopCardData } from "@/lib/items/shop-serialize";

export type { ShopCardData };

type Props = {
  item: ShopCardData;
  purchasesEnabled: boolean;
  onPurchase?: (id: string) => void;
  selected?: boolean;
  onSelect?: (id: string) => void;
};

export function ShopItemCard({
  item,
  purchasesEnabled,
  onPurchase,
  selected,
  onSelect,
}: Props) {
  return (
    <RarityFrame
      rarity={item.rarity}
      className={cn(
        "shop-item-card group h-full transition duration-300 ease-out will-change-transform",
        "hover:-translate-y-1.5 hover:brightness-[1.04]",
        selected && "shop-item-card--selected -translate-y-1",
      )}
    >
      <article
        className={cn(
          "relative flex h-full flex-col overflow-hidden p-4",
          selected && "ring-1 ring-[var(--cyan)]/80",
        )}
      >
        <div className="shop-item-card__wash pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative z-[1] flex flex-1 flex-col">
          <button
            type="button"
            className="focus-ring w-full text-left"
            onClick={() => onSelect?.(item.id)}
          >
            <div className="panel-inset relative mx-auto flex h-32 w-32 items-center justify-center overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.45)]">
              <div className="pointer-events-none absolute inset-0 surface-grid opacity-20" />
              <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(61,231,255,0.16),transparent_65%)] transition-opacity duration-300 group-hover:opacity-100"
                aria-hidden
              />
              <GameImage
                src={item.iconPath}
                alt=""
                width={120}
                height={120}
                className="relative object-contain drop-shadow-[0_0_22px_rgba(61,231,255,0.35)] transition duration-300 group-hover:scale-[1.06] group-hover:drop-shadow-[0_0_28px_rgba(255,184,77,0.35)]"
                fallbackSrc={item.iconPath.replace(/\.png(\?.*)?$/i, ".svg")}
                showDevBadge={false}
                unoptimized
              />
            </div>
            <div className="mt-3 flex items-start justify-between gap-2">
              <h3 className="font-display text-base text-white transition-colors group-hover:text-[var(--amber)]">
                {item.name}
              </h3>
              <RarityBadge rarity={item.rarity} />
            </div>
          </button>

          <div className="mt-2">
            <SupportsEconomyBadge />
          </div>

          <button
            type="button"
            className="focus-ring mt-1 w-full text-left"
            onClick={() => onSelect?.(item.id)}
          >
            <p className="text-[10px] uppercase tracking-wider text-[var(--cyan)]">
              {item.family}
              {item.affinity ? ` · ${item.affinity}` : ""}
            </p>
            <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-[var(--text-muted)]">
              {item.description}
            </p>
            {item.effect ? (
              <p className="mt-2 text-xs text-[var(--mint)]">{item.effect}</p>
            ) : null}
            {item.affixes.length > 0 ? (
              <p className="mt-2 text-[10px] text-[var(--amber)]">
                Affixes: {item.affixes.join(", ")}
              </p>
            ) : null}
            {item.stats ? (
              <p className="mt-2 text-[10px] text-[var(--text-muted)]">
                {Object.entries(item.stats)
                  .map(([k, v]) => `${k} ${v >= 0 ? "+" : ""}${v}`)
                  .join(" · ")}
              </p>
            ) : null}
            <div className="shop-item-card__price mt-4 rounded-md border border-[rgba(61,231,255,0.22)] px-3 py-2.5 shadow-[inset_0_0_24px_rgba(61,231,255,0.06)]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-dim)]">
                Price
              </p>
              <p className="font-display mt-0.5 text-2xl leading-none text-[var(--cyan)] drop-shadow-[0_0_12px_rgba(61,231,255,0.35)]">
                {item.price.credits.toLocaleString()}{" "}
                <span className="text-base text-[var(--cyan)]/90">Credits</span>
              </p>
              <p className="mt-1.5 text-[10px] text-[var(--text-muted)]">
                Optional wallet path · {item.price.sol} SOL
                {item.price.estimatedUsd != null
                  ? ` · ≈ $${item.price.estimatedUsd.toFixed(2)} USD`
                  : ""}
              </p>
              <p className="text-[10px] text-[var(--text-dim)]">{item.price.usdDisclaimer}</p>
              {item.supply === "LIMITED" ? (
                <p className="mt-1 text-[10px] text-[var(--amber)]">
                  Supply {item.remainingSupply ?? "—"}/{item.totalSupply ?? "—"}
                </p>
              ) : (
                <p className="mt-1 text-[10px] text-[var(--text-dim)]">Standard supply</p>
              )}
            </div>
          </button>

          <div className="mt-auto flex flex-wrap gap-2 pt-4">
            <button
              type="button"
              className="btn-secondary focus-ring flex-1 text-xs"
              onClick={() => onSelect?.(item.id)}
            >
              Preview
            </button>
            <button
              type="button"
              className="btn-primary focus-ring flex-1 text-xs"
              title="Credits checkout · optional SOL"
              onClick={() => onPurchase?.(item.id)}
            >
              Buy
            </button>
          </div>
          {!purchasesEnabled ? (
            <p className="mt-2 text-[9px] text-[var(--amber)]">
              Wallet SOL settlement gated — In-game SOL still available at checkout.
            </p>
          ) : null}
          <p className="mt-3 text-[9px] leading-snug text-[var(--text-muted)]">
            {itemDisclosures.shop}
          </p>
        </div>
      </article>
    </RarityFrame>
  );
}
