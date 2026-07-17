"use client";

import Link from "next/link";
import { economyConfig } from "@/lib/config/economy";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { getActiveTreasuryPolicy } from "@/lib/config/treasury-policy";
import { cn } from "@/lib/utils/cn";
import { RewardDisclaimer } from "./disclaimers";

type RewardSlot = {
  slot: number;
  petName: string | null;
  status: "empty" | "eligible" | "warning" | "ineligible";
};

type DashboardEconomyWidgetProps = {
  className?: string;
  walletConnected?: boolean;
  walletAddress?: string | null;
  tokenTier?: string | null;
  epochId?: string | null;
  epochEndsAt?: string | null;
  rewardSlots?: RewardSlot[];
  careWarnings?: string[];
};

const PLACEHOLDER_SLOTS: RewardSlot[] = [
  { slot: 1, petName: null, status: "empty" },
  { slot: 2, petName: null, status: "empty" },
  { slot: 3, petName: null, status: "empty" },
];

const SLOT_STATUS: Record<RewardSlot["status"], string> = {
  empty: "text-[var(--text-muted)]",
  eligible: "text-[var(--emerald)]",
  warning: "text-[var(--amber)]",
  ineligible: "text-[var(--coral)]",
};

function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export function DashboardEconomyWidget({
  className,
  walletConnected = false,
  walletAddress = null,
  tokenTier = null,
  epochId = null,
  epochEndsAt = null,
  rewardSlots = PLACEHOLDER_SLOTS,
  careWarnings = [],
}: DashboardEconomyWidgetProps) {
  const policy = getActiveTreasuryPolicy();
  const epochEnabled = featureFlagDefaults.EPOCH_REWARDS_ENABLED;
  const realMoneyEnabled = featureFlagDefaults.REAL_MONEY_REWARDS_ENABLED;
  const claimsDisabled = !epochEnabled;

  const disabledReasons: string[] = [];
  if (!epochEnabled) disabledReasons.push("EPOCH_REWARDS_ENABLED is false");
  if (!realMoneyEnabled) disabledReasons.push("Real-money rewards are off");

  return (
    <section
      className={cn("panel space-y-5 p-5", className)}
      aria-labelledby="dashboard-economy-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.18em] text-[var(--cyan)]">
            Your economy
          </p>
          <h2 id="dashboard-economy-heading" className="font-display text-lg text-white">
            Epoch & rewards
          </h2>
        </div>
        <span className="rounded-full border border-[var(--stroke)] px-2.5 py-1 text-[10px] uppercase tracking-wider text-[var(--amber)]">
          Demo shell
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-[var(--stroke)] bg-[rgba(7,11,22,0.35)] p-4">
          <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">Wallet</p>
          <p className="mt-1 text-sm text-white">
            {walletConnected && walletAddress
              ? truncateAddress(walletAddress)
              : "Not connected — connect to check eligibility"}
          </p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Tier: {tokenTier ?? (walletConnected ? "Unavailable" : "—")}
          </p>
        </div>

        <div className="rounded-lg border border-[var(--stroke)] bg-[rgba(7,11,22,0.35)] p-4">
          <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
            Current epoch
          </p>
          <p className="mt-1 text-sm text-white">
            {epochId ?? "No active epoch (demo)"}
          </p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {epochEndsAt
              ? `Ends ${epochEndsAt}`
              : `Duration: ${economyConfig.EPOCH_DURATION_HOURS}h when enabled`}
          </p>
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
          Reward pet slots ({policy.rewardRules.maxRewardActivePets} max)
        </p>
        <ul className="mt-2 space-y-2">
          {rewardSlots.map((slot) => (
            <li
              key={slot.slot}
              className="flex items-center justify-between rounded-lg border border-[var(--stroke)] bg-[rgba(7,11,22,0.35)] px-4 py-2.5 text-sm"
            >
              <span className="text-[var(--text-muted)]">Slot {slot.slot}</span>
              <span className={SLOT_STATUS[slot.status]}>
                {slot.petName ?? "Empty — select a pet"}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {careWarnings.length > 0 ? (
        <div
          className="rounded-lg border border-[var(--amber)]/40 bg-[rgba(255,184,77,0.08)] p-4"
          role="status"
        >
          <p className="text-xs uppercase tracking-wider text-[var(--amber)]">Care warnings</p>
          <ul className="mt-2 space-y-1 text-sm text-[var(--text-muted)]">
            {careWarnings.map((warning) => (
              <li key={warning}>• {warning}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-[var(--text-muted)]">
          No live care warnings — connect a wallet and load pets to see status.
        </p>
      )}

      {claimsDisabled || !realMoneyEnabled ? (
        <div
          className="rounded-lg border border-[var(--coral)]/35 bg-[rgba(255,107,107,0.08)] p-4 text-sm text-[var(--text-muted)]"
          role="status"
        >
          <p className="font-medium text-[var(--coral)]">
            {claimsDisabled ? "Claims unavailable" : "Real-money payouts off"}
          </p>
          <ul className="mt-2 space-y-1">
            {disabledReasons.map((reason) => (
              <li key={reason}>• {reason}</li>
            ))}
          </ul>
          {!claimsDisabled && !realMoneyEnabled ? (
            <p className="mt-2 text-xs">
              Soft-currency demo epochs may still run when EPOCH_REWARDS_ENABLED is on.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-secondary focus-ring text-sm" disabled={!walletConnected}>
          Select reward pets
        </button>
        <Link href="/collection" className="btn-secondary focus-ring text-sm">
          Care
        </Link>
        <button
          type="button"
          className="btn-primary focus-ring text-sm"
          disabled={claimsDisabled || !walletConnected}
          title={claimsDisabled ? disabledReasons.join("; ") : undefined}
        >
          Claim
        </button>
        <Link href="/economy" className="btn-secondary focus-ring text-sm">
          Epoch details
        </Link>
      </div>

      <RewardDisclaimer />
    </section>
  );
}
