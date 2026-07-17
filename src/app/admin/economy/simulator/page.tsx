import Link from "next/link";
import { readFileSync, existsSync } from "fs";
import path from "path";
import { featureFlagDefaults } from "@/lib/config/feature-flags";

export const metadata = { title: "Admin · Economy Simulator" };
export const dynamic = "force-dynamic";

type HorizonSection = {
  title: string;
  status: string;
  summary: string;
  details?: {
    totals?: Record<string, string | number>;
    health?: { status: string; flags: string[]; reserveRunwayMonths: number | null };
  };
};

function loadReport(): {
  ok: boolean;
  generatedAt?: string;
  assumptions?: string[];
  sections?: HorizonSection[];
  criticalFailures?: string[];
} | null {
  const p = path.join(process.cwd(), "artifacts", "reports", "economy-simulator.json");
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8")) as ReturnType<typeof loadReport>;
  } catch {
    return null;
  }
}

export default function AdminEconomySimulatorPage() {
  const report = loadReport();

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-10 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="page-kicker">Ops · Model</p>
          <h1 className="page-title mt-2">Economy Simulator</h1>
          <p className="page-lede">
            Offline multi-horizon model. Figures are assumptions — not live treasury balances. SOL
            settlement remains OFF.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/economy/health" className="btn-primary focus-ring text-sm">
            Health
          </Link>
          <Link href="/admin/economy" className="btn-secondary focus-ring text-sm">
            Economy
          </Link>
          <Link href="/admin/testing" className="btn-secondary focus-ring text-sm">
            Testing
          </Link>
        </div>
      </div>

      <section className="panel p-5 text-sm text-[var(--text-muted)]">
        <h2 className="font-display text-lg text-white">How to run</h2>
        <pre className="mt-3 overflow-x-auto rounded-md border border-[var(--stroke)] bg-black/30 p-3 text-xs text-[var(--cyan)]">
          npm run simulate:economy{"\n"}
          npx tsx scripts/simulations/economy-simulator.ts --sol=120 --players=5000
        </pre>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>
            REAL_SOL_MARKETPLACE_ENABLED:{" "}
            {String(featureFlagDefaults.REAL_SOL_MARKETPLACE_ENABLED)}
          </li>
          <li>
            AUTOMATIC_SETTLEMENT_ENABLED:{" "}
            {String(featureFlagDefaults.AUTOMATIC_SETTLEMENT_ENABLED)}
          </li>
        </ul>
      </section>

      {!report ? (
        <section className="panel p-5 text-sm text-[var(--text-muted)]">
          No report at <code className="text-[var(--cyan)]">artifacts/reports/economy-simulator.json</code>.
          Run the CLI simulator first.
        </section>
      ) : (
        <>
          <section className="panel p-5">
            <h2 className="font-display text-lg text-white">
              Last run · {report.ok ? "PASS" : "FAIL"}
            </h2>
            <p className="mt-1 text-xs text-[var(--text-muted)]">{report.generatedAt}</p>
            {report.assumptions?.length ? (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--text-muted)]">
                {report.assumptions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            ) : null}
          </section>
          <section className="grid gap-3 md:grid-cols-2">
            {report.sections?.map((s) => (
              <div key={s.title} className="panel p-4 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display text-white">{s.title}</h3>
                  <span
                    className={
                      s.status === "PASS"
                        ? "text-[var(--emerald)]"
                        : s.status === "WARN"
                          ? "text-amber-400"
                          : "text-[var(--coral)]"
                    }
                  >
                    {s.status}
                  </span>
                </div>
                <p className="mt-2 text-[var(--text-muted)]">{s.summary}</p>
              </div>
            ))}
          </section>
        </>
      )}
    </main>
  );
}
