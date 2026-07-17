/**
 * Expansion pack manifests — plugin-style content registration for decade-scale growth.
 * Packs never rewrite core systems; they register additive content into registries.
 */

export type ExpansionPhase =
  | "foundation"
  | "living_world"
  | "story"
  | "civilization"
  | "housing"
  | "endgame"
  | "social"
  | "community"
  | "future";

export type ContentKind =
  | "region"
  | "quest"
  | "achievement"
  | "festival"
  | "story_arc"
  | "furniture"
  | "expedition_biome"
  | "boss"
  | "raid"
  | "species"
  | "item"
  | "npc"
  | "cinematic"
  | "milestone"
  | "emote"
  | "codex_entry";

export type ContentEntry<T = unknown> = {
  id: string;
  kind: ContentKind;
  packId: string;
  data: T;
  /** Feature flag key that must be on for this entry (optional). */
  featureFlag?: string;
  /** Semantic version when this content landed. */
  since?: string;
};

export type ExpansionPackManifest = {
  id: string;
  name: string;
  version: string;
  description: string;
  phase: ExpansionPhase;
  /** Packs that must load first. */
  dependsOn: string[];
  /** Whether this pack ships with the core game. */
  core: boolean;
  /** Feature flag gating pack activation (optional). */
  featureFlag?: string;
  contentIds: string[];
  /** Region pack hook — future DLC-style region drops. */
  regionPack?: {
    regionSlugs: string[];
    mapBlueprintPaths?: string[];
  };
};

export type RegisteredPack = ExpansionPackManifest & {
  registeredAt: string;
  entryCount: number;
};

export type EcosystemSnapshot = {
  generatedAt: string;
  packs: RegisteredPack[];
  countsByKind: Partial<Record<ContentKind, number>>;
  livingWorld: {
    season: string;
    dayPhase: string;
    weather: string;
    disasterActive: string | null;
  };
  civilization: {
    era: string;
    progressPercent: number;
    unlockedMilestones: number;
    totalMilestones: number;
  };
  achievements: { catalogSize: number };
  festivals: { upcoming: number; active: number };
  flags: Record<string, boolean>;
};
