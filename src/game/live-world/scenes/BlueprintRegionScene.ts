import * as Phaser from "phaser";
import type { LiveWorldBridge } from "@/game/live-world/bridge";
import { loadMap, isPortalLocked } from "@/game/world-maps/load-blueprint";
import { REGION_BY_SLUG } from "@/game/world-maps/regions";
import type {
  CollisionRect,
  MapBlueprint,
  WorldMapObject,
} from "@/game/world-maps/types";
import {
  clampEntityToNav,
  clampEnemyLeash,
  clampProjectileToWorld,
  collectTransitionZones,
  defaultLeashRadius,
  isDeepWater,
  lockedBlockerMessage,
  lockedPortalSeals,
  playableBoundsFromBlueprint,
  resolveSafeSpawn,
  solidColliders,
  transitionAtPoint,
  type PlayableBounds,
} from "@/game/world-maps/boundaries";
import { getRegionUnlockView } from "@/game/world-travel/unlocks";
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
  syncKillerReputation,
} from "@/game/npcs/play-state";
import { playSfx } from "@/lib/audio/sfx";
import { playCompanionCry } from "@/lib/audio/riftling-cries";
import { playFootstep } from "@/lib/audio/footsteps";
import { startRegionAmbient, stopAmbient } from "@/lib/audio/ambient";
import { playRegionMusic } from "@/lib/audio/music";
import { positionalAudio } from "@/lib/audio/positional";
import { getInputManager } from "@/game/live-world/input/input-manager";
import {
  discoverLandmark,
  discoverWaypoint,
  markVisited,
} from "@/game/live-world/systems/exploration-fog";
import { tryDiscoverNearby } from "@/game/world-exploration";
import {
  activateGatewayOnVisit,
  attemptFastTravel,
  canTravelNow,
  grantGatewayActivationRewards,
  grantRegionDiscoveryRewards,
  playTravelSfx,
  runTravelTransition,
} from "@/game/world-travel";
import {
  landmarkScatterSeed,
  paintTerrainGrid,
  terrainColor,
  type TerrainCellKind,
  type TerrainGrid,
} from "@/game/live-world/systems/terrain-paint";
import {
  isAmbientActivityBehavior,
  isMovingNpcBehavior,
  npcDisplayHeight,
  npcIdleAnimKey,
  npcSheetKey,
  npcWanderAmplitude,
  npcWalkAnimKey,
} from "@/game/live-world/npcs/overworld-npcs";
import { NPC_BY_ID as CONTENT_NPC_BY_ID } from "@/content/npcs";
import {
  attachIsoCamera,
  createAtmosphere,
  drawPremiumTerrain,
  isPremiumRegion,
  spawnPremiumProps,
  trySpawnBuildingSprite,
  collectOccluders,
  updateOccluderFades,
  drawCityWallVisuals,
  drawTownStreetFurniture,
  depthAt,
  DEPTH,
  addContactShadow,
  KEEPER_DISPLAY,
  PET_DISPLAY,
  actorContactShadow,
  type Occluder,
  trySpawnDecorationSprite,
  trySpawnResourceSprite,
  type AtmosphereHandles,
  type IsoCameraController,
} from "@/game/live-world/systems/premium";
import { loadImmersiveSettings } from "@/game/live-world/systems/immersive/settings";
import { resolveGraphicsQuality } from "@/game/live-world/systems/immersive/graphics-quality";
import { ZOOM_STEP } from "@/game/live-world/systems/premium/camera-zoom";
import { actorTex } from "@/game/live-world/systems/premium/asset-keys";
import {
  playEmoteVisual,
  type EmoteVisualHandle,
} from "@/game/live-world/systems/emotes/phaser-visuals";
import type { EmoteBusEvent } from "@/game/live-world/systems/emotes/types";
import {
  ATTENTION_TEXTURE_KEY,
  type AttentionState,
} from "@/game/npc-ai/attention";
import {
  acknowledgeAttention,
  killerFromPlayState,
  tickLivingNpcs,
  type LivingNpcActor,
} from "@/game/npc-ai/living-runtime";
import { resolveLivingWorldClock } from "@/game/living-world/clock";
import { PetEquipmentLayerManager } from "@/game/live-world/systems/pet-equipment-layers";
import { toAppearanceNetStub } from "@/lib/equipment/appearance";
import type { AppearanceSnapshot } from "@/lib/equipment/types";
import {
  classifyWorldLabel,
  createNameplateSolveState,
  solveNameplateLayout,
  type NameplateKind,
  type NameplateSolveState,
} from "@/game/live-world/systems/world-nameplates";
import { REST_HUB_CATALOG } from "@/lib/social-presence/config";

const WALK_SPEED = 160;
const COMPANION_PET_ID = "live-companion";
const RUN_SPEED = 280;
const PET_FOLLOW_DISTANCE = 42;
const PET_TELEPORT_DISTANCE = 220;
const INTERACT_RANGE = 56;
const SAVE_INTERVAL_MS = 2500;
const FOG_MARK_INTERVAL_MS = 400;

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
      nameLabel?: Phaser.GameObjects.Text;
      indicator?: Phaser.GameObjects.GameObject & {
        setVisible: (v: boolean) => unknown;
        setPosition: (x: number, y: number) => unknown;
        destroy: () => void;
        texture?: { key: string };
      };
      homeX: number;
      homeY: number;
      /** Original blueprint spawn — schedule anchors offset from this. */
      spawnHomeX: number;
      spawnHomeY: number;
      behavior: string;
      lastX?: number;
      lastY?: number;
      present?: boolean;
      attention?: AttentionState | null;
      fleeUntil?: number;
      lastKillerNoticeAt?: number;
      lastSocialNoticeAt?: number;
    }
  | { kind: "portal"; id: string; label: string; toRegionId: string; locked: boolean; x: number; y: number }
  | {
      kind: "gateway";
      id: string;
      label: string;
      regionId: string;
      activated: boolean;
      x: number;
      y: number;
    }
  | { kind: "resource"; id: string; label: string; x: number; y: number }
  | { kind: "building"; id: string; label: string; lines: string[]; x: number; y: number }
  | {
      kind: "pet";
      id: string;
      publicPetId: string;
      label: string;
      x: number;
      y: number;
      owned: boolean;
    };

export type RegionSceneInit = {
  bridge: LiveWorldBridge;
  regionSlug: string;
  entryPortalId?: string;
};

