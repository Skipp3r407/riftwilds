"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getTcgCardDef } from "@/game/tcg/card-catalog";
import { recordQuestMetric } from "@/game/quests/quest-demo-store";
import { TcgCardDetailModal } from "@/components/tcg/tcg-card-detail-modal";
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
  size = "hand",
  onClick,
}: {
  defId: string;
  selected?: boolean;
  disabled?: boolean;
  size?: "hand" | "board";
  onClick?: () => void;
}) {
  const def = getTcgCardDef(defId);
  const [imgFailed, setImgFailed] = useState(false);
  const sizeClass =
    size === "hand"
      ? "aspect-[500/700] w-[7.25rem] sm:w-[8.5rem] md:w-[9.5rem]"
      : "aspect-[500/700] w-[5.25rem] sm:w-[6.25rem] md:w-[7rem]";

  if (!def) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-md bg-black/40 text-xs text-white/50",
          sizeClass,
        )}
      >
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
      aria-label={`Inspect ${def.name}`}
      className={cn(
        "relative overflow-hidden rounded-md border border-amber-500/45 bg-black/45 transition focus-ring",
        sizeClass,
        selected && "ring-2 ring-amber-300 scale-[1.03] shadow-[0_0_18px_rgba(255,184,77,0.35)]",
        disabled && "opacity-40",
      )}
    >
      {face ? (
        // Complete card face bitmap (name/cost/rules baked in) — no DOM text overlays.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={face}
          alt={def.name}
          className="h-full w-full object-cover"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span className="flex h-full items-center justify-center px-1 text-center text-[10px] text-white/50">
          {def.name}
        </span>
      )}
    </button>
  );
}

