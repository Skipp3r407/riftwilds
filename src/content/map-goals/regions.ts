import { COMMONS_MAP_GOALS } from "@/content/map-goals/commons";
import type { MapGoalDef, RegionMapGoals } from "@/content/map-goals/types";
import { REGION_IDENTITIES } from "@/game/world-maps/regions";

type RegionSeed = {
  regionId: string;
  themes: { title: string; summary: string; kind: MapGoalDef["kind"]; sink: string; keys: string[] }[];
};

const REGION_SEEDS: RegionSeed[] = [
  {
    regionId: "ember-crater",
    themes: [
      {
        title: "Scout the Ash Rim",
        summary: "Explore Ember landmarks and earn travel-capped Credits.",
        kind: "explore",
        sink: "TRAVEL_FEE",
        keys: ["quest-ember-rim", "gather-ember-dust"],
      },
      {
        title: "Forge Ember Ingots",
        summary: "Craft with crater ore; pay craft fees that leave circulation.",
        kind: "craft",
        sink: "CRAFT_FEE",
        keys: ["craft-ember-ingot", "job-ember-bellows"],
      },
      {
        title: "Reignite the Forge",
        summary: "Donate Credits to Ember forge restoration.",
        kind: "restoration",
        sink: "RESTORATION_DONATION",
        keys: ["restore-ember-forge"],
      },
    ],
  },
  {
    regionId: "moonwater-coast",
    themes: [
      {
        title: "Tide Pool Survey",
        summary: "Gather tideglass on cooldown; sink into repair kits.",
        kind: "gather",
        sink: "REPAIR",
        keys: ["gather-tideglass", "quest-moon-tide"],
      },
      {
        title: "Pier Courier Run",
        summary: "Job-board coastal deliveries with travel fees.",
        kind: "job",
        sink: "TRAVEL_FEE",
        keys: ["job-coast-courier"],
      },
      {
        title: "Rebuild the Tide Piers",
        summary: "Restoration donations burn Credits from circulation.",
        kind: "restoration",
        sink: "RESTORATION_DONATION",
        keys: ["restore-tide-piers"],
      },
    ],
  },
  {
    regionId: "elderwood-forest",
    themes: [
      {
        title: "Herb Path Forage",
        summary: "Gather herbs; craft salves with station fees.",
        kind: "gather",
        sink: "CRAFT_FEE",
        keys: ["gather-elder-herb", "craft-grove-salve"],
      },
      {
        title: "Shrine Whisper Quest",
        summary: "Story chain through Elderwood shrines.",
        kind: "story",
        sink: "NPC_SHOP_BUY",
        keys: ["quest-elder-shrine"],
      },
      {
        title: "Restore the Grove Shrine",
        summary: "Collective Credits burn for shrine restoration.",
        kind: "restoration",
        sink: "RESTORATION_DONATION",
        keys: ["restore-grove-shrine"],
      },
    ],
  },
  {
    regionId: "stormspire-peaks",
    themes: [
      {
        title: "Crystal Ridge Climb",
        summary: "Explore storm crystals; spend travel and repair.",
        kind: "explore",
        sink: "TRAVEL_FEE",
        keys: ["quest-storm-climb", "gather-storm-crystal"],
      },
      {
        title: "Beacon Keeper Job",
        summary: "Maintain peak beacons via job board.",
        kind: "job",
        sink: "SERVICE_FEE",
        keys: ["job-storm-beacon"],
      },
      {
        title: "Storm Beacon Restoration",
        summary: "Donate Credits to light the peaks.",
        kind: "restoration",
        sink: "RESTORATION_DONATION",
        keys: ["restore-storm-beacons"],
      },
    ],
  },
  {
    regionId: "stoneheart-canyon",
    themes: [
      {
        title: "Fossil Dig",
        summary: "Mine fossils; pay craft and listing fees.",
        kind: "gather",
        sink: "MARKETPLACE_LISTING_FEE",
        keys: ["gather-fossil", "quest-stone-ledger"],
      },
      {
        title: "Bridge Repair Duty",
        summary: "Repair canyon markers with Credit sinks.",
        kind: "job",
        sink: "REPAIR",
        keys: ["job-stone-bridge"],
      },
      {
        title: "Stone Bridge Restoration",
        summary: "Burn Credits into canyon bridges.",
        kind: "restoration",
        sink: "RESTORATION_DONATION",
        keys: ["restore-stone-bridges"],
      },
    ],
  },
  {
    regionId: "frostveil-basin",
    themes: [
      {
        title: "Aurora Watch",
        summary: "Event survey under aurora; travel fees apply.",
        kind: "explore",
        sink: "TRAVEL_FEE",
        keys: ["event-frost-aurora", "quest-frost-watch"],
      },
      {
        title: "Ice Cave Survey Job",
        summary: "Job board survey with service fees.",
        kind: "job",
        sink: "SERVICE_FEE",
        keys: ["job-frost-survey"],
      },
      {
        title: "Observatory Restoration",
        summary: "Credits leave circulation for Frost observatory.",
        kind: "restoration",
        sink: "RESTORATION_DONATION",
        keys: ["restore-frost-observatory"],
      },
    ],
  },
  {
    regionId: "radiant-citadel",
    themes: [
      {
        title: "Temple Light Quests",
        summary: "Healing story chain; care shop sinks.",
        kind: "story",
        sink: "NPC_SHOP_BUY",
        keys: ["quest-radiant-temple"],
      },
      {
        title: "Archive Cataloguing",
        summary: "Job board archival work.",
        kind: "job",
        sink: "SERVICE_FEE",
        keys: ["job-radiant-archive"],
      },
      {
        title: "Radiant Archive Restoration",
        summary: "Donate Credits to citadel archives.",
        kind: "restoration",
        sink: "RESTORATION_DONATION",
        keys: ["restore-radiant-archives"],
      },
    ],
  },
  {
    regionId: "void-hollow",
    themes: [
      {
        title: "Portal Puzzle Chain",
        summary: "High-level exploration with repair sinks.",
        kind: "explore",
        sink: "REPAIR",
        keys: ["quest-void-portal"],
      },
      {
        title: "Echo Material Gather",
        summary: "Gather void materials on strict cooldowns.",
        kind: "gather",
        sink: "CRAFT_FEE",
        keys: ["gather-void-echo"],
      },
      {
        title: "Void Seal Restoration",
        summary: "Burn Credits sealing hollow rifts.",
        kind: "restoration",
        sink: "RESTORATION_DONATION",
        keys: ["restore-void-seals"],
      },
    ],
  },
  {
    regionId: "alloy-ruins",
    themes: [
      {
        title: "Cogwork Salvage",
        summary: "Gather alloy scraps; craft tech parts.",
        kind: "gather",
        sink: "CRAFT_FEE",
        keys: ["gather-alloy-scrap", "craft-cog-core"],
      },
      {
        title: "Foundry Shift Job",
        summary: "Job board foundry shifts.",
        kind: "job",
        sink: "SERVICE_FEE",
        keys: ["job-alloy-foundry"],
      },
      {
        title: "Foundry Restoration",
        summary: "Credits burn into Alloy foundry revival.",
        kind: "restoration",
        sink: "RESTORATION_DONATION",
        keys: ["restore-alloy-foundry"],
      },
    ],
  },
  {
    regionId: "spirit-marsh",
    themes: [
      {
        title: "Lantern Path Walk",
        summary: "Spirit story path; shop for lantern oil.",
        kind: "story",
        sink: "NPC_SHOP_BUY",
        keys: ["quest-spirit-lantern"],
      },
      {
        title: "Memory Shrine Job",
        summary: "Tend shrines via job board.",
        kind: "job",
        sink: "SERVICE_FEE",
        keys: ["job-spirit-shrine"],
      },
      {
        title: "Spirit Ways Restoration",
        summary: "Donate Credits to marsh spirit ways.",
        kind: "restoration",
        sink: "RESTORATION_DONATION",
        keys: ["restore-spirit-ways"],
      },
    ],
  },
  {
    regionId: "celestial-rift",
    themes: [
      {
        title: "Rift Gate Survey",
        summary: "Endgame exploration; heavy travel and repair.",
        kind: "explore",
        sink: "TRAVEL_FEE",
        keys: ["quest-celestial-gate"],
      },
      {
        title: "Starfall Event",
        summary: "Public event with capped Credits.",
        kind: "combat",
        sink: "REPAIR",
        keys: ["event-celestial-starfall"],
      },
      {
        title: "Celestial Gate Restoration",
        summary: "Major Credit burn for endgame gate.",
        kind: "restoration",
        sink: "RESTORATION_DONATION",
        keys: ["restore-celestial-gate"],
      },
    ],
  },
];

