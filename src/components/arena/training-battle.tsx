"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { ArenaAction, ArenaAbilityDef } from "@/game/arena/types";
import { GameImage } from "@/components/assets/game-image";
import { ArenaNoWageringBanner, WeaponsDisclaimer } from "@/components/arena/disclosures";
import { playSfx } from "@/hooks/use-sfx";
import { itemIconFallback, itemIconPath } from "@/lib/assets/paths";
import { cn } from "@/lib/utils/cn";
import { BATTLE_ARENAS } from "@/game/arena/arenas";
import { WEATHER_CATALOG, TERRAIN_CATALOG } from "@/game/arena/weather-terrain";

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
  riftBurst?: number;
  morale?: number;
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
  weather?: string;
  terrain?: string;
  arenaId?: string;
  turnRemainingMs?: number | null;
  turnTimerSeconds?: number;
  combatants: [ClientCombatant, ClientCombatant];
  events: { type: string; actorId: string; payload: Record<string, unknown> }[];
};

type BattleRecord = {
  state: ClientState;
  arenaPointsAwarded: number | null;
  rewards?: {
    credits: number;
    xp: number;
    arenaPoints: number;
  } | null;
  mode: string;
};

type AnimSpeed = "slow" | "normal" | "fast";

const SPEED_MS: Record<AnimSpeed, number> = {
  slow: 700,
  normal: 400,
  fast: 180,
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
      <div
        className="h-2 overflow-hidden rounded-full bg-[var(--bg-elevated)]"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
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
  reducedMotion,
}: {
  c: ClientCombatant;
  side: "left" | "right";
  highlight?: boolean;
  reducedMotion: boolean;
}) {
  return (
    <motion.div
      layout={!reducedMotion}
      className={cn(
        "panel relative overflow-hidden p-4",
        highlight && "ring-1 ring-[var(--cyan)]",
      )}
      animate={
        highlight && !reducedMotion ? { scale: [1, 1.02, 1] } : undefined
      }
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
        <div className="mt-4 space-y-3">
          <Bar value={c.hp} max={c.maxHp} color="var(--mint)" label="Health" />
          <Bar value={c.energy} max={c.maxEnergy} color="var(--cyan)" label="Energy" />
          <Bar
            value={c.riftBurst ?? 0}
            max={100}
            color="var(--amber)"
            label="Rift Burst"
          />
        </div>
        {c.statuses.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1" aria-label="Status effects">
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

function FloatingNumber({
  value,
  crit,
  reducedMotion,
}: {
  value: number;
  crit?: boolean;
  reducedMotion: boolean;
}) {
  if (reducedMotion) {
    return (
      <span className={cn("text-sm font-bold", crit ? "text-[var(--amber)]" : "text-white")}>
        −{value}
        {crit ? "!" : ""}
      </span>
    );
  }
  return (
    <motion.span
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: -16 }}
      exit={{ opacity: 0 }}
      className={cn(
        "pointer-events-none absolute right-4 top-8 text-lg font-bold drop-shadow",
        crit ? "text-[var(--amber)]" : "text-white",
      )}
    >
      −{value}
      {crit ? "!" : ""}
    </motion.span>
  );
}

export function TrainingBattle() {
  const reduceMotionPref = useReducedMotion();
  const [record, setRecord] = useState<BattleRecord | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastHit, setLastHit] = useState<string | null>(null);
  const [floatDmg, setFloatDmg] = useState<{
    targetId: string;
    value: number;
    crit: boolean;
  } | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [timerMs, setTimerMs] = useState<number | null>(null);
  const [animSpeed, setAnimSpeed] = useState<AnimSpeed>("normal");
  const [forceReduceMotion, setForceReduceMotion] = useState(false);
  const [aiDifficulty, setAiDifficulty] = useState("ADEPT");
  const timedOutRef = useRef(false);
  const submitRef = useRef<(action: ArenaAction, opts?: { timedOut?: boolean }) => Promise<void>>(
    async () => undefined,
  );
  const actionsRef = useRef<HTMLDivElement>(null);
  const liveId = useId();

  const reducedMotion = Boolean(reduceMotionPref || forceReduceMotion);

  const start = useCallback(async () => {
    setBusy(true);
    setError(null);
    setLog([]);
    setFloatDmg(null);
    timedOutRef.current = false;
    let body: Record<string, unknown> = { aiDifficulty };
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
          ...body,
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
      playSfx("arena.start");
      playSfx("combat.stinger");
      setRecord(data);
      setTimerMs(data.state.turnRemainingMs ?? data.state.turnTimerSeconds * 1000);
      setLog(["Practice battle started. Select an action (30s timer)."]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "START_FAILED");
    } finally {
      setBusy(false);
    }
  }, [aiDifficulty]);

  useEffect(() => {
    void start();
  }, [start]);

  const submit = useCallback(
    async (action: ArenaAction, opts?: { timedOut?: boolean }) => {
      if (!record || record.state.status !== "ACTIVE" || busy) return;
      setBusy(true);
      setError(null);
      try {
        const clientActionId = `${record.state.publicId}-r${record.state.round}-${Date.now()}`;
        const res = await fetch("/api/arena/training/turn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            publicId: record.state.publicId,
            action,
            clientActionId,
            timedOut: opts?.timedOut,
          }),
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
            setFloatDmg({
              targetId: String(ev.payload.targetId ?? ""),
              value: Number(ev.payload.damage ?? 0),
              crit: Boolean(ev.payload.isCritical),
            });
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
          if (ev.type === "TURN_ORDER") {
            return `Turn order: ${ev.payload.first} → ${ev.payload.second}`;
          }
          if (ev.type === "WEATHER_TICK") return `Weather: ${ev.payload.weather}`;
          if (ev.type === "TERRAIN_TICK") return `Terrain: ${ev.payload.terrain}`;
          if (ev.type === "BATTLE_ENDED") return `Battle ended — winner ${ev.payload.winnerId ?? "draw"}`;
          if (ev.type === "SURRENDER") return `${ev.actorId} surrendered`;
          if (ev.type === "DEFEND" || ev.type === "GUARD") return `${ev.actorId} ${ev.type.toLowerCase()}s`;
          if (ev.type === "PHASE") return null;
          return ev.type;
        }).filter(Boolean) as string[];
        setLog((l) => [...lines, ...l].slice(0, 50));
        setRecord(data);
        setTimerMs(data.state.turnRemainingMs ?? null);
        timedOutRef.current = false;
        if (data.state.status === "COMPLETED") {
          const playerId = data.state.combatants?.[0]?.id;
          if (data.state.winnerId === playerId) playSfx("combat.win");
          else if (data.state.winnerId) playSfx("combat.lose");
        }
        window.setTimeout(() => {
          setLastHit(null);
          setFloatDmg(null);
        }, SPEED_MS[animSpeed]);
      } catch (e) {
        playSfx("ui.error");
        setError(e instanceof Error ? e.message : "TURN_FAILED");
      } finally {
        setBusy(false);
      }
    },
    [record, busy, animSpeed],
  );

  submitRef.current = submit;

  // 30s turn timer → auto-defend
  useEffect(() => {
    if (!record || record.state.status !== "ACTIVE") return;
    const budget = record.state.turnRemainingMs ?? (record.state.turnTimerSeconds ?? 30) * 1000;
    const deadline = Date.now() + budget;
    setTimerMs(budget);
    timedOutRef.current = false;
    const id = window.setInterval(() => {
      const left = Math.max(0, deadline - Date.now());
      setTimerMs(left);
      if (left <= 0 && !timedOutRef.current) {
        timedOutRef.current = true;
        void submitRef.current({ kind: "DEFEND" }, { timedOut: true });
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [record?.state.publicId, record?.state.round, record?.state.status]);

  // Keyboard shortcuts: 1–4 abilities, D defend, G guard, F focus, C charge, M meditate, A analyze, S surrender
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!record || record.state.status !== "ACTIVE" || busy) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const player = record.state.combatants[0];
      const key = e.key.toLowerCase();
      if (key === "d") void submit({ kind: "DEFEND" });
      else if (key === "g") void submit({ kind: "GUARD" });
      else if (key === "f") void submit({ kind: "FOCUS" });
      else if (key === "c") void submit({ kind: "CHARGE" });
      else if (key === "m") void submit({ kind: "MEDITATE" });
      else if (key === "a") void submit({ kind: "ANALYZE" });
      else if (key === "r") void submit({ kind: "RETREAT" });
      else if (key === "escape") void submit({ kind: "SURRENDER" });
      else if (key >= "1" && key <= "4" && player) {
        const actives = player.abilities.filter((ab) => ab.category !== "ULTIMATE");
        const ab = actives[Number(key) - 1];
        if (ab && player.energy >= ab.energyCost) {
          void submit({ kind: "ABILITY", abilityId: ab.id });
        }
      } else if (key === "u" && player) {
        const ult = player.abilities.find((ab) => ab.category === "ULTIMATE");
        if (ult && (player.riftBurst ?? 0) >= (ult.riftBurstCost ?? 100)) {
          void submit({ kind: "ULTIMATE", abilityId: ult.id });
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [record, busy, submit]);

  const player = record?.state.combatants[0];
  const opponent = record?.state.combatants[1];
  const ended = record?.state.status === "COMPLETED";
  const arena =
    BATTLE_ARENAS.find((a) => a.id === record?.state.arenaId) ?? BATTLE_ARENAS[0]!;
  const weatherId = (record?.state.weather ?? "CLEAR") as keyof typeof WEATHER_CATALOG;
  const terrainId = (record?.state.terrain ?? "NEUTRAL_RING") as keyof typeof TERRAIN_CATALOG;
  const weather = WEATHER_CATALOG[weatherId] ?? WEATHER_CATALOG.CLEAR;
  const terrain = TERRAIN_CATALOG[terrainId] ?? TERRAIN_CATALOG.NEUTRAL_RING;
  const timerSec = timerMs != null ? Math.ceil(timerMs / 1000) : null;
  const ult = player?.abilities.find((a) => a.category === "ULTIMATE");
  const actives =
    player?.abilities.filter((a) => a.category !== "ULTIMATE" && a.category !== "PASSIVE") ?? [];

  return (
    <div className="space-y-4">
      <ArenaNoWageringBanner />
      <WeaponsDisclaimer />

      <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)]">
        <label className="flex items-center gap-2">
          AI
          <select
            className="focus-ring rounded border border-[var(--stroke)] bg-[var(--bg-elevated)] px-2 py-1 text-white"
            value={aiDifficulty}
            onChange={(e) => setAiDifficulty(e.target.value)}
            disabled={busy || (record?.state.status === "ACTIVE" && !ended)}
          >
            <option value="NOVICE">Novice</option>
            <option value="ADEPT">Adept</option>
            <option value="VETERAN">Veteran</option>
            <option value="ELITE">Elite</option>
            <option value="RIFTMASTER">Riftmaster</option>
          </select>
        </label>
        <label className="flex items-center gap-2">
          Speed
          <select
            className="focus-ring rounded border border-[var(--stroke)] bg-[var(--bg-elevated)] px-2 py-1 text-white"
            value={animSpeed}
            onChange={(e) => setAnimSpeed(e.target.value as AnimSpeed)}
          >
            <option value="slow">Slow</option>
            <option value="normal">Normal</option>
            <option value="fast">Fast</option>
          </select>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={forceReduceMotion}
            onChange={(e) => setForceReduceMotion(e.target.checked)}
          />
          Reduced motion
        </label>
      </div>

      {error ? (
        <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200" role="alert">
          {error}
        </p>
      ) : null}

      {!record ? (
        <p className="text-sm text-[var(--text-muted)]">Preparing practice arena…</p>
      ) : (
        <>
          <div
            className="relative overflow-hidden rounded-lg border border-[var(--stroke)]"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(8,12,20,0.55), rgba(8,12,20,0.85)), url(${arena.artPath})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              minHeight: 120,
            }}
          >
            <div className="relative flex flex-wrap items-end justify-between gap-3 p-4">
              <div>
                <p className="font-display text-xs uppercase tracking-[0.24em] text-[var(--cyan)]">
                  Round {record.state.round}/{record.state.maxRounds} · Practice 1v1
                </p>
                <h2 className="font-display text-2xl text-white">{arena.name}</h2>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  {weather.name} · {terrain.name}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {timerSec != null && !ended ? (
                  <p
                    className={cn(
                      "font-display text-lg tabular-nums",
                      timerSec <= 5 ? "text-[var(--amber)]" : "text-white",
                    )}
                    aria-live="polite"
                  >
                    {timerSec}s
                  </p>
                ) : null}
                <button
                  type="button"
                  className="btn-secondary focus-ring text-sm"
                  onClick={() => void start()}
                  disabled={busy}
                >
                  New practice battle
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative">
              {player ? (
                <CombatantCard
                  c={player}
                  side="left"
                  highlight={lastHit === player.id}
                  reducedMotion={reducedMotion}
                />
              ) : null}
              <AnimatePresence>
                {floatDmg && floatDmg.targetId === player?.id ? (
                  <FloatingNumber
                    value={floatDmg.value}
                    crit={floatDmg.crit}
                    reducedMotion={reducedMotion}
                  />
                ) : null}
              </AnimatePresence>
            </div>
            <div className="relative">
              {opponent ? (
                <CombatantCard
                  c={opponent}
                  side="right"
                  highlight={lastHit === opponent.id}
                  reducedMotion={reducedMotion}
                />
              ) : null}
              <AnimatePresence>
                {floatDmg && floatDmg.targetId === opponent?.id ? (
                  <FloatingNumber
                    value={floatDmg.value}
                    crit={floatDmg.crit}
                    reducedMotion={reducedMotion}
                  />
                ) : null}
              </AnimatePresence>
            </div>
          </div>

          <p id={liveId} className="sr-only" aria-live="polite">
            {log[0] ?? ""}
          </p>

          <AnimatePresence mode="wait">
            {ended ? (
              <motion.div
                key="results"
                initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="panel relative overflow-hidden p-6 text-center"
              >
                <GameImage
                  src={
                    record.state.winnerId === player?.id
                      ? "/assets/battle/ui/victory-banner.png"
                      : "/assets/battle/ui/defeat-banner.png"
                  }
                  fallbackSrc={
                    record.state.winnerId === player?.id
                      ? "/assets/battle/ui/victory-banner.svg"
                      : "/assets/battle/ui/defeat-banner.svg"
                  }
                  alt=""
                  width={640}
                  height={160}
                  showDevBadge={false}
                  className="mx-auto mb-4 max-h-28 w-full object-cover opacity-80"
                />
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
                {record.rewards ? (
                  <p className="mt-3 text-sm text-[var(--mint)]">
                    Rewards: +{record.rewards.credits} Credits · +{record.rewards.xp} XP · +
                    {record.rewards.arenaPoints} Arena Points (capped, no SOL)
                  </p>
                ) : record.arenaPointsAwarded != null ? (
                  <p className="mt-3 text-sm text-[var(--mint)]">
                    Arena Points earned: +{record.arenaPointsAwarded}
                  </p>
                ) : null}
              </motion.div>
            ) : (
              <motion.div
                key="actions"
                ref={actionsRef}
                initial={reducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                className="panel p-4"
              >
                <p className="mb-3 text-sm text-[var(--text-muted)]">
                  Server-authoritative actions. Keys: 1–4 abilities · U ultimate · D defend · G guard ·
                  F focus · C charge · M meditate · A analyze · Esc surrender
                </p>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      ["BASIC_ATTACK", "Attack"],
                      ["DEFEND", "Defend"],
                      ["GUARD", "Guard"],
                      ["FOCUS", "Focus"],
                      ["CHARGE", "Charge"],
                      ["MEDITATE", "Meditate"],
                      ["ANALYZE", "Analyze"],
                      ["SURRENDER", "Surrender"],
                    ] as const
                  ).map(([kind, label]) => (
                    <button
                      key={kind}
                      type="button"
                      className={cn(
                        "btn-secondary focus-ring text-sm",
                        kind === "SURRENDER" && "text-[var(--amber)]",
                      )}
                      disabled={busy}
                      onClick={() => void submit({ kind })}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {actives.map((ab, i) => (
                    <button
                      key={ab.id}
                      type="button"
                      disabled={busy || (player?.energy ?? 0) < ab.energyCost}
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
                        <span className="font-medium text-white">
                          {i < 4 ? `${i + 1}. ` : ""}
                          {ab.name}
                        </span>
                        <span className="mt-1 block text-xs text-[var(--text-muted)]">
                          {ab.category} · Pwr {ab.power} · Acc {ab.accuracy}% · EN {ab.energyCost}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
                {ult ? (
                  <button
                    type="button"
                    disabled={
                      busy || (player?.riftBurst ?? 0) < (ult.riftBurstCost ?? 100)
                    }
                    className="focus-ring mt-3 w-full rounded-md border border-[var(--amber)]/50 bg-[rgba(255,180,60,0.12)] px-3 py-3 text-left text-sm disabled:opacity-40"
                    onClick={() => void submit({ kind: "ULTIMATE", abilityId: ult.id })}
                  >
                    <span className="font-display text-[var(--amber)]">U · {ult.name}</span>
                    <span className="mt-1 block text-xs text-[var(--text-muted)]">
                      Rift Burst {player?.riftBurst ?? 0}/{ult.riftBurstCost ?? 100} · Pwr{" "}
                      {ult.power}
                    </span>
                  </button>
                ) : null}
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
