/**
 * Core decade foundation pack — registers sample content into global registries.
 * Idempotent: safe to call from API routes / pages.
 */

import {
  registerContent,
  registerExpansionPack,
  getExpansionPack,
} from "@/game/expansion/registry";
import { ACHIEVEMENT_CATALOG } from "@/game/achievements/catalog";
import { CIVILIZATION_MILESTONES } from "@/game/civilization/milestones";
import { SAMPLE_STORY_ARCS } from "@/game/story/arcs/sample-branching";
import { FESTIVAL_CATALOG } from "@/game/festivals/calendar";
import { FURNITURE_CATALOG } from "@/game/housing/catalog";
import { BOSS_CATALOG, RAID_CATALOG } from "@/game/endgame/catalog";
import { EMOTE_CATALOG } from "@/game/social/stubs";
import { CINEMATIC_SCRIPTS } from "@/game/cinematics/scripts";
import { REGION_IDENTITIES } from "@/game/world-maps/regions";
import { buildArtJobsForPack } from "@/game/procedural-art/pipeline";

const PACK_ID = "core-decade-foundations";

export function ensureCoreDecadePackRegistered(): void {
  // Idempotent against registry clears (unit tests) and hot reload.
  if (getExpansionPack(PACK_ID)) return;

  registerExpansionPack({
    id: PACK_ID,
    name: "Core Decade Foundations",
    version: "0.1.0",
    description:
      "Living world clock, story engine samples, civilization milestones, achievements, festivals, housing, endgame scaffolds.",
    phase: "foundation",
    dependsOn: [],
    core: true,
    featureFlag: "EXPANSION_FRAMEWORK_ENABLED",
    contentIds: [],
    regionPack: {
      regionSlugs: REGION_IDENTITIES.map((r) => r.slug),
    },
  });

  for (const region of REGION_IDENTITIES) {
    registerContent({
      id: `region:${region.slug}`,
      kind: "region",
      packId: PACK_ID,
      data: region,
    });
  }

  for (const a of ACHIEVEMENT_CATALOG) {
    registerContent({
      id: `achievement:${a.key}`,
      kind: "achievement",
      packId: PACK_ID,
      data: a,
    });
  }

  for (const m of CIVILIZATION_MILESTONES) {
    registerContent({
      id: `milestone:${m.key}`,
      kind: "milestone",
      packId: PACK_ID,
      data: m,
    });
  }

  for (const arc of SAMPLE_STORY_ARCS) {
    registerContent({
      id: `story:${arc.key}`,
      kind: "story_arc",
      packId: PACK_ID,
      data: arc,
      featureFlag: "STORY_ENGINE_ENABLED",
    });
  }

  for (const f of FESTIVAL_CATALOG) {
    registerContent({
      id: `festival:${f.key}`,
      kind: "festival",
      packId: PACK_ID,
      data: f,
      featureFlag: "FESTIVALS_ENABLED",
    });
  }

  for (const furn of FURNITURE_CATALOG) {
    registerContent({
      id: `furniture:${furn.key}`,
      kind: "furniture",
      packId: PACK_ID,
      data: furn,
    });
  }

  for (const boss of BOSS_CATALOG) {
    registerContent({
      id: `boss:${boss.key}`,
      kind: "boss",
      packId: PACK_ID,
      data: boss,
    });
  }

  for (const raid of RAID_CATALOG) {
    registerContent({
      id: `raid:${raid.key}`,
      kind: "raid",
      packId: PACK_ID,
      data: raid,
    });
  }

  for (const emote of EMOTE_CATALOG) {
    registerContent({
      id: `emote:${emote.key}`,
      kind: "emote",
      packId: PACK_ID,
      data: emote,
    });
  }

  for (const cin of CINEMATIC_SCRIPTS) {
    registerContent({
      id: `cinematic:${cin.key}`,
      kind: "cinematic",
      packId: PACK_ID,
      data: cin,
    });
  }

  registerContent({
    id: "expedition_biome:plaza_fringe",
    kind: "expedition_biome",
    packId: PACK_ID,
    data: { biomeKey: "plaza_fringe", regionSlug: "riftwild-commons" },
  });

  registerContent({
    id: "art_pipeline:core",
    kind: "item",
    packId: PACK_ID,
    data: {
      jobs: buildArtJobsForPack({
        packId: PACK_ID,
        regionSlugs: ["riftwild-commons", "ember-crater"],
        festivalKeys: ["bloomtide_festival"],
      }),
    },
  });
}
