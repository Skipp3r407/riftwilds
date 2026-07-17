"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PageHeader, StatusChip } from "@/components/shared/page-header";
import { GlobalActivityFeed } from "@/components/ecosystem/activity-feed";
import { PresenceChip } from "@/components/ecosystem/presence-chip";
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button";
import { dashboardPanelArtPath } from "@/lib/assets/paths";
import type {
  DashboardPanel,
  PlayerDashboardSnapshot,
} from "@/lib/ecosystem/player-dashboard";

const PANEL_ALT: Record<string, string> = {
  identity: "Riftkeeper identity emblem with avatar frame",
  balances: "Soft currency crystals and demo credit shards",
  roster: "Living Riftlings in your care",
  eggs: "Incubating eggs on a hatchery pedestal",
  cosmetics: "Cosmetic loadout cloak and homestead flair",
  achievements: "Achievement trophy crest and constellation rings",
  listings: "Marketplace listing booth with glowing wares",
  inventory: "Inventory satchel with materials and scrolls",
  quests: "Story quest scroll with magical seal",
  missions: "Timed mission hourglass and care loop spark",
  battle: "Arena training clash inside a rift ring",
  exploration: "Expedition path into a glowing rift canyon",
  friends: "Social bond between two keepers",
  messages: "Sealed message envelope with cyan crest",
  guild: "Guild banner crest with crossed spears",
  region: "Hatchery Plaza lanterns and incubator pedestals",
};

function panelStatusChip(panel: DashboardPanel) {
  if (panel.status === "live") {
    return <StatusChip tone="live">Live</StatusChip>;
  }
  if (panel.status === "partial") {
    return <StatusChip tone="info">Partial</StatusChip>;
  }
  /* Art-backed panels: demote empty-data scaffolding — no PLACEHOLDER badge */
  return null;
}

export default function PlayerDashboardPage() {
  const [dashboard, setDashboard] = useState<PlayerDashboardSnapshot | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/dashboard")
      .then((r) => r.json())
      .then(
        (json: {
          dashboard?: PlayerDashboardSnapshot;
          authenticated?: boolean;
        }) => {
          setDashboard(json.dashboard ?? null);
          setAuthenticated(Boolean(json.authenticated));
        },
      )
      .catch(() => setDashboard(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Player hub"
        titleSlug="dashboard"
        title="Riftkeeper Dashboard"
        description="Your MMO home — roster, balances, quests, guild, and social. Email/social login first; wallet connect optional for Web3 utility."
        status={authenticated ? "Signed in" : "Guest"}
        statusTone={authenticated ? "live" : "info"}
        actions={
          <>
            <PresenceChip />
            <Link href="/login" className="btn-secondary focus-ring text-sm">
              Account
            </Link>
            <WalletConnectButton />
            <Link href="/play" className="btn-primary focus-ring text-sm">
              Play
            </Link>
          </>
        }
      />

      {loading ? (
        <p className="text-sm text-[var(--text-muted)]">Loading dashboard…</p>
      ) : dashboard ? (
        <>
          <section className="panel flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <p className="font-display text-2xl text-white">{dashboard.displayName}</p>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                {dashboard.rankTitle}
                {dashboard.walletShort ? ` · ${dashboard.walletShort}` : " · Wallet not linked"}
                {" · "}
                {dashboard.regionLabel}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {dashboard.quickLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="btn-secondary focus-ring inline-flex items-center gap-1.5 text-xs"
                >
                  <QuickLinkIcon label={l.label} />
                  {l.label}
                </Link>
              ))}
            </div>
          </section>

          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {dashboard.panels.map((panel) => {
              const body = (
                <>
                  <div className="section-card-thumb border-b border-[rgba(61,231,255,0.12)]">
                    <Image
                      src={dashboardPanelArtPath(panel.id)}
                      alt={PANEL_ALT[panel.id] ?? panel.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      className="section-card-thumb__img"
                      unoptimized
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="font-display text-lg text-white">{panel.title}</h2>
                      {panelStatusChip(panel)}
                    </div>
                    <p className="mt-2 text-xs text-[var(--text-muted)]">{panel.summary}</p>
                    <ul className="mt-3 space-y-1 text-xs text-[var(--text-dim)]">
                      {panel.metrics.map((m) => (
                        <li key={m.label} className="flex justify-between gap-2">
                          <span>{m.label}</span>
                          <span className="text-white">{m.value}</span>
                        </li>
                      ))}
                    </ul>
                    {panel.href ? (
                      <span className="mt-auto pt-3 text-xs text-[var(--cyan)]">Open →</span>
                    ) : null}
                  </div>
                </>
              );

              if (panel.href) {
                return (
                  <Link
                    key={panel.id}
                    href={panel.href}
                    className="panel group flex flex-col overflow-hidden transition hover:border-[rgba(61,231,255,0.35)] hover:shadow-[0_0_24px_rgba(61,231,255,0.1)] focus-ring"
                  >
                    {body}
                  </Link>
                );
              }

              return (
                <article key={panel.id} className="panel group flex flex-col overflow-hidden">
                  {body}
                </article>
              );
            })}
          </section>

          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <GlobalActivityFeed limit={10} />
            <section className="panel space-y-2 p-5 text-xs text-[var(--text-muted)]">
              <h2 className="font-display text-lg text-white">Notes</h2>
              {dashboard.disclaimers.map((d) => (
                <p key={d}>{d}</p>
              ))}
              <p className="text-[var(--amber)]">
                Metrics stay honest — zeros and gaps mean data is not fabricated.
              </p>
            </section>
          </div>
        </>
      ) : (
        <p className="text-sm text-[var(--text-muted)]">Dashboard unavailable.</p>
      )}
    </div>
  );
}

