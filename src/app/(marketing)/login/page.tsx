"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AuthProviderIcon } from "@/components/auth/auth-provider-icons";
import { SoundscapeMount } from "@/components/audio/soundscape-mount";
import { SectionTitleBand, StatusChip } from "@/components/shared/page-header";
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button";
import { playSfx } from "@/hooks/use-sfx";
import type { AuthOnboardingPlan, AuthOnboardingStep } from "@/lib/auth/modular-auth";
import type { AuthProviderDef } from "@/lib/auth/providers";

type OnboardingPayload = {
  enabled?: boolean;
  plan?: AuthOnboardingPlan;
  providers?: AuthProviderDef[];
};

const JOURNEY_VISUALS: Record<
  AuthOnboardingStep,
  { src: string; alt: string; blurb: string }
> = {
  choose_login: {
    src: "/assets/auth/journey/01-choose-login.svg",
    alt: "Login hall doorway",
    blurb: "Pick how you enter the hall",
  },
  email_or_social: {
    src: "/assets/auth/journey/02-email-social.svg",
    alt: "Email and social links",
    blurb: "Email or social — no wallet needed",
  },
  create_riftkeeper: {
    src: "/assets/auth/journey/03-create-riftkeeper.svg",
    alt: "Rift egg and keeper",
    blurb: "Your Riftkeeper identity begins",
  },
  optional_wallet: {
    src: "/assets/auth/journey/04-optional-wallet.svg",
    alt: "Optional wallet",
    blurb: "Link later for Web3 features",
  },
  holdings_recognized: {
    src: "/assets/auth/journey/05-holdings-recognized.svg",
    alt: "Eggs and pets synced",
    blurb: "Eggs, pets, and claims sync",
  },
  play: {
    src: "/assets/auth/journey/06-play.svg",
    alt: "Play the Riftwilds",
    blurb: "Step into the Riftwilds",
  },
};

const FALLBACK_STEPS: AuthOnboardingStep[] = [
  "choose_login",
  "email_or_social",
  "create_riftkeeper",
  "optional_wallet",
  "holdings_recognized",
  "play",
];

