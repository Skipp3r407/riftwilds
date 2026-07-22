"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader, StatusChip } from "@/components/shared/page-header";
import { RiftPanel } from "@/components/ui/rift-panel";
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button";
import { RiftStakesLobby } from "@/components/rift-stakes/rift-stakes-lobby";
import { RiftStakesTreasuryPanel } from "@/components/rift-stakes/rift-stakes-treasury-panel";
import { playSfx } from "@/hooks/use-sfx";
import {
  BATTLE_HISTORY_MODE_FILTERS,
  BATTLE_HUB_MODE_META,
  BATTLE_HUB_MODES,
  battleHubHref,
  parseBattleHubMode,
  type BattleHubMode,
} from "@/lib/tcg/battle-hub";
import { cn } from "@/lib/utils/cn";
import { useCallback, useEffect, useState } from "react";
import { formatSol } from "@/game/rift-stakes/config";

type StakesPanel = "lobby" | "history" | "leaderboard" | "treasury";

function parseStakesPanel(value: string | null): StakesPanel {
  if (value === "history" || value === "leaderboard" || value === "treasury") {
    return value;
  }
  return "lobby";
}

function ModeLinkGrid({ mode }: { mode: BattleHubMode }) {
  const meta = BATTLE_HUB_MODE_META[mode];
  return (
    <ul className="mt-4 grid gap-2 sm:grid-cols-2">
      {(meta.relatedHrefs ?? []).map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            onClick={() => playSfx("ui.click")}
            className="btn-secondary focus-ring inline-flex w-full justify-center text-sm"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function PracticePanel() {
  return (
    <RiftPanel material="obsidian" className="space-y-3">
      <h2 className="font-display text-xl text-white">Practice</h2>
      <p className="text-sm text-[var(--text-muted)]">
        Sandbox the Practice Board vs Kael, tune decks in the Atelier, or run the guided tutorial.
        Nothing here touches ranked MMR or SOL.
      </p>
      <div className="flex flex-wrap gap-2">
        <Link
          href="/tcg/battle?mode=practice&board=1"
          onClick={() => playSfx("ui.click")}
          className="btn-primary focus-ring text-sm"
        >
          Open Practice Board
        </Link>
        <Link href="/tcg/tutorial" className="btn-secondary focus-ring text-sm">
          Tutorial
        </Link>
        <Link href="/tcg/deck-builder" className="btn-secondary focus-ring text-sm">
          Deck Atelier
        </Link>
      </div>
      <ModeLinkGrid mode="practice" />
    </RiftPanel>
  );
}

function CasualPanel() {
  return (
    <RiftPanel material="obsidian" className="space-y-3">
      <h2 className="font-display text-xl text-white">Casual</h2>
      <p className="text-sm text-[var(--text-muted)]">
        Quick free matches, friend challenges, and private rooms. Queues stay fully free — Rift
        Stakes never shares this matchmaking pool.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            title: "Quick match",
            body: "Join the free Arena queue.",
            href: "/arena#queue",
          },
          {
            title: "Friends",
            body: "Challenge Keepers from Social.",
            href: "/social?tab=friends",
          },
          {
            title: "Private room",
            body: "Invite link on the Practice Board.",
            href: "/tcg/battle?mode=practice&board=1",
          },
        ].map((card) => (
          <Link
            key={card.title}
            href={card.href}
            onClick={() => playSfx("ui.click")}
            className="rounded-xl border border-[rgba(61,231,255,0.18)] bg-[rgba(8,12,22,0.55)] p-4 transition hover:border-[rgba(61,231,255,0.4)]"
          >
            <p className="font-display text-sm text-white">{card.title}</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">{card.body}</p>
          </Link>
        ))}
      </div>
      <ModeLinkGrid mode="casual" />
    </RiftPanel>
  );
}

function RankedPanel() {
  return (
    <RiftPanel material="obsidian" className="space-y-3">
      <h2 className="font-display text-xl text-white">Ranked</h2>
      <p className="text-sm text-[var(--text-muted)]">
        Seasonal ladders, MMR, and skill-normalized decks. Competitive and free — no wallet
        required.
      </p>
      <dl className="grid gap-2 text-sm sm:grid-cols-3">
        {[
          ["Season", "Active free ladder"],
          ["Rank", "Tier climb · Arena Points"],
          ["MMR", "Skill queue · no SOL"],
        ].map(([k, v]) => (
          <div
            key={k}
            className="rounded-xl border border-[rgba(61,231,255,0.14)] bg-[rgba(8,12,22,0.45)] p-3"
          >
            <dt className="text-[10px] uppercase tracking-[0.16em] text-[var(--cyan)]">{k}</dt>
            <dd className="mt-1 text-[var(--text)]">{v}</dd>
          </div>
        ))}
      </dl>
      <ModeLinkGrid mode="ranked" />
    </RiftPanel>
  );
}

