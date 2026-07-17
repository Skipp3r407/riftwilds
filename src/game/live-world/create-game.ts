import * as Phaser from "phaser";
import type { LiveWorldBridge } from "@/game/live-world/bridge";
import { BootScene, BOOT_KEY } from "@/game/live-world/scenes/BootScene";
import { CommonsScene, COMMONS_KEY } from "@/game/live-world/scenes/CommonsScene";
import {
  EmberCraterScene,
  EMBER_KEY,
} from "@/game/live-world/scenes/EmberCraterScene";
import {
  MoonwaterCoastScene,
  COAST_KEY,
} from "@/game/live-world/scenes/MoonwaterCoastScene";
import {
  ElderwoodForestScene,
  ELDERWOOD_KEY,
} from "@/game/live-world/scenes/ElderwoodForestScene";
import { featureFlagDefaults } from "@/lib/config/feature-flags";

export type CreateLiveWorldGameOptions = {
  parent: HTMLElement;
  bridge: LiveWorldBridge;
  width?: number;
  height?: number;
};

export function createLiveWorldGame(
  options: CreateLiveWorldGameOptions,
): Phaser.Game {
  if (!featureFlagDefaults.PLAYABLE_LIVE_WORLD_ENABLED) {
    throw new Error("PLAYABLE_LIVE_WORLD_ENABLED is false");
  }

  const width = options.width ?? (options.parent.clientWidth || 960);
  const height = options.height ?? (options.parent.clientHeight || 540);

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: options.parent,
    width,
    height,
    backgroundColor: "#0a101c",
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [],
    banner: false,
    audio: { noAudio: true },
  });

  game.scene.add(BOOT_KEY, BootScene, true, { bridge: options.bridge });
  game.scene.add(COMMONS_KEY, CommonsScene, false);
  game.scene.add(EMBER_KEY, EmberCraterScene, false);
  game.scene.add(COAST_KEY, MoonwaterCoastScene, false);
  game.scene.add(ELDERWOOD_KEY, ElderwoodForestScene, false);
  return game;
}

export function destroyLiveWorldGame(game: Phaser.Game | null | undefined): void {
  if (!game) return;
  try {
    game.destroy(true);
  } catch {
    /* already torn down */
  }
}
