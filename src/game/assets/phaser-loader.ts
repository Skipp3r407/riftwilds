/**
 * Phaser asset loading helpers.
 * Dynamically import Phaser in scenes — keep this module Phaser-type-light for Next bundles.
 */

export type PhaserLikeLoader = {
  image: (key: string, url: string) => void;
  spritesheet: (
    key: string,
    url: string,
    config: { frameWidth: number; frameHeight: number },
  ) => void;
  atlas: (key: string, textureURL: string, atlasURL: string) => void;
};

export type PhaserLikeAnims = {
  create: (config: {
    key: string;
    frames: unknown;
    frameRate: number;
    repeat: number;
  }) => void;
  generateFrameNumbers: (
    key: string,
    config: { start: number; end: number },
  ) => unknown;
};

export function loadCreatureBattleSheet(
  loader: PhaserLikeLoader,
  species: string,
  frameWidth = 512,
  frameHeight = 512,
): void {
  loader.spritesheet(
    `creature-${species}-battle`,
    `/assets/creatures/sheets/creature-${species}-battle-sheet.png`,
    { frameWidth, frameHeight },
  );
}

export function loadCreatureBattleAtlas(loader: PhaserLikeLoader, species: string): void {
  loader.atlas(
    `creature-${species}-battle`,
    `/assets/creatures/sheets/creature-${species}-battle-sheet.png`,
    `/assets/creatures/atlases/creature-${species}-battle-atlas.json`,
  );
}

export function loadCreatureOverworldSheet(
  loader: PhaserLikeLoader,
  species: string,
  frameWidth = 128,
  frameHeight = 128,
): void {
  loader.spritesheet(
    `creature-${species}-overworld`,
    `/assets/creatures/sheets/creature-${species}-overworld-sheet.png`,
    { frameWidth, frameHeight },
  );
}

export function createBattleIdleAnimation(
  anims: PhaserLikeAnims,
  species: string,
  frameRate = 9,
): void {
  const key = `creature-${species}-battle`;
  anims.create({
    key: `${species}-idle`,
    frames: anims.generateFrameNumbers(key, { start: 0, end: 7 }),
    frameRate,
    repeat: -1,
  });
}

export function createNamedBattleAnimation(
  anims: PhaserLikeAnims,
  species: string,
  animKey: string,
  start: number,
  end: number,
  frameRate: number,
  repeat: number,
): void {
  const sheetKey = `creature-${species}-battle`;
  anims.create({
    key: `${species}-${animKey}`,
    frames: anims.generateFrameNumbers(sheetKey, { start, end }),
    frameRate,
    repeat,
  });
}

/** Example usage documented for scene authors. */
export const PHASER_CREATURE_LOAD_EXAMPLE = `
// Inside Phaser Scene preload():
import { loadCreatureBattleSheet, createBattleIdleAnimation } from "@/game/assets/phaser-loader";

preload() {
  loadCreatureBattleSheet(this.load, "cindercub");
}

create() {
  createBattleIdleAnimation(this.anims, "cindercub");
  const sprite = this.add.sprite(200, 300, "creature-cindercub-battle");
  sprite.setOrigin(0.5, 0.88);
  sprite.setScale(0.72);
  sprite.play("cindercub-idle");
  // Pixel-art overworld: sprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
}
`.trim();
