/**
 * Map Goals — structured region recommendations (not hard-coded in React).
 * Shared hook surface for Live World UI + World pages.
 */

export type MapGoalKind =
  | "story"
  | "explore"
  | "gather"
  | "craft"
  | "combat"
  | "social"
  | "restoration"
  | "job"
  | "care";

export type MapGoalDef = {
  id: string;
  regionId: string;
  title: string;
  summary: string;
  kind: MapGoalKind;
  /** Suggested Credit earn range (soft; actual grants via ledger). */
  creditHintMin: number;
  creditHintMax: number;
  /** Paired sink the player should expect. */
  suggestedSink: string;
  /** Quest / job / activity keys. */
  linkedKeys: string[];
  /** Priority 1 = top recommendation. */
  priority: number;
  starterRecommended?: boolean;
  iconAsset: string;
};

export type RegionMapGoals = {
  regionId: string;
  regionName: string;
  goals: MapGoalDef[];
};
