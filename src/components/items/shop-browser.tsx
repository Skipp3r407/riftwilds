"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import { playSfx } from "@/hooks/use-sfx";
import Link from "next/link";

type Props = {
  title: string;
  items: ShopCardData[];
};

export function ShopBrowser({ title, items }: Props) {
  const router = useRouter();
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
    <div className="shop-browser space-y-4">
      <header className="shop-merchant-frame panel relative overflow-hidden p-5 md:p-6">
        <div
          className="shop-merchant-frame__art pointer-events-none absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/assets/ui/wallpapers/shop.png)" }}
          aria-hidden
        />
        <div className="shop-merchant-frame__scrim pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative z-[1]">
        <p className="page-kicker">Merchant Hall · Card Shop</p>
        <h1 className="page-title mt-2">{title}</h1>
        <p className="page-lede">
          Named Credits items only — no paid mystery boxes or random power rolls. Credits settle
          the desk; Wallet SOL and In-game SOL stay optional.
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
          In-game SOL purchases active · never buys power
        </p>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
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
              <div className="shop-browser__aside-panel panel relative overflow-hidden p-4">
                <div
                  className="shop-browser__aside-wash pointer-events-none absolute inset-0"
                  aria-hidden
                />
                <div className="relative z-[1]">
                <h2 className="font-display text-lg text-white">{selected.name}</h2>
                <p className="mt-2 text-xs text-[var(--text-muted)]">{selected.description}</p>
                {selected.compatibleAnatomy?.length ? (
                  <p className="mt-2 text-[10px] text-[var(--cyan)]">
                    Compatible: {selected.compatibleAnatomy.join(", ")}
                  </p>
                ) : null}
                <div className="shop-browser__price-box mt-3 rounded-md border border-[rgba(61,231,255,0.25)] px-3 py-2">
                  <p className="font-display text-xl text-[var(--cyan)]">
                    {selected.price.credits.toLocaleString()} Credits
                  </p>
                  <p className="text-[10px] text-[var(--text-dim)]">
                    Optional · {lamportsToSolString(BigInt(selected.price.lamports))} SOL
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-primary focus-ring mt-3 w-full text-xs"
                  onClick={() => setPurchaseItem(selected)}
                >
                  Choose payment
                </button>
                </div>
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
          onEquipNow={(item) => {
            void (async () => {
              await fetch("/api/pets/live-companion/equipment/equip", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "equip", itemId: item.id }),
              });
              playSfx("pets.equip");
              router.push("/live-world");
            })();
          }}
          onClose={() => setPurchaseItem(null)}
        />
      ) : null}
    </div>
  );
}
