import Link from "next/link";
import { readFileSync, existsSync } from "fs";
import path from "path";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { EGG_SUPPLY_GLOBAL } from "@/lib/economy/egg-supply";
import { BREEDING_RULES } from "@/lib/economy/breeding-rules";
import { MARKETPLACE_FEE_POLICY } from "@/lib/marketplace/fee-policy";
import { HOLDER_REWARD_CONFIG } from "@/lib/revenue/eligibility";
import { REAL_VALUE_WAGERING_ENABLED } from "@/lib/config/arena";

export const metadata = { title: "Admin · Economy Health" };
export const dynamic = "force-dynamic";

function loadJson(name: string): { ok?: boolean; criticalFailures?: string[]; sections?: { title: string; status: string; summary: string }[] } | null {
  const p = path.join(process.cwd(), "artifacts", "reports", name);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8")) as ReturnType<typeof loadJson>;
  } catch {
    return null;
  }
}

export default function AdminEconomyHealthPage() {
  const economy = loadJson("economy-simulator.json");
  const validateAll = loadJson("validate-all.json");

  const hardGates = [
    {
      label: "REAL_SOL_MARKETPLACE_ENABLED",
      ok: featureFlagDefaults.REAL_SOL_MARKETPLACE_ENABLED === false,
      value: String(featureFlagDefaults.REAL_SOL_MARKETPLACE_ENABLED),
    },
    {
      label: "SOL_PURCHASES_ENABLED",
      ok: featureFlagDefaults.SOL_PURCHASES_ENABLED === false,
      value: String(featureFlagDefaults.SOL_PURCHASES_ENABLED),
    },
    {
      label: "AUTOMATIC_SETTLEMENT_ENABLED",
      ok: featureFlagDefaults.AUTOMATIC_SETTLEMENT_ENABLED === false,
      value: String(featureFlagDefaults.AUTOMATIC_SETTLEMENT_ENABLED),
    },
    {
      label: "REWARD_CLAIMS_ENABLED",
      ok: featureFlagDefaults.REWARD_CLAIMS_ENABLED === false,
      value: String(featureFlagDefaults.REWARD_CLAIMS_ENABLED),
    },
    {
      label: "REAL_VALUE_WAGERING_ENABLED",
      ok: REAL_VALUE_WAGERING_ENABLED === false,
      value: String(REAL_VALUE_WAGERING_ENABLED),
    },
    {
      label: "PAID_RANDOM_REWARDS_ENABLED",
      ok: featureFlagDefaults.PAID_RANDOM_REWARDS_ENABLED === false,
      value: String(featureFlagDefaults.PAID_RANDOM_REWARDS_ENABLED),
    },
  ];

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-10 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="page-kicker">Ops · Health</p>
          <h1 className="page-title mt-2">Economy Health</h1>
          <p className="page-lede">
            Release gates and latest simulator / validate:all signals. Incomplete systems are not
            marked green.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/economy/simulator" className="btn-primary focus-ring text-sm">
            Simulator
          </Link>
          <Link href="/admin/testing" className="btn-secondary focus-ring text-sm">
            Testing
          </Link>
          <Link href="/admin/economy" className="btn-secondary focus-ring text-sm">
            Economy
          </Link>
        </div>
      </div>

      <section className="panel p-5">
        <h2 className="font-display text-lg text-white">Hard release gates</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {hardGates.map((g) => (
            <div key={g.label} className="rounded-md border border-[var(--stroke)] px-3 py-2 text-xs">
              <div className="text-[var(--text-muted)]">{g.label}</div>
              <div className={g.ok ? "text-[var(--emerald)]" : "text-[var(--coral)]"}>
                {g.value} {g.ok ? "· OK" : "· VIOLATION"}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="panel p-5 text-sm text-[var(--text-muted)]">
          <h2 className="font-display text-lg text-white">Supply & breeding envelope</h2>
          <ul className="mt-3 space-y-1">
            <li>Weekly official release: {EGG_SUPPLY_GLOBAL.weeklyOfficialRelease.active}</li>
            <li>Max breeding eggs / week: {EGG_SUPPLY_GLOBAL.maxBreedingEggsPerWeekGlobal}</li>
            <li>Breeding uses / pet: {BREEDING_RULES.usesPerPet.active}</li>
            <li>Rarity guaranteed: {String(BREEDING_RULES.rarityGuaranteed)}</li>
            <li>Marketplace fee (pets/eggs): {MARKETPLACE_FEE_POLICY.petsAndEggs.totalFeeBps} bps</li>
            <li>Max reward pets: {HOLDER_REWARD_CONFIG.maxRewardBearingPets}</li>
          </ul>
        </div>
        <div className="panel p-5 text-sm text-[var(--text-muted)]">
          <h2 className="font-display text-lg text-white">Latest artifacts</h2>
          <ul className="mt-3 space-y-2">
            <li>
              economy-simulator:{" "}
              <span className={economy?.ok ? "text-[var(--emerald)]" : "text-[var(--coral)]"}>
                {economy ? (economy.ok ? "PASS" : "FAIL") : "MISSING"}
              </span>
            </li>
            <li>
              validate-all:{" "}
              <span className={validateAll?.ok ? "text-[var(--emerald)]" : "text-[var(--coral)]"}>
                {validateAll ? (validateAll.ok ? "PASS" : "FAIL") : "MISSING"}
              </span>
            </li>
          </ul>
          {validateAll?.criticalFailures?.length ? (
            <ul className="mt-3 list-disc pl-5 text-[var(--coral)]">
              {validateAll.criticalFailures.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>
    </main>
  );
}
