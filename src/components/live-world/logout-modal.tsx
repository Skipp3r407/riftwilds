"use client";

import { useEffect, useState } from "react";
import { playSfx } from "@/hooks/use-sfx";

export type LogoutPreview = {
  safe: boolean;
  warning: string | null;
  countdownMs: number;
  zone: { zoneId: string; zoneKind: string; name: string } | null;
};

type Props = {
  open: boolean;
  preview: LogoutPreview | null;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function LiveWorldLogoutModal({
  open,
  preview,
  busy = false,
  onCancel,
  onConfirm,
}: Props) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!open || !preview) {
      setRemaining(0);
      return;
    }
    const total = Math.max(1000, preview.countdownMs);
    setRemaining(Math.ceil(total / 1000));
    const started = Date.now();
    const id = window.setInterval(() => {
      const left = Math.max(0, Math.ceil((total - (Date.now() - started)) / 1000));
      setRemaining(left);
      if (left <= 0) {
        window.clearInterval(id);
        onConfirm();
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [open, preview, onConfirm]);

  if (!open || !preview) return null;

  const safe = preview.safe;

  return (
    <div className="pointer-events-auto absolute inset-0 z-[60] flex items-center justify-center bg-black/75 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={safe ? "Safe logout" : "Unsafe logout warning"}
        className="w-full max-w-md rounded-lg border border-[var(--stroke)] bg-[#0c1420] p-5 shadow-xl"
      >
        <p className="font-display text-[10px] uppercase tracking-[0.2em] text-[var(--cyan)]">
          {safe ? "Rest logout" : "Unsafe logout"}
        </p>
        <h3 className="mt-1 font-display text-xl text-white">
          {safe ? "Rest at a safe place" : "Leave without resting?"}
        </h3>
        {safe && preview.zone ? (
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Resting at <span className="text-white">{preview.zone.name}</span> (
            {preview.zone.zoneKind.toLowerCase()}). Progress will be checkpointed.
          </p>
        ) : (
          <p className="mt-2 text-sm text-[var(--amber)]">
            {preview.warning ??
              "You are not in an inn, home, or camp. You will restore at your last safe checkpoint."}
          </p>
        )}
        <ul className="mt-3 space-y-1 text-[11px] text-[var(--text-dim)]">
          <li>No SOL is charged to log out.</li>
          <li>Items and owned Riftlings are never deleted as a logout penalty.</li>
          <li>Combat logout does not grant invulnerability.</li>
        </ul>
        <p className="mt-4 font-display text-2xl text-white tabular-nums">
          {remaining > 0 ? remaining : "…"}
        </p>
        <p className="text-[10px] text-[var(--text-dim)]">
          {safe ? "Safe logout completes when the countdown ends." : "Confirming unsafe logout…"}
        </p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            className="btn-secondary focus-ring flex-1 text-sm"
            disabled={busy}
            onClick={() => {
              playSfx("ui.click");
              onCancel();
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary focus-ring flex-1 text-sm"
            disabled={busy}
            onClick={() => {
              playSfx("ui.click");
              onConfirm();
            }}
          >
            {safe ? "Rest now" : "Logout anyway"}
          </button>
        </div>
      </div>
    </div>
  );
}
