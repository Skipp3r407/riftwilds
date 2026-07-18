import type {
  DialoguePayload,
  EquipmentPanelPayload,
  InteractPrompt,
  InteractionMenuPayload,
  PlayerPose,
  VirtualInputState,
  WorldHudStatus,
  WorldMapUiState,
} from "@/game/live-world/types";
import type { AppearanceSnapshot } from "@/lib/equipment/types";
import {
  advanceDialogueLine,
  dialogueHasMoreLines,
} from "@/game/npcs/dialogue";
import { createChatStore, type ChatStore } from "@/game/live-world/systems/chat";
import { getInputManager } from "@/game/live-world/input/input-manager";
import {
  createEmoteSystem,
  type EmoteSystem,
} from "@/game/live-world/systems/emotes/emote-system";
import type { ConsentRequest, EmoteUiState } from "@/game/live-world/systems/emotes/types";

type Listener<T> = (value: T) => void;

function createChannel<T>(initial: T) {
  let value = initial;
  const listeners = new Set<Listener<T>>();
  return {
    get: () => value,
    set: (next: T) => {
      value = next;
      listeners.forEach((fn) => fn(value));
    },
    subscribe: (fn: Listener<T>) => {
      listeners.add(fn);
      fn(value);
      return () => {
        listeners.delete(fn);
      };
    },
  };
}

const emptyInput: VirtualInputState = {
  up: false,
  down: false,
  left: false,
  right: false,
  run: false,
};

/**
 * React ↔ Phaser bridge for overlays / mobile controls / maps / chat.
 * One active instance while the game is mounted.
 */
export class LiveWorldBridge {
  readonly virtualInput = createChannel<VirtualInputState>({ ...emptyInput });
  readonly status = createChannel<WorldHudStatus>({
    connection: "loading",
    mapName: "Riftwild Commons",
    instanceLabel: "Local solo",
    playerLabel: "Keeper",
    petLabel: "Companion",
    hint: "Loading…",
  });
  readonly dialogue = createChannel<DialoguePayload | null>(null);
  readonly interactPrompt = createChannel<InteractPrompt>({
    label: "Press E / Space",
    visible: false,
  });
  readonly loadingProgress = createChannel(0);
  readonly ready = createChannel(false);
  readonly playerPose = createChannel<PlayerPose>({
    x: 0,
    y: 0,
    facingRad: 0,
    regionSlug: "riftwild-commons",
    running: false,
  });
  readonly mapUi = createChannel<WorldMapUiState>({
    open: false,
    mode: "world",
    regionSlug: null,
    filter: "all",
    search: "",
    activeWaypointId: null,
    selectedGatewayId: null,
    travelPreviewTo: null,
    selectedMarkerId: null,
    placingCustomPin: false,
  });
  /** Request scene travel from React map UI (consumed by active region scene). */
  readonly travelRequest = createChannel<{
    toRegionId: string;
    mode: "portal" | "fast_travel";
    requestId: number;
  } | null>(null);
  private travelRequestSeq = 0;
  readonly interactionMenu = createChannel<InteractionMenuPayload | null>(null);
  /** React navigates when Phaser requests an in-site route (e.g. Academy). */
  readonly navigateRequest = createChannel<string | null>(null);
  readonly collisionDebug = createChannel(false);
  readonly chat: ChatStore = createChatStore();
  readonly chatRevision = createChannel(0);
  readonly emotes: EmoteSystem = createEmoteSystem();
  readonly emoteUi = createChannel<EmoteUiState>({
    mode: "closed",
    highlightIndex: 0,
    holdStartedAt: null,
  });
  readonly consentPrompt = createChannel<ConsentRequest | null>(null);
  readonly emoteRevision = createChannel(0);
  /** Live World Phaser camera zoom (synced from iso-camera). */
  readonly cameraZoom = createChannel(1.52);
  /** Camera follow target — player (default) or riftling companion. */
  readonly cameraFocus = createChannel<"player" | "riftling" | "free">("player");
  /** Photo mode presentation flag (HUD + camera free-look stub). */
  readonly photoMode = createChannel(false);
  /** Cinematic HUD/camera stub flag. */
  readonly cinematicMode = createChannel(false);
  /** Open Riftling equipment overlay from Phaser context menu. */
  readonly equipmentPanel = createChannel<EquipmentPanelPayload | null>(null);
  /** Active companion appearance — Phaser layers subscribe. */
  readonly petAppearance = createChannel<AppearanceSnapshot | null>(null);
  readonly appearanceRevision = createChannel(0);
  /**
   * Hatchery / care companion species slug for Live World follower art.
   * Prefer this over demo `live-companion` appearance.speciesSlug (often a stub).
   */
  readonly companionSpeciesSlug = createChannel<string | null>(null);

