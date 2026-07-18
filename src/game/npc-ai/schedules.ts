/**
 * Per-NPC daily schedule framework — varied by occupation, not identical clones.
 */

import type { DayPhase } from "@/game/living-world/clock";
import {
  ACTIVITY_TO_BEHAVIOR,
  inferOccupationRole,
  type NpcActivity,
  type OccupationRole,
} from "@/game/npc-ai/activities";
import { getNpcBySlug } from "@/content/npcs";

export type ScheduleBlock = {
  phases: DayPhase[];
  activity: NpcActivity;
  /** Offset from spawn home in world px. */
  anchorOffset?: { x: number; y: number };
  dialogueHint?: string;
  present?: boolean;
};

export type NpcDailySchedule = {
  npcSlug: string;
  role: OccupationRole;
  blocks: ScheduleBlock[];
};

const ROLE_TEMPLATES: Record<OccupationRole, ScheduleBlock[]> = {
  merchant: [
    { phases: ["dawn"], activity: "shop_open", anchorOffset: { x: 0, y: 0 }, dialogueHint: "Setting out wares." },
    { phases: ["day"], activity: "shop_open", dialogueHint: "Shop is open." },
    { phases: ["dusk"], activity: "eat", anchorOffset: { x: 24, y: 16 }, dialogueHint: "Closing ledger over a bowl." },
    { phases: ["night"], activity: "shop_closed", present: true, dialogueHint: "Shop closed — ask tomorrow." },
  ],
  guard: [
    { phases: ["dawn"], activity: "patrol", anchorOffset: { x: 40, y: 0 }, dialogueHint: "Dawn briefing." },
    { phases: ["day"], activity: "patrol", anchorOffset: { x: -20, y: 28 }, dialogueHint: "Plaza watch." },
    { phases: ["dusk"], activity: "patrol", anchorOffset: { x: 32, y: -16 }, dialogueHint: "Lantern patrol." },
    { phases: ["night"], activity: "patrol", anchorOffset: { x: -36, y: 12 }, dialogueHint: "Night watch." },
  ],
  child: [
    { phases: ["dawn"], activity: "play", anchorOffset: { x: 16, y: 8 }, dialogueHint: "Chasing plaza dust." },
    { phases: ["day"], activity: "play", anchorOffset: { x: -20, y: 20 }, dialogueHint: "Games near the fountain." },
    { phases: ["dusk"], activity: "social", dialogueHint: "Tired giggles." },
    { phases: ["night"], activity: "sleep", present: false, dialogueHint: "Home for the night." },
  ],
  smith: [
    { phases: ["dawn"], activity: "work", dialogueHint: "Lighting the forge." },
    { phases: ["day"], activity: "work", dialogueHint: "Hammer and quench." },
    { phases: ["dusk"], activity: "eat", anchorOffset: { x: 12, y: 20 }, dialogueHint: "Cooling the tongs." },
    { phases: ["night"], activity: "sleep", present: false, dialogueHint: "Forge banked." },
  ],
  healer: [
    { phases: ["dawn"], activity: "work", dialogueHint: "Sorting remedies." },
    { phases: ["day"], activity: "work" },
    { phases: ["dusk"], activity: "social", dialogueHint: "Quiet check-ins." },
    { phases: ["night"], activity: "idle", dialogueHint: "On call if needed." },
  ],
  priest: [
    { phases: ["dawn"], activity: "pray" },
    { phases: ["day"], activity: "social", dialogueHint: "Blessings for travelers." },
    { phases: ["dusk"], activity: "pray" },
    { phases: ["night"], activity: "sleep", present: false },
  ],
  guide: [
    { phases: ["dawn"], activity: "social", dialogueHint: "Greeting early arrivals." },
    { phases: ["day"], activity: "social" },
    { phases: ["dusk"], activity: "social" },
    { phases: ["night"], activity: "idle", dialogueHint: "Still around for lost Keepers." },
  ],
  scholar: [
    { phases: ["dawn"], activity: "work", dialogueHint: "Ink before crowds." },
    { phases: ["day"], activity: "work" },
    { phases: ["dusk"], activity: "social", dialogueHint: "Trading rumors for footnotes." },
    { phases: ["night"], activity: "work", dialogueHint: "Lantern cataloging." },
  ],
  cook: [
    { phases: ["dawn"], activity: "work", dialogueHint: "Fires starting." },
    { phases: ["day"], activity: "work" },
    { phases: ["dusk"], activity: "shop_open", dialogueHint: "Evening bowls." },
    { phases: ["night"], activity: "sleep", present: false },
  ],
  farmer: [
    { phases: ["dawn"], activity: "work", dialogueHint: "Feeding plots." },
    { phases: ["day"], activity: "work" },
    { phases: ["dusk"], activity: "eat" },
    { phases: ["night"], activity: "sleep", present: false },
  ],
  musician: [
    { phases: ["dawn"], activity: "idle" },
    { phases: ["day"], activity: "social", dialogueHint: "Plaza tunes." },
    { phases: ["dusk"], activity: "social", dialogueHint: "Golden-hour set." },
    { phases: ["night"], activity: "sleep", present: false },
  ],
  courier: [
    { phases: ["dawn"], activity: "roam", anchorOffset: { x: 48, y: -12 } },
    { phases: ["day"], activity: "roam", anchorOffset: { x: -40, y: 24 } },
    { phases: ["dusk"], activity: "roam", anchorOffset: { x: 20, y: 36 } },
    { phases: ["night"], activity: "sleep", present: false },
  ],
  arena: [
    { phases: ["dawn"], activity: "train" },
    { phases: ["day"], activity: "train" },
    { phases: ["dusk"], activity: "social" },
    { phases: ["night"], activity: "idle" },
  ],
  hatchery: [
    { phases: ["dawn"], activity: "work", dialogueHint: "Warming nests." },
    { phases: ["day"], activity: "work" },
    { phases: ["dusk"], activity: "work" },
    { phases: ["night"], activity: "idle", dialogueHint: "Night watch on incubators." },
  ],
  bandit: [
    { phases: ["dawn"], activity: "sleep", present: false },
    { phases: ["day"], activity: "roam" },
    { phases: ["dusk"], activity: "social" },
    { phases: ["night"], activity: "roam" },
  ],
  animal: [
    { phases: ["dawn"], activity: "roam", anchorOffset: { x: 18, y: 10 } },
    { phases: ["day"], activity: "roam", anchorOffset: { x: -14, y: 18 } },
    { phases: ["dusk"], activity: "roam", anchorOffset: { x: 22, y: -8 } },
    { phases: ["night"], activity: "sleep", present: true, dialogueHint: "Curled nearby." },
  ],
  citizen: [
    { phases: ["dawn"], activity: "roam" },
    { phases: ["day"], activity: "work" },
    { phases: ["dusk"], activity: "social" },
    { phases: ["night"], activity: "sleep", present: false },
  ],
};

