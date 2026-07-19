"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button";
import { lamportsToSolString } from "@/lib/items/lamports";
import { cn } from "@/lib/utils/cn";

type WalletSnapshot = {
  connection: {
    optional: boolean;
    solWalletUxEnabled: boolean;
    siwsIdentityEnabled: boolean;
    connected: boolean;
    walletAddress: string | null;
    statusLabel: string;
  };
  network: string;
  collectibleCount: number;
  marketplaceStatus: string;
  mintingStatus: string;
  spendingLimits: { dailySol: string; weeklySol: string; perTxSol: string };
  pendingTransactions: { id: string; status: string; category: string; note: string }[];
  recentTransactions: {
    id: string;
    status: string;
    category: string;
    amount: string | null;
    note: string;
    createdAt: string;
  }[];
  security: {
    neverAskForSeedPhrase: boolean;
    productionPurchasesDisabled: boolean;
  };
  flags: Record<string, boolean>;
  note?: string;
};

type ChallengeState = {
  challengeId: string;
  message: string;
  expiresAt: string;
  purpose: string;
} | null;

const DEMO_USER = "demo-keeper";

export function WalletCenter() {
  const { publicKey, signMessage } = useWallet();
  const address = publicKey?.toBase58() ?? null;
  const [snapshot, setSnapshot] = useState<WalletSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<ChallengeState>(null);
  const [verifyMsg, setVerifyMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    const qs = new URLSearchParams({ userId: DEMO_USER });
    if (address) qs.set("wallet", address);
    const res = await fetch(`/api/economy/sol/wallet?${qs}`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to load wallet center");
      return;
    }
    setSnapshot(data);
  }, [address]);

  useEffect(() => {
    void load();
  }, [load]);

  const issueChallenge = async () => {
    if (!address) {
      setVerifyMsg("Connect a wallet first (optional identity).");
      return;
    }
    setBusy(true);
    setVerifyMsg(null);
    try {
      const res = await fetch("/api/economy/sol/wallet-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "issue",
          wallet: address,
          purpose: "wallet-center-ownership",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setVerifyMsg(data.error ?? data.message ?? "Challenge blocked");
        return;
      }
      setChallenge({
        challengeId: data.challengeId,
        message: data.message,
        expiresAt: data.expiresAt,
        purpose: data.purpose,
      });
      setVerifyMsg("Challenge issued — sign the nonce message to verify ownership.");
    } finally {
      setBusy(false);
    }
  };

  const verifyChallenge = async () => {
    if (!address || !challenge || !signMessage) {
      setVerifyMsg("Wallet adapter must support message signing.");
      return;
    }
    setBusy(true);
    setVerifyMsg(null);
    try {
      const encoded = new TextEncoder().encode(challenge.message);
      const signature = await signMessage(encoded);
      const signatureBase58 = (await import("bs58")).default.encode(signature);

      const res = await fetch("/api/economy/sol/wallet-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify",
          challengeId: challenge.challengeId,
          wallet: address,
          signatureBase58,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setVerifyMsg(data.error ?? data.message ?? "Verification failed");
        return;
      }
      setVerifyMsg(`Verified wallet ${data.wallet}`);
      setChallenge(null);
      void load();
    } catch (e) {
      setVerifyMsg(e instanceof Error ? e.message : "Sign rejected");
    } finally {
      setBusy(false);
    }
  };

  const status = snapshot?.connection.statusLabel ?? "loading";
  const solUx = snapshot?.connection.solWalletUxEnabled ?? false;

  return (
    <div className="space-y-6">
      <section className="panel space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-display text-xs uppercase tracking-[0.2em] text-[var(--cyan)]">
              Wallet Center
            </p>
            <h2 className="mt-1 font-display text-2xl text-white">Optional Solana link</h2>
            <p className="mt-2 max-w-xl text-sm text-[var(--text-muted)]">
              Connect for identity and future optional spends. Core play never requires SOL. We
              never ask for seed phrases or private keys.
            </p>
          </div>
          <WalletConnectButton />
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <span
            className={cn(
              "rounded-md border px-2.5 py-1",
              solUx
                ? "border-[var(--emerald)] text-[var(--emerald)]"
                : "border-[var(--amber)] text-[var(--amber)]",
            )}
          >
            SOL_WALLET: {solUx ? "on" : "disabled / coming soon"}
          </span>
          <span className="rounded-md border border-[var(--stroke)] px-2.5 py-1 text-white">
            Network: {snapshot?.network ?? "…"}
          </span>
          <span className="rounded-md border border-[var(--stroke)] px-2.5 py-1 text-[var(--text-muted)]">
            Status: {status}
          </span>
        </div>

        {address ? (
          <p className="font-mono text-sm text-white break-all">{address}</p>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">No wallet connected — play continues.</p>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy || !address}
            onClick={() => void issueChallenge()}
            className="btn-secondary focus-ring text-sm disabled:opacity-40"
          >
            Issue SIWS challenge
          </button>
          <button
            type="button"
            disabled={busy || !challenge}
            onClick={() => void verifyChallenge()}
            className="btn-primary focus-ring text-sm disabled:opacity-40"
          >
            Sign & verify
          </button>
          <Link href="/collectibles" className="btn-secondary focus-ring text-sm">
            Collectibles
          </Link>
        </div>
        {verifyMsg ? <p className="text-xs text-[var(--text-muted)]">{verifyMsg}</p> : null}
        {challenge ? (
          <p className="text-xs text-[var(--text-dim)]">
            Challenge expires {new Date(challenge.expiresAt).toLocaleString()} · purpose{" "}
            {challenge.purpose}
          </p>
        ) : null}
        {error ? <p className="text-sm text-[var(--coral)]">{error}</p> : null}
      </section>

      {snapshot ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Collectibles" value={String(snapshot.collectibleCount)} />
            <Stat label="Marketplace SOL" value={snapshot.marketplaceStatus} />
            <Stat label="Minting" value={snapshot.mintingStatus} />
            <Stat
              label="Per-tx limit"
              value={`${lamportsToSolString(BigInt(snapshot.spendingLimits.perTxSol))} SOL`}
            />
          </section>

          <section className="panel space-y-3 p-5">
            <h3 className="font-display text-lg text-white">Pending</h3>
            {snapshot.pendingTransactions.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">No pending SOL intents.</p>
            ) : (
              <ul className="space-y-2 text-sm text-[var(--text-muted)]">
                {snapshot.pendingTransactions.map((row) => (
                  <li key={row.id} className="border-b border-[var(--stroke)] pb-2">
                    <span className="text-white">{row.category}</span> · {row.status}
                    <br />
                    <span className="text-xs">{row.note}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="panel space-y-3 p-5">
            <h3 className="font-display text-lg text-white">History stub</h3>
            {snapshot.recentTransactions.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">
                No economy events yet. Soft purchase simulation will appear here.
              </p>
            ) : (
              <ul className="space-y-2 text-sm text-[var(--text-muted)]">
                {snapshot.recentTransactions.slice(0, 8).map((row) => (
                  <li key={row.id} className="border-b border-[var(--stroke)] pb-2">
                    <span className="text-white">{row.category}</span> · {row.status}
                    {row.amount ? ` · ${row.amount} lamports` : ""}
                    <br />
                    <span className="text-xs">{row.note}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="panel space-y-2 p-5 text-sm text-[var(--text-muted)]">
            <h3 className="font-display text-lg text-white">Security</h3>
            <ul className="list-disc space-y-1 pl-5">
              <li>Seed phrases: never requested ({String(snapshot.security.neverAskForSeedPhrase)})</li>
              <li>
                Production purchases disabled:{" "}
                {String(snapshot.security.productionPurchasesDisabled)}
              </li>
              <li>SOL_PURCHASES_ENABLED={String(snapshot.flags.SOL_PURCHASES_ENABLED)}</li>
              <li>Disconnect anytime via the wallet adapter menu.</li>
            </ul>
          </section>
        </>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel p-4">
      <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 font-display text-lg text-white">{value}</p>
    </div>
  );
}
