"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { SectionTitleBand } from "@/components/shared/page-header";

function VerifyInner() {
  const router = useRouter();
  const search = useSearchParams();
  const [code, setCode] = useState("");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resendBusy, setResendBusy] = useState(false);
  const [expiresHint, setExpiresHint] = useState<string | null>(null);
  const [devCodeHint, setDevCodeHint] = useState<string | null>(null);

  useEffect(() => {
    const err = search.get("error");
    if (err) setError(err);

    const fromQuery = search.get("token");
    const fromStorage =
      typeof sessionStorage !== "undefined"
        ? sessionStorage.getItem("rift_verify_token")
        : null;
    if (fromQuery) setToken(fromQuery);
    else if (fromStorage) setToken(fromStorage);

    const storedCode =
      typeof sessionStorage !== "undefined"
        ? sessionStorage.getItem("rift_verify_code")
        : null;
    if (storedCode) {
      setCode(storedCode);
      const storedHint =
        typeof sessionStorage !== "undefined"
          ? sessionStorage.getItem("rift_verify_dev_hint")
          : null;
      setDevCodeHint(
        storedHint ??
          `Email not configured — your code is: ${storedCode} (dev)`,
      );
    }

    const expires =
      typeof sessionStorage !== "undefined"
        ? sessionStorage.getItem("rift_verify_expires")
        : null;
    if (expires) {
      setExpiresHint(`Code expires at ${new Date(expires).toLocaleTimeString()}.`);
    }
  }, [search]);

  async function verifyPayload(body: { code?: string; token?: string }) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json?.error?.message ?? "Verification failed");
        return;
      }
      sessionStorage.removeItem("rift_verify_token");
      sessionStorage.removeItem("rift_verify_code");
      sessionStorage.removeItem("rift_verify_expires");
      setMessage("Email verified — continuing to onboarding.");
      router.push(json.next ?? "/onboarding");
    } catch {
      setError("Network error — try again.");
    } finally {
      setBusy(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmedCode = code.replace(/\s+/g, "");
    if (trimmedCode.length === 6) {
      await verifyPayload({ code: trimmedCode });
      return;
    }
    if (token.trim().length >= 16) {
      await verifyPayload({ token: token.trim() });
      return;
    }
    setError("Enter the 6-digit code from your email (or paste the link token).");
  }

  async function onResend() {
    setResendBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/verify-email/resend", { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json?.error?.message ?? "Could not resend code");
        return;
      }
      if (json.verificationToken) {
        sessionStorage.setItem("rift_verify_token", json.verificationToken);
        setToken(json.verificationToken);
      }
      if (json.verificationCode) {
        sessionStorage.setItem("rift_verify_code", json.verificationCode);
        setCode(json.verificationCode);
      }
      if (json.verificationExpiresAt) {
        sessionStorage.setItem("rift_verify_expires", json.verificationExpiresAt);
        setExpiresHint(
          `New code expires at ${new Date(json.verificationExpiresAt).toLocaleTimeString()}.`,
        );
      }
      if (json.emailDelivery === "console" && json.verificationCode) {
        setDevCodeHint(
          `Email not configured — your code is: ${json.verificationCode} (dev)`,
        );
        setMessage("No email provider configured — use the on-screen code.");
      } else if (json.verificationCode && process.env.NODE_ENV !== "production") {
        setDevCodeHint(
          `Dev code (also emailed if Resend is set): ${json.verificationCode}`,
        );
        setMessage("A new code was sent (valid for 10 minutes).");
      } else {
        setDevCodeHint(null);
        setMessage("A new code was sent (valid for 10 minutes).");
      }
    } catch {
      setError("Network error — try again.");
    } finally {
      setResendBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-10">
      <SectionTitleBand
        slug="login"
        label="Verify email"
        kicker="Account security"
        atmosphere={false}
      />
      <p className="text-sm text-[var(--text-muted)]">
        Enter the 6-digit code from your email (expires in 10 minutes), or open the
        verification link. Gameplay stays locked until verified when verification is
        enabled.
      </p>
      {expiresHint ? (
        <p className="text-xs text-[var(--text-dim)]">{expiresHint}</p>
      ) : null}
      {devCodeHint ? (
        <div className="rounded-lg border border-[rgba(61,231,255,0.35)] bg-[rgba(10,18,28,0.9)] px-3 py-2 text-sm text-[var(--cyan)]">
          {devCodeHint}
        </div>
      ) : null}
      <form
        onSubmit={onSubmit}
        className="panel space-y-3 bg-[rgba(8,12,20,0.82)] p-6"
      >
        <label className="block text-sm text-[var(--text-muted)]">
          6-digit code
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={8}
            placeholder="123456"
            className="mt-1 w-full rounded-lg border border-[var(--stroke)] bg-[rgba(6,10,18,0.85)] px-3 py-2 tracking-[0.2em] text-white"
          />
        </label>
        <details className="text-sm text-[var(--text-muted)]">
          <summary className="cursor-pointer text-[var(--cyan)]">
            Have a link token instead?
          </summary>
          <label className="mt-2 block">
            Verification token
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--stroke)] bg-[rgba(6,10,18,0.85)] px-3 py-2 text-white"
            />
          </label>
        </details>
        {error ? <p className="text-sm text-[var(--ember)]">{error}</p> : null}
        {message ? <p className="text-sm text-[var(--grove)]">{message}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="btn-primary focus-ring text-sm"
        >
          {busy ? "Verifying…" : "Verify & continue"}
        </button>
        <button
          type="button"
          disabled={resendBusy}
          onClick={() => void onResend()}
          className="btn-secondary focus-ring ml-2 text-sm"
        >
          {resendBusy ? "Sending…" : "Resend code"}
        </button>
      </form>
      <Link href="/login" className="text-sm text-[var(--cyan)] hover:underline">
        Back to sign in
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="p-10 text-sm">Loading…</div>}>
      <VerifyInner />
    </Suspense>
  );
}
