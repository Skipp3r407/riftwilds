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
    <RarityFrame rarity={item.rarity}>
      <article
        className={cn(
          "flex h-full flex-col p-4",
          selected && "ring-1 ring-[var(--cyan)]",
        )}
      >
        <button
          type="button"
          className="focus-ring text-left"
          onClick={() => onSelect?.(item.id)}
        >
          <div className="panel-inset relative mx-auto flex h-28 w-28 items-center justify-center overflow-hidden">
            <div className="pointer-events-none absolute inset-0 surface-grid opacity-25" />
            <GameImage
              src={item.iconPath}
              alt=""
              width={112}
              height={112}
              className="relative object-contain drop-shadow-[0_0_16px_rgba(61,231,255,0.2)]"
              fallbackSrc={item.iconPath.replace(/\.png(\?.*)?$/i, ".svg")}
              showDevBadge={false}
              unoptimized
            />
          </div>
          <div className="mt-3 flex items-start justify-between gap-2">
            <h3 className="font-display text-base text-white">{item.name}</h3>
            <RarityBadge rarity={item.rarity} />
          </div>
          <div className="mt-2">
            <SupportsEconomyBadge />
          </div>
          <p className="mt-1 text-[10px] uppercase tracking-wider text-[var(--cyan)]">
            {item.family}
            {item.affinity ? ` · ${item.affinity}` : ""}
          </p>
          <p className="mt-2 line-clamp-3 text-xs text-[var(--text-muted)]">
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
          <div className="mt-3">
            <p className="font-display text-lg text-white">{item.price.sol} SOL</p>
            <p className="text-[10px] text-[var(--text-muted)]">
              {item.price.estimatedUsd != null
                ? `≈ $${item.price.estimatedUsd.toFixed(2)} USD`
                : "USD estimate unavailable"}
            </p>
            <p className="text-[10px] text-[var(--text-muted)]">{item.price.usdDisclaimer}</p>
            {item.supply === "LIMITED" ? (
              <p className="mt-1 text-[10px] text-[var(--amber)]">
                Supply {item.remainingSupply ?? "—"}/{item.totalSupply ?? "—"}
              </p>
            ) : (
              <p className="mt-1 text-[10px] text-[var(--text-muted)]">Standard supply</p>
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
            title="Choose Wallet SOL or In-game SOL"
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
      </article>
    </RarityFrame>
  );
}
