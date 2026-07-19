"use client";

import Image from "next/image";
import { PublicKey } from "@solana/web3.js";
import { useConnection } from "@solana/wallet-adapter-react";
import {
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import { SolPriceChip } from "@/components/shared/sol-price-chip";
import { TokenPriceChip } from "@/components/shared/token-price-chip";
import { useActiveWallet } from "@/hooks/use-active-wallet";
import { brandCoinIconPath } from "@/lib/assets/paths";
import { projectConfig } from "@/lib/config/project";
import {
  fetchCreditsBalance,
  getDemoCreditsUserId,
} from "@/lib/credits/client";
import { flushPendingQuestCredits } from "@/lib/credits/sync-pending";
import { lamportsToSolString } from "@/lib/items/lamports";
import { cn } from "@/lib/utils/cn";

const emptySubscribe = () => () => {};
const BALANCE_POLL_MS = 45_000;

type TokenBalancePayload = {
  balance?: {
    uiAmount: string;
    source?: string;
  };
  token?: { symbol?: string; mint?: string };
  error?: { message: string };
};

function displaySymbol(raw?: string): string {
  const fallback = projectConfig.TOKEN_SYMBOL.replace(/^\$/, "") || "RIFT";
  if (!raw) return fallback;
  return raw.replace(/^\$/, "").trim() || fallback;
}

function formatCompactSol(lamports: bigint): string {
  const label = lamportsToSolString(lamports);
  const [whole, frac = ""] = label.split(".");
  if (!frac) return whole;
  const trimmed = frac.slice(0, 4).replace(/0+$/, "");
  return trimmed ? `${whole}.${trimmed}` : whole;
}

function formatTokenAmount(uiAmount: string): string {
  const n = Number(uiAmount);
  if (!Number.isFinite(n)) return uiAmount;
  if (n === 0) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 10_000) return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (n >= 1) return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return n.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

const chipClass =
  "inline-flex max-w-[11rem] items-center gap-1.5 rounded-md border border-[var(--stroke)] bg-[rgba(22,22,37,0.72)] px-2 py-1 font-mono text-[11px] tabular-nums text-[var(--text)] sm:max-w-none";

function SolWalletBalanceChip({
  address,
  className,
}: {
  address: string;
  className?: string;
}) {
  const { connection } = useConnection();
  const [lamports, setLamports] = useState<bigint | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const bal = await connection.getBalance(new PublicKey(address), "confirmed");
      setLamports(BigInt(bal));
      setError(false);
    } catch {
      setError(true);
      setLamports(null);
    } finally {
      setLoading(false);
    }
  }, [address, connection]);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), BALANCE_POLL_MS);
    const onFocus = () => void load();
    const onVisibility = () => {
      if (document.visibilityState === "visible") void load();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [load]);

  const title =
    lamports != null
      ? `Wallet SOL · ${lamportsToSolString(lamports)} SOL on-chain`
      : error
        ? "Wallet SOL unavailable"
        : "Loading wallet SOL";

  return (
    <div
      className={cn(chipClass, className)}
      title={title}
      aria-live="polite"
      data-testid="header-sol-balance"
    >
      {loading && lamports == null && !error ? (
        <span className="text-[var(--text-muted)]">SOL …</span>
      ) : error || lamports == null ? (
        <span className="truncate text-[var(--amber)]">
          <span className="text-[var(--text-muted)]">SOL</span> …
        </span>
      ) : (
        <span className="truncate text-white">
          <span className="text-[var(--text-muted)]">SOL</span> {formatCompactSol(lamports)}
        </span>
      )}
    </div>
  );
}

