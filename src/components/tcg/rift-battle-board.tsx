"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getTcgCardDef } from "@/game/tcg/card-catalog";
import { recordQuestMetric } from "@/game/quests/quest-demo-store";
import { cn } from "@/lib/utils/cn";

type ClientCard = { instanceId: string; defId: string };

type ClientUnit = {
  instanceId: string;
  defId: string;
  power: number;
  affinity: string;
  exhausted: boolean;
};

type ClientSide = {
  id: string;
  name: string;
  keeperHp: number;
  maxKeeperHp: number;
  riftEnergy: number;
  riftEnergyMax: number;
  hand: ClientCard[];
  handCount: number;
  deckCount: number;
  board: ClientUnit[];
  isAi: boolean;
};

type Snapshot = {
  publicId: string;
  turn: number;
  status: "ACTIVE" | "COMPLETED";
  phase: string;
  activeSideId: string;
  winnerId: string | null;
  players: ClientSide[];
  events: { type: string; actorId: string; payload: Record<string, unknown> }[];
  encounter: {
    enemyId: string;
    regionSlug: string;
    returnTo: string;
  } | null;
};

function CardFace({
  defId,
  selected,
  disabled,
  onClick,
}: {
  defId: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  const def = getTcgCardDef(defId);
  const [imgFailed, setImgFailed] = useState(false);
  if (!def) {
    return (
      <div className="flex h-28 w-20 items-center justify-center rounded-lg bg-black/30 text-xs text-white/50">
        ?
      </div>
    );
  }
  const face = def.cardImagePath && !imgFailed ? def.cardImagePath : null;
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "relative flex h-28 w-20 flex-col overflow-hidden rounded-lg border text-left transition",
        "border-amber-500/35 text-[var(--text-primary,#f4efe6)]",
        face
          ? "bg-black/40"
          : "bg-[linear-gradient(160deg,#1a2430_0%,#0f161c_100%)] px-1.5 py-1",
        selected && "ring-2 ring-amber-300",
        disabled && "opacity-40",
      )}
    >
      {face ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={face}
            alt={def.name}
            className="absolute inset-0 h-full w-full object-cover"
            onError={() => setImgFailed(true)}
          />
          <div className="relative z-10 mt-auto bg-gradient-to-t from-black/80 via-black/40 to-transparent px-1 pb-1 pt-4">
            <div className="line-clamp-2 text-[10px] font-semibold leading-tight drop-shadow">
              {def.name}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-between text-[10px] uppercase tracking-wide text-amber-200/90">
            <span>{def.riftCost} RE</span>
            <span>{def.power}</span>
          </div>
          <div className="mt-1 line-clamp-2 text-[11px] font-semibold leading-tight">
            {def.name}
          </div>
          <div className="mt-auto text-[9px] uppercase text-teal-200/80">
            {def.affinity}
          </div>
        </>
      )}
    </button>
  );
}