function goalsFromSeed(seed: RegionSeed): MapGoalDef[] {
  return seed.themes.map((t, i) => ({
    id: `${seed.regionId}-goal-${i + 1}`,
    regionId: seed.regionId,
    title: t.title,
    summary: t.summary,
    kind: t.kind,
    creditHintMin: t.kind === "restoration" ? 0 : 15,
    creditHintMax: t.kind === "restoration" ? 0 : 80,
    suggestedSink: t.sink,
    linkedKeys: t.keys,
    priority: i + 1,
    starterRecommended: false,
    iconAsset: `/assets/ui/map-goals/${t.kind === "explore" ? "explore" : t.kind === "craft" ? "craft" : t.kind === "gather" ? "gather" : t.kind === "job" ? "job" : t.kind === "story" ? "story" : t.kind === "combat" ? "combat" : "restoration"}.svg`,
  }));
}

const GENERATED: MapGoalDef[] = REGION_SEEDS.flatMap(goalsFromSeed);

export const ALL_MAP_GOALS: MapGoalDef[] = [...COMMONS_MAP_GOALS, ...GENERATED];

export function mapGoalsForRegion(regionId: string): MapGoalDef[] {
  return ALL_MAP_GOALS.filter((g) => g.regionId === regionId).sort(
    (a, b) => a.priority - b.priority,
  );
}

/** Three starter recommendations for new keepers (Commons). */
export function starterMapGoalRecommendations(): MapGoalDef[] {
  return COMMONS_MAP_GOALS.filter((g) => g.starterRecommended).sort(
    (a, b) => a.priority - b.priority,
  );
}

export function allRegionMapGoals(): RegionMapGoals[] {
  return REGION_IDENTITIES.map((r) => ({
    regionId: r.id,
    regionName: r.name,
    goals: mapGoalsForRegion(r.id),
  }));
}
