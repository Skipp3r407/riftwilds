"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { SectionTitleBand } from "@/components/shared/page-header";

function ResetInner() {
  const router = useRouter();
  const search = useSearchParams();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = search.get("token");
    if (t) setToken(t);
  }, [search]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth/password-reset/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const json = await res.json();
    if (!res.ok || !json.ok) {
      setError(json?.error?.message ?? "Reset failed");
      return;
    }
    router.push("/login?reason=login-required");
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-10">
      <SectionTitleBand
        slug="login"
        label="Choose new password"
        kicker="Account recovery"
        atmosphere={false}
      />
      <form onSubmit={onSubmit} className="panel space-y-3 bg-[rgba(8,12,20,0.82)] p-6">
        <label className="block text-sm text-[var(--text-muted)]">
          Reset token
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-[var(--stroke)] bg-[rgba(6,10,18,0.85)] px-3 py-2 text-white"
          />
        </label>
        <label className="block text-sm text-[var(--text-muted)]">
          New password
          <input
            type="password"
            minLength={10}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--stroke)] bg-[rgba(6,10,18,0.85)] px-3 py-2 text-white"
          />
        </label>
        {error ? <p className="text-sm text-[var(--ember)]">{error}</p> : null}
        <button type="submit" className="btn-primary focus-ring text-sm">
          Update password
        </button>
      </form>
      <Link href="/login" className="text-sm text-[var(--cyan)] hover:underline">
        Back to sign in
      </Link>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-10 text-sm">Loading…</div>}>
      <ResetInner />
    </Suspense>
  );
}
