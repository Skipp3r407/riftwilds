import * as Phaser from "phaser";
import type { LiveWorldBridge } from "@/game/live-world/bridge";
import { loadMap, isPortalLocked } from "@/game/world-maps/load-blueprint";
import { REGION_BY_SLUG } from "@/game/world-maps/regions";
import type { MapBlueprint, WorldMapObject } from "@/game/world-maps/types";
import {
  loadSavedPosition,
  savePosition,
} from "@/game/live-world/persistence/position-save";
import { createMultiplayerClient } from "@/game/live-world/network/multiplayer-client";
import type { VirtualInputState } from "@/game/live-world/types";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { tryGather } from "@/game/live-world/systems/gathering-stub";
import { startNpcDialogue } from "@/game/npcs/dialogue";
import {
  bumpObjective,
  loadLivePlayState,
  recordPlayerMoved,
  saveLivePlayState,
} from "@/game/npcs/play-state";
import { playSfx } from "@/lib/audio/sfx";

const WALK_SPEED = 160;
const RUN_SPEED = 280;
const PET_FOLLOW_DISTANCE = 42;
const PET_TELEPORT_DISTANCE = 220;
const INTERACT_RANGE = 56;
const SAVE_INTERVAL_MS = 2500;

type Interactable =
  | {
      kind: "npc";
      id: string;
      npcSlug: string;
      name: string;
      lines: string[];
      x: number;
      y: number;
      sprite?: Phaser.Physics.Arcade.Sprite;
      homeX: number;
      homeY: number;
      behavior: string;
    }
  | { kind: "portal"; id: string; label: string; toRegionId: string; locked: boolean; x: number; y: number }
  | { kind: "resource"; id: string; label: string; x: number; y: number }
  | { kind: "building"; id: string; label: string; lines: string[]; x: number; y: number };

export type RegionSceneInit = {
  bridge: LiveWorldBridge;
  regionSlug: string;
  entryPortalId?: string;
};

/**
 * Generic blueprint-driven region scene used by Commons + enterable stubs.
 * Extends existing Live World movement/pet/interact patterns — not a second engine.
 */
