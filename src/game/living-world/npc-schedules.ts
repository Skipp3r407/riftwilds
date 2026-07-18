/**
 * NPC schedule stubs — day-phase aware presence for region hubs.
 * Bridges into the richer living schedule framework in `@/game/npc-ai/schedules`.
 */

import type { DayPhase } from "@/game/living-world/clock";
import {
  resolveNpcSchedule,
  scheduleForNpc,
} from "@/game/npc-ai/schedules";
import { activityLabel } from "@/game/npc-ai/activities";
import { COMMONS_OVERWORLD_NPC_SLUGS } from "@/game/live-world/npcs/overworld-npcs";

export type NpcScheduleSlot = {
  npcKey: string;
  displayName: string;
  regionSlug: string;
  presentDuring: DayPhase[];
  activity: string;
  dialogueHint: string;
};

/** Legacy hub slots kept for region-state HUD + sims. */
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

/** Living Commons cast projected into schedule slots for the current phase. */
export function commonsLivingScheduleSlots(dayPhase: DayPhase): NpcScheduleSlot[] {
  return COMMONS_OVERWORLD_NPC_SLUGS.map((slug) => {
    const resolved = resolveNpcSchedule(slug, dayPhase);
    const full = scheduleForNpc(slug);
    const presentDuring = Array.from(
      new Set(full.blocks.filter((b) => b.present !== false).flatMap((b) => b.phases)),
    ) as DayPhase[];
    return {
      npcKey: slug,
      displayName: slug
        .split("-")
        .map((w) => w[0]?.toUpperCase() + w.slice(1))
        .join(" "),
      regionSlug: "riftwild-commons",
      presentDuring: presentDuring.length ? presentDuring : (["dawn", "day", "dusk", "night"] as DayPhase[]),
      activity: activityLabel(resolved.activity),
      dialogueHint: resolved.dialogueHint ?? activityLabel(resolved.activity),
    };
  }).filter((s) => s.presentDuring.includes(dayPhase));
}

export function npcsPresentAt(
  regionSlug: string,
  dayPhase: DayPhase,
): NpcScheduleSlot[] {
  if (regionSlug === "riftwild-commons") {
    const living = commonsLivingScheduleSlots(dayPhase);
    const legacy = NPC_SCHEDULES.filter(
      (n) => n.regionSlug === regionSlug && n.presentDuring.includes(dayPhase),
    );
    // Prefer living cast; keep unique legacy hub keys
    const keys = new Set(living.map((l) => l.npcKey));
    return [...living, ...legacy.filter((l) => !keys.has(l.npcKey))];
  }
  return NPC_SCHEDULES.filter(
    (n) => n.regionSlug === regionSlug && n.presentDuring.includes(dayPhase),
  );
}
