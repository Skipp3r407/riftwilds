"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ArenaAction, ArenaAbilityDef } from "@/game/arena/types";
import { GameImage } from "@/components/assets/game-image";
import { ArenaNoWageringBanner, WeaponsDisclaimer } from "@/components/arena/disclosures";
import { playSfx } from "@/hooks/use-sfx";
import { itemIconFallback, itemIconPath } from "@/lib/assets/paths";
import { cn } from "@/lib/utils/cn";

type ClientCombatant = {
  id: string;
  name: string;
  speciesSlug?: string;
  affinity: string;
  level: number;
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  abilities: ArenaAbilityDef[];
  statuses: { id: string; turnsLeft: number }[];
  weaponId?: string;
};

type ClientState = {
  publicId: string;
  round: number;
  maxRounds: number;
  status: "ACTIVE" | "COMPLETED";
  winnerId: string | null;
  completionReason: string | null;
  combatants: [ClientCombatant, ClientCombatant];
  events: { type: string; actorId: string; payload: Record<string, unknown> }[];
};

type BattleRecord = {
  state: ClientState;
  arenaPointsAwarded: number | null;
  mode: string;
};

function Bar({
  value,
  max,
  color,
  label,
}: {
  value: number;
  max: number;
  color: string;
  label: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(max, 1)) * 100));
  return (
    <div>
      <div className="mb-1 flex justify-between text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
        <span>{label}</span>
        <span>
          {value}/{max}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-elevated)]">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
        />
      </div>
    </div>
  );
}