function AiPanel() {
  return (
    <RiftPanel material="obsidian" className="space-y-3">
      <h2 className="font-display text-xl text-white">AI Challenge</h2>
      <p className="text-sm text-[var(--text-muted)]">
        Difficulty tiers, story bosses, and training drills. Start on the Practice Board or legacy
        training grounds.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {["Easy", "Normal", "Hard", "Boss"].map((tier) => (
          <div
            key={tier}
            className="rounded-xl border border-[rgba(61,231,255,0.14)] bg-[rgba(8,12,22,0.45)] p-3"
          >
            <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--amber)]">
              Difficulty
            </p>
            <p className="mt-1 font-display text-white">{tier}</p>
          </div>
        ))}
      </div>
      <ModeLinkGrid mode="ai" />
    </RiftPanel>
  );
}

function TournamentPanel() {
  return (
    <RiftPanel material="obsidian" className="space-y-3">
      <h2 className="font-display text-xl text-white">Tournament</h2>
      <p className="text-sm text-[var(--text-muted)]">
        Upcoming, live, hosted, and guild cups. Free-entry architecture first; SOL tournament
        flags stay off until compliance.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Upcoming", "Browse the calendar"],
          ["Live", "Spectate & join open cups"],
          ["Hosted", "Player-run brackets"],
          ["Guild", "Guild clash seasons"],
        ].map(([title, body]) => (
          <div
            key={title}
            className="rounded-xl border border-[rgba(61,231,255,0.14)] bg-[rgba(8,12,22,0.45)] p-3"
          >
            <p className="font-display text-sm text-white">{title}</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">{body}</p>
          </div>
        ))}
      </div>
      <ModeLinkGrid mode="tournament" />
    </RiftPanel>
  );
}

function StakesHistoryInline() {
  const [rows, setRows] = useState<
    { id: string; publicId?: string; status?: string; createdAt?: string }[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/rift-stakes/history", { credentials: "include" })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "HISTORY_FAILED");
        setRows(json.matches ?? json.history ?? []);
        setError(null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "HISTORY_FAILED"));
  }, []);

  if (error) {
    return <p className="text-sm text-rose-200/90">{error}</p>;
  }
  if (!rows.length) {
    return (
      <p className="text-sm text-[var(--text-muted)]">
        No stake matches yet. Queue from the lobby when you are ready.
      </p>
    );
  }
  return (
    <ul className="space-y-2 text-sm">
      {rows.slice(0, 12).map((m) => (
        <li key={m.id}>
          <Link
            href={`/rift-stakes/match?id=${m.id}`}
            className="text-[var(--accent)] underline"
          >
            {m.publicId ?? m.id}
          </Link>
          <span className="ml-2 text-[var(--text-muted)]">
            {m.status ?? "—"}
            {m.createdAt ? ` · ${new Date(m.createdAt).toLocaleString()}` : ""}
          </span>
        </li>
      ))}
    </ul>
  );
}

function StakesLeaderboardInline() {
  const [rows, setRows] = useState<
    {
      displayName?: string;
      wins?: number;
      losses?: number;
      netLamports?: number;
    }[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/rift-stakes/leaderboard")
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "LEADERBOARD_FAILED");
        setRows(json.leaderboard ?? []);
        setError(null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "LEADERBOARD_FAILED"));
  }, []);

  if (error) {
    return <p className="text-sm text-rose-200/90">{error}</p>;
  }
  if (!rows.length) {
    return (
      <p className="text-sm text-[var(--text-muted)]">
        Leaderboard populates after settled stake matches.
      </p>
    );
  }
  return (
    <ol className="space-y-2 text-sm">
      {rows.slice(0, 15).map((row, i) => (
        <li
          key={`${row.displayName ?? "p"}-${i}`}
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[rgba(61,231,255,0.12)] px-3 py-2"
        >
          <span className="text-[var(--text)]">
            #{i + 1} {row.displayName ?? "Keeper"}
          </span>
          <span className="tabular-nums text-[var(--text-muted)]">
            {row.wins ?? 0}W / {row.losses ?? 0}L
            {row.netLamports != null
              ? ` · net ${formatSol(row.netLamports)} SOL`
              : ""}
          </span>
        </li>
      ))}
    </ol>
  );
}