function RiftTokenBalanceChip({
  address,
  className,
}: {
  address: string;
  className?: string;
}) {
  const [payload, setPayload] = useState<TokenBalancePayload | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/token/balance?wallet=${encodeURIComponent(address)}`, {
        cache: "no-store",
      });
      const data = (await res.json()) as TokenBalancePayload;
      setPayload(data);
    } catch {
      setPayload({ error: { message: "Token balance unavailable" } });
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), BALANCE_POLL_MS);
    const onFocus = () => void load();
    const onVisibility = () => {
      if (document.visibilityState === "visible") void load();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [load]);

  const symbol = displaySymbol(payload?.token?.symbol);
  const source = payload?.balance?.source;
  const uiAmount = payload?.balance?.uiAmount;
  const hasAmount = typeof uiAmount === "string";
  const display = hasAmount ? formatTokenAmount(uiAmount) : null;
  const fetchFailed = Boolean(payload?.error) && !hasAmount;
  // Prefer API source (env mint can override projectConfig.TOKEN_MINT_ADDRESS).
  const awaitingMint =
    source === "placeholder-mint" ||
    (!source &&
      !fetchFailed &&
      (!projectConfig.TOKEN_MINT_ADDRESS ||
        projectConfig.TOKEN_MINT_ADDRESS === "COMING_SOON"));

  const title = awaitingMint
    ? `${symbol} mint not live yet — showing 0 until TOKEN_MINT_ADDRESS is set`
    : fetchFailed
      ? `${symbol} balance unavailable`
      : `${symbol} wallet balance · ${uiAmount}`;

  return (
    <div
      className={cn(chipClass, className)}
      title={title}
      aria-live="polite"
      data-testid="header-rift-balance"
    >
      <Image
        src={brandCoinIconPath}
        alt=""
        width={14}
        height={14}
        unoptimized
        className="h-3.5 w-3.5 shrink-0"
      />
      {loading && !payload ? (
        <span className="text-[var(--text-muted)]">{symbol} …</span>
      ) : awaitingMint ? (
        <span className="truncate text-white">
          <span className="text-[var(--text-muted)]">{symbol}</span> 0
          <span className="ml-1 hidden text-[9px] uppercase tracking-wide text-[var(--amber)] xl:inline">
            mint soon
          </span>
        </span>
      ) : fetchFailed || display == null ? (
        <span className="truncate text-[var(--amber)]">
          <span className="text-[var(--text-muted)]">{symbol}</span> …
        </span>
      ) : (
        <span className="truncate text-white">
          <span className="text-[var(--text-muted)]">{symbol}</span> {display}
        </span>
      )}
    </div>
  );
}

function HeaderCreditsChip({ className }: { className?: string }) {
  const [balance, setBalance] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      await flushPendingQuestCredits();
      const res = await fetchCreditsBalance(getDemoCreditsUserId());
      if (res.ok) setBalance(res.balance);
    } catch {
      /* keep last known */
    }
  }, []);

  useEffect(() => {
    void load();
    const onCredits = () => void load();
    window.addEventListener("riftwilds-credits-updated", onCredits);
    window.addEventListener("focus", onCredits);
    return () => {
      window.removeEventListener("riftwilds-credits-updated", onCredits);
      window.removeEventListener("focus", onCredits);
    };
  }, [load]);

  return (
    <div
      className={cn(chipClass, className)}
      title="In-game Credits — soft currency, not SOL"
      aria-live="polite"
      data-testid="header-credits-balance"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/ui/credits/icon.png"
        alt=""
        width={14}
        height={14}
        className="h-3.5 w-3.5 shrink-0"
      />
      <span className="truncate text-white">
        <span className="text-[var(--text-muted)]">CR</span>{" "}
        {balance === null ? "…" : balance.toLocaleString()}
      </span>
    </div>
  );
}

function HeaderBalanceClusterLive() {
  const { connected, address } = useActiveWallet();

  if (!connected || !address) {
    return (
      <div className="hud-nav__tickers" aria-label="Market tickers">
        <SolPriceChip className="hud-nav__sol" />
        <TokenPriceChip className="hud-nav__token" />
      </div>
    );
  }

  return (
    <div className="hud-nav__tickers" aria-label="Wallet balances">
      <SolWalletBalanceChip address={address} className="hud-nav__sol" />
      <RiftTokenBalanceChip address={address} className="hud-nav__token" />
      <HeaderCreditsChip className="hud-nav__credits" />
    </div>
  );
}

/**
 * Header right-rail balances: market tickers when disconnected;
 * on-chain SOL + RIFT wallet balances + in-game Credits when connected
 * (adapter or view-only paste).
 */
export function HeaderBalanceCluster() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  if (!mounted) {
    return (
      <div className="hud-nav__tickers" aria-label="Market tickers">
        <SolPriceChip className="hud-nav__sol" />
        <TokenPriceChip className="hud-nav__token" />
      </div>
    );
  }
  return <HeaderBalanceClusterLive />;
}