/** Exported stub for future projectile systems — despawn outside playable bounds. */
export function containProjectile(
  x: number,
  y: number,
  bounds: PlayableBounds,
): { x: number; y: number } | null {
  return clampProjectileToWorld(x, y, bounds);
}

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
  /** Soft idle vocalization for the following companion (species SFX, not music). */
  protected lastPetIdleCryAt = 0;
  protected mp = createMultiplayerClient({ instanceId: "local-1" });
  protected portalMarkers: Phaser.GameObjects.GameObject[] = [];
  protected enemyZones: {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    enemyId: string;
    cx: number;
    cy: number;
  }[] = [];
  protected lastCombatAt = 0;
  protected facingRad = 0;
  protected lastFogAt = 0;
  protected debugGfx: Phaser.GameObjects.Graphics | null = null;
  protected hazardOverlays: Phaser.GameObjects.GameObject[] = [];
  protected terrainGrid: TerrainGrid | null = null;
  protected discoveredWaypoints = new Set<string>();
  protected premium = false;
  protected atmosphere: AtmosphereHandles | null = null;
  protected isoCamera: IsoCameraController | null = null;
  protected emoteVisual: EmoteVisualHandle | null = null;
  protected petEmoteVisual: EmoteVisualHandle | null = null;
  protected unsubEmoteBus: (() => void) | null = null;
  protected petEquipmentLayers: PetEquipmentLayerManager | null = null;
  protected unsubPetAppearance: (() => void) | null = null;
  protected petSelected = false;
  /** Runtime solids (blueprint solids + locked portal seals). */
  protected runtimeSolids: CollisionRect[] = [];
  protected transitionZones: CollisionRect[] = [];
  protected playableBounds!: PlayableBounds;
  protected entryPortalId?: string;
  protected lastTransitionAt = 0;
  protected lastSealBumpAt = 0;
  protected sealVisuals: Phaser.GameObjects.GameObject[] = [];
  protected transitionDwellId: string | null = null;
  protected transitionDwellSince = 0;
  /** Floating hub / POI / NPC nameplates with collision-aware layout. */
  protected worldNameplates: {
    id: string;
    kind: NameplateKind;
    text: Phaser.GameObjects.Text;
    getAnchor: () => { x: number; y: number };
    baseAlpha: number;
    isActive?: () => boolean;
  }[] = [];
  protected nameplateSolveState: NameplateSolveState = createNameplateSolveState();
  protected hubLabelSet = new Set(
    REST_HUB_CATALOG.map((h) => h.label.trim().toLowerCase()),
  );
  /** Premium occluders (buildings, trees, docks) for 2.5D roof/canopy fade. */
  protected occluders: Occluder[] = [];
  /** Soft directional contact shadows under Keeper / companion. */
  protected playerShadow: Phaser.GameObjects.Ellipse | null = null;
  protected petShadow: Phaser.GameObjects.Ellipse | null = null;

  constructor(key: string) {
    super({ key });
  }

  init(data: RegionSceneInit): void {
    this.bridge = data.bridge;
    this.regionSlug = data.regionSlug;
    this.entryPortalId = data.entryPortalId;
  }

  create(): void {
    const loaded = loadMap(this.regionSlug);
    this.blueprint = loaded.blueprint;
    this.playableBounds = playableBoundsFromBlueprint(this.blueprint);
    this.premium = isPremiumRegion(this.regionSlug);
    const region = REGION_BY_SLUG[this.regionSlug];
    const palette = region?.tilePalette ?? {
      ground: 0x4a9e4a,
      path: 0xb89460,
      accent: 0xc4a882,
    };

    this.ensureTileTextures(palette);
    this.drawGround(palette);
    this.drawZones();
    if (this.premium) {
      const gfx = resolveGraphicsQuality(loadImmersiveSettings().graphicsQuality);
      const propSpawn = spawnPremiumProps(this, this.blueprint, gfx.propBudget);
      this.occluders.push(...propSpawn.occluders);
      drawCityWallVisuals(this, this.blueprint);
      drawTownStreetFurniture(this, this.blueprint, gfx.propBudget);
    }
    this.solidGroup = this.physics.add.staticGroup();
    this.buildColliders();
    this.spawnWorldObjects(loaded.blueprint.objects);
    if (this.premium) {
      // Re-collect after buildings spawn so facades join tree/dock occluders
      this.occluders = collectOccluders(this);
    }

    const spawn = this.resolveSpawn();
    const playerTex = this.textures.exists(actorTex("player-keeper"))
      ? actorTex("player-keeper")
      : "player-avatar";
    const petTex = this.textures.exists(actorTex("pet-riftling"))
      ? actorTex("pet-riftling")
      : "pet-companion";
    this.player = this.physics.add.sprite(spawn.x, spawn.y, playerTex);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(depthAt(DEPTH.actor, spawn.y));
    this.player.setOrigin(0.5, 1);
    this.player.setVisible(true);
    this.player.setAlpha(1);
    if (playerTex.startsWith("pw-actor-")) {
      // +20% vs prior pass — Keeper reads clearly at default camera zoom.
      this.player.setDisplaySize(KEEPER_DISPLAY.w, KEEPER_DISPLAY.h);
      const body = this.player.body as Phaser.Physics.Arcade.Body;
      body.setSize(20, 18);
      body.setOffset((this.player.width - 20) / 2, this.player.height - 18);
    } else {
      this.player.setCircle(12, 4, 4);
    }
    (this.player.body as Phaser.Physics.Arcade.Body).allowGravity = false;

    this.pet = this.physics.add.sprite(spawn.x - 36, spawn.y + 8, petTex);
    this.pet.setDepth(depthAt(DEPTH.actor, spawn.y + 8, -0.2));
    this.pet.setOrigin(0.5, 1);
    this.pet.setVisible(true);
    this.pet.setAlpha(1);
    if (petTex.startsWith("pw-actor-")) {
      this.pet.setDisplaySize(PET_DISPLAY.w, PET_DISPLAY.h);
      const body = this.pet.body as Phaser.Physics.Arcade.Body;
      body.setSize(16, 14);
      body.setOffset((this.pet.width - 16) / 2, this.pet.height - 14);
    } else {
      this.pet.setCircle(8, 4, 4);
    }
    (this.pet.body as Phaser.Physics.Arcade.Body).allowGravity = false;

    if (this.premium) {
      const pShadow = actorContactShadow(KEEPER_DISPLAY.w, KEEPER_DISPLAY.h, "keeper");
      this.playerShadow = addContactShadow(
        this,
        spawn.x + pShadow.offsetX,
        spawn.y + pShadow.offsetY,
        pShadow.width,
        pShadow.height,
        pShadow.alpha,
      );
      const cShadow = actorContactShadow(PET_DISPLAY.w, PET_DISPLAY.h, "pet");
      this.petShadow = addContactShadow(
        this,
        spawn.x - 36 + cShadow.offsetX,
        spawn.y + 8 + cShadow.offsetY,
        cShadow.width,
        cShadow.height,
        cShadow.alpha,
      );
    }

    this.petEquipmentLayers = new PetEquipmentLayerManager(this, this.pet);
    this.pet.setInteractive({ useHandCursor: true, pixelPerfect: false });
    this.pet.on("pointerdown", () => this.openPetContextMenu());
    this.unsubPetAppearance = this.bridge.petAppearance.subscribe((snap) => {
      this.petEquipmentLayers?.applyAppearance(snap);
      if (snap) this.broadcastAppearanceStub(snap);
    });

    this.unsubEmoteBus = this.bridge.emotes.bus.subscribe((ev) => this.onEmoteBus(ev));
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.unsubEmoteBus?.();
      this.unsubEmoteBus = null;
      this.unsubPetAppearance?.();
      this.unsubPetAppearance = null;
      this.petEquipmentLayers?.destroy();
      this.petEquipmentLayers = null;
      this.emoteVisual?.destroy();
      this.petEmoteVisual?.destroy();
    });

    const { width, height } = this.blueprint.camera;
    this.physics.world.setBounds(0, 0, width, height);
    this.physics.add.collider(this.player, this.solidGroup);
    this.physics.add.collider(this.pet, this.solidGroup);

    this.isoCamera = attachIsoCamera(this, width, height, this.premium, (z) => {
      this.bridge.cameraZoom.set(z);
    });
    this.isoCamera.bindPlayer(this.player);

    if (this.premium) {
      this.atmosphere = createAtmosphere(this, this.regionSlug, width, height);
    }

    this.bindInput();
    this.bridge.setInteractionResolver((optionId) => this.resolveInteraction(optionId));
    this.bridge.loadingProgress.set(1);
    this.bridge.ready.set(true);
    void this.bootstrapConnection();
    void this.startRegionAudio();
    this.onRegionEntered();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.bridge.setInteractionResolver(null);
      this.persistPosition();
      void import("@/game/live-world/persistence/server-sync").then(
        ({ syncAutosave, notifyServerDisconnect }) => {
          if (this.player) {
            void syncAutosave({
              mapId: this.regionSlug,
              x: Math.round(this.player.x),
              y: Math.round(this.player.y),
              force: true,
            });
          }
          void notifyServerDisconnect();
        },
      );
      this.mp.disconnect();
      positionalAudio.clear();
      stopAmbient(500);
      this.atmosphere?.destroy();
      this.atmosphere = null;
      this.isoCamera?.destroy();
      this.isoCamera = null;
    });
  }

  /** Gateway activation + one-time discovery rewards on physical arrival. */
  protected onRegionEntered(): void {
    const activation = activateGatewayOnVisit(this.regionSlug);
    const discovery = grantRegionDiscoveryRewards(this.regionSlug);
    if (activation.activated) {
      grantGatewayActivationRewards(activation.gatewayId);
      playTravelSfx("gateway_activate");
      if (activation.cinematicStub === "gateway_activation") {
        this.bridge.dialogue.set({
          speaker: "Gateway Stone",
          lines: [
            `${REGION_BY_SLUG[this.regionSlug]?.name ?? "This region"}'s Gateway Stone awakens.`,
            "Fast travel unlocks from the world map (M) between activated stones.",
            discovery.firstVisit && discovery.rewards.length
              ? discovery.rewards.map((r) => r.label).join(" · ")
              : "The stone hums with riftlight.",
          ],
          lineIndex: 0,
        });
      }
    }
  }

  protected async startRegionAudio(): Promise<void> {
    await startRegionAmbient(this.regionSlug, 1400);
    await playRegionMusic(this.regionSlug, 1600);
    this.registerPositionalSources();
  }

  protected consumeBridgeTravelRequest(): void {
    const req = this.bridge.consumeTravelRequest();
    if (!req) return;
    this.travelTo(req.toRegionId, req.mode);
  }

  protected registerPositionalSources(): void {
    positionalAudio.clear();
    for (const o of this.blueprint.objects) {
      if (o.type === "portal") {
        void positionalAudio.upsert({
          id: `portal:${o.id}`,
          kind: "portal",
          x: o.x,
          y: o.y,
          radius: 220,
          peak: 0.55,
        });
      }
      if (o.type === "building") {
        const label = (o.label ?? o.id).toLowerCase();
        if (label.includes("forge") || label.includes("smith")) {
          void positionalAudio.upsert({
            id: `forge:${o.id}`,
            kind: "forge",
            x: o.x,
            y: o.y,
            radius: 180,
            peak: 0.5,
          });
        }
      }
    }
    for (const c of this.blueprint.colliders ?? []) {
      if (!isDeepWater(c) && c.kind !== "shallow_water") continue;
      void positionalAudio.upsert({
        id: `water:${c.x},${c.y}`,
        kind: "water",
        x: c.x + c.width / 2,
        y: c.y + c.height / 2,
        radius: Math.max(160, Math.min(c.width, c.height) * 0.8),
        peak: 0.45,
      });
    }
  }

  protected terrainKindAt(x: number, y: number): string | undefined {
    const grid = this.terrainGrid;
    if (!grid) return undefined;
    const col = Math.floor(x / grid.tileSize);
    const row = Math.floor(y / grid.tileSize);
    if (row < 0 || col < 0 || row >= grid.rows || col >= grid.cols) return undefined;
    return grid.cells[row]?.[col];
  }

  update(time: number): void {
    if (!this.player?.body) return;

    this.syncUiHotkeys();
    this.updateCollisionDebug();
    this.consumeBridgeTravelRequest();

    if (this.bridge.dialogue.get() || this.bridge.interactionMenu.get()) {
      this.player.setVelocity(0, 0);
      this.pet.setVelocity(0, 0);
      this.handleDialogueAdvance();
      this.publishPose(false);
      return;
    }

    this.applyMovement();
    this.bridge.emotes.tick(time);
    this.trackMovementQuest();
    this.updatePetFollow();
    this.containPetToBounds();
    this.tickLivingNpcAi(time);
    this.updateAmbientNpcs(time);
    this.updateWorldNameplates();
    this.updateNearest();
    this.syncNearbyNpcForEmotes();
    this.handleInteract();
    this.handleTransitionZones(time);
    this.handleEnemyZones(time);
    this.pulsePortals(time);
    this.markExploration(time);
    this.updatePremiumPresentation(time);
    this.maybePlayCompanionIdleCry(time);

    if (time - this.lastSaveAt > SAVE_INTERVAL_MS) {
      this.lastSaveAt = time;
      this.persistPosition();
      this.mp.sendMove({ x: this.player.x, y: this.player.y });
    }
  }

  /** Soft chance chirp while companion follows — pet bus only, never music. */
  protected maybePlayCompanionIdleCry(time: number): void {
    if (time - this.lastPetIdleCryAt < 14_000) return;
    const body = this.player.body as Phaser.Physics.Arcade.Body | undefined;
    const moving = !!body && (Math.abs(body.velocity.x) + Math.abs(body.velocity.y) > 8);
    if (moving) return;
    this.lastPetIdleCryAt = time;
    if (Math.random() < 0.35) {
      playCompanionCry({ mood: "idle", gainScale: 0.7 });
    }
  }

  protected updatePremiumPresentation(time: number): void {
    if (!this.premium) return;
    this.atmosphere?.update(time, this.cameras.main);
    // Idle breathing / bob for Keeper + companion when standing still
    const body = this.player.body as Phaser.Physics.Arcade.Body | undefined;
    const moving = !!body && (Math.abs(body.velocity.x) + Math.abs(body.velocity.y) > 8);
    if (this.player.texture.key.startsWith("pw-actor-")) {
      const breath = moving ? 1 : 1 + Math.sin(time / 480) * 0.03;
      this.player.setDisplaySize(
        KEEPER_DISPLAY.w * breath,
        KEEPER_DISPLAY.h * (moving ? 1 : breath),
      );
    }
    if (this.pet.texture.key.startsWith("pw-actor-")) {
      const petBreath = 1 + Math.sin(time / 420 + 1.2) * 0.045;
      this.pet.setDisplaySize(
        PET_DISPLAY.w * petBreath,
        PET_DISPLAY.h * (moving ? 1 : petBreath),
      );
    }
    // Ground-anchor shadows follow feet (directional afternoon bias)
    if (this.playerShadow) {
      const s = actorContactShadow(KEEPER_DISPLAY.w, KEEPER_DISPLAY.h, "keeper");
      this.playerShadow.setPosition(
        this.player.x + s.offsetX,
        this.player.y + s.offsetY,
      );
      this.playerShadow.setDepth(depthAt(DEPTH.groundShadow, this.player.y));
    }
    if (this.petShadow) {
      const s = actorContactShadow(PET_DISPLAY.w, PET_DISPLAY.h, "pet");
      this.petShadow.setPosition(this.pet.x + s.offsetX, this.pet.y + s.offsetY);
      this.petShadow.setDepth(depthAt(DEPTH.groundShadow, this.pet.y));
    }
    // Y-sort actors by ground anchor (footY) so they pass behind/in front of structures
    this.player.setDepth(depthAt(DEPTH.actor, this.player.y));
    this.pet.setDepth(depthAt(DEPTH.actor, this.pet.y, -0.2));
    this.petEquipmentLayers?.syncPositions();
    for (const it of this.interactables) {
      if (it.kind === "npc" && it.sprite) {
        it.sprite.setDepth(depthAt(DEPTH.actor, it.sprite.y, -0.5));
        it.nameLabel?.setDepth(depthAt(DEPTH.nameplate, it.sprite.y));
      }
    }
    // 2.5D occlusion — roofs, tree canopies, docks fade when player walks behind
    if (this.occluders.length > 0) {
      updateOccluderFades(this.occluders, this.player.x, this.player.y);
    }
  }

  protected syncUiHotkeys(): void {
    const input = getInputManager();
    if (input.wasJustPressed("openMap")) {
      const ui = this.bridge.mapUi.get();
      if (ui.open) this.bridge.closeWorldMap();
      else this.bridge.openWorldMap("region", this.regionSlug);
    }
    if (input.wasJustPressed("escape") && this.bridge.mapUi.get().open) {
      this.bridge.closeWorldMap();
    }
    if (input.wasJustPressed("escape") && this.bridge.interactionMenu.get()) {
      this.bridge.interactionMenu.set(null);
      // Keep panel state in sync — a leftover modalOpen zeroes WASD desire.
      input.closePanel();
    }
    if (input.wasJustPressed("escape") && this.bridge.emoteUi.get().mode !== "closed") {
      this.bridge.closeEmoteUi();
    }
    if (input.wasJustPressed("zoomIn")) {
      this.isoCamera?.setZoomDelta(ZOOM_STEP);
    }
    if (input.wasJustPressed("zoomOut")) {
      this.isoCamera?.setZoomDelta(-ZOOM_STEP);
    }
    const queuedZoom = this.bridge.consumeZoomDelta();
    if (queuedZoom !== 0) {
      this.isoCamera?.setZoomDelta(queuedZoom);
    }
    const focus = this.bridge.consumeCameraFocus();
    if (focus === "riftling" && this.pet) {
      this.isoCamera?.bindFollow(this.pet);
      this.isoCamera?.setSmoothFollow(true);
    } else if (focus === "player" && this.player) {
      this.isoCamera?.bindFollow(this.player);
      this.isoCamera?.setSmoothFollow(this.bridge.photoMode.get() || this.bridge.cinematicMode.get());
    } else if (focus === "free") {
      this.isoCamera?.setSmoothFollow(true);
    }
    this.isoCamera?.setSmoothFollow(
      this.bridge.photoMode.get() || this.bridge.cinematicMode.get(),
    );
    this.bridge.collisionDebug.set(input.isCollisionDebug());
  }

  protected syncNearbyNpcForEmotes(): void {
    if (this.nearest?.kind === "npc") {
      this.bridge.emotes.setNearbyNpc(this.nearest.npcSlug);
    } else {
      this.bridge.emotes.setNearbyNpc(null);
    }
  }

  protected onEmoteBus(ev: EmoteBusEvent): void {
    if (!featureFlagDefaults.LIVE_WORLD_EMOTES_ENABLED) return;
    if (ev.type === "play") {
      if (ev.payload.actorKind === "player" || ev.payload.actorId === "local-player") {
        this.emoteVisual?.destroy();
        this.emoteVisual = playEmoteVisual(this, this.player, ev.payload);
        this.mp.sendEmote({
          emoteKey: ev.payload.emoteKey,
          actorId: ev.payload.actorId,
          targetId: ev.payload.targetId,
          at: ev.payload.at,
        });
      }
    }
    if (ev.type === "pet_react") {
      this.petEmoteVisual?.destroy();
      this.petEmoteVisual = playEmoteVisual(this, this.pet, {
        emoteKey: ev.payload.emoteKey,
        actorId: "local-pet",
        actorKind: "pet",
        at: ev.payload.at,
        source: "reaction",
        reducedMotion: ev.payload.mood === "tired",
      });
      const mood =
        ev.payload.mood === "joyful" || ev.payload.mood === "bonded"
          ? "happy"
          : ev.payload.mood === "tired" || ev.payload.mood === "stressed"
            ? "idle"
            : "cry";
      playCompanionCry({ mood });
      this.lastPetIdleCryAt = this.time.now;
    }
    if (ev.type === "npc_react") {
      const npc = this.interactables.find(
        (it) => it.kind === "npc" && it.npcSlug === ev.payload.npcSlug,
      );
      if (npc?.kind === "npc" && npc.sprite) {
        playEmoteVisual(this, npc.sprite, {
          emoteKey: ev.payload.emoteKey,
          actorId: npc.npcSlug,
          actorKind: "npc",
          at: ev.payload.at,
          source: "reaction",
        });
        if (ev.payload.line) {
          this.bridge.chat.send("nearby", ev.payload.line, { from: npc.name });
          this.bridge.bumpChat();
        }
      }
    }
    if (ev.type === "cancel" && ev.payload.actorId === "local-player") {
      this.emoteVisual?.destroy();
      this.emoteVisual = null;
    }
  }

  protected markExploration(time: number): void {
    if (time - this.lastFogAt < FOG_MARK_INTERVAL_MS) return;
    this.lastFogAt = time;
    markVisited(this.regionSlug, this.player.x, this.player.y);
    const newlyFound = tryDiscoverNearby(
      this.regionSlug,
      this.player.x,
      this.player.y,
    );
    if (newlyFound.length > 0) {
      playSfx("ui.waypoint");
    }
    for (const o of this.blueprint.objects) {
      if (o.type !== "waypoint" && o.type !== "building") continue;
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, o.x, o.y);
      if (d < 96) {
        if (o.type === "waypoint") {
          if (!this.discoveredWaypoints.has(o.id)) {
            this.discoveredWaypoints.add(o.id);
            playSfx("ui.waypoint");
          }
          discoverWaypoint(this.regionSlug, o.id);
        } else discoverLandmark(this.regionSlug, o.id);
      }
    }
  }

  protected updateCollisionDebug(): void {
    const on = this.bridge.collisionDebug.get();
    if (!on) {
      this.debugGfx?.clear();
      return;
    }
    if (!this.debugGfx) {
      this.debugGfx = this.add.graphics().setDepth(50);
    }
    this.debugGfx.clear();
    const boxes = [
      ...this.runtimeSolids,
      ...this.transitionZones.filter(
        (t) => !this.runtimeSolids.some((s) => s.id === t.id),
      ),
    ];
    for (const box of boxes) {
      const color =
        box.kind === "water" || box.kind === "deep_water"
          ? 0x4488ff
          : box.kind === "shallow_water"
            ? 0x66aacc
            : box.kind === "lava"
              ? 0xff5522
              : box.kind === "cliff"
                ? 0xaaaa66
                : box.kind === "transition"
                  ? 0x3de7ff
                  : box.kind === "seal" || box.kind === "blocker"
                    ? 0xffb84d
                    : 0xff00ff;
      this.debugGfx.lineStyle(
        box.kind === "transition" ? 2 : 1,
        color,
        box.kind === "transition" ? 0.95 : 0.85,
      );
      this.debugGfx.strokeRect(box.x, box.y, box.width, box.height);
    }
    // Playable inset
    const b = this.playableBounds;
    this.debugGfx.lineStyle(1, 0x88ff88, 0.45);
    this.debugGfx.strokeRect(b.minX, b.minY, b.width, b.height);
  }

  protected publishPose(running: boolean): void {
    this.bridge.playerPose.set({
      x: this.player.x,
      y: this.player.y,
      facingRad: this.facingRad,
      regionSlug: this.regionSlug,
      running,
    });
  }

  private movedOnce = false;
  private lastFootstepAt = 0;
  private lastNpcWorkAt = 0;
  private lastLivingAiAt = 0;
  private livingAiBucket = 0;

  protected tickLivingNpcAi(time: number): void {
    if (time - this.lastLivingAiAt < 280) return;
    this.lastLivingAiAt = time;
    this.livingAiBucket = (this.livingAiBucket + 1) % 8;

    const play = syncKillerReputation(loadLivePlayState());
    const actors: LivingNpcActor[] = [];
    for (const it of this.interactables) {
      if (it.kind !== "npc") continue;
      actors.push({
        npcSlug: it.npcSlug,
        name: it.name,
        x: it.x,
        y: it.y,
        homeX: it.homeX,
        homeY: it.homeY,
        behavior: it.behavior,
        spawnHomeX: it.spawnHomeX,
        spawnHomeY: it.spawnHomeY,
        attention: it.attention ?? null,
        present: it.present !== false,
        fleeUntil: it.fleeUntil,
        lastKillerNoticeAt: it.lastKillerNoticeAt,
        lastSocialNoticeAt: it.lastSocialNoticeAt,
      });
    }

    const clock = resolveLivingWorldClock(Date.now());
    const result = tickLivingNpcs(actors, {
      now: Date.now(),
      dayPhase: clock.dayPhase,
      weather: clock.weather,
      playerX: this.player.x,
      playerY: this.player.y,
      killer: killerFromPlayState(play),
      regionId: this.regionSlug ?? "riftwild-commons",
      combatNearby: time - this.lastCombatAt < 6000,
      tickBucket: this.livingAiBucket,
      cullDistance: 520,
    });

    const bySlug = new Map(result.actors.map((a) => [a.npcSlug, a]));
    for (const it of this.interactables) {
      if (it.kind !== "npc") continue;
      const next = bySlug.get(it.npcSlug);
      if (!next) continue;
      it.homeX = next.homeX;
      it.homeY = next.homeY;
      it.behavior = next.behavior;
      it.present = next.present;
      it.attention = next.attention;
      it.fleeUntil = next.fleeUntil;
      it.lastKillerNoticeAt = next.lastKillerNoticeAt;
      it.lastSocialNoticeAt = next.lastSocialNoticeAt;
      if (it.sprite) {
        it.sprite.setVisible(next.present);
        it.sprite.body && ((it.sprite.body as Phaser.Physics.Arcade.Body).enable = next.present);
      }
      it.nameLabel?.setVisible(next.present);
      this.syncNpcIndicator(it);
    }

    if (result.ambientChat) {
      const speaker = this.interactables.find(
        (x) => x.kind === "npc" && x.npcSlug === result.ambientChat!.speakerSlug,
      );
      const name = speaker && speaker.kind === "npc" ? speaker.name : "Keeper";
      this.bridge.chat.send("nearby", result.ambientChat.line, { from: name });
      this.bridge.bumpChat();
    }
    for (const line of result.ambientLines.slice(0, 1)) {
      const speaker = this.interactables.find(
        (x) => x.kind === "npc" && x.npcSlug === line.npcSlug,
      );
      if (speaker?.kind === "npc") {
        this.bridge.chat.send("nearby", line.line, { from: speaker.name });
        this.bridge.bumpChat();
      }
    }
    const socialOrKiller = [
      ...result.socialReactions.map((s) => ({
        npcSlug: s.npcSlug,
        line: s.reaction.lines[0],
      })),
      ...result.killerReactions.map((k) => ({
        npcSlug: k.npcSlug,
        line: k.reaction.lines[0],
      })),
    ].slice(0, 2);
    for (const kr of socialOrKiller) {
      if (!kr.line) continue;
      const speaker = this.interactables.find(
        (x) => x.kind === "npc" && x.npcSlug === kr.npcSlug,
      );
      if (speaker?.kind === "npc") {
        this.bridge.chat.send("nearby", kr.line, { from: speaker.name });
        this.bridge.bumpChat();
      }
    }

  }

  protected syncNpcIndicator(it: Extract<Interactable, { kind: "npc" }>): void {
    const att = it.attention;
    const active = it.present !== false && att?.active && att.kind !== "none";
    if (!active) {
      it.indicator?.setVisible(false);
      return;
    }
    const tex =
      ATTENTION_TEXTURE_KEY[att.kind as keyof typeof ATTENTION_TEXTURE_KEY];
    if (!tex || !this.textures.exists(tex)) {
      if (!it.indicator) {
        const g = this.add.circle(it.x, it.y - 56, 7, 0xffb84d, 0.95);
        g.setDepth(12);
        it.indicator = g;
      }
      it.indicator.setVisible(true);
      it.indicator.setPosition(it.x, it.y - npcDisplayHeight(it.npcSlug) - 18);
      return;
    }
    if (!it.indicator || it.indicator.texture?.key !== tex) {
      it.indicator?.destroy();
      const img = this.add
        .image(it.x, it.y - 56, tex)
        .setDisplaySize(22, 28)
        .setDepth(12)
        .setOrigin(0.5, 1);
      it.indicator = img;
    }
    const bob = att.waved ? Math.sin(this.time.now / 200) * 3 : 0;
    it.indicator.setVisible(true);
    it.indicator.setPosition(
      it.sprite?.x ?? it.x,
      (it.sprite?.y ?? it.y) - npcDisplayHeight(it.npcSlug) - 14 + bob,
    );
  }

  protected trackMovementQuest(): void {
    if (!this.player) return;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const speed = Math.abs(body.velocity.x) + Math.abs(body.velocity.y);
    const moving = speed >= 10;
    const running = speed >= RUN_SPEED * 0.85;
    if (moving) {
      const now = this.time.now;
      const interval = running ? 220 : 280;
      if (now - this.lastFootstepAt > interval) {
        this.lastFootstepAt = now;
        playFootstep({
          terrainKind: this.terrainKindAt(this.player.x, this.player.y),
          regionSlug: this.regionSlug,
          running,
        });
      }
      positionalAudio.setListener(this.player.x, this.player.y);
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
      if (it.present === false) {
        it.indicator?.setVisible(false);
        continue;
      }
      const phase = it.homeX * 0.01 + it.homeY * 0.007;
      const bob = Math.sin(time / 380 + phase) * 2.4;
      const weightShift = Math.sin(time / 900 + phase * 1.7) * 1.2;
      const breath = 1 + Math.sin(time / 520 + phase) * 0.025;
      const d = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        it.sprite.x,
        it.sprite.y,
      );
      const amp = npcWanderAmplitude(it.behavior);
      const movingBehavior = isMovingNpcBehavior(it.behavior) && amp > 0;
      const ambient = isAmbientActivityBehavior(it.behavior);
      let walking = false;

      if (d < 90) {
        // Face player when nearby — soft pause, keep breathing / tiny shuffle
        it.sprite.setFlipX(this.player.x < it.sprite.x);
        it.sprite.x =
          it.homeX +
          weightShift * 0.35 +
          (movingBehavior ? Math.sin(time / 1400 + it.homeY) * (amp * 0.2) : 0);
        it.sprite.y = it.homeY + bob * 0.4;
      } else if (movingBehavior) {
        // Two-axis wander so patrols don't look like a sine-rail
        const wanderX = Math.sin(time / 1100 + phase) * amp;
        const wanderY =
          Math.cos(time / 1450 + phase * 0.8) * (amp * (ambient ? 0.35 : 0.55));
        const prevX = it.lastX ?? it.sprite.x;
        const prevY = it.lastY ?? it.sprite.y;
        let nx = it.homeX + wanderX + weightShift * 0.25;
        let ny = it.homeY + wanderY + bob;
        const contained = clampEntityToNav(nx, ny, {
          homeX: it.homeX,
          homeY: it.homeY,
          leashRadius: Math.max(amp + 8, defaultLeashRadius(it.behavior)),
          bounds: this.playableBounds,
          solids: this.runtimeSolids,
        });
        nx = contained.x;
        ny = contained.y;
        it.sprite.x = nx;
        it.sprite.y = ny;
        const dx = it.sprite.x - prevX;
        const dy = it.sprite.y - prevY;
        if (Math.hypot(dx, dy) > 0.08) {
          it.sprite.setFlipX(dx < 0);
          walking = true;
        }
        it.lastX = it.sprite.x;
        it.lastY = it.sprite.y;
      } else {
        // Rooted idle — still breathe + weight shift (never frozen)
        const rooted = clampEntityToNav(
          it.homeX + weightShift,
          it.homeY + bob,
          {
            homeX: it.homeX,
            homeY: it.homeY,
            leashRadius: defaultLeashRadius(it.behavior),
            bounds: this.playableBounds,
            solids: this.runtimeSolids,
          },
        );
        it.sprite.x = rooted.x;
        it.sprite.y = rooted.y;
        // Occasional look-around flip
        if (Math.sin(time / 2800 + phase) > 0.92) {
          it.sprite.setFlipX(true);
        } else if (Math.sin(time / 2800 + phase) < -0.92) {
          it.sprite.setFlipX(false);
        }
      }

      const baseH = npcDisplayHeight(it.npcSlug);
      // Sheets are square frames with bottom-centered figures — keep square display
      const h = baseH * (walking ? 1 : breath);
      it.sprite.setDisplaySize(h, h);
      it.sprite.setDepth(depthAt(DEPTH.actor, it.sprite.y, -0.5));

      const idleKey = npcIdleAnimKey(it.npcSlug);
      const walkKey = npcWalkAnimKey(it.npcSlug);
      if (walking && this.anims.exists(walkKey)) {
        if (it.sprite.anims.currentAnim?.key !== walkKey) {
          it.sprite.anims.play(walkKey, true);
        }
      } else if (this.anims.exists(idleKey)) {
        if (it.sprite.anims.currentAnim?.key !== idleKey) {
          it.sprite.anims.play(idleKey, true);
        }
      }

      it.x = it.sprite.x;
      it.y = it.sprite.y;
      // Nameplate position / fade / deconflict handled by updateWorldNameplates().
      if (it.nameLabel) {
        it.nameLabel.setDepth(depthAt(DEPTH.nameplate, it.sprite.y));
      }

      // Occasional work stub when a working NPC is near the player
      if (
        (walking || ambient) &&
        d < 140 &&
        time - this.lastNpcWorkAt > 4200 &&
        (it.behavior === "work" ||
          it.behavior === "patrol" ||
          it.behavior === "craft" ||
          it.behavior === "tend_eggs" ||
          it.behavior === "forge")
      ) {
        this.lastNpcWorkAt = time;
        playSfx("world.npc_work");
      }

      if (it.attention?.active) {
        this.syncNpcIndicator(it);
      }
    }
  }

  protected ensureTileTextures(palette: {
    ground: number;
    path: number;
    accent: number;
    hazard?: number;
    water?: number;
  }): void {
    const make = (key: string, color: number) => {
      if (this.textures.exists(key)) return;
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(color, 1);
      g.fillRoundedRect(0, 0, 32, 32, 2);
      // Subtle grain so flats aren't empty voids
      g.fillStyle(0xffffff, 0.04);
      g.fillRect(4, 4, 6, 6);
      g.fillRect(18, 14, 8, 4);
      g.generateTexture(key, 32, 32);
      g.destroy();
    };
    const kinds = [
      "ground",
      "path",
      "safe",
      "accent",
      "settlement",
      "water",
      "lava",
      "cliff",
      "hazard",
      "danger",
    ] as const;
    for (const kind of kinds) {
      make(
        `tile-${kind}-${this.regionSlug}`,
        terrainColor(kind, palette),
      );
    }
  }

  protected drawGround(palette: {
    ground: number;
    path: number;
    accent: number;
    hazard?: number;
    water?: number;
  }): void {
    if (this.premium) {
      const result = drawPremiumTerrain(
        this,
        this.blueprint,
        (kind: TerrainCellKind) => `tile-${kind}-${this.regionSlug}`,
      );
      this.terrainGrid = result.grid;
      return;
    }

    const grid = paintTerrainGrid(this.blueprint);
    this.terrainGrid = grid;
    const T = grid.tileSize;
    for (let row = 0; row < grid.rows; row++) {
      for (let col = 0; col < grid.cols; col++) {
        const kind = grid.cells[row]![col]!;
        const x = col * T + T / 2;
        const y = row * T + T / 2;
        const master =
          kind === "water" && this.textures.exists("terrain-water")
            ? "terrain-water"
            : kind === "lava" && this.textures.exists("terrain-lava")
              ? "terrain-lava"
              : kind === "path" && this.textures.exists("terrain-path")
                ? "terrain-path"
                : (kind === "ground" || kind === "danger") &&
                    this.textures.exists("terrain-grass")
                  ? "terrain-grass"
                  : `tile-${kind}-${this.regionSlug}`;
        this.add.image(x, y, master).setDisplaySize(T, T).setDepth(0);
      }
    }

    // Road edge polish along pathways
    for (const path of this.blueprint.pathways) {
      const g = this.add.graphics();
      g.lineStyle(10, palette.path, 0.35);
      const pts = path.waypoints;
      if (pts.length >= 2) {
        g.beginPath();
        g.moveTo(pts[0]!.x, pts[0]!.y);
        for (let i = 1; i < pts.length; i++) g.lineTo(pts[i]!.x, pts[i]!.y);
        g.strokePath();
      }
      g.setDepth(1);
    }

    // Landmark scatter labels (hidden on premium — props carry the world feel)
    for (const lm of landmarkScatterSeed(
      this.regionSlug,
      this.blueprint.cols,
      this.blueprint.rows,
    )) {
      const x = lm.col * T + T / 2;
      const y = lm.row * T + T / 2;
      const ring = this.add.graphics();
      ring.lineStyle(2, lm.color, 0.45);
      ring.strokeCircle(x, y, 22);
      ring.setDepth(2);
      const lmText = this.add
        .text(x, y - 28, lm.label, {
          fontFamily: "Manrope, sans-serif",
          fontSize: "10px",
          color: "#d8e8f8",
        })
        .setOrigin(0.5)
        .setDepth(3)
        .setAlpha(0.75);
      this.registerWorldNameplate({
        id: `landmark:${this.regionSlug}:${lm.col},${lm.row}`,
        kind: "landmark",
        text: lmText,
        getAnchor: () => ({ x, y: y - 28 }),
        baseAlpha: 0.75,
      });
    }

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
          "PARTIAL MAP — enterable stub",
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
    // Premium Commons: no debug zone rectangles — atmosphere + props carry districts.
    if (!this.premium) {
      for (const z of this.blueprint.zones) {
        if (z.kind === "safe" || z.kind === "settlement") {
          const g = this.add.graphics();
          g.lineStyle(1, 0x3de7ff, 0.15);
          g.strokeRect(z.x, z.y, z.width, z.height);
          g.setDepth(1);
        }
      }
    }
    if (this.blueprint.portalHub) {
      const hub = this.blueprint.portalHub;
      if (this.premium && this.textures.exists("pw-building-portal-circle")) {
        const facade = this.add.image(hub.x, hub.y + hub.radius * 0.15, "pw-building-portal-circle");
        facade.setOrigin(0.5, 0.55);
        facade.setDisplaySize(hub.radius * 1.8, hub.radius * 1.35);
        facade.setDepth(1.05);
        facade.setAlpha(0.92);
      }
      const ring = this.add.graphics();
      ring.lineStyle(this.premium ? 2 : 3, 0x3de7ff, this.premium ? 0.28 : 0.4);
      ring.strokeCircle(hub.x, hub.y, hub.radius);
      ring.setDepth(1);
      if (this.premium) {
        // Soft portal glow disc
        const glow = this.add.circle(hub.x, hub.y, hub.radius * 0.55, 0x3de7ff, 0.08);
        glow.setDepth(1.1);
        this.tweens.add({
          targets: glow,
          alpha: { from: 0.06, to: 0.16 },
          scale: { from: 0.95, to: 1.08 },
          duration: 1600,
          yoyo: true,
          repeat: -1,
        });
      }
    }
  }

  protected buildColliders(): void {
    const portals = this.blueprint.objects.filter((o) => o.type === "portal");
    const seals = lockedPortalSeals(portals, isPortalLocked);
    this.runtimeSolids = [
      ...solidColliders(this.blueprint.colliders),
      ...seals,
    ];
    this.transitionZones = collectTransitionZones(this.blueprint);

    for (const box of this.runtimeSolids) {
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

      // Locked portal seals — amber barrier marker (not a card UI)
      if (box.kind === "seal" || box.kind === "blocker") {
        const g = this.add.graphics();
        g.fillStyle(0xc9a46a, 0.35);
        g.fillRect(box.x, box.y, box.width, box.height);
        g.lineStyle(2, 0xffb84d, 0.7);
        g.strokeRect(box.x, box.y, box.width, box.height);
        g.setDepth(4);
        this.sealVisuals.push(g);
      }
    }

    // Water / lava visuals from authored colliders (includes non-solid shallow fords)
    for (const box of this.blueprint.colliders) {
      if (!isDeepWater(box) && box.kind !== "lava" && box.kind !== "shallow_water") {
        continue;
      }
      const g = this.add.graphics();
      const color =
        box.kind === "lava"
          ? 0xff5a1f
          : box.kind === "shallow_water"
            ? 0x3a7aaa
            : 0x2a6aaa;
      const isWaterish = box.kind !== "lava";
      if (this.premium) {
        g.fillStyle(color, isWaterish ? 0.12 : 0.18);
        g.fillRect(box.x, box.y, box.width, box.height);
      } else {
        g.fillStyle(color, isWaterish ? 0.35 : 0.4);
        g.fillRect(box.x, box.y, box.width, box.height);
        g.lineStyle(1, 0xffffff, 0.2);
        g.strokeRect(box.x, box.y, box.width, box.height);
      }
      g.setDepth(1);
      this.hazardOverlays.push(g);
    }
  }

  protected registerWorldNameplate(params: {
    id: string;
    kind: NameplateKind;
    text: Phaser.GameObjects.Text;
    getAnchor: () => { x: number; y: number };
    baseAlpha?: number;
    isActive?: () => boolean;
  }): Phaser.GameObjects.Text {
    this.worldNameplates.push({
      id: params.id,
      kind: params.kind,
      text: params.text,
      getAnchor: params.getAnchor,
      baseAlpha: params.baseAlpha ?? 1,
      isActive: params.isActive,
    });
    return params.text;
  }

  /** Distance fade + collision-aware stacking for hub / POI / NPC labels. */
  protected updateWorldNameplates(): void {
    if (!this.player || this.worldNameplates.length === 0) return;

    const inputs = [];
    for (const np of this.worldNameplates) {
      if (np.isActive && !np.isActive()) {
        np.text.setVisible(false);
        np.text.setAlpha(0);
        continue;
      }
      const anchor = np.getAnchor();
      const w = Math.max(36, np.text.width || np.text.text.length * 6.5);
      const h = Math.max(12, np.text.height || 14);
      inputs.push({
        id: np.id,
        kind: np.kind,
        anchorX: anchor.x,
        anchorY: anchor.y,
        width: w,
        height: h,
        baseAlpha: np.baseAlpha,
      });
    }

    const { layouts, state } = solveNameplateLayout({
      playerX: this.player.x,
      playerY: this.player.y,
      labels: inputs,
      state: this.nameplateSolveState,
    });
    this.nameplateSolveState = state;

    const byId = new Map(layouts.map((l) => [l.id, l]));
    for (const np of this.worldNameplates) {
      if (np.isActive && !np.isActive()) continue;
      const layout = byId.get(np.id);
      if (!layout || !layout.visible) {
        np.text.setVisible(false);
        np.text.setAlpha(0);
        continue;
      }
      np.text.setPosition(layout.x, layout.y);
      np.text.setAlpha(layout.alpha);
      np.text.setVisible(layout.alpha > 0.05);
      np.text.setDepth(9.5 + layout.y * 0.01);
    }
  }

  protected spawnWorldObjects(objects: WorldMapObject[]): void {
    for (const o of objects) {
      if (o.type === "building" || (o.type === "decoration" && o.collision)) {
        const buildingSprite =
          this.premium && o.type === "building"
            ? trySpawnBuildingSprite(this, o)
            : null;
        const decoSprite =
          this.premium && o.type === "decoration"
            ? trySpawnDecorationSprite(this, o)
            : null;

        if (!buildingSprite && !decoSprite) {
          const g = this.add.graphics();
          const color = o.color ?? 0x6688aa;
          g.fillStyle(color, this.premium ? 0.35 : 0.55);
          g.fillRoundedRect(o.x, o.y, o.width ?? 64, o.height ?? 64, 8);
          g.lineStyle(2, 0xffffff, this.premium ? 0.15 : 0.3);
          g.strokeRoundedRect(o.x, o.y, o.width ?? 64, o.height ?? 64, 8);
          g.setDepth(3);
        }

        // Soft ground plaque under buildings — premium keeps them very quiet
        if (o.label && (!this.premium || o.type === "building")) {
          const labelY = this.premium
            ? o.y + (o.height ?? 64) + 6
            : o.y + (o.height ?? 64) / 2;
          const ax = o.x + (o.width ?? 64) / 2;
          const kind = classifyWorldLabel({
            type: o.type,
            label: o.label,
            interactive: o.interactive,
            hubLabels: this.hubLabelSet,
          });
          const plaque = this.add
            .text(ax, labelY, o.label, {
              fontFamily: "Manrope, sans-serif",
              fontSize: this.premium ? "9px" : "11px",
              color: this.premium ? "#d8e8f0" : "#ffffff",
              align: "center",
              wordWrap: { width: (o.width ?? 64) - 8 },
              stroke: this.premium ? "#0a1020" : undefined,
              strokeThickness: this.premium ? 2 : 0,
            })
            .setOrigin(0.5, this.premium ? 0 : 0.5)
            .setDepth(6)
            .setAlpha(this.premium ? 0.45 : 1);
          this.registerWorldNameplate({
            id: `building:${o.id}`,
            kind,
            text: plaque,
            getAnchor: () => ({ x: ax, y: labelY }),
            baseAlpha: this.premium ? 0.45 : 1,
          });
        }
        if (o.type === "building" && o.interactive) {
          const isAcademy =
            o.id.includes("academy") ||
            (o.label ?? "").toLowerCase().includes("academy") ||
            o.id.includes("library");
          this.interactables.push({
            kind: "building",
            id: o.id,
            label: o.label ?? o.id,
            lines: isAcademy
              ? [
                  `${o.label ?? "Academy"} — interactive tutorials and FAQ for Keepers.`,
                  "Choose Enter Academy to open the Player Academy. SOL is never required for basics.",
                ]
              : [
                  `${o.label ?? "Building"} — interior visits ship in a later phase.`,
                  "For now this marker marks the destination on the Live World map.",
                ],
            x: o.x + (o.width ?? 64) / 2,
            y: o.y + (o.height ?? 64),
          });
        }
      } else if (this.premium && o.type === "decoration") {
        trySpawnDecorationSprite(this, o);
      } else if (this.premium && o.type === "quest") {
        trySpawnDecorationSprite(this, o);
      }

      if (o.type === "npc") {
        const npcSlug = String(o.metadata?.npcId ?? o.id.replace(/^npc-/, ""));
        const sheetKey = npcSheetKey(npcSlug);
        const staticKey = `npc-${npcSlug}`;
        const textureKey = this.textures.exists(sheetKey)
          ? sheetKey
          : this.textures.exists(staticKey)
            ? staticKey
            : "npc-keeper";
        const sprite = this.physics.add.sprite(o.x, o.y, textureKey);
        const h = npcDisplayHeight(npcSlug);
        sprite.setOrigin(0.5, 1);
        sprite.setDisplaySize(h, h);
        sprite.setImmovable(true);
        sprite.setDepth(depthAt(DEPTH.actor, o.y));
        if (this.premium) {
          const sh = actorContactShadow(h, h, "npc");
          addContactShadow(
            this,
            o.x + sh.offsetX,
            o.y + sh.offsetY,
            sh.width,
            sh.height,
            sh.alpha,
          );
        }
        (sprite.body as Phaser.Physics.Arcade.Body).allowGravity = false;
        {
          const body = sprite.body as Phaser.Physics.Arcade.Body;
          const bw = Math.max(16, h * 0.45);
          const bh = Math.max(16, h * 0.55);
          body.setSize(bw, bh);
          body.setOffset((sprite.width - bw) / 2, sprite.height - bh);
        }
        if (this.anims.exists(npcIdleAnimKey(npcSlug))) {
          sprite.anims.play(npcIdleAnimKey(npcSlug));
        }
        const name = o.label ?? "Keeper";
        const nameLabel = this.add
          .text(o.x, o.y - h - 6, name, {
            fontFamily: "Manrope, sans-serif",
            fontSize: "11px",
            color: "#e8e0ff",
            stroke: "#0a1020",
            strokeThickness: 3,
          })
          .setOrigin(0.5, 1)
          .setDepth(9);
        const content = CONTENT_NPC_BY_ID[npcSlug];
        const lines = (o.metadata?.lines as string[]) ?? [
          "The keeper greets you warmly.",
        ];
        const npcEntry = {
          kind: "npc" as const,
          id: o.id,
          npcSlug,
          name,
          lines: lines.filter((l) => l && !/undefined|null|TODO/i.test(l)),
          x: o.x,
          y: o.y,
          sprite,
          nameLabel,
          homeX: o.x,
          homeY: o.y,
          spawnHomeX: o.x,
          spawnHomeY: o.y,
          behavior: String(
            o.metadata?.behavior ?? content?.ambientBehavior ?? "idle",
          ),
          lastX: o.x,
          lastY: o.y,
          present: true as boolean | undefined,
          attention: null as AttentionState | null,
        };
        this.interactables.push(npcEntry);
        this.registerWorldNameplate({
          id: `npc:${o.id}`,
          kind: "npc",
          text: nameLabel,
          getAnchor: () => {
            const sh = npcDisplayHeight(npcSlug);
            return { x: sprite.x, y: sprite.y - sh - 6 };
          },
          baseAlpha: 1,
          isActive: () => npcEntry.present !== false,
        });
      }

      if (o.type === "enemy_spawn") {
        const w = o.width ?? 64;
        const h = o.height ?? 64;
        this.enemyZones.push({
          id: o.id,
          x: o.x,
          y: o.y,
          w,
          h,
          enemyId: String(o.metadata?.enemyId ?? "rift-slime"),
          cx: o.x + w / 2,
          cy: o.y + h / 2,
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
        {
          const portalLabel = o.label ?? "Portal";
          const portalText = this.add
            .text(o.x, o.y + 28, portalLabel, {
              fontFamily: "Manrope, sans-serif",
              fontSize: "10px",
              color: locked ? "#8899aa" : "#c8f7ff",
            })
            .setOrigin(0.5)
            .setDepth(5);
          this.registerWorldNameplate({
            id: `portal:${o.id}`,
            kind: classifyWorldLabel({
              type: "portal",
              label: portalLabel,
              hubLabels: this.hubLabelSet,
            }),
            text: portalText,
            getAnchor: () => ({ x: o.x, y: o.y + 28 }),
            baseAlpha: locked ? 0.7 : 1,
          });
        }
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

      if (
        (o.type === "resource" || o.type === "fishing_spot") &&
        featureFlagDefaults.LIVE_WORLD_GATHERING_ENABLED
      ) {
        const resourceId = String(
          o.metadata?.resourceId ?? o.label ?? o.id,
        );
        const sprite = trySpawnResourceSprite(this, o.x, o.y, resourceId);
        if (!sprite) {
          const g = this.add.graphics();
          g.fillStyle(0x4adf7a, 0.7);
          g.fillCircle(o.x, o.y, 10);
          g.setDepth(5);
        }
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

      if (o.type === "gateway" || o.metadata?.gatewayStone === true) {
        const activated = true; // physical presence implies activation path
        if (this.textures.exists("ui-map-gateway")) {
          this.add
            .image(o.x, o.y, "ui-map-gateway")
            .setDisplaySize(40, 40)
            .setDepth(5)
            .setAlpha(0.95);
        } else {
          const g = this.add.graphics();
          g.fillStyle(0xc9a46a, 0.55);
          g.fillRoundedRect(o.x - 12, o.y - 22, 24, 36, 4);
          g.lineStyle(2, 0x3de7ff, 0.85);
          g.strokeRoundedRect(o.x - 12, o.y - 22, 24, 36, 4);
          g.setDepth(5);
        }
        {
          const gatewayLabel = o.label ?? "Gateway Stone";
          const gatewayText = this.add
            .text(o.x, o.y + 28, gatewayLabel, {
              fontFamily: "Manrope, sans-serif",
              fontSize: "10px",
              color: "#ffe0a8",
            })
            .setOrigin(0.5)
            .setDepth(5);
          this.registerWorldNameplate({
            id: `gateway:${o.id}`,
            kind: "gateway",
            text: gatewayText,
            getAnchor: () => ({ x: o.x, y: o.y + 28 }),
            baseAlpha: 1,
          });
        }
        this.interactables.push({
          kind: "gateway",
          id: o.id,
          label: o.label ?? "Gateway Stone",
          regionId: String(o.metadata?.regionId ?? this.regionSlug),
          activated,
          x: o.x,
          y: o.y,
        });
        void positionalAudio.upsert({
          id: `gateway:${o.id}`,
          kind: "portal",
          x: o.x,
          y: o.y,
          radius: 200,
          peak: 0.4,
        });
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
    const savedHere =
      saved?.mapId === this.regionSlug
        ? { x: saved.x, y: saved.y }
        : null;
    // Prefer portal arrival when traveling; otherwise clamp saved/default spawn.
    const result = resolveSafeSpawn(this.blueprint, {
      saved: this.entryPortalId ? null : savedHere,
      entryPortalId: this.entryPortalId,
      extraColliders: lockedPortalSeals(
        this.blueprint.objects.filter((o) => o.type === "portal"),
        isPortalLocked,
      ),
    });
    return { x: result.x, y: result.y };
  }

  protected containPetToBounds(): void {
    if (!this.pet) return;
    const c = clampEntityToNav(this.pet.x, this.pet.y, {
      homeX: this.player.x,
      homeY: this.player.y,
      leashRadius: PET_TELEPORT_DISTANCE,
      bounds: this.playableBounds,
      solids: this.runtimeSolids,
    });
    if (c.x !== this.pet.x || c.y !== this.pet.y) {
      this.pet.setPosition(c.x, c.y);
    }
  }

  /** Walk into unlocked transition → travel after a short dwell; locked seals message. */
  protected handleTransitionZones(time: number): void {
    if (time - this.lastTransitionAt < 1600) return;
    if (this.bridge.dialogue.get() || this.bridge.interactionMenu.get()) return;

    const hit = transitionAtPoint(
      this.player.x,
      this.player.y,
      this.transitionZones,
    );
    if (!hit) {
      this.transitionDwellId = null;
      this.transitionDwellSince = 0;
      return;
    }

    const portalObj = this.blueprint.objects.find(
      (o) => o.type === "portal" && o.id === hit.portalId,
    );
    if (!portalObj) return;

    if (isPortalLocked(portalObj)) {
      this.transitionDwellId = null;
      if (time - this.lastSealBumpAt < 2800) return;
      this.lastSealBumpAt = time;
      const unlock = getRegionUnlockView(
        String(portalObj.metadata?.toRegionId ?? ""),
      );
      const msg = lockedBlockerMessage(
        portalObj,
        unlock.requirements.filter((r) => !r.met).map((r) => r.label),
      );
      playTravelSfx("blocked");
      this.bridge.dialogue.set({
        speaker: msg.speaker,
        lines: msg.lines,
        lineIndex: 0,
      });
      return;
    }

    // Dwell so hub portal rings don't fire on a brush
    if (this.transitionDwellId !== hit.portalId) {
      this.transitionDwellId = hit.portalId;
      this.transitionDwellSince = time;
      return;
    }
    if (time - this.transitionDwellSince < 450) return;

    this.lastTransitionAt = time;
    this.transitionDwellId = null;
    this.travelTo(hit.toRegionId, "portal", hit.entryPortalId);
  }

  protected bindInput(): void {
    // Keyboard is owned by LiveWorldInputManager (window capture).
    // Keep Phaser keys as a soft fallback if the manager is not attached yet.
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
    // Server session lease (Phase 1 REST heartbeat; WS lease later).
    try {
      const { startPersistenceSession } = await import(
        "@/game/live-world/persistence/server-sync"
      );
      await startPersistenceSession({
        mapId: this.regionSlug,
        x: Math.round(this.player?.x ?? 1024),
        y: Math.round(this.player?.y ?? 768),
        savedAt: Date.now(),
      });
    } catch {
      /* persistence optional if API unavailable */
    }
    this.bridge.status.set({
      connection: result === "connected" ? "connected" : "local",
      mapName: this.blueprint.name,
      instanceLabel:
        result === "connected" ? "Instance online" : "Local solo (Phase 1)",
      playerLabel: "Keeper",
      petLabel: "Spark Companion",
      hint: "WASD · Shift sprint · E interact · T emotes · M map · Enter chat · scroll / +− zoom",
    });
  }

  protected readKeyboardDesire(): VirtualInputState {
    const v = this.bridge.virtualInput.get();
    const managed = getInputManager().getMovementDesire();
    // Prefer centralized manager; merge mobile virtual stick.
    const desire: VirtualInputState = {
      up: v.up || managed.up,
      down: v.down || managed.down,
      left: v.left || managed.left,
      right: v.right || managed.right,
      run: v.run || managed.run,
    };
    // Soft Phaser fallback when manager reports idle (e.g. canvas focus quirks)
    if (
      !desire.up &&
      !desire.down &&
      !desire.left &&
      !desire.right &&
      this.cursors &&
      this.wasd &&
      !getInputManager().isTypingFocused()
    ) {
      return {
        up: this.cursors.up.isDown || this.wasd.up.isDown,
        down: this.cursors.down.isDown || this.wasd.down.isDown,
        left: this.cursors.left.isDown || this.wasd.left.isDown,
        right: this.cursors.right.isDown || this.wasd.right.isDown,
        run: this.shiftKey?.isDown === true,
      };
    }
    return desire;
  }

  protected applyMovement(): void {
    if (this.bridge.mapUi.get().open) {
      this.player.setVelocity(0, 0);
      this.publishPose(false);
      return;
    }
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
      this.facingRad = Math.atan2(vy, vx);
      const speed = input.run ? RUN_SPEED : WALK_SPEED;
      this.player.setVelocity(vx * speed, vy * speed);
      this.bridge.emotes.runtime.setLayer(input.run ? "run" : "walk");
      this.publishPose(input.run);
    } else {
      this.player.setVelocity(0, 0);
      const emoteActive = !!this.bridge.emotes.runtime.getState().active;
      this.bridge.emotes.runtime.setLayer(emoteActive ? "emote" : "idle");
      this.publishPose(false);
    }
  }

  protected updatePetFollow(): void {
    const dx = this.player.x - this.pet.x;
    const dy = this.player.y - this.pet.y;
    const dist = Math.hypot(dx, dy);
    if (dist > PET_TELEPORT_DISTANCE) {
      this.pet.setPosition(this.player.x - 28, this.player.y + 10);
      this.pet.setVelocity(0, 0);
      this.petEquipmentLayers?.syncPositions();
      return;
    }
    if (dist > PET_FOLLOW_DISTANCE) {
      const speed = Math.min(RUN_SPEED * 0.95, 80 + dist * 1.4);
      this.pet.setVelocity((dx / dist) * speed, (dy / dist) * speed);
    } else {
      this.pet.setVelocity(0, 0);
    }
    this.petEquipmentLayers?.syncPositions();
  }

  protected companionInteractable(): Extract<Interactable, { kind: "pet" }> {
    return {
      kind: "pet",
      id: "companion",
      publicPetId: COMPANION_PET_ID,
      label: this.bridge.status.get().petLabel || "Companion",
      x: this.pet.x,
      y: this.pet.y,
      owned: true,
    };
  }

  protected openPetContextMenu(): void {
    const pet = this.companionInteractable();
    this.nearest = pet;
    this.petSelected = true;
    this.petEquipmentLayers?.setSelected(true);
    this.bridge.interactionMenu.set({
      targetKind: "pet",
      targetId: pet.publicPetId,
      title: pet.label,
      x: pet.x,
      y: pet.y,
      options: [
        { id: "equipment", label: "Equipment", action: "equipment" },
        { id: "inspect", label: "Inspect", action: "inspect" },
        { id: "dismiss", label: "Leave", action: "dismiss" },
      ],
    });
    getInputManager().setActivePanel("interaction");
    playSfx("ui.click");
  }

  protected broadcastAppearanceStub(snap: AppearanceSnapshot): void {
    const stub = toAppearanceNetStub(snap);
    this.mp.sendAppearance({
      ...stub,
      actorId: "local-player",
      at: Date.now(),
    });
  }

  protected updateNearest(): void {
    let best: Interactable | null = null;
    let bestDist = INTERACT_RANGE;
    const candidates: Interactable[] = [
      ...this.interactables,
      this.companionInteractable(),
    ];
    for (const it of candidates) {
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
    if (best?.kind === "gateway")
      label = `${best.label} — open map to fast travel (E / Space)`;
    if (best?.kind === "resource") label = `Gather ${best.label} (E / Space)`;
    if (best?.kind === "building") label = `Inspect ${best.label} (E / Space)`;
    if (best?.kind === "pet") label = `${best.label} — Equipment (E / Space)`;
    this.bridge.interactPrompt.set({ visible: !!best, label });
  }

  protected handleInteract(): void {
    const managed = getInputManager().wasJustPressed("interact");
    const keyPressed =
      managed ||
      (this.interactKeyE && Phaser.Input.Keyboard.JustDown(this.interactKeyE)) ||
      (this.interactKeySpace &&
        Phaser.Input.Keyboard.JustDown(this.interactKeySpace));
    const queued = this.bridge.consumeInteract();
    if (!keyPressed && !queued) return;
    if (!this.nearest) return;

    const n = this.nearest;
    if (n.kind === "pet") {
      this.openPetContextMenu();
      return;
    }
    // Contextual menu for NPCs / multi-option targets
    if (n.kind === "npc") {
      this.bridge.interactionMenu.set({
        targetKind: "npc",
        targetId: n.id,
        title: n.name,
        x: n.x,
        y: n.y,
        options: [
          { id: "talk", label: "Talk", action: "talk" },
          { id: "inspect", label: "Inspect", action: "inspect" },
          { id: "dismiss", label: "Leave", action: "dismiss" },
        ],
      });
      getInputManager().setActivePanel("interaction");
      return;
    }
    if (n.kind === "building") {
      const isAcademy =
        n.id.includes("academy") ||
        n.label.toLowerCase().includes("academy") ||
        n.id.includes("library");
      this.bridge.interactionMenu.set({
        targetKind: "object",
        targetId: n.id,
        title: n.label,
        x: n.x,
        y: n.y,
        options: [
          ...(isAcademy
            ? [
                {
                  id: "open_academy",
                  label: "Enter Academy",
                  action: "open_academy" as const,
                },
              ]
            : []),
          { id: "inspect", label: "Inspect", action: "inspect" },
          { id: "dismiss", label: "Leave", action: "dismiss" },
        ],
      });
      getInputManager().setActivePanel("interaction");
      return;
    }
    if (n.kind === "resource") {
      this.resolveResource(n);
      return;
    }
    if (n.kind === "portal") {
      this.bridge.interactionMenu.set({
        targetKind: "object",
        targetId: n.id,
        title: n.label,
        x: n.x,
        y: n.y,
        options: [
          {
            id: "travel",
            label: n.locked ? "Sealed" : "Enter portal",
            action: "travel",
          },
          { id: "dismiss", label: "Cancel", action: "dismiss" },
        ],
      });
      getInputManager().setActivePanel("interaction");
      return;
    }
    if (n.kind === "gateway") {
      this.bridge.interactionMenu.set({
        targetKind: "object",
        targetId: n.id,
        title: n.label,
        x: n.x,
        y: n.y,
        options: [
          {
            id: "open_travel",
            label: "Open travel map",
            action: "fast_travel",
          },
          { id: "dismiss", label: "Leave", action: "dismiss" },
        ],
      });
      getInputManager().setActivePanel("interaction");
    }
  }

  /** Called from React interaction menu. */
  resolveInteraction(optionId: string): void {
    const menu = this.bridge.interactionMenu.get();
    const n = this.nearest;
    this.bridge.interactionMenu.set(null);
    getInputManager().closePanel();
    if (!menu || !n) return;

    if (optionId === "dismiss") {
      this.petSelected = false;
      this.petEquipmentLayers?.setSelected(false);
      return;
    }

    if (n.kind === "pet" || menu.targetKind === "pet") {
      const publicPetId =
        n.kind === "pet" ? n.publicPetId : menu.targetId || COMPANION_PET_ID;
      const label = n.kind === "pet" ? n.label : menu.title;
      if (optionId === "equipment") {
        this.petSelected = true;
        this.petEquipmentLayers?.setSelected(true);
        this.bridge.openEquipmentPanel({
          publicPetId,
          petLabel: label,
          inspectOnly: false,
        });
        playSfx("ui.modal_open");
        return;
      }
      if (optionId === "inspect") {
        this.bridge.dialogue.set({
          speaker: label,
          lines: [
            "Your companion watches you, ready for a new look.",
            "Open Equipment to equip owned cosmetics and gear. Ranked battles keep cosmetics visible with normalized power.",
          ],
          lineIndex: 0,
        });
        return;
      }
    }

    if (n.kind === "npc" && (optionId === "talk" || optionId === "inspect")) {
      playSfx(optionId === "talk" ? "world.npc_greet" : "world.npc_talk");
      const cleared = acknowledgeAttention({
        npcSlug: n.npcSlug,
        name: n.name,
        x: n.x,
        y: n.y,
        homeX: n.homeX,
        homeY: n.homeY,
        behavior: n.behavior,
        spawnHomeX: n.spawnHomeX,
        spawnHomeY: n.spawnHomeY,
        attention: n.attention ?? null,
        present: n.present !== false,
      });
      n.attention = cleared.attention;
      this.syncNpcIndicator(n);
      if (optionId === "inspect") {
        this.bridge.dialogue.set({
          speaker: n.name,
          lines: [`A keeper of ${this.blueprint.name}.`, ...n.lines.slice(0, 1)],
          lineIndex: 0,
        });
        return;
      }
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

    if (n.kind === "building" && optionId === "open_academy") {
      playSfx("ui.nav");
      this.bridge.requestNavigate("/academy");
      return;
    }

    if (n.kind === "building" && optionId === "inspect") {
      playSfx("world.npc_talk");
      this.bridge.dialogue.set({
        speaker: n.label,
        lines: n.lines,
        lineIndex: 0,
      });
      return;
    }

    if (n.kind === "portal" && optionId === "travel") {
      if (n.locked) {
        const portalObj = this.blueprint.objects.find(
          (o) => o.type === "portal" && o.id === n.id,
        );
        const unlock = getRegionUnlockView(n.toRegionId);
        const msg = portalObj
          ? lockedBlockerMessage(
              portalObj,
              unlock.requirements.filter((r) => !r.met).map((r) => r.label),
            )
          : {
              speaker: "Rift Seal",
              lines: [
                `A living seal bars the way to ${n.label}.`,
                "It will lift when the story — and your Keeper — are ready.",
              ],
            };
        playTravelSfx("blocked");
        this.bridge.dialogue.set({
          speaker: msg.speaker,
          lines: msg.lines,
          lineIndex: 0,
        });
        return;
      }
      this.travelTo(n.toRegionId, "portal", n.id);
      return;
    }
    if (n.kind === "gateway" && optionId === "open_travel") {
      this.bridge.openWorldMap("world", this.regionSlug);
      this.bridge.mapUi.set({
        ...this.bridge.mapUi.get(),
        selectedGatewayId: n.id,
        filter: "gateways",
      });
    }
  }

  protected resolveResource(n: Extract<Interactable, { kind: "resource" }>): void {
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
  }

  protected travelTo(
    toRegionId: string,
    mode: "portal" | "fast_travel" = "portal",
    entryPortalId?: string,
  ): void {
    const target = REGION_BY_SLUG[toRegionId];
    if (!target) return;
    if (!featureFlagDefaults.PLAYABLE_LIVE_WORLD_ENABLED) return;

    const inCombat = Date.now() - this.lastCombatAt < 3500;
    if (inCombat) {
      playTravelSfx("blocked");
      this.bridge.dialogue.set({
        speaker: "Travel",
        lines: ["Cannot travel during combat."],
        lineIndex: 0,
      });
      return;
    }

    if (mode === "fast_travel") {
      const attempt = attemptFastTravel(this.regionSlug, toRegionId, {
        inCombat: false,
      });
      if (!attempt.ok) {
        playTravelSfx("blocked");
        this.bridge.dialogue.set({
          speaker: "Gateway Network",
          lines: [attempt.message],
          lineIndex: 0,
        });
        return;
      }
    } else {
      const guard = canTravelNow({
        inCombat: false,
        bridge: this.bridge,
      });
      if (
        !guard.ok &&
        guard.reason !== "dialogue" &&
        guard.reason !== "interaction_menu" &&
        guard.reason !== "map_panel"
      ) {
        playTravelSfx("blocked");
        this.bridge.dialogue.set({
          speaker: "Travel",
          lines: [guard.message ?? "Cannot travel right now."],
          lineIndex: 0,
        });
        return;
      }
    }

    if (target.playability === "blueprint_only") {
      playTravelSfx("blocked");
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

    playTravelSfx(mode === "fast_travel" ? "fast_travel" : "portal");
    this.bridge.closeWorldMap();
    this.bridge.dialogue.set(null);
    this.bridge.interactionMenu.set(null);
    this.persistPosition();
    let state = loadLivePlayState();
    bumpObjective(state, "starter-q8-world-beyond", "portal");
    bumpObjective(state, "starter-q8-world-beyond", "travel");
    if (!state.regionsVisited.includes(toRegionId)) {
      state.regionsVisited.push(toRegionId);
    }
    saveLivePlayState(state);
    void runTravelTransition(this.regionSlug, toRegionId);

    // Arrival spawn will be clamped / portal-aligned in the destination scene.
    const arrival = resolveSafeSpawn(
      // Destination blueprint loaded lazily via spawn coords for persistence
      {
        ...this.blueprint,
        spawn: target.spawn,
        colliders: [],
        camera: { x: 0, y: 0, width: 1, height: 1 },
      } as MapBlueprint,
      { saved: null },
    );
    // Prefer target region spawn; destination scene re-clamps with its own colliders.
    void arrival;
    savePosition({
      mapId: toRegionId,
      x: target.spawn.x,
      y: target.spawn.y,
    });
    this.scene.start(target.sceneKey, {
      bridge: this.bridge,
      regionSlug: toRegionId,
      entryPortalId,
    } satisfies RegionSceneInit);
  }

  protected handleEnemyZones(time: number): void {
    if (!featureFlagDefaults.LIVE_WORLD_PVE_ENABLED) return;
    if (time - this.lastCombatAt < 4000) return;
    for (const z of this.enemyZones) {
      // Soft leash stub — keep encounter center inside zone + playable bounds
      const leashed = clampEnemyLeash(z.cx, z.cy, z);
      const contained = clampEntityToNav(leashed.x, leashed.y, {
        homeX: z.cx,
        homeY: z.cy,
        leashRadius: Math.max(z.w, z.h) * 0.55,
        bounds: this.playableBounds,
        solids: this.runtimeSolids,
      });
      void contained;

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
      getInputManager().wasJustPressed("interact") ||
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
    const pos = {
      mapId: this.regionSlug,
      x: Math.round(this.player.x),
      y: Math.round(this.player.y),
    };
    savePosition(pos);
    // Layered server heartbeat + Category B autosave (never sole Category A path).
    void import("@/game/live-world/persistence/server-sync").then(
      ({ syncHeartbeat, syncAutosave }) => {
        void syncHeartbeat(pos);
        void syncAutosave(pos);
      },
    );
  }
}