function ConsoleShell({ children }: { children: ReactNode }) {
  return (
    <div className="battle-console">
      <div className="battle-console__corners" aria-hidden>
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="battle-console__inner">{children}</div>
    </div>
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
  const [inspectDefId, setInspectDefId] = useState<string | null>(null);
  const [inspectFromHand, setInspectFromHand] = useState(false);

  const backHref = returnTo || snap?.encounter?.returnTo || "/tcg/collection";
  const deskTitle = encounterEnemyId
    ? encounterEnemyId.replace(/-/g, " ")
    : "Practice Board";
  const deskMode = encounterEnemyId ? "Battle Desk" : "Practice Board";

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
        setInspectDefId(null);
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

  const selectedCard = player?.hand.find((c) => c.instanceId === selectedHand);
  const selectedDef = selectedCard ? getTcgCardDef(selectedCard.defId) : null;
  const isPlayerTurn =
    !!snap && !!player && snap.status === "ACTIVE" && snap.activeSideId === player.id;
  const canPlaySelected =
    !!snap &&
    !!player &&
    !!selectedHand &&
    !!selectedDef &&
    snap.status === "ACTIVE" &&
    snap.activeSideId === player.id &&
    !busy &&
    player.riftEnergy >= selectedDef.riftCost;

  const playDisabledReason = !selectedHand
    ? null
    : snap?.status !== "ACTIVE"
      ? "Match finished"
      : snap && player && snap.activeSideId !== player.id
        ? "Not your turn"
        : selectedDef && player && player.riftEnergy < selectedDef.riftCost
          ? `Needs ${selectedDef.riftCost} Rift Energy`
          : busy
            ? "Busy…"
            : null;

  const outcomeLabel =
    snap?.status === "COMPLETED"
      ? snap.winnerId === player?.id
        ? "Victory"
        : snap.winnerId
          ? "Defeat"
          : "Draw"
      : null;

  return (
    <div className="mx-auto w-full max-w-6xl px-0 py-2 sm:py-3">
      <ConsoleShell>
        <header className="battle-console__header">
          <div>
            <p className="battle-console__brand">RIFTWILDS</p>
            <p className="battle-console__brand-sub">
              {deskMode}
              {encounterEnemyId ? ` · ${deskTitle}` : ""}
            </p>
            <p className="battle-console__lede">
              Tap a card to inspect. Spend Rift Energy to play units and spells, then end
              your turn. SOL is never required.
            </p>
          </div>
          <div className="battle-console__utils">
            <Link href="/tcg/collection" className="battle-console__util focus-ring">
              Card Binder
            </Link>
            <Link href={backHref} className="battle-console__util focus-ring">
              {backHref.includes("live-world") ? "Return" : "Back"}
            </Link>
          </div>
        </header>

        {error && (
          <div className="battle-console__alert" role="alert">
            <p>{error}</p>
            <button
              type="button"
              disabled={busy}
              onClick={() => void start()}
              className="battle-console__action battle-console__action--primary !min-w-0 !px-3 !py-1.5 !text-[0.62rem]"
            >
              Retry
            </button>
          </div>
        )}

        {!snap && (
          <div className="battle-console__body">
            <aside className="battle-console__panel hidden md:flex">
              <p className="battle-console__panel-title">Board Intel</p>
              <div className="battle-console__panel-body">
                <p className="text-xs text-[var(--text-dim)]">
                  {busy ? "Calibrating rift lanes…" : "Awaiting match sync."}
                </p>
              </div>
            </aside>
            <section className="battle-console__stage">
              <div className="battle-console__lane">
                <div className="battle-console__lane-empty">Challenger lane</div>
              </div>
              <div className="battle-console__phase">
                {busy
                  ? "Opening the rift board…"
                  : error
                    ? "Board ready when the rift reconnects"
                    : "Preparing match…"}
              </div>
              <div className="battle-console__lane battle-console__lane--you">
                <div className="battle-console__lane-empty">Your lane</div>
              </div>
              {!busy && (
                <div className="flex justify-center pt-1">
                  <button
                    type="button"
                    onClick={() => void start()}
                    className="battle-console__action battle-console__action--primary"
                  >
                    Open board
                    <small>Start practice</small>
                  </button>
                </div>
              )}
            </section>
            <aside className="battle-console__panel hidden md:flex">
              <p className="battle-console__panel-title">Command Feed</p>
              <div className="battle-console__panel-body">
                <p className="battle-console__feed-item">STANDBY · waiting for sync</p>
              </div>
            </aside>
          </div>
        )}

        {snap && player && foe && (
          <>
            <div className="battle-console__body">
              <aside className="battle-console__panel order-2 lg:order-none max-lg:max-h-48">
                <p className="battle-console__panel-title">Board Intel</p>
                <div className="battle-console__panel-body">
                  <div className="battle-console__intel-block">
                    <p className="battle-console__intel-label">Match readout</p>
                    <div className="battle-console__intel-row">
                      <span>Turn</span>
                      <strong>{snap.turn}</strong>
                    </div>
                    <div className="battle-console__intel-row">
                      <span>Phase</span>
                      <strong>{snap.phase}</strong>
                    </div>
                    <div className="battle-console__intel-row">
                      <span>Active</span>
                      <strong>
                        {snap.activeSideId === player.id ? "You" : "Challenger"}
                      </strong>
                    </div>
                    <div className="battle-console__intel-row">
                      <span>Status</span>
                      <strong>
                        {snap.status === "ACTIVE" ? "LIVE" : outcomeLabel ?? "DONE"}
                      </strong>
                    </div>
                  </div>
                  <div className="battle-console__intel-block">
                    <p className="battle-console__intel-label">Field pressure</p>
                    <div className="battle-console__intel-row">
                      <span>Your units</span>
                      <strong>{player.board.length}</strong>
                    </div>
                    <div className="battle-console__intel-row">
                      <span>Foe units</span>
                      <strong>{foe.board.length}</strong>
                    </div>
                    <div className="battle-console__intel-row">
                      <span>Hand</span>
                      <strong>{player.hand.length}</strong>
                    </div>
                  </div>
                  <div className="battle-console__intel-block">
                    <p className="battle-console__intel-label">Legend</p>
                    <div className="battle-console__legend">
                      <div className="battle-console__legend-item">
                        <span
                          className="battle-console__legend-swatch"
                          style={{ background: "var(--amber)" }}
                        />
                        Rift Energy — play cost
                      </div>
                      <div className="battle-console__legend-item">
                        <span
                          className="battle-console__legend-swatch"
                          style={{ background: "#ff5c7a" }}
                        />
                        Keeper HP — lose at 0
                      </div>
                      <div className="battle-console__legend-item">
                        <span
                          className="battle-console__legend-swatch"
                          style={{ background: "var(--cyan)" }}
                        />
                        Units — board attackers
                      </div>
                      <div className="battle-console__legend-item">
                        <span
                          className="battle-console__legend-swatch"
                          style={{
                            background: "transparent",
                            border: "1px solid rgba(255,255,255,0.35)",
                          }}
                        />
                        Exhausted — already acted
                      </div>
                    </div>
                  </div>
                </div>
              </aside>

              <section
                className="battle-console__stage order-1 lg:order-none"
                aria-label="Battle lanes"
              >
                <StatusStrip side={foe} role="Challenger" />
                <BoardRow
                  units={foe.board}
                  emptyLabel="Empty rift lane"
                  onInspect={(defId) => {
                    setInspectFromHand(false);
                    setInspectDefId(defId);
                  }}
                />
                <div
                  className={cn(
                    "battle-console__phase",
                    isPlayerTurn && "battle-console__phase--active",
                  )}
                >
                  <span>
                    Turn {snap.turn} · {snap.phase}
                  </span>
                  {outcomeLabel && (
                    <span className="battle-console__phase-badge">{outcomeLabel}</span>
                  )}
                  {!outcomeLabel && isPlayerTurn && (
                    <span className="battle-console__phase-badge">Your move</span>
                  )}
                </div>
                <BoardRow
                  units={player.board}
                  emptyLabel="Your units appear here"
                  yours
                  onInspect={(defId) => {
                    setInspectFromHand(false);
                    setInspectDefId(defId);
                  }}
                />
                <StatusStrip side={player} role="You" emphasizeEnergy />
              </section>

              <aside className="battle-console__panel order-3 lg:order-none max-lg:max-h-48">
                <p className="battle-console__panel-title">Command Feed</p>
                <div className="battle-console__panel-body">
                  <div className="battle-console__feed">
                    {log.length === 0 && (
                      <div className="battle-console__feed-item">FEED · quiet channel</div>
                    )}
                    {log.map((e, i) => (
                      <div
                        key={`${e.type}-${i}`}
                        className="battle-console__feed-item"
                        style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}
                      >
                        {e.type}
                        {typeof e.payload.damage === "number"
                          ? ` · ${e.payload.damage} dmg`
                          : ""}
                      </div>
                    ))}
                  </div>
                </div>
              </aside>
            </div>

            <section className="battle-console__hand-dock" aria-label="Hand">
              <p className="battle-console__hand-label">
                Hand · tap a card to inspect
              </p>
              <div className="battle-console__hand-row">
                {player.hand.map((c) => (
                  <CardFace
                    key={c.instanceId}
                    defId={c.defId}
                    size="hand"
                    selected={selectedHand === c.instanceId}
                    onClick={() => {
                      setSelectedHand(c.instanceId);
                      setInspectFromHand(true);
                      setInspectDefId(c.defId);
                    }}
                  />
                ))}
                {player.hand.length === 0 && (
                  <p className="text-xs text-[var(--text-dim)]">No cards in hand.</p>
                )}
              </div>
            </section>

            <footer className="battle-console__command-bar">
              <div className="battle-console__command-meta">
                <strong>DESK</strong> · {deskMode}
                <br />
                {selectedDef
                  ? `Selected: ${selectedDef.name} · cost ${selectedDef.riftCost}`
                  : "Select a card from hand"}
              </div>
              <div className="battle-console__actions">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  disabled={!canPlaySelected}
                  onClick={() =>
                    selectedHand &&
                    void act({ kind: "PLAY_CARD", handInstanceId: selectedHand })
                  }
                  className="battle-console__action battle-console__action--primary focus-ring"
                  title={playDisabledReason ?? "Play selected card"}
                >
                  Play card
                  <small>{playDisabledReason ?? "Deploy to board"}</small>
                </motion.button>
                <button
                  type="button"
                  disabled={busy || snap.status !== "ACTIVE"}
                  onClick={() => void act({ kind: "END_TURN" })}
                  className="battle-console__action focus-ring"
                >
                  End turn
                  <small>Pass initiative</small>
                </button>
                <button
                  type="button"
                  disabled={busy || snap.status !== "ACTIVE"}
                  onClick={() => void act({ kind: "SURRENDER" })}
                  className="battle-console__action battle-console__action--danger focus-ring"
                >
                  Surrender
                  <small>Abort match</small>
                </button>
                {snap.status === "COMPLETED" && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void start()}
                    className="battle-console__action battle-console__action--primary focus-ring"
                  >
                    Rematch
                    <small>Open new board</small>
                  </button>
                )}
              </div>
              <div className="battle-console__command-meta text-right max-md:text-left">
                <strong>ENERGY</strong> {player.riftEnergy}/{player.riftEnergyMax}
                <br />
                HP {player.keeperHp}/{player.maxKeeperHp} · Deck {player.deckCount}
              </div>
            </footer>
          </>
        )}
      </ConsoleShell>

      <TcgCardDetailModal
        open={!!inspectDefId}
        defId={inspectDefId}
        onClose={() => {
          setInspectDefId(null);
          setInspectFromHand(false);
        }}
        battlePlay={
          inspectFromHand && selectedHand
            ? {
                canPlay: canPlaySelected,
                playDisabledReason,
                onPlay: () => {
                  if (selectedHand) {
                    void act({
                      kind: "PLAY_CARD",
                      handInstanceId: selectedHand,
                    });
                  }
                },
              }
            : null
        }
      />
    </div>
  );
}

