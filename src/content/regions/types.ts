/**
 * Regional content packs — structured data, not React hard-coding.
 */

export type RegionActivityDef = {
  id: string;
  name: string;
  kind: "gather" | "craft" | "explore" | "combat" | "care" | "social";
  creditReward: number;
  cooldownMs: number;
  dailyCapCredits: number;
  sinkHint: string;
  description: string;
};

export type RegionQuestLink = {
  questKey: string;
  name: string;
  creditReward: number;
};

export type RegionSinkDef = {
  id: string;
  reason: string;
  name: string;
  minCost: number;
  maxCost: number;
  leavesCirculation: boolean;
};

/** Biome / visual identity — keeps maps from reading as Commons clones. */
export type RegionThemeIdentity = {
  lighting: string;
  weatherDefault: string;
  vegetation: string;
  architecture: string;
};

export type RegionPoiDef = {
  id: string;
  name: string;
  kind: "landmark" | "settlement" | "danger" | "dungeon" | "gateway" | "hidden";
  blurb: string;
};

export type RegionPortalIdentity = {
  id: string;
  name: string;
  arrivalNote: string;
};

export type RegionContentPack = {
  regionId: string;
  regionName: string;
  blurb: string;
  questChainKeys: string[];
  quests: RegionQuestLink[];
  activities: RegionActivityDef[];
  sinks: RegionSinkDef[];
  jobBoardIds: string[];
  eventKeys: string[];
  restorationKey: string;
  completeness: "full" | "scaffold";
  /** Theme identity — required for distinct playable maps. */
  theme: RegionThemeIdentity;
  /** Named landmarks / POIs players can recognize. */
  pois: RegionPoiDef[];
  /** Ambient / quest NPC spawn ids (blueprint + catalog). */
  npcSpawnIds: string[];
  /** Gather node ids appropriate to the biome. */
  resourceNodeIds: string[];
  /** Enemy / fauna ids for danger zones. */
  enemyIds: string[];
  /** Zone ids that should feel hazardous. */
  dangerZoneIds: string[];
  /** Portal / gateway presentation for this region. */
  portal: RegionPortalIdentity;
  /** Music catalog key (see regional sound design). */
  musicKey: string;
  /** Optional ambient recipe key. */
  ambianceKey?: string;
  /** Honest backlog note when density is starter-tier, not AAA. */
  densityNote?: string;
};

/** Minimum markers that prove a pack is not an empty Commons clone. */
export function packHasDistinctContent(pack: RegionContentPack): boolean {
  return (
    pack.pois.length >= 2 &&
    pack.npcSpawnIds.length >= 3 &&
    pack.resourceNodeIds.length >= 2 &&
    pack.enemyIds.length >= 1 &&
    pack.dangerZoneIds.length >= 1 &&
    pack.quests.length >= 2 &&
    pack.activities.length >= 2 &&
    Boolean(pack.portal.name.trim()) &&
    Boolean(pack.musicKey.trim()) &&
    Boolean(pack.theme.lighting.trim()) &&
    Boolean(pack.theme.vegetation.trim())
  );
}
