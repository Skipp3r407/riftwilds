"use client";

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthProviderIcon } from "@/components/auth/auth-provider-icons";
import { SoundscapeMount } from "@/components/audio/soundscape-mount";
import { SectionTitleBand, StatusChip } from "@/components/shared/page-header";
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button";
import { playSfx } from "@/hooks/use-sfx";
import { ensureDevMockState } from "@/lib/auth/dev-mock-store";
import { isDevOverrideUiEnabled } from "@/lib/auth/dev-override";
import {
  authLoginHeaderEggPath,
  authSectionThumbPath,
} from "@/lib/assets/paths";
import type { AuthOnboardingPlan } from "@/lib/auth/modular-auth";
import type { AuthProviderDef } from "@/lib/auth/providers";

type OnboardingPayload = {
  enabled?: boolean;
  plan?: AuthOnboardingPlan;
  providers?: AuthProviderDef[];
};

const REASON_COPY: Record<string, string> = {
  banned: "This account is banned.",
  suspended: "This account is suspended.",
  deleted: "This account was deleted.",
  locked: "Too many failed attempts — try again later.",
  recovery: "Account recovery is still pending.",
  "login-required": "Sign in to continue.",
};

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const returnUrl = search.get("returnUrl") || "/play";
  const reason = search.get("reason") || search.get("admin") || "";

  const [data, setData] = useState<OnboardingPayload | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [devBusy, setDevBusy] = useState(false);
  const [devOverrideAllowed, setDevOverrideAllowed] = useState(false);

  useEffect(() => {
    if (!isDevOverrideUiEnabled()) {
      setDevOverrideAllowed(false);
      return;
    }
    void fetch("/api/auth/dev-override")
      .then((r) => r.json())
      .then((json: { allowed?: boolean }) => {
        setDevOverrideAllowed(Boolean(json?.allowed) && isDevOverrideUiEnabled());
      })
      .catch(() => setDevOverrideAllowed(isDevOverrideUiEnabled()));
  }, []);

  useEffect(() => {
    void fetch("/api/auth/onboarding")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  const plan = data?.plan;
  const providers = plan?.providersPrimary?.length
    ? plan.providersPrimary
    : ([
        { id: "email", label: "Email & password", implemented: true },
        { id: "google", label: "Google", implemented: true },
        { id: "discord", label: "Discord", implemented: true },
        { id: "apple", label: "Apple", implemented: true },
      ] as AuthProviderDef[]);

  const reasonMessage = useMemo(
    () => (reason ? REASON_COPY[reason.toLowerCase()] : null),
    [reason],
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json?.error?.message ?? "Sign-in failed");
        playSfx("ui.click");
        return;
      }
      playSfx("login.success");
      const next =
        json.next === "/onboarding" || json.next?.startsWith("/verify")
          ? `${json.next}${json.next.includes("?") ? "&" : "?"}returnUrl=${encodeURIComponent(returnUrl)}`
          : returnUrl.startsWith("/")
            ? returnUrl
            : "/play";
      router.push(next);
      router.refresh();
    } catch {
      setError("Network error — try again.");
    } finally {
      setBusy(false);
    }
  }

  function oauthHref(id: string) {
    return `/api/auth/oauth/${id}?returnUrl=${encodeURIComponent(returnUrl)}`;
  }

  async function onDevOverride() {
    if (!devOverrideAllowed) return;
    setDevBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/dev-override", { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json?.error?.message ?? "Developer Override unavailable");
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
      setError("Network error — Developer Override failed.");
    } finally {
      setDevBusy(false);
    }
  }

  return (
    <div className="relative mx-auto max-w-3xl space-y-8 px-4 py-10 md:px-6">
      <SoundscapeMount mode="login" fadeMs={900} />
      <header className="panel relative overflow-hidden bg-[rgba(8,12,20,0.78)] p-0 backdrop-blur-[3px]">
        <div className="grid items-stretch sm:grid-cols-[1fr_11rem]">
          <div className="relative z-[1] space-y-3 p-6 md:p-7">
            <SectionTitleBand
              slug="login"
              label="Account"
              kicker="Sign in required"
              atmosphere={false}
            />
            <p className="page-lede max-w-md text-sm md:text-[0.95rem]">
              {plan?.copy.lede ??
                "Create or sign in to a Riftkeeper account before gameplay. Guest play is disabled."}
            </p>
            {reasonMessage ? (
              <p className="text-sm text-[var(--amber)]">{reasonMessage}</p>
            ) : null}
          </div>
          <div className="relative min-h-[9.5rem] border-t border-[var(--stroke)] sm:min-h-0 sm:border-l sm:border-t-0">
            <Image
              src={authLoginHeaderEggPath()}
              alt=""
              fill
              className="object-contain object-center p-3"
              sizes="(max-width: 640px) 100vw, 176px"
              unoptimized
              priority
            />
          </div>
        </div>
      </header>

      <section className="panel relative space-y-4 bg-[rgba(8,12,20,0.82)] p-6 backdrop-blur-[3px]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-xl text-white">
            {plan?.copy.headline ?? "Become a Riftkeeper"}
          </h2>
          {devOverrideAllowed ? (
            <StatusChip tone="warn">local development</StatusChip>
          ) : (
            <StatusChip tone="info">no guest play</StatusChip>
          )}
        </div>

        {devOverrideAllowed ? (
          <div className="rounded-lg border border-[rgba(255,160,40,0.35)] bg-[rgba(40,24,6,0.45)] p-4">
            <p className="font-display text-sm font-semibold text-[rgb(255,184,77)]">
              Developer Override
            </p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              For Local Development Only — skips signup and issues a temporary Dev Keeper
              session (admin, max currency, unlocks). Never available in production.
            </p>
            <button
              type="button"
              disabled={devBusy || busy}
              className="btn-secondary focus-ring mt-3 text-sm"
              onClick={() => void onDevOverride()}
            >
              {devBusy ? "Entering…" : "Enter as Dev Keeper"}
            </button>
          </div>
        ) : null}

        <form className="space-y-3" onSubmit={onSubmit}>
          <label className="block text-sm text-[var(--text-muted)]">
            Email
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--stroke)] bg-[rgba(6,10,18,0.85)] px-3 py-2 text-white"
            />
          </label>
          <label className="block text-sm text-[var(--text-muted)]">
            Password
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--stroke)] bg-[rgba(6,10,18,0.85)] px-3 py-2 text-white"
            />
          </label>
          <label className="flex items-center gap-2.5 text-sm text-[var(--text-muted)]">
            <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md border border-[rgba(61,231,255,0.22)]">
              <Image
                src={authSectionThumbPath("remember")}
                alt=""
                fill
                className="object-cover"
                sizes="32px"
                unoptimized
                aria-hidden
              />
            </span>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Remember me on this device
          </label>
          {error ? <p className="text-sm text-[var(--ember)]">{error}</p> : null}
          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={busy} className="btn-primary focus-ring text-sm">
              {busy ? "Signing in…" : "Sign in"}
            </button>
            <Link
              href="/signup"
              className="btn-secondary focus-ring inline-flex items-center gap-2.5 text-sm"
            >
              <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-md border border-[rgba(61,231,255,0.22)]">
                <Image
                  src={authSectionThumbPath("create-account")}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="28px"
                  unoptimized
                  aria-hidden
                />
              </span>
              Create account
            </Link>
            <Link
              href="/forgot-password"
              className="self-center text-sm text-[var(--cyan)] hover:underline"
            >
              Forgot password
            </Link>
          </div>
        </form>

        <div className="border-t border-[var(--stroke)] pt-4">
          <p className="mb-2 text-xs uppercase tracking-wide text-[var(--text-dim)]">
            Social (scaffold if keys missing)
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {providers
              .filter((p) => p.id === "google" || p.id === "discord" || p.id === "apple")
              .map((p) => (
                <a
                  key={p.id}
                  href={oauthHref(p.id)}
                  className="btn-secondary focus-ring justify-start gap-3 px-4 py-3 text-left text-sm"
                  onClick={() => playSfx("ui.click")}
                >
                  <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[rgba(61,231,255,0.22)] bg-[rgba(10,14,24,0.65)]">
                    <AuthProviderIcon id={p.id} className="h-10 w-10 rounded-lg" />
                  </span>
                  <span className="text-white">{p.label}</span>
                </a>
              ))}
          </div>
        </div>

        <div className="border-t border-[var(--stroke)] pt-4">
          <div className="flex items-start gap-3">
            <span className="relative mt-0.5 h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-[rgba(61,231,255,0.22)]">
              <Image
                src={authSectionThumbPath("wallet")}
                alt=""
                fill
                className="object-cover"
                sizes="48px"
                unoptimized
                aria-hidden
              />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-wide text-[var(--text-dim)]">
                Optional · link wallet after account
              </p>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                {plan?.copy.walletLater ??
                  "Wallet connect is for Web3 features only — it does not replace your account."}
              </p>
              <div className="mt-3">
                <WalletConnectButton />
              </div>
            </div>
          </div>
        </div>
      </section>

      <p className="text-xs text-[var(--text-dim)]">
        After sign-in you&apos;ll finish onboarding (or return to{" "}
        <code className="text-[var(--cyan)]">{returnUrl}</code>). Live World, battles, hatchery,
        and marketplace stay unloaded until your session is valid.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-10 text-sm text-[var(--text-muted)]">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