function QuickLinkIcon({ label }: { label: string }) {
  const common = "h-3.5 w-3.5 shrink-0 text-[var(--cyan)] opacity-80";
  switch (label) {
    case "Play":
      return (
        <svg className={common} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
          <path d="M4 2.5v11l9-5.5-9-5.5z" />
        </svg>
      );
    case "Live World":
      return (
        <svg className={common} viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden>
          <circle cx="8" cy="8" r="5.5" strokeWidth="1.4" />
          <path d="M2.5 8h11M8 2.5c1.8 1.8 1.8 9.2 0 11M8 2.5c-1.8 1.8-1.8 9.2 0 11" strokeWidth="1.2" />
        </svg>
      );
    case "Rewards":
      return (
        <svg className={common} viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden>
          <path d="M3 6h10v2.5c0 2.5-2 4.5-5 5.5-3-1-5-3-5-5.5V6z" strokeWidth="1.3" />
          <path d="M5 6V4.5C5 3.5 6 3 8 3s3 .5 3 1.5V6" strokeWidth="1.3" />
        </svg>
      );
    case "Treasury":
      return (
        <svg className={common} viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden>
          <rect x="2.5" y="5" width="11" height="8" rx="1.2" strokeWidth="1.3" />
          <path d="M5 5V4a3 3 0 0 1 6 0v1M8 8.5v2" strokeWidth="1.3" />
        </svg>
      );
    case "Account":
      return (
        <svg className={common} viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden>
          <circle cx="8" cy="5.5" r="2.2" strokeWidth="1.3" />
          <path d="M3.5 13c.8-2.2 2.4-3.2 4.5-3.2S12.7 10.8 13.5 13" strokeWidth="1.3" />
        </svg>
      );
    case "Profile":
      return (
        <svg className={common} viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden>
          <circle cx="8" cy="8" r="5.5" strokeWidth="1.3" />
          <circle cx="8" cy="6.5" r="1.6" strokeWidth="1.2" />
          <path d="M4.8 12.2c.7-1.4 1.9-2.1 3.2-2.1s2.5.7 3.2 2.1" strokeWidth="1.2" />
        </svg>
      );
    default:
      return null;
  }
}