  private interactQueued = false;
  private zoomDeltaQueued = 0;
  private focusQueued: "player" | "riftling" | "free" | null = null;
  private interactionResolver: ((optionId: string) => void) | null = null;

  setInteractionResolver(fn: ((optionId: string) => void) | null): void {
    this.interactionResolver = fn;
  }

  resolveInteraction(optionId: string): void {
    this.interactionResolver?.(optionId);
  }

  setVirtualInput(partial: Partial<VirtualInputState>): void {
    this.virtualInput.set({ ...this.virtualInput.get(), ...partial });
  }

  resetVirtualInput(): void {
    this.virtualInput.set({ ...emptyInput });
  }

  queueInteract(): void {
    this.interactQueued = true;
  }

  consumeInteract(): boolean {
    if (!this.interactQueued) return false;
    this.interactQueued = false;
    return true;
  }

  /** UI zoom buttons → Phaser iso-camera (consumed each frame). */
  queueZoomDelta(delta: number): void {
    this.zoomDeltaQueued += delta;
  }

  consumeZoomDelta(): number {
    const delta = this.zoomDeltaQueued;
    this.zoomDeltaQueued = 0;
    return delta;
  }

  /** Queue camera focus change for the active region scene. */
  queueCameraFocus(target: "player" | "riftling" | "free"): void {
    this.focusQueued = target;
    this.cameraFocus.set(target);
  }

  consumeCameraFocus(): "player" | "riftling" | "free" | null {
    const next = this.focusQueued;
    this.focusQueued = null;
    return next;
  }

  setPhotoMode(active: boolean): void {
    this.photoMode.set(active);
  }

  setCinematicMode(active: boolean): void {
    this.cinematicMode.set(active);
  }

  setNpcDialogue(payload: DialoguePayload | null): void {
    this.dialogue.set(payload);
  }

  bumpChat(): void {
    this.chatRevision.set(this.chatRevision.get() + 1);
  }

  bumpEmote(): void {
    this.emoteRevision.set(this.emoteRevision.get() + 1);
  }

  openEquipmentPanel(payload: Omit<EquipmentPanelPayload, "open">): void {
    this.equipmentPanel.set({ ...payload, open: true });
    getInputManager().setActivePanel("equipment");
  }

  closeEquipmentPanel(): void {
    const cur = this.equipmentPanel.get();
    if (cur) this.equipmentPanel.set({ ...cur, open: false });
    else this.equipmentPanel.set(null);
    if (getInputManager().getActivePanel() === "equipment") {
      getInputManager().closePanel();
    }
  }

  setPetAppearance(snap: AppearanceSnapshot | null): void {
    this.petAppearance.set(snap);
    this.appearanceRevision.set(snap?.revision ?? this.appearanceRevision.get() + 1);
  }

  /** Push hatched companion species so Phaser can swap follower textures. */
  setCompanionSpeciesSlug(slug: string | null | undefined): void {
    const next = slug?.trim() || null;
    this.companionSpeciesSlug.set(next);
  }

  playEmote(key: string, source: "wheel" | "chat" | "ping" | "admin" = "wheel") {
    const result = this.emotes.playSolo(key, source);
    this.bumpEmote();
    return result;
  }

