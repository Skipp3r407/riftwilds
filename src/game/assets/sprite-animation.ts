import type { CreatureAssetConfig, SpriteAnimationConfig } from "@/lib/assets/types";
import { DEFAULT_BATTLE_ANIMATIONS } from "@/lib/assets/types";

export function buildDefaultCreatureConfig(species: string): CreatureAssetConfig {
  return {
    species,
    battle: {
      frameWidth: 512,
      frameHeight: 512,
      scale: 0.72,
      originX: 0.5,
      originY: 0.88,
      animations: { ...DEFAULT_BATTLE_ANIMATIONS },
    },
    overworld: {
      frameWidth: 128,
      frameHeight: 128,
      scale: 1,
      originX: 0.5,
      originY: 0.82,
    },
  };
}

export function animationDurationMs(config: SpriteAnimationConfig): number {
  const frames = config.end - config.start + 1;
  const msPerFrame = 1000 / config.frameRate;
  const loops = config.repeat < 0 ? 1 : config.repeat + 1;
  return Math.round(frames * msPerFrame * loops);
}

export function expectedBattleSheetSize(config: CreatureAssetConfig, columns = 8): {
  width: number;
  height: number;
  rows: number;
} {
  const anims = Object.values(config.battle.animations);
  const totalFrames = anims.reduce((sum, a) => sum + (a.end - a.start + 1), 0);
  const rows = Math.ceil(totalFrames / columns);
  return {
    width: columns * config.battle.frameWidth,
    height: rows * config.battle.frameHeight,
    rows,
  };
}

export function toPhaserAnimJson(species: string, config: CreatureAssetConfig) {
  return Object.entries(config.battle.animations).map(([name, anim]) => ({
    key: `${species}-${name}`,
    type: "frame",
    frames: {
      type: "frames",
      key: `creature-${species}-battle`,
      start: anim.start,
      end: anim.end,
    },
    frameRate: anim.frameRate,
    repeat: anim.repeat,
  }));
}
