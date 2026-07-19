"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { getTcgCardDef } from "@/game/tcg/card-catalog";
import { cn } from "@/lib/utils/cn";

export type BattleEvent = {
  type: string;
  actorId: string;
  payload: Record<string, unknown>;
};

export type AffinityKey =
  | "EMBER"
  | "TIDE"
  | "GROVE"
  | "STORM"
  | "STONE"
  | "FROST"
  | "VOID"
  | "RADIANT"
  | "SPIRIT"
  | "ALLOY"
  | string;

/** Distinct elemental tints for summon / spell / particle FX. */
export const AFFINITY_VFX: Record<
  string,
  { css: string; rgb: string; label: string }
> = {
  EMBER: { css: "#ff7a3d", rgb: "255, 122, 61", label: "Ember" },
  TIDE: { css: "#3db8ff", rgb: "61, 184, 255", label: "Tide" },
  GROVE: { css: "#5dcc6a", rgb: "93, 204, 106", label: "Grove" },
  STORM: { css: "#c9a6ff", rgb: "201, 166, 255", label: "Storm" },
  STONE: { css: "#c4a574", rgb: "196, 165, 116", label: "Stone" },
  FROST: { css: "#8ec8ff", rgb: "142, 200, 255", label: "Frost" },
  VOID: { css: "#a78bfa", rgb: "167, 139, 250", label: "Void" },
  RADIANT: { css: "#ffe08a", rgb: "255, 224, 138", label: "Radiant" },
  SPIRIT: { css: "#e8c4ff", rgb: "232, 196, 255", label: "Spirit" },
  ALLOY: { css: "#b8c0cc", rgb: "184, 192, 204", label: "Alloy" },
};

export function normalizeAffinity(raw: unknown): string {
  if (typeof raw !== "string" || !raw.trim()) return "SPIRIT";
  return raw.trim().toUpperCase();
}

export function affinityVfx(raw: unknown) {
  const key = normalizeAffinity(raw);
  return AFFINITY_VFX[key] ?? AFFINITY_VFX.SPIRIT;
}

type FxKind =
  | "summon"
  | "spell"
  | "attack"
  | "energy"
  | "energySpend"
  | "cardReveal"
  | "damage"
  | "turn"
  | "outcome"
  | "illegal";

export type BattleFxItem = {
  id: string;
  kind: FxKind;
  actorId?: string;
  targetSideId?: string;
  affinity?: string;
  amount?: number;
  label?: string;
  defId?: string;
  cardName?: string;
  artSrc?: string;
  yours?: boolean;
  createdAt: number;
};

export type BoardPulse = {
  sideId: string;
  kind: "summon" | "attack" | "spell";
  affinity?: string;
  until: number;
};

export type MeterPulse = {
  sideId: string;
  kind: "damage" | "heal" | "energy" | "energySpend" | "shield";
  until: number;
};

export type BattleVfxState = {
  fx: BattleFxItem[];
  boardPulses: BoardPulse[];
  meterPulses: MeterPulse[];
  spawnTokenBySide: Record<string, number>;
  banner: { text: string; tone: "turn" | "victory" | "defeat" | "draw" } | null;
};

const EMPTY: BattleVfxState = {
  fx: [],
  boardPulses: [],
  meterPulses: [],
  spawnTokenBySide: {},
  banner: null,
};

function ttlFor(kind: FxKind, reduceMotion: boolean): number {
  if (reduceMotion) {
    if (kind === "outcome") return 900;
    if (kind === "turn") return 500;
    if (kind === "cardReveal") return 450;
    return 280;
  }
  switch (kind) {
    case "outcome":
      return 2800;
    case "turn":
      return 1100;
    case "cardReveal":
      return 1600;
    case "spell":
      return 900;
    case "attack":
      return 780;
    case "summon":
      return 720;
    case "energy":
      return 650;
    case "energySpend":
      return 700;
    case "damage":
      return 900;
    case "illegal":
      return 420;
    default:
      return 700;
  }
}

function eventAffinity(ev: BattleEvent): string {
  const p = ev.payload;
  if (typeof p.affinity === "string" || typeof p.element === "string") {
    return normalizeAffinity(p.affinity ?? p.element ?? p.cardAffinity);
  }
  if (typeof p.defId === "string") {
    const def = getTcgCardDef(p.defId);
    if (def?.affinity) return normalizeAffinity(def.affinity);
  }
  return "SPIRIT";
}

