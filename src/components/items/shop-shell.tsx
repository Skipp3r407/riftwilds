"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { ShopItemCard, type ShopCardData } from "@/components/items/shop-item-card";
import { ShopPurchasePanel } from "@/components/items/shop-purchase-panel";
import { InventoryBrowser } from "@/components/items/inventory-browser";
import { PriceBreakdown } from "@/components/items/price-breakdown";
import { PurchaseAllocationBreakdown } from "@/components/revenue/purchase-allocation-breakdown";
import { quoteDirectPurchase } from "@/lib/items/pricing";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { solToLamports, lamportsToSolString } from "@/lib/items/lamports";
import {
  SHOP_SECTIONS,
  type ShopSectionDef,
  type ShopSectionId,
} from "@/lib/shop/sections";
import { useEarnedSol } from "@/hooks/use-earned-sol";
import { useDemoInventory } from "@/hooks/use-demo-inventory";
import { useActiveWallet } from "@/hooks/use-active-wallet";
import { playSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils/cn";
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button";

type SectionPayload = {
  section: ShopSectionDef;
  items: ShopCardData[];
};

type Props = {
  sections: SectionPayload[];
  catalogSummary: string;
};

type MainTab = "shop" | "featured" | "inventory";

export function ShopShell({ sections, catalogSummary }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<MainTab>("shop");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [purchaseItem, setPurchaseItem] = useState<ShopCardData | null>(null);
  const [activeSection, setActiveSection] = useState<ShopSectionId>("featured");
  const earned = useEarnedSol();
  const inventory = useDemoInventory();
  const { address, connected, viewOnly, canSign } = useActiveWallet();
  const { connection } = useConnection();
  const [walletLamports, setWalletLamports] = useState<bigint | null>(null);

  const purchasesFlag = featureFlagDefaults.SOL_ITEM_PURCHASES_ENABLED;
  const solPurchasesFlag = featureFlagDefaults.SOL_PURCHASES_ENABLED;

  const allItems = useMemo(
    () => sections.flatMap((s) => s.items),
    [sections],
  );

  const selected =
    allItems.find((i) => i.id === selectedId) ??
    sections[0]?.items[0] ??
    null;

  const quote = useMemo(() => {
    if (!selected) return null;
    return quoteDirectPurchase({
      itemId: selected.id,
      rarity: selected.rarity,
      solUsdRate: 150,
    });
  }, [selected]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!address) {
        setWalletLamports(null);
        return;
      }
      try {
        const bal = await connection.getBalance(new PublicKey(address), "confirmed");
        if (!cancelled) setWalletLamports(BigInt(bal));
      } catch {
        if (!cancelled) setWalletLamports(null);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [connection, address]);

  function openPurchase(id: string) {
    const item = allItems.find((i) => i.id === id);
    if (item) {
      setSelectedId(id);
      setPurchaseItem(item);
    }
  }

  const featuredSection = sections.find((s) => s.section.id === "featured");
  const browseSections = sections.filter((s) => s.section.id !== "featured");

  return (
    <div className="shop-shell space-y-5">
      <p className="text-xs text-[var(--text-muted)]">{catalogSummary}</p>

      <div className="panel relative overflow-hidden px-4 py-3">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_10%_0%,rgba(255,184,77,0.12),transparent_45%),radial-gradient(ellipse_at_90%_100%,rgba(61,231,255,0.08),transparent_40%)]"
          aria-hidden
        />
        <div className="relative z-[1] flex flex-wrap items-center gap-3">
          <BalanceChip
            label="In-game SOL"
            value={earned.ready ? `${earned.solLabel} SOL` : "…"}
            tone="cyan"
          />
          <BalanceChip
            label="Wallet SOL"
            value={
              !connected
                ? "Not connected"
                : walletLamports != null
                  ? `${lamportsToSolString(walletLamports)} SOL${viewOnly ? " · view-only" : ""}`
                  : "…"
            }
            tone="amber"
          />
          {viewOnly && !canSign ? (
            <span className="text-[10px] text-[var(--amber)]">
              View-only — connect a wallet to pay with SOL
            </span>
          ) : null}
          <button
            type="button"
            className="btn-secondary focus-ring text-xs"
            onClick={() => {
              earned.claimPlayReward();
              playSfx("rewards.claim");
            }}
            title="Demo play reward credited to In-game SOL"
          >
            Claim +{earned.playRewardSol} play reward
          </button>
          <div className="ml-auto">
            <WalletConnectButton />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["shop", "Shop"],
            ["featured", "Featured"],
            ["inventory", "Inventory"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              playSfx("ui.nav");
              setTab(id);
            }}
            className={cn(
              "focus-ring rounded-md px-4 py-2 text-sm font-medium transition",
              tab === id
                ? "bg-[var(--cyan)] text-black shadow-[0_0_20px_rgba(61,231,255,0.35)]"
                : "bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-white",
            )}
          >
            {label}
          </button>
        ))}
        <span className="self-center text-[10px] text-[var(--text-muted)]">
          Credits settle the hall · Wallet SOL{" "}
          {purchasesFlag && solPurchasesFlag ? "shell on" : "gated off"} · never buys power
        </span>
      </div>

      {tab === "inventory" ? (
        <section className="space-y-3">
          <h2 className="font-display text-xl text-white">Your inventory</h2>
          <p className="text-xs text-[var(--text-muted)]">
            Owned items from starters and shop purchases (local demo pack).
          </p>
          <InventoryBrowser />
        </section>
      ) : null}

      {tab === "featured" && featuredSection ? (
        <MerchantHallFrame>
          <ShopSectionBlock
            section={featuredSection.section}
            items={featuredSection.items}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onPurchase={openPurchase}
            purchasesEnabled
            featured
          />
        </MerchantHallFrame>
      ) : null}

      {tab === "shop" ? (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-7">
            <nav className="panel sticky top-16 z-10 overflow-hidden px-3 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[rgba(255,140,60,0.1)] via-transparent to-[rgba(61,231,255,0.08)]"
                aria-hidden
              />
              <p className="relative z-[1] mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--amber)]">
                Hall categories
              </p>
              <div className="relative z-[1] flex flex-wrap gap-1.5">
                {SHOP_SECTIONS.filter((s) => !s.demoted).map((s) => (
                  <a
                    key={s.id}
                    href={`#shop-${s.id}`}
                    onClick={() => setActiveSection(s.id)}
                    className={cn(
                      "focus-ring rounded-md border px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition",
                      activeSection === s.id
                        ? "border-[rgba(61,231,255,0.55)] bg-[rgba(61,231,255,0.18)] text-[var(--cyan)] shadow-[0_0_16px_rgba(61,231,255,0.2)]"
                        : "border-transparent text-[var(--text-muted)] hover:border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.04)] hover:text-white",
                    )}
                  >
                    {s.label}
                  </a>
                ))}
                <span className="self-center px-1 text-[10px] text-[var(--text-dim)]">·</span>
                {SHOP_SECTIONS.filter((s) => s.demoted).map((s) => (
                  <a
                    key={s.id}
                    href={`#shop-${s.id}`}
                    onClick={() => setActiveSection(s.id)}
                    className={cn(
                      "focus-ring rounded-md border px-2 py-1 text-[10px] uppercase tracking-wide transition",
                      activeSection === s.id
                        ? "border-[rgba(61,231,255,0.35)] bg-[rgba(61,231,255,0.1)] text-[var(--cyan)]"
                        : "border-transparent text-[var(--text-dim)] hover:text-[var(--text-muted)]",
                    )}
                    title="Live World / companion goods — secondary to Rift Battles"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </nav>

            {featuredSection ? (
              <MerchantHallFrame>
                <ShopSectionBlock
                  section={featuredSection.section}
                  items={featuredSection.items}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  onPurchase={openPurchase}
                  purchasesEnabled
                  featured
                />
              </MerchantHallFrame>
            ) : null}

            {browseSections
              .filter(({ section }) => !section.demoted)
              .map(({ section, items }) => (
                <ShopSectionBlock
                  key={section.id}
                  section={section}
                  items={items}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  onPurchase={openPurchase}
                  purchasesEnabled
                />
              ))}

            <details className="panel p-4">
              <summary className="cursor-pointer font-display text-lg text-[var(--text-muted)]">
                Live World & companion goods
              </summary>
              <p className="mt-1 text-xs text-[var(--text-dim)]">
                Weapons, armor, potions, and scrolls are soft-secondary — they do not buy Rift
                Battle power.
              </p>
              <div className="mt-4 space-y-8">
                {browseSections
                  .filter(({ section }) => section.demoted)
                  .map(({ section, items }) => (
                    <ShopSectionBlock
                      key={section.id}
                      section={section}
                      items={items}
                      selectedId={selectedId}
                      onSelect={setSelectedId}
                      onPurchase={openPurchase}
                      purchasesEnabled
                    />
                  ))}
              </div>
            </details>
          </div>

          <aside className="space-y-3 lg:sticky lg:top-20 lg:self-start">
            {quote && selected ? (
              <>
                <div className="shop-shell__aside-panel panel relative overflow-hidden p-4">
                  <div
                    className="shop-shell__aside-wash pointer-events-none absolute inset-0"
                    aria-hidden
                  />
                  <div className="relative z-[1]">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--amber)]">
                      Selected
                    </p>
                    <h2 className="font-display mt-1 text-lg text-white">{selected.name}</h2>
                    <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">
                      {selected.description}
                    </p>
                    <div className="shop-shell__price-box mt-3 rounded-md border border-[rgba(61,231,255,0.25)] px-3 py-2">
                      <p className="font-display text-xl text-[var(--cyan)]">
                        {selected.price.credits.toLocaleString()} Credits
                      </p>
                      <p className="text-[10px] text-[var(--text-dim)]">
                        Optional · {selected.price.sol} SOL
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn-primary focus-ring mt-3 w-full text-xs"
                      onClick={() => openPurchase(selected.id)}
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
              </>
            ) : (
              <div className="panel p-4 text-xs text-[var(--text-muted)]">
                Select an item to preview price and checkout options.
              </div>
            )}
          </aside>
        </div>
      ) : null}

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

function MerchantHallFrame({ children }: { children: ReactNode }) {
  return (
    <div className="shop-merchant-frame panel relative overflow-hidden border-[rgba(255,184,77,0.22)] p-4 shadow-[0_0_48px_rgba(255,140,60,0.08)] md:p-5">
      <div
        className="shop-merchant-frame__art pointer-events-none absolute inset-0 bg-cover bg-[center_30%]"
        style={{ backgroundImage: "url(/assets/ui/wallpapers/shop.png)" }}
        aria-hidden
      />
      <div className="shop-merchant-frame__scrim pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_25%_15%,rgba(255,150,70,0.14),transparent_48%),radial-gradient(ellipse_at_85%_70%,rgba(61,231,255,0.1),transparent_42%)]"
        aria-hidden
      />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}

function BalanceChip(props: {
  label: string;
  value: string;
  tone: "cyan" | "amber";
}) {
  return (
    <div className="panel-inset px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
        {props.label}
      </p>
      <p
        className={cn(
          "font-display text-sm",
          props.tone === "cyan" ? "text-[var(--cyan)]" : "text-[var(--amber)]",
        )}
      >
        {props.value}
      </p>
    </div>
  );
}

function ShopSectionBlock(props: {
  section: ShopSectionDef;
  items: ShopCardData[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onPurchase: (id: string) => void;
  purchasesEnabled: boolean;
  featured?: boolean;
}) {
  const { section, items, featured } = props;
  return (
    <section id={`shop-${section.id}`} className="scroll-mt-28 space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          {featured ? (
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--amber)]">
              Merchant picks
            </p>
          ) : null}
          <h2
            className={cn(
              "font-display text-white",
              featured ? "text-3xl" : "text-2xl",
            )}
          >
            {section.label}
          </h2>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-[var(--text-muted)]">
            {section.description}
          </p>
        </div>
        <Link href={section.href} className="text-xs text-[var(--cyan)] underline">
          Open {section.label.toLowerCase()} page
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">No items in this section yet.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <li key={`${section.id}-${item.id}`}>
              <ShopItemCard
                item={item}
                purchasesEnabled={props.purchasesEnabled}
                selected={props.selectedId === item.id}
                onSelect={props.onSelect}
                onPurchase={props.onPurchase}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
