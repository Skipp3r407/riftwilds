/**
 * Witness system — crimes only raise notoriety when witnessed.
 * Witnesses flee, warn guards, and seed gossip (not instant world knowledge).
 */

import type { ReputationDelta } from "@/game/npc-ai/reputation";
import { inferOccupationRole, type OccupationRole } from "@/game/npc-ai/activities";

export type CrimeKind =
  | "assault"
  | "murder"
  | "theft"
  | "vandalism"
  | "threat"
  | "smuggling";

export type CrimeEvent = {
  id: string;
  kind: CrimeKind;
  regionId: string;
  x: number;
  y: number;
  at: number;
  /** Player-facing severity 1–5. */
  severity: 1 | 2 | 3 | 4 | 5;
};

export type WitnessActor = {
  npcSlug: string;
  x: number;
  y: number;
  occupation?: string;
  kind?: string;
  present?: boolean;
};

export type WitnessResponse = {
  npcSlug: string;
  role: OccupationRole;
  action: "flee" | "cower" | "warn_guard" | "spread_rumor" | "join_crime" | "ignore";
  seedsGossip: boolean;
};

export type CrimeResolution = {
  witnessed: boolean;
  witnesses: WitnessResponse[];
  /** Only applied when witnessed (or severity allows stealth fail). */
  reputationDelta: ReputationDelta;
  gossipSeed?: {
    regionId: string;
    text: string;
    heat: number;
  };
};

export const WITNESS_RANGE = 140;

const CRIME_DELTAS: Record<CrimeKind, ReputationDelta> = {
  assault: { notoriety: 12, criminal: 10, cruelty: 8, honor: -6, trust: -8, town: -5 },
  murder: {
    notoriety: 28,
    criminal: 25,
    infamy: 22,
    cruelty: 20,
    honor: -18,
    mercy: -15,
    trust: -20,
    town: -15,
    hero: -12,
  },
  theft: { notoriety: 10, criminal: 14, trust: -12, merchant: -8, honor: -6 },
  vandalism: { notoriety: 6, criminal: 5, town: -8, trust: -4 },
  threat: { notoriety: 8, criminal: 6, cruelty: 5, trust: -5 },
  smuggling: { criminal: 12, notoriety: 6, merchant: -4, infamy: 5 },
};

function dist(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx;
  const dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
}

export function witnessActionForRole(role: OccupationRole): WitnessResponse["action"] {
  if (role === "bandit") return "join_crime";
  if (role === "guard") return "warn_guard";
  if (role === "child") return "cower";
  if (role === "merchant" || role === "healer" || role === "priest") return "flee";
  if (role === "arena") return "ignore";
  return "spread_rumor";
}

export function resolveCrimeWitnesses(
  crime: CrimeEvent,
  nearby: WitnessActor[],
): CrimeResolution {
  const witnesses: WitnessResponse[] = [];
  for (const actor of nearby) {
    if (actor.present === false) continue;
    if (dist(actor.x, actor.y, crime.x, crime.y) > WITNESS_RANGE) continue;
    const role = inferOccupationRole(actor.occupation ?? "", actor.kind, actor.npcSlug);
    const action = witnessActionForRole(role);
    witnesses.push({
      npcSlug: actor.npcSlug,
      role,
      action,
      seedsGossip: action === "spread_rumor" || action === "warn_guard" || action === "flee",
    });
  }

  // Unwitnessed crimes: no notoriety bump (stealth). Bandit-only observers don't count as town witnesses.
  const townWitness = witnesses.some(
    (w) => w.action === "flee" || w.action === "cower" || w.action === "warn_guard" || w.action === "spread_rumor",
  );

  if (!townWitness) {
    return {
      witnessed: false,
      witnesses,
      reputationDelta: {},
    };
  }

  const base = CRIME_DELTAS[crime.kind];
  const scale = 0.6 + crime.severity * 0.15;
  const reputationDelta: ReputationDelta = {};
  for (const [k, v] of Object.entries(base) as [keyof ReputationDelta, number][]) {
    reputationDelta[k] = Math.round((v ?? 0) * scale);
  }

  const gossipHeat = Math.min(100, crime.severity * 18 + witnesses.length * 8);
  return {
    witnessed: true,
    witnesses,
    reputationDelta,
    gossipSeed: {
      regionId: crime.regionId,
      text: gossipTextForCrime(crime),
      heat: gossipHeat,
    },
  };
}

function gossipTextForCrime(crime: CrimeEvent): string {
  switch (crime.kind) {
    case "murder":
      return "Someone was killed in cold blood — the watch is asking questions.";
    case "assault":
      return "A fight turned ugly. Folk are whispering about a dangerous traveler.";
    case "theft":
      return "A stall was light after the rush. Keep your purses close.";
    case "vandalism":
      return "Markers got smashed again. Restoration crews are furious.";
    case "threat":
      return "Someone made threats in the open. Children went indoors.";
    case "smuggling":
      return "Under-counter crates moved after dark. Merchants won't name names.";
  }
}

/** Unwitnessed training / wild kills should not call this with town NPCs nearby. */
export function isCrimeWitnessed(resolution: CrimeResolution): boolean {
  return resolution.witnessed;
}
