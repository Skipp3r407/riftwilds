/**
 * Economy sustainability simulator (offline model).
 *
 * ASSUMPTIONS (labeled — not live chain data):
 * - SOL price is an input assumption
 * - Player segments are synthetic cohorts
 * - Revenue streams use published BPS policies, not on-chain settlement
 * - AUTOMATIC_SETTLEMENT / REAL_SOL_MARKETPLACE remain OFF in product defaults
 *
 * Usage:
 *   npx tsx scripts/simulations/economy-simulator.ts
 *   npx tsx scripts/simulations/economy-simulator.ts --sol=120 --horizon=365 --players=5000
 */

import { writeFileSync, mkdirSync } from "fs";
import path from "path";
import { allocateForTransactionType } from "../../src/lib/revenue/allocate";
import { solToLamports, lamportsToSolString, LAMPORTS_PER_SOL } from "../../src/lib/items/lamports";
import { EGG_SUPPLY_GLOBAL } from "../../src/lib/economy/egg-supply";
import { BREEDING_RULES, splitBreedingFee } from "../../src/lib/economy/breeding-rules";
import { MARKETPLACE_FEE_POLICY } from "../../src/lib/marketplace/fee-policy";
import { featureFlagDefaults } from "../../src/lib/config/feature-flags";
import {
  ARTIFACTS_DIR,
  ensureArtifactsDir,
  writeJsonReport,
  type ValidationReport,
} from "../lib/report-writer";

type Segment = {
  name: string;
  share: number;
  shopSolPerDay: number;
  marketplaceVolumeSolPerDay: number;
  breedingAttemptsPerWeek: number;
  listingFeesPerWeek: number;
};

const DEFAULT_SEGMENTS: Segment[] = [
  {
    name: "casual",
    share: 0.55,
    shopSolPerDay: 0.01,
    marketplaceVolumeSolPerDay: 0.005,
    breedingAttemptsPerWeek: 0.05,
    listingFeesPerWeek: 0.1,
  },
  {
    name: "core",
    share: 0.35,
    shopSolPerDay: 0.05,
    marketplaceVolumeSolPerDay: 0.04,
    breedingAttemptsPerWeek: 0.25,
    listingFeesPerWeek: 0.4,
  },
  {
    name: "whales",
    share: 0.1,
    shopSolPerDay: 0.25,
    marketplaceVolumeSolPerDay: 0.35,
    breedingAttemptsPerWeek: 0.8,
    listingFeesPerWeek: 1.2,
  },
];

type HorizonKey = "30d" | "90d" | "365d" | "5y";

const HORIZON_DAYS: Record<HorizonKey, number> = {
  "30d": 30,
  "90d": 90,
  "365d": 365,
  "5y": 365 * 5,
};

function parseArgs(argv: string[]) {
  let solUsd = 100;
  let players = 2_000;
  let horizons: HorizonKey[] = ["30d", "90d", "365d", "5y"];
  let reserveMonthsRunwayTarget = 6;
  for (const a of argv) {
    if (a.startsWith("--sol=")) solUsd = Number(a.slice(6));
    if (a.startsWith("--players=")) players = Number(a.slice(10));
    if (a.startsWith("--horizon=")) {
      const h = a.slice(10) as HorizonKey;
      if (h in HORIZON_DAYS) horizons = [h];
    }
    if (a.startsWith("--runway-months=")) reserveMonthsRunwayTarget = Number(a.slice(16));
  }
  return { solUsd, players, horizons, reserveMonthsRunwayTarget };
}

function avgBreedingFeeSol(): number {
  const fees = BREEDING_RULES.feeSolByUseIndex.map(Number);
  return fees.reduce((s, n) => s + n, 0) / fees.length;
}

type DayBucket = {
  shopGrossLamports: bigint;
  marketplaceGrossLamports: bigint;
  breedingFeeLamports: bigint;
  listingFeeLamports: bigint;
  growthReserveLamports: bigint;
  holderVaultLamports: bigint;
  eggsBred: number;
  eggsOfficialReleased: number;
};

