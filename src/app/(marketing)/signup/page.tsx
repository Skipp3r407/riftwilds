"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DevBypassLoginPanel,
  DevBypassStatusChip,
} from "@/components/auth/dev-bypass-login-panel";
import { SoundscapeMount } from "@/components/audio/soundscape-mount";
import { SectionTitleBand } from "@/components/shared/page-header";
import { playSfx } from "@/hooks/use-sfx";

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!acceptTerms || !acceptPrivacy) {
      setError("Accept Terms and Privacy to continue — these steps cannot be skipped.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          acceptTerms: true,
          acceptPrivacy: true,
          rememberMe,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        const fieldErrors = json?.error?.fieldErrors as
          | Record<string, string[] | undefined>
          | undefined;
        const firstField = fieldErrors
          ? Object.values(fieldErrors).find((msgs) => msgs?.[0])?.[0]
          : undefined;
        setError(json?.error?.message ?? firstField ?? "Sign-up failed");
        return;
      }
      playSfx("login.success");
      if (json.needsVerification) {
        if (json.verificationToken) {
          sessionStorage.setItem("rift_verify_token", json.verificationToken);
        }
        if (json.verificationCode) {
          sessionStorage.setItem("rift_verify_code", json.verificationCode);
        }
        if (json.verificationExpiresAt) {
          sessionStorage.setItem(
            "rift_verify_expires",
            json.verificationExpiresAt,
          );
        }
        if (json.emailDelivery === "console" && json.verificationCode) {
          sessionStorage.setItem(
            "rift_verify_dev_hint",
            `Email not configured — your code is: ${json.verificationCode} (dev)`,
          );
        } else {
          sessionStorage.removeItem("rift_verify_dev_hint");
        }
      }
      router.push(json.next ?? "/onboarding");
      router.refresh();
    } catch {
      setError("Network error — try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative mx-auto max-w-lg space-y-6 px-4 py-10 md:px-6">
      <SoundscapeMount mode="login" fadeMs={900} />
      <SectionTitleBand
        slug="login"
        label="Sign up"
        kicker="Create Riftkeeper account"
        atmosphere={false}
      />
      <div className="flex items-center gap-2">
        <DevBypassStatusChip />
      </div>
      <p className="text-sm text-[var(--text-muted)]">
        Gameplay unlocks only after a valid account. Marketing pages stay public.
      </p>

      <DevBypassLoginPanel
        returnUrl="/play"
        parentBusy={busy}
        onError={(message) => setError(message || null)}
      />

      <form
        onSubmit={onSubmit}
        className="panel space-y-3 bg-[rgba(8,12,20,0.82)] p-6 backdrop-blur-[3px]"
      >
        <label className="block text-sm text-[var(--text-muted)]">
          Username
          <input
            type="text"
            required
            minLength={3}
            maxLength={24}
            pattern="[A-Za-z][A-Za-z0-9_]{2,23}"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--stroke)] bg-[rgba(6,10,18,0.85)] px-3 py-2 text-white"
            placeholder="RiftKeeper"
          />
        </label>
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
        <label className="block text-sm text-[var(--text-muted)]">
          Password (10+ chars, letters + numbers)
          <input
            type="password"
            required
            minLength={10}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--stroke)] bg-[rgba(6,10,18,0.85)] px-3 py-2 text-white"
          />
        </label>
        <label className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-1"
          />
          <span>
            I accept the{" "}
            <Link href="/legal/terms" className="text-[var(--cyan)] hover:underline">
              Terms of Service
            </Link>
          </span>
        </label>
        <label className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
          <input
            type="checkbox"
            checked={acceptPrivacy}
            onChange={(e) => setAcceptPrivacy(e.target.checked)}
            className="mt-1"
          />
          <span>
            I accept the{" "}
            <Link href="/legal/privacy" className="text-[var(--cyan)] hover:underline">
              Privacy Policy
            </Link>
          </span>
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          Remember me
        </label>
        {error ? <p className="text-sm text-[var(--ember)]">{error}</p> : null}
        <button type="submit" disabled={busy} className="btn-primary focus-ring text-sm">
          {busy ? "Creating…" : "Create account"}
        </button>
        <p className="text-xs text-[var(--text-dim)]">
          Already have an account?{" "}
          <Link href="/login" className="text-[var(--cyan)] hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
