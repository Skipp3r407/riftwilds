"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SectionTitleBand, StatusChip } from "@/components/shared/page-header";
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button";
import type { AuthOnboardingPlan } from "@/lib/auth/modular-auth";
import type { AuthProviderDef } from "@/lib/auth/providers";

type OnboardingPayload = {
  enabled?: boolean;
  plan?: AuthOnboardingPlan;
  providers?: AuthProviderDef[];
};

export default function LoginPage() {
  const [data, setData] = useState<OnboardingPayload | null>(null);

  useEffect(() => {
    void fetch("/api/auth/onboarding")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  const plan = data?.plan;

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 md:px-6">
      <div>
        <SectionTitleBand slug="login" label="Account" kicker="Riftkeeper onboarding" />
        <p className="page-lede mt-4">
          {plan?.copy.lede ??
            "Sign in with email or social to play. Connect a Solana wallet later for token utility."}
        </p>
      </div>

      <section className="panel space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-xl text-white">
            {plan?.copy.headline ?? "Become a Riftkeeper"}
          </h2>
          <StatusChip tone="info">email / social first</StatusChip>
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-[var(--text-dim)]">Recommended</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {(plan?.providersPrimary ?? []).map((p) => (
              <button
                key={p.id}
                type="button"
                disabled={!p.implemented || !(plan?.flags.emailEnabled || plan?.flags.socialEnabled)}
                className="btn-secondary focus-ring justify-start px-4 py-3 text-left text-sm disabled:opacity-50"
                title={p.description}
              >
                <span className="text-white">{p.label}</span>
                <span className="mt-1 block text-[10px] text-[var(--text-dim)]">
                  {p.implemented ? "Ready when credentials configured" : "Scaffolding — not live yet"}
                </span>
              </button>
            ))}
          </div>
          <p className="text-xs text-[var(--amber)]">
            OAuth / email magic-link providers are scaffolded (NextAuth / Clerk bridges available).
            Wallet SIWS remains the live auth path today.
          </p>
        </div>

        <div className="border-t border-[var(--stroke)] pt-4">
          <p className="text-xs uppercase tracking-wide text-[var(--text-dim)]">
            Optional · Web3
          </p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            {plan?.copy.walletLater}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <WalletConnectButton />
            <Link href="/dashboard" className="btn-primary focus-ring text-sm">
              Continue to Dashboard
            </Link>
          </div>
        </div>
      </section>

      <section className="panel p-5">
        <h2 className="font-display text-lg text-white">Journey</h2>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-[var(--text-muted)]">
          {(plan?.steps ?? []).map((step) => (
            <li key={step}>{step.replaceAll("_", " ")}</li>
          ))}
        </ol>
      </section>

      <p className="text-xs text-[var(--text-dim)]">
        Soft play does not require a wallet. Claims and SOL marketplace need a linked wallet when
        those flags are enabled.
      </p>
    </div>
  );
}
