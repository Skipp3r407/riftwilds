"use client";

import { FormEvent, Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SoundscapeMount } from "@/components/audio/soundscape-mount";
import { SectionTitleBand, StatusChip } from "@/components/shared/page-header";

type Step = {
  id: string;
  required: boolean;
  done: boolean;
  label: string;
};

type State = {
  complete: boolean;
  steps: Step[];
  nextStep: string | null;
};

function OnboardingInner() {
  const router = useRouter();
  const search = useSearchParams();
  const returnUrl = search.get("returnUrl") || "/play";

  const [state, setState] = useState<State | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [region, setRegion] = useState("US");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [starterKeeperId, setStarterKeeperId] = useState("ember");
  const [tutorialIntroSeen, setTutorialIntroSeen] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/auth/onboarding/complete", {
      credentials: "same-origin",
    });
    if (res.status === 401) {
      setError("Session missing — sign in again to finish onboarding.");
      router.replace(
        `/login?returnUrl=${encodeURIComponent("/onboarding")}&reason=login-required`,
      );
      return;
    }
    const json = await res.json().catch(() => null);
    setState(json?.state ?? null);
    if (json?.profile?.displayName) setDisplayName(json.profile.displayName);
    if (json?.profile?.username) setUsername(json.profile.username);
    if (json?.state?.complete) {
      router.replace(returnUrl.startsWith("/") ? returnUrl : "/play");
    }
  }, [router, returnUrl]);

  useEffect(() => {
    void load();
  }, [load]);

  async function submit(payload: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/onboarding/complete", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setError(
          json?.error?.message ??
            (res.status === 401
              ? "Session expired — sign in again."
              : "Could not save onboarding step"),
        );
        return;
      }
      setState(json.state);
      if (json.state?.complete) {
        router.push(json.next ?? returnUrl);
        router.refresh();
      }
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!acceptTerms || !acceptPrivacy) {
      setError("Terms and Privacy must be accepted — no skip.");
      return;
    }
    await submit({
      displayName,
      username,
      dateOfBirth,
      region,
      acceptTerms: true,
      acceptPrivacy: true,
      starterKeeperId,
      claimStarterEgg: true,
      tutorialIntroSeen: tutorialIntroSeen || true,
    });
  }

  return (
    <div className="relative mx-auto max-w-xl space-y-6 px-4 py-10 md:px-6">
      <SoundscapeMount mode="login" fadeMs={700} />
      <SectionTitleBand
        slug="login"
        label="Onboarding"
        kicker="Riftkeeper setup"
        atmosphere={false}
      />
      <StatusChip tone="info">required steps — no skip</StatusChip>

      {state ? (
        <ul className="space-y-1 text-sm text-[var(--text-muted)]">
          {state.steps.map((s) => (
            <li key={s.id}>
              {s.done ? "✓" : "○"} {s.label}
              {s.required && !s.done ? " (required)" : ""}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-[var(--text-dim)]">Loading account…</p>
      )}

      <form
        onSubmit={onSubmit}
        className="panel space-y-3 bg-[rgba(8,12,20,0.82)] p-6 backdrop-blur-[3px]"
      >
        <label className="block text-sm text-[var(--text-muted)]">
          Display name
          <input
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--stroke)] bg-[rgba(6,10,18,0.85)] px-3 py-2 text-white"
          />
        </label>
        <label className="block text-sm text-[var(--text-muted)]">
          Username
          <input
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            pattern="[A-Za-z][A-Za-z0-9_]{2,23}"
            className="mt-1 w-full rounded-lg border border-[var(--stroke)] bg-[rgba(6,10,18,0.85)] px-3 py-2 text-white"
          />
        </label>
        <label className="block text-sm text-[var(--text-muted)]">
          Date of birth
          <input
            type="date"
            required
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--stroke)] bg-[rgba(6,10,18,0.85)] px-3 py-2 text-white"
          />
        </label>
        <label className="block text-sm text-[var(--text-muted)]">
          Region
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--stroke)] bg-[rgba(6,10,18,0.85)] px-3 py-2 text-white"
          >
            <option value="US">United States</option>
            <option value="EU">Europe</option>
            <option value="KR">Korea</option>
            <option value="OTHER">Other</option>
          </select>
        </label>
        <label className="block text-sm text-[var(--text-muted)]">
          Starter Keeper affinity
          <select
            value={starterKeeperId}
            onChange={(e) => setStarterKeeperId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--stroke)] bg-[rgba(6,10,18,0.85)] px-3 py-2 text-white"
          >
            <option value="ember">Ember</option>
            <option value="tide">Tide</option>
            <option value="grove">Grove</option>
            <option value="storm">Storm</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
          />
          Accept Terms of Service
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <input
            type="checkbox"
            checked={acceptPrivacy}
            onChange={(e) => setAcceptPrivacy(e.target.checked)}
          />
          Accept Privacy Policy
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <input
            type="checkbox"
            checked={tutorialIntroSeen}
            onChange={(e) => setTutorialIntroSeen(e.target.checked)}
          />
          I&apos;ve seen the tutorial intro
        </label>
        {error ? <p className="text-sm text-[var(--ember)]">{error}</p> : null}
        <button type="submit" disabled={busy} className="btn-primary focus-ring text-sm">
          {busy ? "Saving…" : "Complete onboarding & enter"}
        </button>
      </form>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="p-10 text-sm text-[var(--text-muted)]">Loading…</div>}>
      <OnboardingInner />
    </Suspense>
  );
}