function playCostFromEvent(ev: BattleEvent): number | undefined {
  if (typeof ev.payload.cost === "number") return ev.payload.cost;
  if (typeof ev.payload.defId === "string") {
    const def = getTcgCardDef(ev.payload.defId);
    if (def) return def.riftCost;
  }
  return undefined;
}

function cardRevealFromEvent(
  ev: BattleEvent,
  yours: boolean,
  now: number,
  idx: number,
): BattleFxItem | null {
  if (yours) return null;
  const defId = typeof ev.payload.defId === "string" ? ev.payload.defId : null;
  if (!defId) return null;
  const def = getTcgCardDef(defId);
  return {
    id: `reveal-${now}-${idx}`,
    kind: "cardReveal",
    actorId: ev.actorId,
    affinity: eventAffinity(ev),
    defId,
    cardName: def?.name ?? defId,
    artSrc: def?.cardImagePath ?? def?.artPath,
    yours: false,
    createdAt: now,
  };
}

/**
 * Diff match events into ephemeral VFX. Call whenever `events` grows.
 */
export function useBattleVfx(opts: {
  events: BattleEvent[] | undefined;
  yourSideId: string | undefined;
  matchStatus?: "ACTIVE" | "COMPLETED";
  winnerId?: string | null;
  reduceMotion?: boolean | null;
  /** Bump when illegal play feedback should shake the hand/field. */
  illegalToken?: number;
}): BattleVfxState {
  const reduceMotion = Boolean(opts.reduceMotion);
  const processed = useRef(0);
  const matchBootstrapped = useRef<string | null>(null);
  const [state, setState] = useState<BattleVfxState>(EMPTY);

  // Reset when match identity changes (publicId not always here — use first event signature).
  useEffect(() => {
    const sig = opts.events?.[0]
      ? `${opts.events[0].type}:${opts.events.length}`
      : "none";
    // Only hard-reset when events shrink (new match).
    if (opts.events && opts.events.length < processed.current) {
      processed.current = 0;
      matchBootstrapped.current = null;
      setState(EMPTY);
    }
    void sig;
  }, [opts.events]);

  useEffect(() => {
    if (!opts.events) return;
    // Skip historical backlog on first mount so we don't replay the whole log.
    if (matchBootstrapped.current === null) {
      matchBootstrapped.current = "ready";
      processed.current = opts.events.length;
      return;
    }
    if (opts.events.length <= processed.current) return;

    const fresh = opts.events.slice(processed.current);
    processed.current = opts.events.length;
    const now = Date.now();
    const nextFx: BattleFxItem[] = [];
    const nextBoard: BoardPulse[] = [];
    const nextMeter: MeterPulse[] = [];
    let banner: BattleVfxState["banner"] = null;
    const spawnBump: Record<string, number> = {};

    for (const ev of fresh) {
      const yours = Boolean(opts.yourSideId && ev.actorId === opts.yourSideId);
      switch (ev.type) {
        case "PLAY_UNIT":
        case "PLAY_SPELL":
        case "PLAY_AURA_STUB": {
          const aff = eventAffinity(ev);
          const cost = playCostFromEvent(ev);
          const reveal = cardRevealFromEvent(ev, yours, now, nextFx.length);
          if (reveal) nextFx.push(reveal);

          if (typeof cost === "number" && cost > 0) {
            nextFx.push({
              id: `spend-${now}-${nextFx.length}`,
              kind: "energySpend",
              actorId: ev.actorId,
              amount: cost,
              yours,
              createdAt: now,
            });
            nextMeter.push({
              sideId: ev.actorId,
              kind: "energySpend",
              until: now + ttlFor("energySpend", reduceMotion),
            });
          }

          if (ev.type === "PLAY_UNIT") {
            nextFx.push({
              id: `summon-${now}-${nextFx.length}`,
              kind: "summon",
              actorId: ev.actorId,
              affinity: aff,
              yours,
              createdAt: now,
            });
            nextBoard.push({
              sideId: ev.actorId,
              kind: "summon",
              affinity: aff,
              until: now + ttlFor("summon", reduceMotion),
            });
            spawnBump[ev.actorId] = (spawnBump[ev.actorId] ?? 0) + 1;
          } else if (ev.type === "PLAY_SPELL") {
            const dmg =
              typeof ev.payload.damage === "number"
                ? ev.payload.damage
                : undefined;
            nextFx.push({
              id: `spell-${now}-${nextFx.length}`,
              kind: "spell",
              actorId: ev.actorId,
              affinity: aff,
              amount: dmg,
              yours,
              createdAt: now,
            });
            nextBoard.push({
              sideId: ev.actorId,
              kind: "spell",
              affinity: aff,
              until: now + ttlFor("spell", reduceMotion),
            });
            if (dmg && opts.yourSideId) {
              const targetSideId =
                ev.actorId === opts.yourSideId
                  ? "__foe__"
                  : opts.yourSideId;
              nextMeter.push({
                sideId: targetSideId === "__foe__" ? "foe" : targetSideId,
                kind: "damage",
                until: now + ttlFor("damage", reduceMotion),
              });
              nextFx.push({
                id: `dmg-${now}-${nextFx.length}`,
                kind: "damage",
                targetSideId: targetSideId === "__foe__" ? "foe" : targetSideId,
                amount: dmg,
                createdAt: now,
              });
            }
          }
          break;
        }
        case "BOARD_ATTACK": {
          const dmg =
            typeof ev.payload.damage === "number" ? ev.payload.damage : 0;
          nextFx.push({
            id: `atk-${now}-${nextFx.length}`,
            kind: "attack",
            actorId: ev.actorId,
            amount: dmg,
            yours,
            createdAt: now,
          });
          nextBoard.push({
            sideId: ev.actorId,
            kind: "attack",
            until: now + ttlFor("attack", reduceMotion),
          });
          if (dmg > 0) {
            const targetIsYou = ev.actorId !== opts.yourSideId;
            const targetSideId = targetIsYou
              ? opts.yourSideId ?? "player"
              : "foe";
            nextMeter.push({
              sideId: targetSideId,
              kind: "damage",
              until: now + ttlFor("damage", reduceMotion),
            });
            nextFx.push({
              id: `dmg-${now}-${nextFx.length}`,
              kind: "damage",
              targetSideId,
              amount: dmg,
              createdAt: now,
            });
          }
          break;
        }
        case "TURN_START": {
          const energy =
            typeof ev.payload.riftEnergy === "number"
              ? ev.payload.riftEnergy
              : undefined;
          const turn =
            typeof ev.payload.turn === "number" ? ev.payload.turn : undefined;
          nextFx.push({
            id: `energy-${now}-${nextFx.length}`,
            kind: "energy",
            actorId: ev.actorId,
            amount: energy,
            yours,
            createdAt: now,
          });
          nextMeter.push({
            sideId: ev.actorId,
            kind: "energy",
            until: now + ttlFor("energy", reduceMotion),
          });
          banner = {
            text: yours
              ? turn
                ? `Your turn · ${turn}`
                : "Your turn"
              : turn
                ? `Challenger turn · ${turn}`
                : "Challenger turn",
            tone: "turn",
          };
          nextFx.push({
            id: `turn-${now}-${nextFx.length}`,
            kind: "turn",
            actorId: ev.actorId,
            yours,
            label: banner.text,
            createdAt: now,
          });
          break;
        }
        case "MATCH_END": {
          const win = opts.winnerId;
          const result =
            !win
              ? "draw"
              : win === opts.yourSideId
                ? "victory"
                : "defeat";
          banner = {
            text:
              result === "victory"
                ? "Victory"
                : result === "defeat"
                  ? "Defeat"
                  : "Draw",
            tone: result,
          };
          nextFx.push({
            id: `outcome-${now}`,
            kind: "outcome",
            label: banner.text,
            yours: result === "victory",
            createdAt: now,
          });
          break;
        }
        default:
          break;
      }
    }

    if (!nextFx.length && !nextBoard.length && !nextMeter.length && !banner) {
      return;
    }

    setState((prev) => ({
      fx: [...prev.fx, ...nextFx].slice(-24),
      boardPulses: [...prev.boardPulses, ...nextBoard].slice(-12),
      meterPulses: [...prev.meterPulses, ...nextMeter].slice(-12),
      spawnTokenBySide: {
        ...prev.spawnTokenBySide,
        ...Object.fromEntries(
          Object.entries(spawnBump).map(([k, v]) => [
            k,
            (prev.spawnTokenBySide[k] ?? 0) + v,
          ]),
        ),
      },
      banner: banner ?? prev.banner,
    }));
  }, [
    opts.events,
    opts.yourSideId,
    opts.winnerId,
    reduceMotion,
  ]);

  // Outcome from status when MATCH_END was skipped on bootstrap.
  useEffect(() => {
    if (opts.matchStatus !== "COMPLETED") return;
    setState((prev) => {
      if (prev.fx.some((f) => f.kind === "outcome")) return prev;
      const result =
        opts.winnerId == null
          ? "draw"
          : opts.winnerId === opts.yourSideId
            ? "victory"
            : "defeat";
      const now = Date.now();
      const label =
        result === "victory"
          ? "Victory"
          : result === "defeat"
            ? "Defeat"
            : "Draw";
      return {
        ...prev,
        banner: { text: label, tone: result },
        fx: [
          ...prev.fx,
          {
            id: `outcome-status-${now}`,
            kind: "outcome",
            label,
            yours: result === "victory",
            createdAt: now,
          },
        ],
      };
    });
  }, [opts.matchStatus, opts.winnerId, opts.yourSideId]);

  // Illegal play shake
  useEffect(() => {
    if (!opts.illegalToken) return;
    const now = Date.now();
    const item: BattleFxItem = {
      id: `illegal-${opts.illegalToken}`,
      kind: "illegal",
      createdAt: now,
    };
    setState((prev) => ({
      ...prev,
      fx: [...prev.fx, item].slice(-24),
    }));
  }, [opts.illegalToken]);

  // GC expired FX / pulses / banners
  useEffect(() => {
    const id = window.setInterval(() => {
      const now = Date.now();
      setState((prev) => {
        const fx = prev.fx.filter(
          (f) => now - f.createdAt < ttlFor(f.kind, reduceMotion) + 80,
        );
        const boardPulses = prev.boardPulses.filter((p) => p.until > now);
        const meterPulses = prev.meterPulses.filter((p) => p.until > now);
        const bannerAlive =
          prev.banner &&
          prev.fx.some(
            (f) =>
              (f.kind === "turn" || f.kind === "outcome") &&
              now - f.createdAt < ttlFor(f.kind, reduceMotion),
          );
        if (
          fx.length === prev.fx.length &&
          boardPulses.length === prev.boardPulses.length &&
          meterPulses.length === prev.meterPulses.length &&
          Boolean(bannerAlive) === Boolean(prev.banner)
        ) {
          return prev;
        }
        return {
          ...prev,
          fx,
          boardPulses,
          meterPulses,
          banner: bannerAlive ? prev.banner : null,
        };
      });
    }, 120);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  return state;
}

export function sideHasBoardPulse(
  pulses: BoardPulse[],
  sideId: string,
  kind?: BoardPulse["kind"],
): BoardPulse | undefined {
  return pulses.find(
    (p) => p.sideId === sideId && (!kind || p.kind === kind),
  );
}

export function sideHasMeterPulse(
  pulses: MeterPulse[],
  sideId: string,
  kind?: MeterPulse["kind"],
): MeterPulse | undefined {
  return pulses.find(
    (p) => p.sideId === sideId && (!kind || p.kind === kind),
  );
}

/** Stage overlay: banners, floats, spell swirls, strike flashes. */
export function BattleVfxLayer({
  vfx,
  yourSideId,
  foeSideId,
  className,
}: {
  vfx: BattleVfxState;
  yourSideId?: string;
  foeSideId?: string;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const uid = useId();

  const floats = useMemo(
    () =>
      vfx.fx.filter(
        (f) =>
          f.kind === "damage" ||
          f.kind === "energy" ||
          f.kind === "energySpend",
      ),
    [vfx.fx],
  );
  const spells = useMemo(
    () => vfx.fx.filter((f) => f.kind === "spell"),
    [vfx.fx],
  );
  const summons = useMemo(
    () => vfx.fx.filter((f) => f.kind === "summon"),
    [vfx.fx],
  );
  const attacks = useMemo(
    () => vfx.fx.filter((f) => f.kind === "attack"),
    [vfx.fx],
  );
  const reveals = useMemo(
    () => vfx.fx.filter((f) => f.kind === "cardReveal"),
    [vfx.fx],
  );

  return (
    <div
      className={cn("battle-vfx", className)}
      aria-hidden
      data-reduced={reduceMotion ? "1" : "0"}
    >
      <AnimatePresence>
        {vfx.banner && (
          <motion.div
            key={`${uid}-banner-${vfx.banner.text}`}
            className={cn(
              "battle-vfx__banner",
              `battle-vfx__banner--${vfx.banner.tone}`,
            )}
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: -12, scale: 0.94 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 8, scale: 1.04 }
            }
            transition={{ duration: reduceMotion ? 0.15 : 0.35, ease: "easeOut" }}
          >
            <span>{vfx.banner.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {spells.map((f) => {
        const tint = affinityVfx(f.affinity);
        return (
          <div
            key={f.id}
            className="battle-vfx__spell"
            style={
              {
                "--bvfx": tint.css,
                "--bvfx-rgb": tint.rgb,
              } as CSSProperties
            }
          >
            <span className="battle-vfx__spell-ring" />
            <span className="battle-vfx__spell-ring battle-vfx__spell-ring--delay" />
            <span className="battle-vfx__spell-core" />
          </div>
        );
      })}

      {summons.map((f) => {
        const tint = affinityVfx(f.affinity);
        const lane = f.yours ? "you" : "foe";
        return (
          <div
            key={f.id}
            className={cn("battle-vfx__summon-burst", `battle-vfx__summon-burst--${lane}`)}
            style={
              {
                "--bvfx": tint.css,
                "--bvfx-rgb": tint.rgb,
              } as CSSProperties
            }
          >
            <span className="battle-vfx__particle" />
            <span className="battle-vfx__particle" />
            <span className="battle-vfx__particle" />
            <span className="battle-vfx__particle" />
            <span className="battle-vfx__particle" />
            <span className="battle-vfx__summon-glow" />
          </div>
        );
      })}

      {attacks.map((f) => {
        const towardFoe = f.actorId === yourSideId;
        return (
          <div
            key={f.id}
            className={cn(
              "battle-vfx__strike",
              towardFoe ? "battle-vfx__strike--up" : "battle-vfx__strike--down",
            )}
          >
            <span className="battle-vfx__strike-flash" />
          </div>
        );
      })}

      {floats.map((f) => {
        const isEnergyGain = f.kind === "energy";
        const isEnergySpend = f.kind === "energySpend";
        const isEnergy = isEnergyGain || isEnergySpend;
        const onYou =
          f.targetSideId === yourSideId ||
          f.targetSideId === "player" ||
          (isEnergy && f.yours) ||
          (isEnergy && f.actorId === yourSideId);
        const onFoe =
          f.targetSideId === "foe" ||
          f.targetSideId === foeSideId ||
          (isEnergy && !onYou && Boolean(f.actorId));
        return (
          <div
            key={f.id}
            className={cn(
              "battle-vfx__float",
              isEnergySpend
                ? "battle-vfx__float--energy-spend"
                : isEnergyGain
                  ? "battle-vfx__float--energy"
                  : "battle-vfx__float--damage",
              onYou && "battle-vfx__float--you",
              onFoe && "battle-vfx__float--foe",
            )}
          >
            {isEnergySpend
              ? `−${f.amount ?? 0} RE`
              : isEnergyGain
                ? `+${f.amount ?? ""} RE`
                : `-${f.amount ?? 0}`}
          </div>
        );
      })}

      <AnimatePresence>
        {reveals.map((f) => (
          <motion.div
            key={f.id}
            className="battle-vfx__card-reveal"
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: -18, scale: 0.9 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 10, scale: 0.96 }
            }
            transition={{
              duration: reduceMotion ? 0.15 : 0.32,
              ease: "easeOut",
            }}
          >
            <p className="battle-vfx__card-reveal-eyebrow">Challenger plays</p>
            <div className="battle-vfx__card-reveal-face">
              {f.artSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.artSrc} alt="" />
              ) : (
                <span>{f.cardName?.[0] ?? "?"}</span>
              )}
            </div>
            <p className="battle-vfx__card-reveal-name">{f.cardName}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function BoardUnitShell({
  children,
  affinity,
  exhausted,
  spawn,
  attackPulse,
  summonPulse,
  reduceMotion,
}: {
  children: ReactNode;
  affinity?: string;
  exhausted?: boolean;
  spawn?: boolean;
  attackPulse?: boolean;
  summonPulse?: boolean;
  reduceMotion?: boolean;
}) {
  const tint = affinityVfx(affinity);
  return (
    <div
      className={cn(
        "battle-unit",
        exhausted && "battle-unit--exhausted",
        spawn && !reduceMotion && "battle-unit--spawn",
        spawn && reduceMotion && "battle-unit--spawn-soft",
        attackPulse && "battle-unit--strike",
        summonPulse && "battle-unit--summon-glow",
      )}
      style={
        {
          "--bvfx": tint.css,
          "--bvfx-rgb": tint.rgb,
        } as CSSProperties
      }
      data-affinity={normalizeAffinity(affinity)}
    >
      {children}
    </div>
  );
}
