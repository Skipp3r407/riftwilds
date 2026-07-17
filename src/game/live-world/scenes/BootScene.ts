import * as Phaser from "phaser";
import type { LiveWorldBridge } from "@/game/live-world/bridge";

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
    this.load.image("ui-map-marker", "/assets/ui/map/marker.png");
    this.load.image("ui-map-quest-available", "/assets/ui/map/quest-available.png");
    this.load.image("ui-map-danger", "/assets/ui/map/danger.png");

    // Commons named NPCs — portraits used as overworld textures when present.
    const commons = [
      "elara-venn",
      "rowan-vale",
      "mira-shellbright",
      "bram-ironroot",
      "tessa-windmere",
      "archivist-solen",
      "captain-orren",
      "nyla-brook",
      "pip-gearwhistle",
      "rook-emberfall",
    ];
    this.load.on("loaderror", () => {
      /* Optional NPC portraits — scenes fall back to npc-keeper texture. */
    });
    for (const slug of commons) {
      this.load.image(
        `npc-${slug}`,
        `/assets/npcs/riftwild-commons/${slug}/portrait.png`,
      );
    }
  }

  create(): void {
    this.bridge.loadingProgress.set(0.7);

    drawCircleTexture(this, "player-avatar", 14, 0x3de7ff, 0xffffff);
    drawCircleTexture(this, "pet-companion", 10, 0xffb84d, 0xfff0d0);
    drawCircleTexture(this, "npc-keeper", 13, 0x9b7bff, 0xe8e0ff);
    drawRectTexture(this, "tile-plaza", 32, 32, 0x1a2438);
    drawRectTexture(this, "tile-path", 32, 32, 0x243048);
    drawRectTexture(this, "tile-grass", 32, 32, 0x15261c);
    drawRectTexture(this, "solid-block", 16, 16, 0xff00ff);

    this.bridge.loadingProgress.set(0.95);
    this.scene.start("CommonsScene", {
      bridge: this.bridge,
      regionSlug: "riftwild-commons",
    });
  }
}
