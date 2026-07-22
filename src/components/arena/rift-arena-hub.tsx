"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { StatusChip } from "@/components/shared/page-header";
import { playSfx } from "@/hooks/use-sfx";
import { sectionUiThumbPath } from "@/lib/assets/paths";
import { enterSoundscape } from "@/lib/audio/adaptive-engine";
import { speakVoice } from "@/lib/audio/voice-bus";
import { cn } from "@/lib/utils/cn";

type MatchTypeMeta = {
  id: string;
  label: string;
  description: string;
  phase: number;
  playable: boolean;
  requiresWallet: boolean;
  solStakeCapable: boolean;
};

type LadderEntry = {
  rank: number;
  displayName: string;
  rating: number;
  wins: number;
  losses: number;
  streak: number;
};

type Champion = {
  displayName: string;
  title: string;
  rating: number;
};

type CalendarEvent = {
  id: string;
  title: string;
  when: string;
  kind: string;
  href: string;
};

type HistoryEntry = {
  id: string;
  matchType: string;
  opponentName: string;
  result: string;
  playedAt: string;
};

type HubPayload = {
  disclosures: Record<string, string>;
  matchTypes: MatchTypeMeta[];
  season: { id: string; name: string; active: boolean };
  ladder: LadderEntry[];
  champions: Champion[];
  calendar: CalendarEvent[];
  history: HistoryEntry[];
  flags: {
    hub: boolean;
    freeMatchmaking: boolean;
    rankedScaffold: boolean;
    solStakes: boolean;
    solEscrow: boolean;
  };
  admin: {
    matchmakingPaused: boolean;
    rankedPaused: boolean;
    solArenaPaused: boolean;
    dailyEntrySoftCap: number;
  };
  queueSize: number;
  stakeTiersDoc: { id: string; label: string; live: boolean }[];
};

const typeHref: Record<string, string> = {
  FREE: "/arena#queue",
  TRAINING: "/tcg/battle?mode=practice&board=1",
  PRIVATE: "/tcg/battle?mode=practice&board=1",
  FRIEND: "/social?tab=friends",
  RANKED: "/tcg/battle?mode=ranked",
  GUILD: "/tcg/battle?mode=tournament",
  TOURNAMENT: "/tcg/battle?mode=tournament",
  CUSTOM: "/arena/duels",
};

/** Painted match-type thumbs under public/assets/ui/arena/{slug}.png */
const typeThumbSlug: Record<string, string> = {
  FREE: "free-play",
  TRAINING: "training",
  PRIVATE: "private-invite",
  FRIEND: "friend-challenge",
  RANKED: "ranked",
  GUILD: "guild-clash",
  TOURNAMENT: "tournaments",
  CUSTOM: "duels",
};

