/**
 * NPC schedule stubs — day-phase aware presence for region hubs.
 */

import type { DayPhase } from "@/game/living-world/clock";

export type NpcScheduleSlot = {
  npcKey: string;
  displayName: string;
  regionSlug: string;
  presentDuring: DayPhase[];
  activity: string;
  dialogueHint: string;
};

export const NPC_SCHEDULES: NpcScheduleSlot[] = [
  {
    npcKey: "keeper-mira",
    displayName: "Keeper Mira",
    regionSlug: "riftwild-commons",
    presentDuring: ["dawn", "day"],
    activity: "tending hatchery plaza",
    dialogueHint: "Ask about starter eggs and care routines.",
  },
  {
    npcKey: "warden-thol",
    displayName: "Warden Thol",
    regionSlug: "riftwild-commons",
    presentDuring: ["dusk", "night"],
    activity: "night patrol briefings",
    dialogueHint: "Reports on wildlife migrations and disasters.",
  },
  {
    npcKey: "ash-scribe",
    displayName: "Ash Scribe Nera",
    regionSlug: "ember-crater",
    presentDuring: ["day", "dusk"],
    activity: "logging crater pulses",
    dialogueHint: "Hints toward ember expeditions.",
  },
  {
    npcKey: "tide-fisher",
    displayName: "Tide Fisher Bren",
    regionSlug: "moonwater-coast",
    presentDuring: ["dawn", "dusk"],
    activity: "netting luminous catch",
    dialogueHint: "Shares coastal resource tips.",
  },
  {
    npcKey: "grove-elder",
    displayName: "Grove Elder Sylla",
    regionSlug: "elderwood-forest",
    presentDuring: ["day"],
    activity: "blessing saplings",
    dialogueHint: "Civilization restoration lore fragments.",
  },
  {
    npcKey: "archivists-echo",
    displayName: "Archivist Echo",
    regionSlug: "riftwild-commons",
    presentDuring: ["dawn", "day", "dusk", "night"],
    activity: "cataloging keeper discoveries",
    dialogueHint: "Always available — AI Archivist companion hook.",
  },
];

export function npcsPresentAt(
  regionSlug: string,
  dayPhase: DayPhase,
): NpcScheduleSlot[] {
  return NPC_SCHEDULES.filter(
    (n) => n.regionSlug === regionSlug && n.presentDuring.includes(dayPhase),
  );
}
