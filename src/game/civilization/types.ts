/**
 * Civilization Restoration — collective milestones permanently alter world state.
 */

export type MilestoneCategory =
  | "commons"
  | "ember"
  | "tide"
  | "grove"
  | "storm"
  | "stone"
  | "frost"
  | "radiant"
  | "void"
  | "alloy"
  | "spirit"
  | "celestial"
  | "global";

export type WorldEffectOp =
  | { kind: "unlock_region_feature"; regionSlug: string; feature: string }
  | { kind: "weather_bias"; regionSlug: string; weatherKey: string; weightBonus: number }
  | { kind: "npc_schedule_add"; npcKey: string }
  | { kind: "resource_multiplier"; resourceKey: string; multiplier: number }
  | { kind: "story_flag"; flag: string }
  | { kind: "festival_unlock"; festivalKey: string }
  | { kind: "homestead_room"; roomKey: string }
  | { kind: "visual_overlay"; regionSlug: string; overlayKey: string };

export type CivilizationMilestoneDef = {
  key: string;
  name: string;
  description: string;
  category: MilestoneCategory;
  /** Community contribution points required. */
  threshold: number;
  era: number;
  worldEffects: WorldEffectOp[];
  /** Soft currency / XP flavor rewards — entertainment only. */
  keeperRewardHint: string;
  /** Cinematic card banner under `public/assets/restoration/`. */
  imageSrc: string;
};

export type CivilizationProgress = {
  contributions: Record<string, number>;
  unlockedMilestoneKeys: string[];
  era: number;
  totalContributed: number;
  updatedAt: string;
};