function CombatantCard({
  c,
  side,
  highlight,
}: {
  c: ClientCombatant;
  side: "left" | "right";
  highlight?: boolean;
}) {
  return (
    <motion.div
      layout
      className={cn(
        "panel relative overflow-hidden p-4",
        highlight && "ring-1 ring-[var(--cyan)]",
      )}
      animate={highlight ? { scale: [1, 1.02, 1] } : undefined}
      transition={{ duration: 0.35 }}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 opacity-40",
          side === "left"
            ? "bg-[radial-gradient(circle_at_20%_20%,rgba(255,120,60,0.35),transparent_55%)]"
            : "bg-[radial-gradient(circle_at_80%_20%,rgba(80,160,255,0.35),transparent_55%)]",
        )}
      />
      <div className="relative">
        <p className="font-display text-xs uppercase tracking-[0.2em] text-[var(--cyan)]">
          {c.affinity} · Lv {c.level}
          {c.speciesSlug ? ` · ${c.speciesSlug}` : ""}
        </p>
        <h3 className="font-display mt-1 text-xl text-white">{c.name}</h3>
        {c.weaponId ? (
          <p className="mt-1 text-xs text-[var(--text-muted)]">Weapon: {c.weaponId}</p>
        ) : null}
        {c.abilities.length > 0 ? (
          <p className="mt-2 text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
            Kit: {c.abilities.filter((a) => a.id !== "basic-strike").map((a) => a.name).join(" · ")}
          </p>
        ) : null}
        <div className="mt-4 space-y-3">
          <Bar value={c.hp} max={c.maxHp} color="var(--mint)" label="Health" />
          <Bar value={c.energy} max={c.maxEnergy} color="var(--cyan)" label="Energy" />
        </div>
        {c.statuses.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1">
            {c.statuses.map((s) => (
              <span
                key={`${s.id}-${s.turnsLeft}`}
                className="rounded bg-[var(--bg-elevated)] px-2 py-0.5 text-[10px] text-[var(--amber)]"
              >
                {s.id} ({s.turnsLeft})
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}

export function TrainingBattle() {
  const [record, setRecord] = useState<BattleRecord | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastHit, setLastHit] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);

  const start = useCallback(async () => {
    setBusy(true);
    setError(null);
    setLog([]);
    let body: Record<string, unknown> = {};
    try {
      const raw = localStorage.getItem("riftwilds-arena-loadout-v1");
      if (raw) {
        const saved = JSON.parse(raw) as {
          name?: string;
          speciesSlug?: string;
          affinity?: string;
          weaponId?: string | null;
          level?: number;
        };
        body = {
          name: saved.name,
          speciesSlug: saved.speciesSlug,
          affinity: saved.affinity,
          weaponId: saved.weaponId ?? undefined,
          level: saved.level,
        };
      }
    } catch {
      /* ignore */
    }
    try {
      const res = await fetch("/api/arena/training/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "START_FAILED");
      setRecord(data);
      setLog(["Training battle started. Select an action."]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "START_FAILED");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void start();
  }, [start]);

  const submit = async (action: ArenaAction) => {
    if (!record || record.state.status !== "ACTIVE" || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/arena/training/turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId: record.state.publicId, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "TURN_FAILED");
      const prevLen = record.state.events.length;
      const newEvents = data.state.events.slice(prevLen) as BattleRecord["state"]["events"];
      const combatants = data.state.combatants as ClientCombatant[];
      const abilityName = (id: unknown) => {
        const aid = String(id ?? "");
        for (const c of combatants) {
          const found = c.abilities.find((a) => a.id === aid)?.name;
          if (found) return found;
        }
        return aid;
      };
      const lines = newEvents.map((ev) => {
        if (ev.type === "DAMAGE") {
          playSfx("combat.hit");
          setLastHit(String(ev.payload.targetId ?? ""));
          const move = ev.payload.abilityId ? abilityName(ev.payload.abilityId) : "strike";
          return `${ev.actorId} uses ${move} for ${ev.payload.damage}${ev.payload.isCritical ? " (crit)" : ""}`;
        }
        if (ev.type === "MISS") {
          playSfx("ui.error");
          const move = ev.payload.abilityId ? abilityName(ev.payload.abilityId) : "attack";
          return `${ev.actorId} missed with ${move}`;
        }
        if (ev.type === "HEAL") {
          const move = ev.payload.abilityId ? ` via ${abilityName(ev.payload.abilityId)}` : "";
          return `${ev.actorId} heals ${ev.payload.amount}${move}`;
        }
        if (ev.type === "ABILITY_USED") {
          playSfx("combat.ability");
          return `${ev.actorId} activates ${abilityName(ev.payload.abilityId)}`;
        }
        if (ev.type === "BATTLE_ENDED") return `Battle ended — winner ${ev.payload.winnerId ?? "draw"}`;
        if (ev.type === "SURRENDER") return `${ev.actorId} surrendered`;
        return ev.type;
      });
      setLog((l) => [...lines, ...l].slice(0, 40));
      setRecord(data);
      if (data.state.status === "COMPLETED") {
        const playerId = data.state.combatants?.[0]?.id;
        if (data.state.winnerId === playerId) playSfx("combat.win");
        else if (data.state.winnerId) playSfx("combat.lose");
      }
      setTimeout(() => setLastHit(null), 400);
    } catch (e) {
      playSfx("ui.error");
      setError(e instanceof Error ? e.message : "TURN_FAILED");
    } finally {
      setBusy(false);
    }
  };

  const player = record?.state.combatants[0];
  const opponent = record?.state.combatants[1];
  const ended = record?.state.status === "COMPLETED";

  return (
    <div className="space-y-4">
      <ArenaNoWageringBanner />
      <WeaponsDisclaimer />

      {error ? (
        <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      {!record ? (
        <p className="text-sm text-[var(--text-muted)]">Preparing training arena…</p>
      ) : (
        <>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-display text-xs uppercase tracking-[0.24em] text-[var(--cyan)]">
                Round {record.state.round}/{record.state.maxRounds}
              </p>
              <h2 className="font-display text-2xl text-white">AI Training Duel</h2>
            </div>
            <button type="button" className="btn-secondary focus-ring text-sm" onClick={() => void start()} disabled={busy}>
              New training battle
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {player ? (
              <CombatantCard c={player} side="left" highlight={lastHit === player.id} />
            ) : null}
            {opponent ? (
              <CombatantCard c={opponent} side="right" highlight={lastHit === opponent.id} />
            ) : null}
          </div>

          <AnimatePresence mode="wait">
            {ended ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="panel p-6 text-center"
              >
                <p className="font-display text-xs uppercase tracking-[0.24em] text-[var(--amber)]">
                  Battle complete
                </p>
                <h3 className="font-display mt-2 text-3xl text-white">
                  {record.state.winnerId === player?.id
                    ? "Victory"
                    : record.state.winnerId
                      ? "Defeat"
                      : "Draw"}
                </h3>
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  Reason: {record.state.completionReason ?? "—"}. The defeated Riftling grows tired and
                  retreats through a soft rift portal — no permanent injury.
                </p>
                {record.arenaPointsAwarded != null ? (
                  <p className="mt-3 text-sm text-[var(--mint)]">
                    Arena Points earned: +{record.arenaPointsAwarded} (non-transferable, no cash
                    value)
                  </p>
                ) : null}
              </motion.div>
            ) : (
              <motion.div
                key="actions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="panel p-4"
              >
                <p className="mb-3 text-sm text-[var(--text-muted)]">
                  Select a hidden action. Server resolves damage, accuracy, and outcomes.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn-secondary focus-ring text-sm"
                    disabled={busy}
                    onClick={() => void submit({ kind: "BASIC_ATTACK" })}
                  >
                    Basic attack
                  </button>
                  <button
                    type="button"
                    className="btn-secondary focus-ring text-sm"
                    disabled={busy}
                    onClick={() => void submit({ kind: "DEFEND" })}
                  >
                    Defend
                  </button>
                  <button
                    type="button"
                    className="btn-secondary focus-ring text-sm"
                    disabled={busy}
                    onClick={() => void submit({ kind: "FOCUS" })}
                  >
                    Focus
                  </button>
                  <button
                    type="button"
                    className="btn-secondary focus-ring text-sm text-[var(--amber)]"
                    disabled={busy}
                    onClick={() => void submit({ kind: "SURRENDER" })}
                  >
                    Surrender
                  </button>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {player?.abilities.map((ab) => (
                    <button
                      key={ab.id}
                      type="button"
                      disabled={busy || player.energy < ab.energyCost}
                      className="focus-ring flex items-start gap-3 rounded-md border border-[var(--stroke)] bg-[var(--bg-elevated)] px-3 py-2 text-left text-sm hover:border-[rgba(61,231,255,0.4)] disabled:opacity-40"
                      onClick={() => void submit({ kind: "ABILITY", abilityId: ab.id })}
                    >
                      <GameImage
                        src={itemIconPath("abilities", ab.id)}
                        fallbackSrc={itemIconFallback("abilities", ab.id)}
                        alt=""
                        width={36}
                        height={36}
                        showDevBadge={false}
                        className="shrink-0"
                      />
                      <span className="min-w-0">
                        <span className="font-medium text-white">{ab.name}</span>
                        <span className="mt-1 block text-xs text-[var(--text-muted)]">
                          {ab.category} · Pwr {ab.power} · Acc {ab.accuracy}% · EN{" "}
                          {ab.energyCost}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="panel p-4">
            <h3 className="font-display text-sm text-white">Combat log</h3>
            <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-xs text-[var(--text-muted)]">
              {log.map((line, i) => (
                <li key={`${i}-${line}`}>{line}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