export default function LoginPage() {
  const [data, setData] = useState<OnboardingPayload | null>(null);

  useEffect(() => {
    void fetch("/api/auth/onboarding")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  const plan = data?.plan;
  const steps = plan?.steps?.length ? plan.steps : FALLBACK_STEPS;
  const providers = plan?.providersPrimary?.length
    ? plan.providersPrimary
    : ([
        { id: "email", label: "Email", description: "Magic-link", implemented: false },
        { id: "google", label: "Google", description: "Social", implemented: false },
        { id: "discord", label: "Discord", description: "Social", implemented: false },
        { id: "twitter", label: "X / Twitter", description: "Social", implemented: false },
      ] as AuthProviderDef[]);

  return (
    <div className="relative mx-auto max-w-3xl space-y-8 px-4 py-10 md:px-6">
      <SoundscapeMount mode="login" fadeMs={900} />
      {/* Hero band — hatchery egg accent over RouteWallpaper */}
      <header className="panel relative overflow-hidden bg-[rgba(8,12,20,0.78)] p-0 backdrop-blur-[3px]">
        <div className="grid items-stretch sm:grid-cols-[1fr_11rem]">
          <div className="relative z-[1] space-y-3 p-6 md:p-7">
            <SectionTitleBand
              slug="login"
              label="Account"
              kicker="Riftkeeper onboarding"
              atmosphere={false}
            />
            <p className="page-lede max-w-md text-sm md:text-[0.95rem]">
              {plan?.copy.lede ??
                "Sign in with email or social to play. Connect a Solana wallet later for token utility, claims, and marketplace settlements."}
            </p>
          </div>
          <div className="relative min-h-[9.5rem] border-t border-[var(--stroke)] sm:min-h-0 sm:border-l sm:border-t-0">
            <Image
              src="/assets/eggs/mystery-rift-egg.png"
              alt=""
              fill
              className="object-contain object-center p-4"
              sizes="176px"
              unoptimized
              priority
            />
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(61,231,255,0.14)_0%,transparent_62%)]"
              aria-hidden
            />
          </div>
        </div>
      </header>

      <section className="panel relative space-y-4 bg-[rgba(8,12,20,0.82)] p-6 backdrop-blur-[3px]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-xl text-white">
            {plan?.copy.headline ?? "Become a Riftkeeper"}
          </h2>
          <StatusChip tone="info">email / social first</StatusChip>
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-[var(--text-dim)]">Recommended</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {providers.map((p) => (
              <button
                key={p.id}
                type="button"
                disabled={
                  !p.implemented || !(plan?.flags.emailEnabled || plan?.flags.socialEnabled)
                }
                className="btn-secondary focus-ring justify-start gap-3 px-4 py-3 text-left text-sm disabled:opacity-50"
                title={p.description}
                onClick={() => {
                  playSfx("ui.click");
                  if (p.implemented) playSfx("login.success");
                }}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[rgba(61,231,255,0.22)] bg-[rgba(10,14,24,0.65)] text-[var(--cyan)]">
                  <AuthProviderIcon id={p.id} />
                </span>
                <span className="min-w-0">
                  <span className="block text-white">{p.label}</span>
                  <span className="mt-0.5 block text-[10px] text-[var(--text-dim)]">
                    {p.implemented
                      ? "Ready when credentials configured"
                      : "Scaffolding — not live yet"}
                  </span>
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
          <div className="flex flex-wrap items-start gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[rgba(61,231,255,0.2)] bg-[rgba(6,10,18,0.7)]">
              <Image
                src="/assets/revenue/holder-stats/wallet.png"
                alt=""
                fill
                className="object-cover"
                sizes="64px"
                unoptimized
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-wide text-[var(--text-dim)]">
                Optional · Web3
              </p>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                {plan?.copy.walletLater ??
                  "Wallet connect is optional for soft-currency play. Link when you are ready for Web3 features."}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <WalletConnectButton />
                <Link href="/dashboard" className="btn-primary focus-ring text-sm">
                  Continue to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="panel relative space-y-4 bg-[rgba(8,12,20,0.82)] p-5 backdrop-blur-[3px] md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="font-display text-lg text-white">Journey</h2>
          <p className="text-xs text-[var(--text-dim)]">Wallet stays optional until you need it</p>
        </div>
        <ol className="grid gap-3 sm:grid-cols-2">
          {steps.map((step, index) => {
            const visual = JOURNEY_VISUALS[step] ?? {
              src: "/assets/auth/journey/06-play.svg",
              alt: step,
              blurb: step.replaceAll("_", " "),
            };
            return (
              <li
                key={step}
                className="flex gap-3 rounded-xl border border-[rgba(61,231,255,0.14)] bg-[rgba(6,10,18,0.55)] p-3"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-[rgba(61,231,255,0.22)] bg-[rgba(10,16,28,0.95)] shadow-[inset_0_0_18px_rgba(61,231,255,0.12)]">
                  {/* Dedicated journey thumbs — plain img so SVG marks always paint */}
                  <img
                    src={visual.src}
                    alt=""
                    width={56}
                    height={56}
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                  <span className="absolute left-1 top-1 z-[1] flex h-5 min-w-5 items-center justify-center rounded-md bg-[rgba(7,11,22,0.88)] px-1 text-[10px] font-semibold text-[var(--cyan)] ring-1 ring-[rgba(61,231,255,0.35)]">
                    {index + 1}
                  </span>
                </div>
                <div className="min-w-0 pt-0.5">
                  <p className="text-sm font-medium capitalize text-white">
                    {step.replaceAll("_", " ")}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--text-muted)]">{visual.blurb}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <p className="text-xs text-[var(--text-dim)]">
        Soft play does not require a wallet. Claims and SOL marketplace need a linked wallet when
        those flags are enabled.
      </p>

      <p className="text-xs text-[var(--text-muted)]">
        Multiplayer backend (Nakama) guest/email bridge lives under{" "}
        <Link href="/settings/nakama" className="text-[var(--cyan)] hover:underline">
          Settings → Nakama
        </Link>
        . It does not replace wallet SIWS or demo guest cookies.
      </p>
    </div>
  );
}
