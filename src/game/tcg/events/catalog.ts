/**
 * Which engine event types are player-visible vs developer-only,
 * and how they map to feed filters / icons.
 */

import type {
  TcgEventCategory,
  TcgFeedIcon,
  TcgFeedTone,
} from "@/game/tcg/events/types";

export type EventMeta = {
  /** Shown in the player Event Feed when true. */
  playerVisible: boolean;
  categories: TcgEventCategory[];
  icon: TcgFeedIcon;
  defaultTone: TcgFeedTone;
};

/** Internal / scaffolding codes that must never appear as raw labels to players. */
export const DEV_ONLY_EVENT_TYPES = new Set([
  "SECOND_MAIN_SKIPPED",
  "SECOND_MAIN",
  "ACTION_QUEUE",
  "ATTACK_SKIPPED",
  "SKIP_TURN1_DRAW",
  "FATIGUE", // alias of RIFT_COLLAPSE — show collapse only
  "MULLIGAN_PHASE",
  "EQUIP_NO_TARGET", // thrown as error; if logged, hide
]);

const META: Record<string, EventMeta> = {
  MATCH_START: {
    playerVisible: true,
    categories: ["system"],
    icon: "phase",
    defaultTone: "phase",
  },
  TURN_START: {
    playerVisible: true,
    categories: ["system"],
    icon: "phase",
    defaultTone: "phase",
  },
  ENERGY_REFILL: {
    playerVisible: true,
    categories: ["energy", "system"],
    icon: "energy",
    defaultTone: "energy",
  },
  DRAW: {
    playerVisible: true,
    categories: ["cards", "draw"],
    icon: "draw",
    defaultTone: "neutral",
  },
  HAND_FULL_BURN: {
    playerVisible: true,
    categories: ["cards", "system"],
    icon: "system",
    defaultTone: "system",
  },
  RIFT_COLLAPSE: {
    playerVisible: true,
    categories: ["system", "combat"],
    icon: "damage",
    defaultTone: "damage",
  },
  PLAY_UNIT: {
    playerVisible: true,
    categories: ["cards"],
    icon: "summon",
    defaultTone: "neutral",
  },
  PLAY_SPELL: {
    playerVisible: true,
    categories: ["cards", "abilities"],
    icon: "ability",
    defaultTone: "neutral",
  },
  PLAY_SPELL_HEAL: {
    playerVisible: true,
    categories: ["cards", "abilities"],
    icon: "heal",
    defaultTone: "heal",
  },
  PLAY_SPELL_ECHO_SETUP: {
    playerVisible: true,
    categories: ["abilities"],
    icon: "ability",
    defaultTone: "neutral",
  },
  ECHO_ARMED: {
    playerVisible: true,
    categories: ["abilities"],
    icon: "buff",
    defaultTone: "energy",
  },
  ECHO_RESOLVED: {
    playerVisible: true,
    categories: ["abilities"],
    icon: "ability",
    defaultTone: "neutral",
  },
  ECHO_SPELL: {
    playerVisible: true,
    categories: ["abilities", "cards"],
    icon: "ability",
    defaultTone: "neutral",
  },
  ECHO_SPELL_HEAL: {
    playerVisible: true,
    categories: ["abilities", "cards"],
    icon: "heal",
    defaultTone: "heal",
  },
  PLAY_EQUIPMENT: {
    playerVisible: true,
    categories: ["cards", "abilities"],
    icon: "buff",
    defaultTone: "neutral",
  },
  PLAY_TERRAIN: {
    playerVisible: true,
    categories: ["cards", "abilities"],
    icon: "ability",
    defaultTone: "neutral",
  },
  PLAY_ITEM: {
    playerVisible: true,
    categories: ["cards"],
    icon: "card",
    defaultTone: "neutral",
  },
  PLAY_RELIC: {
    playerVisible: true,
    categories: ["cards"],
    icon: "card",
    defaultTone: "neutral",
  },
  PLAY_SUPPORT: {
    playerVisible: true,
    categories: ["cards"],
    icon: "card",
    defaultTone: "neutral",
  },
  SET_TRAP: {
    playerVisible: true,
    categories: ["cards", "abilities"],
    icon: "ability",
    defaultTone: "neutral",
  },
  RIFT_SPARK: {
    playerVisible: true,
    categories: ["energy", "cards"],
    icon: "energy",
    defaultTone: "energy",
  },
  P2_TURN1_BONUS: {
    playerVisible: true,
    categories: ["energy", "system"],
    icon: "energy",
    defaultTone: "energy",
  },
  UNIT_STRIKE: {
    playerVisible: true,
    categories: ["combat"],
    icon: "attack",
    defaultTone: "damage",
  },
  FACE_STRIKE: {
    playerVisible: true,
    categories: ["combat"],
    icon: "attack",
    defaultTone: "damage",
  },
  UNIT_DEATH: {
    playerVisible: true,
    categories: ["combat", "status"],
    icon: "death",
    defaultTone: "death",
  },
  WARD_BLOCK: {
    playerVisible: true,
    categories: ["combat", "status", "abilities"],
    icon: "shield",
    defaultTone: "system",
  },
  POISON_TICK: {
    playerVisible: true,
    categories: ["status", "combat"],
    icon: "debuff",
    defaultTone: "damage",
  },
  AWAKEN: {
    playerVisible: true,
    categories: ["abilities", "status"],
    icon: "buff",
    defaultTone: "energy",
  },
  MULLIGAN: {
    playerVisible: true,
    categories: ["cards", "system"],
    icon: "draw",
    defaultTone: "system",
  },
  KEEP_HAND: {
    playerVisible: true,
    categories: ["system"],
    icon: "system",
    defaultTone: "system",
  },
  SURRENDER: {
    playerVisible: true,
    categories: ["system"],
    icon: "system",
    defaultTone: "system",
  },
  MATCH_END: {
    playerVisible: true,
    categories: ["system"],
    icon: "victory",
    defaultTone: "phase",
  },
  BOARD_ATTACK: {
    playerVisible: true,
    categories: ["combat"],
    icon: "attack",
    defaultTone: "damage",
  },
  COMBAT_PHASE: {
    playerVisible: true,
    categories: ["system", "combat"],
    icon: "phase",
    defaultTone: "phase",
  },
  END_PHASE: {
    playerVisible: true,
    categories: ["system"],
    icon: "phase",
    defaultTone: "phase",
  },
};

export function getEventMeta(type: string): EventMeta {
  if (DEV_ONLY_EVENT_TYPES.has(type)) {
    return {
      playerVisible: false,
      categories: ["system"],
      icon: "system",
      defaultTone: "system",
    };
  }
  return (
    META[type] ?? {
      playerVisible: false,
      categories: ["system"],
      icon: "system",
      defaultTone: "system",
    }
  );
}

export function isPlayerVisibleEvent(
  type: string,
  payload?: { hiddenFromPlayer?: boolean },
): boolean {
  if (payload?.hiddenFromPlayer) return false;
  return getEventMeta(type).playerVisible;
}