export function RiftBattleBoard({
  encounterEnemyId,
  regionSlug,
  returnTo,
}: {
  encounterEnemyId?: string | null;
  regionSlug?: string | null;
  returnTo?: string | null;
}) {
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [selectedHand, setSelectedHand] = useState<string | null>(null);

  const backHref = returnTo || snap?.encounter?.returnTo || "/tcg/collection";

  const start = useCallback(async () => {
    setBusy(true);
    setError(null);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20_000);
    try {
      const body: Record<string, unknown> = { playerName: "Keeper" };
      if (encounterEnemyId) {
        body.encounter = {
          enemyId: encounterEnemyId,
          regionSlug: regionSlug || "riftwild-commons",
          returnTo: returnTo || "/tcg/collection",
        };
      }
      const res = await fetch("/api/tcg/match/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      const data = (await res.json()) as {
        error?: string;
        reason?: string;
      } & Partial<Snapshot>;
      if (!res.ok) {
        const detail = data.reason ? `${data.error}: ${data.reason}` : data.error;
        throw new Error(detail || "START_FAILED");
      }
      setSnap(data as Snapshot);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        setError("Match start timed out — try opening the board again.");
      } else {
        setError(e instanceof Error ? e.message : "START_FAILED");
      }
    } finally {
      window.clearTimeout(timeout);
      setBusy(false);
    }
  }, [encounterEnemyId, regionSlug, returnTo]);

  useEffect(() => {
    void start();
  }, [start]);

  const questMatchLogged = useRef<string | null>(null);

  /** Quest board hooks — practice matches advance TCG objectives. */
  useEffect(() => {
    if (!snap || snap.status !== "COMPLETED") return;
    if (questMatchLogged.current === snap.publicId) return;
    questMatchLogged.current = snap.publicId;
    const playerSide = snap.players.find((p) => !p.isAi);
    recordQuestMetric("tcg_match_play", 1);
    if (playerSide && snap.winnerId === playerSide.id) {
      recordQuestMetric("tcg_match_win", 1);
    }
  }, [snap]);

  const act = useCallback(
    async (action: Record<string, unknown>) => {
      if (!snap || snap.status !== "ACTIVE") return;
      setBusy(true);
      setError(null);
      try {
        const res = await fetch("/api/tcg/match/turn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ publicId: snap.publicId, action }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "TURN_FAILED");
        setSnap(data);
        setSelectedHand(null);
        if (action.kind === "PLAY_CARD") {
          recordQuestMetric("tcg_card_play", 1);
          recordQuestMetric("tcg_energy_spend", 1);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "TURN_FAILED");
      } finally {
        setBusy(false);
      }
    },
    [snap],
  );

  const player = snap?.players.find((p) => !p.isAi);
  const foe = snap?.players.find((p) => p.isAi);

  const log = useMemo(() => snap?.events.slice().reverse() ?? [], [snap]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-5xl flex-col gap-4 px-2 py-4 sm:px-4 sm:py-6">
      <header className="flex flex-wrap items-end justify-between gap-3 rounded-xl border border-white/10 bg-[rgba(8,12,20,0.55)] px-4 py-3 backdrop-blur-[2px]">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-amber-200/70">
            Rift Energy Battle
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--text-primary,#f4efe6)]">
            {encounterEnemyId
              ? encounterEnemyId.replace(/-/g, " ")
              : "Practice Board"}
          </h1>
          <p className="mt-1 max-w-xl text-sm text-[var(--text-muted,#b7aea0)]">
            Spend Rift Energy to play units and spells. End turn to strike with
            your board. SOL is never required.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/tcg/collection"
            className="rounded-md border border-amber-300/30 px-3 py-2 text-sm text-amber-100/90 hover:bg-amber-400/10"
          >
            Card Binder
          </Link>
          <Link
            href={backHref}
            className="rounded-md border border-white/15 px-3 py-2 text-sm text-white/90 hover:bg-white/5"
          >
            {backHref.includes("live-world") ? "Return to habitat" : "Back"}
          </Link>
        </div>
      </header>

      {error && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-red-400/40 bg-red-950/55 px-3 py-2 text-sm text-red-100 backdrop-blur-sm">
          <p>{error}</p>
          <button
            type="button"
            disabled={busy}
            onClick={() => void start()}
            className="rounded-md border border-amber-300/40 px-3 py-1.5 text-amber-100 hover:bg-amber-400/10 disabled:opacity-40"
          >
            Retry
          </button>
        </div>
      )}

      {!snap && (
        <section className="rounded-xl border border-white/10 bg-[rgba(8,12,20,0.48)] p-6 backdrop-blur-[2px]">
          <div className="space-y-4">
            <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-cyan-300/25 text-xs text-cyan-100/50">
              Challenger lane
            </div>
            <p className="text-center text-sm text-white/70">
              {busy ? "Opening the rift board…" : error ? "Board ready when the rift reconnects." : "Preparing match…"}
            </p>
            <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-amber-300/25 text-xs text-amber-100/50">
              Your lane
            </div>
            {!busy && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => void start()}
                  className="rounded-md bg-amber-500/90 px-4 py-2 text-sm font-medium text-stone-950"
                >
                  Open practice board
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {snap && player && foe && (
        <>
          <section className="grid gap-3 rounded-xl border border-white/10 bg-[rgba(10,16,24,0.62)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-[3px] md:grid-cols-[1fr_220px]">
            <div className="space-y-4">
              <SideHeader side={foe} label="Challenger" />
              <BoardRow units={foe.board} emptyLabel="Empty rift lane" />
              <div className="flex items-center justify-center gap-3 py-2 text-sm text-amber-100/80">
                <span>
                  Turn {snap.turn} · {snap.phase}
                </span>
                {snap.status === "COMPLETED" && (
                  <span className="rounded bg-amber-400/20 px-2 py-0.5 text-amber-100">
                    {snap.winnerId === player.id
                      ? "Victory"
                      : snap.winnerId
                        ? "Defeat"
                        : "Draw"}
                  </span>
                )}
              </div>
              <BoardRow units={player.board} emptyLabel="Your units appear here" />
              <SideHeader side={player} label="You" emphasizeEnergy />
            </div>
            <aside className="max-h-72 overflow-auto rounded-lg border border-white/10 bg-black/35 p-2 text-[11px] text-white/70">
              <p className="mb-1 font-semibold uppercase tracking-wide text-white/50">
                Battle log
              </p>
              {log.map((e, i) => (
                <div key={`${e.type}-${i}`} className="border-b border-white/5 py-1">
                  {e.type}
                  {typeof e.payload.damage === "number"
                    ? ` · ${e.payload.damage} dmg`
                    : ""}
                </div>
              ))}
            </aside>
          </section>

          <section className="rounded-xl border border-white/10 bg-[rgba(8,12,20,0.5)] p-4 backdrop-blur-[2px]">
            <p className="mb-2 text-xs uppercase tracking-wider text-white/50">
              Hand
            </p>
            <div className="flex flex-wrap gap-2">
              {player.hand.map((c) => {
                const def = getTcgCardDef(c.defId);
                const tooExpensive =
                  !!def && player.riftEnergy < def.riftCost;
                return (
                  <CardFace
                    key={c.instanceId}
                    defId={c.defId}
                    selected={selectedHand === c.instanceId}
                    disabled={
                      busy ||
                      snap.status !== "ACTIVE" ||
                      snap.activeSideId !== player.id ||
                      tooExpensive
                    }
                    onClick={() => setSelectedHand(c.instanceId)}
                  />
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                disabled={!selectedHand || busy || snap.status !== "ACTIVE"}
                onClick={() =>
                  selectedHand &&
                  void act({ kind: "PLAY_CARD", handInstanceId: selectedHand })
                }
                className="rounded-md bg-amber-500/90 px-4 py-2 text-sm font-medium text-stone-950 disabled:opacity-40"
              >
                Play card
              </motion.button>
              <button
                type="button"
                disabled={busy || snap.status !== "ACTIVE"}
                onClick={() => void act({ kind: "END_TURN" })}
                className="rounded-md border border-teal-300/40 px-4 py-2 text-sm text-teal-100 disabled:opacity-40"
              >
                End turn
              </button>
              <button
                type="button"
                disabled={busy || snap.status !== "ACTIVE"}
                onClick={() => void act({ kind: "SURRENDER" })}
                className="rounded-md border border-white/15 px-4 py-2 text-sm text-white/70 disabled:opacity-40"
              >
                Surrender
              </button>
              {snap.status === "COMPLETED" && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void start()}
                  className="rounded-md border border-amber-300/30 px-4 py-2 text-sm text-amber-100"
                >
                  Rematch
                </button>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function SideHeader({
  side,
  label,
  emphasizeEnergy,
}: {
  side: ClientSide;
  label: string;
  emphasizeEnergy?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
      <div>
        <span className="text-white/50">{label}</span>{" "}
        <span className="font-medium text-white">{side.name}</span>
      </div>
      <div className="flex gap-3 text-xs uppercase tracking-wide">
        <span className="text-rose-200/90">
          HP {side.keeperHp}/{side.maxKeeperHp}
        </span>
        <span
          className={cn(
            "text-amber-200",
            emphasizeEnergy && "rounded bg-amber-400/15 px-1.5 py-0.5",
          )}
        >
          Rift Energy {side.riftEnergy}/{side.riftEnergyMax}
        </span>
        <span className="text-white/45">Deck {side.deckCount}</span>
      </div>
    </div>
  );
}

function BoardRow({
  units,
  emptyLabel,
}: {
  units: ClientUnit[];
  emptyLabel: string;
}) {
  if (units.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-white/15 text-xs text-white/35">
        {emptyLabel}
      </div>
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      {units.map((u) => (
        <div
          key={u.instanceId}
          className={cn(
            "flex h-20 w-16 flex-col rounded-md border border-teal-400/30 bg-teal-950/40 px-1 py-1",
            u.exhausted && "opacity-60",
          )}
        >
          <span className="text-[10px] text-teal-100/80">{u.power}</span>
          <span className="line-clamp-2 text-[10px] text-white/90">
            {getTcgCardDef(u.defId)?.name ?? u.defId}
          </span>
        </div>
      ))}
    </div>
  );
}
