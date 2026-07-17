"use client";

import { useEffect, useMemo, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import type { ShopCardData } from "@/lib/items/shop-serialize";
import { itemDisclosures } from "@/lib/items/disclosures";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { lamportsToSolString } from "@/lib/items/lamports";
import {
  evaluateInGameSolPurchase,
  evaluateWalletSolPurchase,
  resolveShopPurchase,
  type ShopPaymentMethod,
} from "@/lib/shop/purchase";
import { playSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils/cn";

function useModalSfx() {
  useEffect(() => {
    playSfx("ui.modal_open");
    return () => {
      playSfx("ui.modal_close");
    };
  }, []);
}

type Props = {
  item: ShopCardData;
  earnedLamports: bigint;
  onEarnedBalanceChange: (next: bigint) => void;
  onGrantItem: (item: ShopCardData) => void;
  onClose: () => void;
};

export function ShopPurchasePanel({
  item,
  earnedLamports,
  onEarnedBalanceChange,
  onGrantItem,
  onClose,
}: Props) {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const { setVisible } = useWalletModal();
  const [walletLamports, setWalletLamports] = useState<bigint | null>(null);
  const [method, setMethod] = useState<ShopPaymentMethod>("IN_GAME_SOL");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  useModalSfx();

  const priceLamports = useMemo(() => BigInt(item.price.lamports), [item.price.lamports]);

  const walletGate = useMemo(
    () => ({
      walletConnected: connected,
      walletBalanceLamports: walletLamports,
      solItemPurchasesEnabled: featureFlagDefaults.SOL_ITEM_PURCHASES_ENABLED,
      solPurchasesEnabled: featureFlagDefaults.SOL_PURCHASES_ENABLED,
    }),
    [connected, walletLamports],
  );

  const walletEval = evaluateWalletSolPurchase(walletGate, priceLamports);
  const inGameEval = evaluateInGameSolPurchase(earnedLamports, priceLamports);

  useEffect(() => {
    let cancelled = false;
    async function loadBalance() {
      if (!publicKey) {
        setWalletLamports(null);
        return;
      }
      try {
        const bal = await connection.getBalance(publicKey, "confirmed");
        if (!cancelled) setWalletLamports(BigInt(bal));
      } catch {
        if (!cancelled) setWalletLamports(null);
      }
    }
    void loadBalance();
    return () => {
      cancelled = true;
    };
  }, [connection, publicKey]);

  async function confirmPurchase() {
    setBusy(true);
    setStatus(null);
    playSfx("ui.click");
    const result = resolveShopPurchase({
      method,
      priceLamports,
      earnedLamports,
      wallet: walletGate,
    });
    if (!result.ok) {
      playSfx("shop.purchase_fail");
      setStatus(result.reason);
      setBusy(false);
      return;
    }
    if (result.method === "IN_GAME_SOL" && result.nextEarnedLamports != null) {
      onEarnedBalanceChange(result.nextEarnedLamports);
    }
    onGrantItem(item);
    playSfx("shop.purchase_ok");
    setStatus(result.message);
    setBusy(false);
  }

  const selectedDisabled =
    method === "IN_GAME_SOL" ? !inGameEval.ok : !walletEval.ok;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shop-purchase-title"
      onClick={onClose}
    >
      <div
        className="panel max-h-[90vh] w-full max-w-md overflow-y-auto p-5 shadow-[0_0_40px_rgba(61,231,255,0.15)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="page-kicker">Checkout</p>
            <h2 id="shop-purchase-title" className="font-display text-xl text-white">
              {item.name}
            </h2>
            <p className="mt-1 font-display text-lg text-[var(--cyan)]">
              {item.price.sol} SOL
            </p>
          </div>
          <button type="button" className="btn-secondary focus-ring text-xs" onClick={onClose}>
            Close
          </button>
        </div>

        <p className="mt-3 text-xs text-[var(--text-muted)]">{item.description}</p>

        <div className="mt-4 grid gap-2">
          <PaymentOption
            active={method === "IN_GAME_SOL"}
            title="Pay with In-game SOL"
            subtitle={`Earned / playable balance · ${lamportsToSolString(earnedLamports)} SOL available`}
            disabled={!inGameEval.ok}
            hint={!inGameEval.ok ? inGameEval.reason : "Settles instantly from your playable balance."}
            onClick={() => setMethod("IN_GAME_SOL")}
          />
          <PaymentOption
            active={method === "WALLET_SOL"}
            title="Pay with Wallet SOL"
            subtitle={
              connected
                ? walletLamports != null
                  ? `Connected · ${lamportsToSolString(walletLamports)} SOL`
                  : "Connected · balance unavailable"
                : "Wallet not connected"
            }
            disabled={false}
            hint={
              !walletEval.ok
                ? walletEval.reason
                : "Flags allow checkout shell — on-chain transfer still Phase 2."
            }
            onClick={() => setMethod("WALLET_SOL")}
          />
        </div>

        {!connected && method === "WALLET_SOL" ? (
          <button
            type="button"
            className="btn-secondary focus-ring mt-3 w-full text-xs"
            onClick={() => setVisible(true)}
          >
            Connect wallet
          </button>
        ) : null}

        <button
          type="button"
          className="btn-primary focus-ring mt-4 w-full text-sm disabled:opacity-40"
          disabled={busy || selectedDisabled}
          onClick={() => void confirmPurchase()}
        >
          {busy
            ? "Processing…"
            : method === "IN_GAME_SOL"
              ? "Confirm In-game SOL purchase"
              : "Confirm Wallet SOL purchase"}
        </button>

        {status ? (
          <p
            className={cn(
              "mt-3 text-xs",
              status.toLowerCase().includes("insufficient") ||
                status.toLowerCase().includes("gated") ||
                status.toLowerCase().includes("connect")
                ? "text-[var(--amber)]"
                : "text-[var(--mint)]",
            )}
          >
            {status}
          </p>
        ) : null}

        <p className="mt-4 text-[9px] leading-snug text-[var(--text-muted)]">
          {itemDisclosures.shop} {itemDisclosures.sol}
        </p>
      </div>
    </div>
  );
}

function PaymentOption(props: {
  active: boolean;
  title: string;
  subtitle: string;
  hint: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={cn(
        "focus-ring rounded-lg border px-3 py-3 text-left transition",
        props.active
          ? "border-[var(--cyan)] bg-[rgba(61,231,255,0.08)]"
          : "border-[rgba(61,231,255,0.15)] bg-[var(--bg-elevated)]",
        props.disabled && !props.active && "opacity-60",
      )}
    >
      <p className="text-sm font-medium text-white">{props.title}</p>
      <p className="mt-0.5 text-[11px] text-[var(--cyan)]">{props.subtitle}</p>
      <p className="mt-1 text-[10px] text-[var(--text-muted)]">{props.hint}</p>
    </button>
  );
}