/** Per-slug overrides so Commons cast is not identical. */
const SLUG_OVERRIDES: Partial<Record<string, ScheduleBlock[]>> = {
  "rowan-vale": ROLE_TEMPLATES.guide,
  "elara-venn": [
    { phases: ["dawn"], activity: "pray", dialogueHint: "Quiet at the monument." },
    { phases: ["day"], activity: "social", dialogueHint: "Story for newcomers." },
    { phases: ["dusk"], activity: "work", dialogueHint: "Recording the day." },
    { phases: ["night"], activity: "idle", dialogueHint: "Still watching the Riftstone." },
  ],
  "captain-orren": [
    { phases: ["dawn"], activity: "patrol", anchorOffset: { x: 28, y: -20 }, dialogueHint: "Muster." },
    { phases: ["day"], activity: "train", dialogueHint: "Drills." },
    { phases: ["dusk"], activity: "patrol", dialogueHint: "Shift change." },
    { phases: ["night"], activity: "patrol", anchorOffset: { x: -24, y: 16 }, dialogueHint: "Night command." },
  ],
  "plaza-child-mim": ROLE_TEMPLATES.child,
  "tessa-windmere": ROLE_TEMPLATES.merchant,
  "plaza-vendor-cal": ROLE_TEMPLATES.merchant,
  "bram-ironroot": ROLE_TEMPLATES.smith,
  "mira-shellbright": ROLE_TEMPLATES.hatchery,
  "rook-emberfall": ROLE_TEMPLATES.arena,
  "archivist-solen": ROLE_TEMPLATES.scholar,
  "nyla-brook": ROLE_TEMPLATES.healer,
  "pip-gearwhistle": [
    { phases: ["dawn"], activity: "work", dialogueHint: "Tweaking markers." },
    { phases: ["day"], activity: "roam", anchorOffset: { x: 30, y: 20 }, dialogueHint: "Field testing." },
    { phases: ["dusk"], activity: "work" },
    { phases: ["night"], activity: "idle", dialogueHint: "Gears spinning late." },
  ],
  "plaza-musician-reo": ROLE_TEMPLATES.musician,
  "farm-hand-jot": ROLE_TEMPLATES.farmer,
  "cook-pot-uma": ROLE_TEMPLATES.cook,
  "dock-sweeper-ana": [
    { phases: ["dawn"], activity: "work" },
    { phases: ["day"], activity: "work" },
    { phases: ["dusk"], activity: "social" },
    { phases: ["night"], activity: "sleep", present: false },
  ],
  "gardener-sip": ROLE_TEMPLATES.farmer,
  "scribe-runner-kel": ROLE_TEMPLATES.courier,
  "guard-east-ryn": ROLE_TEMPLATES.guard,
  "guard-west-dao": ROLE_TEMPLATES.guard,
  "guard-portal-hex": ROLE_TEMPLATES.guard,
  "riftling-plaza-emberkit": ROLE_TEMPLATES.animal,
  "riftling-hatchery-glowpup": ROLE_TEMPLATES.animal,
  "riftling-market-pouchling": ROLE_TEMPLATES.animal,
};

