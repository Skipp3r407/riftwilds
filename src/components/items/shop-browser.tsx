"use client";

import { useMemo, useState } from "react";
import { ShopItemCard, type ShopCardData } from "@/components/items/shop-item-card";
import { ShopPurchasePanel } from "@/components/items/shop-purchase-panel";
import { PriceBreakdown } from "@/components/items/price-breakdown";
import { PurchaseAllocationBreakdown } from "@/components/revenue/purchase-allocation-breakdown";
import { quoteDirectPurchase } from "@/lib/items/pricing";
import { itemDisclosures } from "@/lib/items/disclosures";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { solToLamports, lamportsToSolString } from "@/lib/items/lamports";
import { useEarnedSol } from "@/hooks/use-earned-sol";
import { useDemoInventory } from "@/hooks/use-demo-inventory";
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button";
import Link from "next/link";

type Props = {
  title: string;
  items: ShopCardData[];
};

export function ShopBrowser({ title, items }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(items[0]?.id ?? null);
  const [purchaseItem, setPurchaseItem] = useState<ShopCardData | null>(null);
  const purchasesEnabled = featureFlagDefaults.SOL_ITEM_PURCHASES_ENABLED;
  const selected = items.find((i) => i.id === selectedId) ?? null;
  const earned = useEarnedSol();
  const inventory = useDemoInventory();

  const quote = useMemo(() => {
    if (!selected) return null;
    return quoteDirectPurchase({
      itemId: selected.id,
      rarity: selected.rarity,
      solUsdRate: 150,
    });
  }, [selected]);

  return (
    <div className="space-y-4">
      <header className="panel p-5 md:p-6">
        <p className="page-kicker">Riftwilds Shop</p>
        <h1 className="page-title mt-2">{title}</h1>
        <p className="page-lede">
          Direct purchases of named items only. No paid mystery boxes or random rarity rolls. Pay
          with Wallet SOL or In-game SOL.
        </p>
        <p className="mt-3 text-xs text-[var(--amber)]">{itemDisclosures.shop}</p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">{itemDisclosures.combat}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="panel-inset px-3 py-2 text-xs">
            In-game SOL:{" "}
            <span className="text-[var(--cyan)]">
              {earned.ready ? `${earned.solLabel} SOL` : "…"}
            </span>
          </div>
          <WalletConnectButton />
          <Link href="/shop" className="text-xs text-[var(--cyan)] underline">
            All shop sections
          </Link>
          <Link href="/inventory" className="text-xs text-[var(--cyan)] underline">
            Inventory
          </Link>
        </div>
        <p className="mt-2 text-[10px] text-[var(--text-muted)]">
          Wallet SOL settlement{" "}
          {purchasesEnabled && featureFlagDefaults.SOL_PURCHASES_ENABLED
            ? "shell enabled"
            : "gated (SOL_ITEM_PURCHASES_ENABLED / SOL_PURCHASES_ENABLED)"}
          {" · "}
          In-game SOL purchases active
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <li key={item.id}>
              <ShopItemCard
                item={item}
                purchasesEnabled={purchasesEnabled}
                selected={selectedId === item.id}
                onSelect={setSelectedId}
                onPurchase={(id) => {
                  const found = items.find((i) => i.id === id);
                  if (found) setPurchaseItem(found);
                }}
              />
            </li>
          ))}
        </ul>
        <aside className="space-y-3 lg:sticky lg:top-20 lg:self-start">
          {quote && selected ? (
            <>
              <div className="panel p-4">
                <h2 className="font-display text-lg text-white">{selected.name}</h2>
                <p className="mt-2 text-xs text-[var(--text-muted)]">{selected.description}</p>
                {selected.compatibleAnatomy?.length ? (
                  <p className="mt-2 text-[10px] text-[var(--cyan)]">
                    Compatible: {selected.compatibleAnatomy.join(", ")}
                  </p>
                ) : null}
                <button
                  type="button"
                  className="btn-primary focus-ring mt-3 w-full text-xs"
                  onClick={() => setPurchaseItem(selected)}
                >
                  Choose payment · {lamportsToSolString(BigInt(selected.price.lamports))} SOL
                </button>
              </div>
              <PriceBreakdown quote={quote} />
              {featureFlagDefaults.SHOP_REVENUE_SPLIT_ENABLED ? (
                <PurchaseAllocationBreakdown
                  grossLamports={solToLamports(selected.price.sol)}
                  transactionType="SHOP_PURCHASE"
                  showPaymentSummary={false}
                />
              ) : null}
              <p className="text-[10px] text-[var(--text-muted)]">
                PAID_RANDOM_REWARDS_ENABLED=
                {String(featureFlagDefaults.PAID_RANDOM_REWARDS_ENABLED)}
              </p>
            </>
          ) : null}
        </aside>
      </div>

      {purchaseItem ? (
        <ShopPurchasePanel
          item={purchaseItem}
          earnedLamports={earned.lamports}
          onEarnedBalanceChange={earned.setBalance}
          onGrantItem={(item) => {
            inventory.grantItem({
              id: item.id,
              name: item.name,
              family: item.family,
              rarity: item.rarity,
              iconPath: item.iconPath,
            });
          }}
          onClose={() => setPurchaseItem(null)}
        />
      ) : null}
    </div>
  );
}