function StakesPanel({
  panel,
  onPanel,
}: {
  panel: StakesPanel;
  onPanel: (p: StakesPanel) => void;
}) {
  const tabs: { id: StakesPanel; label: string }[] = [
    { id: "lobby", label: "Lobby" },
    { id: "history", label: "History" },
    { id: "leaderboard", label: "Leaderboard" },
    { id: "treasury", label: "Fee treasury" },
  ];

  return (
    <div className="space-y-4">
      <RiftPanel material="gold" className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-xl text-white">Rift Stakes</h2>
              <StatusChip tone="warn">Optional · SOL</StatusChip>
              <StatusChip tone="info">Wallet required</StatusChip>
            </div>
            <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
              Wager UI only — stake tiers, custom/private/friend queues, prize pool, fee preview,
              escrow, and settlement. Free Practice and Free Arena live under other Battle tabs.
            </p>
          </div>
          <WalletConnectButton />
        </div>
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Rift Stakes panels">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={panel === t.id}
              onClick={() => {
                playSfx("ui.nav");
                onPanel(t.id);
              }}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs uppercase tracking-[0.14em] transition",
                panel === t.id
                  ? "bg-amber-500/25 text-amber-100 ring-1 ring-amber-400/50"
                  : "bg-[rgba(8,12,22,0.55)] text-[var(--text-muted)] hover:text-[var(--text)]",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </RiftPanel>

      {panel === "lobby" ? <RiftStakesLobby hubEmbedded /> : null}
      {panel === "history" ? (
        <RiftPanel material="obsidian">
          <h3 className="font-display text-lg text-white">Stake match history</h3>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Settled and open stake matches only — free Arena history stays under Casual / Ranked.
          </p>
          <div className="mt-4">
            <StakesHistoryInline />
          </div>
        </RiftPanel>
      ) : null}
      {panel === "leaderboard" ? (
        <RiftPanel material="obsidian">
          <h3 className="font-display text-lg text-white">Stakes leaderboard</h3>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Wins, losses, and net SOL from settled stakes only.
          </p>
          <div className="mt-4">
            <StakesLeaderboardInline />
          </div>
        </RiftPanel>
      ) : null}
      {panel === "treasury" ? (
        <RiftPanel material="obsidian" className="space-y-3">
          <h3 className="font-display text-lg text-white">Fee treasury</h3>
          <p className="text-xs text-[var(--text-muted)]">
            Platform fees from Rift Stakes only. Internal split remains transparent.
          </p>
          <RiftStakesTreasuryPanel />
        </RiftPanel>
      ) : null}
    </div>
  );
}

function ModePanel({
  mode,
  stakesPanel,
  onStakesPanel,
}: {
  mode: BattleHubMode;
  stakesPanel: StakesPanel;
  onStakesPanel: (p: StakesPanel) => void;
}) {
  switch (mode) {
    case "practice":
      return <PracticePanel />;
    case "casual":
      return <CasualPanel />;
    case "ranked":
      return <RankedPanel />;
    case "ai":
      return <AiPanel />;
    case "tournament":
      return <TournamentPanel />;
    case "stakes":
      return <StakesPanel panel={stakesPanel} onPanel={onStakesPanel} />;
    default:
      return null;
  }
}

