"use client";

import { useState } from "react";
import { SOL_ECONOMY_SEED_CATALOG } from "@/lib/economy/sol/catalog";
import { lamportsToSolString } from "@/lib/items/lamports";

const DEMO_USER = "demo-keeper";

const solSkus = SOL_ECONOMY_SEED_CATALOG.filter((i) => i.prices.SOL != null && i.active);

export function PurchaseSimPanel() {
  const [sku, setSku] = useState(solSkus[0]?.sku ?? "cosmetic-card-back-aurora");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const push = (line: string) => setLog((prev) => [line, ...prev].slice(0, 12));

  const run = async (action: "create" | "prepare" | "verify") => {
    setBusy(true);
    try {
      if (action === "create") {
        const requestId = `sim_${crypto.randomUUID()}`;
        const res = await fetch("/api/economy/sol/purchase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "create", userId: DEMO_USER, sku, requestId }),
        });
        const data = await res.json();
        if (!res.ok) {
          push(`create failed: ${data.error ?? data.message}`);
          return;
        }
        setOrderId(data.order.orderId);
        push(
          `created ${data.order.orderId} · ${lamportsToSolString(BigInt(data.order.priceLamports))} SOL · ${data.order.mode}`,
        );
        return;
      }
      if (!orderId) {
        push("Create an order first");
        return;
      }
      const res = await fetch("/api/economy/sol/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, orderId }),
      });
      const data = await res.json();
      if (!res.ok) {
        push(`${action} failed: ${data.error ?? data.message}`);
        return;
      }
      if (action === "prepare") {
        push(`prepared → ${data.order.state} · ${data.order.preparedPayload?.memo ?? ""}`);
      } else {
        push(
          `verified FINALIZED · entitlement ${data.entitlement?.id ?? "replay"} · simulated=${String(data.simulated)}`,
        );
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="panel space-y-4 p-5">
      <div>
        <h2 className="font-display text-xl text-white">SOL purchase simulation</h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Soft/devnet stubs only. No real funds. Production remains disabled while SOL_* flags are
          false.
        </p>
      </div>
      <label className="block text-sm text-[var(--text-muted)]">
        Catalog SKU
        <select
          className="mt-1 w-full rounded-md border border-[var(--stroke)] bg-black/30 px-3 py-2 text-white"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
        >
          {solSkus.map((item) => (
            <option key={item.sku} value={item.sku}>
              {item.name} ({String(item.prices.SOL)} SOL)
            </option>
          ))}
        </select>
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void run("create")}
          className="btn-secondary focus-ring text-sm disabled:opacity-40"
        >
          1. Create order
        </button>
        <button
          type="button"
          disabled={busy || !orderId}
          onClick={() => void run("prepare")}
          className="btn-secondary focus-ring text-sm disabled:opacity-40"
        >
          2. Prepare
        </button>
        <button
          type="button"
          disabled={busy || !orderId}
          onClick={() => void run("verify")}
          className="btn-primary focus-ring text-sm disabled:opacity-40"
        >
          3. Soft verify + grant
        </button>
      </div>
      {orderId ? (
        <p className="font-mono text-xs text-[var(--text-dim)]">orderId: {orderId}</p>
      ) : null}
      <ul className="space-y-1 text-xs text-[var(--text-muted)]">
        {log.map((line, i) => (
          <li key={`${i}-${line}`}>{line}</li>
        ))}
      </ul>
    </section>
  );
}
