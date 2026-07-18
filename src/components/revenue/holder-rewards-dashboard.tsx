"use client";

import Image from "next/image";
import { DEMO_EPOCH } from "@/lib/revenue/demo-metrics";
import { HOLDER_REWARD_CONFIG } from "@/lib/revenue/eligibility";
import { revenueDisclosures } from "@/lib/revenue/disclosures";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { HOLDER_REWARD_STAT_ART, REVENUE_SECTION_ART } from "@/lib/revenue/revenue-art";
import Link from "next/link";

export function HolderRewardsDashboard() {
  const claimsEnabled = featureFlagDefaults.REWARD_CLAIMS_ENABLED;

  return (
    <section
      id="holder-rewards"
      className="panel relative overflow-hidden p-0"
    >
      <Image
        src={REVENUE_SECTION_ART.holderRewards}
        alt=""
        fill
        sizes="(max-width: 1280px) 100vw, 1280px"
        className="object-cover object-[center_35%]"
        aria-hidden
        unoptimized
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[rgba(6,12,24,0.72)] via-[rgba(6,12,24,0.82)] to-[rgba(6,12,24,0.94)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[rgba(6,12,24,0.55)] via-transparent to-[rgba(6,12,24,0.45)]"
        aria-hidden
      />

      <div className="relative z-10 space-y-4 p-5 sm:p-6">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.24em] text-[var(--cyan)]">
            Community rewards
          </p>
          <h2 className="font-display mt-1 text-2xl text-white drop-shadow-sm">
            COMMUNITY REWARD TREASURY
          </h2>
          <p className="mt-2 text-xs text-[var(--amber)]">{revenueDisclosures.holderRewards}</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">{revenueDisclosures.tokenPurchase}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Stat
            label="Current epoch"
            value={DEMO_EPOCH.key}
            art={HOLDER_REWARD_STAT_ART.currentEpoch}
          />
          <Stat
            label="Available epoch pool"
            value={`${DEMO_EPOCH.availablePoolSol} SOL`}
            art={HOLDER_REWARD_STAT_ART.availableEpochPool}
          />
          <Stat
            label="Total eligible weight"
            value={String(DEMO_EPOCH.totalEligibleWeight)}
            art={HOLDER_REWARD_STAT_ART.totalEligibleWeight}
          />
          <Stat
            label="Wallet eligibility"
            value="Connect wallet to check"
            art={HOLDER_REWARD_STAT_ART.walletEligibility}
          />
          <Stat
            label="Selected reward pets"
            value="0 / 3"
            art={HOLDER_REWARD_STAT_ART.selectedRewardPets}
          />
          <Stat
            label="Your reward weight"
            value="0"
            art={HOLDER_REWARD_STAT_ART.yourRewardWeight}
          />
          <Stat
            label="Claimable SOL"
            value="0"
            art={HOLDER_REWARD_STAT_ART.claimableSol}
          />
          <Stat
            label="Pending estimate"
            value="—"
            note={revenueDisclosures.estimates}
            art={HOLDER_REWARD_STAT_ART.pendingEstimate}
          />
          <Stat
            label="Next snapshot"
            value={DEMO_EPOCH.nextSnapshotAt ?? "Not scheduled"}
            art={HOLDER_REWARD_STAT_ART.nextSnapshot}
          />
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
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  note,
  art,
}: {
  label: string;
  value: string;
  note?: string;
  art: { imageSrc: string; accent: string };
}) {
  return (
    <div className="relative overflow-hidden rounded-md border border-[var(--stroke)] bg-[rgba(6,12,24,0.72)] p-3 backdrop-blur-[2px]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-0.5 opacity-90"
        style={{
          background: `linear-gradient(90deg, transparent, ${art.accent}, transparent)`,
        }}
        aria-hidden
      />
      <div className="flex items-start gap-2.5">
        <div
          className="relative mt-0.5 h-10 w-10 shrink-0 overflow-hidden rounded-md border bg-[rgba(6,12,24,0.65)] shadow-[0_0_14px_rgba(61,231,255,0.1)] sm:h-11 sm:w-11"
          style={{ borderColor: `${art.accent}40` }}
        >
          <Image
            src={art.imageSrc}
            alt=""
            fill
            sizes="44px"
            className="object-cover"
            aria-hidden
            unoptimized
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{label}</p>
          <p className="mt-1 font-display text-white">{value}</p>
          {note ? <p className="mt-1 text-[9px] text-[var(--amber)]">{note}</p> : null}
        </div>
      </div>
    </div>
  );
}
