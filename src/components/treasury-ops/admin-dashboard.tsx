"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { DashboardSnapshot } from "@/lib/treasury-ops/types";
import { lamportsToSolLabel } from "@/lib/treasury-ops/config";

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
  });
  const json = (await res.json()) as T & { ok?: boolean; message?: string; error?: string };
  if (!res.ok || json.ok === false) {
    throw new Error(json.message ?? json.error ?? `Request failed (${res.status})`);
  }
  return json;
}

export function TreasuryOpsAdminDashboard() {
  const [dash, setDash] = useState<DashboardSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [splitDraft, setSplitDraft] = useState<Record<string, number>>({});

  const refresh = useCallback(async () => {
    try {
      const json = await api<{ dashboard: DashboardSnapshot }>("/api/treasury-ops");
      setDash(json.dashboard);
      setSplitDraft(json.dashboard.rules.splits);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  }, []);

  useEffect(() => {
    void refresh();
    const t = setInterval(() => void refresh(), 12_000);
    return () => clearInterval(t);
  }, [refresh]);

  const targets = useMemo(
    () => dash?.wallets.filter((w) => w.isDistributionTarget) ?? [],
    [dash],
  );

  const splitTotal = useMemo(
    () => Object.values(splitDraft).reduce((s, n) => s + (Number(n) || 0), 0),
    [splitDraft],
  );

  async function run(label: string, fn: () => Promise<void>) {
    setBusy(label);
    setMsg(null);
    setError(null);
    try {
      await fn();
      setMsg(`${label} OK`);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  if (!dash && !error) {
    return <p className="text-sm text-[var(--text-muted)]">Loading treasury ops…</p>;
  }

  if (!dash) {
    return <p className="text-sm text-[var(--coral)]">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="page-kicker">Ops finance</p>
          <h1 className="page-title mt-2">{dash.settings.treasuryName}</h1>
          <p className="page-lede mt-2 max-w-2xl">{dash.settings.treasuryDescription}</p>
          <p className="mt-2 text-xs text-[var(--text-dim)]">
            Flow: Pump.fun Creator → Project Treasury → Monitor → Distribution Engine → destination
            wallets. Mode: <span className="text-[var(--cyan)]">{dash.mode}</span> · Health{" "}
            <span className="text-[var(--emerald)]">{dash.healthScore}</span>/100
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/treasury" className="btn-secondary focus-ring text-sm">
            Public community treasury
          </Link>
          <Link href="/admin" className="btn-secondary focus-ring text-sm">
            Admin home
          </Link>
        </div>
      </div>

      {(error || msg) && (
        <div
          className={`panel p-3 text-sm ${error ? "text-[var(--coral)]" : "text-[var(--emerald)]"}`}
        >
          {error ?? msg}
        </div>
      )}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Project Treasury"
          value={lamportsToSolLabel(dash.projectTreasuryBalanceLamports)}
        />
        <Stat label="Pending distributions" value={String(dash.pendingCount)} />
        <Stat label="Failed queue" value={String(dash.failedCount)} />
        <Stat
          label="Status"
          value={
            dash.settings.emergencyStop
              ? "EMERGENCY STOP"
              : dash.settings.paused
                ? "PAUSED"
                : "ACTIVE"
          }
        />
      </section>

      <section className="panel space-y-3 p-5">
        <h2 className="font-display text-lg text-white">Controls</h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-primary focus-ring text-sm"
            disabled={Boolean(busy)}
            onClick={() =>
              void run("Monitor tick + simulate Pump.fun fee", async () => {
                await api("/api/treasury-ops/monitor/tick", {
                  method: "POST",
                  body: JSON.stringify({
                    force: true,
                    simulateDeposit: {
                      amountLamports: "50000000",
                      sourceKey: "pumpfun_creator_fees",
                    },
                  }),
                });
              })
            }
          >
            {busy === "Monitor tick + simulate Pump.fun fee" ? "Working…" : "Simulate Pump.fun deposit"}
          </button>
          <button
            type="button"
            className="btn-secondary focus-ring text-sm"
            disabled={Boolean(busy)}
            onClick={() =>
              void run("Execute next distribution", async () => {
                await api("/api/treasury-ops/distribute", {
                  method: "POST",
                  body: JSON.stringify({}),
                });
              })
            }
          >
            Execute next distribution
          </button>
          <button
            type="button"
            className="btn-secondary focus-ring text-sm"
            disabled={Boolean(busy)}
            onClick={() =>
              void run("Pause", async () => {
                await api("/api/treasury-ops/pause", { method: "POST", body: "{}" });
              })
            }
          >
            Pause
          </button>
          <button
            type="button"
            className="btn-secondary focus-ring text-sm"
            disabled={Boolean(busy)}
            onClick={() =>
              void run("Resume", async () => {
                await api("/api/treasury-ops/resume", { method: "POST", body: "{}" });
              })
            }
          >
            Resume
          </button>
          <button
            type="button"
            className="btn-secondary focus-ring text-sm"
            disabled={Boolean(busy)}
            onClick={() =>
              void run("Emergency stop", async () => {
                await api("/api/treasury-ops/pause", {
                  method: "POST",
                  body: JSON.stringify({ emergency: true }),
                });
              })
            }
          >
            Emergency stop
          </button>
          <button
            type="button"
            className="btn-secondary focus-ring text-sm"
            disabled={Boolean(busy)}
            onClick={() =>
              void run("Retry failed", async () => {
                await api("/api/treasury-ops/retry", { method: "POST", body: "{}" });
              })
            }
          >
            Retry failed
          </button>
          <button
            type="button"
            className="btn-secondary focus-ring text-sm"
            disabled={Boolean(busy)}
            onClick={() =>
              void run("Export report", async () => {
                await api("/api/treasury-ops/reports", { method: "POST", body: "{}" });
              })
            }
          >
            Export report
          </button>
        </div>
        <p className="text-xs text-[var(--text-dim)]">
          Demo-safe: transfers simulate when keys / TREASURY_OPS_REAL_TRANSFERS are absent. No player
          wagering. No holder dividend autopay.
        </p>
      </section>

      <section className="panel space-y-3 p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-lg text-white">Distribution rules (bps)</h2>
          <span
            className={`text-xs ${splitTotal === 10000 ? "text-[var(--emerald)]" : "text-[var(--coral)]"}`}
          >
            Total {splitTotal} / 10000
          </span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {targets.map((w) => (
            <label key={w.id} className="text-xs text-[var(--text-muted)]">
              {w.name}
              <input
                className="mt-1 w-full rounded border border-[var(--stroke)] bg-transparent px-2 py-1 text-white"
                type="number"
                min={0}
                max={10000}
                value={splitDraft[w.id] ?? 0}
                onChange={(e) =>
                  setSplitDraft((prev) => ({ ...prev, [w.id]: Number(e.target.value) || 0 }))
                }
              />
            </label>
          ))}
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <label className="text-xs text-[var(--text-muted)]">
            Min distribution (lamports)
            <input
              id="minDist"
              className="mt-1 w-full rounded border border-[var(--stroke)] bg-transparent px-2 py-1 text-white"
              defaultValue={dash.rules.minDistributionLamports}
            />
          </label>
          <label className="text-xs text-[var(--text-muted)]">
            Auto-approval threshold (lamports)
            <input
              id="autoThresh"
              className="mt-1 w-full rounded border border-[var(--stroke)] bg-transparent px-2 py-1 text-white"
              defaultValue={dash.rules.autoApprovalThresholdLamports}
            />
          </label>
          <label className="text-xs text-[var(--text-muted)]">
            Delay (ms)
            <input
              id="delayMs"
              className="mt-1 w-full rounded border border-[var(--stroke)] bg-transparent px-2 py-1 text-white"
              defaultValue={dash.rules.distributionDelayMs}
            />
          </label>
        </div>
        <button
          type="button"
          className="btn-primary focus-ring text-sm"
          disabled={Boolean(busy) || splitTotal !== 10000}
          onClick={() =>
            void run("Update rules", async () => {
              const minEl = document.getElementById("minDist") as HTMLInputElement | null;
              const thrEl = document.getElementById("autoThresh") as HTMLInputElement | null;
              const delayEl = document.getElementById("delayMs") as HTMLInputElement | null;
              await api("/api/treasury-ops/update-rules", {
                method: "POST",
                body: JSON.stringify({
                  splits: splitDraft,
                  minDistributionLamports: minEl?.value,
                  autoApprovalThresholdLamports: thrEl?.value,
                  distributionDelayMs: Number(delayEl?.value || 0),
                }),
              });
            })
          }
        >
          Save percentages
        </button>
      </section>

      <section className="panel space-y-3 p-5">
        <h2 className="font-display text-lg text-white">Wallets</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead className="text-[var(--text-muted)]">
              <tr>
                <th className="py-2 pr-2">Name</th>
                <th className="py-2 pr-2">Role</th>
                <th className="py-2 pr-2">%</th>
                <th className="py-2 pr-2">Address</th>
                <th className="py-2">Balance</th>
              </tr>
            </thead>
            <tbody>
              {dash.wallets.map((w) => {
                const bal =
                  dash.balances.find((b) => b.walletId === w.id && b.asset === "SOL")?.balanceRaw ??
                  "0";
                return (
                  <tr key={w.id} className="border-t border-[var(--stroke)]">
                    <td className="py-2 pr-2 text-white">{w.name}</td>
                    <td className="py-2 pr-2 text-[var(--text-muted)]">{w.role}</td>
                    <td className="py-2 pr-2">{(w.percentBps / 100).toFixed(1)}%</td>
                    <td className="py-2 pr-2 font-mono text-[var(--cyan)]">{w.address}</td>
                    <td className="py-2">{lamportsToSolLabel(bal)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="panel p-5">
          <h2 className="font-display text-lg text-white">Revenue by source</h2>
          <ul className="mt-3 space-y-1 text-xs text-[var(--text-muted)]">
            {Object.entries(dash.analytics.bySource).map(([k, v]) => (
              <li key={k} className="flex justify-between gap-2">
                <span>{k}</span>
                <span className="text-white">{lamportsToSolLabel(v)}</span>
              </li>
            ))}
          </ul>
          <h3 className="mt-4 font-display text-sm text-white">Periods</h3>
          <ul className="mt-2 space-y-1 text-xs text-[var(--text-muted)]">
            {(["daily", "weekly", "monthly", "annual"] as const).map((p) => (
              <li key={p} className="flex justify-between gap-2">
                <span className="capitalize">{p}</span>
                <span className="text-white">
                  in {lamportsToSolLabel(dash.analytics.periods[p].inflowLamports)} · out{" "}
                  {lamportsToSolLabel(dash.analytics.periods[p].outflowLamports)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="panel p-5">
          <h2 className="font-display text-lg text-white">Approval queue</h2>
          {dash.approvalQueue.length === 0 ? (
            <p className="mt-2 text-xs text-[var(--text-muted)]">No pending approvals.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {dash.approvalQueue.map((a) => (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded border border-[var(--stroke)] px-3 py-2 text-xs"
                >
                  <span className="text-[var(--text-muted)]">{a.distributionId}</span>
                  <button
                    type="button"
                    className="btn-primary focus-ring text-xs"
                    disabled={Boolean(busy)}
                    onClick={() =>
                      void run("Approve", async () => {
                        await api("/api/treasury-ops/approvals", {
                          method: "POST",
                          body: JSON.stringify({
                            distributionId: a.distributionId,
                            approve: true,
                            executeAfter: true,
                          }),
                        });
                      })
                    }
                  >
                    Approve & execute
                  </button>
                </li>
              ))}
            </ul>
          )}

          <h3 className="mt-4 font-display text-sm text-white">Notifications</h3>
          <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto text-xs text-[var(--text-muted)]">
            {dash.notifications.map((n) => (
              <li key={n.id}>
                <span className="text-[var(--amber)]">[{n.level}]</span> {n.title}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="panel p-5">
        <h2 className="font-display text-lg text-white">Recent incoming</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-xs">
            <thead className="text-[var(--text-muted)]">
              <tr>
                <th className="py-2 pr-2">When</th>
                <th className="py-2 pr-2">Source</th>
                <th className="py-2 pr-2">Amount</th>
                <th className="py-2 pr-2">Status</th>
                <th className="py-2">Tx</th>
              </tr>
            </thead>
            <tbody>
              {dash.recentIncoming.map((t) => (
                <tr key={t.id} className="border-t border-[var(--stroke)]">
                  <td className="py-2 pr-2 text-[var(--text-dim)]">
                    {new Date(t.createdAt).toLocaleString()}
                  </td>
                  <td className="py-2 pr-2">{t.sourceKey}</td>
                  <td className="py-2 pr-2 text-white">
                    {lamportsToSolLabel(t.amountLamports)}
                  </td>
                  <td className="py-2 pr-2">{t.status}</td>
                  <td className="py-2 font-mono text-[var(--cyan)]">
                    {t.txSignature ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel p-5">
        <h2 className="font-display text-lg text-white">Distribution history</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-xs">
            <thead className="text-[var(--text-muted)]">
              <tr>
                <th className="py-2 pr-2">When</th>
                <th className="py-2 pr-2">Gross</th>
                <th className="py-2 pr-2">Status</th>
                <th className="py-2">Lines</th>
              </tr>
            </thead>
            <tbody>
              {dash.recentDistributions.map((d) => (
                <tr key={d.id} className="border-t border-[var(--stroke)]">
                  <td className="py-2 pr-2 text-[var(--text-dim)]">
                    {new Date(d.createdAt).toLocaleString()}
                  </td>
                  <td className="py-2 pr-2 text-white">
                    {lamportsToSolLabel(d.grossLamports)}
                  </td>
                  <td className="py-2 pr-2">{d.status}</td>
                  <td className="py-2 text-[var(--text-muted)]">
                    {d.lines
                      .map((l) => `${l.walletName} ${(l.percentBps / 100).toFixed(0)}%`)
                      .join(" · ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel p-4">
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 font-display text-xl text-white">{value}</p>
    </div>
  );
}
