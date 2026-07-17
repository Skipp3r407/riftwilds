"use client";

import { useEffect, useState } from "react";
import { featureFlagDefaults } from "@/lib/config/feature-flags";

type Rules = {
  usesPerPet: { min: number; max: number; active: number };
  cooldownDays: { min: number; max: number; active: number };
  minAgeHours: number;
  minBond: number;
  feeSolByUseIndex: string[];
  maxEggsPerWeekGlobal: number;
  rarityGuaranteed: boolean;
  disclosures: { rarity: string; fee: string };
};

type Eligibility = {
  ok: boolean;
  reason?: string;
  nextFeeSol?: string;
  usesRemainingAfter?: number;
  note?: string;
};

export function BreedingRulesPanel() {
  const [rules, setRules] = useState<Rules | null>(null);
  const [eligibility, setEligibility] = useState<Eligibility | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void fetch("/api/breeding/rules")
      .then((r) => r.json())
      .then((data) => setRules(data.rules))
      .catch(() => setRules(null));
  }, []);

  const checkDemo = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/breeding/eligibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ageHours: 96,
          bond: 55,
          breedingUsesRemaining: 4,
          lastBredAt: null,
          usesConsumed: 1,
          lifecycle: "STABLE",
        }),
      });
      setEligibility(await res.json());
    } catch {
      setEligibility({ ok: false, reason: "network_error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="panel space-y-4 p-5">
      <div>
        <h2 className="font-display text-lg text-white">Controlled breeding</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Rising fees, cooldowns, and weekly global egg caps. BREEDING_ENABLED=
          {String(featureFlagDefaults.BREEDING_ENABLED)}.
        </p>
      </div>

      {rules ? (
        <ul className="space-y-1 text-xs text-[var(--text-muted)]">
          <li>
            • Uses per pet: {rules.usesPerPet.active} (configurable{" "}
            {rules.usesPerPet.min}–{rules.usesPerPet.max})
          </li>
          <li>
            • Cooldown: {rules.cooldownDays.active} days ({rules.cooldownDays.min}–
            {rules.cooldownDays.max})
          </li>
          <li>
            • Min age {rules.minAgeHours}h · min bond {rules.minBond}
          </li>
          <li>• Fee table (SOL): {rules.feeSolByUseIndex.join(" → ")}</li>
          <li>• Global breeding eggs / week: {rules.maxEggsPerWeekGlobal}</li>
          <li>• Rarity guaranteed: {String(rules.rarityGuaranteed)}</li>
          <li>• {rules.disclosures.rarity}</li>
        </ul>
      ) : (
        <p className="text-sm text-[var(--text-muted)]">Loading breeding rules…</p>
      )}

      <button
        type="button"
        disabled={busy}
        onClick={() => void checkDemo()}
        className="btn-secondary focus-ring text-sm disabled:opacity-40"
      >
        {busy ? "Checking…" : "Preview eligibility (demo pet)"}
      </button>

      {eligibility ? (
        <p className="text-xs text-[var(--text-muted)]">
          {eligibility.ok
            ? `Eligible · next fee ${eligibility.nextFeeSol} SOL · uses after ${eligibility.usesRemainingAfter}. ${eligibility.note ?? ""}`
            : `Not eligible: ${eligibility.reason}`}
        </p>
      ) : null}
    </section>
  );
}