export function RiftArenaHub() {
  const [data, setData] = useState<HubPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [queueMsg, setQueueMsg] = useState<string | null>(null);
  const [queueBusy, setQueueBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/rift-arena/status", { credentials: "include" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "STATUS_FAILED");
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "STATUS_FAILED");
    }
  }, []);

  useEffect(() => {
    void load();
    void enterSoundscape("arena", { fadeMs: 900 });
    speakVoice({ slot: "announcer.ready", priority: "normal" });
  }, [load]);

  const enqueue = async () => {
    setQueueBusy(true);
    setQueueMsg(null);
    playSfx("arena.queue");
    try {
      const res = await fetch("/api/rift-arena/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "enqueue", displayName: "Keeper" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "QUEUE_FAILED");
      if (json.pair?.lobbyCode) {
        playSfx("arena.match_found");
        speakVoice({ slot: "announcer.ready", priority: "high" });
        setQueueMsg(`Matched — opening private lobby ${json.pair.lobbyCode}`);
        window.location.href = `/tcg/battle?invite=${json.pair.lobbyCode}`;
        return;
      }
      setQueueMsg(`In free queue (${json.queueSize ?? "…"} waiting). SOL never required.`);
      void load();
    } catch (e) {
      playSfx("ui.error");
      setQueueMsg(e instanceof Error ? e.message : "QUEUE_FAILED");
    } finally {
      setQueueBusy(false);
    }
  };

  if (error) {
    return (
      <div className="panel p-6 text-sm text-[var(--text-muted)]">
        Could not load Rift Arena: {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="panel p-6 text-sm text-[var(--text-muted)]">Opening the Arena gates…</div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="arena-hub-hero relative overflow-hidden rounded-xl border border-[rgba(61,231,255,0.18)] p-6 sm:p-8">
        <div className="arena-hub-hero__plate" aria-hidden />
        <div className="arena-hub-hero__scrim" aria-hidden />
        <div className="relative z-[1] space-y-4">
          <p className="text-[0.7rem] uppercase tracking-[0.22em] text-amber-200/80">
            Skill Arena · Free by default
          </p>
          <h1 className="font-display text-4xl text-white sm:text-5xl">Rift Arena</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--text-muted)]">
            {data.disclosures.skillFirst} {data.disclosures.freeDefault}
          </p>
          <p className="text-xs text-[var(--text-dim)]">{data.disclosures.noGuaranteedEarnings}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <StatusChip tone="live">Free play default</StatusChip>
            <StatusChip tone="danger">SOL stakes OFF</StatusChip>
            <StatusChip tone="warn">No P2W</StatusChip>
            {data.admin.matchmakingPaused ? (
              <StatusChip tone="danger">Matchmaking paused</StatusChip>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/tcg/battle" className="btn-primary focus-ring">
              Practice vs Kael
            </Link>
            <button
              type="button"
              id="queue"
              disabled={queueBusy || !data.flags.freeMatchmaking || data.admin.matchmakingPaused}
              onClick={() => void enqueue()}
              className="btn-secondary focus-ring disabled:opacity-40"
            >
              {queueBusy ? "Queuing…" : "Free matchmaking"}
            </button>
            <Link href="/tcg/battle" className="btn-secondary focus-ring">
              Invite / room code
            </Link>
          </div>
          {queueMsg ? (
            <p className="text-xs text-amber-200/90">{queueMsg}</p>
          ) : (
            <p className="text-xs text-[var(--text-dim)]">
              Queue size: {data.queueSize} · Soft daily cap {data.admin.dailyEntrySoftCap} · Wallet
              never required for free play
            </p>
          )}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="panel arena-match-types relative space-y-3 overflow-hidden p-5 lg:col-span-2">
          <div className="arena-match-types__plate" aria-hidden />
          <div className="arena-match-types__scrim" aria-hidden />
          <div className="relative z-[1] space-y-3">
            <h2 className="font-display text-xl text-white">Match types</h2>
            <p className="text-xs text-[var(--text-dim)]">
              Browse modes. Playable tiles open Training / Private / Free queue. Ranked+ are scaffolds.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {data.matchTypes.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i, 6) * 0.04 }}
                >
                  <Link
                    href={typeHref[t.id] || "/arena"}
                    className={cn(
                      "group block overflow-hidden rounded-lg border border-white/10 bg-black/40 transition hover:border-amber-400/35 focus-ring",
                      !t.playable && "opacity-75",
                    )}
                  >
                    {typeThumbSlug[t.id] ? (
                      <div className="section-card-thumb !aspect-[4/3] border-b border-white/10">
                        <Image
                          src={sectionUiThumbPath("arena", typeThumbSlug[t.id])}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="section-card-thumb__img"
                          unoptimized
                        />
                      </div>
                    ) : null}
                    <div className="p-4">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-display text-base text-white">{t.label}</h3>
                        {t.playable ? (
                          <StatusChip tone="live">Live</StatusChip>
                        ) : (
                          <StatusChip tone="warn">Scaffold</StatusChip>
                        )}
                      </div>
                      <p className="mt-2 text-xs text-[var(--text-muted)]">{t.description}</p>
                      <p className="mt-2 text-[0.65rem] uppercase tracking-wider text-[var(--text-dim)]">
                        Phase {t.phase}
                        {t.solStakeCapable ? " · SOL capable (flagged OFF)" : " · Free"}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="panel p-5">
            <h2 className="font-display text-lg text-white">Hall of Champions</h2>
            <p className="mt-1 text-xs text-[var(--text-dim)]">{data.season.name}</p>
            <ul className="mt-3 space-y-2">
              {data.champions.map((c) => (
                <li
                  key={c.displayName}
                  className="flex items-baseline justify-between gap-2 border-b border-white/5 pb-2 text-sm"
                >
                  <span>
                    <span className="text-white">{c.displayName}</span>
                    <span className="mt-0.5 block text-[0.65rem] text-[var(--text-dim)]">
                      {c.title}
                    </span>
                  </span>
                  <span className="font-mono text-amber-200/90">{c.rating}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/arena/leaderboard"
              className="mt-3 inline-block text-xs text-cyan-300/90 underline-offset-2 hover:underline"
            >
              Full leaderboard
            </Link>
          </div>

          <div className="panel p-5">
            <h2 className="font-display text-lg text-white">Watch</h2>
            <p className="mt-2 text-xs text-[var(--text-muted)]">
              Spectator stubs — no betting, no stakes, entertainment only.
            </p>
            <Link href="/arena/spectate" className="btn-secondary focus-ring mt-3 inline-flex text-sm">
              Spectate board
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="panel p-5">
          <h2 className="font-display text-lg text-white">Ladder (scaffold)</h2>
          <ul className="mt-3 space-y-1.5 text-sm">
            {data.ladder.slice(0, 8).map((row) => (
              <li key={row.rank} className="flex justify-between gap-2 text-[var(--text-muted)]">
                <span>
                  <span className="text-[var(--text-dim)]">#{row.rank}</span> {row.displayName}
                </span>
                <span className="font-mono text-white/80">{row.rating}</span>
              </li>
            ))}
          </ul>
          <Link href="/arena/ranked" className="mt-3 inline-block text-xs text-cyan-300/90 hover:underline">
            Ranked page
          </Link>
        </div>

        <div className="panel p-5">
          <h2 className="font-display text-lg text-white">Calendar</h2>
          <ul className="mt-3 space-y-2">
            {data.calendar.map((ev) => (
              <li key={ev.id}>
                <Link href={ev.href} className="block rounded-md px-1 py-1 hover:bg-white/5 focus-ring">
                  <span className="text-sm text-white">{ev.title}</span>
                  <span className="mt-0.5 block text-[0.65rem] text-[var(--text-dim)]">
                    {ev.when} · {ev.kind}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="panel p-5">
          <h2 className="font-display text-lg text-white">Your history</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {data.history.map((h) => (
              <li
                key={h.id}
                className="flex justify-between gap-2 border-b border-white/5 pb-2 text-[var(--text-muted)]"
              >
                <span>
                  {h.matchType} vs {h.opponentName}
                </span>
                <span className="text-white/85">{h.result}</span>
              </li>
            ))}
          </ul>
          <Link href="/arena/history" className="mt-3 inline-block text-xs text-cyan-300/90 hover:underline">
            Legacy battle history
          </Link>
        </div>

        <div className="panel border border-amber-500/20 p-5">
          <h2 className="font-display text-lg text-amber-100">SOL Arena (optional · OFF)</h2>
          <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">
            Clearly separate from free play. Escrow / stake tiers are documentation scaffolds only.
            Flags: RIFT_ARENA_SOL_STAKES_ENABLED={String(data.flags.solStakes)},
            RIFT_ARENA_SOL_ESCROW_ENABLED={String(data.flags.solEscrow)}. Wallet never required for
            default Arena.
          </p>
          <ul className="mt-3 space-y-1 text-xs text-[var(--text-dim)]">
            {data.stakeTiersDoc.map((t) => (
              <li key={t.id}>
                {t.label} · live={String(t.live)}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[0.65rem] text-[var(--text-dim)]">
            {data.disclosures.noP2W}
          </p>
        </div>
      </section>

      <section className="flex flex-wrap gap-3 text-sm">
        <Link href="/arena/training" className="btn-secondary focus-ring">
          Legacy pet training
        </Link>
        <Link href="/arena/tournaments" className="btn-secondary focus-ring">
          Tournaments
        </Link>
        <Link href="/tcg/deck-builder" className="btn-secondary focus-ring">
          Deck Atelier
        </Link>
        <Link href="/admin/arena" className="btn-secondary focus-ring">
          Admin Arena
        </Link>
      </section>
    </div>
  );
}
