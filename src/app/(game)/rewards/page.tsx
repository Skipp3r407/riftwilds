"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PageHeader, StatusChip } from "@/components/shared/page-header";
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button";
import { useActiveWallet } from "@/hooks/use-active-wallet";
import { rewardSourceArtPath } from "@/lib/assets/paths";
import type { RewardCenterDashboard } from "@/lib/ecosystem/reward-center";

export default function RewardsPage() {
  const { address, viewOnly } = useActiveWallet();
  const [center, setCenter] = useState<RewardCenterDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = address ? `?wallet=${address}` : "";
    setLoading(true);
    void fetch(`/api/rewards/center${q}`)
      .then((r) => r.json())
      .then((json: { center?: RewardCenterDashboard }) => setCenter(json.center ?? null))
      .catch(() => setCenter(null))
      .finally(() => setLoading(false));
  }, [address]);

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Community treasury"
        titleSlug="rewards"
        title="Reward Center"
        description="Pending, claimable, and lifetime rewards from verified game revenue and marketplace fees — including card/pack trades. Not from buying the launch coin. Play path stays Credits + Rift Battles."
        status={center?.claimsEnabled ? "Claims armed" : "Claims off"}
        statusTone={center?.claimsEnabled ? "warn" : "info"}
        actions={
          <>
            <Link href="/tcg/battle" className="btn-primary focus-ring text-sm">
              Earn via battles
            </Link>
            <Link href="/loyalty" className="btn-secondary focus-ring text-sm">
              Loyalty / Rift Storm
            </Link>
            <Link href="/treasury" className="btn-secondary focus-ring text-sm">
              Treasury
            </Link>
            <WalletConnectButton />
          </>
        }
      />

      {center ? (
        <section className="panel space-y-2 p-5">
          <p className="text-sm text-[var(--amber)]">{center.framing}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-xs text-[var(--text-muted)]">Claimable</p>
              <p className="font-display text-xl text-white">
                {center.wallet.claimableLamports ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Lifetime claimed</p>
              <p className="font-display text-xl text-white">
                {center.wallet.lifetimeClaimedLamports ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Epoch</p>
              <p className="font-display text-xl text-white">
                {center.epoch ? `#${center.epoch.epochNumber} · ${center.epoch.status}` : "—"}
              </p>
            </div>
          </div>
          {!center.wallet.connected ? (
            <p className="mt-2 text-xs text-[var(--text-muted)]">
              Connect a wallet or paste an address to see claimable vault balances. Soft play does
              not require a wallet.
            </p>
          ) : viewOnly ? (
            <p className="mt-2 text-xs text-[var(--amber)]">
              View-only — lookups only. Claiming still requires a signed wallet session.
            </p>
          ) : null}
        </section>
      ) : null}

      {loading ? (
        <p className="text-sm text-[var(--text-muted)]">Loading…</p>
      ) : center ? (
        <>
          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {center.sources.map((s) => (
              <article key={s.kind} className="panel group flex flex-col overflow-hidden">
                <div className="section-card-thumb border-b border-[rgba(61,231,255,0.12)]">
                  <Image
                    src={rewardSourceArtPath(s.imageSlug)}
                    alt={s.label}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="section-card-thumb__img"
                    unoptimized
                  />
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-display text-lg text-white">{s.label}</h2>
                    <StatusChip tone={s.available ? "info" : "default"}>
                      {s.available ? "wired" : "stub"}
                    </StatusChip>
                  </div>
                  <p className="mt-2 text-xs text-[var(--text-muted)]">{s.description}</p>
                  <ul className="mt-3 space-y-1 text-xs text-[var(--text-dim)]">
                    <li className="flex justify-between gap-2">
                      <span>Pending</span>
                      <span className="text-white">{s.pendingLabel}</span>
                    </li>
                    <li className="flex justify-between gap-2">
                      <span>Claimable</span>
                      <span className="text-white">{s.claimableLabel}</span>
                    </li>
                    <li className="flex justify-between gap-2">
                      <span>Lifetime</span>
                      <span className="text-white">{s.lifetimeLabel}</span>
                    </li>
                  </ul>
                </div>
              </article>
            ))}
          </section>

          <section className="panel space-y-2 p-5 text-xs text-[var(--text-muted)]">
            {center.disclaimers.map((d) => (
              <p key={d}>{d}</p>
            ))}
            <p>
              Community activity snapshot — eggs hatched:{" "}
              {center.communityActivity.eggsHatched}, marketplace trades:{" "}
              {center.communityActivity.marketplaceTrades}.
            </p>
          </section>
        </>
      ) : (
        <p className="text-sm text-[var(--text-muted)]">Reward center unavailable.</p>
      )}
    </div>
  );
}