function simulateDay(players: number, segments: Segment[]): DayBucket {
  let shop = 0n;
  let market = 0n;
  let breeding = 0n;
  let listing = 0n;
  let eggsBred = 0;

  for (const seg of segments) {
    const n = Math.max(0, Math.round(players * seg.share));
    shop += solToLamports((seg.shopSolPerDay * n).toFixed(9));
    market += solToLamports((seg.marketplaceVolumeSolPerDay * n).toFixed(9));
    const breedPerDay = (seg.breedingAttemptsPerWeek * n) / 7;
    eggsBred += breedPerDay;
    breeding += solToLamports((breedPerDay * avgBreedingFeeSol()).toFixed(9));
    listing += solToLamports(
      (((seg.listingFeesPerWeek * n) / 7) * Number(MARKETPLACE_FEE_POLICY.listingFeeLamports) /
        Number(LAMPORTS_PER_SOL)).toFixed(9),
    );
  }

  // Cap breeding eggs by global weekly envelope (spread across days)
  const dailyBreedCap = EGG_SUPPLY_GLOBAL.maxBreedingEggsPerWeekGlobal / 7;
  if (eggsBred > dailyBreedCap) {
    const scale = dailyBreedCap / eggsBred;
    breeding = BigInt(Math.floor(Number(breeding) * scale));
    eggsBred = dailyBreedCap;
  }

  const shopAlloc = allocateForTransactionType(shop, "SHOP_PURCHASE");
  const mktAlloc = allocateForTransactionType(market, "MARKETPLACE_SALE");
  const listAlloc = allocateForTransactionType(listing, "LISTING_FEE");
  const breedSplit = splitBreedingFee(breeding);

  const pick = (alloc: ReturnType<typeof allocateForTransactionType>, dest: string) =>
    alloc.lines.find((l) => l.destination === dest)?.allocatedAmountLamports ?? 0n;

  const growth =
    pick(shopAlloc, "GROWTH_RESERVE") +
    pick(mktAlloc, "GROWTH_RESERVE") +
    pick(listAlloc, "GROWTH_RESERVE") +
    breedSplit.projectReserve;

  const holders =
    pick(shopAlloc, "PET_HOLDER_REWARD_VAULT") +
    pick(mktAlloc, "PET_HOLDER_REWARD_VAULT") +
    pick(listAlloc, "PET_HOLDER_REWARD_VAULT") +
    breedSplit.holderVault;

  const weeklyOfficial = EGG_SUPPLY_GLOBAL.weeklyOfficialRelease.active;
  const eggsOfficialReleased = weeklyOfficial / 7;

  return {
    shopGrossLamports: shop,
    marketplaceGrossLamports: market,
    breedingFeeLamports: breeding,
    listingFeeLamports: listing,
    growthReserveLamports: growth,
    holderVaultLamports: holders,
    eggsBred,
    eggsOfficialReleased,
  };
}

type HorizonResult = {
  horizon: HorizonKey;
  days: number;
  totals: {
    shopGrossSol: string;
    marketplaceGrossSol: string;
    breedingFeeSol: string;
    listingFeeSol: string;
    growthReserveSol: string;
    holderVaultSol: string;
    growthReserveUsd: number;
    holderVaultUsd: number;
    eggsBred: number;
    eggsOfficialReleased: number;
  };
  health: {
    flags: string[];
    reserveRunwayMonths: number | null;
    status: "HEALTHY" | "WATCH" | "CRITICAL";
  };
};

function runHorizon(
  key: HorizonKey,
  players: number,
  solUsd: number,
  monthlyBurnUsd: number,
  runwayTargetMonths: number,
): HorizonResult {
  const days = HORIZON_DAYS[key];
  let shop = 0n;
  let market = 0n;
  let breeding = 0n;
  let listing = 0n;
  let growth = 0n;
  let holders = 0n;
  let eggsBred = 0;
  let eggsOfficial = 0;

  for (let d = 0; d < days; d++) {
    const day = simulateDay(players, DEFAULT_SEGMENTS);
    shop += day.shopGrossLamports;
    market += day.marketplaceGrossLamports;
    breeding += day.breedingFeeLamports;
    listing += day.listingFeeLamports;
    growth += day.growthReserveLamports;
    holders += day.holderVaultLamports;
    eggsBred += day.eggsBred;
    eggsOfficial += day.eggsOfficialReleased;
  }

  const growthSol = Number(lamportsToSolString(growth));
  const growthUsd = growthSol * solUsd;
  const runwayMonths = monthlyBurnUsd > 0 ? growthUsd / monthlyBurnUsd : null;

  const flags: string[] = [];
  if (featureFlagDefaults.AUTOMATIC_SETTLEMENT_ENABLED) {
    flags.push("UNEXPECTED: AUTOMATIC_SETTLEMENT_ENABLED is ON in defaults");
  }
  if (featureFlagDefaults.REAL_SOL_MARKETPLACE_ENABLED) {
    flags.push("UNEXPECTED: REAL_SOL_MARKETPLACE_ENABLED is ON in defaults");
  }
  if (eggsBred / days > EGG_SUPPLY_GLOBAL.maxBreedingEggsPerWeekGlobal / 7 + 0.01) {
    flags.push("Breeding supply exceeded daily cap after model clamp");
  }
  if (runwayMonths !== null && runwayMonths < runwayTargetMonths) {
    flags.push(
      `Reserve runway ${runwayMonths.toFixed(1)} months below target ${runwayTargetMonths}`,
    );
  }
  if (Number(lamportsToSolString(holders)) <= 0 && days >= 30) {
    flags.push("Holder vault accrued zero over horizon");
  }

  let status: HorizonResult["health"]["status"] = "HEALTHY";
  if (flags.some((f) => f.startsWith("UNEXPECTED") || f.includes("exceeded"))) {
    status = "CRITICAL";
  } else if (flags.length) {
    status = "WATCH";
  }

  return {
    horizon: key,
    days,
    totals: {
      shopGrossSol: lamportsToSolString(shop),
      marketplaceGrossSol: lamportsToSolString(market),
      breedingFeeSol: lamportsToSolString(breeding),
      listingFeeSol: lamportsToSolString(listing),
      growthReserveSol: lamportsToSolString(growth),
      holderVaultSol: lamportsToSolString(holders),
      growthReserveUsd: Number(growthUsd.toFixed(2)),
      holderVaultUsd: Number((Number(lamportsToSolString(holders)) * solUsd).toFixed(2)),
      eggsBred: Math.round(eggsBred),
      eggsOfficialReleased: Math.round(eggsOfficial),
    },
    health: {
      flags,
      reserveRunwayMonths: runwayMonths === null ? null : Number(runwayMonths.toFixed(2)),
      status,
    },
  };
}

