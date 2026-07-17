export type AssetStatus =
  | "planned"
  | "prompt_written"
  | "generated"
  | "needs_revision"
  | "approved"
  | "animated"
  | "integrated"
  | "production_ready"
  | "retired";

export type AssetType =
  | "creature_profile"
  | "creature_card"
  | "creature_battle"
  | "creature_overworld"
  | "creature_icon"
  | "creature_silhouette"
  | "creature_evolution"
  | "egg"
  | "affinity_icon"
  | "item"
  | "effect"
  | "environment"
  | "ui"
  | "marketing"
  | "placeholder";

export type AssetManifestEntry = {
  id: string;
  path: string;
  type: AssetType;
  association?: string;
  width: number;
  height: number;
  frameCount?: number;
  animationSpeedMs?: number;
  loop?: boolean | number;
  anchor?: { x: number; y: number };
  scale?: number;
  status: AssetStatus;
  version: string;
  source?: string;
  licenseNotes?: string;
  createdAt: string;
  updatedAt?: string;
};

export type SpriteAnimationConfig = {
  start: number;
  end: number;
  frameRate: number;
  repeat: number;
};

export type CreatureBattleAssetConfig = {
  frameWidth: number;
  frameHeight: number;
  scale: number;
  originX: number;
  originY: number;
  animations: Record<string, SpriteAnimationConfig>;
};

export type CreatureOverworldAssetConfig = {
  frameWidth: number;
  frameHeight: number;
  scale: number;
  originX: number;
  originY: number;
};

export type CreatureAssetConfig = {
  species: string;
  battle: CreatureBattleAssetConfig;
  overworld: CreatureOverworldAssetConfig;
};

export const DEFAULT_BATTLE_ANIMATIONS: Record<string, SpriteAnimationConfig> = {
  idle: { start: 0, end: 7, frameRate: 9, repeat: -1 },
  "attack-basic": { start: 0, end: 9, frameRate: 14, repeat: 0 },
  "attack-affinity": { start: 0, end: 13, frameRate: 15, repeat: 0 },
  hit: { start: 0, end: 4, frameRate: 12, repeat: 0 },
  victory: { start: 0, end: 9, frameRate: 10, repeat: 0 },
  defeat: { start: 0, end: 9, frameRate: 10, repeat: 0 },
  happy: { start: 0, end: 9, frameRate: 10, repeat: 1 },
  sleep: { start: 0, end: 7, frameRate: 6, repeat: -1 },
};
