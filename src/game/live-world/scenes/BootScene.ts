import * as Phaser from "phaser";
import type { LiveWorldBridge } from "@/game/live-world/bridge";
import {
  COMMONS_OVERWORLD_NPC_SLUGS,
  NPC_OVERWORLD_FRAME,
  npcIdleAnimKey,
  npcSheetKey,
  npcWalkAnimKey,
} from "@/game/live-world/npcs/overworld-npcs";
import {
  ACTOR_KEYS,
  BUILDING_KEYS,
  PROP_KEYS,
  TERRAIN_KEYS,
  actorTex,
  buildingTex,
  propTex,
  terrainTex,
} from "@/game/live-world/systems/premium/asset-keys";
import {
  ATTENTION_ASSET,
  ATTENTION_TEXTURE_KEY,
} from "@/game/npc-ai/attention";

export const BOOT_KEY = "BootScene";

function drawCircleTexture(
  scene: Phaser.Scene,
  key: string,
  radius: number,
  fill: number,
  stroke: number,
): void {
  const g = scene.make.graphics({ x: 0, y: 0 });
  g.fillStyle(fill, 1);
  g.fillCircle(radius + 2, radius + 2, radius);
  g.lineStyle(2, stroke, 1);
  g.strokeCircle(radius + 2, radius + 2, radius);
  g.generateTexture(key, (radius + 2) * 2, (radius + 2) * 2);
  g.destroy();
}

function drawRectTexture(
  scene: Phaser.Scene,
  key: string,
  w: number,
  h: number,
  fill: number,
): void {
  const g = scene.make.graphics({ x: 0, y: 0 });
  g.fillStyle(fill, 1);
  g.fillRoundedRect(0, 0, w, h, 4);
  g.generateTexture(key, w, h);
  g.destroy();
}

export class BootScene extends Phaser.Scene {
  private bridge!: LiveWorldBridge;

  constructor() {
    super({ key: BOOT_KEY });
  }

  init(data: { bridge: LiveWorldBridge }): void {
    this.bridge = data.bridge;
  }

  preload(): void {
    this.bridge.loadingProgress.set(0.15);
    this.load.on("progress", (value: number) => {
      this.bridge.loadingProgress.set(0.15 + value * 0.5);
    });
    // Optional map UI masters — scenes fall back to vector markers if missing.
    this.load.image("ui-map-waypoint", "/assets/ui/map/waypoint.png");
    this.load.image("ui-map-portal", "/assets/ui/map/portal.png");
    this.load.image("ui-map-gateway", "/assets/ui/map/gateway-stone.png");
    this.load.image("ui-map-marker", "/assets/ui/map/marker.png");
    this.load.image("ui-map-quest-available", "/assets/ui/map/quest-available.png");
    this.load.image("ui-map-danger", "/assets/ui/map/danger.png");
    // Terrain masters used when present (procedural tint fallback otherwise)
    this.load.image("terrain-grass", "/assets/terrain/terrain-grass.png");
    this.load.image("terrain-path", "/assets/terrain/terrain-path.png");
    this.load.image("terrain-water", "/assets/terrain/terrain-water.png");
    this.load.image("terrain-lava", "/assets/terrain/terrain-lava.png");
    this.load.image("tileset-commons", "/assets/tilesets/commons-tileset.png");

    // Premium layered terrain / props / building facades (Commons showcase)
    for (const key of TERRAIN_KEYS) {
      this.load.image(terrainTex(key), `/assets/game/terrain/${key}.png`);
    }
    for (const key of PROP_KEYS) {
      this.load.image(propTex(key), `/assets/game/props/${key}.png`);
    }
    for (const key of BUILDING_KEYS) {
      this.load.image(buildingTex(key), `/assets/game/buildings/${key}.png`);
    }
    for (const key of ACTOR_KEYS) {
      this.load.image(actorTex(key), `/assets/game/actors/${key}.png`);
    }

    // Commons named + ambient NPCs — prefer 4-frame overworld sheets (masked RGBA).
    this.load.on("loaderror", () => {
      /* Optional NPC / premium art — scenes fall back gracefully. */
    });
    for (const slug of COMMONS_OVERWORLD_NPC_SLUGS) {
      this.load.spritesheet(
        npcSheetKey(slug),
        `/assets/npcs/riftwild-commons/${slug}/overworld-sheet.png`,
        {
          frameWidth: NPC_OVERWORLD_FRAME,
          frameHeight: NPC_OVERWORLD_FRAME,
        },
      );
      // Static fallback if sheet missing / failed
      this.load.image(
        `npc-${slug}`,
        `/assets/npcs/riftwild-commons/${slug}/sprite.png`,
      );
    }

    // Living NPC attention indicators (quest / story / chat / fear / praise / respect / wary)
    for (const kind of Object.keys(ATTENTION_TEXTURE_KEY) as (keyof typeof ATTENTION_TEXTURE_KEY)[]) {
      this.load.image(ATTENTION_TEXTURE_KEY[kind], ATTENTION_ASSET[kind]);
    }
  }

  create(): void {
    this.bridge.loadingProgress.set(0.7);

    // Circle fallbacks only when actor PNGs failed to load.
    if (!this.textures.exists(actorTex("player-keeper"))) {
      drawCircleTexture(this, "player-avatar", 14, 0x3de7ff, 0xffffff);
    }
    if (!this.textures.exists(actorTex("pet-riftling"))) {
      drawCircleTexture(this, "pet-companion", 10, 0xffb84d, 0xfff0d0);
    }
    drawCircleTexture(this, "npc-keeper", 13, 0x9b7bff, 0xe8e0ff);
    drawRectTexture(this, "tile-plaza", 32, 32, 0xc4a882);
    drawRectTexture(this, "tile-path", 32, 32, 0xb89460);
    drawRectTexture(this, "tile-grass", 32, 32, 0x4a9e4a);
    drawRectTexture(this, "solid-block", 16, 16, 0xff00ff);

    this.registerNpcAnimations();

    this.bridge.loadingProgress.set(0.95);
    this.scene.start("CommonsScene", {
      bridge: this.bridge,
      regionSlug: "riftwild-commons",
    });
  }

  private registerNpcAnimations(): void {
    for (const slug of COMMONS_OVERWORLD_NPC_SLUGS) {
      const sheet = npcSheetKey(slug);
      if (!this.textures.exists(sheet)) continue;
      const idleKey = npcIdleAnimKey(slug);
      const walkKey = npcWalkAnimKey(slug);
      if (!this.anims.exists(idleKey)) {
        this.anims.create({
          key: idleKey,
          frames: this.anims.generateFrameNumbers(sheet, { start: 0, end: 1 }),
          frameRate: 2.6,
          repeat: -1,
          yoyo: true,
        });
      }
      if (!this.anims.exists(walkKey)) {
        this.anims.create({
          key: walkKey,
          frames: this.anims.generateFrameNumbers(sheet, { start: 0, end: 3 }),
          frameRate: 8,
          repeat: -1,
        });
      }
    }
  }
}
