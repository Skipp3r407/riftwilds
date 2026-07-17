"use client";

import { DEMO_EPOCH } from "@/lib/revenue/demo-metrics";
import { HOLDER_REWARD_CONFIG } from "@/lib/revenue/eligibility";
import { revenueDisclosures } from "@/lib/revenue/disclosures";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import Link from "next/link";

export function HolderRewardsDashboard() {
  const claimsEnabled = featureFlagDefaults.REWARD_CLAIMS_ENABLED;

  return (
    <section id="holder-rewards" className="panel space-y-4 p-5">
      <div>
        <p className="font-display text-xs uppercase tracking-[0.24em] text-[var(--cyan)]">
          Community rewards
        </p>
        <h2 className="font-display mt-1 text-2xl text-white">COMMUNITY REWARD TREASURY</h2>
        <p className="mt-2 text-xs text-[var(--amber)]">{revenueDisclosures.holderRewards}</p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">{revenueDisclosures.tokenPurchase}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Current epoch" value={DEMO_EPOCH.key} />
        <Stat label="Available epoch pool" value={`${DEMO_EPOCH.availablePoolSol} SOL`} />
        <Stat label="Total eligible weight" value={String(DEMO_EPOCH.totalEligibleWeight)} />
        <Stat label="Wallet eligibility" value="Connect wallet to check" />
        <Stat label="Selected reward pets" value="0 / 3" />
        <Stat label="Your reward weight" value="0" />
        <Stat label="Claimable SOL" value="0" />
        <Stat
          label="Pending estimate"
          value="—"
          note={revenueDisclosures.estimates}
        />
        <Stat label="Next snapshot" value={DEMO_EPOCH.nextSnapshotAt ?? "Not scheduled"} />
      </div>

      <p className="text-[10px] uppercase tracking-wider text-[var(--amber)]">Demo Data</p>
      <p className="text-xs text-[var(--text-muted)]">
        Model A: active pets (max {HOLDER_REWARD_CONFIG.maxRewardBearingPets}). Egg rewards:{" "}
        {featureFlagDefaults.EGG_HOLDER_REWARDS_ENABLED ? "enabled" : "disabled"}. Epoch duration:{" "}
        {HOLDER_REWARD_CONFIG.epochDurationHours}h.
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-primary focus-ring text-sm disabled:opacity-40"
          disabled={!claimsEnabled}
          title={
            claimsEnabled
              ? "Claim rewards"
              : "REWARD_CLAIMS_ENABLED=false — claims open after Phase 3 / devnet"
          }
        >
          {claimsEnabled ? "Claim" : "Claims paused"}
        </button>
        <Link href="/economy/policies" className="btn-secondary focus-ring text-sm">
          Allocation policies
        </Link>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="rounded-md border border-[var(--stroke)] bg-[var(--bg-elevated)] p-3">
      <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 font-display text-white">{value}</p>
      {note ? <p className="mt-1 text-[9px] text-[var(--amber)]">{note}</p> : null}
    </div>
  );
}
