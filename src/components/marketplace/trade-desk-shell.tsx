"use client";

import { useCallback, useEffect, useState } from "react";
import type { TradeRequest } from "@/lib/marketplace/trade-requests";
import { playSfx } from "@/hooks/use-sfx";

export function TradeDeskShell() {
  const [trades, setTrades] = useState<TradeRequest[]>([]);
  const [note, setNote] = useState<string | null>(null);
  const [counterparty, setCounterparty] = useState("TidequillKeeper");
  const [offerLabel, setOfferLabel] = useState("Cyan Rift Sleeve");
  const [askLabel, setAskLabel] = useState("Amber Hearth Sleeve");
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/marketplace/trade");
    const data = await res.json();
    setTrades(data.trades ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const create = async () => {
    setNote(null);
    playSfx("ui.click");
    const res = await fetch("/api/marketplace/trade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create",
        initiatorLabel: "demo-keeper",
        counterpartyLabel: counterparty,
        offer: { label: offerLabel, itemKeys: ["cyan-rift-sleeve"], creditsOffer: 0 },
        ask: { label: askLabel, itemKeys: ["amber-hearth-sleeve"], creditsOffer: 0 },
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setNote(data.error ?? "Create failed");
      return;
    }
    setNote(`Trade ${data.trade.publicId} created — both sides must double-confirm.`);
    void load();
  };

  const confirm = async (publicId: string, side: "initiator" | "counterparty") => {
    setConfirmingId(publicId);
    playSfx("ui.click");
    // Explicit second click gate in UI: first sets confirmingId, second posts.
    if (confirmingId !== publicId) {
      setNote(`Click confirm again as ${side} to double-confirm ${publicId}.`);
      return;
    }
    const res = await fetch("/api/marketplace/trade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "confirm", publicId, side }),
    });
    const data = await res.json();
    setConfirmingId(null);
    setNote(data.note ?? data.error ?? "Updated");
    void load();
  };

  return (
    <div className="space-y-6">
      <section className="panel space-y-4 p-5">
        <h2 className="font-display text-lg text-white">Propose a trade</h2>
        <p className="text-xs text-[var(--text-muted)]">
          Cosmetic-for-cosmetic shell. Escrow settlement is not live. Both parties must confirm.
        </p>
        <label className="block text-xs text-[var(--text-muted)]">
          Counterparty
          <input
            className="mt-1 w-full rounded-md border border-[var(--stroke)] bg-[rgba(8,10,18,0.6)] px-3 py-2 text-sm text-white"
            value={counterparty}
            onChange={(e) => setCounterparty(e.target.value)}
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs text-[var(--text-muted)]">
            You offer
            <input
              className="mt-1 w-full rounded-md border border-[var(--stroke)] bg-[rgba(8,10,18,0.6)] px-3 py-2 text-sm text-white"
              value={offerLabel}
              onChange={(e) => setOfferLabel(e.target.value)}
            />
          </label>
          <label className="block text-xs text-[var(--text-muted)]">
            You ask
            <input
              className="mt-1 w-full rounded-md border border-[var(--stroke)] bg-[rgba(8,10,18,0.6)] px-3 py-2 text-sm text-white"
              value={askLabel}
              onChange={(e) => setAskLabel(e.target.value)}
            />
          </label>
        </div>
        <button type="button" className="btn-primary focus-ring" onClick={() => void create()}>
          Create trade request
        </button>
        {note ? <p className="text-xs text-[var(--amber)]">{note}</p> : null}
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg text-white">Open requests</h2>
        {trades.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">No trade requests yet.</p>
        ) : (
          <ul className="space-y-3">
            {trades.map((t) => (
              <li key={t.publicId} className="panel space-y-2 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-display text-white">{t.publicId}</p>
                  <span className="text-[10px] uppercase text-[var(--text-dim)]">{t.status}</span>
                </div>
                <p className="text-sm text-[var(--text-muted)]">
                  {t.initiatorLabel}: {t.offer.label} ↔ {t.counterpartyLabel}: {t.ask.label}
                </p>
                <p className="text-[11px] text-[var(--text-dim)]">
                  Confirms: initiator {t.initiatorConfirmed ? "✓" : "…"} · counterparty{" "}
                  {t.counterpartyConfirmed ? "✓" : "…"}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn-secondary focus-ring text-xs"
                    onClick={() => void confirm(t.publicId, "initiator")}
                  >
                    {confirmingId === t.publicId
                      ? "Click again · initiator"
                      : "Confirm as initiator"}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary focus-ring text-xs"
                    onClick={() => void confirm(t.publicId, "counterparty")}
                  >
                    {confirmingId === t.publicId
                      ? "Click again · counterparty"
                      : "Confirm as counterparty"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
