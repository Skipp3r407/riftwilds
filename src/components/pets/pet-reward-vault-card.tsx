"use client";

import { useEffect, useMemo, useState } from "react";
import { usePetRewardVault } from "@/hooks/use-pet-reward-vault";
import { RewardFundingFeed } from "@/components/pets/reward-funding-feed";
import { RewardAnalyticsPanel } from "@/components/pets/reward-analytics-panel";
import { cn } from "@/lib/utils/cn";

type Props = {
  publicPetId: string;
  /** Optional callback so portrait aura can mirror vault state. */
  onAuraState?: (state: {
    pendingIntensity: number;
    status: "active" | "inactive";
    accumulating: boolean;
    largeDepositPulse: boolean;
    celebration: string | null;
  }) => void;
};

function formatCountdown(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}h ${m}m ${sec}s`;
}

function inactiveExplainer(labels: string[]): string {
  if (!labels.length) {
    return "This Riftling is not accumulating a community treasury share right now.";
  }
  const primary = labels[0];
  if (labels.length === 1) {
    return `${primary} — so this Riftling is not accumulating a treasury share right now.`;
  }
  return `${primary} (and ${labels.length - 1} other reason${labels.length > 2 ? "s" : ""}) — so this Riftling is not accumulating a treasury share right now.`;
}

export function PetRewardVaultCard({ publicPetId, onAuraState }: Props) {
  const { vault, display, loading, error, connected, claim, toggleSelection } =
    usePetRewardVault(publicPetId);
  const [claimBusy, setClaimBusy] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!vault) return;
    setCountdown(vault.nextDistributionSeconds);
    const id = setInterval(() => {
      setCountdown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [vault?.nextDistributionAt, vault?.nextDistributionSeconds]);

  const pendingIntensity = useMemo(() => {
    if (!vault?.walletEstimatesVisible) return 0;
    try {
      const lamports = BigInt(display.estimatedPendingLamports || "0");
      const ratio = Number(lamports) / 1e8;
      return Math.min(1, ratio);
    } catch {
      return 0;
    }
  }, [vault?.walletEstimatesVisible, display.estimatedPendingLamports]);

  useEffect(() => {
    if (!vault || !onAuraState) return;
    let pendingPositive = false;
    try {
      pendingPositive = BigInt(display.estimatedPendingLamports || "0") > 0n;
    } catch {
      pendingPositive = false;
    }
    onAuraState({
      pendingIntensity,
      status: vault.status,
      accumulating:
        vault.status === "active" && vault.walletEstimatesVisible && pendingPositive,
      largeDepositPulse: display.largeDepositPulse,
      celebration: display.celebration,
    });
  }, [
    vault,
    pendingIntensity,
    display.estimatedPendingLamports,
    display.largeDepositPulse,
    display.celebration,
    onAuraState,
  ]);

  if (loading) {
    return (
      <section className="panel p-5 text-sm text-[var(--text-muted)]" aria-busy="true">
        Loading community rewards…
      </section>
    );
  }

  if (error && !vault) {
    return (
      <section className="panel p-5 text-sm text-[var(--coral)]">
        Community rewards unavailable: {error}
      </section>
    );
  }

  if (!vault) return null;

  const inactive = vault.status === "inactive";
  const estimatedColor = inactive ? "text-[var(--text-muted)]" : "text-[var(--cyan)]";
  const claimableColor = inactive ? "text-[var(--text-muted)]" : "text-[var(--emerald)]";

  const onClaim = async () => {
    setClaimBusy(true);
    await claim();
    setClaimBusy(false);
  };

  const activity = vault.communityActivity;

  return (
    <section
      className={cn(
        "panel space-y-4 p-5 sm:p-6",
        inactive && "border-[var(--stroke)] bg-[rgba(40,42,54,0.55)]",
      )}
      aria-labelledby="pet-reward-vault-title"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-[10px] uppercase tracking-[0.22em] text-[var(--cyan)]">
            Community rewards
          </p>
          <h2 id="pet-reward-vault-title" className="font-display mt-1 text-xl text-white">
            Treasury share
          </h2>
          <p className="mt-1 max-w-xl text-sm text-[var(--text-muted)]">
            Eligible Riftlings can earn a share of verified Community Reward Treasury deposits —
            not automatic SOL from buying the coin.
          </p>
        </div>
        <div className="text-right text-xs">
          <p
            className={cn(
              "font-display uppercase tracking-wider",
              inactive ? "text-[var(--amber)]" : "text-[var(--emerald)]",
            )}
          >
            {inactive ? "Inactive" : "Active"}
          </p>
          <p className="mt-1 text-[var(--text-dim)]">
            Live {connected ? "connected" : "reconnecting…"}
          </p>
        </div>
      </header>

      {inactive ? (
        <div
          className="rounded-lg border border-[var(--amber)]/40 bg-[rgba(255,184,77,0.08)] px-3 py-2.5 text-sm text-[var(--amber)]"
          role="status"
        >
          <p>{inactiveExplainer(vault.inactiveReasonLabels)}</p>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <Field
          label="Estimated share this period"
          value={
            vault.walletEstimatesVisible ? `${display.estimatedPendingSol} SOL` : "Owner only"
          }
          valueClassName={cn(
            estimatedColor,
            "reward-estimate-tick",
            display.estimatedAnimating && "is-animating",
          )}
          tooltip="Live estimate of your share of the current Community Reward Treasury epoch pool. Updates only when verified project-controlled deposits fund the treasury — never on a fake timer. Not guaranteed."
          hint="Updates when the treasury is funded — not on a timer."
          tone="estimated"
        />
        <Field
          label="Ready to claim"
          value={vault.walletEstimatesVisible ? `${display.claimableSol} SOL` : "Owner only"}
          valueClassName={claimableColor}
          tooltip="Finalized rewards available to claim. Separate from Estimated share — never combined."
          hint="Finalized amount you can claim now."
          tone="claimable"
        />
        <Field
          label="Earned so far"
          value={
            vault.walletEstimatesVisible ? `${vault.lifetimeEarnedSol} SOL` : "Owner only"
          }
          hint="Lifetime claimed from community treasury distributions."
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="btn-primary focus-ring text-sm disabled:opacity-40"
          disabled={!vault.claimsEnabled || claimBusy || !vault.walletEstimatesVisible || inactive}
          title={
            vault.claimsEnabled
              ? "Claim finalized community rewards"
              : "REWARD_CLAIMS_ENABLED=false — claims paused"
          }
          onClick={() => void onClaim()}
        >
          {vault.claimsEnabled ? (claimBusy ? "Claiming…" : "Claim ready rewards") : "Claims paused"}
        </button>
        {vault.explorerVaultUrl ? (
          <a
            href={vault.explorerVaultUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary focus-ring text-sm"
          >
            Explorer
          </a>
        ) : null}
        {vault.isOwner ? (
          <button
            type="button"
            className="btn-secondary focus-ring text-sm"
            onClick={() =>
              void toggleSelection(!vault.inactiveReasons.includes("not_selected"))
            }
          >
            {vault.inactiveReasons.includes("not_selected")
              ? "Select for rewards"
              : "Remove from rewards"}
          </button>
        ) : null}
      </div>

      <details className="rounded-lg border border-[var(--stroke)] bg-[var(--bg-elevated)] p-4">
        <summary className="cursor-pointer font-display text-sm text-white focus-ring rounded">
          Details — activity, pool, and analytics
        </summary>
        <div className="mt-4 space-y-5">
          <div>
            <h3 className="font-display text-sm text-white">Community activity today</h3>
            <p className="mt-1 text-[10px] text-[var(--text-muted)]">
              Ecosystem participation — not automatic income from buying the coin.
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-[var(--text-muted)]">
              <li className="flex justify-between gap-3">
                <span>New holders</span>
                <span className="text-white">{activity.holdersLabel}</span>
              </li>
              <li className="flex justify-between gap-3">
                <span>Marketplace trades</span>
                <span className="text-white">{activity.marketplaceTrades}</span>
              </li>
              <li className="flex justify-between gap-3">
                <span>Eggs hatched</span>
                <span className="text-white">{activity.eggsHatched}</span>
              </li>
              <li className="flex justify-between gap-3">
                <span>Pets evolved</span>
                <span className="text-white">{activity.petsEvolved}</span>
              </li>
            </ul>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Next distribution"
              value={formatCountdown(countdown)}
              srValue={`${countdown} seconds until next reward distribution`}
              tooltip="Countdown to the next epoch snapshot / distribution window. The countdown itself does not increase Estimated share."
            />
            <Field
              label="Treasury epoch pool"
              value={`${vault.currentRewardPoolSol} SOL`}
              tooltip="Verified deposits in the open Community Reward Treasury epoch. Grows only when the project records verified funding — not from each Pump.fun trade."
            />
          </div>

          {!vault.explorerVaultUrl ? (
            <p className="text-[10px] text-[var(--text-dim)]">
              Explorer link appears when an on-chain treasury address is configured.
            </p>
          ) : null}

          <div>
            <h3 className="font-display text-sm text-white">Recent treasury funding</h3>
            <p className="mt-1 text-[10px] text-[var(--text-muted)]">
              Verified project-controlled deposits only — each entry increases the epoch pool
              server-side.
            </p>
            <div className="mt-2">
              <RewardFundingFeed funding={vault.recentFunding} />
            </div>
          </div>

          <div>
            <h3 className="font-display text-sm text-white">History & analytics</h3>
            <div className="mt-2">
              <RewardAnalyticsPanel analytics={vault.analytics} inactive={inactive} />
            </div>
          </div>
        </div>
      </details>

      <footer className="space-y-1 border-t border-[var(--stroke)] pt-3 text-[10px] text-[var(--text-muted)]">
        <p>{vault.disclaimers.entertainment}</p>
        <p>{vault.disclaimers.communityTreasury}</p>
        <p className="text-[var(--amber)]">{vault.disclaimers.estimates}</p>
        <p>{vault.disclaimers.holderRewards}</p>
        {!vault.chainSettlementEnabled ? (
          <p className="text-[var(--amber)]">
            On-chain claim settlement is flagged off. Server estimates remain honest about ledger
            data sources.
          </p>
        ) : null}
        {error ? <p className="text-[var(--coral)]">{error}</p> : null}
      </footer>
    </section>
  );
}

function Field({
  label,
  value,
  tooltip,
  hint,
  valueClassName,
  tone,
  srValue,
}: {
  label: string;
  value: string;
  tooltip?: string;
  hint?: string;
  valueClassName?: string;
  tone?: "estimated" | "claimable";
  srValue?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-[var(--stroke)] bg-[var(--bg-elevated)] p-3",
        tone === "estimated" && "border-[rgba(61,231,255,0.28)]",
        tone === "claimable" && "border-[rgba(61,255,176,0.28)]",
      )}
    >
      <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
        {label}
        {tooltip ? (
          <span className="ml-1 cursor-help text-[var(--text-dim)]" title={tooltip}>
            ⓘ
          </span>
        ) : null}
      </p>
      <p
        className={cn("mt-1 font-display text-lg text-white", valueClassName)}
        aria-label={srValue ?? `${label}: ${value}`}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 text-[10px] leading-snug text-[var(--text-dim)]">{hint}</p> : null}
      {tooltip ? <span className="sr-only">{tooltip}</span> : null}
    </div>
  );
}
