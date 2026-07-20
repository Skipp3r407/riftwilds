"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { SectionTitleBand } from "@/components/shared/page-header";

function VerifyInner() {
  const router = useRouter();
  const search = useSearchParams();
  const [token, setToken] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fromQuery = search.get("token");
    const fromStorage =
      typeof sessionStorage !== "undefined"
        ? sessionStorage.getItem("rift_verify_token")
        : null;
    if (fromQuery) setToken(fromQuery);
    else if (fromStorage) setToken(fromStorage);
  }, [search]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const json = await res.json();
    if (!res.ok || !json.ok) {
      setError(json?.error?.message ?? "Verification failed");
      return;
    }
    sessionStorage.removeItem("rift_verify_token");
    setMessage("Email verified — continuing to onboarding.");
    router.push(json.next ?? "/onboarding");
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
        Gameplay stays locked until your email is verified (when verification is enabled).
        Locally, the register response may include a token for testing.
      </p>
      <form
        onSubmit={onSubmit}
        className="panel space-y-3 bg-[rgba(8,12,20,0.82)] p-6"
      >
        <label className="block text-sm text-[var(--text-muted)]">
          Verification token
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-[var(--stroke)] bg-[rgba(6,10,18,0.85)] px-3 py-2 text-white"
          />
        </label>
        {error ? <p className="text-sm text-[var(--ember)]">{error}</p> : null}
        {message ? <p className="text-sm text-[var(--grove)]">{message}</p> : null}
        <button type="submit" className="btn-primary focus-ring text-sm">
          Verify & continue
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
