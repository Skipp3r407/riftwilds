import Link from "next/link";
import { CreditsWallet } from "@/components/credits/credits-wallet";
import { MapGoalsPanel } from "@/components/map-goals/map-goals-panel";
import { CREDITS_DISCLAIMER, FAUCET_SINK_PAIRINGS, STARTER_CREDITS } from "@/lib/credits/config";
import { SectionTitleBand } from "@/components/shared/page-header";

export const metadata = {
  title: "Credits Economy Guide",
  description:
    "How Riftwilds Credits work — soft currency faucets, sinks, and clear separation from SOL and tokens.",
};

export default function CreditsEconomyGuidePage() {
  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-10 md:px-6">
      <SectionTitleBand
        slug="economy"
        label="Credits"
        kicker="Soft currency guide"
        className="mb-2"
      />
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <h1 className="font-display text-3xl font-bold text-white md:text-4xl">
            Credits are for play — not profit
          </h1>
          <p className="text-[var(--text-muted)]">{CREDITS_DISCLAIMER}</p>
          <div className="panel space-y-3 p-4 text-sm text-[var(--text-muted)]">
            <p>
              <strong className="text-white">Credits</strong> — in-game soft currency earned from
              quests, jobs, gather/craft (capped), events, and small achievements. Starting grant:{" "}
              {STARTER_CREDITS}.
            </p>
            <p>
              <strong className="text-white">Token</strong> — the Riftwilds community token / Pump.fun
              coin. Holding it does not mint Credits or guarantee SOL.
            </p>
            <p>
              <strong className="text-white">SOL</strong> — blockchain currency. Real SOL marketplace
              paths stay feature-flagged off. Credits never convert to guaranteed SOL payouts.
            </p>
          </div>
          <div className="space-y-2">
            <h2 className="font-display text-xl text-white">Faucets ↔ sinks</h2>
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
              {FAUCET_SINK_PAIRINGS.map((p) => (
                <li key={p.faucet} className="border-b border-[var(--stroke)] pb-2">
                  <span className="text-white">{p.faucet}</span> → {p.sinks.join(", ")}
                  <br />
                  <span className="text-xs text-[var(--text-dim)]">{p.note}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/economy" className="btn-secondary focus-ring text-sm">
              Treasury economy
            </Link>
            <Link href="/live-world" className="btn-primary focus-ring text-sm">
              Play Live World
            </Link>
            <Link href="/restoration" className="btn-secondary focus-ring text-sm">
              Restoration sinks
            </Link>
          </div>
        </div>
        <div className="space-y-4">
          <CreditsWallet />
          <MapGoalsPanel starterOnly />
        </div>
      </div>
    </div>
  );
}
