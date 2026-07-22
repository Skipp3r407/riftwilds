/**
 * Build natural-language Event Feed lines from structured match events.
 */

import { getEventMeta, isPlayerVisibleEvent } from "@/game/tcg/events/catalog";
import type {
  FeedLine,
  MatchFeedSummary,
  TcgFeedFilter,
  TcgFeedIcon,
  TcgFeedTone,
} from "@/game/tcg/events/types";

export type RawMatchEvent = {
  type: string;
  actorId: string;
  payload: Record<string, unknown>;
};

function str(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function cardLabel(payload: Record<string, unknown>, key = "cardName"): string {
  return (
    str(payload[key]) ??
    str(payload.attackerName) ??
    str(payload.targetName) ??
    str(payload.defId) ??
    "a card"
  );
}

function laneLabel(lane: unknown): string {
  if (lane === "back") return "Backline";
  return "Frontline";
}

function actorLabel(
  actorId: string,
  yourSideId: string,
  names: Record<string, string>,
): { label: string; yours: boolean } {
  const yours = actorId === yourSideId;
  if (yours) return { label: "You", yours: true };
  return { label: names[actorId] ?? "Foe", yours: false };
}

function possessive(yours: boolean, name: string): string {
  return yours ? "Your" : `${name}'s`;
}

function filtersFromCategories(
  cats: string[],
): Exclude<TcgFeedFilter, "all">[] {
  const out = new Set<Exclude<TcgFeedFilter, "all">>();
  for (const c of cats) {
    if (
      c === "combat" ||
      c === "abilities" ||
      c === "cards" ||
      c === "status" ||
      c === "system"
    ) {
      out.add(c);
    }
    if (c === "energy" || c === "draw") out.add("system");
    if (c === "energy") out.add("abilities");
    if (c === "draw") out.add("cards");
  }
  return [...out];
}

function line(partial: Omit<FeedLine, "id"> & { id?: string }, id: string): FeedLine {
  return { id, ...partial };
}

function tooltipFor(type: string, payload: Record<string, unknown>): string | undefined {
  const bits: string[] = [];
  const atk = str(payload.attackerName) ?? str(payload.attackerDefId);
  const tgt = str(payload.targetName) ?? str(payload.targetDefId);
  const dmg = num(payload.damage);
  const heal = num(payload.heal);
  const cost = num(payload.cost);
  const lane = str(payload.lane);
  const reason = str(payload.reason);
  if (atk) bits.push(`Attacker: ${atk}`);
  if (tgt) bits.push(`Target: ${tgt}`);
  if (dmg != null) bits.push(`Damage: ${dmg}`);
  if (heal != null) bits.push(`Heal: ${heal}`);
  if (cost != null) bits.push(`Cost: ${cost} Energy`);
  if (lane) bits.push(`Lane: ${laneLabel(lane)}`);
  if (payload.crit === true) bits.push("Critical hit");
  if (payload.shieldBroken === true) bits.push("Shield broken");
  if (num(payload.wardBlocked) != null || type === "WARD_BLOCK") {
    bits.push("Ward absorbed the hit");
  }
  if (reason) bits.push(`Reason: ${reason}`);
  const energyBefore = num(payload.energyBefore);
  const energyAfter = num(payload.energyAfter);
  if (energyBefore != null && energyAfter != null) {
    bits.push(`Energy ${energyBefore} → ${energyAfter}`);
  }
  return bits.length ? bits.join(" · ") : undefined;
}

function highlightIds(payload: Record<string, unknown>): string[] {
  const ids: string[] = [];
  for (const key of [
    "instanceId",
    "attackerId",
    "targetId",
    "targetInstanceId",
  ] as const) {
    const v = str(payload[key]);
    if (v) ids.push(v);
  }
  return ids;
}

type BuildOpts = {
  yourSideId: string;
  sideNames?: Record<string, string>;
};

/**
 * Convert raw engine events into chronological player feed lines
 * (oldest → newest). Callers reverse for newest-first UI if desired.
 */
export function buildBattleFeed(
  events: RawMatchEvent[],
  opts: BuildOpts,
): FeedLine[] {
  const names = opts.sideNames ?? {};
  const out: FeedLine[] = [];
  let lastTurn: number | null = null;
  let lastPhaseLabel: string | null = null;
  let combatBuffer: FeedLine[] = [];
  let combatKey = "";

  const flushCombat = () => {
    if (combatBuffer.length === 0) return;
    const first = combatBuffer[0]!;
    if (combatBuffer.length === 1) {
      out.push(combatBuffer[0]!);
    } else {
      out.push(
        line(
          {
            kind: "combat-block",
            filters: ["combat"],
            icon: "attack",
            tone: first.tone,
            text: first.text,
            tooltip: first.tooltip,
            highlightIds: [
              ...new Set(combatBuffer.flatMap((c) => c.highlightIds ?? [])),
            ],
            turn: first.turn,
            sourceTypes: combatBuffer.flatMap((c) => c.sourceTypes ?? []),
            yours: first.yours,
            children: combatBuffer,
            flash: "damage",
          },
          `combat-${first.id}`,
        ),
      );
    }
    combatBuffer = [];
    combatKey = "";
  };

  const pushPhase = (
    text: string,
    turn: number,
    id: string,
    yours: boolean,
  ) => {
    if (lastPhaseLabel === text) return;
    lastPhaseLabel = text;
    out.push(
      line(
        {
          kind: "phase",
          filters: ["system"],
          icon: "phase",
          tone: "phase",
          text,
          turn,
          yours,
        },
        id,
      ),
    );
  };

  for (let i = 0; i < events.length; i += 1) {
    const e = events[i]!;
    const payload = e.payload ?? {};
    if (!isPlayerVisibleEvent(e.type, payload as { hiddenFromPlayer?: boolean })) {
      continue;
    }

    const meta = getEventMeta(e.type);
    const turn: number = num(payload.turn) ?? lastTurn ?? 1;
    const { label: who, yours } = actorLabel(e.actorId, opts.yourSideId, names);
    const seq = num(payload.seq) ?? i;
    const id = `ev-${seq}-${e.type}`;
    const tone: TcgFeedTone = yours
      ? meta.defaultTone === "neutral"
        ? "you"
        : meta.defaultTone
      : meta.defaultTone === "neutral"
        ? "foe"
        : meta.defaultTone;
    const filters = filtersFromCategories(meta.categories);
    const tip = tooltipFor(e.type, payload);
    const highlights = highlightIds(payload);

    if (lastTurn !== turn && e.type !== "MATCH_START") {
      flushCombat();
      out.push(
        line(
          {
            kind: "divider",
            filters: ["system"],
            icon: "phase",
            tone: "phase",
            text: `Turn ${turn}`,
            turn,
          },
          `turn-div-${turn}-${seq}`,
        ),
      );
      lastTurn = turn;
      lastPhaseLabel = null;
    } else if (lastTurn == null) {
      lastTurn = turn;
    }

    const pushNormal = (text: string, extra?: Partial<FeedLine>) => {
      flushCombat();
      out.push(
        line(
          {
            kind: "line",
            filters,
            icon: (extra?.icon as TcgFeedIcon) ?? meta.icon,
            tone: extra?.tone ?? tone,
            text,
            tooltip: tip,
            highlightIds: highlights,
            turn,
            sourceTypes: [e.type],
            yours,
            flash: extra?.flash,
            ...extra,
          },
          id,
        ),
      );
    };

    const pushCombatChild = (text: string, extra?: Partial<FeedLine>) => {
      const key = `${turn}-${e.actorId}`;
      if (combatKey && combatKey !== key) flushCombat();
      combatKey = key;
      combatBuffer.push(
        line(
          {
            kind: "line",
            filters: ["combat"],
            icon: (extra?.icon as TcgFeedIcon) ?? meta.icon,
            tone: extra?.tone ?? tone,
            text,
            tooltip: tip,
            highlightIds: highlights,
            turn,
            sourceTypes: [e.type],
            yours,
            flash: extra?.flash,
          },
          id,
        ),
      );
    };

    switch (e.type) {
      case "MATCH_START": {
        pushNormal("Match begins. Keepers take the field.");
        break;
      }
      case "TURN_START": {
        flushCombat();
        const phase = str(payload.phase) ?? "MAIN";
        const yoursTurn = e.actorId === opts.yourSideId;
        pushPhase(
          yoursTurn ? "YOUR TURN" : `${who.toUpperCase()}'S TURN`,
          turn,
          `phase-turn-${seq}`,
          yoursTurn,
        );
        if (phase === "MAIN") {
          pushPhase("Main", turn, `phase-main-${seq}`, yoursTurn);
        }
        // Avoid duplicate "turn start" prose — divider + phase is enough.
        break;
      }
      case "COMBAT_PHASE": {
        flushCombat();
        pushPhase("Combat", turn, `phase-combat-${seq}`, yours);
        break;
      }
      case "END_PHASE": {
        flushCombat();
        pushPhase("End", turn, `phase-end-${seq}`, yours);
        break;
      }
      case "ENERGY_REFILL": {
        const before = num(payload.energyBefore);
        const after = num(payload.energyAfter) ?? num(payload.riftEnergy);
        const gained = num(payload.gained) ??
          (before != null && after != null ? Math.max(0, after - before) : null);
        const maxDelta = num(payload.maxGained);
        if (gained != null && gained > 0 && before != null && after != null) {
          pushNormal(
            `${who} gained ${gained} Rift Energy. Energy: ${before} → ${after}`,
            { flash: "energy", icon: "energy", tone: "energy" },
          );
        } else if (maxDelta != null && maxDelta > 0 && after != null) {
          const prevMax = num(payload.previousMax);
          pushNormal(
            prevMax != null
              ? `${who} gained ${maxDelta} Rift Energy. Energy: ${prevMax} → ${after}`
              : `${who} refilled Rift Energy to ${after}.`,
            { flash: "energy", icon: "energy", tone: "energy" },
          );
        }
        // Silent when energy max unchanged and no gain (e.g. turn-1 refill).
        break;
      }
      case "DRAW": {
        pushNormal(`${who} drew ${cardLabel(payload)}.`, {
          icon: "draw",
          flash: "newest",
        });
        break;
      }
      case "HAND_FULL_BURN": {
        pushNormal(
          `${possessive(yours, who)} hand was full — ${cardLabel(payload)} burned in the Rift.`,
          { tone: "system" },
        );
        break;
      }
      case "RIFT_COLLAPSE": {
        const dmg = num(payload.damage) ?? 1;
        pushNormal(
          `Rift Collapse! ${possessive(yours, who)} Keeper took ${dmg} damage.`,
          { flash: "damage", tone: "damage", icon: "damage" },
        );
        break;
      }
      case "PLAY_UNIT": {
        const name = cardLabel(payload);
        const lane = laneLabel(payload.lane);
        pushNormal(`${who} summoned ${name} to the ${lane}.`, {
          icon: "summon",
          flash: "newest",
        });
        break;
      }
      case "PLAY_SPELL":
      case "ECHO_SPELL": {
        const name = cardLabel(payload);
        const dmg = num(payload.damage);
        const echoed = e.type === "ECHO_SPELL" || payload.echoed === true;
        pushNormal(
          dmg != null
            ? `${who} cast ${name}${echoed ? " (Echo)" : ""} — ${dmg} damage.`
            : `${who} cast ${name}${echoed ? " (Echo)" : ""}.`,
          {
            icon: "ability",
            flash: dmg != null ? "damage" : "newest",
            tone: dmg != null ? "damage" : tone,
          },
        );
        break;
      }
      case "PLAY_SPELL_HEAL":
      case "ECHO_SPELL_HEAL": {
        const heal = num(payload.heal) ?? 0;
        pushNormal(
          `${who} healed for ${heal} with ${cardLabel(payload)}.`,
          { icon: "heal", flash: "heal", tone: "heal" },
        );
        break;
      }
      case "PLAY_ITEM": {
        pushNormal(`${who} used ${cardLabel(payload)}.`, { icon: "card" });
        break;
      }
      case "PLAY_EQUIPMENT": {
        const target = str(payload.targetName) ?? "a companion";
        pushNormal(
          `${who} equipped ${cardLabel(payload)} onto ${target}.`,
          { icon: "buff" },
        );
        break;
      }
      case "PLAY_TERRAIN": {
        pushNormal(`${who} played terrain ${cardLabel(payload)}.`, {
          icon: "ability",
        });
        break;
      }
      case "PLAY_RELIC": {
        pushNormal(`${who} placed relic ${cardLabel(payload)}.`, {
          icon: "card",
        });
        break;
      }
      case "PLAY_SUPPORT": {
        pushNormal(`${who} played ${cardLabel(payload)}.`, { icon: "card" });
        break;
      }
      case "SET_TRAP": {
        pushNormal(`${who} set a trap.`, { icon: "ability" });
        break;
      }
      case "RIFT_SPARK": {
        const gained = num(payload.tempEnergy) ?? 1;
        pushNormal(
          `${who} sparked the Rift (+${gained} temporary Energy).`,
          { flash: "energy", icon: "energy", tone: "energy" },
        );
        break;
      }
      case "P2_TURN1_BONUS": {
        const gained = num(payload.tempEnergy) ?? 1;
        pushNormal(
          `${who} received +${gained} bonus Rift Energy.`,
          { flash: "energy", icon: "energy", tone: "energy" },
        );
        break;
      }
      case "UNIT_STRIKE": {
        const attacker = str(payload.attackerName) ?? "A companion";
        const target = str(payload.targetName) ?? "a foe";
        const dmg = num(payload.damage) ?? 0;
        pushCombatChild(`${attacker} attacked ${target}.`, {
          icon: "attack",
        });
        pushCombatChild(`${dmg} Damage`, {
          icon: "damage",
          tone: "damage",
          flash: "damage",
        });
        break;
      }
      case "FACE_STRIKE": {
        const attacker = str(payload.attackerName) ?? "A companion";
        const dmg = num(payload.damage) ?? 0;
        pushCombatChild(`${attacker} struck the Keeper.`, {
          icon: "attack",
        });
        pushCombatChild(`${dmg} Damage`, {
          icon: "damage",
          tone: "damage",
          flash: "damage",
        });
        break;
      }
      case "UNIT_DEATH": {
        const name = cardLabel(payload);
        pushCombatChild(`${name} was defeated.`, {
          icon: "death",
          tone: "death",
          flash: "damage",
        });
        break;
      }
      case "WARD_BLOCK": {
        pushNormal(`Ward blocked the strike on ${cardLabel(payload)}.`, {
          icon: "shield",
          tone: "system",
        });
        break;
      }
      case "POISON_TICK": {
        const dmg = num(payload.damage) ?? 0;
        pushNormal(
          `${cardLabel(payload)} took ${dmg} poison damage.`,
          { icon: "debuff", flash: "damage", tone: "damage" },
        );
        break;
      }
      case "AWAKEN": {
        pushNormal(`${cardLabel(payload)} Awakened!`, {
          icon: "buff",
          flash: "energy",
        });
        break;
      }
      case "ECHO_ARMED": {
        pushNormal(`${who} armed Echo.`, { icon: "buff" });
        break;
      }
      case "ECHO_RESOLVED": {
        pushNormal(`Echo resolved ${cardLabel(payload)}.`, {
          icon: "ability",
        });
        break;
      }
      case "PLAY_SPELL_ECHO_SETUP": {
        pushNormal(`${cardLabel(payload)} prepared an Echo.`, {
          icon: "ability",
        });
        break;
      }
      case "MULLIGAN": {
        const n = num(payload.replaced) ?? 0;
        pushNormal(`${who} mulliganed ${n} card${n === 1 ? "" : "s"}.`);
        break;
      }
      case "KEEP_HAND": {
        if (payload.auto === true) break;
        pushNormal(`${who} kept their opening hand.`);
        break;
      }
      case "SURRENDER": {
        pushNormal(`${who} conceded.`);
        break;
      }
      case "MATCH_END": {
        flushCombat();
        const reason = str(payload.reason);
        const winYours = e.actorId === opts.yourSideId;
        const text =
          reason === "CONCEDE"
            ? winYours
              ? "Victory — foe conceded."
              : "Defeat — you conceded."
            : reason === "KEEPER_DOWN"
              ? winYours
                ? "Victory — foe Keeper fell."
                : "Defeat — your Keeper fell."
              : reason === "TURN_CAP"
                ? "Match ended at the turn cap."
                : "Match over.";
        pushNormal(text, {
          icon: "victory",
          tone: "phase",
          flash: "newest",
        });
        break;
      }
      case "BOARD_ATTACK": {
        const dmg = num(payload.damage);
        pushNormal(
          dmg != null ? `Board clash — ${dmg} damage.` : "Board clash.",
          { icon: "attack", flash: "damage" },
        );
        break;
      }
      default: {
        // Unknown but marked visible — soft fallback without raw codes.
        pushNormal(`${who} acted.`, { tone: "system", icon: "system" });
        break;
      }
    }
  }

  flushCombat();

  // Mark newest line for glow
  for (let i = out.length - 1; i >= 0; i -= 1) {
    const row = out[i]!;
    if (row.kind === "line" || row.kind === "combat-block") {
      if (!row.flash) row.flash = "newest";
      break;
    }
  }

  return out;
}

/** Newest-first view for the panel. */
export function buildBattleFeedNewestFirst(
  events: RawMatchEvent[],
  opts: BuildOpts,
): FeedLine[] {
  return buildBattleFeed(events, opts).slice().reverse();
}

export function filterFeedLines(
  lines: FeedLine[],
  filter: TcgFeedFilter,
): FeedLine[] {
  if (filter === "all") return lines;
  return lines.filter((l) => {
    if (l.kind === "divider" || l.kind === "phase") return true;
    if (l.kind === "summary") return filter === "system";
    return l.filters.includes(filter);
  });
}

export function computeMatchFeedSummary(
  events: RawMatchEvent[],
  yourSideId: string,
): MatchFeedSummary {
  let damageDealt = 0;
  let damageTaken = 0;
  let healing = 0;
  let cardsPlayed = 0;
  let companionsLost = 0;
  let abilitiesFired = 0;
  let turns = 1;
  let winnerId: string | null = null;
  let reason: string | null = null;

  for (const e of events) {
    const p = e.payload ?? {};
    const t = num(p.turn);
    if (t != null) turns = Math.max(turns, t);

    if (e.type === "UNIT_STRIKE" || e.type === "FACE_STRIKE") {
      const dmg = num(p.damage) ?? 0;
      if (e.actorId === yourSideId) damageDealt += dmg;
      else damageTaken += dmg;
    }
    if (e.type === "PLAY_SPELL" || e.type === "ECHO_SPELL") {
      const dmg = num(p.damage) ?? 0;
      if (e.actorId === yourSideId) damageDealt += dmg;
      else damageTaken += dmg;
      abilitiesFired += 1;
    }
    if (e.type === "RIFT_COLLAPSE") {
      const dmg = num(p.damage) ?? 0;
      if (e.actorId === yourSideId) damageTaken += dmg;
      else damageDealt += dmg;
    }
    if (e.type === "PLAY_SPELL_HEAL" || e.type === "ECHO_SPELL_HEAL") {
      healing += num(p.heal) ?? 0;
      abilitiesFired += 1;
    }
    if (
      e.type === "PLAY_UNIT" ||
      e.type === "PLAY_SPELL" ||
      e.type === "PLAY_SPELL_HEAL" ||
      e.type === "PLAY_ITEM" ||
      e.type === "PLAY_EQUIPMENT" ||
      e.type === "PLAY_TERRAIN" ||
      e.type === "PLAY_RELIC" ||
      e.type === "PLAY_SUPPORT" ||
      e.type === "SET_TRAP"
    ) {
      cardsPlayed += 1;
    }
    if (e.type === "UNIT_DEATH" && e.actorId === yourSideId) {
      companionsLost += 1;
    }
    if (
      e.type === "AWAKEN" ||
      e.type === "ECHO_ARMED" ||
      e.type === "ECHO_RESOLVED" ||
      e.type === "WARD_BLOCK"
    ) {
      abilitiesFired += 1;
    }
    if (e.type === "MATCH_END") {
      winnerId = e.actorId === "draw" ? null : e.actorId;
      reason = str(p.reason);
    }
  }

  return {
    turns,
    damageDealt,
    damageTaken,
    healing,
    cardsPlayed,
    companionsLost,
    abilitiesFired,
    winnerId,
    reason,
  };
}

export function formatDevEventLine(e: RawMatchEvent): string {
  const seq = num(e.payload?.seq);
  const turn = num(e.payload?.turn);
  const dmg = num(e.payload?.damage);
  const prefix = [
    seq != null ? `#${seq}` : null,
    turn != null ? `T${turn}` : null,
    e.type,
  ]
    .filter(Boolean)
    .join(" ");
  const extra = dmg != null ? ` dmg=${dmg}` : "";
  const def = str(e.payload?.defId) ?? str(e.payload?.cardName);
  return `${prefix}${def ? ` ${def}` : ""}${extra} · ${e.actorId}`;
}