  openEmoteWheel(): void {
    const ui = { mode: "wheel" as const, highlightIndex: 0, holdStartedAt: Date.now() };
    this.emotes.setUi(ui);
    this.emoteUi.set(ui);
    getInputManager().setActivePanel("emoteWheel");
  }

  closeEmoteUi(): void {
    const ui = { mode: "closed" as const, highlightIndex: 0, holdStartedAt: null };
    this.emotes.setUi(ui);
    this.emoteUi.set(ui);
    const panel = getInputManager().getActivePanel();
    if (panel === "emoteWheel" || panel === "emotePanel") {
      getInputManager().closePanel();
    }
  }

  openEmotePanel(): void {
    const ui = { mode: "panel" as const, highlightIndex: 0, holdStartedAt: null };
    this.emotes.setUi(ui);
    this.emoteUi.set(ui);
    getInputManager().setActivePanel("emotePanel");
  }

  openWorldMap(mode: WorldMapUiState["mode"] = "world", regionSlug?: string): void {
    const wasOpen = this.mapUi.get().open;
    this.mapUi.set({
      ...this.mapUi.get(),
      open: true,
      mode,
      regionSlug: regionSlug ?? this.playerPose.get().regionSlug,
    });
    getInputManager().setActivePanel("map");
    if (!wasOpen) {
      void import("@/lib/audio/sfx").then(({ playSfx }) => playSfx("ui.map_open"));
    }
  }

  closeWorldMap(): void {
    const wasOpen = this.mapUi.get().open;
    this.mapUi.set({
      ...this.mapUi.get(),
      open: false,
      selectedGatewayId: null,
      travelPreviewTo: null,
    });
    if (getInputManager().getActivePanel() === "map") {
      getInputManager().closePanel();
    }
    if (wasOpen) {
      void import("@/lib/audio/sfx").then(({ playSfx }) => playSfx("ui.map_close"));
    }
  }

  /** Queue a fast-travel / portal travel request for the active Phaser scene. */
  requestTravel(
    toRegionId: string,
    mode: "portal" | "fast_travel" = "fast_travel",
  ): void {
    this.travelRequestSeq += 1;
    this.travelRequest.set({
      toRegionId,
      mode,
      requestId: this.travelRequestSeq,
    });
  }

  /** Ask React to navigate (Academy, external game routes). */
  requestNavigate(path: string): void {
    this.navigateRequest.set(path);
  }

  consumeNavigateRequest(): string | null {
    const path = this.navigateRequest.get();
    if (!path) return null;
    this.navigateRequest.set(null);
    return path;
  }

  consumeTravelRequest(): {
    toRegionId: string;
    mode: "portal" | "fast_travel";
    requestId: number;
  } | null {
    const req = this.travelRequest.get();
    if (!req) return null;
    this.travelRequest.set(null);
    return req;
  }

  advanceDialogue(): void {
    const current = this.dialogue.get();
    if (!current) return;

    if (current.npcSlug && current.choices && current.choices.length > 0) {
      if (dialogueHasMoreLines(current)) {
        const advanced = advanceDialogueLine({
          npcSlug: current.npcSlug,
          speaker: current.speaker,
          portraitAsset: current.portraitAsset ?? "",
          nodeId: "active",
          lines: current.lines,
          lineIndex: current.lineIndex,
          choices: current.choices.map((c) => ({ id: c.id, label: c.label })),
        });
        this.dialogue.set({
          ...current,
          lineIndex: advanced.lineIndex,
        });
      }
      return;
    }

    const next = current.lineIndex + 1;
    if (next >= current.lines.length) {
      this.dialogue.set(null);
      return;
    }
    this.dialogue.set({ ...current, lineIndex: next });
  }
}

let activeBridge: LiveWorldBridge | null = null;

export function getLiveWorldBridge(): LiveWorldBridge | null {
  return activeBridge;
}

export function createLiveWorldBridge(): LiveWorldBridge {
  activeBridge = new LiveWorldBridge();
  return activeBridge;
}

export function destroyLiveWorldBridge(bridge: LiveWorldBridge): void {
  if (activeBridge === bridge) activeBridge = null;
}
