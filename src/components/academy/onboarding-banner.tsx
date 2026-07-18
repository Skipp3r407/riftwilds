"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  dismissOnboardingBanner,
  hasStartedAcademy,
  loadAcademyProgress,
} from "@/game/academy";
import { academyHref } from "@/game/academy/catalog";

/** First-time hook for Play / dashboard surfaces. */
export function AcademyOnboardingBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const p = loadAcademyProgress();
    if (!p.onboardingBannerDismissed && !hasStartedAcademy(p)) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--cyan)]/30 bg-[rgba(61,231,255,0.08)] px-4 py-3">
      <div>
        <p className="font-display text-sm text-[var(--cyan)]">Player Academy</p>
        <p className="text-xs text-[var(--text-muted)]">
          New here? Take the interactive tutorial — credits are earned by playing; SOL is never
          required for basics.
        </p>
      </div>
      <div className="flex gap-2">
        <Link href={academyHref("b01-welcome")} className="btn-primary focus-ring text-xs">
          Open Academy
        </Link>
        <button
          type="button"
          className="btn-secondary focus-ring text-xs"
          onClick={() => {
            dismissOnboardingBanner(loadAcademyProgress());
            setShow(false);
          }}
        >
          Later
        </button>
      </div>
    </div>
  );
}
