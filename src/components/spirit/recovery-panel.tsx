"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type RecoveryMethodId =
  | "CREDITS_HEALER"
  | "RECOVERY_ITEM"
  | "SPIRIT_QUEST"
  | "LOYALTY_TOKEN"
  | "GUILD_ASSIST"
  | "FRIEND_ASSIST"
  | "SOL_INSTANT_RECALL";

type SpiritPayload = {
  lifeState: string;
  countdownRemainingMs: number | null;
  fx: { breathing: boolean; dimGlow: boolean; spiritParticles: boolean; heartbeatAudioKey: string | null };
  recoveryOptions: {
    dialogue: string;
    methods: {
      id: RecoveryMethodId;
      label: string;
      required: boolean;
      costCredits?: number;
      free?: boolean;
      costTokens?: number;
      optionalConvenience?: boolean;
      neverRequired?: boolean;
      solEnabled?: boolean;
      items?: readonly string[];
    }[];
    solNeverRequired: boolean;
  } | null;
  solRecall: { optional: boolean; neverRequired: boolean; enabled: boolean; quote: { solDisplay: string } };
  hardcore: { enabled: boolean };
};

export function RecoveryPanel({ petPublicId }: { petPublicId: string }) {
  const [data, setData] = useState<SpiritPayload | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [itemId, setItemId] = useState("spirit-crystal");

  const load = useCallback(async () => {
    const res = await fetch(`/api/pets/${petPublicId}/spirit`);
    if (!res.ok) return;
    setData(await res.json());
  }, [petPublicId]);

  useEffect(() => {
    void load();
  }, [load]);

  const recover = async (method: RecoveryMethodId) => {
    setBusy(true);
    setMessage(null);
    const body: Record<string, unknown> = {
      action: "RECOVER",
      method,
      requestId: `rec_${method}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    };
    if (method === "RECOVERY_ITEM") body.itemId = itemId;
    if (method === "SPIRIT_QUEST") {
      await fetch(`/api/pets/${petPublicId}/recovery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ENTER_SPIRIT" }),
      });
    }
    const res = await fetch(`/api/pets/${petPublicId}/recovery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    setMessage(json.message ?? json.dialogue ?? (json.ok ? "Recovered." : "Recovery failed."));
    setBusy(false);
    await load();
  };

  if (!data) {
    return (
      <section className="rounded-xl border border-[var(--line)] bg-[var(--panel)]/60 p-4">
        <p className="text-sm text-[var(--muted)]">Loading spirit status…</p>
      </section>
    );
  }

  const needsRecovery = ["DOWNED", "SPIRIT_FORM", "CRITICAL", "WEAK"].includes(data.lifeState);
  const hoursLeft =
    data.countdownRemainingMs != null
      ? Math.ceil(data.countdownRemainingMs / (1000 * 60 * 60))
      : null;

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-xl border p-4",
        needsRecovery
          ? "border-[var(--amber)]/50 bg-[radial-gradient(ellipse_at_top,_rgba(90,140,180,0.18),_transparent_60%)]"
          : "border-[var(--line)] bg-[var(--panel)]/60",
      )}
      aria-label="Spirit recovery"
    >
      {data.fx.spiritParticles && (
        <div
          className="pointer-events-none absolute inset-0 opacity-40 motion-safe:animate-pulse"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(120, 200, 255, 0.55) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      )}
      <div className="relative z-[1] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">
            Spirit & Recovery
          </h3>
          <span
            className={cn(
              "text-xs uppercase tracking-wide",
              needsRecovery ? "text-[var(--amber)]" : "text-[var(--muted)]",
            )}
          >
            {data.lifeState.replaceAll("_", " ")}
            {hoursLeft != null && needsRecovery ? ` · ~${hoursLeft}h` : ""}
          </span>
        </div>
        <p className="text-sm text-[var(--muted)]">
          {data.recoveryOptions?.dialogue ??
            "Riftlings fall unconscious when critically wounded — never instantly lost in normal play."}
        </p>
        {data.fx.breathing && (
          <p className="text-xs text-[var(--cyan)]" role="status">
            Soft breathing · dim glow · spirit particles
            {data.fx.heartbeatAudioKey ? " · heartbeat audio ready" : ""}
          </p>
        )}
        {needsRecovery && (
          <div className="grid gap-2 sm:grid-cols-2">
            {(data.recoveryOptions?.methods ?? []).map((m) => (
              <button
                key={m.id}
                type="button"
                disabled={busy || (m.id === "SOL_INSTANT_RECALL" && !m.solEnabled)}
                onClick={() => void recover(m.id)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-left text-sm transition",
                  m.optionalConvenience
                    ? "border-[var(--line)] text-[var(--muted)]"
                    : "border-[var(--cyan)]/40 text-[var(--ink)] hover:bg-[var(--cyan)]/10",
                )}
              >
                <span className="font-medium">{m.label}</span>
                {m.costCredits != null && (
                  <span className="mt-0.5 block text-xs text-[var(--muted)]">
                    {m.free ? "Insured — free" : `${m.costCredits} Credits`}
                  </span>
                )}
                {m.costTokens != null && (
                  <span className="mt-0.5 block text-xs text-[var(--muted)]">
                    {m.costTokens} Loyalty Tokens
                  </span>
                )}
                {m.neverRequired && (
                  <span className="mt-0.5 block text-xs text-[var(--amber)]">
                    Optional convenience
                    {data.solRecall.enabled
                      ? ` · ${data.solRecall.quote.solDisplay} SOL`
                      : " · SOL flagged off"}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
        {needsRecovery && (
          <label className="flex flex-col gap-1 text-xs text-[var(--muted)]">
            Recovery item id
            <input
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              className="rounded border border-[var(--line)] bg-transparent px-2 py-1 text-[var(--ink)]"
            />
          </label>
        )}
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/spirit-realm" className="text-[var(--cyan)] underline-offset-2 hover:underline">
            Enter Spirit Realm
          </Link>
          <Link href="/memorials" className="text-[var(--muted)] underline-offset-2 hover:underline">
            Visit Memorial Garden
          </Link>
        </div>
        {message && (
          <p className="text-sm text-[var(--ink)]" role="status">
            {message}
          </p>
        )}
        <p className="text-xs text-[var(--muted)]">
          SOL is never required. Hardcore permadeath is opt-in only
          {data.hardcore.enabled ? " (enabled on this Riftling)." : "."}
        </p>
      </div>
    </section>
  );
}
