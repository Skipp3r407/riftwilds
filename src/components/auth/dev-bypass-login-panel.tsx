"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StatusChip } from "@/components/shared/page-header";
import { playSfx } from "@/hooks/use-sfx";
import { ensureDevMockState } from "@/lib/auth/dev-mock-store";
import { isDevOverrideUiEnabled } from "@/lib/auth/dev-override";

type DevBypassLoginPanelProps = {
  /** Prefer returnUrl query on login; signup defaults to /play. */
  returnUrl?: string;
  /** When true, parent form is busy — disable the bypass button. */
  parentBusy?: boolean;
  onError?: (message: string) => void;
};

/**
 * Temporary local/dev login bypass (Dev Keeper session).
 * Remove this panel when real auth is ready for daily use.
 */
export function DevBypassLoginPanel({
  returnUrl = "/play",
  parentBusy = false,
  onError,
}: DevBypassLoginPanelProps) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isDevOverrideUiEnabled()) {
      setAllowed(false);
      return;
    }
    void fetch("/api/auth/dev-override")
      .then((r) => r.json())
      .then((json: { allowed?: boolean }) => {
        setAllowed(Boolean(json?.allowed) && isDevOverrideUiEnabled());
      })
      .catch(() => setAllowed(isDevOverrideUiEnabled()));
  }, []);

  if (!allowed) return null;

  async function onBypass() {
    setBusy(true);
    onError?.("");
    try {
      const res = await fetch("/api/auth/dev-override", {
        method: "POST",
        credentials: "same-origin",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        const message =
          json?.error?.message ??
          (res.status === 403
            ? "Dev bypass is disabled in this environment."
            : "Dev bypass unavailable");
        onError?.(message);
        playSfx("ui.click");
        return;
      }
      ensureDevMockState();
      playSfx("login.success");
      const next =
        typeof json.next === "string" && json.next.startsWith("/")
          ? json.next
          : returnUrl.startsWith("/")
            ? returnUrl
            : "/play";
      router.push(next);
      router.refresh();
    } catch {
      onError?.("Network error — Dev bypass failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg border-2 border-[rgba(255,160,40,0.55)] bg-[rgba(48,28,4,0.55)] p-4 shadow-[0_0_0_1px_rgba(255,160,40,0.12)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-display text-sm font-semibold text-[rgb(255,184,77)]">
          Dev bypass — remove later
        </p>
        <StatusChip tone="warn">temporary</StatusChip>
      </div>
      <p className="mt-1 text-xs text-[var(--text-muted)]">
        Skips signup and issues a local Dev Keeper session (admin, max currency, unlocks).
        Shown only in development or when{" "}
        <code className="text-[var(--cyan)]">NEXT_PUBLIC_AUTH_DEV_BYPASS=1</code> /{" "}
        <code className="text-[var(--cyan)]">NEXT_PUBLIC_DEV_OVERRIDE=true</code>. Never on true
        production.
      </p>
      <button
        type="button"
        disabled={busy || parentBusy}
        className="btn-primary focus-ring mt-3 w-full text-sm sm:w-auto"
        onClick={() => void onBypass()}
      >
        {busy ? "Entering…" : "Dev bypass — enter without login"}
      </button>
    </div>
  );
}

export function DevBypassStatusChip() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!isDevOverrideUiEnabled()) {
      setAllowed(false);
      return;
    }
    void fetch("/api/auth/dev-override")
      .then((r) => r.json())
      .then((json: { allowed?: boolean }) => {
        setAllowed(Boolean(json?.allowed) && isDevOverrideUiEnabled());
      })
      .catch(() => setAllowed(isDevOverrideUiEnabled()));
  }, []);

  if (!allowed) {
    return <StatusChip tone="info">no guest play</StatusChip>;
  }
  return <StatusChip tone="warn">dev bypass on</StatusChip>;
}
