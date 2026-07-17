import Link from "next/link";
import { readFileSync, existsSync } from "fs";
import path from "path";

export const metadata = { title: "Admin · Testing" };
export const dynamic = "force-dynamic";

type RegistrySystem = {
  name: string;
  status: string;
  coverage: string;
  routes?: string[];
  notes?: string;
};

type Registry = {
  systems: RegistrySystem[];
  releaseGates?: Record<string, boolean>;
};

function loadRegistry(): Registry | null {
  const p = path.join(process.cwd(), "tests", "system-registry.json");
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8")) as Registry;
  } catch {
    return null;
  }
}

function loadValidateAll(): {
  ok?: boolean;
  sections?: { title: string; status: string; summary: string }[];
  criticalFailures?: string[];
} | null {
  const p = path.join(process.cwd(), "artifacts", "reports", "validate-all.json");
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

const STATUS_ORDER = ["IMPLEMENTED", "PARTIAL", "STUB", "PENDING", "NOT_IMPLEMENTED"];

export default function AdminTestingPage() {
  const registry = loadRegistry();
  const validateAll = loadValidateAll();
  const systems = [...(registry?.systems ?? [])].sort(
    (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status),
  );

  const counts = systems.reduce(
    (acc, s) => {
      acc[s.status] = (acc[s.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-10 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="page-kicker">Ops · QA</p>
          <h1 className="page-title mt-2">System Testing</h1>
          <p className="page-lede">
            Registry-driven status board. STUB / NOT_IMPLEMENTED entries are never shown as passing.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/economy/simulator" className="btn-primary focus-ring text-sm">
            Economy sim
          </Link>
          <Link href="/admin/economy/health" className="btn-secondary focus-ring text-sm">
            Health
          </Link>
          <Link href="/admin" className="btn-secondary focus-ring text-sm">
            Admin
          </Link>
        </div>
      </div>

      <section className="panel p-5 text-sm text-[var(--text-muted)]">
        <h2 className="font-display text-lg text-white">Commands</h2>
        <pre className="mt-3 overflow-x-auto rounded-md border border-[var(--stroke)] bg-black/30 p-3 text-xs text-[var(--cyan)]">
          npm run typecheck{"\n"}
          npm run test:unit{"\n"}
          npm run test:pets && npm run test:economy && npm run test:marketplace{"\n"}
          npm run test:battles && npm run test:security{"\n"}
          npm run simulate:economy && npm run validate:assets{"\n"}
          npm run validate:all
        </pre>
        <p className="mt-3">
          validate:all:{" "}
          <span className={validateAll?.ok ? "text-[var(--emerald)]" : "text-[var(--coral)]"}>
            {validateAll ? (validateAll.ok ? "PASS" : "FAIL") : "NOT RUN"}
          </span>
        </p>
      </section>

      <section className="panel p-5">
        <h2 className="font-display text-lg text-white">Registry counts</h2>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          {STATUS_ORDER.map((status) => (
            <span key={status} className="rounded-md border border-[var(--stroke)] px-3 py-1">
              {status}: {counts[status] ?? 0}
            </span>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        {systems.map((s) => (
          <div
            key={s.name}
            className="panel flex flex-wrap items-start justify-between gap-3 p-4 text-sm"
          >
            <div>
              <div className="font-display text-white">{s.name}</div>
              {s.notes ? <p className="mt-1 text-[var(--text-muted)]">{s.notes}</p> : null}
              {s.routes?.length ? (
                <p className="mt-1 text-xs text-[var(--text-muted)]">{s.routes.join(", ")}</p>
              ) : null}
            </div>
            <div className="text-right text-xs">
              <div
                className={
                  s.status === "IMPLEMENTED"
                    ? "text-[var(--emerald)]"
                    : s.status === "PARTIAL"
                      ? "text-amber-400"
                      : "text-[var(--coral)]"
                }
              >
                {s.status}
              </div>
              <div className="text-[var(--text-muted)]">coverage {s.coverage}</div>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