function StatusStrip({
  side,
  role,
  emphasizeEnergy,
}: {
  side: ClientSide;
  role: string;
  emphasizeEnergy?: boolean;
}) {
  const hpPct = Math.max(
    0,
    Math.min(100, (side.keeperHp / Math.max(1, side.maxKeeperHp)) * 100),
  );
  const energyPct = Math.max(
    0,
    Math.min(100, (side.riftEnergy / Math.max(1, side.riftEnergyMax)) * 100),
  );

  return (
    <div
      className={cn(
        "battle-console__status",
        emphasizeEnergy && "battle-console__status--you",
      )}
    >
      <div className="battle-console__status-name">
        <span className="battle-console__status-role">{role}</span>
        <span className="battle-console__status-keeper">{side.name}</span>
      </div>
      <div className="battle-console__meters">
        <div className="battle-console__meter">
          <span className="battle-console__meter-label">Keeper HP</span>
          <span className="battle-console__meter-value battle-console__meter-value--hp">
            {side.keeperHp}/{side.maxKeeperHp}
          </span>
          <div className="battle-console__bar battle-console__bar--hp" aria-hidden>
            <i style={{ width: `${hpPct}%` }} />
          </div>
        </div>
        <div className="battle-console__meter">
          <span className="battle-console__meter-label">Rift Energy</span>
          <span
            className={cn(
              "battle-console__meter-value battle-console__meter-value--energy",
              emphasizeEnergy && "rounded px-1 bg-amber-400/15",
            )}
          >
            {side.riftEnergy}/{side.riftEnergyMax}
          </span>
          <div className="battle-console__bar battle-console__bar--energy" aria-hidden>
            <i style={{ width: `${energyPct}%` }} />
          </div>
        </div>
        <div className="battle-console__meter">
          <span className="battle-console__meter-label">Deck</span>
          <span className="battle-console__meter-value battle-console__meter-value--deck">
            {side.deckCount}
          </span>
        </div>
      </div>
    </div>
  );
}

function BoardRow({
  units,
  emptyLabel,
  yours,
  onInspect,
}: {
  units: ClientUnit[];
  emptyLabel: string;
  yours?: boolean;
  onInspect: (defId: string) => void;
}) {
  if (units.length === 0) {
    return (
      <div
        className={cn(
          "battle-console__lane",
          yours && "battle-console__lane--you",
        )}
      >
        <div className="battle-console__lane-empty">{emptyLabel}</div>
      </div>
    );
  }
  return (
    <div
      className={cn(
        "battle-console__lane",
        yours && "battle-console__lane--you",
      )}
    >
      {units.map((u) => (
        <div key={u.instanceId} className={cn(u.exhausted && "opacity-55")}>
          <CardFace
            defId={u.defId}
            size="board"
            onClick={() => onInspect(u.defId)}
          />
        </div>
      ))}
    </div>
  );
}