export class BlueprintRegionScene extends Phaser.Scene {
  protected bridge!: LiveWorldBridge;
  protected regionSlug!: string;
  protected blueprint!: MapBlueprint;
  protected player!: Phaser.Physics.Arcade.Sprite;
  protected pet!: Phaser.Physics.Arcade.Sprite;
  protected cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  protected wasd!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };
  protected shiftKey!: Phaser.Input.Keyboard.Key;
  protected interactKeyE!: Phaser.Input.Keyboard.Key;
  protected interactKeySpace!: Phaser.Input.Keyboard.Key;
  protected solidGroup!: Phaser.Physics.Arcade.StaticGroup;
  protected interactables: Interactable[] = [];
  protected nearest: Interactable | null = null;
  protected lastSaveAt = 0;
  protected mp = createMultiplayerClient({ instanceId: "local-1" });
  protected portalMarkers: Phaser.GameObjects.GameObject[] = [];
  protected enemyZones: { id: string; x: number; y: number; w: number; h: number; enemyId: string }[] =
    [];
  protected lastCombatAt = 0;

  constructor(key: string) {
    super({ key });
  }

  init(data: RegionSceneInit): void {
    this.bridge = data.bridge;
    this.regionSlug = data.regionSlug;
  }

  create(): void {
    const loaded = loadMap(this.regionSlug);
    this.blueprint = loaded.blueprint;
    const region = REGION_BY_SLUG[this.regionSlug];
    const palette = region?.tilePalette ?? {
      ground: 0x15261c,
      path: 0x243048,
      accent: 0x1a2438,
    };

    this.ensureTileTextures(palette);
    this.drawGround(palette);
    this.drawZones();
    this.solidGroup = this.physics.add.staticGroup();
    this.buildColliders();
    this.spawnWorldObjects(loaded.blueprint.objects);

    const spawn = this.resolveSpawn();
    this.player = this.physics.add.sprite(spawn.x, spawn.y, "player-avatar");
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);
    this.player.setCircle(12, 4, 4);

    this.pet = this.physics.add.sprite(spawn.x - 36, spawn.y + 8, "pet-companion");
    this.pet.setDepth(9);
    this.pet.setCircle(8, 4, 4);
    (this.pet.body as Phaser.Physics.Arcade.Body).allowGravity = false;

    const { width, height } = this.blueprint.camera;
    this.physics.world.setBounds(0, 0, width, height);
    this.physics.add.collider(this.player, this.solidGroup);
    this.physics.add.collider(this.pet, this.solidGroup);

    this.cameras.main.setBounds(0, 0, width, height);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setZoom(1.1);
    this.cameras.main.setBackgroundColor("#0a101c");

    this.bindInput();
    this.bridge.loadingProgress.set(1);
    this.bridge.ready.set(true);
    void this.bootstrapConnection();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.persistPosition();
      this.mp.disconnect();
    });
  }

  update(time: number): void {
    if (!this.player?.body) return;

    if (this.bridge.dialogue.get()) {
      this.player.setVelocity(0, 0);
      this.pet.setVelocity(0, 0);
      this.handleDialogueAdvance();
      return;
    }

    this.applyMovement();
    this.trackMovementQuest();
    this.updatePetFollow();
    this.updateAmbientNpcs(time);
    this.updateNearest();
    this.handleInteract();
    this.handleEnemyZones(time);
    this.pulsePortals(time);

    if (time - this.lastSaveAt > SAVE_INTERVAL_MS) {
      this.lastSaveAt = time;
      this.persistPosition();
      this.mp.sendMove({ x: this.player.x, y: this.player.y });
    }
  }

  private movedOnce = false;
  private lastFootstepAt = 0;

  protected trackMovementQuest(): void {
    if (!this.player) return;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const moving = Math.abs(body.velocity.x) + Math.abs(body.velocity.y) >= 10;
    if (moving) {
      const now = this.time.now;
      if (now - this.lastFootstepAt > 280) {
        this.lastFootstepAt = now;
        playSfx("world.footstep");
      }
    }
    if (this.movedOnce) return;
    if (!moving) return;
    this.movedOnce = true;
    let state = loadLivePlayState();
    state = recordPlayerMoved(state);
    saveLivePlayState(state);
  }

  protected updateAmbientNpcs(time: number): void {
    for (const it of this.interactables) {
      if (it.kind !== "npc" || !it.sprite) continue;
      const bob = Math.sin(time / 350 + it.homeX) * 2;
      // Face player when nearby
      const d = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        it.homeX,
        it.homeY,
      );
      if (d < 90) {
        it.sprite.setFlipX(this.player.x < it.sprite.x);
        it.sprite.y = it.homeY + bob * 0.3;
      } else if (it.behavior === "patrol" || it.behavior === "pace") {
        const wander = Math.sin(time / 1200 + it.homeY) * 18;
        it.sprite.x = it.homeX + wander;
        it.sprite.y = it.homeY + bob;
        it.x = it.sprite.x;
        it.y = it.sprite.y;
      } else {
        it.sprite.y = it.homeY + bob;
      }
    }
  }

  protected ensureTileTextures(palette: {
    ground: number;
    path: number;
    accent: number;
  }): void {
    const make = (key: string, color: number) => {
      if (this.textures.exists(key)) return;
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(color, 1);
      g.fillRoundedRect(0, 0, 32, 32, 2);
      g.generateTexture(key, 32, 32);
      g.destroy();
    };
    make(`tile-ground-${this.regionSlug}`, palette.ground);
    make(`tile-path-${this.regionSlug}`, palette.path);
    make(`tile-accent-${this.regionSlug}`, palette.accent);
  }

  protected drawGround(palette: {
    ground: number;
    path: number;
    accent: number;
  }): void {
    const { cols, rows, tileSize: T, safeZones } = this.blueprint;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * T + T / 2;
        const y = row * T + T / 2;
        const inSafe = safeZones.some(
          (z) =>
            x >= z.x && x <= z.x + z.width && y >= z.y && y <= z.y + z.height,
        );
        const key = inSafe
          ? col % 2 === row % 2
            ? `tile-accent-${this.regionSlug}`
            : `tile-path-${this.regionSlug}`
          : `tile-ground-${this.regionSlug}`;
        this.add.image(x, y, key).setDepth(0);
      }
    }

    // Silence unused palette lint when textures already exist
    void palette;

    this.add
      .text(
        this.blueprint.camera.width / 2,
        48,
        this.blueprint.name.toUpperCase(),
        {
          fontFamily: "Orbitron, sans-serif",
          fontSize: "20px",
          color: "#e8f7ff",
        },
      )
      .setOrigin(0.5)
      .setDepth(2)
      .setAlpha(0.85);

    if (this.blueprint.completeness === "PARTIAL") {
      this.add
        .text(
          this.blueprint.camera.width / 2,
          72,
          "PARTIAL MAP — blueprint stub",
          {
            fontFamily: "Manrope, sans-serif",
            fontSize: "12px",
            color: "#ffb84d",
          },
        )
        .setOrigin(0.5)
        .setDepth(2)
        .setAlpha(0.9);
    }
  }

  protected drawZones(): void {
    for (const z of this.blueprint.zones) {
      if (z.kind === "safe" || z.kind === "settlement") {
        const g = this.add.graphics();
        g.lineStyle(1, 0x3de7ff, 0.15);
        g.strokeRect(z.x, z.y, z.width, z.height);
        g.setDepth(1);
      }
    }
    if (this.blueprint.portalHub) {
      const hub = this.blueprint.portalHub;
      const ring = this.add.graphics();
      ring.lineStyle(3, 0x3de7ff, 0.4);
      ring.strokeCircle(hub.x, hub.y, hub.radius);
      ring.setDepth(1);
    }
  }

  protected buildColliders(): void {
    for (const box of this.blueprint.colliders) {
      // Hazards use softer blocking for stubs (still solid)
      const zone = this.add.zone(
        box.x + box.width / 2,
        box.y + box.height / 2,
        box.width,
        box.height,
      );
      this.physics.world.enable(zone, Phaser.Physics.Arcade.STATIC_BODY);
      const body = zone.body as Phaser.Physics.Arcade.StaticBody;
      body.updateFromGameObject();
      this.solidGroup.add(zone);
    }
  }

  protected spawnWorldObjects(objects: WorldMapObject[]): void {
    for (const o of objects) {
      if (o.type === "building" || (o.type === "decoration" && o.collision)) {
        const g = this.add.graphics();
        const color = o.color ?? 0x6688aa;
        g.fillStyle(color, 0.55);
        g.fillRoundedRect(o.x, o.y, o.width ?? 64, o.height ?? 64, 8);
        g.lineStyle(2, 0xffffff, 0.3);
        g.strokeRoundedRect(o.x, o.y, o.width ?? 64, o.height ?? 64, 8);
        g.setDepth(3);
        if (o.label) {
          this.add
            .text(o.x + (o.width ?? 64) / 2, o.y + (o.height ?? 64) / 2, o.label, {
              fontFamily: "Manrope, sans-serif",
              fontSize: "11px",
              color: "#ffffff",
              align: "center",
              wordWrap: { width: (o.width ?? 64) - 8 },
            })
            .setOrigin(0.5)
            .setDepth(4);
        }
        if (o.type === "building" && o.interactive) {
          this.interactables.push({
            kind: "building",
            id: o.id,
            label: o.label ?? o.id,
            lines: [
              `${o.label ?? "Building"} — interior visits ship in a later phase.`,
              "For now this marker marks the destination on the Live World map.",
            ],
            x: o.x + (o.width ?? 64) / 2,
            y: o.y + (o.height ?? 64),
          });
        }
      }

      if (o.type === "npc") {
        const npcSlug = String(o.metadata?.npcId ?? o.id.replace(/^npc-/, ""));
        const textureKey =
          this.textures.exists(`npc-${npcSlug}`) ? `npc-${npcSlug}` : "npc-keeper";
        const sprite = this.physics.add.sprite(o.x, o.y, textureKey);
        sprite.setDisplaySize(36, 36);
        sprite.setImmovable(true);
        sprite.setDepth(8);
        (sprite.body as Phaser.Physics.Arcade.Body).allowGravity = false;
        sprite.setCircle(14);
        const name = o.label ?? "Keeper";
        this.add
          .text(o.x, o.y - 28, name, {
            fontFamily: "Manrope, sans-serif",
            fontSize: "11px",
            color: "#d8ccff",
          })
          .setOrigin(0.5)
          .setDepth(8);
        const lines = (o.metadata?.lines as string[]) ?? [
          "The keeper greets you warmly.",
        ];
        this.interactables.push({
          kind: "npc",
          id: o.id,
          npcSlug,
          name,
          lines: lines.filter((l) => l && !/undefined|null|TODO/i.test(l)),
          x: o.x,
          y: o.y,
          sprite,
          homeX: o.x,
          homeY: o.y,
          behavior: String(o.metadata?.behavior ?? "idle"),
        });
      }

      if (o.type === "enemy_spawn") {
        this.enemyZones.push({
          id: o.id,
          x: o.x,
          y: o.y,
          w: o.width ?? 64,
          h: o.height ?? 64,
          enemyId: String(o.metadata?.enemyId ?? "rift-slime"),
        });
        if (featureFlagDefaults.LIVE_WORLD_PVE_ENABLED) {
          const g = this.add.graphics();
          g.fillStyle(0xff5a1f, 0.12);
          g.fillRect(o.x, o.y, o.width ?? 64, o.height ?? 64);
          g.setDepth(2);
          this.add
            .text(o.x + (o.width ?? 64) / 2, o.y + 8, "Wilds", {
              fontFamily: "Manrope, sans-serif",
              fontSize: "10px",
              color: "#ffb0a0",
            })
            .setOrigin(0.5, 0)
            .setDepth(3);
        }
      }

      if (o.type === "portal") {
        const locked = isPortalLocked(o);
        const color = locked ? 0x445566 : 0x3de7ff;
        if (this.textures.exists("ui-map-portal")) {
          this.portalMarkers.push(
            this.add
              .image(o.x, o.y, "ui-map-portal")
              .setDisplaySize(36, 36)
              .setDepth(5)
              .setAlpha(locked ? 0.45 : 1),
          );
        } else {
          const arc = this.add.circle(o.x, o.y, 18, color, locked ? 0.25 : 0.45);
          arc.setStrokeStyle(2, locked ? 0x8899aa : 0xffffff, 0.7);
          arc.setDepth(5);
          this.portalMarkers.push(arc);
        }
        this.add
          .text(o.x, o.y + 28, o.label ?? "Portal", {
            fontFamily: "Manrope, sans-serif",
            fontSize: "10px",
            color: locked ? "#8899aa" : "#c8f7ff",
          })
          .setOrigin(0.5)
          .setDepth(5);
        this.interactables.push({
          kind: "portal",
          id: o.id,
          label: o.label ?? "Portal",
          toRegionId: String(o.metadata?.toRegionId ?? ""),
          locked,
          x: o.x,
          y: o.y,
        });
      }

      if (o.type === "resource" && featureFlagDefaults.LIVE_WORLD_GATHERING_ENABLED) {
        const g = this.add.graphics();
        g.fillStyle(0x4adf7a, 0.7);
        g.fillCircle(o.x, o.y, 10);
        g.setDepth(5);
        this.interactables.push({
          kind: "resource",
          id: o.id,
          label: o.label ?? "Resource",
          x: o.x,
          y: o.y,
        });
      }

      if (o.type === "waypoint") {
        if (this.textures.exists("ui-map-waypoint")) {
          this.add
            .image(o.x, o.y, "ui-map-waypoint")
            .setDisplaySize(28, 28)
            .setDepth(5)
            .setAlpha(0.9);
        } else {
          const g = this.add.graphics();
          g.fillStyle(0xffb84d, 0.5);
          g.fillTriangle(o.x, o.y - 14, o.x - 10, o.y + 8, o.x + 10, o.y + 8);
          g.setDepth(5);
        }
      }

      if (o.type === "boss_arena") {
        const g = this.add.graphics();
        g.lineStyle(2, 0xff5a5a, 0.5);
        g.strokeRect(o.x, o.y, o.width ?? 128, o.height ?? 96);
        g.setDepth(2);
        if (o.label) {
          this.add
            .text(o.x + (o.width ?? 128) / 2, o.y + 12, o.label, {
              fontFamily: "Manrope, sans-serif",
              fontSize: "11px",
              color: "#ffaaaa",
            })
            .setOrigin(0.5)
            .setDepth(3);
        }
      }
    }
  }

  protected resolveSpawn(): { x: number; y: number } {
    const saved = loadSavedPosition();
    if (saved?.mapId === this.regionSlug) {
      return { x: saved.x, y: saved.y };
    }
    return {
      x: this.blueprint.spawn.x,
      y: this.blueprint.spawn.y,
    };
  }

  protected bindInput(): void {
    if (!this.input.keyboard) return;
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as typeof this.wasd;
    this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.interactKeyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.interactKeySpace = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE,
    );
  }

  protected async bootstrapConnection(): Promise<void> {
    this.bridge.status.set({
      connection: "connecting",
      mapName: this.blueprint.name,
      instanceLabel: "Joining…",
      playerLabel: "Keeper",
      petLabel: "Spark Companion",
      hint: "Connecting…",
    });
    const result = await this.mp.connect();
    this.bridge.status.set({
      connection: result === "connected" ? "connected" : "local",
      mapName: this.blueprint.name,
      instanceLabel:
        result === "connected" ? "Instance online" : "Local solo (Phase 1)",
      playerLabel: "Keeper",
      petLabel: "Spark Companion",
      hint: "WASD move · Shift run · E/Space interact · Portals travel",
    });
  }

  protected readKeyboardDesire(): VirtualInputState {
    const v = this.bridge.virtualInput.get();
    if (!this.cursors || !this.wasd) return v;
    return {
      up: v.up || this.cursors.up.isDown || this.wasd.up.isDown,
      down: v.down || this.cursors.down.isDown || this.wasd.down.isDown,
      left: v.left || this.cursors.left.isDown || this.wasd.left.isDown,
      right: v.right || this.cursors.right.isDown || this.wasd.right.isDown,
      run: v.run || this.shiftKey?.isDown === true,
    };
  }

  protected applyMovement(): void {
    const input = this.readKeyboardDesire();
    let vx = 0;
    let vy = 0;
    if (input.left) vx -= 1;
    if (input.right) vx += 1;
    if (input.up) vy -= 1;
    if (input.down) vy += 1;
    if (vx !== 0 || vy !== 0) {
      const len = Math.hypot(vx, vy);
      vx /= len;
      vy /= len;
      const speed = input.run ? RUN_SPEED : WALK_SPEED;
      this.player.setVelocity(vx * speed, vy * speed);
    } else {
      this.player.setVelocity(0, 0);
    }
  }

  protected updatePetFollow(): void {
    const dx = this.player.x - this.pet.x;
    const dy = this.player.y - this.pet.y;
    const dist = Math.hypot(dx, dy);
    if (dist > PET_TELEPORT_DISTANCE) {
      this.pet.setPosition(this.player.x - 28, this.player.y + 10);
      this.pet.setVelocity(0, 0);
      return;
    }
    if (dist > PET_FOLLOW_DISTANCE) {
      const speed = Math.min(RUN_SPEED * 0.95, 80 + dist * 1.4);
      this.pet.setVelocity((dx / dist) * speed, (dy / dist) * speed);
    } else {
      this.pet.setVelocity(0, 0);
    }
  }

  protected updateNearest(): void {
    let best: Interactable | null = null;
    let bestDist = INTERACT_RANGE;
    for (const it of this.interactables) {
      const d = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        it.x,
        it.y,
      );
      if (d < bestDist) {
        bestDist = d;
        best = it;
      }
    }
    this.nearest = best;
    let label = "Press E / Space";
    if (best?.kind === "npc") label = `Talk to ${best.name} (E / Space)`;
    if (best?.kind === "portal")
      label = best.locked
        ? `${best.label} — locked (story unlock)`
        : `Enter ${best.label} (E / Space)`;
    if (best?.kind === "resource") label = `Gather ${best.label} (E / Space)`;
    if (best?.kind === "building") label = `Inspect ${best.label} (E / Space)`;
    this.bridge.interactPrompt.set({ visible: !!best, label });
  }

  protected handleInteract(): void {
    const keyPressed =
      (this.interactKeyE && Phaser.Input.Keyboard.JustDown(this.interactKeyE)) ||
      (this.interactKeySpace &&
        Phaser.Input.Keyboard.JustDown(this.interactKeySpace));
    const queued = this.bridge.consumeInteract();
    if (!keyPressed && !queued) return;
    if (!this.nearest) return;

    const n = this.nearest;
    if (n.kind === "npc") {
      playSfx("world.npc_talk");
      const active = startNpcDialogue(n.npcSlug);
      if (active) {
        this.bridge.setNpcDialogue({
          speaker: active.speaker,
          lines: active.lines,
          lineIndex: 0,
          npcSlug: active.npcSlug,
          portraitAsset: active.portraitAsset,
          choices: active.choices.map((c) => ({ id: c.id, label: c.label })),
          openShopId: null,
        });
      } else {
        this.bridge.dialogue.set({
          speaker: n.name,
          lines: n.lines.length ? n.lines : ["The keeper greets you warmly."],
          lineIndex: 0,
        });
      }
      return;
    }
    if (n.kind === "building") {
      playSfx("world.npc_talk");
      this.bridge.dialogue.set({
        speaker: n.label,
        lines: n.lines,
        lineIndex: 0,
      });
      return;
    }
    if (n.kind === "resource") {
      const result = tryGather(n.id);
      let state = loadLivePlayState();
      if (result.ok) {
        playSfx("world.gather");
        playSfx("world.loot");
        bumpObjective(state, "starter-q5-first-steps", "loot");
        bumpObjective(state, "starter-q6-tools", "gather");
        bumpObjective(state, "starter-q7-broken-marker", "components");
        saveLivePlayState(state);
      } else {
        playSfx("ui.error");
      }
      this.bridge.dialogue.set({
        speaker: "Gathering",
        lines: [
          result.ok
            ? `Collected from ${n.label}.`
            : `${result.reason} (${n.label} node is marked for Phase 3).`,
        ],
        lineIndex: 0,
      });
      return;
    }
    if (n.kind === "portal") {
      if (n.locked) {
        playSfx("ui.error");
        this.bridge.dialogue.set({
          speaker: "Portal Keeper",
          lines: [
            `${n.label} is sealed until your story progresses.`,
            "Region unlocks never require a paid pet or paid pass.",
          ],
          lineIndex: 0,
        });
        return;
      }
      this.travelTo(n.toRegionId);
    }
  }

  protected travelTo(toRegionId: string): void {
    const target = REGION_BY_SLUG[toRegionId];
    if (!target) return;
    if (target.playability === "blueprint_only") {
      playSfx("ui.error");
      this.bridge.dialogue.set({
        speaker: "Portal Keeper",
        lines: [
          `${target.name} has a full map blueprint but no playable scene yet.`,
          "Return when that region ships as an enterable stub.",
        ],
        lineIndex: 0,
      });
      return;
    }
    if (!featureFlagDefaults.PLAYABLE_LIVE_WORLD_ENABLED) return;

    playSfx("world.portal");
    this.persistPosition();
    let state = loadLivePlayState();
    bumpObjective(state, "starter-q8-world-beyond", "portal");
    bumpObjective(state, "starter-q8-world-beyond", "travel");
    if (!state.regionsVisited.includes(toRegionId)) {
      state.regionsVisited.push(toRegionId);
    }
    saveLivePlayState(state);
    // Clear saved pos so destination spawn is used
    savePosition({
      mapId: toRegionId,
      x: target.spawn.x,
      y: target.spawn.y,
    });
    this.scene.start(target.sceneKey, {
      bridge: this.bridge,
      regionSlug: toRegionId,
    } satisfies RegionSceneInit);
  }

  protected handleEnemyZones(time: number): void {
    if (!featureFlagDefaults.LIVE_WORLD_PVE_ENABLED) return;
    if (time - this.lastCombatAt < 4000) return;
    for (const z of this.enemyZones) {
      if (
        this.player.x >= z.x &&
        this.player.x <= z.x + z.w &&
        this.player.y >= z.y &&
        this.player.y <= z.y + z.h
      ) {
        this.lastCombatAt = time;
        let state = loadLivePlayState();
        state.enemiesDefeated += 1;
        bumpObjective(state, "starter-q5-first-steps", "leave-safe");
        bumpObjective(state, "starter-q5-first-steps", "defeat");
        bumpObjective(state, "starter-q5-first-steps", "loot");
        saveLivePlayState(state);
        this.bridge.dialogue.set({
          speaker: "Encounter",
          lines: [
            `A ${z.enemyId.replace(/-/g, " ")} challenges your companion!`,
            "Training clash resolved — loot scrap granted (demo combat).",
            "Return to Captain Orren when ready.",
          ],
          lineIndex: 0,
        });
        break;
      }
    }
  }

  protected handleDialogueAdvance(): void {
    const keyPressed =
      (this.interactKeyE && Phaser.Input.Keyboard.JustDown(this.interactKeyE)) ||
      (this.interactKeySpace &&
        Phaser.Input.Keyboard.JustDown(this.interactKeySpace));
    const queued = this.bridge.consumeInteract();
    if (keyPressed || queued) this.bridge.advanceDialogue();
  }

  protected pulsePortals(time: number): void {
    const pulse = 0.35 + Math.sin(time / 400) * 0.15;
    for (const marker of this.portalMarkers) {
      if (marker instanceof Phaser.GameObjects.Arc && marker.fillColor === 0x3de7ff) {
        marker.setAlpha(pulse);
      } else if (marker instanceof Phaser.GameObjects.Image) {
        marker.setAlpha(0.55 + Math.sin(time / 400) * 0.25);
      }
    }
  }

  protected persistPosition(): void {
    if (!this.player) return;
    savePosition({
      mapId: this.regionSlug,
      x: Math.round(this.player.x),
      y: Math.round(this.player.y),
    });
  }
}