export function scheduleForNpc(npcSlug: string): NpcDailySchedule {
  const npc = getNpcBySlug(npcSlug);
  const role = inferOccupationRole(
    npc?.occupation ?? "",
    npc?.kind,
    npcSlug,
  );
  const blocks = SLUG_OVERRIDES[npcSlug] ?? ROLE_TEMPLATES[role];
  return { npcSlug, role, blocks };
}

export function activeScheduleBlock(
  schedule: NpcDailySchedule,
  dayPhase: DayPhase,
): ScheduleBlock {
  return (
    schedule.blocks.find((b) => b.phases.includes(dayPhase)) ?? {
      phases: [dayPhase],
      activity: "idle" as NpcActivity,
      present: true,
    }
  );
}

export type ResolvedNpcSchedule = {
  npcSlug: string;
  role: OccupationRole;
  activity: NpcActivity;
  behavior: string;
  present: boolean;
  dialogueHint?: string;
  anchorOffset: { x: number; y: number };
};

export function resolveNpcSchedule(
  npcSlug: string,
  dayPhase: DayPhase,
): ResolvedNpcSchedule {
  const schedule = scheduleForNpc(npcSlug);
  const block = activeScheduleBlock(schedule, dayPhase);
  // Default present; only hide when block.present === false (sleep / off-duty).
  const isPresent = block.present !== false;

  return {
    npcSlug,
    role: schedule.role,
    activity: block.activity,
    behavior: ACTIVITY_TO_BEHAVIOR[block.activity] ?? "idle",
    present: isPresent,
    dialogueHint: block.dialogueHint,
    anchorOffset: block.anchorOffset ?? { x: 0, y: 0 },
  };
}

/** Deterministic stagger so plaza NPCs don't all turn the same frame. */
export function scheduleTickSlot(npcSlug: string, bucketCount = 8): number {
  let h = 0;
  for (let i = 0; i < npcSlug.length; i++) h = (h * 31 + npcSlug.charCodeAt(i)) >>> 0;
  return h % bucketCount;
}