export function BattleHub({
  initialMode,
  initialPanel,
}: {
  /** When set (or `?mode=` present), open that tab instead of the mode-card grid. */
  initialMode?: BattleHubMode | null;
  initialPanel?: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode") ?? initialMode ?? null;
  const modeFromUrl = parseBattleHubMode(modeParam, "practice");
  const [mode, setMode] = useState<BattleHubMode>(modeFromUrl);
  const [stakesPanel, setStakesPanel] = useState<StakesPanel>(
    parseStakesPanel(searchParams.get("panel") ?? initialPanel ?? null),
  );
  const [showModeGrid, setShowModeGrid] = useState(!modeParam);

  useEffect(() => {
    const nextParam = searchParams.get("mode") ?? initialMode ?? null;
    setMode(parseBattleHubMode(nextParam, "practice"));
    setStakesPanel(parseStakesPanel(searchParams.get("panel")));
    setShowModeGrid(!nextParam);
  }, [initialMode, searchParams]);

  const selectMode = useCallback(
    (next: BattleHubMode, panel?: StakesPanel) => {
      playSfx("ui.nav");
      setMode(next);
      setShowModeGrid(false);
      if (next === "stakes") {
        const nextPanel = panel ?? "lobby";
        setStakesPanel(nextPanel);
        router.replace(
          battleHubHref(
            next,
            nextPanel === "lobby" ? undefined : { panel: nextPanel },
          ),
          { scroll: false },
        );
        return;
      }
      router.replace(battleHubHref(next), { scroll: false });
    },
    [router],
  );

  const onStakesPanel = useCallback(
    (panel: StakesPanel) => {
      setStakesPanel(panel);
      router.replace(
        battleHubHref("stakes", panel === "lobby" ? undefined : { panel }),
        { scroll: false },
      );
    },
    [router],
  );

  const activeMeta = BATTLE_HUB_MODE_META[mode];

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Battle Hub"
        titleSlug="arena"
        title="Rift Battle"
        description="Every PvP and PvE mode lives here — Practice, Casual, Ranked, AI, Tournament, and optional Rift Stakes. Switching tabs never leaves Battle."
        status="Hub"
        statusTone="live"
        actions={
          <>
            <Link
              href="/tcg/battle?mode=practice&board=1"
              className="btn-secondary focus-ring"
              onClick={() => playSfx("ui.click")}
            >
              Practice Board
            </Link>
            <Link href="/tcg/deck-builder" className="btn-secondary focus-ring">
              Deck Atelier
            </Link>
            <button
              type="button"
              className="btn-secondary focus-ring"
              onClick={() => {
                playSfx("ui.click");
                setShowModeGrid(true);
              }}
            >
              All modes
            </button>
          </>
        }
      />

      <nav
        className="flex flex-wrap gap-1.5 rounded-2xl border border-[rgba(61,231,255,0.16)] bg-[rgba(6,10,18,0.72)] p-2"
        aria-label="Battle modes"
      >
        {BATTLE_HUB_MODES.map((id) => {
          const meta = BATTLE_HUB_MODE_META[id];
          const active = mode === id && !showModeGrid;
          return (
            <button
              key={id}
              type="button"
              onClick={() => selectMode(id)}
              className={cn(
                "rounded-xl px-3 py-2 text-left transition",
                active
                  ? "bg-[rgba(61,231,255,0.16)] text-white ring-1 ring-[rgba(61,231,255,0.45)]"
                  : "text-[var(--text-muted)] hover:bg-[rgba(61,231,255,0.08)] hover:text-[var(--text)]",
              )}
              aria-current={active ? "page" : undefined}
            >
              <span className="block text-sm font-medium">{meta.shortLabel}</span>
              {meta.badge ? (
                <span
                  className={cn(
                    "mt-0.5 block text-[10px] uppercase tracking-[0.12em]",
                    id === "stakes" ? "text-amber-200/90" : "text-[var(--text-dim)]",
                  )}
                >
                  {meta.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <AnimatePresence mode="wait">
        {showModeGrid ? (
          <motion.section
            key="mode-grid"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
            aria-label="Battle mode cards"
          >
            {BATTLE_HUB_MODES.map((id, i) => {
              const meta = BATTLE_HUB_MODE_META[id];
              return (
                <motion.button
                  key={id}
                  type="button"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ y: -3 }}
                  onClick={() => selectMode(id)}
                  className={cn(
                    "group overflow-hidden rounded-2xl border text-left transition",
                    id === "stakes"
                      ? "border-amber-400/40 bg-amber-950/20 hover:border-amber-300/60"
                      : "border-[rgba(61,231,255,0.18)] bg-[rgba(8,12,22,0.65)] hover:border-[rgba(61,231,255,0.4)]",
                  )}
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden">
                    <Image
                      src={meta.thumbnail}
                      alt=""
                      fill
                      className="object-cover transition duration-300 group-hover:scale-[1.03]"
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      priority={i < 3}
                    />
                    <div
                      className={cn(
                        "pointer-events-none absolute inset-0 bg-gradient-to-t to-transparent",
                        id === "stakes"
                          ? "from-[rgba(28,16,6,0.92)] via-[rgba(28,16,6,0.35)]"
                          : "from-[rgba(6,10,18,0.92)] via-[rgba(6,10,18,0.35)]",
                      )}
                      aria-hidden
                    />
                  </div>
                  <div className="relative -mt-8 space-y-1 px-5 pb-5 pt-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-lg text-white drop-shadow-sm">{meta.label}</p>
                      {meta.badge ? (
                        <StatusChip tone={meta.badgeTone ?? "default"}>{meta.badge}</StatusChip>
                      ) : null}
                    </div>
                    <p
                      className={cn(
                        "text-xs uppercase tracking-[0.14em]",
                        id === "stakes" ? "text-amber-200/90" : "text-[var(--cyan)]",
                      )}
                    >
                      {meta.tagline}
                    </p>
                    <p className="text-sm text-[var(--text-muted)]">{meta.description}</p>
                  </div>
                </motion.button>
              );
            })}
          </motion.section>
        ) : (
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-dim)]">
              Mode · {activeMeta.label}
            </p>
            <ModePanel
              mode={mode}
              stakesPanel={stakesPanel}
              onStakesPanel={onStakesPanel}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <RiftPanel material="marble" padding="sm" className="space-y-2">
        <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--amber)]">
          Match history · filter by mode
        </p>
        <div className="flex flex-wrap gap-2">
          {BATTLE_HISTORY_MODE_FILTERS.map((f) => (
            <Link
              key={f.id}
              href={f.href}
              className="rounded-full border border-[rgba(61,231,255,0.2)] px-3 py-1 text-xs text-[var(--text-muted)] transition hover:border-[rgba(61,231,255,0.45)] hover:text-[var(--text)]"
            >
              {f.label}
            </Link>
          ))}
        </div>
      </RiftPanel>
    </div>
  );
}