function main() {
  const { solUsd, players, horizons, reserveMonthsRunwayTarget } = parseArgs(process.argv.slice(2));
  /** ASSUMPTION: synthetic ops burn used only for runway illustration. */
  const monthlyBurnUsd = 15_000;

  const results = horizons.map((h) =>
    runHorizon(h, players, solUsd, monthlyBurnUsd, reserveMonthsRunwayTarget),
  );

  const critical = results
    .filter((r) => r.health.status === "CRITICAL")
    .map((r) => `${r.horizon}: ${r.health.flags.join("; ")}`);

  const report: ValidationReport = {
    name: "economy-simulator",
    generatedAt: new Date().toISOString(),
    assumptions: [
      `SOL/USD = ${solUsd} (input assumption)`,
      `Active players = ${players} (synthetic cohort)`,
      `Monthly ops burn = $${monthlyBurnUsd} USD (illustration only)`,
      "Segments: casual 55% / core 35% / whales 10%",
      "Uses published BPS policies; SOL settlement feature flags remain OFF in product",
      "Breeding eggs clamped to EGG_SUPPLY_GLOBAL.maxBreedingEggsPerWeekGlobal",
    ],
    sections: results.map((r) => ({
      title: `Horizon ${r.horizon}`,
      status:
        r.health.status === "HEALTHY" ? "PASS" : r.health.status === "WATCH" ? "WARN" : "FAIL",
      summary: `Growth ${r.totals.growthReserveSol} SOL ($${r.totals.growthReserveUsd}); holders ${r.totals.holderVaultSol} SOL; runway ${r.health.reserveRunwayMonths ?? "n/a"} mo`,
      details: r as unknown as Record<string, unknown>,
    })),
    criticalFailures: critical,
    ok: critical.length === 0,
  };

  ensureArtifactsDir();
  const jsonPath = writeJsonReport("economy-simulator.json", report);
  const mdPath = path.join(ARTIFACTS_DIR, "economy-simulator.md");
  const md = [
    "# Economy Simulator Report",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    "## Assumptions",
    ...report.assumptions!.map((a) => `- ${a}`),
    "",
    "## Horizons",
    ...results.map(
      (r) =>
        `### ${r.horizon} (${r.health.status})\n` +
        `- Shop gross: ${r.totals.shopGrossSol} SOL\n` +
        `- Marketplace gross: ${r.totals.marketplaceGrossSol} SOL\n` +
        `- Breeding fees: ${r.totals.breedingFeeSol} SOL\n` +
        `- Listing fees: ${r.totals.listingFeeSol} SOL\n` +
        `- Growth reserve: ${r.totals.growthReserveSol} SOL ($${r.totals.growthReserveUsd})\n` +
        `- Holder vault: ${r.totals.holderVaultSol} SOL ($${r.totals.holderVaultUsd})\n` +
        `- Eggs bred (capped): ${r.totals.eggsBred}\n` +
        `- Official eggs released: ${r.totals.eggsOfficialReleased}\n` +
        `- Reserve runway: ${r.health.reserveRunwayMonths ?? "n/a"} months\n` +
        (r.health.flags.length ? `- Flags: ${r.health.flags.join("; ")}\n` : ""),
    ),
    "",
    report.ok ? "**Overall: PASS** (no critical model failures)" : "**Overall: FAIL**",
    "",
  ].join("\n");
  writeFileSync(mdPath, md, "utf8");

  console.log(`Economy simulator wrote:\n  ${jsonPath}\n  ${mdPath}`);
  console.log(
    results
      .map((r) => `${r.horizon}=${r.health.status} growth=${r.totals.growthReserveSol}SOL`)
      .join(" | "),
  );
  if (!report.ok) process.exitCode = 1;
}

main();
