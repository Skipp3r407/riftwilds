"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { SectionTitleBand } from "@/components/shared/page-header";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [info, setInfo] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [emailDelivery, setEmailDelivery] = useState<"resend" | "console" | null>(
    null,
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth/password-reset/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const json = await res.json();
    setInfo(json.message ?? "If an account exists, a reset link was issued.");
    setEmailDelivery(json.emailDelivery ?? null);
    if (json.resetToken) setResetToken(json.resetToken);
    else setResetToken(null);
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-10">
      <SectionTitleBand
        slug="login"
        label="Password reset"
        kicker="Account recovery"
        atmosphere={false}
      />
      <form onSubmit={onSubmit} className="panel space-y-3 bg-[rgba(8,12,20,0.82)] p-6">
        <label className="block text-sm text-[var(--text-muted)]">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--stroke)] bg-[rgba(6,10,18,0.85)] px-3 py-2 text-white"
          />
        </label>
        <button type="submit" className="btn-primary focus-ring text-sm">
          Send reset link
        </button>
        {info ? <p className="text-sm text-[var(--text-muted)]">{info}</p> : null}
        {emailDelivery === "console" && resetToken ? (
          <div className="rounded-lg border border-[rgba(61,231,255,0.35)] bg-[rgba(10,18,28,0.9)] p-3 text-sm text-[var(--cyan)]">
            <p className="font-medium">
              Email not configured — your reset link is ready (dev)
            </p>
            <p className="mt-2 break-all text-xs text-[var(--text-muted)]">
              Token: {resetToken}
            </p>
            <Link
              href={`/reset-password?token=${encodeURIComponent(resetToken)}`}
              className="mt-2 inline-block underline"
            >
              Continue to reset password
            </Link>
          </div>
        ) : null}
        {emailDelivery !== "console" && resetToken ? (
          <p className="break-all text-xs text-[var(--cyan)]">
            Local token:{" "}
            <Link
              href={`/reset-password?token=${encodeURIComponent(resetToken)}`}
              className="underline"
            >
              continue to reset
            </Link>
          </p>
        ) : null}
      </form>
      <Link href="/login" className="text-sm text-[var(--cyan)] hover:underline">
        Back to sign in
      </Link>
    </div>
  );
}
